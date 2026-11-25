import { type APIRequestContext } from '@playwright/test';

export type BookingDates = { checkin: string; checkout: string };

export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
};

export const API_AUTH = { username: 'admin', password: 'password123' };

export function sampleBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Ada',
    lastname: 'Lovelace',
    totalprice: 120,
    depositpaid: true,
    bookingdates: { checkin: '2026-03-01', checkout: '2026-03-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async auth(username = API_AUTH.username, password = API_AUTH.password) {
    return this.request.post('/auth', {
      data: { username, password },
    });
  }

  async create(booking: Booking) {
    return this.request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: booking,
    });
  }

  async get(id: number) {
    return this.request.get(`/booking/${id}`);
  }

  async update(id: number, token: string, booking: Booking) {
    return this.request.put(`/booking/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: `token=${token}`,
      },
      data: booking,
    });
  }

  async remove(id: number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers.Cookie = `token=${token}`;
    return this.request.delete(`/booking/${id}`, { headers });
  }
}
