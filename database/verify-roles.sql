-- Run as the database owner. All temporary content is rolled back.
begin;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa633575-a7c9-4335-88c2-ac6ae054add9","role":"authenticated"}',true);
do $$ begin if not public.portfolio_is_admin() then raise exception 'Admin membership check failed'; end if; end $$;
insert into public.portfolio_projects(id,title,published) values('__cms_role_test','Temporary CMS role test',false);
update public.portfolio_projects set description='Updated through authenticated admin role' where id='__cms_role_test';
insert into public.portfolio_posts(id,slug,title,body,published) values('00000000-0000-4000-8000-000000000001','temporary-cms-role-test','Temporary CMS role test','Temporary body',true);
update public.portfolio_settings set blogs_enabled=false where id='main';
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
if exists(select 1 from public.portfolio_projects where id='__cms_role_test') then raise exception 'Draft project exposed'; end if;
if exists(select 1 from public.portfolio_posts where slug='temporary-cms-role-test') then raise exception 'Disabled blog exposed'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aa633575-a7c9-4335-88c2-ac6ae054add9","role":"authenticated"}',true);
update public.portfolio_settings set blogs_enabled=true where id='main';
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin if not exists(select 1 from public.portfolio_posts where slug='temporary-cms-role-test') then raise exception 'Enabled published blog not visible'; end if; end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000099","role":"authenticated"}',true);
do $$ begin
if public.portfolio_is_admin() then raise exception 'Non-admin gained admin role'; end if;
if exists(select 1 from public.portfolio_projects where id='__cms_role_test') then raise exception 'Draft exposed to non-admin'; end if;
begin
insert into public.portfolio_projects(id,title) values('__must_be_denied','Should fail');
raise exception 'Non-admin insert was allowed';
exception when insufficient_privilege then null;
end;
end $$;
rollback;
select 'Admin CRUD, draft isolation, blog switch, and non-admin denial passed. Temporary data rolled back.' as result;
