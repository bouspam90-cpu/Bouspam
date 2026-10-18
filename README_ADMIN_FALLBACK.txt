BOUSPAM — FALLBACK ADMIN POU PEMAN KI PA KONFIME PA API

Kisa fallback la fè
1. BOUSPAM kreye yon referans lokal epi anrejistre aktivasyon 500 HTG kòm pending anvan li rele PLOP PLOP.
2. Si API a pa reponn oswa li pa bay konfimasyon klè, tranzaksyon an rete pending. Sit la montre referans lan epi mande manm nan pa repete peman an.
3. Nan admin.html, tranzaksyon activation 500 HTG ki pending yo montre bouton “Konfime apre verifikasyon”. Admin dwe tcheke kont machann PLOP PLOP oswa verifye peman manyèl la anvan li peze bouton an.
4. Bouton an rele functions/api/admin-activation-review.js. Endpoint la verifye sesyon an ak admin_users, verifye se tranzaksyon activation 500 HTG ki pending, epi rele RPC aktivasyon an. RPC a mete kont lan aktive epi mete balans manm nan a 0 HTG.

Limit enpòtan
- Fallback sa a pa fè API a voye lajan si founisè a pa bay aksè. Li pèmèt admin verifye peman ki antre nan kont machann li oswa peman li resevwa manyèlman.
- Pa janm peze “Konfime apre verifikasyon” jis paske API a bay erè. Verifye lajan an antre toutbon anvan.
- Depo nan fòm bous la rete demann pou revizyon admin; li pa otomatikman kredite bous la atravè API aktivasyon an.
- Retrè otomatik rete depann de otorizasyon API PLOP PLOP, kle Secret Cloudflare yo ak tès sou kont machann lan.

Apre mete dosye yo sou GitHub/Cloudflare:
- Kenbe functions/api/ nan rasin pwojè a.
- Nan Supabase SQL Editor, relanse BOUSPAM_MONEY_ADMIN.sql pou admin dashboard la enkli transactions.id. Script la sèvi ak CREATE OR REPLACE epi ADD COLUMN IF NOT EXISTS; pa efase tab oswa done.
- Verifye SUPABASE_SERVICE_ROLE_KEY ak BOUSPAM_PAYMENT_CLIENT_SECRET se Cloudflare Secrets, pa fichye piblik.
