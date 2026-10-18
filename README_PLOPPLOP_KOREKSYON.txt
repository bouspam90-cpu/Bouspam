KOREKSYON PLOP PLOP — PAKÈ BOUSPAM

URL SIT / RETOU
- Itilize https://bouspam.pages.dev/ sèlman.
- Pa itilize GitHub Pages.
- Mete https://bouspam.pages.dev/ kòm lien_retour / Return URL nan kont machann PLOP PLOP la.

CLOUDFLARE PAGES — VARIABLES / SECRETS (PRODUCTION)
- SUPABASE_URL = URL pwojè Supabase ou a.
- SUPABASE_ANON_KEY = publishable/anon key Supabase la.
- SUPABASE_SERVICE_ROLE_KEY = service role key Supabase la (Make as Secret).
- BOUSPAM_PAYMENT_CLIENT_ID = pp_jxxg1p174dj.
- BOUSPAM_PAYMENT_CLIENT_SECRET = kle sekrè 64 karaktè a (Make as Secret).
Apre ou mete oswa modifye yo, redeplwaye sit la.

SQL
- BOUSPAM_SQL_PLOPPLOP_AKTIVASYON.sql: nouvo migrasyon ki nesesè pou verifye epi finalize peman aktivasyon 500 HTG.
- BOUSPAM_MONEY_ADMIN.sql: bezwen pou sistèm demann depo/retrè ak admin; kouri sèlman si li poko enstale.
- BOUSPAM_REMAINING_FIXES.sql: limit esè jwèt gratis; kouri sèlman si li poko enstale.
- Pa relanse SQL referans/admin jwèt yo san nesesite; pa efase oswa ranplase fonksyon/triggers referans ki deja la.

PEMAN AKTIVASYON
- API kreye tranzaksyon an sou /api/paiement-marchand.
- Peman ki bezwen paj peman an dwe retounen yon lyen HTTPS; sit la redirije sou lyen sa a.
- Pou moncash_ussd/natcash_ussd, url ka null; kliyan an swiv enstriksyon telefòn nan epi BOUSPAM verifye tranzaksyon an.
- BOUSPAM verifye /api/paiement-verify; se sèlman trans_status = ok ak montan 500 HTG ki aktive kont lan.
- Referans tranzaksyon an anrejistre nan Supabase anvan apèl founisè a, pou tranzaksyon yo rete trasab.

RETRÈ OTOMATIK
- Se administratè ki dwe lanse retrè a nan panel admin lan.
- Mete BOUSPAM_PAYMENT_CLIENT_SECRET kòm Secret nan Cloudflare. Pa janm mete li nan frontend oswa voye li nan chat.
- API a mande otantifikasyon, siyati HMAC-SHA256, withdrawal_token, epi egzekisyon retrè a.
- Retrè minimòm: 255 HTG. Nimewo reseptè: 509XXXXXXXX. Metòd: NatCash oswa MonCash.
- Yon retrè ka voye lajan reyèl. Verifye montan/nimewo a anvan ou konfime.

LIMIT AK TÈS
- Pake sa a pa kapab verifye aksè merchant la oswa fè yon peman reyèl san deplwaman ak sekrè Cloudflare yo.
- Apre deplwaman, teste an premye ak yon kont ak montan kontwole. Verifye panel admin, aktivasyon, retou peman, balans machann, epi retrè.
- Sistèm depo nan ekran bous la toujou se demann depo pou revizyon admin; li pa otomatikman kredite bous la atravè API peman sa a.


KOREKSYON RETOU V2
- Sove id_transaction PLOP PLOP nan transactions.provider_transaction_id.
- Retou ki gen refference_id oswa id_transaction sèlman kapab lanse verifikasyon an; API backend la jwenn tranzaksyon ki pou itilizatè konekte a.
- SQL migrasyon an ajoute provider_transaction_id ak provider_status si yo poko egziste.
