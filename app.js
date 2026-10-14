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
  $("#" + id)?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}
document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => showPanel(button.dataset.open));
});
document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest("section")?.classList.add("hidden");
  });
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
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}
function isValidUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
}
/* Jwenn ID referans lan nan yon UUID oswa nan yon lyen */
function extractReferrerId(value) {
  const input = String(value || "").trim();
  if (isValidUUID(input)) {
    return input;
  }
  try {
    const url = new URL(input);
    const ref = url.searchParams.get("ref");
    if (ref && isValidUUID(ref)) {
      return ref;
    }
  } catch (_) {
    // Antre a pa yon lyen konplè.
  }
  return null;
}
/* Kreye lyen referans pèsonèl manm nan */
/* Montre lyen referans lan sèlman si kont lan aktive */
function updateReferralLink(user, isActivated) {
  const input = $("#referralLink");
  const message = $("#referralMessage");
  const button = $("#copyReferralBtn");

  if (!input || !user) return;

  input.value = "";

  if (!isActivated) {
    if (button) button.disabled = true;

    if (message) {
      message.textContent =
        "🔒 Ou dwe aktive kont ou avèk 500 HTG anvan ou jwenn aksè ak lyen referans ou.";
    }

    return;
  }
  const input = $("#referralLink");
  const message = $("#referralMessage");
  if (!input || !user) return;
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("ref", user.id);
  input.value = url.toString();
  if (message) {
    message.textContent =
      "Lyen ou pare. Pataje li ak moun ou vle envite sou BOUSPAM.";
  }
}
/* Anrejistre referans lan nan Supabase */
async function processReferral(user) {
  if (!db || !user) return;
  const referrerId = extractReferrerId(
    user.user_metadata?.referrer_id
  );
  if (!referrerId) return;
  if (referrerId.toLowerCase() === user.id.toLowerCase()) {
    toast("Ou pa kapab itilize pwòp lyen referans ou.");
    return;
  }
  const { error } = await db.rpc("register_referral", {
    p_referrer_id: referrerId
  });
  if (error) {
    console.error("Erè referans:", error.message);
    toast(
      "Referans lan poko anrejistre. Li ka deja anrejistre oswa gen yon pwoblèm nan sistèm nan."
    );
    return;
  }
  /*
   * Retire referans lan nan metadata apre anrejistreman an reyisi.
   * Sa anpeche nou eseye anrejistre menm referans lan chak fwa.
   */
  const { error: updateError } = await db.auth.updateUser({
    data: {
      referrer_id: null
    }
  });
  if (updateError) {
    console.error(
      "Referans anrejistre, men metadata a pa t ajou:",
      updateError.message
    );
  }
  toast("Referans ou anrejistre avèk siksè!");
}
/* Chaje tablodbò manm nan */
async function loadDashboard(user) {
  if (!db || !user) return;
  currentUser = user;
  panels.forEach((p) => $("#" + p)?.classList.add("hidden"));
  $("#welcome")?.classList.add("hidden");
  $(".features")?.classList.add("hidden");
  $("#adminInfo")?.classList.add("hidden");
  $("#dashboard")?.classList.remove("hidden");
  const meta = user.user_metadata || {};
  if ($("#userName")) {
    $("#userName").textContent =
      meta.full_name || user.email || "zanmi";
  }
  $("#balance").innerHTML = '— <small>HTG</small>';
  $("#activity").textContent = "Ap chaje aktivite…";
  const { data: profile, error: profileError } = await db
  .from("profiles")
  .select("is_activated")
  .eq("id", user.id)
  .maybeSingle();

const isActivated =
  !profileError &&
  profile !== null &&
  profile.is_activated === true;

updateReferralLink(user, isActivated);
  const { data: wallet, error: walletError } = await db
    .from("wallets")
    .select("balance,currency")
    .eq("user_id", user.id)
    .maybeSingle();
  if (walletError) {
    $("#balance").innerHTML = '0.00 <small>HTG</small>';
    $("#activity").textContent =
      "Nou pa kapab li bous la kounye a. Verifye koneksyon ak règ RLS yo nan Supabase.";
  } else if (wallet) {
    $("#balance").innerHTML =
      `${Number(wallet.balance).toFixed(2)} <small>${escapeHtml(wallet.currency || "HTG")}</small>`;
  }
  const { data: transactions, error: transactionError } = await db
    .from("transactions")
    .select("type,amount,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  if (
    !transactionError &&
    transactions &&
    transactions.length > 0
  ) {
    $("#activity").classList.remove("empty");
    $("#activity").innerHTML = transactions.map((transaction) => `
      <div class="activity-row">
        <b>${escapeHtml(transaction.type)}</b>
        · ${Number(transaction.amount).toFixed(2)} HTG
        · ${escapeHtml(transaction.status)}
        <small>${new Date(transaction.created_at).toLocaleString()}</small>
      </div>
    `).join("");
  } else if (!transactionError) {
    $("#activity").textContent =
      "Pa gen tranzaksyon verifye pou kounye a.";
  } else if (!walletError) {
    $("#activity").textContent =
      "Bous la chaje. Istwa tranzaksyon an poko disponib.";
  }
  $("#dashboard").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
/* Kopye lyen referans lan */
$("#copyReferralBtn")?.addEventListener("click", async () => {
  const input = $("#referralLink");
  const message = $("#referralMessage");
  if (!input || !input.value) {
    toast("Lyen referans lan poko disponib.");
    return;
  }
  try {
    await navigator.clipboard.writeText(input.value);
  } catch (_) {
    input.focus();
    input.select();
    const copied = document.execCommand("copy");
    if (!copied) {
      toast("Seleksyone lyen an epi kopye li manyèlman.");
      return;
    }
  }
  if (message) {
    message.textContent = "Lyen an kopye! Ou kapab pataje li.";
  }
  toast("Lyen referans lan kopye avèk siksè!");
});
/* Enskripsyon */
$("#registerForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db) {
    toast("Koneksyon Supabase pa pare. Verifye supabase-config.js.");
    return;
  }
  const form = new FormData(event.target);
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const phone = String(form.get("phone") || "").trim();
  /*
   * Lyen ki nan URL la gen priyorite.
   * Si pa gen lyen, nou gade kòd oswa lyen ki nan chan referans lan.
   */
  const params = new URLSearchParams(window.location.search);
  const urlReferrer = extractReferrerId(params.get("ref"));
  const formReferrer = extractReferrerId(form.get("referral"));
  const userMetadata = {
    full_name: name,
    phone
  };
  const referrerId = urlReferrer || formReferrer;
  if (referrerId) {
    userMetadata.referrer_id = referrerId;
  }
  const submitButton = event.target.querySelector(
    'button[type="submit"]'
  );
  if (submitButton) submitButton.disabled = true;
  try {
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata
      }
    });
    if (error) {
      toast("Enskripsyon pa reyisi: " + error.message);
      return;
    }
    if (data.session && data.user) {
      await processReferral(data.user);
      await loadDashboard(data.user);
      toast("Kont ou kreye epi ou konekte.");
    } else {
      toast(
        "Kont la kreye. Verifye imèl ou anvan ou konekte si yo mande sa."
      );
      event.target.reset();
      showPanel("login");
    }
  } catch (error) {
    console.error("Erè enskripsyon:", error);
    toast("Yon erè rive pandan enskripsyon an. Eseye ankò.");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
/* Koneksyon */
$("#loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db) {
    toast("Koneksyon Supabase pa pare.");
    return;
  }
  const form = new FormData(event.target);
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const submitButton = event.target.querySelector(
    'button[type="submit"]'
  );
  if (submitButton) submitButton.disabled = true;
  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      toast("Koneksyon pa reyisi: " + error.message);
      return;
    }
    await processReferral(data.user);
    await loadDashboard(data.user);
    toast("Ou konekte sou BOUSPAM.");
  } catch (error) {
    console.error("Erè koneksyon:", error);
    toast("Yon erè rive pandan koneksyon an.");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
/* Dekoneksyon */
$("#logout")?.addEventListener("click", async () => {
  if (db) {
    const { error } = await db.auth.signOut();
    if (error) {
      toast("Nou pa kapab dekonekte kounye a.");
      return;
    }
  }
  setSignedOutView();
  toast("Ou dekonekte.");
});
/* Peman aktivasyon: rete dezaktive jiskaske verifikasyon reyèl pare */
$("#activateBtn")?.addEventListener("click", () => {
  toast(
    "Peman 500 HTG poko aktive. Pa voye lajan jiskaske peman ofisyèl ak verifikasyon yo konekte."
  );
});
/* Retrè: rete dezaktive jiskaske validasyon sou sèvè pare */
$("#withdrawBtn")?.addEventListener("click", () => {
  toast(
    "Retrè minimòm 255 HTG poko aktive. Sistèm nan bezwen validasyon sou sèvè ak entegrasyon peman ofisyèl."
  );
});
/* Lang */
$("#langBtn")?.addEventListener("click", () => {
  toast("Vèsyon sa a an kreyòl. Fransè ak anglè ap ajoute pita.");
});
/* Retabli sesyon an lè paj la louvri */
(async () => {
  if (!db) {
    toast("Konfigirasyon Supabase pa chaje.");
    return;
  }
  const { data, error } = await db.auth.getSession();
  if (error) {
    console.error("Erè sesyon:", error.message);
    return;
  }
  if (data.session) {
    await loadDashboard(data.session.user);
  }
})();
