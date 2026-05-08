-- 0026_pgvector_funding.sql
-- Funding-domain semantic search storage. Uses Gemini embeddings at 768
-- dimensions and exposes ranked IDs only through a service-role RPC.

create extension if not exists vector with schema extensions;

do $$
begin
  alter type public.ai_enrichment_task_type add value if not exists 'embedding';
exception
  when duplicate_object then null;
end $$;

create table if not exists public.funding_embeddings (
  funding_id uuid primary key references public.funding(id) on delete cascade,
  content_hash text not null,
  embedding extensions.vector(768) not null,
  model text not null,
  dimensions integer not null default 768 check (dimensions = 768),
  generated_at timestamptz not null default now()
);

create index if not exists funding_embeddings_hnsw_cosine_idx
on public.funding_embeddings
using hnsw (embedding extensions.vector_cosine_ops);

alter table public.funding_embeddings enable row level security;

-- Service-role only: no anon/authenticated policies are published for raw vectors.

create or replace function public.match_funding_embeddings(
  query_embedding extensions.vector(768),
  match_type text,
  match_count integer default 50,
  match_model text default 'gemini-embedding-001'
)
returns table (
  funding_id uuid,
  similarity double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    fe.funding_id,
    1 - (fe.embedding <=> query_embedding) as similarity
  from public.funding_embeddings fe
  join public.funding f on f.id = fe.funding_id
  where f.status = 'active'
    and f.type::text = match_type
    and f.content_hash = fe.content_hash
    and fe.model = match_model
  order by fe.embedding <=> query_embedding
  limit greatest(1, least(match_count, 200));
$$;

revoke all on function public.match_funding_embeddings(
  extensions.vector(768),
  text,
  integer,
  text
) from public;

grant execute on function public.match_funding_embeddings(
  extensions.vector(768),
  text,
  integer,
  text
) to service_role;
