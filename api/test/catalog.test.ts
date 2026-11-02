import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { photonLabel } from '../src/routes/geo.js';

describe('catalog API', () => {
  it('serves Home with the live strip order and fixed typos', async () => {
    const app = await buildApp();
    const home = (await app.inject({ method: 'GET', url: '/home' })).json() as {
      categories: { name: string }[];
      sections: { title: string; tiles: { label: string }[] }[];
      deals: { id: string }[];
    };
    expect(home.categories.map((c) => c.name).slice(0, 4)).toEqual([
      'Pooja & Flowers',
      'Food & Meat',
      'Groceries & Kitchen',
      'Snacks & Drinks',
    ]);
    const labels = home.sections.flatMap((s) => s.tiles.map((t) => t.label));
    expect(labels).toContain('Restaurants');
    expect(labels).not.toContain('Resturants');
    expect(home.deals.length).toBeGreaterThan(0);
  });

  it('opens tiles without their own rail as a single sub-category with their products', async () => {
    const app = await buildApp();
    const subs = (await app.inject({ method: 'GET', url: '/tiles/dairy-bread-eggs/subcategories' })).json() as { id: string; name: string }[];
    expect(subs).toEqual([expect.objectContaining({ id: 'dairy-bread-eggs', name: 'Dairy, Bread & Eggs' })]);
    const items = (await app.inject({ method: 'GET', url: '/subcategories/dairy-bread-eggs/products' })).json() as { id: string }[];
    // The live three are still listed, among the iteration-2 assortment (photos first, brands grouped).
    expect(items.map((p) => p.id)).toEqual(expect.arrayContaining(['sneha-brown-eggs', 'amul-butter', 'heritage-curd']));
    expect(items.length).toBeGreaterThan(3);
    const unknown = (await app.inject({ method: 'GET', url: '/tiles/nope/subcategories' })).json();
    expect(unknown).toEqual([]);
  });

  it('lists 1kg first for chicken with two sizes, as the site does', async () => {
    const app = await buildApp();
    const chicken = (await app.inject({ method: 'GET', url: '/subcategories/chicken/products' })).json() as { variants: { label: string }[] }[];
    expect(chicken.filter((p) => p.variants.length > 1).every((p) => p.variants[0]?.label === '1kg')).toBe(true);
  });

  it('lists the Chicken rail and its products', async () => {
    const app = await buildApp();
    const subs = (await app.inject({ method: 'GET', url: '/tiles/fresh-meat-fish/subcategories' })).json() as { name: string }[];
    expect(subs.map((s) => s.name)).toEqual(['Chicken', 'Mutton', 'Fish']);
    const chicken = (await app.inject({ method: 'GET', url: '/subcategories/chicken/products?q=boneless' })).json() as { name: string }[];
    expect(chicken.map((p) => p.name)).toEqual(['Sneha Chicken Boneless Halal']);
  });

  it('finds products by id and leaves cart items out of recommendations', async () => {
    const app = await buildApp();
    const byIds = (await app.inject({ method: 'GET', url: '/products?ids=allam,fanta-orange' })).json() as { id: string }[];
    expect(byIds.map((p) => p.id)).toEqual(['allam', 'fanta-orange']);
    const recs = (await app.inject({ method: 'GET', url: '/recommendations?cart=banana' })).json() as { id: string }[];
    expect(recs.map((p) => p.id)).not.toContain('banana');
  });

  it('serves similar and popular products for the product page', async () => {
    const app = await buildApp();
    const res = (await app.inject({ method: 'GET', url: '/products/good-day-cashew/related' })).json() as {
      similar: { id: string; categoryId: string }[];
      popular: { id: string }[];
    };
    expect(res.similar.length).toBeGreaterThan(0);
    expect(res.similar.every((p) => p.categoryId === 'biscuits-cookies' && p.id !== 'good-day-cashew')).toBe(true);
    expect(res.popular.map((p) => p.id)).not.toContain('good-day-cashew');
    const missing = (await app.inject({ method: 'GET', url: '/products/nope/related' })).json();
    expect(missing).toEqual({ similar: [], popular: [], tileId: null });
  });

  it('offers a cheaper swap for a cart line and ignores bad pairs', async () => {
    const app = await buildApp();
    const offers = (await app.inject({ method: 'GET', url: '/swaps?lines=india-gate-basmati:india-gate-basmati-1,junk,allam:allam-1' })).json() as {
      fromProductId: string;
      product: { id: string };
      saving: number;
    }[];
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ fromProductId: 'india-gate-basmati', product: { id: 'daawat-basmati' }, saving: 64 });
  });

  it('searches names in any of their languages', async () => {
    const app = await buildApp();
    const res = (await app.inject({ method: 'GET', url: '/search?q=ginger' })).json() as { id: string }[];
    expect(res.map((p) => p.id)).toEqual(['allam']);
  });
});

describe('geo API', () => {
  const fakeFetch = (async (url: string | URL | Request) => {
    const u = String(url);
    if (u.includes('nominatim')) return new Response(JSON.stringify({ display_name: 'Bus stand, Nalgonda, Telangana' }));
    return new Response(
      JSON.stringify({
        features: [{ geometry: { coordinates: [79.2745, 17.0557] }, properties: { name: 'Nalgonda Bus Stand', city: 'Nalgonda', state: 'Telangana' } }],
      }),
    );
  }) as typeof fetch;

  it('turns a pin into address text', async () => {
    const app = await buildApp({ geo: { fetch: fakeFetch } });
    const res = await app.inject({ method: 'GET', url: '/geo/reverse?lat=17.0557&lng=79.2745' });
    expect(res.json()).toEqual({ text: 'Bus stand, Nalgonda, Telangana' });
  });

  it('suggests places for 3+ characters', async () => {
    const app = await buildApp({ geo: { fetch: fakeFetch } });
    expect((await app.inject({ method: 'GET', url: '/geo/autocomplete?q=na' })).json()).toEqual([]);
    const res = (await app.inject({ method: 'GET', url: '/geo/autocomplete?q=nalgonda' })).json();
    expect(res).toEqual([{ text: 'Nalgonda Bus Stand, Nalgonda, Telangana', lat: 17.0557, lng: 79.2745 }]);
  });

  it('builds labels without repeated parts', () => {
    expect(photonLabel({ name: 'Nalgonda', city: 'Nalgonda', state: 'Telangana' })).toBe('Nalgonda, Telangana');
  });
});
