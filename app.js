const $ = (s) => document.querySelector(s);
const panels = ["register","login"];
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3500)}
function showPanel(id){panels.forEach(p=>$("#"+p).classList.toggle("hidden",p!==id));$("#dashboard").classList.add("hidden");$("#"+id).scrollIntoView({behavior:"smooth",block:"center"})}
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.open)));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>b.closest("section").classList.add("hidden")));
let currentUser=null;
$("#registerForm").addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);currentUser={name:d.get("name").trim(),phone:d.get("phone").trim()};localStorage.setItem("bouspam_demo_user",JSON.stringify(currentUser));openDashboard();toast("Kont demo kreye sou aparèy sa a.");});
$("#loginForm").addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);const saved=JSON.parse(localStorage.getItem("bouspam_demo_user")||"null");if(!saved||saved.phone!==d.get("phone").trim()){toast("Pa jwenn kont demo sa a sou aparèy sa a. Kreye yon kont demo dabò.");return;}currentUser=saved;openDashboard();toast("Ou konekte nan demo lokal la.");});
function openDashboard(){panels.forEach(p=>$("#"+p).classList.add("hidden"));$("#welcome").classList.add("hidden");$(".features").classList.add("hidden");$("#adminInfo").classList.add("hidden");$("#dashboard").classList.remove("hidden");$("#userName").textContent=currentUser?.name||"zanmi";$("#dashboard").scrollIntoView({behavior:"smooth",block:"start"});}
$("#logout").addEventListener("click",()=>{currentUser=null;$("#dashboard").classList.add("hidden");$("#welcome").classList.remove("hidden");$(".features").classList.remove("hidden");$("#adminInfo").classList.remove("hidden");toast("Ou dekonekte nan demo a.");});
$("#activateBtn").addEventListener("click",()=>toast("Peman NatCash la poko konekte. N ap aktive sa apre Natcom bay aksè komèsan/API."));
$("#withdrawBtn").addEventListener("click",()=>toast("Retrè otomatik la poko konekte. Li bezwen entegrasyon ofisyèl NatCash."));
$("#langBtn").addEventListener("click",()=>toast("Vèsyon sa a an kreyòl. Fransè ak anglè ap ajoute nan pwochen etap la."));
