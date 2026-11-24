import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../api/booking.client';
import type { Booking } from '../api/types';
import { env } from '../config/env';
import { buildBooking } from '../data/booking';

export interface ApiFixtures {
  bookingClient: BookingClient;
  /**
   * Ids of bookings to delete after the test, whether it passed or failed.
   * A test that creates a booking pushes its id here right away.
   */
  cleanupBookingIds: number[];
  /** A booking created for the test and deleted after it. */
  booking: { id: number; data: Booking };
}

export const test = base.extend<ApiFixtures>({
  bookingClient: async ({ request }, use) => use(new BookingClient(request)),

  cleanupBookingIds: async ({ bookingClient }, use) => {
    const ids: number[] = [];
    await use(ids);

    if (ids.length === 0) return;
    const response = await bookingClient.createToken(env.apiUsername, env.apiPassword);
    const { token } = await response.json();
    for (const id of ids) {
      // The test may have deleted the booking itself; the answer is not checked.
      await bookingClient.delete(id, token);
    }
  },

  booking: async ({ bookingClient, cleanupBookingIds }, use) => {
    const data = buildBooking();
    const response = await bookingClient.create(data);
    expect(response.status(), 'could not create a booking for the test').toBe(200);
    const { bookingid: id } = await response.json();
    cleanupBookingIds.push(id);

    await use({ id, data });
  },
});

export { expect };
