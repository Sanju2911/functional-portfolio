begin;
alter table public.portfolio_posts add column if not exists body_html text not null default '';
create table if not exists public.portfolio_post_drafts (
  id uuid primary key,
  content jsonb not null default '{}'::jsonb check(jsonb_typeof(content)='object'),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_post_drafts enable row level security;
revoke all on public.portfolio_post_drafts from anon,authenticated;
grant select,insert,update on public.portfolio_post_drafts to authenticated;
do $migration$ begin
if not exists(select 1 from pg_policies where schemaname='public' and tablename='portfolio_post_drafts' and policyname='Private blog drafts') then
create policy "Private blog drafts" on public.portfolio_post_drafts for all to authenticated
using((select public.portfolio_is_admin())) with check((select public.portfolio_is_admin()));
end if;
if not exists(select 1 from pg_trigger where tgname='touch_post_drafts' and tgrelid='public.portfolio_post_drafts'::regclass) then
create trigger touch_post_drafts before update on public.portfolio_post_drafts for each row execute function public.portfolio_touch_updated_at();
end if;
end $migration$;
commit;
