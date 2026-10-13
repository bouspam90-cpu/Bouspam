BOUSPAM — Vèsyon konekte ak Supabase (etap inisyal)

Fichye yo:
- index.html, style.css: entèfas sit la
- app.js: enskripsyon/koneksyon Supabase Auth ak lekti bous/istorik
- supabase-config.js: Project URL ak publishable key
- admin.html/admin.js: ansyen panel demonstrasyon lokal sèlman

ENPÒTAN:
1. Apre telechaje, mete tout fichye yo nan rasin depo GitHub la, ranplase fichye ki gen menm non yo.
2. Nan Supabase Auth, mete URL sit GitHub Pages la nan Site URL ak Redirect URLs si verifikasyon imèl aktive.
3. Règ RLS yo dwe verifye. Itilizatè yo gen dwa li pwòp bous/tranzaksyon yo sèlman. Pa ajoute politik ki pèmèt navigatè modifye balans oswa konfime tranzaksyon.
4. Si trigger on_auth_user_created la kreye profiles/wallets otomatikman, nouvo kont yo ta dwe jwenn bous 0 HTG. Tès sou yon kont ou kontwole anvan itilizasyon piblik.
5. Panel admin la toujou DEMO lokal; li pa sekirize pou pwodiksyon. Pa sèvi avè l pou jere kont reyèl.
6. Peman 500 HTG, retrè 255 HTG, NatCash, verifikasyon tranzaksyon, wòl admin sou sèvè, pwoteksyon kont abi ak pwosesis rekiperasyon kont poko aplike.
7. Pa janm mete service_role/secret key oswa modpas bazdone nan fichye piblik.

Supabase config nan fichye a itilize publishable key sèlman.
