import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export const env = {
  uiBaseUrl: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com',
  uiUsername: process.env.UI_USERNAME ?? 'standard_user',
  uiPassword: process.env.UI_PASSWORD ?? 'secret_sauce',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
  apiUsername: process.env.API_USERNAME ?? 'admin',
  apiPassword: process.env.API_PASSWORD ?? 'password123',
};

export const STORAGE_STATE = '.auth/standard-user.json';
