import { z } from 'zod';

export const bookingDatesSchema = z.object({
  checkin: z.string().min(1),
  checkout: z.string().min(1),
});

export const bookingSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: bookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const createdBookingSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: bookingSchema,
});

export const tokenSchema = z.object({
  token: z.string().min(6),
});

export const badCredentialsSchema = z.object({
  reason: z.string(),
});

export type Booking = z.infer<typeof bookingSchema>;
