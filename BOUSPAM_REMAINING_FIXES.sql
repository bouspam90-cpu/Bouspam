-- BOUSPAM: ESÈ CHAK JOU POU JWÈT GRATIS
-- Vèsyon san destriksyon: itilize yon nouvo tab pou ajoute lòt jwèt gratis san efase ansyen tab la.
-- Kouri nan Supabase SQL Editor si limit 3 esè/jou poko aktive.

create table if not exists public.bouspam_game_daily_trials (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_code text not null,
  play_date date not null,
  attempts integer not null default 0 check (attempts >= 0 and attempts <= 3),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_code, play_date),
  check (game_code in ('number','quiz','word','daily','riddle','race','friends'))
);
alter table public.bouspam_game_daily_trials enable row level security;
revoke all on public.bouspam_game_daily_trials from anon, authenticated;

create table if not exists public.bouspam_game_daily_trials_v2 (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_code text not null,
  play_date date not null,
  attempts integer not null default 0 check (attempts >= 0 and attempts <= 3),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_code, play_date),
  check (game_code in ('number','quiz','word','daily','riddle','race','friends','tictactoe','rps','cards','hidden'))
);

alter table public.bouspam_game_daily_trials_v2 enable row level security;
revoke all on public.bouspam_game_daily_trials_v2 from anon, authenticated;

-- Konsève konte esè ki te deja anrejistre pou ansyen jwèt gratis yo.
insert into public.bouspam_game_daily_trials_v2(user_id,game_code,play_date,attempts,updated_at)
select user_id,game_code,play_date,attempts,updated_at
from public.bouspam_game_daily_trials
where game_code in ('number','quiz','word','daily','riddle','race','friends')
on conflict(user_id,game_code,play_date) do update
set attempts=greatest(public.bouspam_game_daily_trials_v2.attempts,excluded.attempts),
    updated_at=greatest(public.bouspam_game_daily_trials_v2.updated_at,excluded.updated_at);

create or replace function public.bouspam_start_free_game_trial(p_game_code text)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'America/Port-au-Prince')::date;
  v_attempts integer;
begin
  if v_user is null then raise exception 'Konekte pou jwe.'; end if;
  if p_game_code not in ('number','quiz','word','daily','riddle','race','friends','tictactoe','rps','cards','hidden') then
    raise exception 'Jwèt sa a pa nan kategori jwèt gratis.';
  end if;
  if coalesce((select games_enabled from public.bouspam_site_settings where id=1), true) is false then
    raise exception 'Jwèt yo fèmen tanporèman.';
  end if;
  insert into public.bouspam_game_daily_trials_v2(user_id,game_code,play_date,attempts)
  values(v_user,p_game_code,v_today,0)
  on conflict(user_id,game_code,play_date) do nothing;
  select attempts into v_attempts
  from public.bouspam_game_daily_trials_v2
  where user_id=v_user and game_code=p_game_code and play_date=v_today
  for update;
  if coalesce(v_attempts,0) >= 3 then
    raise exception 'Ou fini 3 esè gratis ou yo pou jwèt sa a jodi a.';
  end if;
  update public.bouspam_game_daily_trials_v2
  set attempts=attempts+1, updated_at=now()
  where user_id=v_user and game_code=p_game_code and play_date=v_today
  returning attempts into v_attempts;
  return greatest(0,3-v_attempts);
end;
$$;
revoke all on function public.bouspam_start_free_game_trial(text) from public, anon;
grant execute on function public.bouspam_start_free_game_trial(text) to authenticated;
