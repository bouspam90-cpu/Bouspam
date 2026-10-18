-- BOUSPAM + PLOP PLOP: SQL pou verifikasyon peman aktivasyon 500 HTG
-- Script idempotan: li pa efase tab, done, trigger, oswa fonksyon referans.
-- Kouri nan Supabase SQL Editor. Se Cloudflare Pages Functions ki rele RPC sa a
-- sèlman apre yo fin verifye tranzaksyon an dirèkteman sou API PLOP PLOP la.

begin;

-- Kolòn sa yo ajoute sèlman si yo pa egziste deja.
alter table public.transactions
  add column if not exists reference text;

alter table public.transactions
  add column if not exists status text default 'pending';

alter table public.transactions
  add column if not exists provider_transaction_id text;

alter table public.transactions
  add column if not exists provider_status text;

alter table public.profiles
  add column if not exists is_activated boolean not null default false;

create index if not exists bouspam_transactions_reference_idx
  on public.transactions(reference)
  where reference is not null;

create index if not exists bouspam_transactions_provider_transaction_id_idx
  on public.transactions(provider_transaction_id)
  where provider_transaction_id is not null;

create or replace function public.bouspam_confirm_activation_payment(
    p_user_id uuid,
    p_reference text,
    p_amount numeric
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_transaction_id uuid;
    v_transaction_status text;
begin
    -- Se Cloudflare ki dwe rele fonksyon sa a avèk service_role.
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Backend peman sèlman.';
    end if;

    if p_user_id is null or nullif(trim(p_reference), '') is null then
        raise exception 'Enfòmasyon peman an pa konplè.';
    end if;

    if p_amount is distinct from 500 then
        raise exception 'Montan aktivasyon an dwe egzakteman 500 HTG.';
    end if;

    select id, status
      into v_transaction_id, v_transaction_status
      from public.transactions
     where user_id = p_user_id
       and type = 'activation'
       and reference = trim(p_reference)
       and amount = 500
     for update;

    if v_transaction_id is null then
        raise exception 'Tranzaksyon aktivasyon sa a pa jwenn.';
    end if;

    -- Si demann lan deja finalize, pa trete li yon dezyèm fwa.
    if lower(coalesce(v_transaction_status, '')) in ('completed', 'approved', 'success') then
        return true;
    end if;

    if lower(coalesce(v_transaction_status, '')) <> 'pending' then
        raise exception 'Tranzaksyon sa a pa annatant.';
    end if;

    perform 1 from public.profiles where id = p_user_id for update;
    if not found then
        raise exception 'Pwofil manm nan pa jwenn.';
    end if;

    update public.profiles
       set is_activated = true
     where id = p_user_id;

    -- Frè aktivasyon an se pou kont machann/admin; bous manm nan kòmanse a 0 HTG.
    insert into public.wallets(user_id,currency,balance,created_at) values(p_user_id,'HTG',0,now()) on conflict(user_id) do update set balance=0;

    update public.transactions
       set status = 'completed'
     where id = v_transaction_id;

    return true;
end;
$$;

revoke all on function public.bouspam_confirm_activation_payment(uuid, text, numeric)
  from public, anon, authenticated;
grant execute on function public.bouspam_confirm_activation_payment(uuid, text, numeric)
  to service_role;

commit;

-- ENPÒTAN:
-- 1) Pa mete BOUSPAM_PAYMENT_CLIENT_SECRET oswa SUPABASE_SERVICE_ROLE_KEY nan SQL sa a,
--    nan HTML, ni nan app.js. Mete yo kòm Secrets nan Cloudflare Pages.
-- 2) Peman aktivasyon an rete 500 HTG. Kont lan aktive sèlman lè trans_status = 'ok'
--    sou API PLOP PLOP la epi montan verifye a se egzakteman 500 HTG.
-- 3) Script sa a pa konfigire URL retou nan kont PLOP PLOP la. Mete
--    https://bouspam.pages.dev/ nan paramèt URL retou kont machann nan.
