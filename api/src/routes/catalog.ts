// Catalog endpoints used by the app (app/src/services/http).
//   GET /home                              → { categories, sections, banners, deals }
//   GET /tiles/:id/subcategories           → SubCategory[]
//   GET /subcategories/:id/products?q=     → Product[]
//   GET /products?ids=a,b                  → Product[]
//   GET /recommendations?cart=a,b          → Product[]   ("Often bought together")
//   GET /search?q=                         → Product[]
import type { FastifyInstance } from 'fastify';
import type { CatalogStore } from '../data/types.js';

const list = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];
const text = (value: unknown) => (typeof value === 'string' ? value.slice(0, 100) : '');

export async function catalogRoutes(app: FastifyInstance, { catalog }: { catalog: CatalogStore }) {
  app.get('/home', async () => catalog.home());
  app.get<{ Params: { id: string } }>('/tiles/:id/subcategories', async (req) => catalog.subCategories(req.params.id));
  app.get<{ Params: { id: string }; Querystring: { q?: string } }>('/subcategories/:id/products', async (req) =>
    catalog.products(req.params.id, text(req.query.q) || undefined),
  );
  app.get<{ Querystring: { ids?: string } }>('/products', async (req) => catalog.byIds(list(req.query.ids).slice(0, 100)));
  app.get<{ Querystring: { cart?: string } }>('/recommendations', async (req) => catalog.recommendations(list(req.query.cart)));
  app.get<{ Querystring: { q?: string } }>('/search', async (req) => catalog.search(text(req.query.q)));
}
