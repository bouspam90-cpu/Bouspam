(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate = v => v ? new Date(v).toLocaleString('fr-HT') : '—';
  const money = v => `${Number(v || 0).toLocaleString('fr-HT')} HTG`;
  const toast = msg => { const t=$('#toast'); t.textContent=msg; clearTimeout(window.__adminToastTimer); window.__adminToastTimer=setTimeout(()=>t.textContent='',4500); };
  const showError = (where, err) => { const msg=err?.message || String(err || 'Erè enkoni'); if(where) where.textContent=msg; toast(msg); };
  let supabase = null, currentUser = null, busy = false;

  function setLoggedIn(on) { $('#loginPanel').classList.toggle('hidden',on); $('#adminPanel').classList.toggle('hidden',!on); }
  function renderRows(selector, rows, columns, empty, rowAction) {
    const target=$(selector);
    if(!Array.isArray(rows)||!rows.length){target.innerHTML=`<tr><td colspan="${columns.length + (rowAction ? 1 : 0)}">${esc(empty)}</td></tr>`;return;}
    target.innerHTML=rows.map(row=>`<tr>${columns.map(c=>`<td>${c.render ? c.render(row) : esc(row[c.key])}</td>`).join('')}${rowAction?`<td>${rowAction(row)}</td>`:''}</tr>`).join('');
  }
  async function requireAdmin() {
    const {data:{user},error}=await supabase.auth.getUser();
    if(error) throw error;
    if(!user) {setLoggedIn(false);return false;}
    currentUser=user;
    const {data,error:rpcError}=await supabase.rpc('bouspam_admin_dashboard');
    if(rpcError) throw new Error(`Mwen pa ka li panel admin nan bazdone a. Verifye si fichye SQL BOUSPAM_ADMIN_JEUX_REFERENCES.sql ak BOUSPAM_MONEY_ADMIN.sql te egzekite nan Supabase. Detay: ${rpcError.message}`);
    if(!data || data.is_admin!==true) {
      await supabase.auth.signOut(); setLoggedIn(false);
      throw new Error('Kont sa a pa nan lis admin_users. Aksè refize; pa gen okenn done prive ki parèt.');
    }
    $('#adminIdentity').textContent=`Konekte kòm ${user.email || user.id} · Done reyèl Supabase`;
    setLoggedIn(true); await loadDashboard(data); return true;
  }
  async function loadDashboard(prefetched=null) {
    if(busy) return; busy=true; $('#refreshBtn').disabled=true;
    try {
      let data=prefetched;
      if(!data){const res=await supabase.rpc('bouspam_admin_dashboard'); if(res.error) throw res.error; data=res.data;}
      if(!data?.is_admin) throw new Error('Bazdone a pa konfime dwa administratè kont sa a.');
      const stats=data.stats||{};
      $('#statMembers').textContent=Number(stats.members||0).toLocaleString('fr-HT');
      $('#statActivated').textContent=Number(stats.activated||0).toLocaleString('fr-HT');
      $('#statReferrals').textContent=Number(stats.pending_referrals||0).toLocaleString('fr-HT');
      $('#statTransactions').textContent=Number(stats.transactions||0).toLocaleString('fr-HT');
      const settings=data.settings||{};
      $('#paymentNotice').value=settings.payment_notice ?? settings.site_message ?? 'Peman yo verifye manyèlman nan NatCash.';
      $('#gamesEnabled').checked=settings.games_enabled!==false;
      const members=data.members||[];
      renderRows('#membersTable',members,[
        {key:'username',render:r=>esc(r.username||'—')},{key:'full_name',render:r=>esc(r.full_name||'—')},
        {key:'is_activated',render:r=>`<span class="pill">${r.is_activated?'Aktive':'Pa aktive'}</span>`},
        {key:'created_at',render:r=>esc(fmtDate(r.created_at))},{key:'id',render:r=>`<code>${esc(r.id)}</code>`}
      ],'Pa gen manm pou montre.');
      const refs=data.referrals||[];
      renderRows('#referralsTable',refs,[
        {key:'referrer_id',render:r=>`<code>${esc(r.referrer_id)}</code>`},
        {key:'referred_id',render:r=>`<code>${esc(r.referred_id)}</code>`},
        {key:'status',render:r=>`<span class="pill">${esc(r.status)}</span>`},
        {key:'created_at',render:r=>esc(fmtDate(r.created_at))}
      ],'Pa gen referans nan lis la.',r=>r.status==='pending'?`<button class="smallbtn approve" data-validate-ref="${esc(r.id)}">Valide</button>`:'—');
      const requests=data.payment_requests||[];
      renderRows('#requestsTable',requests,[
        {key:'user_id',render:r=>`<code>${esc(r.user_id)}</code>`},
        {key:'request_type',render:r=>esc(({activation:'Aktivasyon',deposit:'Depo',withdrawal:'Retrè'})[r.request_type]||r.request_type)},
        {key:'amount',render:r=>esc(money(r.amount))},
        {key:'reference',render:r=>esc(r.reference||'—')},
        {key:'method',render:r=>(r.request_type==='withdrawal'||r.request_type==='deposit')?`<b>${esc(String(r.withdrawal_method||'natcash').toUpperCase())}</b>${r.request_type==='withdrawal'?`<br><span class="pill">${esc(r.provider_status||'pare pou voye')}</span>${r.provider_error?`<br><small>${esc(r.provider_error)}</small>`:''}`:''}`:'—'},
        {key:'created_at',render:r=>esc(fmtDate(r.created_at))}
      ],'Pa gen demann lajan annatant.',r=>`<div class="row-actions"><button class="smallbtn approve" data-review-id="${esc(r.id)}" data-request-type="${esc(r.request_type)}" data-approve="true">${r.request_type==='withdrawal'?'Voye otomatikman':'Apwouve'}</button><button class="smallbtn reject" data-review-id="${esc(r.id)}" data-request-type="${esc(r.request_type)}" data-approve="false">Refize</button></div>`);
      renderRows('#transactionsTable',data.transactions||[],[
        {key:'user_id',render:r=>`<code>${esc(r.user_id)}</code>`},{key:'type',render:r=>esc(r.type||'—')},
        {key:'amount',render:r=>esc(money(r.amount))},{key:'status',render:r=>`<span class="pill">${esc(r.status||'—')}</span>`},
        {key:'reference',render:r=>esc(r.reference||'—')},{key:'created_at',render:r=>esc(fmtDate(r.created_at))}
      ],'Pa gen tranzaksyon pou montre.',r=>String(r.type||'').toLowerCase()==='activation'&&Number(r.amount)===500&&String(r.status||'').toLowerCase()==='pending'
        ? `<button class="smallbtn approve" data-confirm-activation="${esc(r.id)}" data-reference="${esc(r.reference||'')}">Konfime apre verifikasyon</button>` : '—');
      $('#lastRefresh').textContent=`Dènye mizajou: ${new Date().toLocaleTimeString('fr-HT')}`;
    } catch(e) { showError(null,e); }
    finally {busy=false; $('#refreshBtn').disabled=false;}
  }

  async function init() {
    if(!window.supabase || !window.BOUSPAM_SUPABASE_URL || !window.BOUSPAM_SUPABASE_PUBLISHABLE_KEY) {
      $('#loginError').textContent='Konfigirasyon Supabase pa chaje. Verifye supabase-config.js.'; return;
    }
    supabase=window.supabase.createClient(window.BOUSPAM_SUPABASE_URL,window.BOUSPAM_SUPABASE_PUBLISHABLE_KEY);
    $('#adminLogin').addEventListener('submit',async e=>{
      e.preventDefault(); if(busy)return; busy=true; $('#loginBtn').disabled=true; $('#loginError').textContent='';
      try {
        const {error}=await supabase.auth.signInWithPassword({email:$('#adminEmail').value.trim(),password:$('#adminPass').value});
        if(error) throw error;
        await requireAdmin();
      } catch(err) { $('#loginError').textContent=err.message||'Koneksyon an echwe.'; await supabase.auth.signOut().catch(()=>{}); }
      finally {busy=false;$('#loginBtn').disabled=false;}
    });
    $('#refreshBtn').addEventListener('click',()=>loadDashboard());
    $('#logoutAdmin').addEventListener('click',async()=>{await supabase.auth.signOut();currentUser=null;setLoggedIn(false);$('#adminPass').value='';toast('Ou dekonekte.');});
    $('#referralsTable').addEventListener('click',async e=>{
      const b=e.target.closest('[data-validate-ref]'); if(!b)return;
      if(!confirm('Verifye davans kont moun sa a aktive ak referans lan kòrèk. Kontinye valide referans sa a?'))return;
      b.disabled=true;
      try {const {error}=await supabase.rpc('validate_referral',{p_referral_id:b.dataset.validateRef});if(error)throw error;toast('Referans lan valide.');await loadDashboard();}
      catch(err){showError(null,err);b.disabled=false;}
    });
    $('#transactionsTable').addEventListener('click',async e=>{
      const b=e.target.closest('[data-confirm-activation]'); if(!b)return;
      if(!confirm('AVÈTISMAN: itilize sa sèlman apre ou verifye 500 HTG la antre toutbon nan kont machann PLOP PLOP ou, oswa ou resevwa peman manyèl la. Si ou poko wè lajan an, peze Cancel. Konfime aktivasyon an kounye a?'))return;
      b.disabled=true;
      try{
        const {data:{session}}=await supabase.auth.getSession();
        if(!session?.access_token)throw new Error('Sesyon administratè a fini. Konekte ankò.');
        const response=await fetch('/api/admin-activation-review',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({transaction_id:b.dataset.confirmActivation,reference:b.dataset.reference})});
        const result=await response.json().catch(()=>({}));
        if(!response.ok||!result.ok)throw new Error(result.error||'Aktivasyon an pa t ka konfime.');
        toast(result.message||'Aktivasyon konfime.');
        await loadDashboard();
      }catch(err){showError(null,err);b.disabled=false;}
    });
    $('#requestsTable').addEventListener('click',async e=>{
      const b=e.target.closest('[data-review-id]');if(!b)return;
      const approve=b.dataset.approve==='true';
      const isWithdrawal=b.dataset.requestType==='withdrawal';
      if(approve&&isWithdrawal){
        if(!confirm('Voye retrè sa a otomatikman sou '+(b.closest('tr')?.querySelector('td:nth-child(5)')?.textContent?.trim()||'NatCash/MonCash')+'? API machann lan ap trete peman reyèl la.'))return;
        b.disabled=true;
        try{
          const {data:{session}}=await supabase.auth.getSession();
          if(!session?.access_token)throw new Error('Sesyon administratè a fini. Konekte ankò.');
          const response=await fetch('/api/admin-withdrawal',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'process',request_id:b.dataset.reviewId})});
          const result=await response.json().catch(()=>({}));
          if(!response.ok||result.ok===false){toast(result.error||result.message||'Retrè a pa t ka trete.');await loadDashboard();return;}
          toast(result.message||'Demann retrè a trete.');
          await loadDashboard();
        }catch(err){showError(null,err);b.disabled=false;}
        return;
      }
      const note=prompt(approve?'Nòt administratè (opsyonèl). Verifye peman depo a anvan ou apwouve.':'Poukisa w ap refize demann sa a?','');
      if(note===null)return;
      if(approve&&!confirm('Èske ou deja verifye peman depo sa a sou sèvis peman an? Aksyon sa a modifye done reyèl.'))return;
      b.disabled=true;
      try{const {error}=await supabase.rpc('bouspam_admin_review_money_request',{p_request_id:b.dataset.reviewId,p_approve:approve,p_note:note});if(error)throw error;toast(approve?'Demann lan apwouve nan bazdone a.':'Demann lan refize.');await loadDashboard();}
      catch(err){showError(null,err);b.disabled=false;}
    });
    $('#merchantBalanceBtn')?.addEventListener('click',async()=>{
      const button=$('#merchantBalanceBtn'), output=$('#merchantBalance');
      button.disabled=true;output.textContent='Ap chèche solde machann lan…';
      try{
        const {data:{session}}=await supabase.auth.getSession();
        if(!session?.access_token)throw new Error('Sesyon administratè a fini. Konekte ankò.');
        const response=await fetch('/api/admin-withdrawal',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'balance'})});
        const result=await response.json().catch(()=>({}));
        if(!response.ok||!result.ok)throw new Error(result.error||'Nou pa kapab jwenn solde machann lan.');
        const d=result.data||{};const currency=d.currency||'HTG';const fmt=v=>`${Number(v||0).toLocaleString('fr-HT')} ${currency}`;
        output.textContent=`Solde total: ${fmt(d.balance)} · Disponib pou retrè: ${fmt(d.available_balance)} · ${d.is_active===false?'Kont inaktif':'Kont aktif'}`;
      }catch(err){output.textContent=err.message||'Erè pandan chajman solde a.';toast(output.textContent);}
      finally{button.disabled=false;}
    });
    $('#settingsForm').addEventListener('submit',async e=>{
      e.preventDefault();const btn=e.submitter;btn.disabled=true;
      try {
        const notice=$('#paymentNotice').value.trim();
        const {error:noticeError}=await supabase.rpc('bouspam_admin_set_payment_notice',{p_notice:notice});
        if(noticeError) throw new Error(`Mesaj la pa sove: ${noticeError.message}. Asire w BOUSPAM_MONEY_ADMIN.sql te egzekite.`);
        const {error:gamesError}=await supabase.rpc('bouspam_admin_set_games_enabled',{p_enabled:$('#gamesEnabled').checked});
        if(gamesError) throw new Error(`Mesaj la sove, men eta jwèt yo pa chanje: ${gamesError.message}`);
        toast('Paramèt yo sove nan bazdone a.');await loadDashboard();
      }catch(err){showError(null,err);}finally{btn.disabled=false;}
    });
    const {data:{session}}=await supabase.auth.getSession();
    if(session){try{await requireAdmin();}catch(err){$('#loginError').textContent=err.message||'Aksè admin refize.';}}
  }
  document.addEventListener('DOMContentLoaded',init);
})();
