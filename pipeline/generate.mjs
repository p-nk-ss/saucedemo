// Test case text in, runnable Playwright test out.
//
//   node pipeline/generate.mjs pipeline/cases/PL-UI-01.md [more cases...]
//
// For each case: a headless Claude Code agent writes the spec, the pipeline runs it, and on
// failure hands the output back to the agent, up to MAX_ATTEMPTS times in total.
// Every run is recorded in pipeline/results/<case id>.json.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_ATTEMPTS = 3;
const AGENT_TIMEOUT_MS = 10 * 60 * 1000;
const TEST_TIMEOUT_MS = 3 * 60 * 1000;
const FEEDBACK_LIMIT = 6000;

// What the agent may do: read the project and write files. No shell, no network.
const AGENT_ARGS = [
  '--print',
  '--output-format',
  'json',
  '--permission-mode',
  'acceptEdits',
  '--allowedTools',
  'Read',
  'Glob',
  'Grep',
  'Write',
  'Edit',
  '--setting-sources',
  'project',
  '--strict-mcp-config',
];

const RAW_LOCATOR = /\.locator\(|\bgetBy[A-Z]\w*\(|waitForTimeout/;
const ALLOWED_CHANGES = /^(tests\/generated\/|src\/(pages|api|fixtures|data)\/)/;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true,
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function changedFiles() {
  return run('git', ['status', '--porcelain', '--untracked-files=all'])
    .stdout.split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/"/g, ''));
}

function buildPrompt(template, { caseId, caseText, outFile, feedback }) {
  return template
    .replaceAll('{{CASE_ID}}', caseId)
    .replaceAll('{{OUT_FILE}}', outFile)
    .replace('{{CASE}}', caseText.trim())
    .replace(
      '{{FEEDBACK}}',
      feedback
        ? `## The previous attempt failed\n\nThe test at \`${outFile}\` was run and failed. Fix the cause; do not weaken the assertions.\n\n\`\`\`text\n${feedback}\n\`\`\``
        : '',
    );
}

function askAgent(prompt) {
  const started = Date.now();
  const result = run('claude', AGENT_ARGS, { input: prompt, timeout: AGENT_TIMEOUT_MS });
  let reply;
  try {
    reply = JSON.parse(result.stdout);
  } catch {
    reply = { result: (result.stdout || result.stderr).slice(-2000), is_error: true };
  }
  return {
    ok: result.code === 0 && !reply.is_error,
    seconds: Math.round((Date.now() - started) / 1000),
    turns: reply.num_turns ?? null,
    costUsd: reply.total_cost_usd ?? null,
    answer: String(reply.result ?? '').trim(),
  };
}

function runTest(outFile, project) {
  const result = run(
    'npx',
    ['playwright', 'test', outFile, `--project=${project}`, '--reporter=line'],
    { timeout: TEST_TIMEOUT_MS, env: { ...process.env, CI: '', FORCE_COLOR: '0' } },
  );
  const output = `${result.stdout}\n${result.stderr}`.trim();
  const ran = /\b\d+ passed\b/.test(output);
  const failed = /\b\d+ failed\b|No tests found|Error:/.test(output);
  return { passed: result.code === 0 && ran && !failed, output };
}

function checkRules(caseId, outFile, before) {
  const problems = [];
  const path = join(ROOT, outFile);
  if (!existsSync(path)) return ['the spec file was not created'];

  const source = readFileSync(path, 'utf8');
  if (!source.includes(`'${caseId} `) && !source.includes(`\`${caseId} `)) {
    problems.push('the test title does not start with the case id');
  }
  if (RAW_LOCATOR.test(source)) problems.push('raw locator or sleep in the spec file');
  if (/from '@playwright\/test'/.test(source)) problems.push('imports from @playwright/test');
  if ((source.match(/\btest\(/g) ?? []).length !== 1) problems.push('not exactly one test');

  const outside = changedFiles().filter((f) => !before.has(f) && !ALLOWED_CHANGES.test(f));
  if (outside.length)
    problems.push(`changed files outside the allowed area: ${outside.join(', ')}`);
  return problems;
}

function generate(casePath, template) {
  const caseId = basename(casePath, '.md');
  const kind = caseId.includes('-API-') ? 'api' : 'ui';
  const outFile = `tests/generated/${kind}/${caseId}.spec.ts`;
  const caseText = readFileSync(join(ROOT, casePath), 'utf8');
  const before = new Set(changedFiles());

  const record = { caseId, casePath, outFile, attempts: [], passed: false, ruleProblems: [] };
  let feedback = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[${caseId}] attempt ${attempt}: asking the agent`);
    const agent = askAgent(buildPrompt(template, { caseId, caseText, outFile, feedback }));

    let test = { passed: false, output: 'the agent call failed; the test was not run' };
    if (agent.ok && existsSync(join(ROOT, outFile))) {
      console.log(`[${caseId}] attempt ${attempt}: running the test`);
      test = runTest(outFile, `generated-${kind}`);
    }

    const source = existsSync(join(ROOT, outFile)) ? readFileSync(join(ROOT, outFile), 'utf8') : '';
    record.attempts.push({
      attempt,
      agent,
      passed: test.passed,
      source,
      output: test.output.slice(-FEEDBACK_LIMIT),
    });
    console.log(`[${caseId}] attempt ${attempt}: ${test.passed ? 'PASSED' : 'FAILED'}`);

    if (test.passed) {
      record.passed = true;
      break;
    }
    feedback = test.output.slice(-FEEDBACK_LIMIT);
  }

  record.ruleProblems = checkRules(caseId, outFile, before);
  record.changedFiles = changedFiles().filter((f) => !before.has(f));
  return record;
}

const cases = process.argv.slice(2);
if (cases.length === 0) {
  console.error('usage: node pipeline/generate.mjs <case.md> [more cases...]');
  process.exit(2);
}

const template = readFileSync(join(ROOT, 'pipeline/prompt.md'), 'utf8');
mkdirSync(join(ROOT, 'pipeline/results'), { recursive: true });

let failures = 0;
for (const casePath of cases) {
  const record = generate(casePath.replaceAll('\\', '/'), template);
  writeFileSync(
    join(ROOT, `pipeline/results/${record.caseId}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
  );
  const verdict = record.passed ? `passed on attempt ${record.attempts.length}` : 'FAILED';
  const rules = record.ruleProblems.length
    ? `; rule problems: ${record.ruleProblems.join('; ')}`
    : '';
  console.log(`[${record.caseId}] ${verdict}${rules}`);
  if (!record.passed || record.ruleProblems.length) failures++;
}
process.exit(failures ? 1 : 0);
