import { test, expect } from '@playwright/test';
import { BookingClient } from './booking.client';
import { badCredentialsSchema } from './booking.schema';

test.describe('Restful Booker negative cases', { tag: ['@api', '@negative'] }, () => {
  test('auth with wrong password does not issue a token', async ({ request }) => {
    const res = await new BookingClient(request).auth('admin', 'wrong-password');
    expect(res.status()).toBe(200);
    const body = badCredentialsSchema.parse(await res.json());
    expect(body.reason).toMatch(/bad credentials/i);
  });

  test('GET of a non-existing booking returns 404', async ({ request }) => {
    const res = await new BookingClient(request).get(999_999);
    expect(res.status()).toBe(404);
  });

  test('POST with an empty body is not accepted as a booking', async ({ request }) => {
    const res = await request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    // Observed contract: this public API returns 500 instead of 4xx. See README BUG-1.
    expect(res.status(), await res.text()).toBe(500);
  });
});
