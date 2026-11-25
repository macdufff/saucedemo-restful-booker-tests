import { test, expect } from '@playwright/test';
import { BookingClient, sampleBooking } from './booking.client';

test.describe.configure({ mode: 'serial' });

test.describe('Restful Booker booking lifecycle', () => {
  let token: string;
  let bookingId: number;

  test('auth returns a token', async ({ request }) => {
    const res = await new BookingClient(request).auth();
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(5);
    token = body.token;
  });

  test('create booking returns id and payload', async ({ request }) => {
    const payload = sampleBooking();
    const res = await new BookingClient(request).create(payload);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking).toMatchObject(payload);
    bookingId = body.bookingid;
  });

  test('get booking by id returns created data', async ({ request }) => {
    const res = await new BookingClient(request).get(bookingId);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(sampleBooking());
  });

  test('update booking changes fields', async ({ request }) => {
    const updated = sampleBooking({
      firstname: 'Grace',
      lastname: 'Hopper',
      totalprice: 250,
      additionalneeds: 'Late checkout',
    });
    const res = await new BookingClient(request).update(bookingId, token, updated);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(updated);

    const getRes = await new BookingClient(request).get(bookingId);
    expect(await getRes.json()).toMatchObject({ firstname: 'Grace', lastname: 'Hopper' });
  });

  test('delete booking then GET returns 404', async ({ request }) => {
    const del = await new BookingClient(request).remove(bookingId, token);
    expect([201, 200]).toContain(del.status());

    const getRes = await new BookingClient(request).get(bookingId);
    expect(getRes.status()).toBe(404);
  });
});
