import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../api/booking.client';
import type { Booking } from '../api/types';
import { env } from '../config/env';
import { buildBooking } from '../data/booking';

export interface ApiFixtures {
  bookingClient: BookingClient;
  /** A valid admin token. */
  token: string;
  /** A booking created for the test and deleted after it. */
  booking: { id: number; data: Booking };
}

export const test = base.extend<ApiFixtures>({
  bookingClient: async ({ request }, use) => use(new BookingClient(request)),

  token: async ({ bookingClient }, use) => {
    const response = await bookingClient.createToken(env.apiUsername, env.apiPassword);
    const { token } = await response.json();
    expect(token, 'the service did not issue a token').toEqual(expect.any(String));
    await use(token);
  },

  booking: async ({ bookingClient, token }, use) => {
    const data = buildBooking();
    const response = await bookingClient.create(data);
    expect(response.status(), 'could not create a booking for the test').toBe(200);
    const { bookingid: id } = await response.json();

    await use({ id, data });

    // The test may have deleted the booking itself; the answer is not checked.
    await bookingClient.delete(id, token);
  },
});

export { expect };
