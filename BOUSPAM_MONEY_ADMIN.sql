-- BOUSPAM: ADMIN, DEMANN DEPO/RETRÈ AK RETRÈ OTOMATIK PAYMPLOPLO
-- Migrasyon sa a pa efase tab, done, triggers, oswa fonksyon referans ki egziste deja.
-- Aplike li nan Supabase SQL Editor. Secret PaymPlopPlop la rete sèlman nan Cloudflare.

create table if not exists public.bouspam_site_settings (
  id integer primary key default 1 check (id = 1),
  games_enabled boolean not null default true,
  activation_fee numeric(12,2) not null default 500 check (activation_fee = 500),
  withdrawal_minimum numeric(12,2) not null default 255 check (withdrawal_minimum >= 255),
  site_message text not null default '',
  payment_notice text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.bouspam_site_settings add column if not exists games_enabled boolean not null default true;
alter table public.bouspam_site_settings add column if not exists activation_fee numeric(12,2) not null default 500;
alter table public.bouspam_site_settings add column if not exists withdrawal_minimum numeric(12,2) not null default 255;
alter table public.bouspam_site_settings add column if not exists site_message text not null default '';
alter table public.bouspam_site_settings add column if not exists payment_notice text not null default '';
insert into public.bouspam_site_settings(id,games_enabled,activation_fee,withdrawal_minimum,site_message,payment_notice)
values(1,true,500,255,'','') on conflict(id) do nothing;
alter table public.bouspam_site_settings enable row level security;
revoke all on public.bouspam_site_settings from anon, authenticated;

create table if not exists public.bouspam_money_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check(request_type in ('activation','deposit','withdrawal')),
  amount numeric(12,2) not null check(amount > 0),
  reference text not null,
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.bouspam_money_requests add column if not exists withdrawal_method text not null default 'natcash';
alter table public.bouspam_money_requests add column if not exists balance_reserved boolean not null default false;
alter table public.bouspam_money_requests add column if not exists provider_status text;
alter table public.bouspam_money_requests add column if not exists provider_reference text;
alter table public.bouspam_money_requests add column if not exists provider_transaction_id text;
alter table public.bouspam_money_requests add column if not exists provider_api_reference text;
alter table public.bouspam_money_requests add column if not exists provider_fee numeric(12,2);
alter table public.bouspam_money_requests add column if not exists provider_total numeric(12,2);
alter table public.bouspam_money_requests add column if not exists provider_error text;
alter table public.bouspam_money_requests add column if not exists provider_attempted_at timestamptz;
create index if not exists bouspam_money_requests_status_created_idx on public.bouspam_money_requests(status,created_at desc);
create index if not exists bouspam_money_requests_user_created_idx on public.bouspam_money_requests(user_id,created_at desc);
create unique index if not exists bouspam_money_requests_provider_reference_uidx on public.bouspam_money_requests(provider_reference) where provider_reference is not null;
alter table public.bouspam_money_requests enable row level security;
revoke all on public.bouspam_money_requests from anon, authenticated;

-- Fonksyon prensipal demann finansye. Retrè a rezève nan bous la lè demann lan fèt,
-- pou manm nan pa depanse menm balans lan pandan API a ap trete retrè a.
create or replace function public.bouspam_create_money_request(
  p_request_type text,
  p_amount numeric,
  p_reference text,
  p_method text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_active boolean;
  v_balance numeric;
  v_reference text := trim(coalesce(p_reference,''));
  v_method text := lower(trim(coalesce(p_method,'natcash')));
begin
  if v_uid is null then raise exception 'Ou dwe konekte.'; end if;
  if p_request_type not in ('deposit','withdrawal') then
    raise exception 'Pou aktivasyon, sèvi ak bouton peman 500 HTG la.';
  end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Kantite lajan pa valab.'; end if;
  if length(v_reference) < 3 then raise exception 'Antre referans tranzaksyon an oswa nimewo telefòn pou retrè a.'; end if;

  select coalesce(is_activated,false) into v_active from public.profiles where id=v_uid;
  if not found then raise exception 'Pwofil manm nan pa egziste.'; end if;
  if not v_active then raise exception 'Ou dwe aktive kont ou anvan ou fè demann sa a.'; end if;

  if exists(select 1 from public.bouspam_money_requests where user_id=v_uid and request_type=p_request_type and status='pending') then
    raise exception 'Ou deja gen yon demann menm kalite ki annatant.';
  end if;

  if p_request_type='withdrawal' then
    v_reference := regexp_replace(v_reference, '[^0-9]', '', 'g');
    if p_amount < 255 then raise exception 'Retrè minimòm lan se 255 HTG.'; end if;
    if v_method not in ('natcash','moncash') then raise exception 'Chwazi NatCash oswa MonCash.'; end if;
    if v_reference !~ '^509[0-9]{8}$' then raise exception 'Nimewo destinatè a dwe nan fòma 509XXXXXXXX.'; end if;
    select balance into v_balance from public.wallets where user_id=v_uid for update;
    if not found or coalesce(v_balance,0) < p_amount then raise exception 'Balans ou pa ase pou retrè sa a.'; end if;
    update public.wallets set balance=balance-p_amount where user_id=v_uid and balance>=p_amount;
    if not found then raise exception 'Balans lan chanje; rafrechi epi eseye ankò.'; end if;
    insert into public.bouspam_money_requests(user_id,request_type,amount,reference,withdrawal_method,balance_reserved)
    values(v_uid,p_request_type,p_amount,v_reference,v_method,true) returning id into v_id;
  else
    if v_method not in ('natcash','moncash') then raise exception 'Chwazi NatCash oswa MonCash pou depo.'; end if;
    insert into public.bouspam_money_requests(user_id,request_type,amount,reference,withdrawal_method,balance_reserved)
    values(v_uid,p_request_type,p_amount,v_reference,v_method,false) returning id into v_id;
  end if;
  return v_id;
end;
$$;
revoke all on function public.bouspam_create_money_request(text,numeric,text,text) from public, anon;
grant execute on function public.bouspam_create_money_request(text,numeric,text,text) to authenticated;

-- Kenbe ansyen RPC 3-paramèt la pou ansyen ekran yo; li itilize NatCash epi aplike menm verifikasyon an.
create or replace function public.bouspam_create_money_request(
  p_request_type text,
  p_amount numeric,
  p_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return public.bouspam_create_money_request(p_request_type,p_amount,p_reference,'natcash');
end;
$$;
revoke all on function public.bouspam_create_money_request(text,numeric,text) from public, anon;
grant execute on function public.bouspam_create_money_request(text,numeric,text) to authenticated;

-- Administratè ka refize demann lan (epi remèt lajan rezève a), oswa apwouve depo.
-- Retrè pa ka apwouve manyèlman: li dwe konfime pa API retrè machann lan.
create or replace function public.bouspam_admin_review_money_request(
  p_request_id uuid,
  p_approve boolean,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r public.bouspam_money_requests%rowtype;
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then
    raise exception 'Aksè administratè refize.';
  end if;
  select * into r from public.bouspam_money_requests where id=p_request_id and status='pending' for update;
  if not found then raise exception 'Demann nan pa egziste oswa li deja trete.'; end if;

  if not p_approve then
    if r.request_type='withdrawal' and lower(coalesce(r.provider_status,'')) in ('processing','pending') then
      raise exception 'Retrè a toujou ap verifye sou API a. Verifye estati li anvan ou refize demann lan.';
    end if;
    if r.request_type='withdrawal' and r.balance_reserved then
      update public.wallets set balance=coalesce(balance,0)+r.amount where user_id=r.user_id;
      if not found then raise exception 'Bous manm nan pa jwenn; demann lan pa refize pou sekirite.'; end if;
    end if;
    update public.bouspam_money_requests
      set status='rejected', balance_reserved=false, admin_note=left(coalesce(p_note,''),500),
          reviewed_by=auth.uid(), reviewed_at=now()
      where id=r.id;
    insert into public.transactions(user_id,type,amount,status,reference)
      values(r.user_id,r.request_type,r.amount,'rejected',r.reference);
    return true;
  end if;

  if r.request_type='withdrawal' then
    raise exception 'Pou sekirite, itilize bouton retrè otomatik la; pa apwouve retrè manyèlman.';
  elsif r.request_type='deposit' then
    insert into public.wallets(user_id,currency,balance,created_at)
      values(r.user_id,'HTG',r.amount,now())
      on conflict(user_id) do update set balance=coalesce(public.wallets.balance,0)+excluded.balance;
    insert into public.transactions(user_id,type,amount,status,reference)
      values(r.user_id,'deposit',r.amount,'completed',r.reference);
  else
    raise exception 'Aktivasyon dwe konfime atravè API peman BOUSPAM lan.';
  end if;

  update public.bouspam_money_requests
    set status='approved', admin_note=left(coalesce(p_note,''),500),
        reviewed_by=auth.uid(), reviewed_at=now()
    where id=r.id;
  return true;
end;
$$;
revoke all on function public.bouspam_admin_review_money_request(uuid,boolean,text) from public, anon;
grant execute on function public.bouspam_admin_review_money_request(uuid,boolean,text) to authenticated;

-- Se Cloudflare (service_role) sèlman ki rele fonksyon sa a apre li fin verifye API retrè a.
create or replace function public.bouspam_finalize_automatic_withdrawal(
  p_request_id uuid,
  p_provider_status text,
  p_provider_reference text,
  p_provider_transaction_id text default null,
  p_provider_api_reference text default null,
  p_provider_fee numeric default null,
  p_provider_total numeric default null,
  p_provider_message text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r public.bouspam_money_requests%rowtype;
  v_balance numeric;
  v_status text := lower(coalesce(p_provider_status,''));
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Fonksyon sa a rezève pou sèvè BOUSPAM.'; end if;
  if v_status not in ('processing','pending','failed','success') then raise exception 'Estati founisè a pa valab.'; end if;

  select * into r from public.bouspam_money_requests where id=p_request_id for update;
  if not found then raise exception 'Demann retrè a pa jwenn.'; end if;
  if r.request_type <> 'withdrawal' then raise exception 'Demann lan pa yon retrè.'; end if;
  if r.status='approved' then return true; end if;
  if r.status <> 'pending' then raise exception 'Demann retrè sa a pa annatant ankò.'; end if;

  if v_status='success' then
    -- Nouvo demann yo deja rezève balans lan. Pou ansyen demann ki pa t rezève,
    -- retire lajan an kounye a, si balans lan toujou ase.
    if not coalesce(r.balance_reserved,false) then
      select balance into v_balance from public.wallets where user_id=r.user_id for update;
      if not found or coalesce(v_balance,0)<r.amount then raise exception 'Balans lan pa ase pou finalize ansyen demann sa a.'; end if;
      update public.wallets set balance=balance-r.amount where user_id=r.user_id;
    end if;
    update public.bouspam_money_requests set
      status='approved', balance_reserved=false, provider_status='success',
      provider_reference=coalesce(p_provider_reference,provider_reference),
      provider_transaction_id=p_provider_transaction_id,
      provider_api_reference=p_provider_api_reference,
      provider_fee=p_provider_fee, provider_total=p_provider_total,
      provider_error=null, admin_note=left(coalesce(p_provider_message,'Retrè konfime otomatikman.'),500),
      reviewed_at=now()
    where id=r.id;
    if not exists(select 1 from public.transactions where type='withdrawal' and reference=coalesce(p_provider_reference,r.provider_reference)) then
      insert into public.transactions(user_id,type,amount,status,reference)
      values(r.user_id,'withdrawal',r.amount,'completed',coalesce(p_provider_reference,r.provider_reference));
    end if;
  else
    update public.bouspam_money_requests set
      provider_status=v_status,
      provider_reference=coalesce(p_provider_reference,provider_reference),
      provider_transaction_id=coalesce(p_provider_transaction_id,provider_transaction_id),
      provider_api_reference=coalesce(p_provider_api_reference,provider_api_reference),
      provider_fee=coalesce(p_provider_fee,provider_fee),
      provider_total=coalesce(p_provider_total,provider_total),
      provider_error=case when v_status='failed' then left(coalesce(p_provider_message,'Retrè a echwe.'),500) else null end
    where id=r.id;
  end if;
  return true;
end;
$$;
revoke all on function public.bouspam_finalize_automatic_withdrawal(uuid,text,text,text,text,numeric,numeric,text) from public, anon, authenticated;
grant execute on function public.bouspam_finalize_automatic_withdrawal(uuid,text,text,text,text,numeric,numeric,text) to service_role;

create or replace function public.bouspam_admin_set_payment_notice(p_notice text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Aksè administratè refize.'; end if;
  update public.bouspam_site_settings set payment_notice=left(trim(coalesce(p_notice,'')),240), updated_at=now() where id=1;
  return found;
end;
$$;
revoke all on function public.bouspam_admin_set_payment_notice(text) from public, anon;
grant execute on function public.bouspam_admin_set_payment_notice(text) to authenticated;

create or replace function public.bouspam_admin_set_games_enabled(p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then
    raise exception 'Aksè administratè refize.';
  end if;
  update public.bouspam_site_settings set games_enabled=coalesce(p_enabled,true), updated_at=now() where id=1;
  return found;
end;
$$;
revoke all on function public.bouspam_admin_set_games_enabled(boolean) from public, anon;
grant execute on function public.bouspam_admin_set_games_enabled(boolean) to authenticated;

create or replace function public.bouspam_admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_result jsonb;
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users au where au.user_id=auth.uid()) then
    return jsonb_build_object('is_admin',false);
  end if;
  select jsonb_build_object(
    'is_admin',true,
    'stats',jsonb_build_object(
      'members',(select count(*) from public.profiles),
      'activated',(select count(*) from public.profiles where is_activated=true),
      'pending_referrals',(select count(*) from public.referrals where status='pending'),
      'transactions',(select count(*) from public.transactions),
      'pending_money_requests',(select count(*) from public.bouspam_money_requests where status='pending')
    ),
    'settings',(select jsonb_build_object(
      'games_enabled',coalesce(s.games_enabled,true),
      'activation_fee',s.activation_fee,
      'withdrawal_minimum',s.withdrawal_minimum,
      'site_message',s.site_message,
      'payment_notice',s.payment_notice
    ) from public.bouspam_site_settings s where s.id=1),
    'members',coalesce((select jsonb_agg(x) from (
      select id,username,full_name,is_activated,created_at from public.profiles order by created_at desc limit 100
    ) x),'[]'::jsonb),
    'referrals',coalesce((select jsonb_agg(x) from (
      select id,referrer_id,referred_id,status,created_at from public.referrals where status='pending' order by created_at asc limit 100
    ) x),'[]'::jsonb),
    'transactions',coalesce((select jsonb_agg(x) from (
      select user_id,type,amount,status,reference,created_at from public.transactions order by created_at desc limit 100
    ) x),'[]'::jsonb),
    'payment_requests',coalesce((select jsonb_agg(x) from (
      select id,user_id,request_type,amount,reference,status,admin_note,created_at,
             withdrawal_method,provider_status,provider_reference,provider_error,provider_fee,provider_total
      from public.bouspam_money_requests where status='pending' order by created_at asc limit 100
    ) x),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.bouspam_admin_dashboard() from public, anon;
grant execute on function public.bouspam_admin_dashboard() to authenticated;

-- Pa gen DROP TABLE, DROP TRIGGER, ni chanjman sou fonksyon/triggers referans yo nan fichye sa a.
