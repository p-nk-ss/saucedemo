---
name: test-case-writer
description: Write structured UI and API test cases as Markdown in docs/test-cases/ from requirements, a checklist or exploration notes. Use before any test is automated, or when asked to "write test cases", "what should we test", or to turn a feature description into cases.
---

# Test case writer

Turns requirements, a checklist or exploration notes into written test cases in
`docs/test-cases/`. The cases are the definition of "correct" that automated tests are later
built from, so they are written and reviewed before any test code.

Adapted from a skill I use on a production project; the test-management integration is
removed and the output is plain Markdown.

## Workflow

1. **Read the source** (brief, checklist, exploration notes) completely before writing.
2. **Propose the list first.** Show the case titles grouped by area, with behaviour and
   priority, and the negative cases you suggest. Wait for confirmation before writing steps.
3. **Write the cases** in the format below.
4. **Run the quality checks** at the end of this file and list any gaps.

## One case = one behaviour

- A case is either fully positive or fully negative, never both. "Valid input saves, invalid
  input shows an error" is two cases.
- Split when checks can pass or fail independently, need different preconditions or data, or
  belong to different functional areas.
- Keep together what one user session verifies about one rule.
- Always propose negative cases, even when the source has none: required fields, boundary
  values (zero, empty, maximum), forbidden combinations, missing authorization.

## A case is a user flow, not an inspection

Every case walks the path a real user or client takes:

1. **Prepare** the data the case needs, as explicit steps or preconditions.
2. **Act**, one action per step.
3. **Verify where it matters**: not only the immediate message, but the places the change
   propagates to (the list, the badge, the total, a fresh read of the record).

Static checks (titles, columns, default values) are folded into a flow as steps. Do not write
a separate "open the page and look" case.

## Format

```markdown
### TC-UI-05 Add to cart and remove from cart

- Behaviour: positive
- Priority: high
- Preconditions: the cart is empty.

| #   | Action                                    | Expected result                              |
| --- | ----------------------------------------- | -------------------------------------------- |
| 1   | Open the catalog                          |                                              |
| 2   | Click "Add to cart" on two named products | The cart badge shows 2.                      |
| 3   | Click the cart icon                       | The cart lists both products, in that order. |
```

- **Id:** `TC-UI-NN` or `TC-API-NN`, never reused. The automated test carries the id at the
  start of its title.
- **Title:** short and action-oriented.
- **Priority:** high for core flows, medium for validation and secondary flows, low for edge
  cases.
- **Preconditions:** only state that is not the default for the file.
- **Known bug:** if the product is known to behave differently, add `- Known bug: BUG-…` with
  one line on the actual behaviour. The expected result still describes the correct behaviour.

### Steps

- Set an expected result only where there is something observable to verify. Leave it empty on
  steps that only move the user forward.
- An expected result is a specific observable state: exact text, a count, a URL, a status code,
  a field value. Never "works correctly" or "is displayed properly".
- UI cases use UI verbs: open, click, enter, select. API cases name the request
  (`PUT /booking/{id}` with …) and assert status and body.
- Use concrete data: named products, exact amounts, exact messages.

## Quality checks

Before showing the cases:

- Every expected result can be checked by someone who has never seen the product.
- No case mixes positive and negative checks.
- Every case reads as a flow: prepare, act, verify.
- A negative case verifies both the rejection and that nothing was changed.
- Every item of the source is covered by exactly one case or listed under gaps.
- The number of cases respects any limit the brief sets.

Finish with:

```markdown
## Gaps

- [Scenario]: [why it is worth adding, and why it is not in the set]
```
