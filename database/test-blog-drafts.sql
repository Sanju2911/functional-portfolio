-- Transactional verification: no test content is committed.
begin;
select set_config('request.jwt.claims','{"sub":"aa633575-a7c9-4335-88c2-ac6ae054add9","role":"authenticated"}',true);
set local role authenticated;
insert into public.portfolio_post_drafts(id,content) values('1c277209-951c-4374-b4a9-a6e22b4c58b4','{"title":"Transactional draft check","body_html":"<p>Private revision</p>"}');
do $test$ begin
if not exists(select 1 from public.portfolio_post_drafts where id='1c277209-951c-4374-b4a9-a6e22b4c58b4') then raise exception 'Admin draft read failed'; end if;
end $test$;
reset role;
select set_config('request.jwt.claims','{"sub":"d4520f0e-f1e0-4265-a50d-999a78da9d72","role":"authenticated"}',true);
set local role authenticated;
do $test$ begin
if exists(select 1 from public.portfolio_post_drafts) then raise exception 'Non-admin can read drafts'; end if;
begin
insert into public.portfolio_post_drafts(id,content) values(gen_random_uuid(),'{}');
raise exception 'Non-admin can write drafts';
exception when insufficient_privilege then null;
end;
end $test$;
reset role;
do $test$ begin
if has_table_privilege('anon','public.portfolio_post_drafts','SELECT') then raise exception 'Anonymous draft permission exposed'; end if;
if has_table_privilege('authenticated','public.portfolio_post_drafts','DELETE') then raise exception 'Draft deletion permission exposed'; end if;
end $test$;
rollback;
select 'PASS: Admin drafts work; non-admin and anonymous access denied; no test content retained.' as result;
