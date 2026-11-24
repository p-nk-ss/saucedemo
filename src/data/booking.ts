import { randomUUID } from 'node:crypto';
import type { Booking } from '../api/types';

/**
 * A valid booking payload. The first name is unique per call, so bookings made by
 * parallel workers or by other users of the shared service cannot be confused.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: `QA-${randomUUID().slice(0, 8)}`,
    lastname: 'Automation',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-03-01', checkout: '2027-03-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
