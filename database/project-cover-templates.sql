-- Additive migration: existing content, images, and permissions are preserved.
begin;
alter table public.portfolio_projects add column if not exists cover_layout jsonb not null default '{}'::jsonb;
do $$ begin
if not exists(select 1 from pg_constraint where conname='portfolio_projects_cover_layout_object' and conrelid='public.portfolio_projects'::regclass) then
alter table public.portfolio_projects add constraint portfolio_projects_cover_layout_object check(jsonb_typeof(cover_layout)='object');
end if;
end $$;
commit;
