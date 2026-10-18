BOUSPAM — PAKÈ KONPLÈ POU CLOUDFLARE PAGES

ENPÒTAN
- ZIP sa a se yon pake konplè pou deplwaman; louvri ZIP la epi mete tout sa ki anndan Bouspam-main kòm root pwojè a, pou index.html rete nan root.
- Sa pa deplwaye sit la otomatikman. Apre ou fin telechaje fichye yo, Cloudflare dwe montre dènye deployment lan kòm Success.
- Pa mete okenn secret nan HTML, app.js, admin.js, kòd ki vizib piblikman oswa nan chat.

ENVIRONMENT VARIABLES / SECRETS NAN CLOUDFLARE PAGES
Mete yo nan Settings > Variables and Secrets (Production), apre sa redeplwaye sit la pou fonksyon yo pran nouvo valè yo:
- SUPABASE_URL = URL pwojè Supabase la
- SUPABASE_ANON_KEY = publishable key Supabase la
- SUPABASE_SERVICE_ROLE_KEY = service role key Supabase la (Make as Secret)
- BOUSPAM_PAYMENT_CLIENT_ID = ID machann PLOP PLOP la (opsyonèl paske ID ou a deja antre kòm valè pa defo nan fonksyon backend la; ou ka mete li kòm Variable tou: pp_jxxg1p174dj)
- BOUSPAM_PAYMENT_CLIENT_SECRET = secret machann PLOP PLOP la, 64 karaktè (Make as Secret; obligatwa pou retrè otomatik)

URL RETOU PLOP PLOP (ENPÒTAN)
- Sou kont machann PLOP PLOP la, nan paramèt API/Paiement kote yo mande « lien_retour », « URL de retour » oswa « Return URL », mete: https://bouspam.pages.dev/
- Se nan paramèt kont machann nan pou anrejistre URL sa a. Dokiman API paiement-marchand la pa bay yon chan return_url nan kò demann lan, kidonk pa ajoute yon fo chan nan JSON API a.
- Apre peman an, sit la sèvi ak id_transaction/refference_id ki retounen nan URL la pou verifye tranzaksyon an sou backend la.
- Enpòtan: /api/payment-create ak /api/payment-verify se Cloudflare Pages Functions. Yo pap mache sou GitHub Pages estatik. Deplwaye tout kontni ZIP la kòm pwojè Cloudflare Pages pou API sa yo egziste.

API RETRÈ OTOMATIK
- Admin la dwe konekte ak yon kont ki prezan nan public.admin_users.
- Panel admin lan ka chèche solde total/solde disponib machann lan.
- Lè admin la peze “Voye otomatikman” sou yon demann retrè, Cloudflare fè otantifikasyon machann, kalkile HMAC-SHA256, mande withdrawal_token, epi rele API retrè a.
- Si API a di pending, sistèm lan verifye menm referans lan anvan li ta lanse yon lòt tantativ.
- Bous manm nan rezève montan an depi demann retrè a fèt. Lè API a konfime success, demann lan make approved epi tranzaksyon an anrejistre. Si admin la refize demann lan, montan rezève a retounen nan bous la.
- API retrè a sèvi ak NatCash oswa MonCash. Nimewo destinatè a dwe nan fòma 509XXXXXXXX.
- Pa teste retrè reyèl ak lajan ou pa pare pou voye. Tès final dwe fèt ak yon montan ki apwopriye ak sèvis machann lan.

SQL NAN SUPABASE
- BOUSPAM_MONEY_ADMIN.sql: tab/fonksyon pou demann depo, rezèv balans, retrè otomatik, solde machann atravè Cloudflare ak panel admin.
- BOUSPAM_REMAINING_FIXES.sql: limit 2 esè pa jou pou jwèt gratis yo; vèsyon sa a gen 11 jwèt gratis epi konsève ansyen konte esè yo.
- BOUSPAM_ADMIN_JEUX_REFERENCES.sql ak BOUSPAM_PEMAN_REFERANS_CLOUDflare.sql gen lòt fonksyon administrasyon/referans ki deja egziste. Pa kouri yo ankò san nesesite; yo pa dwe ranplase fonksyon/triggers referans ou yo san verifikasyon.
- Kouri BOUSPAM_SQL_PLOPPLOP_AKTIVASYON.sql pou enstale fonksyon bouspam_confirm_activation_payment la si li poko la. Cloudflare verifye peman PLOP PLOP la anvan li rele fonksyon sa a.

JWÈT
- Se Woulet BOUSPAM ak Bwat sekrè sèlman ki prevwa pou miz 50 oswa 100 HTG. XO/Tic-Tac-Toe, Wòch/Papye/Sizo, Kat mistè, Objè kache ak lòt jwèt yo gratis epi bay pwen jwèt sèlman. Pwen jwèt yo apa ak bous HTG a; yo pa lajan epi yo pa ka retire.
- ENPÒTAN: backend pou jwèt ki mande miz la poko valide nèt sou sèvè a. Pa lanse miz reyèl nan Woulet oswa Bwat sekrè jiskaske fonksyon ki verifye rezilta, debi miz ak finalize rekonpans lan devlope, enstale epi teste. API retrè pa ranplase backend jwèt la.

TÈS KI DWE FÈT APRÈ SQL AK DEPLOY
1. Konekte kòm admin epi verifye panel admin lan chaje.
2. Peze “Récupérer le solde” pou verifye koneksyon PLOP PLOP.
3. Sou yon kont tès aktive, soumèt yon demann retrè ki respekte minimòm 255 HTG ak nimewo 509XXXXXXXX.
4. Nan panel admin lan, verifye metòd/nimewo a anvan ou lanse retrè otomatik la.
5. Verifye estati success/pending/failed epi verifye balans bous manm nan.
6. Teste depo, aktivasyon 500 HTG, referans, tout jwèt gratis yo, limit esè yo, epi paramèt admin yo.

Pa gen tès live oswa deployment ki fèt pa dokiman sa a pou kont li.


KOREKSYON PEMAN
- Kòd backend la sèvi ak ID machann PLOP PLOP pp_jxxg1p174dj si BOUSPAM_PAYMENT_CLIENT_ID pa mete nan Cloudflare. Ou ka toujou mete menm ID a kòm Variable nan anviwònman Production.
- Lè PLOP PLOP refize demann lan, backend la montre mesaj erè founisè a si li bay youn, san li pa ekspoze okenn kle sekrè.
- Chanjman sa yo pa ranplase nesesite pou mete vrè ID machann nan ak teste sou kont PLOP PLOP la.


KOREKSYON RETOU V2
- Sove id_transaction PLOP PLOP nan transactions.provider_transaction_id.
- Retou ki gen refference_id oswa id_transaction sèlman kapab lanse verifikasyon an; API backend la jwenn tranzaksyon ki pou itilizatè konekte a.
- SQL migrasyon an ajoute provider_transaction_id ak provider_status si yo poko egziste.
