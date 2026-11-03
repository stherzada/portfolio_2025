-- Blog do portfolio no Neon (Postgres). Rode uma vez no SQL Editor do Neon.
-- Pode rodar de novo sem medo: nada é recriado se já existir.

-- Os posts, com as mesmas colunas que tinham no Supabase.
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  image_path text,
  content text not null default '',
  slug text not null unique
);

create index if not exists posts_created_at_idx on posts (created_at desc);

-- As imagens do blog (capa e as do meio do texto). Saem por /blog-images/<name>
-- (api/blog-image.ts) com cache longo: cada upload ganha um nome novo, então
-- o arquivo de um nome nunca muda.
create table if not exists images (
  name text primary key,
  content_type text not null,
  data bytea not null,
  created_at timestamptz not null default now()
);

-- Senhas erradas no /admin, para frear quem tenta adivinhar (api/auth.ts).
create table if not exists login_attempts (
  ip text not null,
  at timestamptz not null default now()
);

create index if not exists login_attempts_ip_at_idx on login_attempts (ip, at);
