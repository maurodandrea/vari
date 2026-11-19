// Account e sincronizzazione dei dati di LenzApp con Firebase (Authentication + Firestore).
// Si attiva solo se firebase-config.js contiene la configurazione del progetto. I dati restano anche sul dispositivo:
// Firestore tiene una copia per utente (users/{uid}/data/{chiave} e users/{uid}/diary/{id}) e la sincronizza tra telefono e PC.
(function(){
const FBV='10.14.1',FB=`https://www.gstatic.com/firebasejs/${FBV}/`;
const SYNC_KEYS=['chatseen','spots','active','shoesize','gemkey','badges','myfish','live','premium','chatfriends','chatblock','chatblocknames','chatnotif','chatfollow','chatfollow2','chatspotc','chatspotc3','chatloc','chatfriendsync','chatcleared','spotclean1','chatgone','sharecatch','heaton'];  // il diario va a parte, un documento per uscita
const MAX_DOC=900000;  // Firestore accetta documenti fino a 1 MB
const C={ready:false,user:null,status:'',busy:false,applying:false,dirty:new Set(),timer:null,unsub:[]};
window.CLOUD=C;
let fa,ff,auth,db;
// la «Posizione attuale» è solo di questo dispositivo: non va nell'account e non arriva dagli altri dispositivi
// conversazioni lette: per ognuna tengo la lettura più recente tra dispositivo e account
const mergeSeen=v=>{const a=raw.get('chatseen'),o=a&&typeof a==='object'&&!Array.isArray(a)?{...a}:{};if(v&&typeof v==='object'&&!Array.isArray(v))for(const [k,t] of Object.entries(v))if(typeof t==='number'&&t>(o[k]||0))o[k]=t;return o;};
const noHere=v=>Array.isArray(v)?v.filter(x=>!x?.here):v;
const keepHere=v=>{const h=(Array.isArray(raw.get('spots'))?raw.get('spots'):[]).filter(x=>x?.here).slice(0,1);return [...noHere(v),...h];};
const raw={get:k=>{try{const v=localStorage.getItem('lenza.'+k);return v?JSON.parse(v):null;}catch(e){return null;}},
  set:(k,v)=>{try{localStorage.setItem('lenza.'+k,JSON.stringify(v));}catch(e){}}};

// ogni salvataggio locale di una chiave sincronizzata viene inviato dopo 2 secondi
// (solo se il valore è cambiato davvero: niente invii a vuoto, che tra due dispositivi aperti rimbalzavano all'infinito)
const set0=LS.set;
LS.set=function(k,v){
  const sync=C.user&&!C.applying&&(k==='diary'||SYNC_KEYS.includes(k));
  let before=null;if(sync){try{before=localStorage.getItem('lenza.'+k);}catch(e){}}
  const r=set0.call(LS,k,v);
  if(sync&&before!==JSON.stringify(v)){C.dirty.add(k);clearTimeout(C.timer);C.timer=setTimeout(push,3000);}
  return r;};

async function init(){
  const cfg=window.LENZA_FB;if(!cfg||!cfg.apiKey)return;
  try{
    const app=(await import(FB+'firebase-app.js')).initializeApp(cfg);
    // App Check prima di tutto il resto, così anche Firestore invia il proprio token
    if(cfg.recaptchaEnterpriseKey){try{const ac=await import(FB+'firebase-app-check.js');
      C.appCheck=ac.initializeAppCheck(app,{provider:new ac.ReCaptchaEnterpriseProvider(cfg.recaptchaEnterpriseKey),isTokenAutoRefreshEnabled:true});
      C.acToken=async(force)=>{try{return (await ac.getToken(C.appCheck,!!force)).token;}catch(e){C.acErr=e.code||e.message;return null;}};}catch(e){C.acErr='App Check non caricato: '+(e.message||e);}}
    fa=await import(FB+'firebase-auth.js');ff=await import(FB+'firebase-firestore.js');
    auth=fa.getAuth(app);auth.languageCode='it';db=ff.getFirestore(app);
    C.ff=ff;C.db=db;  // usati anche dalla chat (chat.js)
    C.ready=true;
    fa.getRedirectResult(auth).catch(e=>toast('⚠️ '+errMsg(e)));
    fa.onAuthStateChanged(auth,u=>{C.user=u;C.authKnown=true;C.unsub.forEach(f=>f());C.unsub=[];if(S.tab==='chat')setTimeout(()=>render(),0);
      // accesso fatto dalla finestra di login: la chiudo
      if(u&&document.querySelector('#sheetBox #cle'))closeSheet();
      C.chip();if(u&&!C.mustVerify())start();else if(u)verifyWatch();else{C.status='';if(S.tab==='settings'||S.tab==='home')render();}});
  }catch(e){C.status='Servizio account non raggiungibile';}
  if(S.tab==='settings')render();
}

/* ---------- accesso ---------- */
const ERR={'auth/invalid-email':'Email non valida','auth/missing-password':'Inserisci la password','auth/weak-password':'Password troppo corta (almeno 6 caratteri)',
  'auth/email-already-in-use':'Esiste già un account con questa email: accedi','auth/invalid-credential':'Email o password sbagliate','auth/wrong-password':'Email o password sbagliate',
  'auth/user-not-found':'Nessun account con questa email','auth/too-many-requests':'Troppi tentativi: riprova tra qualche minuto','auth/network-request-failed':'Connessione assente',
  'auth/popup-closed-by-user':'Accesso annullato','auth/unauthorized-domain':'Dominio non autorizzato nel progetto Firebase','auth/operation-not-allowed':'Metodo di accesso non attivato nel progetto Firebase',
  'auth/account-exists-with-different-credential':'Questa email usa un altro metodo di accesso'};
const errMsg=e=>ERR[e?.code]||e?.message||'Operazione non riuscita';
const form=()=>({email:(document.getElementById('cle')?.value||'').trim(),pw:document.getElementById('clp')?.value||''});
C.login=async()=>{const {email,pw}=form();try{await fa.signInWithEmailAndPassword(auth,email,pw);toast('✅ Accesso effettuato');}catch(e){toast('⚠️ '+errMsg(e));}};
C.register=async()=>{const {email,pw}=form();try{const r=await fa.createUserWithEmailAndPassword(auth,email,pw);await sendVerify(r.user);toast('📧 Account creato: ti ho inviato l\'email di attivazione');}catch(e){toast('⚠️ '+errMsg(e));}};
/* ---------- attivazione dell'account (solo per chi si registra con email e password) ---------- */
// finché non apre il link ricevuto per email l'account non entra nell'app; Google e Apple hanno già l'email verificata
C.mustVerify=()=>{const u=C.user;return !!u&&!u.emailVerified&&(u.providerData||[]).some(p=>p.providerId==='password');};
// dopo l'attivazione il link riporta all'app
const sendVerify=u=>fa.sendEmailVerification(u,{url:location.origin+location.pathname}).catch(e=>{
  if(e?.code==='auth/unauthorized-continue-uri'||e?.code==='auth/invalid-continue-uri')return fa.sendEmailVerification(u);throw e;});
C.resendVerify=async()=>{if(!C.user)return;try{await sendVerify(C.user);toast('📧 Email di attivazione inviata di nuovo a '+C.user.email);}catch(e){toast('⚠️ '+(e.code==='auth/too-many-requests'?'Troppe richieste: aspetta qualche minuto e controlla anche lo spam':errMsg(e)));}};
// controllo se l'utente ha aperto il link (al ritorno nell'app, ogni 5 secondi o col pulsante)
C.checkVerify=async(manual)=>{const u=C.user;if(!u||!C.mustVerify())return;
  try{await u.reload();}catch(e){}
  if(u.emailVerified){try{await u.getIdToken(true);}catch(e){}clearInterval(C.vtimer);C.vtimer=null;toast('✅ Account attivato, benvenuto!');C.chip();start();}
  else if(manual)toast('Non risulta ancora attivato: apri il link nell\'email (guarda anche nello spam)');};
function verifyWatch(){clearInterval(C.vtimer);C.vtimer=setInterval(()=>{if(!C.mustVerify()){clearInterval(C.vtimer);return;}C.checkVerify();},5000);}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')C.checkVerify();});
C.reset=async()=>{const {email}=form();if(!email){toast('Scrivi prima la tua email');return;}try{await fa.sendPasswordResetEmail(auth,email);toast('📧 Ti ho inviato un\'email per reimpostare la password');}catch(e){toast('⚠️ '+errMsg(e));}};
C.google=()=>social(new fa.GoogleAuthProvider());
C.apple=()=>{const p=new fa.OAuthProvider('apple.com');p.addScope('email');p.addScope('name');p.setCustomParameters({locale:'it'});return social(p);};
// finestra a comparsa (sui domini diversi da Firebase il reindirizzamento è poco affidabile); se è bloccata, reindirizzamento
async function social(p){
  try{await fa.signInWithPopup(auth,p);toast('✅ Accesso effettuato');}
  catch(e){if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment')return fa.signInWithRedirect(auth,p);toast('⚠️ '+errMsg(e));}}
// all'uscita i dati restano solo nell'account: tolgo la copia dal dispositivo (prima invio le ultime modifiche)
C.logout=async()=>{if(!confirm('Uscire dall\'account? I tuoi dati restano salvati online e li ritrovi al prossimo accesso; da questo dispositivo vengono tolti.'))return;
  clearTimeout(C.timer);let ok=false;try{ok=await push();}catch(e){}
  // se qualcosa non è stato salvato online (per esempio il Premium) non cancello i dati dal dispositivo senza chiedere
  if(!ok||C.dirty.size){if(!confirm('Attenzione: alcune modifiche (per esempio il Premium) non sono ancora salvate online e uscendo andrebbero perse. Uscire comunque?'))return;}
  C.unsub.forEach(f=>f());C.unsub=[];window.CHAT?.stop();await fa.signOut(auth);
  try{[...SYNC_KEYS,'diary','cloudts','cloudhash','cloudsent','clouduid','chatbot','chatseen','chatreported'].forEach(k=>localStorage.removeItem('lenza.'+k));}catch(e){}
  location.hash='';location.reload();};
C.cancelVerify=async()=>{window.CHAT?.stop();clearInterval(C.vtimer);await fa.signOut(auth);};
C.syncNow=()=>{SYNC_KEYS.forEach(k=>C.dirty.add(k));C.dirty.add('diary');push();};

/* ---------- sincronizzazione ---------- */
const uref=()=>ff.doc(db,'users',C.user.uid);
const dataCol=()=>ff.collection(db,'users',C.user.uid,'data');
const diaryCol=()=>ff.collection(db,'users',C.user.uid,'diary');
const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return s.length+':'+h;};
function setStatus(t){C.status=t;const el=document.getElementById('cloudst');if(el)el.textContent=t;}

async function start(){
  const uid=C.user.uid,prev=raw.get('clouduid'),first=prev!==uid;
  // sul dispositivo ci sono i dati di un ALTRO account (per esempio uno cancellato, da cui non si era usciti):
  // non li unisco al nuovo account, li tolgo
  // email nel documento dell'utente (lo legge solo l'amministratore, per «Cancella utente»)
  ff.setDoc(uref(),{email:(C.user.email||'').toLowerCase(),t:Date.now()},{merge:true}).catch(()=>{});
  if(prev&&prev!==uid){try{[...SYNC_KEYS,'diary','cloudts','cloudhash','cloudsent','chatbot','chatseen','chatreported','chatgone','spotclean1'].forEach(k=>localStorage.removeItem('lenza.'+k));}catch(e){}
    S.spots=[];S.diary=[];S.live=null;S.active=null;try{ensureHere();}catch(e){}}
  // email attivata da poco: rinnovo il token, altrimenti le regole di Firestore lo vedono ancora «non verificato»
  try{const t=await C.user.getIdTokenResult?.();if(t&&C.user.emailVerified&&t.claims?.email_verified!==true)await C.user.getIdToken(true);}catch(e){}
  setStatus('Sincronizzo…');C.busy=true;
  try{
    const [ds,es]=await Promise.all([ff.getDocs(dataCol()),ff.getDocs(diaryCol())]);
    // account già sincronizzato in passato ma ora vuoto online: i dati sono stati cancellati (dall'amministratore);
    // tolgo anche la copia sul dispositivo, invece di rimandarla online
    if(!first&&!ds.docs.length&&!es.docs.length&&Object.keys(raw.get('cloudsent')||{}).length){
      try{[...SYNC_KEYS,'diary','cloudts','cloudhash','cloudsent','chatbot','chatseen','chatreported','chatgone','spotclean1'].forEach(k=>localStorage.removeItem('lenza.'+k));}catch(e){}
      S.spots=[];S.diary=[];S.live=null;S.active=null;try{ensureHere();}catch(e){}
      toast('I dati di questo account sono stati azzerati');}
    C.applying=true;
    // impostazioni e spot: al primo accesso unisco quelli del dispositivo con quelli dell'account; poi vince il più recente
    const ts=raw.get('cloudts')||{};
    ds.forEach(d=>{const k=d.id,o=d.data();if(!SYNC_KEYS.includes(k))return;let v;try{v=JSON.parse(o.v);}catch(e){return;}
      // elenchi salvati vuoti (null) da versioni precedenti: li tratto come elenchi vuoti, altrimenti la sincronizzazione si blocca
      if((k==='spots'||k==='myfish')&&!Array.isArray(v))v=[];
      if(first&&k==='spots'){const loc=Array.isArray(raw.get('spots'))?raw.get('spots'):[],same=(a,b)=>a.id===b.id||(a.name===b.name&&Math.abs(a.lat-b.lat)<.002&&Math.abs(a.lon-b.lon)<.002);
        // stesso spot (stesso id, o stesso nome e posizione, come lo spot di esempio creato su ogni dispositivo): uno solo
        v=[...v,...loc.filter(s=>!v.some(r=>same(r,s)))];const act=raw.get('active'),dup=loc.find(s=>s.id===act);if(dup&&!v.some(r=>r.id===act)){const r=v.find(x=>same(x,dup));if(r)raw.set('active',r.id);}C.dirty.add('spots');}
      else if(first&&k==='myfish'){v=[...v,...(Array.isArray(raw.get('myfish'))?raw.get('myfish'):[])].slice(-200);C.dirty.add('myfish');}
      else if(!first&&(ts[k]||0)>(o.t||0))return;  // il dispositivo ha una modifica più recente ancora da inviare
      if(k==='spots')v=keepHere(v);
      if(k==='chatseen'){const m=mergeSeen(v);if(JSON.stringify(m)!==JSON.stringify(v))C.dirty.add('chatseen');v=m;}
      raw.set(k,v);ts[k]=o.t||Date.now();});
    if(first)SYNC_KEYS.forEach(k=>{if(!ds.docs.some(d=>d.id===k)&&raw.get(k)!=null)C.dirty.add(k);});
    // diario: unione per uscita; le uscite cancellate restano come «tombstone»
    const loc=Array.isArray(raw.get('diary'))?raw.get('diary'):[],hs=first?{}:(raw.get('cloudhash')||{}),byId=new Map(loc.map(e=>[e.id,e]));
    es.forEach(d=>{const o=d.data();if(o.deleted){byId.delete(d.id);delete hs[d.id];return;}
      const e=JSON.parse(o.v),l=byId.get(d.id);if(l&&hs[d.id]&&hash(JSON.stringify(l))!==hs[d.id])return;  // modificata qui e non ancora inviata
      byId.set(d.id,e);hs[d.id]=hash(JSON.stringify(e));});
    const merged=[...byId.values()].sort((a,b)=>(a.start||0)-(b.start||0));
    const sent={};ds.forEach(d=>{const o=d.data();if(SYNC_KEYS.includes(d.id))sent[d.id]=hash(o.v);});
    raw.set('diary',merged);raw.set('cloudhash',hs);raw.set('cloudts',ts);raw.set('clouduid',uid);raw.set('cloudsent',sent);
    if(merged.some(e=>!hs[e.id])||first)C.dirty.add('diary');
    C.applying=false;reload();
    setStatus('Dati sincronizzati');
    if(C.dirty.size)await push();
    listen();
    window.CHAT?.start();
  }catch(e){C.applying=false;setStatus('Sincronizzazione non riuscita: '+(e.code||e.message));}
  C.busy=false;if(S.tab==='settings')render();
}
// i dati letti dal cloud entrano nello stato dell'app
let lastReload=0,reloadTimer=null;
function reloadSoon(){  // modifiche arrivate da un altro dispositivo: ridisegno al massimo una volta ogni 60 secondi
  const wait=60000-(Date.now()-lastReload);
  if(wait<=0)return reload();
  if(!reloadTimer)reloadTimer=setTimeout(()=>{reloadTimer=null;reload();},wait);
}
function reload(){
  const act0=S.active,pos0=JSON.stringify((S.spots||[]).find(x=>x.id===S.active)||{});
  lastReload=Date.now();C.applying=true;  // i calcoli fatti qui (trofei, profilo) non vanno rimandati online
  S.spots=LS.get('spots',S.spots);if(!Array.isArray(S.spots))S.spots=[];S.active=LS.get('active',S.active);if(!S.spots.find(s=>s.id===S.active))S.active=S.spots[0]?.id||null;
  S.diary=LS.get('diary',[]);S.live=LS.get('live',null);
  try{buildProfile();checkBadges();}catch(e){}
  C.applying=false;
  try{cleanSpots(true);ensureHere();if(S.active!==LS.get('active',null))LS.set('active',S.active);}catch(e){}  // dopo l'unione con i dati dell'account (le modifiche vengono poi salvate online)
  // spot attivo cambiato (per esempio dall'altro dispositivo o dalla pulizia): ricarico il meteo
  const sp=(S.spots||[]).find(x=>x.id===S.active);if(S.active!==act0||JSON.stringify(sp||{})!==pos0){S.wx=null;try{loadWeather();}catch(e){}}
  if(!document.getElementById('sheet').classList.contains('on'))render();
}

async function push(retry){
  if(!C.user||!C.dirty.size)return true;
  const keys=[...C.dirty];C.dirty.clear();setStatus('Salvo online…');
  try{
    const ts=raw.get('cloudts')||{},now=Date.now();
    const sent=raw.get('cloudsent')||{};
    for(const k of keys.filter(k=>k!=='diary')){
      const s=JSON.stringify(k==='spots'?noHere(raw.get(k)):raw.get(k));if(sent[k]===hash(s))continue;  // uguale all'ultimo invio
      ts[k]=now;await ff.setDoc(ff.doc(dataCol(),k),{v:s,t:now});sent[k]=hash(s);
    }
    raw.set('cloudsent',sent);
    raw.set('cloudts',ts);
    if(keys.includes('diary'))await pushDiary();
    await ff.setDoc(uref(),{email:(C.user.email||'').toLowerCase(),t:now},{merge:true});
    setStatus('Dati salvati online · '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}));
    return true;
  }catch(e){keys.forEach(k=>C.dirty.add(k));
    // permesso negato: di solito il token è ancora quello di prima dell'attivazione dell'email; lo rinnovo e riprovo subito
    if(e.code==='permission-denied'&&!retry){try{await C.user.getIdToken(true);}catch(x){}return push(true);}
    setStatus('Non salvato online ('+(e.code||e.message)+'): riprovo');clearTimeout(C.timer);C.timer=setTimeout(push,30000);return false;}
}
// invio subito le modifiche in attesa (attivazione Premium, app che va in secondo piano)
C.flush=()=>{clearTimeout(C.timer);return push();};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&C.dirty.size)C.flush();});
async function pushDiary(){
  const loc=raw.get('diary')||[],hs=raw.get('cloudhash')||{},ids=new Set(loc.map(e=>e.id));
  for(const e of loc){
    const s=JSON.stringify(e),h=hash(s);if(hs[e.id]===h)continue;
    const v=s.length>MAX_DOC?JSON.stringify(await shrink(e)):s;
    await ff.setDoc(ff.doc(diaryCol(),e.id),{v,t:Date.now(),deleted:false});hs[e.id]=h;
  }
  for(const id of Object.keys(hs))if(!ids.has(id)){await ff.setDoc(ff.doc(diaryCol(),id),{deleted:true,t:Date.now()});delete hs[id];}
  raw.set('cloudhash',hs);
}
// uscita troppo grande per un documento: riduco le foto finché ci sta
async function shrink(e){
  const c=JSON.parse(JSON.stringify(e));let q=480;
  const red=async src=>{if(!src||!src.startsWith('data:image'))return src;const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=src;});
    const k=Math.min(1,q/Math.max(img.width,img.height)),cv=document.createElement('canvas');cv.width=Math.round(img.width*k);cv.height=Math.round(img.height*k);
    cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);return cv.toDataURL('image/jpeg',.6);};
  while(JSON.stringify(c).length>MAX_DOC&&q>=120){if(c.photo)c.photo=await red(c.photo);for(const x of c.catches||[])if(x.photo)x.photo=await red(x.photo);q=Math.round(q*.7);}
  if(JSON.stringify(c).length>MAX_DOC){delete c.photo;(c.catches||[]).forEach(x=>delete x.photo);}
  return c;
}
// modifiche fatte su un altro dispositivo arrivano in tempo reale
function listen(){
  C.unsub.push(ff.onSnapshot(dataCol(),snap=>{
    if(snap.metadata.hasPendingWrites)return;let ch=false;const ts=raw.get('cloudts')||{};
    snap.docChanges().forEach(c=>{if(c.type==='removed'||!c.doc.data())return;const k=c.doc.id,o=c.doc.data();if(!SYNC_KEYS.includes(k)||C.dirty.has(k)||(ts[k]||0)>=(o.t||0))return;
      ts[k]=o.t;if(JSON.stringify(raw.get(k))===o.v)return;let v;try{v=JSON.parse(o.v);}catch(e){return;}if((k==='spots'||k==='myfish')&&!Array.isArray(v))v=[];if(k==='chatseen'){v=mergeSeen(v);if(JSON.stringify(v)===JSON.stringify(raw.get(k)))return;}if(k==='spots'){if(JSON.stringify(noHere(raw.get(k)))===JSON.stringify(noHere(v)))return;v=keepHere(v);}raw.set(k,v);ch=true;});
    raw.set('cloudts',ts);if(ch)reloadSoon();
  }));
  C.unsub.push(ff.onSnapshot(diaryCol(),snap=>{
    if(snap.metadata.hasPendingWrites||C.dirty.has('diary'))return;let ch=false;
    const loc=raw.get('diary')||[],hs=raw.get('cloudhash')||{},byId=new Map(loc.map(e=>[e.id,e]));
    snap.docChanges().forEach(c=>{if(c.type==='removed'||!c.doc.data())return;const id=c.doc.id,o=c.doc.data();
      if(o.deleted){if(byId.has(id)){byId.delete(id);ch=true;}delete hs[id];return;}
      const e=JSON.parse(o.v),h=hash(JSON.stringify(e));if(hs[id]===h&&byId.has(id))return;byId.set(id,e);hs[id]=h;ch=true;});
    if(ch){raw.set('diary',[...byId.values()].sort((a,b)=>(a.start||0)-(b.start||0)));raw.set('cloudhash',hs);reloadSoon();}
  }));
}

/* ---------- riquadro nelle Impostazioni ---------- */
// nome da mostrare: quello dell'account Google, altrimenti la parte dell'email prima della @
// nome da mostrare: con Google o Apple il nome di battesimo; con email e password lo username (l'email senza dominio)
C.name=()=>{const u=C.user;if(!u)return '';const user=(u.email||'').split('@')[0];
  const social=(u.providerData||[]).some(p=>p.providerId==='google.com'||p.providerId==='apple.com');
  const nome=(u.displayName||(u.providerData||[]).map(p=>p.displayName).find(Boolean)||'').trim().split(/\s+/)[0];
  return (social&&nome?nome:user)||'utente';};
// in alto accanto allo spot: nome dell'utente se è collegato, altrimenti «Accedi»
C.chip=()=>{C.gate();const el=document.getElementById('userChip');if(!el)return;
  if(!window.LENZA_FB?.apiKey||!C.ready||!C.user||C.mustVerify()){el.style.display='none';return;}
  el.style.display='';const n=C.name(),short=n;
  const king=typeof isPremium==='function'&&isPremium();  // utenti Premium: stellina accanto al nome
  el.innerHTML=C.user?`<i>${esc(n.charAt(0).toUpperCase())}</i><span>${esc(short)}</span>${king?'<em class="crown" title="Premium">⭐</em>':''}`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span>Accedi</span>`;
  el.title=C.user?(C.user.email||n):'Accedi o registrati';el.classList.toggle('in',!!C.user);};
C.open=()=>{if(C.user){go('settings');return;}openSheet(C.form());};
// riquadro nella Home per chi non ha fatto l'accesso
C.homeCard=()=>'';const _homeCard_old=()=>`<div class="card loginbox"><div><b>☁️ Accedi o registrati</b><div class="small mut">Salva spot, diario e foto online e ritrovali su telefono e PC.</div></div><button class="btn" onclick="CLOUD.open()">Login</button></div>`;
// senza accesso: schermata di accesso grande sopra l'app, che resta sfocata sotto
C.gate=()=>{
  const verify=C.mustVerify(),on=!!window.LENZA_FB?.apiKey&&C.ready&&(!C.user||verify);let g=document.getElementById('gate');
  if(!on){if(g)g.remove();document.body.classList.remove('gated');return;}
  if(g&&g.dataset.v===String(verify))return;if(g)g.remove();
  if(verify){
    g=document.createElement('div');g.id='gate';g.dataset.v='true';
    g.innerHTML=`<div class="gbox"><div class="glogo"><div class="mark">${document.querySelector('.logo .mark')?.innerHTML||''}</div><span>Lenz<b>App</b></span></div>
      <div style="font-size:46px;text-align:center">📧</div><h2 style="text-align:center;margin:4px 0 8px">Attiva il tuo account</h2>
      <p class="gsub">Ti ho inviato un'email a <b>${esc(C.user.email||'')}</b> con il link di attivazione. Aprilo e torna qui: l'app si sblocca da sola.</p>
      <p class="small mut" style="text-align:center;margin:-4px 0 14px">Non la trovi? Guarda nella cartella spam o promozioni.</p>
      <button class="btn full" style="margin-bottom:10px" onclick="CLOUD.checkVerify(true)">✅ Ho attivato l'account</button>
      <button class="btn ghost full" style="margin-bottom:10px" onclick="CLOUD.resendVerify()">📧 Invia di nuovo l'email</button>
      <div class="small" style="text-align:center"><u style="cursor:pointer" onclick="CLOUD.cancelVerify()">Usa un altro account</u></div></div>`;
    document.body.appendChild(g);document.body.classList.add('gated');return;
  }
  g=document.createElement('div');g.id='gate';g.dataset.v='false';
  g.innerHTML=`<div class="gbox"><div class="glogo"><div class="mark">${document.querySelector('.logo .mark')?.innerHTML||''}</div><span>Lenz<b>App</b></span></div>
    <p class="gsub">Accedi per usare l'app: spot, diario e foto salvati online e sincronizzati su telefono e PC.</p>${C.form(true)}</div>`;
  document.body.appendChild(g);document.body.classList.add('gated');
};
C.card=()=>{
  if(!window.LENZA_FB?.apiKey||!C.user)return '';
  if(!C.ready)return `<div class="card"><h3>☁️ Account</h3><p class="small mut">${esc(C.status||'Carico…')}</p></div>`;
  if(C.user)return `<div class="card"><h3>☁️ Account</h3>
    <div class="kv"><span>Accesso come</span><b style="word-break:break-all">${esc(C.user.email||C.user.displayName||'utente')}${typeof isPremium==='function'&&isPremium()?' ⭐':''}</b></div>
    <p class="small" id="cloudst" style="margin:8px 0;color:var(--ok)">${esc(C.status||'')}</p>
    <p class="small mut">Spot, diario con le foto, catture, trofei e impostazioni sono salvati online e sincronizzati su tutti i dispositivi in cui accedi con questo account.</p>
    <div class="row" style="gap:8px;margin-top:8px"><button class="btn ghost" style="flex:1" onclick="CLOUD.syncNow()">↻ Sincronizza ora</button><button class="btn ghost" style="flex:1" onclick="CLOUD.logout()">Esci</button></div></div>`;
  return `<div class="card">${C.form().replace('<h2>','<h3>').replace('</h2>','</h3>')}</div>`;
};
C.form=(big)=>`${big?'':'<h2>☁️ Accedi o registrati</h2>'}
    ${big?'':'<p class="small mut" style="margin-bottom:10px">Con un account i tuoi dati sono salvati online e li ritrovi su telefono e PC.</p>'}
    <button class="btn full" style="margin-bottom:12px;background:#fff;color:#1f1f1f" onclick="CLOUD.google()"><svg viewBox="0 0 48 48" width="18" height="18" style="vertical-align:-3px;margin-right:6px"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Accedi con Google</button>
    <button class="btn full" disabled aria-disabled="true" title="Accesso con Apple non ancora disponibile" style="margin-bottom:12px;background:#000;color:#fff;border:1px solid rgba(255,255,255,.25);filter:blur(1.6px);opacity:.55;pointer-events:none;cursor:default"><svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" style="vertical-align:-3px;margin-right:6px"><path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.27-1.6 2.78-.41 6.9 1.15 9.16.77 1.1 1.68 2.34 2.87 2.3 1.15-.05 1.59-.75 2.98-.75 1.39 0 1.78.75 3 .72 1.24-.02 2.02-1.12 2.78-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.43-3.67zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28z"/></svg>Accedi con Apple</button>
    <div class="small mut" style="text-align:center;margin-bottom:8px">oppure con email e password</div>
    <input id="cle" type="email" placeholder="Email" autocomplete="email" style="margin-bottom:8px">
    <input id="clp" type="password" placeholder="Password (almeno 6 caratteri)" autocomplete="current-password">
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn" style="flex:1" onclick="CLOUD.login()">Accedi</button><button class="btn ghost" style="flex:1" onclick="CLOUD.register()">Registrati</button></div>
    <div class="small" style="margin-top:8px;text-align:center"><u style="cursor:pointer" onclick="CLOUD.reset()">Password dimenticata?</u></div>
    ${C.status?`<p class="small" style="margin-top:8px;color:var(--acc2)">${esc(C.status)}</p>`:''}`;
init();
})();
