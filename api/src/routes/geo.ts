// Address lookups through free OpenStreetMap services (no key, no card; DECISIONS D-13, D-44).
//   GET /geo/reverse?lat=&lng=   → { text }                     Nominatim (max 1 request per second, cached)
//   GET /geo/autocomplete?q=     → [{ text, lat, lng }]         Photon (built for search-as-you-type)
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

type Fetch = typeof fetch;

export interface GeoOptions {
  fetch?: Fetch;
  /** Identifies us to the OpenStreetMap services, as their usage policy requires. */
  userAgent?: string;
}

/** Search results are biased towards Nalgonda (the stores' town). */
const BIAS = { lat: 17.0543, lng: 79.2671 };

const point = z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) });

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, string | undefined>;
}

/** "Name, Street, Locality, City, State" from Photon's properties, without repeats. */
export function photonLabel(p: Record<string, string | undefined>): string {
  const parts = [p.name, p.street, p.district, p.locality, p.city ?? p.county, p.state].filter(
    (v): v is string => !!v && v.trim() !== '',
  );
  return [...new Set(parts)].join(', ');
}

export async function geoRoutes(app: FastifyInstance, options: GeoOptions) {
  const doFetch: Fetch = options.fetch ?? fetch;
  const headers = { 'User-Agent': options.userAgent ?? 'LittleKart-review/0.1 (assignment build)', Accept: 'application/json' };
  const reverseCache = new Map<string, string>();
  let lastNominatim = 0;

  app.get('/geo/reverse', async (request, reply) => {
    const parsed = point.safeParse(request.query);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_point' });
    const { lat, lng } = parsed.data;
    // ~11 m grid, so nearby pins reuse the answer.
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = reverseCache.get(key);
    if (cached !== undefined) return { text: cached };
    const wait = 1000 - (Date.now() - lastNominatim);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastNominatim = Date.now();
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=0`;
      const res = await doFetch(url, { headers });
      if (!res.ok) return reply.code(502).send({ error: 'geocoder_unavailable' });
      const body = (await res.json()) as { display_name?: string };
      const text = (body.display_name ?? '').slice(0, 240);
      reverseCache.set(key, text);
      return { text };
    } catch {
      return reply.code(502).send({ error: 'geocoder_unavailable' });
    }
  });

  app.get<{ Querystring: { q?: string } }>('/geo/autocomplete', async (request, reply) => {
    const q = (request.query.q ?? '').trim().slice(0, 100);
    if (q.length < 3) return [];
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${BIAS.lat}&lon=${BIAS.lng}&limit=8&lang=en`;
      const res = await doFetch(url, { headers });
      if (!res.ok) return reply.code(502).send({ error: 'geocoder_unavailable' });
      const body = (await res.json()) as { features?: PhotonFeature[] };
      return (body.features ?? []).flatMap((f) => {
        const c = f.geometry?.coordinates;
        if (!c || !f.properties) return [];
        const text = photonLabel(f.properties);
        return text ? [{ text, lat: c[1], lng: c[0] }] : [];
      });
    } catch {
      return reply.code(502).send({ error: 'geocoder_unavailable' });
    }
  });
}
