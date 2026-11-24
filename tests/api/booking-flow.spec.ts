import { env } from '../../src/config/env';
import { buildBooking } from '../../src/data/booking';
import { expect, test } from '../../src/fixtures/api';

test('TC-API-01 booking lifecycle', async ({ bookingClient, cleanupBookingIds }) => {
  const original = buildBooking();
  const updated = buildBooking({
    totalprice: original.totalprice + 100,
    additionalneeds: 'Late checkout',
  });

  const token = await test.step('authorize', async () => {
    const response = await bookingClient.createToken(env.apiUsername, env.apiPassword);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token).not.toBe('');
    return body.token as string;
  });

  const id = await test.step('create a booking', async () => {
    const response = await bookingClient.create(original);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    cleanupBookingIds.push(body.bookingid);
    expect(body.booking).toEqual(original);
    return body.bookingid as number;
  });

  await test.step('read it back', async () => {
    const response = await bookingClient.get(id);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(original);
  });

  await test.step('update it', async () => {
    const response = await bookingClient.update(id, updated, token);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(updated);
  });

  await test.step('read the updated booking', async () => {
    const response = await bookingClient.get(id);
    expect(await response.json()).toEqual(updated);
  });

  await test.step('delete it', async () => {
    const response = await bookingClient.delete(id, token);
    // The service answers 201 here (BUG-API-02), so only success is asserted.
    expect(response.ok()).toBe(true);
  });

  await test.step('verify it is gone', async () => {
    const response = await bookingClient.get(id);
    expect(response.status()).toBe(404);
  });
});
