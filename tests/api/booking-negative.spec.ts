import { env } from '../../src/config/env';
import { buildBooking } from '../../src/data/booking';
import { expect, test } from '../../src/fixtures/api';

test('TC-API-02 update without a token is rejected', async ({ bookingClient, booking }) => {
  const response = await bookingClient.update(booking.id, buildBooking({ firstname: 'Intruder' }));
  expect(response.status()).toBe(403);

  const current = await bookingClient.get(booking.id);
  expect(await current.json()).toEqual(booking.data);
});

test('TC-API-03 wrong password gives no token', async ({ bookingClient }) => {
  const response = await bookingClient.createToken(env.apiUsername, 'wrong_password');

  expect(await response.json()).not.toHaveProperty('token');
});

test(
  'TC-API-04 create without required fields is rejected',
  { annotation: { type: 'bug', description: 'BUG-API-01' } },
  async ({ bookingClient }) => {
    const { firstname } = buildBooking();

    const response = await bookingClient.create({ firstname });

    // The request must be answered by the application itself: a timeout or a
    // gateway error is a real failure, not the known bug.
    expect([400, 500]).toContain(response.status());
    const found = await bookingClient.findByFirstname(firstname);
    expect(await found.json()).toEqual([]);

    test.fail(true, 'BUG-API-01: missing required fields cause 500 instead of 400');
    expect(response.status()).toBe(400);
  },
);
