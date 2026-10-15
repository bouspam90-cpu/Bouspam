-- BOUSPAM: DEMANN LAJAN + REVIZYON ADMINISTRATE
-- Kouri apre BOUSPAM_ADMIN_JEUX_REFERENCES.sql. NatCash API pa konekte isit la.
alter table public.bouspam_site_settings add column if not exists payment_notice text not null default 'Peman yo verifye manyèlman nan NatCash.';
create table if not exists public.bouspam_money_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 request_type text not null check(request_type in ('activation','deposit','withdrawal')),
 amount numeric(12,2) not null check(amount>0), reference text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 admin_note text, reviewed_by uuid references auth.users(id), reviewed_at timestamptz, created_at timestamptz not null default now());
create index if not exists bouspam_money_requests_status_created_idx on public.bouspam_money_requests(status,created_at desc);
create index if not exists bouspam_money_requests_user_created_idx on public.bouspam_money_requests(user_id,created_at desc);
alter table public.bouspam_money_requests enable row level security;
revoke all on public.bouspam_money_requests from anon,authenticated;
create or replace function public.bouspam_create_money_request(p_request_type text,p_amount numeric,p_reference text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid(); v_id uuid; v_active boolean;
begin
 if v_uid is null then raise exception 'Ou dwe konekte.'; end if;
 if p_request_type not in ('activation','deposit','withdrawal') then raise exception 'Kalite demann pa valab.'; end if;
 if p_amount is null or p_amount<=0 then raise exception 'Kantite lajan pa valab.'; end if;
 if length(trim(coalesce(p_reference,'')))<3 then raise exception 'Antre referans NatCash la oswa nimewo resepsyon an.'; end if;
 if p_request_type='activation' and p_amount<>500 then raise exception 'Aktivasyon koute egzakteman 500 HTG.'; end if;
 if p_request_type='withdrawal' and p_amount<255 then raise exception 'Retrè minimòm lan se 255 HTG.'; end if;
 if p_request_type='activation' then select is_activated into v_active from public.profiles where id=v_uid; if coalesce(v_active,false) then raise exception 'Kont ou deja aktive.'; end if; end if;
 if exists(select 1 from public.bouspam_money_requests where user_id=v_uid and request_type=p_request_type and status='pending') then raise exception 'Ou deja gen yon demann menm kalite ki annatant.'; end if;
 if p_request_type='withdrawal' and coalesce((select balance from public.wallets where user_id=v_uid),0)<p_amount then raise exception 'Balans ou pa ase pou retrè sa a.'; end if;
 insert into public.bouspam_money_requests(user_id,request_type,amount,reference) values(v_uid,p_request_type,p_amount,trim(p_reference)) returning id into v_id; return v_id;
end; $$;
revoke all on function public.bouspam_create_money_request(text,numeric,text) from public,anon; grant execute on function public.bouspam_create_money_request(text,numeric,text) to authenticated;
create or replace function public.bouspam_admin_review_money_request(p_request_id uuid,p_approve boolean,p_note text default null)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.bouspam_money_requests%rowtype; v_balance numeric;
begin
 if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Aksè administratè refize.'; end if;
 select * into r from public.bouspam_money_requests where id=p_request_id and status='pending' for update; if not found then raise exception 'Demann nan pa egziste oswa li deja trete.'; end if;
 if not p_approve then update public.bouspam_money_requests set status='rejected',admin_note=left(coalesce(p_note,''),500),reviewed_by=auth.uid(),reviewed_at=now() where id=r.id; insert into public.transactions(user_id,type,amount,status,reference) values(r.user_id,r.request_type,r.amount,'rejected',r.reference); return true; end if;
 if r.request_type in ('activation','deposit') then
  if r.request_type='activation' then update public.profiles set is_activated=true where id=r.user_id; if not found then raise exception 'Pwofil manm nan pa jwenn.'; end if;
  else insert into public.wallets(user_id,currency,balance) values(r.user_id,'HTG',r.amount) on conflict(user_id) do update set balance=public.wallets.balance+r.amount; end if;
  insert into public.transactions(user_id,type,amount,status,reference) values(r.user_id,case when r.request_type='activation' then 'activation_payment' else 'deposit' end,r.amount,'completed',r.reference);
 elsif r.request_type='withdrawal' then
  select balance into v_balance from public.wallets where user_id=r.user_id for update; if coalesce(v_balance,0)<r.amount then raise exception 'Balans manm nan pa ase ankò.'; end if;
  update public.wallets set balance=balance-r.amount where user_id=r.user_id;
  insert into public.transactions(user_id,type,amount,status,reference) values(r.user_id,'withdrawal',r.amount,'completed',r.reference);
 end if;
 update public.bouspam_money_requests set status='approved',admin_note=left(coalesce(p_note,''),500),reviewed_by=auth.uid(),reviewed_at=now() where id=r.id; return true;
end; $$;
revoke all on function public.bouspam_admin_review_money_request(uuid,boolean,text) from public,anon; grant execute on function public.bouspam_admin_review_money_request(uuid,boolean,text) to authenticated;
create or replace function public.bouspam_admin_set_payment_notice(p_notice text)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Aksè administratè refize.'; end if; update public.bouspam_site_settings set payment_notice=left(trim(coalesce(p_notice,'')),240),updated_at=now() where id=1; return found; end; $$;
revoke all on function public.bouspam_admin_set_payment_notice(text) from public,anon; grant execute on function public.bouspam_admin_set_payment_notice(text) to authenticated;
create or replace function public.bouspam_admin_dashboard()
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_result jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.admin_users au where au.user_id=auth.uid()) then return jsonb_build_object('is_admin',false); end if;
 select jsonb_build_object('is_admin',true,
 'stats',jsonb_build_object('members',(select count(*) from public.profiles),'activated',(select count(*) from public.profiles where is_activated=true),'pending_referrals',(select count(*) from public.referrals where status='pending'),'transactions',(select count(*) from public.transactions),'pending_money_requests',(select count(*) from public.bouspam_money_requests where status='pending')),
 'settings',(select jsonb_build_object('games_enabled',coalesce(s.games_enabled,true),'payment_notice',s.payment_notice) from public.bouspam_site_settings s where s.id=1),
 'members',coalesce((select jsonb_agg(x) from (select id,username,full_name,is_activated,created_at from public.profiles order by created_at desc limit 100)x),'[]'::jsonb),
 'referrals',coalesce((select jsonb_agg(x) from (select id,referrer_id,referred_id,status,created_at from public.referrals where status='pending' order by created_at asc limit 100)x),'[]'::jsonb),
 'transactions',coalesce((select jsonb_agg(x) from (select user_id,type,amount,status,reference,created_at from public.transactions order by created_at desc limit 100)x),'[]'::jsonb),
 'payment_requests',coalesce((select jsonb_agg(x) from (select id,user_id,request_type,amount,reference,status,admin_note,created_at from public.bouspam_money_requests where status='pending' order by created_at asc limit 100)x),'[]'::jsonb)) into v_result; return v_result;
end; $$;
revoke all on function public.bouspam_admin_dashboard() from public,anon; grant execute on function public.bouspam_admin_dashboard() to authenticated;
