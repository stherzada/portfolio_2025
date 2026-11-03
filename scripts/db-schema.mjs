// Aplica db/schema.sql no Neon. O arquivo só cria o que ainda não existe,
// então pode rodar de novo sem medo.
//
//   bun run db:schema      (lê o .env que o `neon env pull` escreve)
//
// Usa a conexão direta (DATABASE_URL_UNPOOLED): mudança de schema não passa
// pelo pooler.

import { readFile } from 'node:fs/promises'
import pg from 'pg'

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL_UNPOOLED (ou DATABASE_URL). Rode `neon env pull`.')
  process.exit(1)
}

const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8')
const client = new pg.Client({ connectionString: url })
await client.connect()
try {
  await client.query(schema)
  const { rows } = await client.query(
    `select table_name from information_schema.tables where table_schema = 'public' order by 1`,
  )
  console.log(`schema aplicado: ${rows.map((r) => r.table_name).join(', ')}`)
} finally {
  await client.end()
}
