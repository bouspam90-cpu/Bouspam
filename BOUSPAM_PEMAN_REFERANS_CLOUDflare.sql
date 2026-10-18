-- BOUSPAM: KONFIMASYON PEMAN AKTIVASYON 500 HTG
-- Vèsyon san destriksyon: li pa efase oswa ranplase trigger/fonksyon referans ki deja egziste.
-- Cloudflare verifye peman an bò kote founisè a anvan li rele fonksyon sa a.

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
    if v_transaction_status = 'completed' then
        return true;
    end if;
    if v_transaction_status <> 'pending' then
        raise exception 'Tranzaksyon sa a pa annatant.';
    end if;

    perform 1 from public.profiles where id = p_user_id for update;
    if not found then
        raise exception 'Pwofil manm nan pa jwenn.';
    end if;

    update public.profiles set is_activated = true where id = p_user_id;
    -- Frè aktivasyon an se pou kont machann/admin; li pa dwe rete nan bous manm nan.
    insert into public.wallets(user_id,currency,balance,created_at) values(p_user_id,'HTG',0,now()) on conflict(user_id) do update set balance=0;
    update public.transactions set status = 'completed' where id = v_transaction_id;
    return true;
end;
$$;

revoke all on function public.bouspam_confirm_activation_payment(uuid, text, numeric)
from public, anon, authenticated;
grant execute on function public.bouspam_confirm_activation_payment(uuid, text, numeric)
to service_role;

-- Remak: fonksyon register_referral, validate_referral, pay_referral_commission ak triggers referans yo pa manyen isit la.
