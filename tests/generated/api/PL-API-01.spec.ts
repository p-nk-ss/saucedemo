import type { Booking } from '../../../src/api/types';
import { env } from '../../../src/config/env';
import { expect, test } from '../../../src/fixtures/api';

test('PL-API-01 partial update changes only the given fields', async ({
  bookingClient,
  booking,
}) => {
  const changes: Partial<Booking> = { totalprice: 999, additionalneeds: 'Dinner' };
  const expected: Booking = { ...booking.data, ...changes };

  const tokenResponse = await bookingClient.createToken(env.apiUsername, env.apiPassword);
  const { token } = await tokenResponse.json();

  await test.step('partially update the booking', async () => {
    const response = await bookingClient.partialUpdate(booking.id, changes, token);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expected);
  });

  await test.step('read the booking back', async () => {
    const response = await bookingClient.get(booking.id);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expected);
  });
});
