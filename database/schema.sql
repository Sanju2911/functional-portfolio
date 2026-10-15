begin;
create table public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;
grant select on public.portfolio_admins to authenticated;
create policy "Members can check their own role" on public.portfolio_admins for select to authenticated using (user_id=(select auth.uid()));

create function public.portfolio_is_admin() returns boolean language sql stable security definer set search_path='' as $$
select exists(select 1 from public.portfolio_admins where user_id=auth.uid());
$$;
revoke all on function public.portfolio_is_admin() from public;
grant execute on function public.portfolio_is_admin() to anon,authenticated;

create table public.portfolio_settings (
  id text primary key default 'main' check(id='main'),
  blogs_enabled boolean not null default false,
  portrait jsonb not null default '{"shape":"circle","size":100,"height":390,"zoom":100,"x":50,"y":50,"grayscale":0,"brightness":100,"saturation":100,"url":""}'::jsonb check(jsonb_typeof(portrait)='object'),
  updated_at timestamptz not null default now()
);
create table public.portfolio_projects (
  id text primary key,
  title text not null check(length(title) between 1 and 160),
  description text not null default '',
  intro text not null default '',
  story text not null default '',
  approach text not null default '',
  status_note text not null default '',
  tags text[] not null default '{}',
  cover_url text not null default '',
  cover_layout jsonb not null default '{}'::jsonb constraint portfolio_projects_cover_layout_object check(jsonb_typeof(cover_layout)='object'),
  cover_color text not null default 'lilac' check(cover_color in ('lilac','mint','peach','yellow')),
  gallery jsonb not null default '[]'::jsonb check(jsonb_typeof(gallery)='array'),
  repository_url text not null default '',
  demo_url text not null default '',
  published boolean not null default false,
  archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.portfolio_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check(length(title) between 1 and 200),
  excerpt text not null default '',
  body text not null default '',
  cover_url text not null default '',
  published boolean not null default false,
  archived boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create function public.portfolio_touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create trigger touch_settings before update on public.portfolio_settings for each row execute function public.portfolio_touch_updated_at();
create trigger touch_projects before update on public.portfolio_projects for each row execute function public.portfolio_touch_updated_at();
create trigger touch_posts before update on public.portfolio_posts for each row execute function public.portfolio_touch_updated_at();
alter table public.portfolio_settings enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_posts enable row level security;
revoke all on public.portfolio_settings,public.portfolio_projects,public.portfolio_posts from anon,authenticated;
grant select on public.portfolio_settings,public.portfolio_projects,public.portfolio_posts to anon,authenticated;
grant insert,update,delete on public.portfolio_projects,public.portfolio_posts to authenticated;
grant update on public.portfolio_settings to authenticated;
create policy "Public settings" on public.portfolio_settings for select to anon,authenticated using(true);
create policy "Admin settings" on public.portfolio_settings for update to authenticated using((select public.portfolio_is_admin())) with check((select public.portfolio_is_admin()));
create policy "Published projects" on public.portfolio_projects for select to anon,authenticated using((published and not archived) or (select public.portfolio_is_admin()));
create policy "Admin insert projects" on public.portfolio_projects for insert to authenticated with check((select public.portfolio_is_admin()));
create policy "Admin update projects" on public.portfolio_projects for update to authenticated using((select public.portfolio_is_admin())) with check((select public.portfolio_is_admin()));
create policy "Admin delete projects" on public.portfolio_projects for delete to authenticated using((select public.portfolio_is_admin()));
create policy "Visible blog posts" on public.portfolio_posts for select to anon,authenticated using((select public.portfolio_is_admin()) or (published and not archived and exists(select 1 from public.portfolio_settings where id='main' and blogs_enabled)));
create policy "Admin insert posts" on public.portfolio_posts for insert to authenticated with check((select public.portfolio_is_admin()));
create policy "Admin update posts" on public.portfolio_posts for update to authenticated using((select public.portfolio_is_admin())) with check((select public.portfolio_is_admin()));
create policy "Admin delete posts" on public.portfolio_posts for delete to authenticated using((select public.portfolio_is_admin()));
insert into public.portfolio_settings(id) values('main');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portfolio-media','portfolio-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif']);
create policy "Admin media insert" on storage.objects for insert to authenticated with check(bucket_id='portfolio-media' and (select public.portfolio_is_admin()));
create policy "Admin media update" on storage.objects for update to authenticated using(bucket_id='portfolio-media' and (select public.portfolio_is_admin())) with check(bucket_id='portfolio-media' and (select public.portfolio_is_admin()));
create policy "Admin media delete" on storage.objects for delete to authenticated using(bucket_id='portfolio-media' and (select public.portfolio_is_admin()));
create policy "Admin media list" on storage.objects for select to authenticated using(bucket_id='portfolio-media' and (select public.portfolio_is_admin()));
commit;

-- Rich blog canvas and private revisions.
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
