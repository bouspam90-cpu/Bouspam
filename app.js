const $ = (s) => document.querySelector(s);
const panels = ["register", "login"];
const supabaseReady = Boolean(
  window.supabase &&
  window.BOUSPAM_SUPABASE_URL &&
  window.BOUSPAM_SUPABASE_PUBLISHABLE_KEY
);
const db = supabaseReady
  ? window.supabase.createClient(
      window.BOUSPAM_SUPABASE_URL,
      window.BOUSPAM_SUPABASE_PUBLISHABLE_KEY
    )
  : null;
let currentUser = null;

/* ----------------- LANG BOUSPAM: Kreyòl, Français, English ----------------- */
const LANGUAGES = ["ht", "fr", "en"];
const LANG_LABELS = { ht: "HT ▾", fr: "FR ▾", en: "EN ▾" };
const UI_TRANSLATIONS = {
  ht: {
    "header tagline":"Bous ou, nan men ou",
    "hero eyebrow":"BYENVINI SOU BOUSPAM",
    "hero h1":"Jere lajan w<br><span>pi fasil.</span>",
    "hero p":"Yon espas senp pou swiv balans ou, tranzaksyon ou yo ak demann retrè ou.",
     "create account":"Kreye kont", "login":"Konekte", "register button":"Kreye kont", "login button":"Konekte",
    "referral link label":"Lyen referans pèsonèl ou", "footer brand":"BOUSPAM",
    "balance card":"Balans BOUSPAM", "card bottom":"Kont ou, kontwòl ou",
    "payment title":"Peman", "withdraw title":"Retrè", "security title":"Sekirite",
    "activation feature":"Aktivasyon kont: <b>500 HTG</b>",
    "withdraw feature":"Retrè minimòm: <b>255 HTG</b>",
    "security feature":"Aksè kont ak pwoteksyon done.",
    "register eyebrow":"KÒMANSE KOUNYE A","register title":"Kreye kont ou",
    "name label":"Non konplè","email label":"Imèl","phone label":"Nimewo telefòn (+509, opsyonèl)",
    "password label":"Modpas (omwen 8 karaktè)","referral label":"Kòd referans (si ou genyen)",
    "register note":"Kont lan ap kreye atravè Supabase. Si verifikasyon imèl aktive, verifye imèl ou anvan ou konekte.",
    "login eyebrow":"BON RETOU","login title":"Konekte sou kont ou",
    "password login label":"Modpas","login note":"Koneksyon sa a sèvi ak Supabase Auth.",
    "dashboard eyebrow":"ESPAS OU","logout":"Dekonekte","available balance":"Balans disponib",
    "activate":"Aktive kont · 500 HTG","withdraw":"Mande retrè",
    "natcash notice":"NatCash: Entegrasyon peman an poko aktive. Pa gen tranzaksyon reyèl ki fèt nan vèsyon sa a.",
    "invite title":"🔗 Envite zanmi ou","invite desc":"Pataje lyen referans ou pou envite nouvo manm sou BOUSPAM.",
    "referral link label":"Lyen referans pèsonèl ou","copy link":"Kopye lyen an",
    "referral promo":"💰 Règ Referans: 255 HTG pu referans yo tout. Otan ou envite plis zanmi ki aktive, se plis kòb ou ka touche ak BOUSPAM!",
    "share referral":"📲 PATAJE LYEN REFERANS MWEN",
    "games eyebrow":"PLEZI AK DEFI","games title":"🎮 Jwèt BOUSPAM",
    "games desc":"Jwe, fè defi, epi ranmase pwen jwèt.",
    "games warning":"Pwen sa yo se pwen jwèt sèlman. Yo pa HTG, yo pa ka retire, epi yo pa konekte ak bous la nan vèsyon sa a.",
    "game roulette":"Woulet BOUSPAM","game number":"Devinèt nimewo","game quiz":"Kesyon entèlijans",
    "game tictactoe":"Tic-Tac-Toe","game word":"Devinèt mo","game rps":"Wòch, papye, sizo",
    "game daily":"Defi chak jou","game cards":"Kat mistè","game box":"Bwat sipriz",
    "game hidden":"Chèche objè kache","game riddle":"Devinèt rapid","game race":"Kous kont tan",
     "game friends":"Defi ant zanmi",
    "desc roulette":"Vire pou genyen pwen","desc number":"Devine nimewo a","desc quiz":"Teste konesans ou",
    "desc tictactoe":"Jwe kont òdinatè","desc word":"Devine mo a","desc rps":"Defi òdinatè a",
    "desc daily":"Yon defi pa jou","desc cards":"Chwazi yon kat","desc box":"Ouvri yon bwat",
    "desc hidden":"Jwenn senbòl la","desc riddle":"Rezoud devinèt la","desc race":"Reponn vit","desc friends":"Kreye yon defi",
    "recent activity":"Dènye aktivite",
    "empty activity":"Pa gen tranzaksyon verifye pou kounye a.",
    "admin title":"Administrasyon prive","admin desc":"Panel administratè a dwe pwoteje ak otantifikasyon ak verifikasyon dwa aksè.",
    "footer":"© 2026 · Tout dwa rezève"
  },
  fr: {
    "header tagline":"Votre portefeuille, entre vos mains",
    "hero eyebrow":"BIENVENUE SUR BOUSPAM",
    "hero h1":"Gérez votre argent<br><span>plus facilement.</span>",
    "hero p":"Un espace simple pour suivre votre solde, vos transactions et vos demandes de retrait.",
     "create account":"Créer un compte", "login":"Se connecter", "register button":"Créer un compte", "login button":"Se connecter",
    "referral link label":"Votre lien de parrainage personnel", "footer brand":"BOUSPAM",
    "balance card":"Solde BOUSPAM", "card bottom":"Votre compte, votre contrôle",
    "payment title":"Paiement", "withdraw title":"Retrait", "security title":"Sécurité",
    "activation feature":"Activation du compte : <b>500 HTG</b>",
    "withdraw feature":"Retrait minimum : <b>255 HTG</b>",
    "security feature":"Accès au compte et protection des données.",
    "register eyebrow":"COMMENCEZ MAINTENANT","register title":"Créer votre compte",
    "name label":"Nom complet","email label":"E-mail","phone label":"Téléphone (+509, facultatif)",
    "password label":"Mot de passe (8 caractères minimum)","referral label":"Code de parrainage (facultatif)",
    "register note":"Le compte est créé via Supabase. Si la vérification par e-mail est activée, vérifiez votre e-mail avant de vous connecter.",
    "login eyebrow":"BON RETOUR","login title":"Connectez-vous à votre compte",
    "password login label":"Mot de passe","login note":"La connexion utilise Supabase Auth.",
    "dashboard eyebrow":"VOTRE ESPACE","logout":"Se déconnecter","available balance":"Solde disponible",
    "activate":"Activer le compte · 500 HTG","withdraw":"Demander un retrait",
    "natcash notice":"NatCash : l’intégration des paiements n’est pas encore activée. Aucune transaction réelle n’est effectuée dans cette version.",
    "invite title":"🔗 Invitez vos amis","invite desc":"Partagez votre lien de parrainage pour inviter de nouveaux membres sur BOUSPAM.",
    "referral link label":"Votre lien de parrainage personnel","copy link":"Copier le lien",
    "referral promo":"💰 Règle de parrainage : 255 HTG pour les parrainages. Plus vous invitez d’amis dont le compte est activé, plus vous pouvez gagner avec BOUSPAM !",
    "share referral":"📲 PARTAGER MON LIEN DE PARRAINAGE",
    "games eyebrow":"JEUX ET DÉFIS","games title":"🎮 Jeux BOUSPAM",
    "games desc":"Jouez, relevez des défis et gagnez des points de jeu.",
    "games warning":"Ces points sont uniquement des points de jeu. Ils ne sont pas en HTG, ne peuvent pas être retirés et ne sont pas reliés au portefeuille dans cette version.",
    "game roulette":"Roue BOUSPAM","game number":"Devinette numérique","game quiz":"Quiz de connaissances",
    "game tictactoe":"Morpion","game word":"Devinette de mots","game rps":"Pierre, papier, ciseaux",
    "game daily":"Défi quotidien","game cards":"Cartes mystère","game box":"Boîte surprise",
    "game hidden":"Objet caché","game riddle":"Énigme rapide","game race":"Course contre la montre",
     "game friends":"Défi entre amis",
    "desc roulette":"Tournez pour gagner des points","desc number":"Devinez le nombre","desc quiz":"Testez vos connaissances",
    "desc tictactoe":"Jouez contre l’ordinateur","desc word":"Devinez le mot","desc rps":"Défiez l’ordinateur",
    "desc daily":"Un défi par jour","desc cards":"Choisissez une carte","desc box":"Ouvrez une boîte",
    "desc hidden":"Trouvez le symbole","desc riddle":"Résolvez l’énigme","desc race":"Répondez vite","desc friends":"Créez un défi",
    "recent activity":"Activité récente",
    "empty activity":"Aucune transaction vérifiée pour le moment.",
    "admin title":"Administration privée","admin desc":"Le panneau d’administration doit être protégé par une authentification et une vérification des autorisations.",
    "footer":"© 2026 · Tous droits réservés"
  },
  en: {
    "header tagline":"Your wallet, in your hands",
    "hero eyebrow":"WELCOME TO BOUSPAM",
    "hero h1":"Manage your money<br><span>more easily.</span>",
    "hero p":"A simple space to track your balance, transactions, and withdrawal requests.",
     "create account":"Create account", "login":"Log in", "register button":"Create account", "login button":"Log in",
    "referral link label":"Your personal referral link", "footer brand":"BOUSPAM",
    "balance card":"BOUSPAM balance", "card bottom":"Your account, your control",
    "payment title":"Payments", "withdraw title":"Withdrawals", "security title":"Security",
    "activation feature":"Account activation: <b>500 HTG</b>",
    "withdraw feature":"Minimum withdrawal: <b>255 HTG</b>",
    "security feature":"Account access and data protection.",
    "register eyebrow":"GET STARTED","register title":"Create your account",
    "name label":"Full name","email label":"Email","phone label":"Phone (+509, optional)",
    "password label":"Password (at least 8 characters)","referral label":"Referral code (optional)",
    "register note":"Your account is created through Supabase. If email verification is enabled, verify your email before logging in.",
    "login eyebrow":"WELCOME BACK","login title":"Log in to your account",
    "password login label":"Password","login note":"This login uses Supabase Auth.",
    "dashboard eyebrow":"YOUR SPACE","logout":"Log out","available balance":"Available balance",
    "activate":"Activate account · 500 HTG","withdraw":"Request withdrawal",
    "natcash notice":"NatCash: payment integration is not active yet. No real transactions take place in this version.",
    "invite title":"🔗 Invite your friends","invite desc":"Share your referral link to invite new members to BOUSPAM.",
    "referral link label":"Your personal referral link","copy link":"Copy link",
    "referral promo":"💰 Referral rule: 255 HTG for referrals. The more friends you invite who activate their accounts, the more you can earn with BOUSPAM!",
    "share referral":"📲 SHARE MY REFERRAL LINK",
    "games eyebrow":"FUN AND CHALLENGES","games title":"🎮 BOUSPAM Games",
    "games desc":"Play challenges and collect game points.",
    "games warning":"These are game points only. They are not HTG, cannot be withdrawn, and are not connected to the wallet in this version.",
    "game roulette":"BOUSPAM Wheel","game number":"Number Guess","game quiz":"Knowledge Quiz",
    "game tictactoe":"Tic-Tac-Toe","game word":"Word Puzzle","game rps":"Rock, Paper, Scissors",
    "game daily":"Daily Challenge","game cards":"Mystery Cards","game box":"Surprise Box",
    "game hidden":"Find the Hidden Object","game riddle":"Quick Riddle","game race":"Race Against Time",
     "game friends":"Challenge a Friend",
    "desc roulette":"Spin to win points","desc number":"Guess the number","desc quiz":"Test your knowledge",
    "desc tictactoe":"Play against the computer","desc word":"Guess the word","desc rps":"Challenge the computer",
    "desc daily":"One challenge per day","desc cards":"Choose a card","desc box":"Open a box",
    "desc hidden":"Find the symbol","desc riddle":"Solve the riddle","desc race":"Answer quickly","desc friends":"Create a challenge",
    "recent activity":"Recent activity",
    "empty activity":"No verified transactions yet.",
    "admin title":"Private administration","admin desc":"The admin panel must be protected by authentication and access checks.",
    "footer":"© 2026 · All rights reserved"
  }
};
const LANGUAGE_SELECTORS = {
  "header tagline":".brand small",
  "hero eyebrow":"#welcome .eyebrow",
  "hero p":"#welcome .hero-copy p",
  "create account":"#welcome [data-create-account]",
  "login":"#welcome [data-open='login']",
  "balance card":".hero-card .card-top span:first-child",
  "card bottom":".hero-card .card-bottom span:first-child",
  "payment title":".features article:nth-child(1) h3",
  "withdraw title":".features article:nth-child(2) h3",
  "security title":".features article:nth-child(3) h3",
  "activation feature":".features article:nth-child(1) p",
  "withdraw feature":".features article:nth-child(2) p",
  "security feature":".features article:nth-child(3) p",
  "register eyebrow":"#register .eyebrow",
  "register title":"#register h2",
  "register note":"#register .form-note",
  "login eyebrow":"#login .eyebrow",
  "login title":"#login h2",
  "login note":"#login .form-note",
  "dashboard eyebrow":"#dashboard .dash-heading .eyebrow",
  "logout":"#logout",
  "available balance":".balance-card > span:first-child",
  "activate":"#activateBtn",
  "withdraw":"#withdrawBtn",
  "natcash notice":"#dashboard > .notice",
  "invite title":"#referralSection h3",
  "invite desc":"#referralSection > p",
   "copy link":"#copyReferralBtn",
  "referral link label":"label[for='referralLink']",
  "register button":"#registerForm button[type='submit']",
  "login button":"#loginForm button[type='submit']",
  "footer brand":"footer b",
  "referral promo":"#referralSection .referral-promo",
  "share referral":"#shareReferralBtn",
  "games eyebrow":"#gamesSection .eyebrow",
  "games title":"#gamesSection h2",
  "games desc":"#gamesSection .games-heading p",
  "games warning":"#gamesSection .games-warning",
  "game roulette":"[data-game='roulette'] b",
  "game number":"[data-game='number'] b",
  "game quiz":"[data-game='quiz'] b",
  "game tictactoe":"[data-game='tictactoe'] b",
  "game word":"[data-game='word'] b",
  "game rps":"[data-game='rps'] b",
  "game daily":"[data-game='daily'] b",
  "game cards":"[data-game='cards'] b",
  "game box":"[data-game='box'] b",
  "game hidden":"[data-game='hidden'] b",
  "game riddle":"[data-game='riddle'] b",
  "game race":"[data-game='race'] b",
   "game friends":"[data-game='friends'] b",
  "desc roulette":"[data-game='roulette'] small",
  "desc number":"[data-game='number'] small",
  "desc quiz":"[data-game='quiz'] small",
  "desc tictactoe":"[data-game='tictactoe'] small",
  "desc word":"[data-game='word'] small",
  "desc rps":"[data-game='rps'] small",
  "desc daily":"[data-game='daily'] small",
  "desc cards":"[data-game='cards'] small",
  "desc box":"[data-game='box'] small",
  "desc hidden":"[data-game='hidden'] small",
  "desc riddle":"[data-game='riddle'] small",
  "desc race":"[data-game='race'] small",
  "desc friends":"[data-game='friends'] small",
  "recent activity":"#dashboard > h3",
  "empty activity":"#activity",
  "admin title":"#adminInfo b",
  "admin desc":"#adminInfo p"
};
function currentLanguage() {
  try { return localStorage.getItem("bouspam_language") || "ht"; } catch (_) { return "ht"; }
}
function setFirstLabelText(selector, value) {
  const label = document.querySelector(selector);
  if (!label) return;
  const textNode = [...label.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  if (textNode) textNode.textContent = value + " ";
}
function applyLanguage(lang) {
  if (!LANGUAGES.includes(lang)) lang = "ht";
  document.documentElement.lang = lang;
  const dict = UI_TRANSLATIONS[lang];
  for (const [key, selector] of Object.entries(LANGUAGE_SELECTORS)) {
    const el = document.querySelector(selector);
    if (!el) continue;
    if (key === "hero eyebrow") el.textContent = dict[key];
    else if (key === "hero h1") el.innerHTML = dict[key];
    else if (["activation feature","withdraw feature"].includes(key)) el.innerHTML = dict[key];
    else el.textContent = dict[key] || "";
  }
  const h1 = document.querySelector("#welcome .hero-copy h1");
  if (h1) h1.innerHTML = dict["hero h1"];
  const labels = {
    "name label":"#register label:nth-of-type(1)",
    "email label":"#register label:nth-of-type(2)",
    "phone label":"#register label:nth-of-type(3)",
    "password label":"#register label:nth-of-type(4)",
    "referral label":"#register label:nth-of-type(5)",
    "password login label":"#login label:nth-of-type(2)"
  };
  for (const [key, selector] of Object.entries(labels)) setFirstLabelText(selector, dict[key]);
  const emailLabel = document.querySelector("#login label:nth-of-type(1)");
  if (emailLabel) setFirstLabelText("#login label:nth-of-type(1)", dict["email label"]);
  const placeholders = {
    "#register input[name='name']": {ht:"Antre non ou",fr:"Entrez votre nom",en:"Enter your name"},
    "#register input[name='email']": {ht:"ou@example.com",fr:"vous@example.com",en:"you@example.com"},
    "#register input[name='phone']": {ht:"509XXXXXXXX",fr:"509XXXXXXXX",en:"509XXXXXXXX"},
    "#register input[name='password']": {ht:"Kreye yon modpas solid",fr:"Créez un mot de passe solide",en:"Create a strong password"},
    "#register input[name='referral']": {ht:"Kòd referans",fr:"Code de parrainage",en:"Referral code"},
    "#login input[name='email']": {ht:"Imèl kont ou",fr:"E-mail de votre compte",en:"Your account email"},
    "#login input[name='password']": {ht:"Modpas ou",fr:"Votre mot de passe",en:"Your password"},
    "#referralLink": {ht:"Lyen referans ou ap parèt la",fr:"Votre lien apparaîtra ici",en:"Your referral link will appear here"}
  };
  for (const [selector, values] of Object.entries(placeholders)) {
    const el = document.querySelector(selector);
    if (el) el.placeholder = values[lang];
  }
  const btn = $("#langBtn");
  if (btn) { btn.textContent = LANG_LABELS[lang]; btn.setAttribute("aria-label", lang==="ht"?"Chanje lang":lang==="fr"?"Changer de langue":"Change language"); }
  try { localStorage.setItem("bouspam_language", lang); } catch (_) {}
}
function translateToastKey(key) { return UI_TRANSLATIONS[currentLanguage()][key] || key; }
function cycleLanguage() {
  const current = currentLanguage();
  const next = LANGUAGES[(LANGUAGES.indexOf(current) + 1) % LANGUAGES.length];
  applyLanguage(next);
  const messages = {ht:"Lang lan chanje.",fr:"La langue a été changée.",en:"Language changed."};
  toast(messages[next]);
}

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 4500);
}
function showPanel(id) {
  panels.forEach((p) => {
    const panel = $("#" + p);
    if (panel) panel.classList.toggle("hidden", p !== id);
  });
  $("#dashboard")?.classList.add("hidden");
  $("#" + id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}
document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => showPanel(button.dataset.open));
});

// Bouton navigasyon anba yo: kenbe paj kont lan pwoteje ak koneksyon.
document.querySelectorAll("[data-bottom-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.bottomNav;
    document.querySelectorAll("[data-bottom-nav]").forEach(item => item.classList.toggle("is-active", item === button));
    if (target === "home") {
      document.querySelector("#welcome")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!currentUser) {
      showPanel("login");
      document.querySelector("#login")?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof toast === "function") toast("Konekte sou kont ou pou antre nan espas sa a.");
      return;
    }
    document.querySelector("#dashboard")?.classList.remove("hidden");
    const destination = target === "games" ? "#gamesSection" : "#dashboard";
    document.querySelector(destination)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => button.closest("section")?.classList.add("hidden"));
});
function setSignedOutView() {
  currentUser = null;
  panels.forEach((p) => $("#" + p)?.classList.add("hidden"));
  $("#dashboard")?.classList.add("hidden");
  $("#welcome")?.classList.remove("hidden");
  $(".features")?.classList.remove("hidden");
  $("#adminInfo")?.classList.remove("hidden");
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}
function isValidUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || "").trim());
}
function extractReferrerId(value) {
  const input = String(value || "").trim();
  if (isValidUUID(input)) return input;
  try {
    const url = new URL(input);
    const ref = url.searchParams.get("ref");
    if (ref && isValidUUID(ref)) return ref;
  } catch (_) {}
  return null;
}
function updateReferralLink(user, isActivated) {
  const input = $("#referralLink");
  const message = $("#referralMessage");
  const button = $("#copyReferralBtn");
  if (!input || !user) return;
  input.value = "";
  if (!isActivated) {
    if (button) button.disabled = true;
    if (message) message.textContent = ({ht:"🔒 Ou dwe aktive kont ou avèk 500 HTG anvan ou jwenn aksè ak lyen referans ou.",fr:"🔒 Activez votre compte avec 500 HTG pour accéder à votre lien de parrainage.",en:"🔒 Activate your account with 500 HTG to access your referral link."})[currentLanguage()];
    return;
  }
  const url = new URL(window.location.href);
  url.search = ""; url.hash = ""; url.searchParams.set("ref", user.id);
  input.value = url.toString();
  if (button) button.disabled = false;
  if (message) message.textContent = "Lyen referans ou pare. Ou kapab kopye li epi pataje li.";
}
async function processReferral(user) {
  if (!db || !user) return;
  const referrerId = extractReferrerId(user.user_metadata?.referrer_id);
  if (!referrerId) return;
  if (referrerId.toLowerCase() === user.id.toLowerCase()) {
    toast("Ou pa kapab itilize pwòp lyen referans ou."); return;
  }
  const { error } = await db.rpc("register_referral", { p_referrer_id: referrerId });
  if (error) {
    console.error("Erè referans:", error.message);
    toast("Referans lan poko anrejistre. Li ka deja anrejistre oswa gen yon pwoblèm nan sistèm nan.");
    return;
  }
  const { error: updateError } = await db.auth.updateUser({ data: { referrer_id: null } });
  if (updateError) console.error("Referans anrejistre, men metadata a pa t ajou:", updateError.message);
  toast("Referans ou anrejistre avèk siksè!");
}
async function loadDashboard(user) {
  if (!db || !user) return;
  currentUser = user;
  panels.forEach((p) => $("#" + p)?.classList.add("hidden"));
  $("#welcome")?.classList.add("hidden");
  $(".features")?.classList.add("hidden");
  $("#adminInfo")?.classList.add("hidden");
  $("#dashboard")?.classList.remove("hidden");
  const meta = user.user_metadata || {};
  if ($("#userName")) $("#userName").textContent = meta.full_name || user.email || "zanmi";
  $("#balance").innerHTML = '— <small>HTG</small>';
  $("#activity").textContent = "Ap chaje aktivite…";
  const { data: profile, error: profileError } = await db.from("profiles").select("is_activated").eq("id", user.id).maybeSingle();
  const isActivated = !profileError && profile !== null && profile.is_activated === true;
  updateReferralLink(user, isActivated);
  const { data: wallet, error: walletError } = await db.from("wallets").select("balance,currency").eq("user_id", user.id).maybeSingle();
  if (walletError) {
    $("#balance").innerHTML = '0.00 <small>HTG</small>';
    $("#activity").textContent = "Nou pa kapab li bous la kounye a. Verifye koneksyon ak règ RLS yo nan Supabase.";
  } else if (wallet) {
    $("#balance").innerHTML = `${Number(wallet.balance).toFixed(2)} <small>${escapeHtml(wallet.currency || "HTG")}</small>`;
  }
  const { data: transactions, error: transactionError } = await db.from("transactions").select("type,amount,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
  if (!transactionError && transactions && transactions.length > 0) {
    $("#activity").classList.remove("empty");
    $("#activity").innerHTML = transactions.map((transaction) => `
      <div class="activity-row"><b>${escapeHtml(transaction.type)}</b> · ${Number(transaction.amount).toFixed(2)} HTG · ${escapeHtml(transaction.status)}
      <small>${new Date(transaction.created_at).toLocaleString()}</small></div>`).join("");
  } else if (!transactionError) {
    $("#activity").textContent = "Pa gen tranzaksyon verifye pou kounye a.";
  } else if (!walletError) {
    $("#activity").textContent = "Bous la chaje. Istwa tranzaksyon an poko disponib.";
  }
  $("#dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
  initGamesForUser(user.id);
}
$("#copyReferralBtn")?.addEventListener("click", async () => {
  const input = $("#referralLink"), message = $("#referralMessage");
  if (!input || !input.value) { toast("Lyen referans lan poko disponib."); return; }
  try { await navigator.clipboard.writeText(input.value); }
  catch (_) {
    input.focus(); input.select();
    if (!document.execCommand("copy")) { toast("Seleksyone lyen an epi kopye li manyèlman."); return; }
  }
  if (message) message.textContent = "Lyen an kopye! Ou kapab pataje li.";
  toast("Lyen referans lan kopye avèk siksè!");
});

$("#shareReferralBtn")?.addEventListener("click", async () => {
  const input = $("#referralLink");
  if (!input || !input.value) {
    const messages = {
      ht: "Konekte epi aktive kont ou pou jwenn lyen referans ou.",
      fr: "Connectez-vous et activez votre compte pour obtenir votre lien.",
      en: "Log in and activate your account to get your referral link."
    };
    toast(messages[currentLanguage()]);
    return;
  }
  const shareText = {
    ht: "Vin sou BOUSPAM! Konekte ak mwen epi dekouvri sèvis la: ",
    fr: "Rejoignez BOUSPAM avec mon lien : ",
    en: "Join BOUSPAM using my referral link: "
  }[currentLanguage()] + input.value;
  if (navigator.share) {
    try {
      await navigator.share({ title: "BOUSPAM", text: shareText, url: input.value });
      toast(({ht:"Lyen an pataje!",fr:"Lien partagé !",en:"Link shared!"})[currentLanguage()]);
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(input.value);
    toast(({ht:"Lyen an kopye. Ou ka kole li nan WhatsApp oswa Facebook.",fr:"Lien copié. Collez-le dans WhatsApp ou Facebook.",en:"Link copied. Paste it into WhatsApp or Facebook."})[currentLanguage()]);
  } catch (_) {
    input.focus(); input.select();
    toast(({ht:"Kopye lyen ki nan bwat la pou pataje li.",fr:"Copiez le lien affiché pour le partager.",en:"Copy the link shown to share it."})[currentLanguage()]);
  }
});

$("#registerForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db) { toast("Koneksyon Supabase pa pare. Verifye supabase-config.js."); return; }
  const form = new FormData(event.target);
  const name = String(form.get("name") || "").trim(), email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || ""), phone = String(form.get("phone") || "").trim();
  const params = new URLSearchParams(window.location.search);
  const urlReferrer = extractReferrerId(params.get("ref")), formReferrer = extractReferrerId(form.get("referral"));
  const userMetadata = { full_name: name, phone };
  const referrerId = urlReferrer || formReferrer;
  if (referrerId) userMetadata.referrer_id = referrerId;
  const submitButton = event.target.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const { data, error } = await db.auth.signUp({ email, password, options: { data: userMetadata } });
    if (error) { toast("Enskripsyon pa reyisi: " + error.message); return; }
    if (data.session && data.user) {
      await processReferral(data.user);
      toast("Kont ou kreye avèk siksè. N ap ouvri kont ou...");
      window.location.href = "index.html";
    } else {
      toast("Kont la kreye. Verifye imèl ou anvan ou konekte si yo mande sa.");
      event.target.reset();
      if (document.querySelector("#login")) showPanel("login");
      else setTimeout(() => { window.location.href = "index.html?open=login"; }, 1200);
    }
  } catch (error) {
    console.error("Erè enskripsyon:", error); toast("Yon erè rive pandan enskripsyon an. Eseye ankò.");
  } finally { if (submitButton) submitButton.disabled = false; }
});
$("#loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db) { toast("Koneksyon Supabase pa pare."); return; }
  const form = new FormData(event.target), email = String(form.get("email") || "").trim(), password = String(form.get("password") || "");
  const submitButton = event.target.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) { toast("Koneksyon pa reyisi: " + error.message); return; }
    await processReferral(data.user); await loadDashboard(data.user); toast("Ou konekte sou BOUSPAM.");
  } catch (error) {
    console.error("Erè koneksyon:", error); toast("Yon erè rive pandan koneksyon an.");
  } finally { if (submitButton) submitButton.disabled = false; }
});
$("#logout")?.addEventListener("click", async () => {
  if (db) {
    const { error } = await db.auth.signOut();
    if (error) { toast("Nou pa kapab dekonekte kounye a."); return; }
  }
  setSignedOutView(); toast("Ou dekonekte.");
});
$("#activateBtn")?.addEventListener("click", () => toast("Peman 500 HTG poko aktive. Pa voye lajan jiskaske peman ofisyèl ak verifikasyon yo konekte."));
$("#withdrawBtn")?.addEventListener("click", () => toast("Retrè minimòm 255 HTG poko aktive. Sistèm nan bezwen validasyon sou sèvè ak entegrasyon peman ofisyèl."));
$("#langBtn")?.addEventListener("click", cycleLanguage);
applyLanguage(currentLanguage());
const pageParams = new URLSearchParams(window.location.search);
if (pageParams.get("open") === "login" && document.querySelector("#login")) showPanel("login");
const createAccountLink = document.querySelector("[data-create-account]");
if (createAccountLink && pageParams.has("ref")) createAccountLink.href = "inscription.html?ref=" + encodeURIComponent(pageParams.get("ref"));
(async () => {
  if (!db) { toast("Konfigirasyon Supabase pa chaje."); return; }
  const { data, error } = await db.auth.getSession();
  if (error) { console.error("Erè sesyon:", error.message); return; }
  if (data.session) {
    if (location.pathname.toLowerCase().endsWith("inscription.html")) { window.location.replace("index.html"); return; }
    await loadDashboard(data.session.user);
  }
})();

/* ----------------- 13 JWÈT BOUSPAM: Pwen jwèt sèlman -----------------
   Remak: vèsyon pwototip la sere pwen nan navigatè a. Pa sèvi ak pwen sa yo
   pou peman oswa retrè; pou sa, fòk gen verifikasyon sou sèvè.
*/
const gameCatalog = {
  roulette: "🎡 Woulet BOUSPAM", number: "🎯 Devinèt nimewo", quiz: "🧠 Kesyon entèlijans",
  tictactoe: "❌⭕ Tic-Tac-Toe", word: "🔤 Devinèt mo", rps: "🪨📄✂️ Wòch, papye, sizo",
  daily: "🏆 Defi chak jou", cards: "🃏 Kat mistè", box: "🎁 Bwat sipriz",
  hidden: "🔎 Chèche objè kache", riddle: "🧩 Devinèt rapid", race: "⏱️ Kous kont tan",
  friends: "👥 Defi ant zanmi"
};
let gameUserKey = "guest";
let gamePoints = 0;
let numberTarget = 0;
let numberAttempts = 0;
let tttBoard = Array(9).fill("");
let raceTimer = null;
let raceSeconds = 10;
let raceQuestion = null;

function gameStorageKey() {
  const today = new Intl.DateTimeFormat("en-CA", {timeZone:"America/Port-au-Prince", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date());
  return "bouspam_game_points_" + gameUserKey + "_" + today;
}
async function initGamesForUser(userId) {
  gameUserKey = String(userId || "guest");
  gamePoints = 0;
  if (db && userId) {
    const today = new Intl.DateTimeFormat("en-CA", {timeZone:"America/Port-au-Prince", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date());
    const {data, error} = await db.from("bouspam_daily_game_points").select("points").eq("user_id", userId).eq("point_date", today).maybeSingle();
    if (!error && data) gamePoints = Number(data.points) || 0;
  }
  renderGamePoints();
}
function renderGamePoints() { document.querySelectorAll("#gamePoints, #gamePointsPill").forEach(el => el.textContent = String(gamePoints)); }
async function addGamePoints(amount, message) {
  const n = Math.max(0, Math.floor(Number(amount) || 0));
  if (!n) return;
  if (!db || !currentUser) {
    gameFeedback(({ht:"Konekte pou kolekte pwen yo.",fr:"Connectez-vous pour gagner des points.",en:"Log in to earn points."})[currentLanguage()]);
    return;
  }
  try {
    const {data, error} = await db.rpc("award_daily_game_points", {p_points:n});
    if (error) {
      console.error("Erè pwen jwèt:", error.message);
      gameFeedback(({ht:"Nou pa kapab anrejistre pwen yo kounye a.",fr:"Impossible d’enregistrer les points pour le moment.",en:"Could not save points right now."})[currentLanguage()]);
      return;
    }
    const awarded = Math.max(0, Number(data) || 0);
    gamePoints += awarded;
    renderGamePoints();
    if (awarded === 0) {
      gameFeedback(({ht:"Ou pa ka resevwa plis pwen pou kounye a.",fr:"Vous ne pouvez pas recevoir plus de points pour le moment.",en:"You cannot receive more points right now."})[currentLanguage()]);
    } else {
      gameFeedback((message || ({ht:"Ou genyen!",fr:"Gagné !",en:"You won!"})[currentLanguage()]) + " +" + awarded + " " + ({ht:"pwen.",fr:"points.",en:"points."})[currentLanguage()]);
      if (awarded < n) gameFeedback(({ht:"Pwen ou resevwa yo limite pou kounye a: "+awarded+" pwen.",fr:"Points reçus limités pour le moment : "+awarded+" points.",en:"Points awarded are limited for now: "+awarded+" points."}));
    }
  } catch (err) {
    console.error(err);
    gameFeedback(({ht:"Erè pandan anrejistreman pwen yo.",fr:"Erreur lors de l’enregistrement des points.",en:"Error saving points."})[currentLanguage()]);
  }
}
function gameFeedback(message) { const el = $("#gameFeedback"); if (el) el.textContent = message || ""; }
function showGame(id) {
  const panel = $("#gamePlay"), body = $("#gameBody");
  if (!panel || !body || !gameCatalog[id]) return;
  if (raceTimer) { clearInterval(raceTimer); raceTimer = null; }
  $("#gameTitle").textContent = gameCatalog[id];
  panel.classList.remove("hidden");
  body.innerHTML = "";
  gameFeedback("");
  const views = {
    roulette: () => {
      body.innerHTML = `<p>Peze bouton an pou vire woulet la. Chak vire bay pwen jwèt, pa lajan.</p><div class="roulette-wheel" aria-hidden="true">🎡</div><button class="btn primary" id="spinWheel">Vire woulet la</button>`;
      $("#spinWheel").onclick = () => { const prizes = [5, 10, 15, 20, 25, 30, 0, 10]; const prize = prizes[Math.floor(Math.random()*prizes.length)]; if (prize) addGamePoints(prize, "Woulet la tonbe sou pwen"); else gameFeedback("Bòn chans pwochen fwa! Ou pa pèdi okenn pwen."); };
    },
    number: () => {
      numberTarget = Math.floor(Math.random()*10)+1; numberAttempts = 0;
      body.innerHTML = `<p>Devine yon nimewo ant 1 ak 10. Ou gen 3 esè.</p><form id="numberForm" class="game-form"><input id="numberGuess" type="number" min="1" max="10" required placeholder="Nimewo 1–10"><button class="btn primary">Verifye</button></form>`;
      $("#numberForm").onsubmit = e => { e.preventDefault(); const guess = Number($("#numberGuess").value); numberAttempts++; if (guess === numberTarget) { addGamePoints(20, "Bon repons!"); $("#numberForm").innerHTML = `<button type="button" class="btn outline" id="againNumber">Jwe ankò</button>`; $("#againNumber").onclick = () => showGame("number"); } else if (numberAttempts >= 3) { gameFeedback("Nimewo a se " + numberTarget + ". Eseye ankò!"); $("#numberForm").innerHTML = `<button type="button" class="btn outline" id="againNumber">Jwe ankò</button>`; $("#againNumber").onclick = () => showGame("number"); } else gameFeedback(guess < numberTarget ? "Nimewo a pi wo. Eseye ankò." : "Nimewo a pi ba. Eseye ankò."); };
    },
    quiz: () => {
      const q = [{q:"Konbyen jou ki genyen nan yon semèn?",a:["5","7","10"],c:1},{q:"Ki planèt nou rete sou li?",a:["Mas","Latè","Venis"],c:1},{q:"Konbyen 6 × 4 fè?",a:["24","20","30"],c:0},{q:"Ki sa myèl pwodui?",a:["Lèt","Siwo myèl","Dlo sale"],c:1}][Math.floor(Math.random()*4)];
      body.innerHTML = `<p>${q.q}</p><div class="game-options">${q.a.map((a,i)=>`<button class="btn outline quiz-choice" data-i="${i}">${a}</button>`).join("")}</div>`;
      body.querySelectorAll(".quiz-choice").forEach(b=>b.onclick=()=>{ body.querySelectorAll("button").forEach(x=>x.disabled=true); if(Number(b.dataset.i)===q.c) addGamePoints(15,"Bon repons!"); else gameFeedback("Se pa sa. Kontinye pratike!"); });
    },
    tictactoe: () => {
      tttBoard = Array(9).fill("");
      body.innerHTML = `<p>Ou se X. Jwe kont òdinatè a.</p><div class="ttt-board">${tttBoard.map((_,i)=>`<button class="ttt-cell" data-i="${i}" aria-label="Kare ${i+1}"></button>`).join("")}</div><button class="btn outline" id="resetTTT">Nouvo pati</button>`;
      const winner = b => { for(const [a,c,d] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]) if(b[a]&&b[a]===b[c]&&b[a]===b[d]) return b[a]; return b.every(Boolean) ? "draw" : ""; };
      const draw = () => body.querySelectorAll(".ttt-cell").forEach((b,i)=>{b.textContent=tttBoard[i];b.disabled=!!tttBoard[i]||!!winner(tttBoard);});
      const click = i => { if(tttBoard[i]||winner(tttBoard))return; tttBoard[i]="X"; if(winner(tttBoard)==="X"){draw();addGamePoints(20,"Ou genyen pati a!");return;} if(winner(tttBoard)==="draw"){draw();gameFeedback("Match nul!");return;} const empty=tttBoard.map((v,j)=>v?null:j).filter(v=>v!==null); const move=empty[Math.floor(Math.random()*empty.length)];tttBoard[move]="O"; const w=winner(tttBoard);draw();if(w==="O")gameFeedback("Òdinatè a genyen. Eseye ankò.");else if(w==="draw")gameFeedback("Match nul!"); };
      body.querySelectorAll(".ttt-cell").forEach(b=>b.onclick=()=>click(Number(b.dataset.i))); $("#resetTTT").onclick=()=>showGame("tictactoe");
    },
    word: () => {
      const words = [{w:"LAPLI",hint:"Li tonbe nan syèl la."},{w:"ZANMI",hint:"Moun ou renmen pase tan avè l."},{w:"LIV",hint:"Ou li l pou aprann."},{w:"KÈ",hint:"Li bat nan pwatrin ou."}];
      const item=words[Math.floor(Math.random()*words.length)];
      body.innerHTML = `<p>Endis: ${item.hint}</p><p class="word-mask">${item.w.split("").map(()=>"_").join(" ")}</p><form id="wordForm" class="game-form"><input id="wordGuess" required maxlength="12" placeholder="Ekri mo a"><button class="btn primary">Verifye</button></form>`;
      $("#wordForm").onsubmit=e=>{e.preventDefault();if($("#wordGuess").value.trim().toLocaleUpperCase()===item.w){addGamePoints(15,"Ou jwenn mo a!");}else gameFeedback("Pa egzak. Mo a gen "+item.w.length+" lèt. Eseye ankò.");};
    },
    rps: () => {
      body.innerHTML = `<p>Chwazi youn:</p><div class="game-options"><button class="btn outline" data-rps="Wòch">🪨 Wòch</button><button class="btn outline" data-rps="Papye">📄 Papye</button><button class="btn outline" data-rps="Sizo">✂️ Sizo</button></div>`;
      body.querySelectorAll("[data-rps]").forEach(b=>b.onclick=()=>{const you=b.dataset.rps, cpu=["Wòch","Papye","Sizo"][Math.floor(Math.random()*3)];if(you===cpu)gameFeedback("Match nul! Òdinatè a te chwazi "+cpu+".");else if((you==="Wòch"&&cpu==="Sizo")||(you==="Papye"&&cpu==="Wòch")||(you==="Sizo"&&cpu==="Papye"))addGamePoints(10,"Ou genyen! Òdinatè a te chwazi "+cpu+".");else gameFeedback("Òdinatè a te chwazi "+cpu+". Eseye ankò!");});
    },
    daily: () => {
      const key="bouspam_daily_"+gameUserKey, today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Port-au-Prince",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
      body.innerHTML = `<p>Defi jodi a: reponn kesyon an: <b>Konbyen 9 + 8 fè?</b></p><form id="dailyForm" class="game-form"><input id="dailyAnswer" type="number" required placeholder="Repons ou"><button class="btn primary">Soumèt defi</button></form>`;
      if(localStorage.getItem(key)===today){$("#dailyForm").innerHTML="<p>Ou deja fè defi jodi a. Retounen demen!</p>";}
      else $("#dailyForm").onsubmit=e=>{e.preventDefault();if(Number($("#dailyAnswer").value)===17){localStorage.setItem(key,today);addGamePoints(25,"Defi chak jou fini!");}else gameFeedback("Repons lan pa kòrèk. Eseye ankò.");};
    },
    cards: () => {
      body.innerHTML = `<p>Chwazi yon kat mistè pou dekouvri pwen ou.</p><div class="game-options mystery-cards">${[1,2,3].map(i=>`<button class="mystery-card" data-card="${i}">🂠<small>KAT ${i}</small></button>`).join("")}</div>`;
      const prizes=[5,10,20]; const order=prizes.sort(()=>Math.random()-.5);
      body.querySelectorAll("[data-card]").forEach(b=>b.onclick=()=>{if(b.disabled)return;body.querySelectorAll("[data-card]").forEach(x=>x.disabled=true);const p=order[Number(b.dataset.card)-1];b.textContent="⭐";addGamePoints(p,"Kat mistè a ba ou");});
    },
    box: () => {
      body.innerHTML = `<p>Chwazi yon bwat pou wè rekonpans pwen an.</p><div class="game-options">${[1,2,3].map(i=>`<button class="mystery-card" data-box="${i}">🎁<small>Bwat ${i}</small></button>`).join("")}</div>`;
      body.querySelectorAll("[data-box]").forEach(b=>b.onclick=()=>{if(b.disabled)return;body.querySelectorAll("[data-box]").forEach(x=>x.disabled=true);const p=[0,5,10,15,25][Math.floor(Math.random()*5)];b.textContent=p?"⭐":"📦";if(p)addGamePoints(p,"Bwat sipriz la ba ou");else gameFeedback("Bwat sa a vid. Eseye yon lòt jwèt!");});
    },
    hidden: () => {
      const symbols=["🍀","⭐","🔑","💎","🌙","🎈","🍎","🦋","🎯"];
      const target=symbols[Math.floor(Math.random()*symbols.length)], grid=[...symbols].sort(()=>Math.random()-.5);
      body.innerHTML = `<p>Jwenn senbòl sa a: <b class="target-symbol">${target}</b></p><div class="hidden-grid">${grid.map((s,i)=>`<button class="hidden-item" data-symbol="${s}">${["❔","❔","❔","❔","❔","❔","❔","❔","❔"][i]}</button>`).join("")}</div>`;
      body.querySelectorAll(".hidden-item").forEach(b=>b.onclick=()=>{if(b.disabled)return;b.textContent=b.dataset.symbol;b.disabled=true;if(b.dataset.symbol===target){addGamePoints(20,"Ou jwenn senbòl la!");body.querySelectorAll(".hidden-item").forEach(x=>x.disabled=true);}else gameFeedback("Se pa senbòl la. Kontinye chèche!");});
    },
    riddle: () => {
      const riddles=[{q:"Mwen gen dan, men mwen pa manje. Kisa mwen ye?",a:["peny","yon peny"]},{q:"Kisa ki gen men men ki pa ka bat bravo?",a:["mont","yon mont","revèy"]},{q:"Mwen grandi lè m manje, mwen mouri lè m bwè. Kisa mwen ye?",a:["dife","yon dife"]}];
      const r=riddles[Math.floor(Math.random()*riddles.length)];
      body.innerHTML=`<p>${r.q}</p><form id="riddleForm" class="game-form"><input id="riddleAnswer" required placeholder="Repons ou"><button class="btn primary">Verifye</button></form>`;
      $("#riddleForm").onsubmit=e=>{e.preventDefault();const a=$("#riddleAnswer").value.trim().toLocaleLowerCase();if(r.a.includes(a))addGamePoints(15,"Bon devinèt!");else gameFeedback("Pa sa. Eseye yon lòt repons.");};
    },
    race: () => {
      raceSeconds=10;
      const qs=[{q:"5 + 7 = ?",a:12},{q:"8 × 3 = ?",a:24},{q:"20 − 9 = ?",a:11},{q:"15 ÷ 3 = ?",a:5},{q:"6 + 9 = ?",a:15}];
      raceQuestion=qs[Math.floor(Math.random()*qs.length)];
      body.innerHTML=`<p>Ou gen 10 segonn! <b id="raceClock">10</b></p><p class="race-question">${raceQuestion.q}</p><form id="raceForm" class="game-form"><input id="raceAnswer" type="number" required placeholder="Repons rapid"><button class="btn primary">Reponn</button></form>`;
      raceTimer=setInterval(()=>{raceSeconds--;const clock=$("#raceClock");if(clock)clock.textContent=String(raceSeconds);if(raceSeconds<=0){clearInterval(raceTimer);raceTimer=null;const f=$("#raceForm");if(f)f.innerHTML="<p>Tan fini! Eseye ankò.</p>";}},1000);
      $("#raceForm").onsubmit=e=>{e.preventDefault();if(raceTimer){clearInterval(raceTimer);raceTimer=null;}if(Number($("#raceAnswer").value)===raceQuestion.a&&raceSeconds>0)addGamePoints(20,"Ou reponn alè!");else gameFeedback("Repons lan pa bon oswa tan an fini.");};
    },
    friends: () => {
      body.innerHTML=`<p>Kreye yon defi pou voye bay zanmi w. Nan vèsyon sa a, defi a kreye sou telefòn ou sèlman; pataje tèks la ak zanmi w.</p><form id="friendForm" class="game-form"><label>Non zanmi an<input id="friendName" required maxlength="40" placeholder="Non zanmi an"></label><label>Defi<input id="friendChallenge" required maxlength="120" placeholder="Egzanp: reponn 5 devinèt"></label><button class="btn primary">Kreye defi</button></form><textarea id="friendOutput" readonly placeholder="Defi a ap parèt la"></textarea><button class="btn outline" id="copyFriend" type="button">Kopye defi a</button>`;
      $("#friendForm").onsubmit=e=>{e.preventDefault();const txt="BOUSPAM — Defi pou "+$("#friendName").value+": "+$("#friendChallenge").value;$("#friendOutput").value=txt;gameFeedback("Defi a pare. Kopye li pou pataje ak zanmi w.");};
      $("#copyFriend").onclick=async()=>{const out=$("#friendOutput");if(!out.value){gameFeedback("Kreye defi a anvan.");return;}try{await navigator.clipboard.writeText(out.value);gameFeedback("Defi a kopye!");}catch(_){out.select();document.execCommand("copy");gameFeedback("Defi a seleksyone pou kopye.");}};
    }
  };
  views[id]();
  panel.scrollIntoView({behavior:"smooth",block:"nearest"});
}
document.querySelectorAll("[data-game]").forEach(button => button.addEventListener("click", () => showGame(button.dataset.game)));
$("#closeGame")?.addEventListener("click", () => { if(raceTimer){clearInterval(raceTimer);raceTimer=null;} $("#gamePlay")?.classList.add("hidden"); });

/* ----------------- BOUSPAM MONEY-GAME RPC (integration scaffold) -----------------
   Fonksyon sa a louvri yon pati epi anrejistre esè/miz sou Supabase.
   PA rele settle pou bay pri jiskaske rezilta jwèt la verifye sou sèvè a.
*/
async function startBouspamGame(gameCode, wagerHTG = 0) {
  if (!db || !currentUser) {
    throw new Error("Konekte anvan ou jwe.");
  }

  const allowedGames = [
    "roulette", "secret_box", "tic_tac_toe",
    "rps", "mystery_cards", "hidden_object"
  ];
  if (!allowedGames.includes(gameCode)) {
    throw new Error("Kòd jwèt la pa valab pou jwèt lajan.");
  }
  if (![0, 50, 100].includes(Number(wagerHTG))) {
    throw new Error("Miz la dwe 0, 50 oswa 100 HTG.");
  }

  const { data: sessionId, error } = await db.rpc("bouspam_game_start", {
    p_game_code: gameCode,
    p_wager_htg: Number(wagerHTG)
  });
  if (error) throw error;
  return sessionId;
}

// Fè fonksyon kòmansman an disponib pou kòd UI jwèt la.
window.startBouspamGame = startBouspamGame;

// Règ sekirite: pa rele bouspam_game_settle nan app la ankò.
// SQL settle aktyèl la tire pri o aza; li pa verifye si jwè a genyen nan jwèt la.
// N ap ajoute settlement apre lojik chak jwèt verifye sou sèvè.
