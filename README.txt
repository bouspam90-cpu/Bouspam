BOUSPAM — VÈSYON KONEKTE AK SUPABASE + CLOUDFLARE PAGES

Fichye prensipal yo:
- index.html, style.css, pages.css, bouspam-4pages.css: aparans sit la
- app.js: enskripsyon/koneksyon, kont, peman aktivasyon, referans ak jwèt
- supabase-config.js: URL pwojè ak publishable key Supabase sèlman
- admin.html/admin.js: panel administratè ki verifye dwa admin nan Supabase
- functions/api/: Cloudflare Pages Functions pou peman ak retrè otomatik
- BOUSPAM_MONEY_ADMIN.sql: demann depo/retrè, rezèv balans ak finalizasyon retrè API
- BOUSPAM_REMAINING_FIXES.sql: limit esè jwèt gratis yo

KONFIGIRASYON:
1. Mete tout fichye sa yo nan root Cloudflare Pages; index.html dwe dirèkteman nan root.
2. Mete SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, BOUSPAM_PAYMENT_CLIENT_ID ak BOUSPAM_PAYMENT_CLIENT_SECRET nan Settings > Variables and Secrets. Service role ak client secret dwe Make as Secret.
3. Kouri BOUSPAM_MONEY_ADMIN.sql nan Supabase SQL Editor. Kouri BOUSPAM_REMAINING_FIXES.sql si limit esè jwèt gratis yo poko enstale.
4. Pa mete service_role key oswa client_secret nan okenn fichye frontend.
5. Teste login, admin, aktivasyon, depo, retrè ak jwèt yo avan lansman. Pa sipoze yon tès reyèl reyisi san ou pa wè rezilta API a.

Jwèt lajan yo: Woulet BOUSPAM ak Secret Box sèlman; yo rete fèmen jiskaske rezilta ak settlement verifye sou sèvè. Lòt jwèt yo sèvi ak pwen jwèt.

6. Kouri BOUSPAM_SQL_PLOPPLOP_AKTIVASYON.sql pou fonksyon konfimasyon peman aktivasyon an, si li poko enstale.
