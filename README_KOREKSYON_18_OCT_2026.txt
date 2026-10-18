BOUSPAM — KOREKSYON KONT, JWÈT, REFERANS AK KONVÈSYON

Baz travay: BOUSPAM-KONT-AKTIVE-DEPO-RETRE-PI-BEL.zip
Sit: https://bouspam.pages.dev/

KOREKSYON KI NAN PAKÈ SA A
- Kenbe paj, logo, navigasyon, sipò, Supabase Auth ak fonksyon Cloudflare Pages ki te deja nan pwojè a.
- Tèks referans lan kounye a di 255 HTG pou chak referans valide, lè kont moun envite a aktive.
- Paj jwèt la klase 6 jwèt kòm jwèt ak miz (50/100 HTG) ak 7 jwèt gratis; chak jwèt gratis gen 2 esè pa jou.
- Ajoute entèfas konvèsyon pwen: 500 pwen = 100 HTG.
- Ajoute BOUSPAM_POINTS_CONVERSION.sql pou konvèsyon an fèt bò Supabase, avèk verrouillage ak kle idempotans pou evite double kredi.
- Ajoute reset bous manm nan a 0 HTG nan fonksyon konfimasyon aktivasyon ki nan de fichye SQL peman yo. Frè aktivasyon an pa antre nan bous manm nan.

ETAP OBLIGATWA NAN SUPABASE
1. Louvri Supabase > SQL Editor.
2. Revize epi egzekite BOUSPAM_POINTS_CONVERSION.sql pou kreye RPC konvèsyon pwen an.
3. Egzekite vèsyon korije fonksyon bouspam_confirm_activation_payment la nan BOUSPAM_PEMAN_REFERANS_CLOUDflare.sql (oswa BOUSPAM_SQL_PLOPPLOP_AKTIVASYON.sql). Pa egzekite de fichye yo youn apre lòt si w pa bezwen yo; toude defini menm fonksyon an.
4. Pa efase tab oswa règ RLS ki deja la. Fichye sa yo pa mande pou w kole kle sekrè nan SQL.

SEKIRITE / SA KI PA DWE SIPOZE
- Pa mete SUPABASE_SERVICE_ROLE_KEY oswa BOUSPAM_PAYMENT_CLIENT_SECRET nan HTML, app.js oswa depo GitHub.
- Depo ak retrè ki pase atravè API a dwe toujou konfime pa founisè a epi trete bò sèvè.
- Kat lòt jwèt ak miz yo make nan entèfas la, men pa pran miz reyèl pou yo jiskaske RPC backend ki valide rezilta ak peman rekonpans yo enstale epi teste. Kòd aktyèl la fèmen aksyon miz la olye li fè fo debi.
- Konvèsyon pwen an pa ap mache sou bazdone a jiskaske migrasyon BOUSPAM_POINTS_CONVERSION.sql egzekite.
- Pa gen okenn chanjman ki fèt dirèkteman sou kont Cloudflare/GitHub/Supabase ou nan pakè sa a.
