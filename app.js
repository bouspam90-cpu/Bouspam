const $ = (s) => document.querySelector(s);
const panels = ["register", "login"];
const supabaseReady = Boolean(window.supabase && window.BOUSPAM_SUPABASE_URL && window.BOUSPAM_SUPABASE_PUBLISHABLE_KEY);
const db = supabaseReady ? window.supabase.createClient(window.BOUSPAM_SUPABASE_URL, window.BOUSPAM_SUPABASE_PUBLISHABLE_KEY) : null;
let currentUser = null;
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),4500)}
function showPanel(id){panels.forEach(p=>$("#"+p).classList.toggle("hidden",p!==id));$("#dashboard").classList.add("hidden");$("#"+id).scrollIntoView({behavior:"smooth",block:"center"})}
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.open)));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>b.closest("section").classList.add("hidden")));
function setSignedOutView(){panels.forEach(p=>$("#"+p).classList.add("hidden"));$("#dashboard").classList.add("hidden");$("#welcome").classList.remove("hidden");$(".features").classList.remove("hidden");$("#adminInfo").classList.remove("hidden")}
async function loadDashboard(user){
 currentUser=user;
 panels.forEach(p=>$("#"+p).classList.add("hidden"));$("#welcome").classList.add("hidden");$(".features").classList.add("hidden");$("#adminInfo").classList.add("hidden");$("#dashboard").classList.remove("hidden");
 const meta=user.user_metadata||{};$("#userName").textContent=meta.full_name||user.email||"zanmi";
 $("#balance").innerHTML='— <small>HTG</small>';
 $("#activity").textContent="Ap chaje aktivite…";
 const {data:wallet,error:werr}=await db.from("wallets").select("balance,currency").eq("user_id",user.id).maybeSingle();
 if(werr){$("#balance").innerHTML='0.00 <small>HTG</small>';$("#activity").textContent="Kont la konekte, men nou pa kapab li bous la kounye a. Verifye règ RLS yo nan Supabase.";}
 else if(wallet){$("#balance").innerHTML=`${Number(wallet.balance).toFixed(2)} <small>${wallet.currency||"HTG"}</small>`;}
 const {data:tx,error:terr}=await db.from("transactions").select("type,amount,status,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(10);
 if(!terr&&tx&&tx.length){$("#activity").classList.remove("empty");$("#activity").innerHTML=tx.map(x=>`<div class="activity-row"><b>${escapeHtml(x.type)}</b> · ${Number(x.amount).toFixed(2)} HTG · ${escapeHtml(x.status)} <small>${new Date(x.created_at).toLocaleString()}</small></div>`).join("");}
 else if(!terr){$("#activity").textContent="Pa gen tranzaksyon verifye pou kounye a.";}
 else if(!werr){$("#activity").textContent="Bous la chaje. Istwa tranzaksyon an poko disponib.";}
 $("#dashboard").scrollIntoView({behavior:"smooth",block:"start"});
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("#registerForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!db){toast("Koneksyon Supabase pa pare. Verifye fichye supabase-config.js la.");return}
 const d=new FormData(e.target),name=String(d.get("name")||"").trim(),email=String(d.get("email")||"").trim(),password=String(d.get("password")||""),phone=String(d.get("phone")||"").trim();
 const {data,error}=await db.auth.signUp({email,password,options:{data:{full_name:name,phone}}});
 if(error){toast("Enskripsyon pa reyisi: "+error.message);return}
 if(data.session){await loadDashboard(data.user);toast("Kont ou kreye epi ou konekte.")}
 else {toast("Kont la kreye. Tcheke imèl ou pou verifye kont lan, epi konekte.");e.target.reset();showPanel("login")}
});
$("#loginForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!db){toast("Koneksyon Supabase pa pare.");return}
 const d=new FormData(e.target);const {data,error}=await db.auth.signInWithPassword({email:String(d.get("email")||"").trim(),password:String(d.get("password")||"")});
 if(error){toast("Koneksyon pa reyisi: "+error.message);return} await loadDashboard(data.user);toast("Ou konekte sou BOUSPAM.");
});
$("#logout").addEventListener("click",async()=>{if(db)await db.auth.signOut();currentUser=null;setSignedOutView();toast("Ou dekonekte.")});
$("#activateBtn").addEventListener("click",()=>toast("Peman 500 HTG poko aktive. Pa voye lajan jiskaske NatCash ofisyèl ak verifikasyon peman an konekte."));
$("#withdrawBtn").addEventListener("click",()=>toast("Retrè minimòm 255 HTG poko aktive. Li bezwen validasyon sou sèvè ak entegrasyon NatCash ofisyèl."));
$("#langBtn").addEventListener("click",()=>toast("Vèsyon sa a an kreyòl. Fransè ak anglè ap ajoute pita."));
(async()=>{if(!db){toast("Konfigirasyon Supabase pa chaje.");return}const {data,error}=await db.auth.getSession();if(!error&&data.session)await loadDashboard(data.session.user)})();
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password
});
