import { test, expect } from '@playwright/test';
import { BookingClient, sampleBooking } from './booking.client';
import { bookingSchema, createdBookingSchema, tokenSchema } from './booking.schema';

test('booking lifecycle: auth, create, read, update, delete', { tag: ['@api', '@smoke'] }, async ({
  request,
}) => {
  const client = new BookingClient(request);
  let bookingId: number | undefined;
  let token = '';
  let cleanupFailure: string | undefined;

  try {
    await test.step('authenticate', async () => {
      const res = await client.auth();
      expect(res.status(), await res.text()).toBe(200);
      token = tokenSchema.parse(await res.json()).token;
    });

    const payload = sampleBooking();

    await test.step('create booking', async () => {
      const res = await client.create(payload);
      expect(res.status(), await res.text()).toBe(200);
      const body = createdBookingSchema.parse(await res.json());
      expect(body.booking).toMatchObject(payload);
      bookingId = body.bookingid;
    });

    await test.step('get booking by id', async () => {
      const res = await client.get(bookingId as number);
      expect(res.status()).toBe(200);
      expect(bookingSchema.parse(await res.json())).toMatchObject(payload);
    });

    const updated = sampleBooking({
      firstname: 'Grace',
      lastname: 'Hopper',
      totalprice: 250,
      additionalneeds: 'Late checkout',
    });

    await test.step('update booking', async () => {
      const res = await client.update(bookingId as number, token, updated);
      expect(res.status(), await res.text()).toBe(200);
      expect(bookingSchema.parse(await res.json())).toMatchObject(updated);
    });

    await test.step('verify updated booking', async () => {
      const res = await client.get(bookingId as number);
      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject({
        firstname: 'Grace',
        lastname: 'Hopper',
        totalprice: 250,
      });
    });

    await test.step('delete booking', async () => {
      const res = await client.remove(bookingId as number, token);
      // Observed contract: successful DELETE is often 201 Created.
      expect([201, 200], `DELETE status ${res.status()}`).toContain(res.status());
    });

    await test.step('deleted booking is gone', async () => {
      const res = await client.get(bookingId as number);
      expect(res.status()).toBe(404);
      bookingId = undefined;
    });
  } finally {
    if (bookingId !== undefined && token) {
      const cleanup = await client.remove(bookingId, token);
      if (![200, 201, 404].includes(cleanup.status())) {
        cleanupFailure = `Failed to clean up booking ${bookingId}: HTTP ${cleanup.status()}`;
      }
    }
  }

  expect(cleanupFailure, cleanupFailure).toBeUndefined();
});
