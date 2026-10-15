-- BOUSPAM ADMIN + JEU + REFERANS: PATCH SEKIRIZE
-- Kouri fichye sa a nan Supabase SQL Editor apre ou fin verifye pwojè a.
-- Li pa aktive NatCash ni li pa verifye peman 500 HTG otomatikman.

create table if not exists public.bouspam_site_settings (
  id integer primary key default 1 check (id = 1),
  games_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.bouspam_site_settings (id, games_enabled)
values (1, true) on conflict (id) do nothing;
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
    'settings', (select jsonb_build_object('games_enabled', coalesce(s.games_enabled, true)) from public.bouspam_site_settings s where s.id = 1),
    'members', coalesce((select jsonb_agg(x) from (
      select id, username, full_name, is_activated, created_at from public.profiles order by created_at desc limit 100
    ) x), '[]'::jsonb),
    'referrals', coalesce((select jsonb_agg(x) from (
      select id, referrer_id, referred_id, status, created_at from public.referrals where status = 'pending' order by created_at asc limit 100
    ) x), '[]'::jsonb),
    'transactions', coalesce((select jsonb_agg(x) from (
      select user_id, type, amount, status, reference, created_at from public.transactions order by created_at desc limit 100
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
