// Coisas comuns às funções da pasta api/. Arquivos que começam com `_` não
// viram rota na Vercel.

import { attachDatabasePool } from '@vercel/functions'
import pg from 'pg'

// Na Vercel, o recomendado pelo Neon é node-postgres com a URL do pooler
// (DATABASE_URL, a que tem `-pooler`) e attachDatabasePool: com Fluid compute
// a instância reaproveita as conexões entre pedidos e só morre depois de
// fechar as que ficaram paradas. Fora da Vercel (dev, scripts) ele não faz nada.
let pool: pg.Pool | undefined

function getPool(): pg.Pool {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada')
  pool = new pg.Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000 })
  attachDatabasePool(pool)
  return pool
}

export type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Consulta com os valores sempre como parâmetros ($1, $2…), nunca colados no SQL:
 *
 *   const rows = await db()`select * from posts where slug = ${slug}`
 */
export function db() {
  const p = getPool()
  return async (strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]> => {
    const text = strings.reduce((acc, part, i) => acc + `$${i}` + part)
    const result = await p.query(text, values)
    return result.rows
  }
}

export interface PostRow {
  id: string
  /** o pg devolve Date; no JSON da resposta vira texto ISO */
  created_at: Date | string
  title: string
  description: string | null
  image_path: string | null
  content: string
  slug: string
}

export const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })

/** Código de erro do Postgres (ex.: 23505 = valor repetido numa coluna única). */
export const pgCode = (error: unknown): string | undefined =>
  (error as { code?: string } | null)?.code

/** Página e tamanho da página vindos da URL, com limites. */
export function pageParams(url: URL, maxPerPage = 50) {
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
  const perPage = Math.min(maxPerPage, Math.max(1, Number.parseInt(url.searchParams.get('per_page') ?? '10', 10) || 10))
  return { limit: perPage, offset: (page - 1) * perPage }
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
