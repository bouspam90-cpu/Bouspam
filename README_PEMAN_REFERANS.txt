BOUSPAM — PEMAN, REFERANS AK RETRÈ OTOMATIK

Pati aktivasyon:
- Frè aktivasyon an se 500 HTG.
- Cloudflare Pages Functions itilize /api/payment-create ak /api/payment-verify.
- Kont lan aktive sèlman apre PaymPlopPlop konfime peman an.
- Supabase function bouspam_confirm_activation_payment la dwe deja egziste.

Pati referans:
- Fonksyon/triggers referans ki egziste nan bazdone a pa ranplase nan pake sa a.
- Kenbe règ ki valide referans sou bò sèvè a ak règ komisyon ki deja an plas.

Pati retrè:
- Itilizatè a mande retrè epi chwazi NatCash oswa MonCash.
- Balans HTG a rezève lè demann retrè a fèt, pou li pa ka depanse menm lajan an de fwa.
- Admin la ka refize demann nan; montan rezève a retounen nan bous manm nan.
- Lè admin la lanse retrè otomatik la, Cloudflare otantifye machann lan, siyen payload HMAC-SHA256 la ak client_secret la, mande withdrawal_token epi rele /api/withdraw/marchand.
- Si founisè a retounen pending, panel admin lan ka relanse verifikasyon pou menm referans lan; li pa dwe lanse yon lòt peman pandan premye a annatant.
- Se sèlman estati success founisè a ki finalize retrè a kòm approved.
- API secret la dwe rete nan Cloudflare Secret BOUSPAM_PAYMENT_CLIENT_SECRET. Pa mete l nan fichye piblik.

SQL pou pati lajan/admin:
- Kouri BOUSPAM_MONEY_ADMIN.sql nan Supabase SQL Editor.
- Kouri BOUSPAM_REMAINING_FIXES.sql si limit esè jwèt gratis yo poko enstale.
- Pa kouri SQL ki retire trigger oswa fonksyon referans san verifye yo.

Jwèt:
- Se Woulet BOUSPAM ak Secret Box sèlman ki jwèt lajan.
- Lòt jwèt yo se jwèt gratis ki bay pwen jwèt.
- Pwen jwèt yo pa konekte ak balans HTG a.
- Woulet ak Secret Box rete fèmen jiskaske rezilta/miz/rekonpans yo verifye epi regle sou sèvè a; pa aktive yo ak frontend sèlman.
