-- BOUSPAM: KONVÈSYON PWEN AN HTG (500 pwen = 100 HTG)
-- Migrasyon idempotan: pa efase done oswa règ RLS ki deja egziste.
-- Kouri nan Supabase SQL Editor anvan aktive bouton konvèsyon an sou sit la.

create table if not exists public.bouspam_point_conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_key text not null,
  points integer not null check (points > 0 and points % 500 = 0),
  amount_htg numeric(12,2) not null check (amount_htg = (points::numeric / 5)),
  status text not null default 'completed' check (status in ('completed')),
  created_at timestamptz not null default now(),
  unique(user_id, request_key)
);
alter table public.bouspam_point_conversions enable row level security;
revoke all on public.bouspam_point_conversions from anon, authenticated;

create or replace function public.bouspam_convert_points(p_points integer, p_request_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_key text := trim(coalesce(p_request_key,''));
  v_existing public.bouspam_point_conversions%rowtype;
  v_row record;
  v_total integer := 0;
  v_remaining integer;
  v_take integer;
  v_amount numeric(12,2);
  v_conversion_id uuid;
begin
  if v_uid is null then raise exception 'Konekte sou kont ou anvan konvèsyon.'; end if;
  if p_points is null or p_points < 500 or p_points % 500 <> 0 or p_points > 1000000 then
    raise exception 'Chwazi yon kantite pwen ki miltip 500.';
  end if;
  if length(v_key) < 8 or length(v_key) > 120 then raise exception 'Kle demann konvèsyon an pa valab.'; end if;
  if not exists(select 1 from public.profiles where id=v_uid and is_activated=true) then
    raise exception 'Ou dwe aktive kont ou anvan ou konvèti pwen.';
  end if;

  -- Retry ak menm kle a pa bay dezyèm kredi.
  select * into v_existing from public.bouspam_point_conversions
   where user_id=v_uid and request_key=v_key;
  if found then
    return jsonb_build_object('ok',true,'already_processed',true,'points',v_existing.points,'amount_htg',v_existing.amount_htg,'conversion_id',v_existing.id);
  end if;

  -- Fèmen ranje pwen yo pou de konvèsyon an menm tan pa depanse menm pwen yo.
  perform 1 from public.bouspam_daily_game_points where user_id=v_uid for update;
  select coalesce(sum(points),0)::integer into v_total
    from public.bouspam_daily_game_points where user_id=v_uid;
  if v_total < p_points then raise exception 'Ou pa gen ase pwen. Pwen disponib: %.', v_total; end if;

  v_remaining := p_points;
  for v_row in
    select point_date, points from public.bouspam_daily_game_points
     where user_id=v_uid and points > 0 order by point_date asc
  loop
    exit when v_remaining <= 0;
    v_take := least(v_remaining, v_row.points);
    update public.bouspam_daily_game_points
       set points=points-v_take, updated_at=now()
     where user_id=v_uid and point_date=v_row.point_date;
    v_remaining := v_remaining-v_take;
  end loop;

  v_amount := p_points::numeric / 5; -- 500 points = 100 HTG
  insert into public.bouspam_point_conversions(user_id,request_key,points,amount_htg)
  values(v_uid,v_key,p_points,v_amount) returning id into v_conversion_id;

  insert into public.wallets(user_id,currency,balance,created_at)
  values(v_uid,'HTG',v_amount,now())
  on conflict(user_id) do update set balance=coalesce(public.wallets.balance,0)+excluded.balance;

  insert into public.transactions(user_id,type,amount,status,reference,created_at)
  values(v_uid,'point_conversion',v_amount,'completed','POINTCONV:'||v_key,now());

  return jsonb_build_object('ok',true,'already_processed',false,'points',p_points,'amount_htg',v_amount,'conversion_id',v_conversion_id);
end;
$$;
revoke all on function public.bouspam_convert_points(integer,text) from public, anon;
grant execute on function public.bouspam_convert_points(integer,text) to authenticated;
