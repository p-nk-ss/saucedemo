import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from './types';

const REQUEST_TIMEOUT = 30_000;

/**
 * Thin client for the restful-booker API. Methods return the raw response so that
 * tests can assert status codes, including the unsuccessful ones.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  createToken(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', {
      data: { username, password },
      timeout: REQUEST_TIMEOUT,
    });
  }

  create(booking: Partial<Booking>): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking, timeout: REQUEST_TIMEOUT });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`, { timeout: REQUEST_TIMEOUT });
  }

  update(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: authHeaders(token),
      timeout: REQUEST_TIMEOUT,
    });
  }

  delete(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: authHeaders(token),
      timeout: REQUEST_TIMEOUT,
    });
  }
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { Cookie: `token=${token}` } : {};
}
