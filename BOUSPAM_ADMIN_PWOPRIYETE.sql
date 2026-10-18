-- BOUSPAM: bay kont pwopriyetè a aksè administratè
-- Egzekite fichye sa a nan Supabase SQL Editor APRÈ BOUSPAM_ADMIN_JEUX_REFERENCES.sql ak BOUSPAM_MONEY_ADMIN.sql.
-- UUID sa a se ID kont admin itilizatè a te bay nan etap anvan yo.
-- Sa pa kreye ni chanje modpas la; li sèlman bay kont sa a dwa admin.

insert into public.admin_users (user_id)
values ('1d48ebd3-1964-4dbd-8836-54dc9223a892'::uuid)
on conflict (user_id) do nothing;
