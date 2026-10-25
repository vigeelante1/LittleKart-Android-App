// Settings and stores used when there is no database. With a database they are seeded from the same values
// (db/seed.ts) and read from the app_settings and stores tables.
export { config as appConfig, stores } from '@littlekart/shared/seed';
