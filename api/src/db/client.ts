// PostgreSQL connection (postgres.js). Neon needs TLS: keep "?sslmode=require" in DATABASE_URL.
import postgres from 'postgres';

export type Sql = postgres.Sql;

export function connect(url: string): Sql {
  return postgres(url, {
    // Neon's free compute allows few connections; a small pool is plenty for this app.
    max: 5,
    idle_timeout: 20,
    // Neon's pooled endpoint (PgBouncer) does not support prepared statements.
    prepare: !/-pooler\./.test(url),
    onnotice: () => undefined,
    transform: { undefined: null },
  });
}
