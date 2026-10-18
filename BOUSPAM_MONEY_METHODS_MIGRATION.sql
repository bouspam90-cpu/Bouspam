-- BOUSPAM: Pèmèt demann depo yo anrejistre metòd NatCash oswa MonCash.
-- Script sa a pa efase tab oswa done. Kouri li nan Supabase SQL Editor.
begin;

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

commit;

-- Apre script sa a, demann depo NatCash/MonCash yo montre metòd la nan panel admin.
-- Depo yo toujou rete annatant jiskaske administratè a verifye referans lan epi apwouve li.
