You are my implementation agent. Your job is to make my Supabase setup for the MapJitsu project repeatable + reproducible across local Supabase CLI and the Supabase cloud project.

Hard requirements:
- Be explicit and sequential.
- Make changes as code (migrations + config), not “tribal knowledge”.
- Preserve existing repo settings unless the instructions explicitly change them.
- Produce a completion report with evidence (file diffs + command output + SQL outputs).

Context you must assume as true:
- PostGIS is installed into schema: gis
- pgvector extension (named “vector”) is installed into schema: extensions
- Goal: any request/session can resolve PostGIS + vector types/functions without having to prefix schema names, by ensuring search_path includes public, extensions, gis.

Source-of-truth references for correctness (do not ignore):
- Supabase PostGIS guide shows enabling postgis and recommends “Create a new schema” (example: gis). 
- Supabase pgvector docs confirm the extension name is “vector”.
- Supabase CLI uses supabase/config.toml and supports [api].extra_search_path; public is always included. 
- Supabase semantic search docs show: create extension vector with schema extensions.

Execution Steps

STEP 1 — Add idempotent migrations to enforce schemas + extensions (reproducibility)
1) In the repo root, locate the Supabase directory:
   - supabase/config.toml should exist.
   - supabase/migrations/ should exist.

2) Create a new migration file in supabase/migrations/ named like:
   <timestamp>_001_extensions_postgis_pgvector.sql
   with EXACT contents:

   create schema if not exists gis;
   create schema if not exists extensions;

   -- Install/ensure extensions are present in the intended schemas
   create extension if not exists postgis with schema gis;
   create extension if not exists vector  with schema extensions;

3) Create a second migration file:
   <timestamp>_002_search_path_baseline.sql
   with EXACT contents:

   alter role postgres        set search_path = public, extensions, gis;
   alter role authenticator   set search_path = public, extensions, gis;
   alter role anon            set search_path = public, extensions, gis;
   alter role authenticated   set search_path = public, extensions, gis;
   alter role service_role    set search_path = public, extensions, gis;

Notes:
- Keep them idempotent (IF NOT EXISTS).
- Do not remove or rewrite existing migrations.
- These roles are the standard Supabase roles used by the API layer.

Deliverable for Step 1:
- Git diff showing both migration files added.

STEP 2 — Update local Supabase CLI config.toml (repeatable local behavior)
1) Open supabase/config.toml.
2) Find the [api] section. Ensure extra_search_path includes BOTH:
   - "extensions"
   - "gis"

   Update/add this line (merge with existing values; do not delete existing entries unless redundant):
   extra_search_path = ["extensions", "gis"]

3) Save the file.

Deliverable for Step 2:
- Git diff showing the exact supabase/config.toml change.

STEP 3 — Apply changes locally and validate (local reproducibility checkpoint)
Run the following from repo root and capture terminal output:

1) Stop and restart the local stack (config changes require restart):
   npx supabase stop
   npx supabase start

2) Reset local DB so migrations + seed apply cleanly:
   npx supabase db reset

3) In the local SQL context (use Supabase SQL editor or psql), run and capture outputs:

   -- Confirm extension schemas
   select e.extname, n.nspname as schema
   from pg_extension e
   join pg_namespace n on n.oid = e.extnamespace
   where e.extname in ('postgis','vector');

   -- Confirm PostGIS works WITHOUT schema prefix
   select postgis_full_version();

   -- Confirm PostGIS types/functions usable without schema prefix
   drop table if exists public.places;
   create table public.places (
     id bigserial primary key,
     name text not null,
     geog geography(point, 4326)
   );
   insert into public.places (name, geog)
   values ('test', st_geogfromtext('POINT(-73.9857 40.7484)'));
   select name, st_astext(geog) from public.places;

   -- Confirm pgvector usable without schema prefix
   drop table if exists public.embeddings_smoketest;
   create table public.embeddings_smoketest (
     id bigserial primary key,
     embedding vector(3)
   );

Pass criteria (Step 3 is ONLY “done” if all are true):
- The extension schema query returns:
  postgis -> gis
  vector  -> extensions
- postgis_full_version() runs without “function does not exist”
- places table insert/select returns POINT(-73.9857 40.7484)
- embeddings_smoketest table creates successfully using vector(3) without schema prefix

Deliverable for Step 3:
- Paste full command output + SQL outputs into a Markdown report file:
  docs/setup/supabase_extensions_reproducibility_report.md

STEP 4 — Apply changes to Supabase cloud project and validate (cloud reproducibility checkpoint)
1) Link the repo to the Supabase cloud project if not already linked:
   npx supabase login
   npx supabase link --project-ref <PROJECT_REF>

2) Push migrations to the remote:
   npx supabase db push

3) Update Supabase Dashboard setting (requires browser automation):
   - Go to Project Settings → API → Data API settings
   - Set “Extra search path” to: public, extensions, gis
   - Save changes

4) In Supabase cloud SQL Editor, run the same validation SQL as in Step 3 and capture results.

Pass criteria (Step 4 is ONLY “done” if all are true):
- Remote extension schema query returns postgis->gis and vector->extensions
- postgis_full_version() runs without schema prefix
- geography(point, 4326) table works
- vector(3) table works

Deliverables for Step 4:
- Update the same report file with a “Cloud Validation” section containing:
  - db push output
  - screenshots OR copied SQL outputs from cloud SQL Editor
  - confirmation of Data API “Extra search path” value

FINAL STEP — Commit and summarize
1) Create the docs/setup/ report file if it doesn’t exist and ensure it contains:
   - What changed (files)
   - Exact commands run
   - Local validation outputs
   - Cloud validation outputs
2) Git status must be clean except for intended changes.
3) Provide me a final summary in the report:
   - “All pass criteria satisfied” OR “Fail criteria + exact errors + next actions”

Do not ask me questions unless you hit a hard blocker that prevents completion.
