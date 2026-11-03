// Gera o ADMIN_PASSWORD_HASH do login do /admin (api/_lib/session.ts).
// A senha não fica salva em lugar nenhum: só o hash vai para a Vercel.
//
//   node scripts/hash-password.mjs           mostra o hash
//   node scripts/hash-password.mjs --write   grava no .env.local, sem mostrar
//
// Mesmos parâmetros do servidor: scrypt, sal de 16 bytes, chave de 64 bytes.

import { randomBytes, scryptSync } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'

// esconde o que é digitado (o prompt aparece, a senha não)
let muted = false
const output = new Writable({
  write(chunk, _encoding, callback) {
    if (!muted) process.stderr.write(chunk)
    callback()
  },
})
const rl = createInterface({ input: process.stdin, output, terminal: true })

async function ask(question) {
  const answer = rl.question(question)
  muted = true
  const value = await answer
  muted = false
  process.stderr.write('\n')
  return value
}

const password = await ask('Senha nova do admin: ')
const again = await ask('De novo: ')
rl.close()

if (password !== again) {
  console.error('As senhas não batem.')
  process.exit(1)
}
if (password.length < 12) {
  console.error('Use pelo menos 12 caracteres.')
  process.exit(1)
}

const salt = randomBytes(16)
const line = `ADMIN_PASSWORD_HASH=scrypt:${salt.toString('base64')}:${scryptSync(password, salt, 64).toString('base64')}`

if (process.argv.includes('--write')) {
  // troca a linha se já existir; senão, acrescenta no fim
  const file = new URL('../.env.local', import.meta.url)
  const current = await readFile(file, 'utf8').catch(() => '')
  const lines = current.split('\n').filter((l) => !l.startsWith('ADMIN_PASSWORD_HASH='))
  while (lines.length && lines.at(-1) === '') lines.pop()
  await writeFile(file, [...lines, line, ''].join('\n'))
  console.error('Hash salvo no .env.local (ADMIN_PASSWORD_HASH).')
} else {
  console.log(line)
}
