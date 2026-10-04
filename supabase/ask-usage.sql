begin;

create table if not exists public.ask_usage (
  day date primary key,
  requests integer not null check (requests >= 0)
);
alter table public.ask_usage enable row level security;
revoke all on public.ask_usage from public, anon, authenticated;
grant all on public.ask_usage to service_role;

create or replace function public.consume_ask_request(p_limit integer)
returns boolean language plpgsql set search_path = public, pg_temp as $$
declare
  allowed boolean;
begin
  if p_limit < 1 or p_limit > 10000 or p_limit is null then
    raise exception 'Invalid Ask limit';
  end if;
  insert into public.ask_usage (day, requests)
    values ((now() at time zone 'UTC')::date, 1)
  on conflict (day) do update set requests = ask_usage.requests + 1
    where ask_usage.requests < p_limit
  returning true into allowed;
  return coalesce(allowed, false);
end;
$$;
revoke all on function public.consume_ask_request(integer) from public, anon, authenticated;
grant execute on function public.consume_ask_request(integer) to service_role;

commit;
