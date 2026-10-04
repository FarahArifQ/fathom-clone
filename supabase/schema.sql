begin;

create table if not exists public.meetings (
  id text primary key,
  title text not null,
  type text not null,
  date date not null,
  duration_seconds integer not null check (duration_seconds > 0),
  is_seed boolean not null default false
);

create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),
  meeting_id text not null references public.meetings(id) on delete cascade,
  name text not null,
  is_seed boolean not null default false,
  unique (meeting_id, name)
);

create table if not exists public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  meeting_id text not null references public.meetings(id) on delete cascade,
  speaker text not null,
  text text not null,
  start_seconds integer not null check (start_seconds >= 0),
  is_seed boolean not null default false,
  unique (meeting_id, start_seconds, speaker)
);

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  meeting_id text not null references public.meetings(id) on delete cascade,
  template_name text not null,
  tldr text not null,
  markdown text not null,
  unique (meeting_id, template_name)
);

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id text not null references public.meetings(id) on delete cascade,
  description text not null,
  assignee text,
  completed boolean not null default false,
  timestamp_seconds integer check (timestamp_seconds >= 0)
);

create table if not exists public.annotations (
  id uuid primary key default gen_random_uuid(),
  meeting_id text not null references public.meetings(id) on delete cascade,
  type text not null check (type in ('highlight', 'note')),
  timestamp_seconds integer not null check (timestamp_seconds >= 0),
  note text not null
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  meeting_id text not null references public.meetings(id) on delete cascade,
  title text not null,
  start_seconds integer not null check (start_seconds >= 0)
);

create index if not exists action_items_meeting_id_idx on public.action_items (meeting_id);
create index if not exists annotations_meeting_timestamp_idx on public.annotations (meeting_id, timestamp_seconds);
create index if not exists chapters_meeting_start_idx on public.chapters (meeting_id, start_seconds);

alter table public.meetings enable row level security;
alter table public.attendees enable row level security;
alter table public.transcript_segments enable row level security;
alter table public.summaries enable row level security;
alter table public.action_items enable row level security;
alter table public.annotations enable row level security;
alter table public.chapters enable row level security;

revoke all on public.meetings, public.attendees, public.transcript_segments,
  public.summaries, public.action_items, public.annotations, public.chapters
  from public, anon, authenticated;
grant all on public.meetings, public.attendees, public.transcript_segments,
  public.summaries, public.action_items, public.annotations, public.chapters
  to service_role;

alter table public.meetings add column if not exists summary_generation_token uuid;
alter table public.meetings add column if not exists summary_generation_started_at timestamptz;

create or replace function public.claim_summary_generation(p_meeting_id text, p_token uuid)
returns text language plpgsql set search_path = public, pg_temp as $$
declare
  meeting public.meetings%rowtype;
begin
  select * into meeting from public.meetings where id = p_meeting_id for update;
  if not found then return 'missing'; end if;
  if exists (select 1 from public.summaries where meeting_id = p_meeting_id) then
    return 'saved';
  end if;
  if meeting.summary_generation_token is not null
    and meeting.summary_generation_started_at > now() - interval '3 minutes' then
    return 'busy';
  end if;
  update public.meetings set summary_generation_token = p_token,
    summary_generation_started_at = now() where id = p_meeting_id;
  return 'claimed';
end;
$$;

create or replace function public.save_meeting_summary(p_meeting_id text, p_token uuid, p_result jsonb)
returns void language plpgsql set search_path = public, pg_temp as $$
declare
  meeting public.meetings%rowtype;
begin
  select * into meeting from public.meetings where id = p_meeting_id for update;
  if not found then raise exception 'Meeting not found'; end if;
  if exists (select 1 from public.summaries where meeting_id = p_meeting_id) then return; end if;
  if meeting.summary_generation_token is distinct from p_token then
    raise exception 'Generation claim expired';
  end if;
  insert into public.summaries (meeting_id, template_name, tldr, markdown)
    values (p_meeting_id, 'general', p_result->>'tldr', p_result->>'summary_markdown');
  insert into public.action_items (meeting_id, description, assignee, timestamp_seconds)
    select p_meeting_id, item->>'description', item->>'assignee', (item->>'timestamp_seconds')::integer
    from jsonb_array_elements(p_result->'action_items') item;
  insert into public.chapters (meeting_id, title, start_seconds)
    select p_meeting_id, item->>'title', (item->>'start_seconds')::integer
    from jsonb_array_elements(p_result->'chapters') item;
  update public.meetings set summary_generation_token = null,
    summary_generation_started_at = null where id = p_meeting_id;
end;
$$;

create or replace function public.release_summary_generation(p_meeting_id text, p_token uuid)
returns void language sql set search_path = public, pg_temp as $$
  update public.meetings set summary_generation_token = null,
    summary_generation_started_at = null
  where id = p_meeting_id and summary_generation_token = p_token;
$$;

revoke all on function public.claim_summary_generation(text, uuid),
  public.save_meeting_summary(text, uuid, jsonb), public.release_summary_generation(text, uuid)
  from public, anon, authenticated;
grant execute on function public.claim_summary_generation(text, uuid),
  public.save_meeting_summary(text, uuid, jsonb), public.release_summary_generation(text, uuid)
  to service_role;

commit;
