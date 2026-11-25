import { test, expect } from '@playwright/test';
import { BookingClient, sampleBooking } from './booking.client';

test.describe('Restful Booker negative cases', () => {
  test('auth with wrong password does not issue a token', async ({ request }) => {
    const client = new BookingClient(request);
    const res = await client.auth('admin', 'wrong-password');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason ?? JSON.stringify(body)).toMatch(/bad credentials/i);
  });

  test('GET missing booking returns 404', async ({ request }) => {
    const client = new BookingClient(request);
    const res = await client.get(9_999_999_999);
    expect(res.status()).toBe(404);
  });

  test('DELETE without token is forbidden', async ({ request }) => {
    const client = new BookingClient(request);
    const created = await client.create(sampleBooking({ firstname: 'Temp' }));
    expect(created.status()).toBe(200);
    const { bookingid } = await created.json();

    const del = await client.remove(bookingid);
    expect([403, 401]).toContain(del.status());

    const stillThere = await client.get(bookingid);
    expect(stillThere.status()).toBe(200);
  });

  test('create with empty body is not a valid booking', async ({ request }) => {
    const res = await request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    // API historically returns 500 instead of 400 — assert actual contract, document in README
    expect([400, 500]).toContain(res.status());
  });
});
