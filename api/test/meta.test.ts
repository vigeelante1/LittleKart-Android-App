import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('meta routes', () => {
  it('reports health', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });

  it('serves fees and the 30-unit limit in /config', async () => {
    const app = await buildApp();
    const body = (await app.inject({ method: 'GET', url: '/config' })).json() as Record<string, unknown>;
    const pricing = body.pricing as Record<string, unknown>;
    expect(pricing.deliveryFeeAmount).toBe(30);
    expect(pricing.handlingFeeAmount).toBe(10);
    expect(pricing.freeDeliveryThreshold).toBe(99);
    expect(body.maxCustomTip).toBe(1000);
    expect(body.maxUnitsPerProduct).toBe(30);
  });

  it('picks the nearest store for Nalgonda bus stand (VTC, 2.1 km) and says Hyderabad is out of range', async () => {
    const app = await buildApp();
    const near = (await app.inject({ method: 'GET', url: '/stores/nearest?lat=17.0557&lng=79.2745' })).json() as {
      store: { id: string };
    } | null;
    expect(near?.store.id).toBe('lks-vtc');
    const far = (await app.inject({ method: 'GET', url: '/stores/nearest?lat=17.385&lng=78.4867' })).json() as {
      inRadius: boolean;
      distanceKm: number;
    };
    expect(far.inRadius).toBe(false);
    expect(far.distanceKm).toBeGreaterThan(80);
  });
});
