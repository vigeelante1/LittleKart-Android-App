// GET /health, GET /config, GET /stores/nearest
import { distanceKm } from '@littlekart/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { MetaStore } from '../data/types.js';

const point = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export async function metaRoutes(app: FastifyInstance, { meta }: { meta: MetaStore }) {
  app.get('/health', async () => ({ ok: true }));

  app.get('/config', async () => meta.config());

  app.get('/stores/nearest', async (request, reply) => {
    const parsed = point.safeParse(request.query);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_point' });
    const { lat, lng } = parsed.data;
    // The closest store that delivers here; otherwise the closest store with inRadius false,
    // so the app can say "Not deliverable — about 8.2 km away (delivers up to 6 km)".
    const nearest = (await meta.stores())
      .map((store) => {
        const km = distanceKm(lat, lng, store.lat, store.lng);
        return { store, distanceKm: km, inRadius: km <= store.deliveryRadiusKm };
      })
      .sort((a, b) => Number(b.inRadius) - Number(a.inRadius) || a.distanceKm - b.distanceKm)[0];
    return nearest ?? null;
  });
}
