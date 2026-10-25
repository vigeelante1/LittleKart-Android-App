// Applies db/migrations/*.sql in order, once each, inside a transaction. Run: npm run db:migrate
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { connect, type Sql } from './client.js';

const dir = fileURLToPath(new URL('./migrations/', import.meta.url));

export async function migrate(sql: Sql): Promise<string[]> {
  await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const done = new Set((await sql<{ name: string }[]>`select name from schema_migrations`).map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const applied: string[] = [];
  for (const file of files) {
    if (done.has(file)) continue;
    const text = await readFile(new URL(file, `file://${dir}`), 'utf8');
    await sql.begin(async (tx) => {
      await tx.unsafe(text);
      await tx`insert into schema_migrations (name) values (${file})`;
    });
    applied.push(file);
  }
  return applied;
}

// Command-line use.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set (see api/.env.example).');
    process.exit(1);
  }
  const sql = connect(url);
  const applied = await migrate(sql);
  console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Database is up to date.');
  await sql.end();
}
