-- BOUSPAM ADMIN + JEU + REFERANS: PATCH SEKIRIZE
-- Kouri fichye sa a nan Supabase SQL Editor apre ou fin verifye pwojè a.
-- Li pa aktive NatCash ni li pa verifye peman 500 HTG otomatikman.

create table if not exists public.bouspam_site_settings (
  id integer primary key default 1 check (id = 1),
  games_enabled boolean not null default true,
  activation_fee numeric(12,2) not null default 500 check (activation_fee = 500),
  withdrawal_minimum numeric(12,2) not null default 255 check (withdrawal_minimum >= 255),
  site_message text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.bouspam_site_settings add column if not exists activation_fee numeric(12,2) not null default 500;
alter table public.bouspam_site_settings add column if not exists withdrawal_minimum numeric(12,2) not null default 255;
alter table public.bouspam_site_settings add column if not exists site_message text not null default '';
update public.bouspam_site_settings set activation_fee = 500 where activation_fee <> 500;
update public.bouspam_site_settings set withdrawal_minimum = greatest(withdrawal_minimum,255);
insert into public.bouspam_site_settings (id, games_enabled, activation_fee, withdrawal_minimum, site_message)
values (1, true, 500, 255, '') on conflict (id) do nothing;

-- Bay chak tranzaksyon yon id UUID si ansyen tab la pa t genyen li.
-- Sa pèmèt admin trete yon tranzaksyon espesifik san li pa manyen lòt liy.
alter table public.transactions add column if not exists id uuid default gen_random_uuid();
update public.transactions set id = gen_random_uuid() where id is null;
alter table public.transactions alter column id set default gen_random_uuid();
alter table public.transactions alter column id set not null;
create unique index if not exists transactions_id_unique on public.transactions(id);
alter table public.bouspam_site_settings enable row level security;
revoke all on public.bouspam_site_settings from anon, authenticated;

-- Tout vizitè/kont ka li sèlman si jwèt yo louvri; yo pa ka chanje paramèt la.
create or replace function public.bouspam_games_status()
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select coalesce((select games_enabled from public.bouspam_site_settings where id = 1), true);
$$;
revoke all on function public.bouspam_games_status() from public;
grant execute on function public.bouspam_games_status() to anon, authenticated;

-- Kenbe limit 70 pwen/jou epi bloke bay pwen si administratè a fèmen jwèt yo.
create or replace function public.award_daily_game_points(p_points integer)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (now() at time zone 'America/Port-au-Prince')::date;
  v_current_points integer := 0;
  v_awarded integer := 0;
begin
  if v_user_id is null then raise exception 'Ou dwe konekte pou jwe.'; end if;
  if coalesce((select games_enabled from public.bouspam_site_settings where id = 1), true) is false then
    raise exception 'Jwèt yo fèmen tanporèman.';
  end if;
  if p_points is null or p_points < 1 or p_points > 70 then raise exception 'Kantite pwen pa valab.'; end if;
  insert into public.bouspam_daily_game_points (user_id, point_date, points)
  values (v_user_id, v_today, 0)
  on conflict (user_id, point_date) do nothing;
  select points into v_current_points from public.bouspam_daily_game_points
  where user_id = v_user_id and point_date = v_today for update;
  v_awarded := least(p_points, greatest(0, 70 - coalesce(v_current_points, 0)));
  update public.bouspam_daily_game_points
  set points = coalesce(v_current_points, 0) + v_awarded, updated_at = now()
  where user_id = v_user_id and point_date = v_today;
  return v_awarded;
end;
$$;
revoke all on function public.award_daily_game_points(integer) from public, anon;
grant execute on function public.award_daily_game_points(integer) to authenticated;


create or replace function public.bouspam_admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null or not exists (select 1 from public.admin_users au where au.user_id = auth.uid()) then
    return jsonb_build_object('is_admin', false);
  end if;
  select jsonb_build_object(
    'is_admin', true,
    'stats', jsonb_build_object(
      'members', (select count(*) from public.profiles),
      'activated', (select count(*) from public.profiles where is_activated = true),
      'pending_referrals', (select count(*) from public.referrals where status = 'pending'),
      'transactions', (select count(*) from public.transactions)
    ),
    'settings', (select jsonb_build_object('games_enabled', coalesce(s.games_enabled, true), 'activation_fee', s.activation_fee, 'withdrawal_minimum', s.withdrawal_minimum, 'site_message', s.site_message) from public.bouspam_site_settings s where s.id = 1),
    'members', coalesce((select jsonb_agg(x) from (
      select id, username, full_name, is_activated, created_at from public.profiles order by created_at desc limit 100
    ) x), '[]'::jsonb),
    'referrals', coalesce((select jsonb_agg(x) from (
      select id, referrer_id, referred_id, status, created_at from public.referrals order by created_at desc limit 100
    ) x), '[]'::jsonb),
    'transactions', coalesce((select jsonb_agg(x) from (
      select id, user_id, type, amount, status, reference, created_at from public.transactions order by created_at desc limit 100
    ) x), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.bouspam_admin_dashboard() from public, anon;
grant execute on function public.bouspam_admin_dashboard() to authenticated;

create or replace function public.bouspam_admin_set_games_enabled(p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not exists (select 1 from public.admin_users au where au.user_id = auth.uid()) then
    raise exception 'Ou pa gen otorizasyon administratè.';
  end if;
  insert into public.bouspam_site_settings (id, games_enabled, updated_at)
  values (1, coalesce(p_enabled, true), now())
  on conflict (id) do update set games_enabled = excluded.games_enabled, updated_at = now();
  return true;
end;
$$;
revoke all on function public.bouspam_admin_set_games_enabled(boolean) from public, anon;
grant execute on function public.bouspam_admin_set_games_enabled(boolean) to authenticated;

-- Ranfòse fonksyon validasyon ki deja egziste a: kont moun ki envite a dwe aktive.
create or replace function public.validate_referral(p_referral_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_referred_id uuid;
  v_is_activated boolean;
begin
  if auth.uid() is null or not exists (select 1 from public.admin_users au where au.user_id = auth.uid()) then
    raise exception 'Ou pa gen otorizasyon pou valide referans.';
  end if;
  select r.referred_id into v_referred_id
  from public.referrals r
  where r.id = p_referral_id and r.status = 'pending'
  for update;
  if v_referred_id is null then
    raise exception 'Referans lan pa egziste oswa li pa annatant.';
  end if;
  select p.is_activated into v_is_activated
  from public.profiles p where p.id = v_referred_id;
  if coalesce(v_is_activated, false) is not true then
    raise exception 'Ou pa ka valide referans sa a: kont moun nan poko aktive.';
  end if;
  update public.referrals set status = 'validated', validated_at = now()
  where id = p_referral_id and status = 'pending';
end;
$$;
revoke all on function public.validate_referral(uuid) from public, anon;
grant execute on function public.validate_referral(uuid) to authenticated;


-- TRANZAKSYON BOUSPAM: depo, aktivasyon, retrè ak aksyon administratè.
-- Tout aksyon finansye pase nan fonksyon SECURITY DEFINER sa yo; kliyan an pa ka modifye balans dirèkteman.
create or replace function public.bouspam_request_money_action(p_type text, p_amount numeric, p_reference text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_min numeric := 255;
  v_activated boolean := false;
begin
  if v_user is null then raise exception 'Ou dwe konekte.'; end if;
  if p_type not in ('activation','deposit','withdrawal') then raise exception 'Kalite demann lan pa valab.'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Kantite lajan an pa valab.'; end if;
  if p_type in ('activation','deposit') and exists (select 1 from public.transactions where type=p_type and reference=trim(p_reference) and status in ('pending','completed')) then raise exception 'Referans peman sa a deja itilize.'; end if;
  if p_reference is null or length(trim(p_reference)) < 3 or length(trim(p_reference)) > 120 then raise exception 'Mete yon referans tranzaksyon oswa nimewo NatCash ki valab.'; end if;
  select withdrawal_minimum into v_min from public.bouspam_site_settings where id=1;
  select coalesce(is_activated,false) into v_activated from public.profiles where id=v_user;
  if p_type = 'activation' then
    if coalesce(v_activated,false) then raise exception 'Kont ou deja aktive.'; end if;
    if p_amount <> 500 then raise exception 'Frè aktivasyon an se 500 HTG.'; end if;
  elsif p_type = 'deposit' then
    if p_amount < 50 or p_amount > 1000000 then raise exception 'Kantite depo a dwe ant 50 ak 1,000,000 HTG.'; end if;
  elsif p_type = 'withdrawal' then
    if not coalesce(v_activated,false) then raise exception 'Ou dwe aktive kont ou anvan ou mande retrè.'; end if;
    if p_amount < coalesce(v_min,255) or p_amount > 1000000 then raise exception 'Kantite a pi ba pase minimòm retrè a oswa li twò wo.'; end if;
    if not exists (select 1 from public.wallets where user_id=v_user and balance >= p_amount) then raise exception 'Balans ou pa ase pou retrè sa a.'; end if;
    if exists (select 1 from public.transactions where user_id=v_user and type='withdrawal' and status='pending') then raise exception 'Ou deja gen yon demann retrè annatant.'; end if;
  end if;
  insert into public.transactions(user_id,type,amount,status,reference,created_at)
  values (v_user,p_type,p_amount,'pending',trim(p_reference),now()) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.bouspam_request_money_action(text,numeric,text) from public, anon;
grant execute on function public.bouspam_request_money_action(text,numeric,text) to authenticated;

create or replace function public.bouspam_admin_review_transaction(p_transaction_id uuid, p_decision text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tx public.transactions%rowtype;
  v_balance numeric;
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Aksè administratè sèlman.'; end if;
  if p_decision not in ('approve','reject') then raise exception 'Desizyon an pa valab.'; end if;
  select * into v_tx from public.transactions where id=p_transaction_id for update;
  if not found then raise exception 'Tranzaksyon an pa egziste.'; end if;
  if v_tx.status <> 'pending' then raise exception 'Tranzaksyon sa a deja trete.'; end if;
  if p_decision='reject' then
    update public.transactions set status='rejected' where id=p_transaction_id;
    return true;
  end if;
  if v_tx.type='activation' then
    if v_tx.amount <> 500 then raise exception 'Kantite aktivasyon an pa valab.'; end if;
    update public.profiles set is_activated=true where id=v_tx.user_id;
    if not found then raise exception 'Pwofil manm nan pa egziste.'; end if;
    update public.transactions set status='completed' where id=p_transaction_id;
  elsif v_tx.type='deposit' then
    insert into public.wallets(user_id,currency,balance,created_at)
    values(v_tx.user_id,'HTG',v_tx.amount,now())
    on conflict(user_id) do update set balance=coalesce(wallets.balance,0)+excluded.balance;
    update public.transactions set status='completed' where id=p_transaction_id;
  elsif v_tx.type='withdrawal' then
    select balance into v_balance from public.wallets where user_id=v_tx.user_id for update;
    if coalesce(v_balance,0) < v_tx.amount then raise exception 'Balans manm nan pa ase ankò; retrè a pa apwouve.'; end if;
    update public.wallets set balance=balance-v_tx.amount where user_id=v_tx.user_id;
    update public.transactions set status='completed' where id=p_transaction_id;
  else
    raise exception 'Kalite tranzaksyon sa a pa ka trete nan fonksyon sa a.';
  end if;
  return true;
end;
$$;
revoke all on function public.bouspam_admin_review_transaction(uuid,text) from public, anon;
grant execute on function public.bouspam_admin_review_transaction(uuid,text) to authenticated;

create or replace function public.bouspam_admin_save_site_settings(p_withdrawal_minimum numeric, p_site_message text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Aksè administratè sèlman.'; end if;
  if p_withdrawal_minimum is null or p_withdrawal_minimum < 255 or p_withdrawal_minimum > 100000 then raise exception 'Minimòm retrè a pa ka pi ba pase 255 HTG.'; end if;
  if length(coalesce(p_site_message,'')) > 240 then raise exception 'Mesaj sit la twò long.'; end if;
  insert into public.bouspam_site_settings(id,games_enabled,activation_fee,withdrawal_minimum,site_message,updated_at)
  values(1,true,500,p_withdrawal_minimum,coalesce(p_site_message,''),now())
  on conflict(id) do update set withdrawal_minimum=excluded.withdrawal_minimum,site_message=excluded.site_message,updated_at=now();
  return true;
end;
$$;
revoke all on function public.bouspam_admin_save_site_settings(numeric,text) from public, anon;
grant execute on function public.bouspam_admin_save_site_settings(numeric,text) to authenticated;


create or replace function public.bouspam_public_site_settings()
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'withdrawal_minimum', coalesce((select withdrawal_minimum from public.bouspam_site_settings where id=1),255),
    'site_message', coalesce((select site_message from public.bouspam_site_settings where id=1),'')
  );
$$;
revoke all on function public.bouspam_public_site_settings() from public;
grant execute on function public.bouspam_public_site_settings() to anon, authenticated;

-- RLS: manm yo ka li pwòp tranzaksyon, bous ak referans pa yo sèlman.
alter table public.transactions enable row level security;
alter table public.wallets enable row level security;
alter table public.referrals enable row level security;
revoke insert, update, delete on public.transactions from anon, authenticated;
revoke insert, update, delete on public.wallets from anon, authenticated;
grant select on public.transactions, public.wallets, public.referrals to authenticated;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='transactions' and policyname='bouspam_users_read_own_transactions') then
    create policy bouspam_users_read_own_transactions on public.transactions for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='wallets' and policyname='bouspam_users_read_own_wallet') then
    create policy bouspam_users_read_own_wallet on public.wallets for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='referrals' and policyname='bouspam_users_read_own_referrals') then
    create policy bouspam_users_read_own_referrals on public.referrals for select to authenticated using (referrer_id = auth.uid() or referred_id = auth.uid());
  end if;
end $$;
