-- BOUSPAM: 2 esè pa jou pou chak jwèt gratis (san efase ansyen tab yo).
-- Kouri fichye sa a nan Supabase SQL Editor anvan deplwaman.
create table if not exists public.bouspam_game_daily_trials_v3 (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_code text not null,
  play_date date not null,
  attempts integer not null default 0 check (attempts >= 0 and attempts <= 2),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_code, play_date),
  constraint bouspam_game_daily_trials_v3_game_code_check check (game_code in ('number','quiz','word','daily','riddle','race','friends'))
);
alter table public.bouspam_game_daily_trials_v3 enable row level security;
revoke all on public.bouspam_game_daily_trials_v3 from anon, authenticated;
insert into public.bouspam_game_daily_trials_v3(user_id,game_code,play_date,attempts,updated_at)
select user_id,game_code,play_date,least(attempts,2),updated_at from public.bouspam_game_daily_trials_v2
where game_code in ('number','quiz','word','daily','riddle','race','friends')
on conflict(user_id,game_code,play_date) do update set attempts=greatest(public.bouspam_game_daily_trials_v3.attempts,excluded.attempts), updated_at=greatest(public.bouspam_game_daily_trials_v3.updated_at,excluded.updated_at);
create or replace function public.bouspam_start_free_game_trial(p_game_code text) returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_today date := (now() at time zone 'America/Port-au-Prince')::date; v_attempts integer;
begin
 if v_user is null then raise exception 'Konekte pou jwe.'; end if;
 if p_game_code not in ('number','quiz','word','daily','riddle','race','friends') then raise exception 'Jwèt sa a pa nan kategori jwèt gratis.'; end if;
 if coalesce((select games_enabled from public.bouspam_site_settings where id=1), true) is false then raise exception 'Jwèt yo fèmen tanporèman.'; end if;
 insert into public.bouspam_game_daily_trials_v3(user_id,game_code,play_date,attempts) values(v_user,p_game_code,v_today,0) on conflict(user_id,game_code,play_date) do nothing;
 select attempts into v_attempts from public.bouspam_game_daily_trials_v3 where user_id=v_user and game_code=p_game_code and play_date=v_today for update;
 if coalesce(v_attempts,0) >= 2 then raise exception 'Ou fini 2 esè gratis ou yo pou jwèt sa a jodi a.'; end if;
 update public.bouspam_game_daily_trials_v3 set attempts=attempts+1,updated_at=now() where user_id=v_user and game_code=p_game_code and play_date=v_today returning attempts into v_attempts;
 return greatest(0,2-v_attempts);
end; $$;
revoke all on function public.bouspam_start_free_game_trial(text) from public, anon;
grant execute on function public.bouspam_start_free_game_trial(text) to authenticated;
