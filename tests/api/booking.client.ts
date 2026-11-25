import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { API_AUTH } from '../../config';
import { type Booking } from './booking.schema';

export { API_AUTH };
export type { Booking };

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

function cookieHeader(token?: string): Record<string, string> {
  return token ? { Cookie: `token=${token}` } : {};
}

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  auth(username = API_AUTH.username, password = API_AUTH.password): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  create(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: booking,
    });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  update(id: number, token: string, booking: Booking): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...cookieHeader(token),
      },
      data: booking,
    });
  }

  remove(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: cookieHeader(token) });
  }
}
