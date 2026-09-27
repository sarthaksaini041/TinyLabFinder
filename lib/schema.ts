// Database schema (idempotent). Applied once per server instance by lib/db.ts, and
// usable as-is in the Supabase SQL editor for a fresh project.
export const SCHEMA_SQL = String.raw`
-- TinyLab Finder schema. Idempotent: safe to run on every cold start and on a fresh DB.
-- All tables are server-only: RLS on with no policies, and no grants to Supabase's
-- public API roles, so nothing is reachable except through the app's own connection.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  name text not null check (char_length(name) between 1 and 80),
  password_hash text not null,
  email_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists email_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  purpose text not null check (purpose in ('verify', 'reset')),
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists email_codes_user_idx on email_codes (user_id, purpose, created_at desc);

create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists auth_attempts (
  id bigserial primary key,
  key text not null,
  created_at timestamptz not null default now()
);
create index if not exists auth_attempts_key_idx on auth_attempts (key, created_at);

create table if not exists alerts (
  id text primary key,
  email text not null,
  model_slug text not null,
  max_price numeric not null check (max_price between 20 and 5000),
  marketplace text not null check (marketplace in ('EBAY_US', 'EBAY_GB', 'EBAY_DE')),
  token text unique not null,
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  last_notified_at timestamptz
);
alter table alerts add column if not exists user_id uuid references users(id) on delete cascade;
create index if not exists alerts_user_idx on alerts (user_id);

-- Asking-price observations written by the price sync (eBay Browse API). Never hand-entered.
create table if not exists price_snapshots (
  id bigserial primary key,
  model_slug text not null,
  marketplace text not null,
  currency text not null,
  min_price numeric not null check (min_price > 0),
  median_price numeric not null check (median_price > 0),
  sample_size int not null check (sample_size > 0),
  observed_at timestamptz not null default now(),
  source text not null default 'ebay-browse'
);
alter table price_snapshots add column if not exists image_url text;
alter table price_snapshots add column if not exists image_listing_url text;
create index if not exists price_snapshots_model_idx on price_snapshots (model_slug, marketplace, observed_at desc);

-- Saved models (watchlist) per account.
create table if not exists saved_models (
  user_id uuid not null references users(id) on delete cascade,
  model_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, model_slug)
);

alter table users enable row level security;
alter table email_codes enable row level security;
alter table sessions enable row level security;
alter table auth_attempts enable row level security;
alter table alerts enable row level security;
alter table price_snapshots enable row level security;
alter table saved_models enable row level security;

-- Supabase exposes the public schema through its REST API roles. Revoke them when they
-- exist (they do not on a plain local Postgres).
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on users, email_codes, sessions, auth_attempts, alerts, price_snapshots, saved_models from %I', r);
      execute format('revoke all on sequence auth_attempts_id_seq, price_snapshots_id_seq from %I', r);
    end if;
  end loop;
end $$;
`;
