import { env } from '../config/env';

export const STANDARD_USER = { username: env.uiUsername, password: env.uiPassword };

export const WRONG_PASSWORD = 'wrong_password';
