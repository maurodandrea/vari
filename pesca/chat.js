// Chat di LenzApp (funzione Premium): canali per zona, catture condivise, condizioni in diretta, amici e messaggi privati,
// assistente in chat, spot protetti, moderazione e notifiche. Usa lo stesso progetto Firebase degli account (cloud.js).
// Firestore:
//   profiles/{uid}              nome e codice amico di ogni utente
//   rooms/{rid}                 stanze: 'zone' (pubbliche, per zona), 'dm' (due persone), 'group' (gruppo di amici)
//   rooms/{rid}/msgs/{id}       messaggi: testo, cattura, condizioni del mare
//   notifs/{uid}/items/{id}     avvisi per l'utente (risposte ai suoi messaggi)
//   reports/{id}                segnalazioni dei messaggi
(function(){
const CH={rid:null,tab:'zone',msgs:[],unsubRoom:null,subs:{},rooms:{},mine:{},notifs:[],reply:null,started:false,t0:Date.now(),botBusy:false};
window.CHAT=CH;
const C=()=>window.CLOUD,F=()=>C().ff,D=()=>C().db,me=()=>C()?.user;
const ADMINS=['chesterfieldsoftred@gmail.com'];  // amministratori: vedono e gestiscono le segnalazioni (vedi anche firestore.rules)
const COND_H=6;  // le condizioni del mare restano visibili 6 ore
const REP_HIDE=3; // messaggio nascosto dopo 3 segnalazioni
const uidCode=u=>{let h=7;for(const c of u)h=(h*131+c.charCodeAt(0))>>>0;return h.toString(36).toUpperCase().padStart(6,'0').slice(-6);};
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
// lettura sicura delle impostazioni della chat: un valore vuoto o rovinato (per esempio arrivato dall'account)
// viene sostituito dal valore predefinito invece di mandare Social in errore
function G(k,def){let v;try{v=LS.get(k,def);}catch(e){return def;}
  if(def===null)return v;
  if(Array.isArray(def))return Array.isArray(v)?v.filter(x=>x!=null):def;
  if(def&&typeof def==='object')return v&&typeof v==='object'&&!Array.isArray(v)?v:{...def};
  return v==null?def:v;}
const seen=()=>G('chatseen',{});
// errore di un ascolto in tempo reale: lo mostro con il nome dell'operazione rifiutata
const snapErr=label=>e=>{CH.err=(e.code==='permission-denied'?'Social non ha i permessi su Firebase: pubblica le regole aggiornate (file firestore.rules) in Console Firebase › Firestore Database › Regole.':'Social non raggiungibile: '+(e.code||e.message))+` [ascolto: ${label} · ${String(e.message||'').slice(0,120)}]`;if(S.tab==='chat')render();};
const friends=()=>G('chatfriends',[]).filter(f=>f&&typeof f.uid==='string').map(f=>({uid:f.uid,name:String(f.name||'Amico')}));
const blocked=()=>G('chatblock',[]).filter(x=>typeof x==='string');
const NOTIF_DEF={on:true,zones:false};  // predefinito: avvisi dei nuovi messaggi sì, canali seguiti no
const notifSet=()=>({...NOTIF_DEF,...G('chatnotif',{})});
const notifOn=()=>notifSet().on!==false;

/* ---------- filtro parole offensive ---------- */
const BAD=['cazz','minchi','stronz','vaffancul','fancul','coglion','puttan','troi','merd','bastard','porco ?dio','porcodio','dio ?cane','diocane','porca ?madonna','froci','ricchion','negr[oiae]','mongoloid','zoccol','frocio'];
const BADRE=new RegExp('\\b('+BAD.join('|')+')\\w*','gi');
const clean=t=>String(t||'').replace(BADRE,w=>w[0]+'*'.repeat(Math.max(2,w.length-1)));

/* ---------- canali: Italia › Regione › Provincia › Comune ---------- */
const placeName=sp=>(sp.name||'').replace(/^Posizione attuale( · )?/,'').trim()||'Posizione attuale';
let GEO=null,GEOP=null;  // comuni.json: [codice regione, nome, [[codice provincia, nome, sigla, [[comune, codice, lat, lon]]]]]
const loadGeo=()=>GEOP||(GEOP=fetch('comuni.json').then(r=>r.json()).then(j=>{GEO=j;defaultFollow();syncSubs();refresh();return j;}).catch(()=>{GEOP=null;return null;}));
const reg=c=>GEO?.r.find(r=>r[0]===c);
const prov=c=>{for(const r of GEO?.r||[])for(const p of r[2])if(p[0]===c)return [p,r];return null;};
const com=c=>{for(const r of GEO?.r||[])for(const p of r[2])for(const x of p[3])if(x[1]===c)return [x,p,r];return null;};
const km=(a,b,c,d)=>{const R=6371,t=Math.PI/180,x=Math.sin((c-a)*t/2)**2+Math.cos(a*t)*Math.cos(c*t)*Math.sin((d-b)*t/2)**2;return 2*R*Math.asin(Math.sqrt(x));};
// comune dello spot attivo: il più vicino tra quelli con coordinate
function myPlace(sp=activeSpot()){if(!GEO||!sp||sp.lat==null)return null;let best=null,bd=1e9;
  for(const r of GEO.r)for(const p of r[2])for(const x of p[3]){if(x.length<4)continue;const d=(x[2]-sp.lat)**2+((x[3]-sp.lon)*Math.cos(sp.lat*Math.PI/180))**2;if(d<bd){bd=d;best={c:x,p,r};}}
  return best;}
const chName=rid=>{if(rid==='z_it')return 'Tutta Italia';if(rid==='near'){const sp=activeSpot();return 'Entro 5km da '+(sp?placeName(sp):'spot attuale');}const t=rid.slice(0,2),c=rid.slice(2);
  if(t==='r_'){const r=reg(c);return r?'Regione '+r[1]:null;}
  if(t==='p_'){const q=prov(c);return q?'Provincia di '+q[0][1]:null;}
  if(t==='c_'){const q=com(c);return q?`${q[0][0]} (${q[1][2]})`:null;}return null;};
const chIcon=rid=>rid==='z_it'?'🇮🇹':rid==='near'?'🎣':rid.startsWith('r_')?'🗺️':rid.startsWith('p_')?'🏙️':rid.startsWith('c_')?'🏘️':'📍';
// canali seguiti (avvisi e anteprima): in automatico il comune di ogni spot, uno per comune; Italia, regione e provincia a scelta.
// Ogni spot viene considerato una volta sola (chatspotc): se poi smetti di seguire quel comune, non lo riaggiungo.
const follows=()=>{const f=G('chatfollow',null);return Array.isArray(f)?f.filter(x=>typeof x==='string'&&/^(z_it|r_|p_|c_)/.test(x)):[];};
// comune di uno spot: lo chiedo a OpenStreetMap (Ostia → Roma, non il comune col centro più vicino);
// senza rete uso il comune con il centro più vicino
async function placeOf(sp){
  try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${sp.lat}&lon=${sp.lon}&zoom=10&accept-language=it`);
    const a=(await r.json()).address||{},name=a.city||a.town||a.village||a.municipality||'',sig=(a['ISO3166-2-lvl6']||'').replace('IT-','');
    if(name)for(const rg of GEO.r)for(const p of rg[2]){if(sig&&p[2]!==sig)continue;const x=p[3].find(c=>norm(c[0])===norm(name));if(x)return {c:x,p,r:rg};}
  }catch(e){}
  return myPlace(sp);}
// spot cancellato: tolgo dai seguiti il suo comune, se nessun altro spot rimasto è nello stesso comune
function dropDeleted(){const done=G('chatspotc',{}),ids=new Set((S.spots||[]).filter(s=>!s.here).map(s=>s.id));
  const gone=Object.keys(done).filter(id=>!ids.has(id));if(!gone.length)return;
  const keep=new Set(Object.entries(done).filter(([id])=>ids.has(id)).map(([,r])=>r));
  const drop=new Set(gone.map(id=>done[id]).filter(r=>!keep.has(r)));gone.forEach(id=>delete done[id]);
  LS.set('chatspotc',done);LS.set('chatfollow',follows().filter(r=>!drop.has(r)));syncSubs();}
CH.spotsChanged=()=>{if(GEO&&CH.started)dropDeleted();};
// la posizione attuale non è uno spot vero: non conta per i canali seguiti in automatico
async function defaultFollow(){if(!GEO||CH._df)return;dropDeleted();CH._df=true;
  try{
    let f=follows(),done=G('chatspotc',{});
    if(!G('chatfollow2',false)){const m=myPlace();if(m){const old=['z_it','r_'+m.r[0],'p_'+m.p[0]];f=f.filter(x=>!old.includes(x));}LS.set('chatfollow2',true);}
    // versione 3: i comuni scelti prima col centro più vicino possono essere sbagliati: li ricalcolo
    if(!G('chatspotc3',false)){const auto=new Set(Object.values(done));f=f.filter(x=>!auto.has(x));done={};LS.set('chatspotc3',true);LS.set('chatfollow',f);LS.set('chatspotc',done);}
    for(const sp of S.spots||[]){if(sp.here||sp.lat==null||done[sp.id])continue;
      const m=await placeOf(sp);if(!m)continue;const rid='c_'+m.c[1];
      f=follows();done=G('chatspotc',{});done[sp.id]=rid;if(!f.includes(rid))f.push(rid);
      LS.set('chatfollow',f);LS.set('chatspotc',done);syncSubs();refresh();
      await new Promise(r=>setTimeout(r,1100));}  // OpenStreetMap chiede al massimo una richiesta al secondo
  }finally{CH._df=false;}
}
CH.follow=rid=>{const f=follows();LS.set('chatfollow',f.includes(rid)?f.filter(x=>x!==rid):[...f,rid]);syncSubs();render();};
async function ensureRoom(rid){const ff=F(),ref=ff.doc(D(),'rooms',rid);const s=await ff.getDoc(ref);
  if(!s.exists())await ff.setDoc(ref,{type:'zone',name:chName(rid)||'Canale',t:Date.now()});}
// ascolto dei canali seguiti: aggiungo i nuovi, tolgo quelli non più seguiti
async function syncSubs(){if(!CH.started)return;const ff=F(),want=new Set(follows());
  for(const k of Object.keys(CH.subs))if(k.startsWith('f:')&&!want.has(k.slice(2))){CH.subs[k]();delete CH.subs[k];}
  for(const rid of want){const k='f:'+rid;if(CH.subs[k])continue;CH.subs[k]=()=>{};
    ensureRoom(rid).catch(()=>{});listenChan(rid,0);}}
// ascolto di un canale: se viene rifiutato (per esempio perché la stanza non esisteva ancora) la creo e riprovo;
// al secondo rifiuto lascio perdere quel canale senza bloccare il resto della chat
function listenChan(rid,n){const ff=F(),k='f:'+rid;
  CH.subs[k]=ff.onSnapshot(ff.doc(D(),'rooms',rid),s=>{if(!s.exists())return;const old=CH.rooms[rid]?.last?.ts||0;CH.rooms[rid]={id:rid,...s.data()};onRoom(rid,old);},
    async e=>{CH.diag=`${rid}: ${e.code||''} ${e.message||''}`.slice(0,300);console.warn('LenzApp chat',CH.diag);
      if(n>=1||!follows().includes(rid)){delete CH.subs[k];return;}
      try{await ensureRoom(rid);}catch(x){}await new Promise(r=>setTimeout(r,2000));if(CH.started&&follows().includes(rid))listenChan(rid,n+1);});}

/* ---------- canale dello spot: solo chi ha lo spot attivo entro 5 km ---------- */
// i messaggi portano una posizione approssimata (circa 1 km) e una cella geohash di 4 caratteri per cercarli;
// la posizione non viene mai mostrata, serve solo a calcolare la distanza
const NEAR_KM=5,GH='0123456789bcdefghjkmnpqrstuvwxyz';
function geohash(lat,lon,p=4){let a=[-90,90],b=[-180,180],h='',bit=0,ch=0,ev=true;
  while(h.length<p){const r=ev?b:a,v=ev?lon:lat,m=(r[0]+r[1])/2;if(v>=m){ch=ch*2+1;r[0]=m;}else{ch=ch*2;r[1]=m;}ev=!ev;if(++bit===5){h+=GH[ch];bit=0;ch=0;}}return h;}
function nearCells(lat,lon){const dy=NEAR_KM/111,dx=NEAR_KM/(111*Math.cos(lat*Math.PI/180)),out=new Set();
  for(const a of [-dy,0,dy])for(const b of [-dx,0,dx])out.add(geohash(lat+a,lon+b));return [...out];}
CH.nearMsgs=[];
function nearSync(){const sp=activeSpot();const key=sp&&sp.lat!=null?nearCells(sp.lat,sp.lon).join(','):'';
  if(key===CH.nearKey)return;CH.nearKey=key;CH.subs._near?.();delete CH.subs._near;CH.nearAll=new Map();CH.nearMsgs=[];CH.nearLoaded=false;if(!key||!CH.started)return;
  const ff=F();ensureRoom('near').catch(()=>{});
  CH.subs._near=ff.onSnapshot(ff.query(ff.collection(D(),'rooms','near','msgs'),ff.where('g','in',key.split(','))),snap=>{
    snap.docChanges().forEach(c=>{if(c.type==='removed')CH.nearAll.delete(c.doc.id);else CH.nearAll.set(c.doc.id,{id:c.doc.id,...c.doc.data()});});
    CH.nearLoaded=true;if(CH.rid==='near'){CH.loaded=true;CH.slow=false;}
    const sp=activeSpot(),old=CH.nearMsgs.at(-1)?.ts||0;
    CH.nearMsgs=[...CH.nearAll.values()].filter(m=>m.la!=null&&km(sp.lat,sp.lon,m.la,m.lo)<=NEAR_KM).sort((a,b)=>a.ts-b.ts).slice(-80);
    const l=CH.nearMsgs.at(-1);if(l)CH.rooms.near={id:'near',type:'zone',name:'Entro 5km',last:{text:l.text||(l.kind==='catch'?'🐟 '+(l.catch?.sp||''):'🌊 condizioni'),name:l.name,uid:l.uid,ts:l.ts}};
    if(CH.rid==='near'){CH.msgs=CH.nearMsgs;if(S.tab==='chat')markSeen('near');}
    if(l&&l.ts>old)onRoom('near',old);else refresh();},snapErr('spot vicini'));}

const roomName=rid=>{const r=CH.rooms[rid]||CH.mine[rid];if(rid==='bot')return 'Assistente';const cn=chName(rid);if(cn)return cn;if(!r)return 'Chat';
  if(r.type==='dm'){const o=(r.members||[]).find(u=>u!==me()?.uid);return (r.names||{})[o]||'Messaggio privato';}return r.name||'Chat';};

/* ---------- avvio: profilo, stanze e ascolto delle novità ---------- */
CH.start=async()=>{
  if(CH.started||!me()||!C().ff||typeof isPremium!=='function'||!isPremium())return;
  CH.started=true;const ff=F(),db=D(),u=me();let step='profilo';
  try{
    // email appena attivata: il token di accesso può essere ancora quello vecchio («email non verificata») e Firebase
    // rifiuterebbe tutto per un'ora; lo rinnovo subito
    try{const t=await u.getIdTokenResult?.();if(t&&u.emailVerified&&t.claims?.email_verified!==true)await u.getIdToken(true);}catch(e){}
    // il profilo si salva in sottofondo: gli ascolti partono subito (con rete lenta la scrittura può metterci molto)
    ff.setDoc(ff.doc(db,'profiles',u.uid),{name:C().name(),code:uidCode(u.uid),t:Date.now()},{merge:true}).catch(e=>{CH.diag='profilo: '+(e.code||e.message);});
    step='ascolti';
    loadGeo();if(GEO)defaultFollow();syncSubs();nearSync();pruneFriends();if(locVis()!=='off'){pushLoc(false);startLocTimer();}
    // amicizie fatte prima che esistessero le richieste: avviso una volta gli amici, così possono ricambiare
    if(!G('chatfriendsync',false)){friends().forEach(f=>tellFriend(f.uid,false));LS.set('chatfriendsync',true);}
    CH.subs._mine=ff.onSnapshot(ff.query(ff.collection(db,'rooms'),ff.where('members','array-contains',u.uid)),snap=>{
      snap.docChanges().forEach(c=>{const id=c.doc.id;if(c.type==='removed'){delete CH.mine[id];return;}const old=CH.mine[id]?.last?.ts||0;CH.mine[id]={id,...c.doc.data()};checkGone(CH.mine[id]);onRoom(id,old);});
      refresh();},snapErr('stanze private'));
    CH.subs._ban=ff.onSnapshot(ff.doc(db,'banned',u.uid),s=>{CH.banned=s.exists();if(S.tab==='chat'&&CH.rid)render();},snapErr('blocco'));
    if(CH.isAdmin())CH.subs._rep=ff.onSnapshot(ff.collection(db,'reports'),snap=>{
      snap.docChanges().forEach(c=>{CH.reports=CH.reports.filter(r=>r.id!==c.doc.id);if(c.type!=='removed')CH.reports.push({id:c.doc.id,...c.doc.data()});});
      CH.badge();if(S.tab==='mod'||S.tab==='altro')render();},snapErr('segnalazioni'));
    CH.subs._notif=ff.onSnapshot(ff.collection(db,'notifs',u.uid,'items'),snap=>{
      snap.docChanges().forEach(c=>{if(c.type==='removed')return;const n={id:c.doc.id,...c.doc.data()};if(CH.notifs.some(x=>x.id===n.id))return;
        if(n.kind==='friend'){gotFriend(n);return;}
        CH.notifs.push(n);
        if(n.ts>CH.t0&&!blocked().includes(n.fromUid)&&notifies(n.rid))notify(`${n.from} ti ha risposto`,clean(n.text),n.rid);});
      CH.notifs.sort((a,b)=>b.ts-a.ts);refresh();},snapErr('avvisi'));
  }catch(e){
    // permessi negati: un tentativo con il token rinnovato prima di mostrare l'errore
    if(e.code==='permission-denied'&&!CH.retried){CH.retried=true;CH.started=false;Object.values(CH.subs).forEach(f=>{try{f();}catch(x){}});CH.subs={};
      try{await u.getIdToken(true);}catch(x){}return CH.start();}
    CH.err=(e.code==='permission-denied'?'Social non ha i permessi su Firebase: pubblica le regole aggiornate (file firestore.rules) in Console Firebase › Firestore Database › Regole.':'Social non raggiungibile: '+(e.code||e.message))+
      ` [passo: ${step} · accesso: ${(u.providerData||[]).map(p=>p.providerId).join(',')||'?'} · email verificata: ${u.emailVerified?'sì':'no'}]`;
    CH.started=false;Object.values(CH.subs).forEach(f=>{try{f();}catch(x){}});CH.subs={};if(S.tab==='chat')render();else refresh();}
};
CH.isAdmin=()=>{const u=me();return !!u&&u.emailVerified!==false&&ADMINS.includes((u.email||'').toLowerCase());};
CH.reports=[];
CH.reportCount=()=>new Set(CH.reports.map(r=>r.rid+'/'+r.mid)).size;
CH.stop=()=>{clearInterval(CH._locT);CH.locMode=null;Object.values(CH.subs).forEach(f=>{try{f();}catch(e){}});CH.subs={};CH.unsubRoom?.();CH.unsubRoom=null;CH.started=false;};
// nuova attività in una stanza: avviso se il messaggio è di un altro e non sto già guardando quella stanza
function onRoom(rid,oldTs){
  const r=CH.rooms[rid]||CH.mine[rid],l=r?.last;
  if(l&&l.ts>oldTs&&l.ts>CH.t0&&l.uid!==me()?.uid&&!blocked().includes(l.uid)){
    const watching=CH.rid===rid&&S.tab==='chat'&&document.visibilityState==='visible';
    if(watching)markSeen(rid);
    else if(notifies(rid)&&(r.type!=='zone'||notifSet().zones===true))notify(roomName(rid),`${l.name}: ${clean(l.text)}`,rid);
  }
  refresh();
}
function notify(title,body,rid){
  CH.badge();
  if(!notifOn())return;
  if(document.visibilityState==='visible'){if(S.tab!=='chat'||CH.rid!==rid)toast('💬 '+title+' · '+String(body).slice(0,60));return;}
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  navigator.serviceWorker?.ready.then(r=>r.showNotification(title,{body:String(body).slice(0,140),icon:'icon-192.png',badge:'icon-192.png',tag:'lenza-'+rid,data:{url:location.pathname+'#chat',rid}})).catch(()=>{try{new Notification(title,{body});}catch(e){}});
}
// conversazioni che danno notifiche: messaggi privati, gruppi di cui sono membro e canali che seguo
const notifies=rid=>!!CH.mine[rid]||follows().includes(rid);
// non letti: solo quelle conversazioni (le chat eliminate contano solo per i messaggi arrivati dopo)
CH.unread=()=>{const s=seen(),u=me()?.uid,cl=cleared(),bl=blocked();let n=0;
  const gn=new Set(goneRooms());
  for(const id of new Set([...follows(),...Object.keys(CH.mine)])){if(gn.has(id))continue;const r=CH.rooms[id]||CH.mine[id],l=r?.last;if(l&&l.uid!==u&&l.ts>Math.max(s[id]||0,cl[id]||0)&&!bl.includes(l.uid))n++;}
  return n;};
CH.badge=()=>{
  const a=document.querySelector(`#nav button[onclick="go('altro')"]`),rc=CH.isAdmin()?CH.reportCount():0;
  if(a){let e=a.querySelector('.cbadge');if(!rc)e?.remove();else{if(!e){e=document.createElement('i');e.className='cbadge';a.appendChild(e);}e.textContent=rc>9?'9+':rc;e.title='Segnalazioni da controllare';}}
  const b=document.querySelector(`#nav button[onclick="go('chat')"]`);if(!b)return;let el=b.querySelector('.cbadge');const n=CH.unread();
  if(!n){el?.remove();return;}if(!el){el=document.createElement('i');el.className='cbadge';b.appendChild(el);}el.textContent=n>9?'9+':n;};
function readNotifs(rid){const ff=F();for(const x of CH.notifs.filter(n=>n.rid===rid&&!n.read)){x.read=true;try{ff.deleteDoc(ff.doc(D(),'notifs',me().uid,'items',x.id)).catch(()=>{});}catch(e){}}
  CH.notifs=CH.notifs.filter(n=>n.rid!==rid);CH.badge();}
function markSeen(rid){const s=seen();s[rid]=Date.now();LS.set('chatseen',s);CH.badge();}
// aggiorno solo la parte che cambia, così il testo che si sta scrivendo non si perde
function refresh(){CH.badge();if(S.tab!=='chat')return;
  if(CH.rid){const log=document.getElementById('chatlog');if(log){const atEnd=log.scrollHeight-log.scrollTop-log.clientHeight<80;log.innerHTML=logHtml();if(atEnd)log.scrollTop=log.scrollHeight;}}
  else if(CH.tab==='mappa')mapMarkers();
  else{const box=document.getElementById('chatlist');if(box)box.innerHTML=listHtml();}}

/* ---------- pagina ---------- */
CH.view=v=>{
  // accesso ancora in caricamento (app appena aperta): niente «Accedi», solo l'attesa
  if(!me()&&window.LENZA_FB?.apiKey&&!C()?.authKnown){v.innerHTML=subHead('Social','Canali, messaggi, mappa e amici','home')+`<div class="card" style="text-align:center;padding:30px"><span class="aispin" style="width:28px;height:28px;border-width:3px;display:inline-block"></span><p class="mut">Carico Social…</p></div>`;return;}
  if(!me()){v.innerHTML=subHead('Social','Funzione Premium','home')+`<div class="card"><p class="mut">Accedi con il tuo account per usare Social.</p><button class="btn" onclick="CLOUD.open()">Accedi</button></div>`;return;}
  CH.start();nearSync();
  // avvisi attivi di default: alla prima apertura di Social chiedo il permesso per le notifiche del telefono
  if(notifOn()&&'Notification' in window&&Notification.permission==='default'&&!G('chatnotifask',false)){LS.set('chatnotifask',true);try{Notification.requestPermission();}catch(e){}}
  if(CH.rid)return roomView(v);
  const tabs=[['zone','📍 Canali'],['priv','💬 Messaggi'],['mappa','🗺️ Mappa'],['amici','🤝 Amici'],['bot','🤖 Assistente']];
  v.innerHTML=subHead('Social','Canali, messaggi, mappa e amici','home')+(CH.err?`<div class="banner">⚠️ ${esc(CH.err)}</div>`:'')+
    `<div class="chips" style="margin-bottom:12px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none">${tabs.map(([k,n])=>`<span class="chip ${CH.tab===k?'on':''}" style="flex:none;white-space:nowrap" onclick="CHAT.tab='${k}';render()">${n}</span>`).join('')}</div><div id="chatlist">${listHtml()}</div>`;
  if(CH.tab==='mappa')setTimeout(mapInit,0);
};
const ago=ts=>{const m=Math.round((Date.now()-ts)/60000);return m<1?'ora':m<60?m+' min':m<1440?Math.round(m/60)+' h':new Date(ts).toLocaleDateString('it-IT',{day:'numeric',month:'short'});};
function roomRow(rid,icon,sub){
  const r=CH.rooms[rid]||CH.mine[rid],l0=r?.last,l=l0&&l0.ts>(cleared()[rid]||0)?l0:null,s=seen(),un=l&&l.uid!==me()?.uid&&l.ts>(s[rid]||0)&&!blocked().includes(l.uid);
  return `<div class="croom" onclick="CHAT.open('${rid}')"><div class="cri">${icon}</div><div style="flex:1;min-width:0"><b>${esc(roomName(rid))}</b>
    <div class="small mut cprev">${l&&!blocked().includes(l.uid)?esc(l.name+': '+clean(l.text)):esc(sub||'Nessun messaggio: scrivi tu per primo')}</div></div>
    <div style="text-align:right">${l?`<div class="small mut">${ago(l.ts)}</div>`:''}${un&&notifies(rid)?'<i class="cdot"></i>':''}</div></div>`;
}
function listHtml(){
  if(CH.tab==='zone')return chanHtml()+notifCard()+(CH.diag?`<p class="small mut" style="text-align:center;opacity:.6">Diagnosi: ${esc(CH.diag)}</p>`:'');
  if(CH.tab==='mappa')return mapHtml();
  if(CH.tab==='priv'){const cl=cleared(),gn=new Set(goneRooms());const rs=Object.values(CH.mine).filter(r=>!gn.has(r.id)&&(!cl[r.id]||(r.last?.ts||0)>cl[r.id])).sort((a,b)=>(b.last?.ts||b.t||0)-(a.last?.ts||a.t||0));
    return `<div class="card"><h3>💬 Messaggi privati e gruppi</h3>${rs.length?rs.map(r=>roomRow(r.id,r.type==='group'?'👥':'💬','')).join(''):'<p class="small mut">Nessuna conversazione. Aggiungi un amico nella scheda «Amici» e scrivigli.</p>'}
      <button class="btn ghost full" style="margin-top:10px" onclick="CHAT.newGroup()">➕ Nuovo gruppo di pesca</button></div>`;}
  if(CH.tab==='bot')return `<div class="card"><h3>🤖 Assistente in chat</h3><p class="small mut">Chiedi esche, montature, tecniche e orari migliori: risponde con il meteo, il mare e l'indice di pescosità del tuo spot attivo${typeof gemOn==='function'&&gemOn()?' (con Gemini)':''}.</p>${roomRow('bot','🤖','Fai una domanda')}</div>`;
  const fr=friends(),bl=blocked(),code=uidCode(me().uid);
  const req=CH.friendReqs.length?`<div class="card"><h3>📩 Ti hanno aggiunto agli amici</h3>${CH.friendReqs.map(x=>`<div class="croom" style="cursor:default"><div class="cri">🎣</div><div style="flex:1"><b>${esc(x.from)}</b><div class="small mut">Aggiungilo anche tu per vedervi sulla mappa</div></div><button class="btn" style="padding:7px 12px" onclick="CHAT.acceptFriend('${x.id}')">Aggiungi</button><button class="btn ghost" style="padding:7px 10px" onclick="CHAT.ignoreFriend('${x.id}')">✕</button></div>`).join('')}</div>`:'';
  return req+`<div class="card"><h3>🤝 Il tuo codice amico</h3><div class="ccode">${code}</div><p class="small mut" style="text-align:center">Dallo ai tuoi compagni di pesca: con questo codice ti aggiungono agli amici.</p>
    <div class="row" style="gap:8px;margin-top:8px"><input id="fcode" placeholder="Codice di un amico" maxlength="6" style="flex:1;text-transform:uppercase"><button class="btn" onclick="CHAT.addByCode()">Aggiungi</button></div></div>
  <div class="card"><h3>Amici</h3>${fr.length?fr.map(f=>`<div class="croom"><div class="cri">🎣</div><div style="flex:1"><b>${esc(f.name)}</b></div><button class="btn" style="padding:7px 12px" onclick="CHAT.dm('${f.uid}')">Scrivi</button><button class="btn ghost" style="padding:7px 10px" onclick="CHAT.unfriend('${f.uid}')">✕</button></div>`).join(''):'<p class="small mut">Nessun amico ancora.</p>'}</div>
  ${bl.length?`<div class="card"><h3>🚫 Utenti bloccati</h3><p class="small mut">Non vedi i loro messaggi.</p>${bl.map(u=>`<div class="croom"><div style="flex:1">${esc((G('chatblocknames',{})[u])||'Utente')}</div><button class="btn ghost" style="padding:7px 12px" onclick="CHAT.unblock('${u}')">Sblocca</button></div>`).join('')}</div>`:''}`;
}
// albero dei canali: Italia ▸ regioni ▸ province ▸ comuni; la freccia apre il livello sotto, il nome apre il canale
CH.exp={it:false,r:{},p:{},q:{}};
CH.tog=k=>{const [t,c]=k.split(':');if(t==='it')CH.exp.it=!CH.exp.it;else CH.exp[t][c]=!CH.exp[t][c];refresh();};
CH.navQ=(p,q)=>{CH.exp.q[p]=q;const el=document.getElementById('com_'+p);if(el)el.innerHTML=comRows(p);};
const norm=t=>String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function tRow(rid,icon,name,sub,key,open,depth){
  const r=CH.rooms[rid],l=r?.last,s=seen(),un=l&&l.uid!==me()?.uid&&l.ts>(s[rid]||0)&&!blocked().includes(l.uid);
  return `<div class="croom ctree" style="padding-left:${depth*18}px" onclick="CHAT.open('${rid}')">
    ${key?`<button class="ctog" onclick="event.stopPropagation();CHAT.tog('${key}')" aria-label="${open?'Chiudi':'Apri'}">${open?'▾':'▸'}</button>`:'<span class="ctog sp"></span>'}
    <div class="cri">${icon}</div><div style="flex:1;min-width:0"><b>${esc(name)}</b>${sub?`<div class="small mut cprev">${esc(sub)}</div>`:''}</div>
    ${follows().includes(rid)?'<span class="small" title="Segui">⭐</span>':''}${un&&notifies(rid)?'<i class="cdot"></i>':''}</div>`;}
function comRows(pc){const q=prov(pc);if(!q)return '';const f=norm(CH.exp.q[pc]||'');
  const l=q[0][3].filter(x=>!f||norm(x[0]).includes(f));
  return l.map(x=>tRow('c_'+x[1],'🏘️',x[0],'',null,false,3)).join('')||'<p class="small mut" style="padding-left:72px">Nessun comune trovato.</p>';}
function treeHtml(){
  if(!GEO)return '<p class="small mut">Carico regioni e comuni…</p>';
  const e=CH.exp;let h=tRow('z_it','🇮🇹','Tutta Italia','Tutti i pescatori di LenzApp','it',e.it,0);
  if(e.it)for(const r of GEO.r){h+=tRow('r_'+r[0],'🗺️',r[1],'','r:'+r[0],!!e.r[r[0]],1);
    if(e.r[r[0]])for(const p of r[2]){h+=tRow('p_'+p[0],'🏙️','Provincia di '+p[1],`${p[2]} · ${p[3].length} comuni`,'p:'+p[0],!!e.p[p[0]],2);
      if(e.p[p[0]])h+=`<div style="padding-left:54px"><input placeholder="Cerca un comune" value="${esc(e.q[p[0]]||'')}" oninput="CHAT.navQ('${p[0]}',this.value)" onclick="event.stopPropagation()" style="margin:6px 0"></div><div id="com_${p[0]}">${comRows(p[0])}</div>`;}}
  return h;}
function chanHtml(){
  loadGeo();defaultFollow();const sp=activeSpot(),fol=follows();
  const near=sp?roomRow('near','🎣',`Spot attuale · pescatori con lo spot a meno di ${NEAR_KM} km`):'<p class="small mut">Scegli uno spot per vedere chi pesca vicino a te.</p>';
  return `<div class="card"><h3>🎣 Il tuo spot</h3><p class="small mut" style="margin:-4px 0 6px">Ci sono solo i pescatori che hanno lo spot attivo a meno di ${NEAR_KM} km dal tuo. La tua posizione non viene mai mostrata.</p>${near}</div>
  <div class="card"><h3><span>⭐ Canali che segui <span style="text-transform:none;letter-spacing:0;font-weight:600;opacity:.75;white-space:nowrap">(Default: Comuni dei tuoi Spot)</span></span></h3>${fol.map(rid=>roomRow(rid,chIcon(rid),'')).join('')||'<p class="small mut" style="margin:0 0 6px">Nessun canale seguito.</p>'}<p class="small mut" style="margin:8px 0 0">Per seguire o smettere di seguire un canale aprilo e tocca ⭐ in alto.</p></div>
  <div class="card" id="chbrowse"><h3>🇮🇹 Tutti i canali</h3><p class="small mut" style="margin:-4px 0 6px">Tocca ▸ per aprire regioni, province e comuni; tocca il nome per entrare nel canale.</p>${treeHtml()}</div>`;
}
function notifCard(){
  const n=notifSet(),perm='Notification' in window?Notification.permission:'unsupported';
  const reps=CH.notifs.slice(0,5);
  return `${reps.length?`<div class="card"><h3>🔔 Risposte ai tuoi messaggi</h3>${reps.map(x=>`<div class="croom" onclick="CHAT.openNotif('${x.id}')"><div class="cri">↩️</div><div style="flex:1;min-width:0"><b>${esc(x.from)}</b> <span class="small mut">in ${esc(x.room||'')}</span><div class="small mut cprev">${esc(clean(x.text))}</div></div><div class="small mut">${ago(x.ts)}</div>${x.read?'':'<i class="cdot"></i>'}</div>`).join('')}</div>`:''}
  <div class="card"><h3>🔔 Notifiche</h3>
    <label class="crow"><input type="checkbox" ${n.on?'checked':''} onchange="CHAT.setNotif(this.checked)"> Avvisami dei nuovi messaggi</label>
    <label class="crow"><input type="checkbox" ${n.zones===true?'checked':''} onchange="CHAT.setNotifZones(this.checked)"> Anche per i canali che segui</label>
    <p class="small mut" style="margin:6px 0 0">${perm==='denied'?'⚠️ Le notifiche sono bloccate nelle impostazioni del browser.':perm==='unsupported'?'Questo browser non supporta le notifiche: vedrai gli avvisi dentro l\'app.':'Arrivano mentre LenzApp è aperta, anche in un\'altra scheda o in secondo piano. Messaggi privati e risposte ti avvisano sempre.'}</p></div>`;
}
CH.setNotif=async on=>{const n=notifSet();n.on=on;
  if(on&&'Notification' in window&&Notification.permission==='default'){try{await Notification.requestPermission();}catch(e){}}
  LS.set('chatnotif',n);render();};
CH.setNotifZones=on=>{const n=notifSet();n.zones=on;LS.set('chatnotif',n);};
CH.openNotif=async id=>{const x=CH.notifs.find(n=>n.id===id);if(!x)return;x.read=true;try{await F().deleteDoc(F().doc(D(),'notifs',me().uid,'items',id));}catch(e){}CH.notifs=CH.notifs.filter(n=>n.id!==id);CH.open(x.rid);};

/* ---------- stanza ---------- */
CH.open=rid=>{CH.rid=rid;CH.reply=null;CH.msgs=[];CH.unsubRoom?.();CH.unsubRoom=null;markSeen(rid);readNotifs(rid);CH.loaded=rid==='bot'||(rid==='near'&&CH.nearLoaded);CH.slow=false;
  clearTimeout(CH._wd);CH._wd=setTimeout(()=>{if(CH.rid===rid&&!CH.loaded){CH.slow=true;refresh();}},10000);
  if(rid==='near'){CH.msgs=CH.nearMsgs;}
  else if(rid!=='bot')listenMsgs(rid,0);
  if(S.tab!=='chat')go('chat');else render();};
function listenMsgs(rid,n){const ff=F();
  if(n===0&&/^(z_it|r_|p_|c_)/.test(rid))ensureRoom(rid).catch(()=>{});
  CH.unsubRoom=ff.onSnapshot(ff.query(ff.collection(D(),'rooms',rid,'msgs'),ff.orderBy('ts','desc'),ff.limit(80)),snap=>{
    if(CH.rid!==rid)return;
    const m=new Map(CH.msgs.map(x=>[x.id,x]));snap.docChanges().forEach(c=>{if(c.type==='removed')m.delete(c.doc.id);else m.set(c.doc.id,{id:c.doc.id,...c.doc.data()});});
    CH.msgs=[...m.values()].sort((a,b)=>a.ts-b.ts).slice(-80);CH.loaded=true;CH.slow=false;if(S.tab==='chat')markSeen(rid);refresh();},
    e=>{if(CH.rid!==rid)return;
      // il canale potrebbe non esistere ancora: lo creo e riprovo (fino a 2 volte) prima di mostrare l'errore
      if(n<2){ensureRoom(rid).catch(()=>{}).then(()=>setTimeout(()=>{if(CH.rid===rid)listenMsgs(rid,n+1);},1200));return;}
      CH.loaded=true;snapErr('messaggi di '+rid)(e);});}
CH.retry=()=>{const rid=CH.rid;if(!rid)return;if(!CH.started){CH.stop();CH.start();}CH.open(rid);};
CH.back=()=>{clearTimeout(CH._wd);CH.unsubRoom?.();CH.unsubRoom=null;CH.rid=null;CH.reply=null;render();};
function roomView(v){
  if(goneRooms().includes(CH.rid)){v.innerHTML=`<div class="subhead"><button class="back" onclick="CHAT.back()" aria-label="Indietro">‹</button><div><h2>Account cancellato</h2><p>Conversazione non più disponibile</p></div></div><div class="card" style="text-align:center;padding:26px"><div style="font-size:40px">🚫</div><p class="mut">L'account di questo utente è stato cancellato.</p></div>`;return;}
  const rid=CH.rid,r=CH.rooms[rid]||CH.mine[rid],bot=rid==='bot';
  const sub=bot?'Consigli su misura per il tuo spot':rid==='near'?`Spot attuale · chi ha lo spot a meno di ${NEAR_KM} km`:rid==='z_it'?'Canale nazionale':rid.startsWith('r_')?'Canale regionale':rid.startsWith('p_')?'Canale provinciale':rid.startsWith('c_')?'Canale comunale':r?.type==='zone'?'Canale pubblico':r?.type==='group'?`Gruppo · ${(r.members||[]).length} persone`:'Messaggio privato';
  const canFollow=/^(z_it|r_|p_|c_)/.test(rid),fol=follows().includes(rid),priv=r&&(r.type==='dm'||r.type==='group');
  v.innerHTML=`<div class="subhead"><button class="back" onclick="CHAT.back()" aria-label="Indietro">‹</button><div style="flex:1;min-width:0"><h2>${esc(roomName(rid))}</h2><p>${sub}</p></div>${priv?`<button class="btn ghost" style="padding:8px 14px;flex:none;font-size:18px" onclick="CHAT.roomMenu()" aria-label="Opzioni">⋯</button>`:''}${canFollow?`<button class="btn ${fol?'':'ghost'}" style="padding:8px 12px;flex:none" onclick="CHAT.follow('${rid}')" title="${fol?'Smetti di seguire':'Segui il canale'}">${fol?'⭐ Segui':'☆ Segui'}</button>`:''}</div>
  <div class="card chatcard"><div id="chatlog" class="chatlog">${logHtml()}</div>
    <div id="creply">${replyHtml()}</div>
    ${CH.banned&&!bot?'<div class="banner" style="margin:8px 0 0">🚫 Un amministratore ti ha bloccato: puoi leggere ma non scrivere in chat.</div>':`<div class="ccomp">${bot?'':`<button class="cbtn" title="Condividi una cattura" onclick="CHAT.shareCatch()">📸</button><button class="cbtn" title="Condizioni in diretta" onclick="CHAT.condSheet()">🌊</button>`}
      <textarea id="cmsg" rows="1" maxlength="1000" placeholder="${bot?'Chiedi all\'assistente…':'Scrivi un messaggio…'}" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();CHAT.send();}"></textarea>
      <button class="cbtn send" onclick="CHAT.send()" aria-label="Invia">➤</button></div>`}</div>`;
  const log=document.getElementById('chatlog');log.scrollTop=log.scrollHeight;
}
const hm=ts=>new Date(ts).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
function logHtml(){
  if(CH.rid==='bot'){const h=G('chatbot',[]);
    return (h.length?'':`<div class="cempty">🤖 Ciao! Chiedimi per esempio:<br><span class="chip" onclick="CHAT.ask('Quando conviene pescare oggi?')">Quando conviene pescare oggi?</span> <span class="chip" onclick="CHAT.ask('Che esca uso per le orate adesso?')">Che esca uso per le orate?</span> <span class="chip" onclick="CHAT.ask('Che montatura per il surfcasting con mare mosso?')">Montatura con mare mosso?</span></div>`)+
      h.map(m=>`<div class="cmsg ${m.me?'me':''}"><div class="cb">${m.me?esc(m.text):fmtBot(m.text)}<div class="ct">${hm(m.ts)}</div></div></div>`).join('')+(CH.botBusy?'<div class="cmsg"><div class="cb"><span class="aispin" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:-3px"></span> Ci penso…</div></div>':'');}
  const u=me()?.uid,bl=blocked(),now=Date.now();
  const clr=cleared()[CH.rid]||0;
  const ms=CH.msgs.filter(m=>!bl.includes(m.uid)&&!(m.kind==='cond'&&m.exp&&m.exp<now)&&m.ts>clr);
  if(!ms.length&&!CH.loaded)return `<div class="cempty"><span class="aispin" style="width:26px;height:26px;border-width:3px;display:inline-block"></span><br>Carico i messaggi…${CH.slow?`<br><span class="small">La connessione è lenta.</span><br><button class="btn" style="margin-top:8px;padding:8px 16px" onclick="CHAT.retry()">↻ Riprova</button>`:''}</div>`;
  if(!ms.length)return `<div class="cempty">Nessun messaggio. Rompi il ghiaccio! 🎣</div>`;
  let lastDay='';
  return ms.map(m=>{const mine=m.uid===u,day=new Date(m.ts).toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
    const sep=day!==lastDay?`<div class="cday">${day}</div>`:'';lastDay=day;
    if((m.rep||0)>=REP_HIDE&&!mine)return sep+`<div class="cmsg"><div class="cb hid">🛡️ Messaggio nascosto dopo le segnalazioni</div></div>`;
    const rp=m.reply?`<div class="crq">↩️ <b>${esc(m.reply.name)}</b>: ${esc(clean(m.reply.text).slice(0,80))}</div>`:'';
    let body='';
    if(m.kind==='catch'){const c=m.catch||{};body=`<div class="ccatch">${c.photo?`<img src="${c.photo}" alt="" onclick="viewPhoto(this.src)">`:''}<div class="cct"><b>🐟 ${esc(c.sp||'Cattura')}</b>${c.sci?` <i class="small">${esc(c.sci)}</i>`:''}
      <div class="small">${c.len?`📏 ${fmt1(c.len)} cm`:''}${c.w?` · ⚖️ ${c.w<1?Math.round(c.w*1000)+' g':fmt1(c.w)+' kg'}`:''}</div><div class="small mut">📍 ${c.pos?`<a href="https://www.openstreetmap.org/?mlat=${c.pos.lat}&mlon=${c.pos.lon}#map=15/${c.pos.lat}/${c.pos.lon}" target="_blank" rel="noopener" style="color:inherit">posizione condivisa</a>`:esc(c.zone||'zona')}</div></div></div>`;}
    else if(m.kind==='cond'){const c=m.cond||{},left=Math.max(0,Math.round((m.exp-now)/3600e3));body=`<div class="ccond"><b>🌊 Condizioni in diretta</b><div class="cchips">${['sea','wind','water','bite'].filter(k=>c[k]).map(k=>`<span>${esc(c[k])}</span>`).join('')}</div><div class="small mut">valide ancora ${left?left+' h':'meno di un\'ora'}</div></div>`;}
    const txt=m.text?`<div>${esc(clean(m.text)).replace(/\n/g,'<br>')}</div>`:'';
    return sep+`<div class="cmsg ${mine?'me':''}" onclick="CHAT.act('${m.id}')"><div class="cb">${mine?'':`<div class="cn">${esc(m.name)}</div>`}${rp}${body}${txt}<div class="ct">${hm(m.ts)}</div></div></div>`;}).join('');
}
const fmtBot=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
function replyHtml(){return CH.reply?`<div class="crply">↩️ Rispondi a <b>${esc(CH.reply.name)}</b>: ${esc(clean(CH.reply.text).slice(0,60))} <u style="cursor:pointer;margin-left:6px" onclick="CHAT.reply=null;document.getElementById('creply').innerHTML=''">annulla</u></div>`:'';}

/* ---------- invio ---------- */
async function post(msg,preview){
  const ff=F(),db=D(),u=me(),rid=CH.rid,id=newId();
  const name=C().name();Object.assign(msg,{uid:u.uid,name,ts:Date.now()});
  if(rid==='near'){const sp=activeSpot();if(!sp||sp.lat==null)throw new Error('Scegli prima uno spot');
    Object.assign(msg,{g:geohash(sp.lat,sp.lon),la:Math.round(sp.lat*100)/100,lo:Math.round(sp.lon*100)/100});await ensureRoom('near');}
  else if(/^(z_it|r_|p_|c_)/.test(rid))await ensureRoom(rid);
  if(CH.reply){msg.reply={id:CH.reply.id,uid:CH.reply.uid,name:CH.reply.name,text:String(CH.reply.text||'').slice(0,120)};}
  await ff.setDoc(ff.doc(db,'rooms',rid,'msgs',id),msg);
  if(rid!=='near')await ff.setDoc(ff.doc(db,'rooms',rid),{last:{text:preview.slice(0,120),name,uid:u.uid,ts:msg.ts}},{merge:true});
  if(msg.reply&&msg.reply.uid!==u.uid)ff.setDoc(ff.doc(db,'notifs',msg.reply.uid,'items',id),{rid,room:roomName(rid),from:name,fromUid:u.uid,text:preview.slice(0,140),ts:msg.ts}).catch(()=>{});
  CH.reply=null;const rp=document.getElementById('creply');if(rp)rp.innerHTML='';
}
CH.send=async()=>{
  const el=document.getElementById('cmsg');const t=(el?.value||'').trim();if(!t)return;
  if(CH.rid==='bot')return CH.ask(t);
  el.value='';
  try{await post({kind:'text',text:clean(t)},clean(t));}catch(e){el.value=t;toast('⚠️ Messaggio non inviato: '+(e.code||e.message));}
};
// azioni su un messaggio: rispondi, amici, privato, segnala, blocca, elimina
CH.act=id=>{const m=CH.msgs.find(x=>x.id===id);if(!m)return;const mine=m.uid===me()?.uid,fr=friends().some(f=>f.uid===m.uid);
  openSheet(`<h2>${mine?'Il tuo messaggio':esc(m.name)}</h2><div class="small mut" style="margin-bottom:12px">${esc(clean(m.text||m.catch?.sp||'Condizioni del mare').slice(0,140))}</div>
    <button class="btn full" style="margin-bottom:8px" onclick="CHAT.replyTo('${id}')">↩️ Rispondi</button>
    ${mine?`<button class="btn ghost full" onclick="CHAT.del('${id}')">🗑️ Elimina messaggio</button>`:`
    ${fr?'':`<button class="btn ghost full" style="margin-bottom:8px" onclick="CHAT.befriend('${m.uid}','${esc(m.name).replace(/'/g,'')}')">🤝 Aggiungi agli amici</button>`}
    <button class="btn ghost full" style="margin-bottom:8px" onclick="closeSheet();CHAT.dm('${m.uid}','${esc(m.name).replace(/'/g,'')}')">💬 Scrivi in privato</button>
    <button class="btn ghost full" style="margin-bottom:8px" onclick="CHAT.report('${id}')">🚩 Segnala messaggio</button>
    <button class="btn ghost full" onclick="CHAT.block('${m.uid}','${esc(m.name).replace(/'/g,'')}')">🚫 Blocca ${esc(m.name)}</button>`}`);};
CH.replyTo=id=>{const m=CH.msgs.find(x=>x.id===id);closeSheet();if(!m)return;CH.reply={id,uid:m.uid,name:m.name,text:m.text||('🐟 '+(m.catch?.sp||'cattura'))};
  const rp=document.getElementById('creply');if(rp)rp.innerHTML=replyHtml();document.getElementById('cmsg')?.focus();};
CH.del=async id=>{closeSheet();try{await F().deleteDoc(F().doc(D(),'rooms',CH.rid,'msgs',id));toast('Messaggio eliminato');}catch(e){toast('⚠️ '+(e.code||e.message));}};
CH.report=async id=>{closeSheet();const m=CH.msgs.find(x=>x.id===id);if(!m)return;const ff=F();
  const done=G('chatreported',[]);if(done.includes(id)){toast('Hai già segnalato questo messaggio');return;}
  try{await ff.setDoc(ff.doc(D(),'reports',newId()),{rid:CH.rid,mid:id,uid:m.uid,name:m.name,text:String(m.text||'').slice(0,300),by:me().uid,ts:Date.now()});
    await ff.updateDoc(ff.doc(D(),'rooms',CH.rid,'msgs',id),{rep:ff.increment(1)});
    LS.set('chatreported',[...done,id].slice(-300));toast('🚩 Segnalazione inviata, grazie');}catch(e){toast('⚠️ '+(e.code||e.message));}};
CH.block=(uid,name)=>{closeSheet();if(!confirm(`Bloccare ${name}? Non vedrai più i suoi messaggi.`))return;
  LS.set('chatblock',[...new Set([...blocked(),uid])]);const n=G('chatblocknames',{});n[uid]=name;LS.set('chatblocknames',n);refresh();toast('🚫 '+name+' bloccato');};
CH.unblock=uid=>{LS.set('chatblock',blocked().filter(u=>u!==uid));render();};

/* ---------- amici, privati e gruppi ---------- */
// amicizia: se aggiungo qualcuno con il suo codice, lui aggiunge me in automatico (il codice me l'ha dato lui);
// se lo aggiungo da un messaggio, gli arriva una richiesta da accettare
function tellFriend(uid,viaCode){const ff=F();ff.setDoc(ff.doc(D(),'notifs',uid,'items','f_'+me().uid),{kind:'friend',viaCode:!!viaCode,from:C().name(),fromUid:me().uid,ts:Date.now()}).catch(()=>{});}
CH.friendReqs=[];
function gotFriend(n){const ff=F(),del=()=>ff.deleteDoc(ff.doc(D(),'notifs',me().uid,'items',n.id)).catch(()=>{});
  if(blocked().includes(n.fromUid)){del();return;}
  if(friends().some(f=>f.uid===n.fromUid)){del();return;}
  if(n.viaCode){LS.set('chatfriends',[...friends(),{uid:n.fromUid,name:n.from}]);CH.friendsChanged();del();toast('🤝 '+n.from+' ti ha aggiunto con il tuo codice: ora siete amici');refresh();return;}
  if(!CH.friendReqs.some(x=>x.id===n.id))CH.friendReqs.push(n);refresh();}
CH.acceptFriend=id=>{const n=CH.friendReqs.find(x=>x.id===id);if(!n)return;CH.friendReqs=CH.friendReqs.filter(x=>x.id!==id);
  if(!friends().some(f=>f.uid===n.fromUid)){LS.set('chatfriends',[...friends(),{uid:n.fromUid,name:n.from}]);CH.friendsChanged();}
  F().deleteDoc(F().doc(D(),'notifs',me().uid,'items',id)).catch(()=>{});toast('🤝 '+n.from+' aggiunto agli amici');render();};
CH.ignoreFriend=id=>{CH.friendReqs=CH.friendReqs.filter(x=>x.id!==id);F().deleteDoc(F().doc(D(),'notifs',me().uid,'items',id)).catch(()=>{});render();};
// amici il cui account è stato cancellato (profilo sparito): li tolgo dall'elenco (e dai gruppi dove sono io ad averli creati)
const goneRooms=()=>G('chatgone',[]).filter(x=>typeof x==='string');
// conversazione privata con un utente il cui account non esiste più: la nascondo per sempre (controllo appena arriva la stanza)
const GONECHK=new Set();
async function checkGone(r){if(!r||r.type!=='dm'||GONECHK.has(r.id)||goneRooms().includes(r.id))return;GONECHK.add(r.id);
  const o=(r.members||[]).find(x=>x!==me()?.uid);if(!o)return;
  try{const p=await F().getDoc(F().doc(D(),'profiles',o));if(p.exists())return;}catch(e){GONECHK.delete(r.id);return;}
  LS.set('chatgone',[...new Set([...goneRooms(),r.id])]);CH.badge();if(S.tab==='chat')render();}
async function pruneFriends(){const ff=F(),gone=[],u=me()?.uid;
  for(const r of Object.values(CH.mine))checkGone(r);
  for(const f of friends()){try{const p=await ff.getDoc(ff.doc(D(),'profiles',f.uid));if(!p.exists())gone.push(f);}catch(e){}}
  if(!gone.length)return;const ids=new Set(gone.map(f=>f.uid));
  LS.set('chatfriends',friends().filter(f=>!ids.has(f.uid)));CH.friendsChanged();
  toast('🤝 Tolti dagli amici (account cancellato): '+gone.map(f=>f.name).join(', '));if(S.tab==='chat')render();}
CH.befriend=(uid,name)=>{closeSheet();if(friends().some(f=>f.uid===uid))return;LS.set('chatfriends',[...friends(),{uid,name}]);CH.friendsChanged();tellFriend(uid,false);toast('🤝 '+name+' aggiunto agli amici');};
CH.unfriend=uid=>{if(!confirm('Togliere dagli amici?'))return;LS.set('chatfriends',friends().filter(f=>f.uid!==uid));CH.friendsChanged();render();};
CH.addByCode=async()=>{const code=(document.getElementById('fcode')?.value||'').trim().toUpperCase();if(code.length!==6){toast('Il codice ha 6 caratteri');return;}
  if(code===uidCode(me().uid)){toast('Questo è il tuo codice 🙂');return;}
  try{const ff=F(),s=await ff.getDocs(ff.query(ff.collection(D(),'profiles'),ff.where('code','==',code)));
    if(!s.docs.length){toast('Nessun pescatore con questo codice');return;}
    const d=s.docs[0],p=d.data();if(friends().some(f=>f.uid===d.id)){toast('È già tra i tuoi amici');return;}
    LS.set('chatfriends',[...friends(),{uid:d.id,name:p.name||'Amico'}]);CH.friendsChanged();tellFriend(d.id,true);toast('🤝 '+(p.name||'Amico')+' aggiunto agli amici');render();}
  catch(e){toast('⚠️ '+(e.code||e.message));}};
CH.dm=async(uid,name)=>{const u=me();name=name||friends().find(f=>f.uid===uid)?.name||'Amico';
  const rid='d_'+[u.uid,uid].sort().join('_'),ff=F();
  try{await ff.setDoc(ff.doc(D(),'rooms',rid),{type:'dm',members:[u.uid,uid].sort(),names:{[u.uid]:C().name(),[uid]:name},t:Date.now()},{merge:true});
    CH.mine[rid]=CH.mine[rid]||{id:rid,type:'dm',members:[u.uid,uid],names:{[u.uid]:C().name(),[uid]:name}};CH.open(rid);}
  catch(e){toast('⚠️ '+(e.code||e.message));}};
CH.newGroup=()=>{const fr=friends();if(!fr.length){toast('Aggiungi prima qualche amico');CH.tab='amici';render();return;}
  openSheet(`<h2>👥 Nuovo gruppo</h2><input id="gname" placeholder="Nome del gruppo (es. Uscita di sabato)" maxlength="40" style="margin-bottom:10px">
    ${fr.map(f=>`<label class="crow"><input type="checkbox" class="gmem" value="${f.uid}"> ${esc(f.name)}</label>`).join('')}
    <button class="btn full" style="margin-top:12px" onclick="CHAT.makeGroup()">Crea il gruppo</button>`);};
/* ---------- elimina chat, membri dei gruppi ---------- */
const cleared=()=>G('chatcleared',{});
CH.roomMenu=()=>{const r=CH.mine[CH.rid];if(!r)return;const u=me().uid,owner=r.type==='group'&&r.owner===u;
  openSheet(`<h2>${esc(roomName(CH.rid))}</h2>
    ${r.type==='group'?`<button class="btn full" style="margin-bottom:8px" onclick="CHAT.members()">👥 Membri del gruppo (${(r.members||[]).length})</button>`:''}
    ${owner?`<button class="btn ghost full" style="margin-bottom:8px" onclick="CHAT.renameGroup()">✏️ Rinomina il gruppo</button>`:''}
    <button class="btn ghost full" style="margin-bottom:8px" onclick="CHAT.clearChat()">🗑️ Elimina chat</button>
    <p class="small mut" style="margin:-2px 2px 10px">Sparisce solo per te; se arriva un messaggio nuovo ricompare con i soli messaggi nuovi.</p>
    ${r.type==='group'&&!owner?`<button class="btn ghost full" style="margin-bottom:8px;color:#ff8a8d" onclick="CHAT.leaveGroup()">🚪 Esci dal gruppo</button>`:''}
    ${owner?`<button class="btn ghost full" style="color:#ff8a8d" onclick="CHAT.deleteGroup()">💥 Elimina il gruppo per tutti</button>`:''}`);};
CH.clearChat=()=>{const rid=CH.rid;if(!confirm('Eliminare questa chat? I messaggi spariscono solo per te.'))return;
  const c=cleared();c[rid]=Date.now();LS.set('chatcleared',c);closeSheet();toast('🗑️ Chat eliminata');CH.back();CH.tab='priv';render();};
async function groupNames(r){const names={...(r.names||{})},ff=F();
  for(const id of r.members||[])if(!names[id]){try{const p=await ff.getDoc(ff.doc(D(),'profiles',id));names[id]=p.exists()?p.data().name:'Utente';}catch(e){names[id]='Utente';}}
  return names;}
CH.members=async()=>{const r=CH.mine[CH.rid];if(!r)return;const u=me().uid,owner=r.owner===u,names=await groupNames(r);
  const add=friends().filter(f=>!(r.members||[]).includes(f.uid));
  openSheet(`<h2>👥 Membri</h2>${(r.members||[]).map(id=>`<div class="croom" style="cursor:default"><div class="cri">${id===r.owner?'👑':'🎣'}</div><div style="flex:1"><b>${esc(id===u?'Tu':names[id])}</b>${id===r.owner?'<div class="small mut">ha creato il gruppo</div>':''}</div>${owner&&id!==u?`<button class="btn ghost" style="padding:7px 12px;color:#ff8a8d" onclick="CHAT.removeMember('${id}')">Togli</button>`:''}</div>`).join('')}
    ${owner?(add.length?`<h3 style="margin-top:14px">➕ Aggiungi amici</h3>${add.map(f=>`<label class="crow"><input type="checkbox" class="gadd" value="${f.uid}"> ${esc(f.name)}</label>`).join('')}<button class="btn full" style="margin-top:10px" onclick="CHAT.addMembers()">Aggiungi al gruppo</button>`:'<p class="small mut" style="margin-top:12px">Tutti i tuoi amici sono già nel gruppo. Per aggiungerne altri, aggiungili prima agli amici.</p>'):'<p class="small mut" style="margin-top:12px">Solo chi ha creato il gruppo può aggiungere o togliere membri.</p>'}`);};
async function saveGroup(rid,patch,msg){const ff=F();try{await ff.setDoc(ff.doc(D(),'rooms',rid),patch,{merge:true});Object.assign(CH.mine[rid]||{},patch);if(msg)toast(msg);return true;}catch(e){toast('⚠️ '+(e.code||e.message));return false;}}
CH.addMembers=async()=>{const r=CH.mine[CH.rid],ids=[...document.querySelectorAll('.gadd:checked')].map(x=>x.value);if(!ids.length){toast('Scegli almeno un amico');return;}
  const names={...(r.names||{})};ids.forEach(id=>{names[id]=friends().find(f=>f.uid===id)?.name||'Amico';});
  if(await saveGroup(CH.rid,{members:[...r.members,...ids],names},'👥 Membri aggiunti'))CH.members();};
CH.removeMember=async id=>{const r=CH.mine[CH.rid];if(!confirm('Togliere questo membro dal gruppo?'))return;
  if(await saveGroup(CH.rid,{members:r.members.filter(x=>x!==id)},'Membro tolto dal gruppo'))CH.members();};
CH.renameGroup=async()=>{const r=CH.mine[CH.rid];const n=prompt('Nuovo nome del gruppo',r.name||'');if(n==null)return;const name=clean(n.trim()).slice(0,40);if(!name)return;
  if(await saveGroup(CH.rid,{name},'✏️ Gruppo rinominato')){closeSheet();render();}};
CH.leaveGroup=async()=>{const r=CH.mine[CH.rid],u=me().uid;if(!confirm('Uscire dal gruppo? Non vedrai più i suoi messaggi.'))return;
  const rid=CH.rid;if(await saveGroup(rid,{members:r.members.filter(x=>x!==u)},'🚪 Sei uscito dal gruppo')){closeSheet();delete CH.mine[rid];CH.back();CH.tab='priv';render();}};
CH.deleteGroup=async()=>{const rid=CH.rid;if(!confirm('Eliminare il gruppo per tutti i membri? I messaggi vengono cancellati.'))return;const ff=F();
  try{const ms=await ff.getDocs(ff.collection(D(),'rooms',rid,'msgs'));for(const d of ms.docs)await ff.deleteDoc(ff.doc(D(),'rooms',rid,'msgs',d.id));
    await ff.deleteDoc(ff.doc(D(),'rooms',rid));closeSheet();delete CH.mine[rid];toast('💥 Gruppo eliminato');CH.back();CH.tab='priv';render();}
  catch(e){toast('⚠️ '+(e.code||e.message));}};
CH.makeGroup=async()=>{const name=clean((document.getElementById('gname')?.value||'').trim())||'Gruppo di pesca';
  const mem=[...document.querySelectorAll('.gmem:checked')].map(x=>x.value);if(!mem.length){toast('Scegli almeno un amico');return;}
  const u=me(),rid='g_'+newId(),ff=F(),members=[u.uid,...mem];
  const names={[u.uid]:C().name()};mem.forEach(id=>{names[id]=friends().find(f=>f.uid===id)?.name||'Amico';});
  try{await ff.setDoc(ff.doc(D(),'rooms',rid),{type:'group',name,members,names,owner:u.uid,t:Date.now()});closeSheet();CH.mine[rid]={id:rid,type:'group',name,members};CH.open(rid);}
  catch(e){toast('⚠️ '+(e.code||e.message));}};

/* ---------- catture condivise (con spot protetti) ---------- */
async function small(src,max=640){if(!src)return null;
  const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=src;});
  const k=Math.min(1,max/Math.max(img.width,img.height)),cv=document.createElement('canvas');cv.width=Math.round(img.width*k);cv.height=Math.round(img.height*k);
  cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);return cv.toDataURL('image/jpeg',.62);}
CH.shareCatch=(fromRecog)=>{
  const st=window.ASSIST?.st,r=st?.r,m=st?.m;
  const have=r?.is_fish;const len=m?.len||'',w=have&&m?.len?((m.gem&&m.wgem)||(typeof estW==='function'&&estW(r.species,m.len))||m.wgem||''):'';
  const rooms=[...(activeSpot()?[['near',roomName('near')]]:[]),...follows().map(r=>[r,roomName(r)]),...Object.values(CH.mine).map(x=>[x.id,roomName(x.id)])];
  if(CH.rid&&CH.rid!=='bot'&&!rooms.some(r=>r[0]===CH.rid))rooms.unshift([CH.rid,roomName(CH.rid)]);
  const cur=CH.rid&&CH.rid!=='bot'?CH.rid:rooms[0][0];
  CH._photo=have?window.ASSIST.photo:null;
  openSheet(`<h2>📸 Condividi una cattura</h2>
    ${have?`<div class="cphoto"><img src="${window.ASSIST.photo}" alt=""></div>`:`<label class="shoot" style="margin-bottom:10px"><input type="file" accept="image/*" onchange="CHAT.pickPhoto(this)"><span class="cam">🖼️</span><b>Scegli la foto</b><small id="cphname">facoltativa</small></label>`}
    <label>Specie</label><input id="csp" value="${esc(have?r.species:'')}" placeholder="es. Orata">
    <div class="row" style="gap:8px"><div style="flex:1"><label>Lunghezza (cm)</label><input id="clen" type="number" inputmode="decimal" value="${len?Math.round(len*10)/10:''}"></div>
    <div style="flex:1"><label>Peso (kg)</label><input id="cw" type="number" inputmode="decimal" step="0.01" value="${w?Math.round(w*100)/100:''}"></div></div>
    <label>Commento</label><input id="ctxt" maxlength="300" placeholder="es. Presa all'alba con l'arenicola">
    <label>Dove la pubblico</label><select id="croom">${rooms.map(([id,n])=>`<option value="${id}" ${id===cur?'selected':''}>${esc(n)}</option>`).join('')}</select>
    <label class="crow" style="margin-top:10px"><input type="checkbox" id="cpos"> Condividi la posizione esatta</label>
    <p class="small mut" style="margin:2px 0 12px">🛡️ Spot protetti: se non la spunti, gli altri vedono solo la zona${activeSpot()?` («${esc(placeName(activeSpot()))}»)`:''}, mai le coordinate.</p>
    <button class="btn full" onclick="CHAT.postCatch()">Pubblica</button>`);
  CH._sci=have?r.scientific_name:'';
};
CH.pickPhoto=async inp=>{const f=inp.files?.[0];if(!f)return;const d=await new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.readAsDataURL(f);});CH._photo=d;const n=document.getElementById('cphname');if(n)n.textContent='✔ '+f.name;};
CH.postCatch=async()=>{
  const sp=clean(document.getElementById('csp').value.trim()),len=parseFloat(document.getElementById('clen').value.replace(',','.')),w=parseFloat(document.getElementById('cw').value.replace(',','.'));
  const rid=document.getElementById('croom').value,exact=document.getElementById('cpos').checked,txt=clean(document.getElementById('ctxt').value.trim());
  if(!sp&&!CH._photo){toast('Scrivi la specie o scegli una foto');return;}
  const s=activeSpot(),c={sp:sp||'Cattura',sci:CH._sci||'',len:isNaN(len)?null:len,w:isNaN(w)?null:w,zone:s?placeName(s):''};
  if(exact&&s)c.pos={lat:Math.round(s.lat*1e5)/1e5,lon:Math.round(s.lon*1e5)/1e5};
  toast('Pubblico…');
  try{c.photo=await small(CH._photo);}catch(e){c.photo=null;}
  const prev=CH.rid;CH.rid=rid;
  try{await post({kind:'catch',catch:c,text:txt},`🐟 ${c.sp}${c.len?' '+fmt1(c.len)+' cm':''}`);closeSheet();toast('✅ Cattura pubblicata');CH.open(rid);}
  catch(e){CH.rid=prev;toast('⚠️ Non pubblicata: '+(e.code||e.message));}
};

/* ---------- condizioni in diretta ---------- */
const COND={sea:['Mare piatto','Mare poco mosso','Mare mosso','Mare agitato'],wind:['Niente vento','Vento leggero','Vento teso','Vento forte'],water:['Acqua limpida','Acqua velata','Acqua torbida','Alghe'],bite:['Mangiano!','Qualche tocco','Niente mangianza']};
CH.condSheet=()=>{CH._cond={};const lab={sea:'Mare',wind:'Vento',water:'Acqua',bite:'Mangianza'};
  openSheet(`<h2>🌊 Condizioni in diretta</h2><p class="small mut" style="margin-top:-4px">Racconta com'è adesso: il messaggio resta visibile ${COND_H} ore.</p>
    ${Object.entries(COND).map(([k,a])=>`<label>${lab[k]}</label><div class="chips">${a.map(x=>`<span class="chip" data-k="${k}" onclick="CHAT.pickCond(this)">${x}</span>`).join('')}</div>`).join('')}
    <label>Note</label><input id="cnote" maxlength="200" placeholder="es. Mangianza di aguglie sotto riva">
    <button class="btn full" style="margin-top:12px" onclick="CHAT.postCond()">Pubblica</button>`);};
CH.pickCond=el=>{const k=el.dataset.k,on=CH._cond[k]===el.textContent;document.querySelectorAll(`.chip[data-k="${k}"]`).forEach(x=>x.classList.remove('on'));if(!on){el.classList.add('on');CH._cond[k]=el.textContent;}else delete CH._cond[k];};
CH.postCond=async()=>{const c=CH._cond||{};const note=clean(document.getElementById('cnote').value.trim());if(!Object.keys(c).length&&!note){toast('Scegli almeno una voce');return;}
  try{await post({kind:'cond',cond:c,text:note,exp:Date.now()+COND_H*3600e3},'🌊 '+[c.sea,c.wind,c.bite].filter(Boolean).join(', ')+(note?' · '+note:''));closeSheet();toast('✅ Condizioni pubblicate');}
  catch(e){toast('⚠️ '+(e.code||e.message));}};

/* ---------- assistente ---------- */
const strip=h=>String(h).replace(/<[^>]+>/g,'');
function context(){
  const sp=activeSpot(),X=S.wx,out=[];
  if(sp)out.push(`Spot attivo: ${placeName(sp)} (ambiente: ${MODES[S.mode]?.n||S.mode}).`);
  out.push('Data e ora: '+new Date().toLocaleString('it-IT',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})+'.');
  try{if(X){const now=new Date(),h=X.hours.find(x=>x.t<=now&&x.t.getTime()+3600e3>now);
    if(h)out.push(`Adesso: ${fmt1(h.temp)}°C, vento ${fmt1(h.ws)} km/h, onda ${h.wave!=null?fmt1(h.wave)+' m':'n.d.'}, pressione ${Math.round(h.p)} hPa.`);
    out.push('Indice di pescosità dei prossimi giorni: '+X.fdays.slice(0,4).map(d=>`${d.date.toLocaleDateString('it-IT',{weekday:'short'})} ${dayScore(X,d.date)}`).join(', ')+' (0-100).');
    const today=new Date();today.setHours(0,0,0,0);const w=bestWindows(X,today,2);if(w.length)out.push('Finestre migliori di oggi: '+w.map(x=>`${hhmm(x.from)}-${hhmm(x.to)} (indice ${x.max})`).join(', ')+'.');}}catch(e){}
  try{out.push('Consigli calcolati dall\'app: '+advice().map(a=>strip(a[1])).join(' '));}catch(e){}
  return out.join('\n');
}
CH.ask=async q=>{
  const el=document.getElementById('cmsg');if(el)el.value='';
  const h=G('chatbot',[]);h.push({me:true,text:q,ts:Date.now()});LS.set('chatbot',h.slice(-40));CH.botBusy=true;refresh();
  let ans='';
  if(typeof gemOn==='function'&&gemOn()){
    try{const sys=`Sei l'assistente di pesca dell'app LenzApp. Rispondi in italiano, in modo pratico e breve (massimo 8 righe), con esche, montature, tecniche e orari adatti alle condizioni. Usa le unità metriche. Se la domanda non riguarda la pesca, riporta gentilmente il discorso sulla pesca. Ricorda di rispettare le misure minime e la normativa locale quando parli di trattenere il pesce. Rispondi in JSON: {"risposta":"testo"}.\nDati attuali:\n${context()}`;
      const hist=G('chatbot',[]).slice(-10).map(m=>({role:m.me?'user':'model',parts:[{text:m.text}]}));
      const j=await gemCall({systemInstruction:{parts:[{text:sys}]},contents:hist,generationConfig:{responseMimeType:'application/json',temperature:.6}});
      ans=String(j.risposta||j.answer||'').trim();}
    catch(e){ans='';}
  }
  if(!ans){let tips=[];try{tips=advice().map(a=>a[0]+' '+strip(a[1]));}catch(e){}
    ans=(tips.length?'Ecco cosa ti consiglio adesso per il tuo spot:\n'+tips.join('\n'):'Sto ancora caricando il meteo del tuo spot: riprova tra qualche secondo.')+
      (typeof gemOn==='function'&&gemOn()?'\n\n(Gemini al momento non risponde: riprova tra poco.)':'\n\nPer risposte libere serve la connessione a internet.');}
  const h2=G('chatbot',[]);h2.push({me:false,text:ans,ts:Date.now()});LS.set('chatbot',h2.slice(-40));CH.botBusy=false;refresh();
};

/* ---------- mappa: posizione condivisa ---------- */
// locations/{uid}: {name, lat, lon (arrotondati a circa 100 m), vis:'all'|'friends', friends:[uid], ts}
// vis 'all': la vedono tutti gli utenti della chat; 'friends': solo gli utenti che ho tra gli amici. Spenta: il documento viene cancellato.
const LOC_MAX_H=6;
const manSvg=col=>`<svg width="16" height="20" viewBox="0 0 34 42" style="vertical-align:-4px"><path d="M17 41c-1-4-14-14-14-24a14 14 0 0 1 28 0c0 10-13 20-14 24z" fill="${col}" stroke="#fff" stroke-width="2"/><circle cx="17" cy="11.5" r="4" fill="#fff"/><path d="M10.5 25c0-4.2 2.9-7.5 6.5-7.5s6.5 3.3 6.5 7.5z" fill="#fff"/></svg>`;            // dopo 6 ore senza aggiornamenti la posizione non si mostra più
const locVis=()=>G('chatloc',null)||'friends';  // di default visibile agli amici; chi ha scelto altro tiene la sua scelta
CH.locs={};
function mapHtml(){
  const v=locVis(),opt=[['off','🚫 Non condivisa','Nessuno ti vede e tu non vedi nessuno'],['friends','🤝 Solo amici','Ti vedono solo i tuoi amici e tu vedi solo loro'],['all','🌍 Tutti','Ti vedono tutti e tu vedi tutti']];
  return `<div class="card"><h3>📡 La mia posizione</h3>${opt.map(([k,n,d])=>`<label class="crow" style="align-items:flex-start"><input type="radio" name="cloc" ${v===k?'checked':''} onchange="CHAT.setLoc('${k}')" style="margin-top:3px"><span><b>${n}</b><br><span class="small mut">${d}</span></span></label>`).join('')}
    <p class="small mut" style="margin:6px 0 0">La posizione viene presa dal GPS del telefono, arrotondata a circa 100 m, e aggiornata ogni 5 minuti mentre LenzApp è aperta. Dopo ${LOC_MAX_H} ore senza aggiornamenti sparisce dalla mappa.<br><span id="clocerr">${CH.locErr?'⚠️ '+esc(CH.locErr):''}</span></p></div>
  <div class="card" style="padding:10px"><div id="cmap" style="height:58vh;min-height:320px;border-radius:16px;overflow:hidden"></div>
    ${v==='off'?'<p class="small" style="margin:8px 4px 0;color:var(--acc2)">🚫 Hai scelto «Non condivisa»: nessuno ti vede e tu non vedi nessuno. Sulla mappa vedi solo te stesso, con l’omino rosso.</p>':`<div id="cfstat">${friendStatus()}</div>`}
    <div class="small" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;justify-content:center"><span><svg width="12" height="15" viewBox="0 0 20 24" style="vertical-align:-2px"><circle cx="10" cy="6" r="4.6" fill="#3b8cff" stroke="#fff" stroke-width="1.8"/><path d="M2.5 22.5c0-5 3.4-8.6 7.5-8.6s7.5 3.6 7.5 8.6z" fill="#3b8cff" stroke="#fff" stroke-width="1.8"/></svg> Tu</span><span>${manSvg('#2ecc71')} Amici</span><span>${manSvg('#ff5a5f')} Altri utenti</span></div></div>`;
}
CH.setLoc=async v=>{LS.set('chatloc',v);CH.locErr='';CH._locTry=0;
  if(v==='off'){clearInterval(CH._locT);try{await F().deleteDoc(F().doc(D(),'locations',me().uid));}catch(e){}locStop();delete CH.locs[me().uid];toast('📡 Posizione non condivisa: non vedi e non sei visto');render();return;}
  await pushLoc(true);startLocTimer();locListen();};
function startLocTimer(){clearInterval(CH._locT);if(locVis()==='off')return;CH._locT=setInterval(()=>pushLoc(false),5*60000);}
async function pushLoc(say){
  const v=locVis();if(v==='off'||!me())return;
  const pos=await new Promise(ok=>{if(!navigator.geolocation)return ok(null);navigator.geolocation.getCurrentPosition(p=>ok(p.coords),()=>ok(null),{enableHighAccuracy:true,timeout:15000,maximumAge:120000});});
  if(!pos){CH.locErr='Non riesco a leggere il GPS: controlla che la posizione sia attiva e consentita per LenzApp.';refresh();if(say)render();return;}
  const d={name:C().name(),lat:Math.round(pos.latitude*1000)/1000,lon:Math.round(pos.longitude*1000)/1000,vis:v,friends:friends().map(f=>f.uid),ts:Date.now()};
  try{await F().setDoc(F().doc(D(),'locations',me().uid),d);CH.locs[me().uid]={id:me().uid,...d};CH._locTry=0;if(CH.locMode!==v)locListen();if(say)toast(v==='all'?'🌍 Posizione visibile a tutti':'🤝 Posizione visibile agli amici');CH.locErr='';refresh();if(say&&CH.tab==='mappa')render();}
  catch(e){CH.locErr='Posizione non condivisa: '+(e.code||e.message);if(say)render();}}
CH.friendsChanged=()=>{if(locVis()!=='off')pushLoc(false);};
// ascolto delle posizioni: quelle pubbliche e quelle condivise con me dagli amici
// reciprocità: con «Non condivisa» non vedo nessuno, con «Solo amici» vedo solo gli amici, con «Tutti» vedo tutti
// (le regole di Firestore lo impongono anche lato server: per leggere le posizioni degli altri serve avere la propria condivisa)
function locStop(){['_locA','_locF','_locMe'].forEach(k=>{CH.subs[k]?.();delete CH.subs[k];});CH.locMode=null;
  const u=me()?.uid;for(const k of Object.keys(CH.locs))if(k!==u)delete CH.locs[k];}
function locListen(){if(!CH.started)return;const v=locVis();if(CH.locMode===v)return;
  const ff=F(),col=ff.collection(D(),'locations'),u=me().uid;
  // le regole permettono di leggere gli altri solo dopo aver condiviso la propria posizione (con la stessa modalità):
  // se non è ancora salvata aspetto, pushLoc() mi richiama appena l'ha salvata
  const myDoc=CH.locs[u];if(v!=='off'&&(!myDoc||myDoc.vis!==v))return;
  locStop();CH.locMode=v;
  CH.subs._locMe=ff.onSnapshot(ff.doc(col,u),s=>{if(s.exists())CH.locs[u]={id:u,...s.data()};else delete CH.locs[u];if(CH.tab==='mappa'&&S.tab==='chat')mapMarkers();},()=>{});
  if(v==='off'){if(CH.tab==='mappa'&&S.tab==='chat')mapMarkers();return;}
  const on=snap=>{if(CH.locErr&&/Non riesco a leggere/.test(CH.locErr)){CH.locErr='';if(CH.tab==='mappa'&&S.tab==='chat')render();}snap.docChanges().forEach(c=>{if(c.type==='removed')delete CH.locs[c.doc.id];else CH.locs[c.doc.id]={id:c.doc.id,...c.doc.data()};});if(CH.tab==='mappa'&&S.tab==='chat'){mapMarkers();const fs=document.getElementById('cfstat');if(fs)fs.innerHTML=friendStatus();}};
  // rifiuto (di solito la propria posizione appena salvata non è ancora visibile alle regole): riprovo fino a 3 volte
  const err=lab=>e=>{CH._locTry=(CH._locTry||0)+1;locStop();
    if(CH._locTry<=3){setTimeout(()=>{CH.locMode=null;locListen();},2500*CH._locTry);return;}
    // niente ridisegno della pagina (ripartirebbe da capo all'infinito): aggiorno solo il testo dell'avviso
    CH.locErr='Non riesco a leggere '+lab+' ('+(e.code||e.message)+'). Controlla che le regole di Firebase siano aggiornate e che la tua posizione sia condivisa.';
    const el=document.getElementById('clocerr');if(el)el.textContent='⚠️ '+CH.locErr;CH.locMode=v;};
  CH.subs._locF=ff.onSnapshot(ff.query(col,ff.where('friends','array-contains',u)),on,err('le posizioni degli amici'));
  if(v==='all')CH.subs._locA=ff.onSnapshot(ff.query(col,ff.where('vis','==','all')),on,err('le posizioni pubbliche'));}
function friendStatus(){const fr=friends();if(!fr.length)return '<p class="small mut" style="margin:8px 4px 0">Non hai ancora amici: aggiungili nella scheda «Amici» con il loro codice.</p>';
  const now=Date.now();
  return `<div style="margin-top:8px">${fr.map(f=>{const l=CH.locs[f.uid],ok=l&&now-l.ts<=LOC_MAX_H*3600e3;
    return `<div class="small" style="display:flex;gap:6px;align-items:center;padding:3px 4px">${manSvg(ok?'#2ecc71':'#7f8c99')}<b>${esc(f.name)}</b><span class="mut">${ok?'sulla mappa · '+ago(l.ts)+' fa':l?'posizione vecchia (più di '+LOC_MAX_H+' ore)':'non condivide la posizione con te'}</span></div>`;}).join('')}
    <p class="small mut" style="margin:4px 4px 0">Per vedere un amico deve avere la posizione su «Solo amici» o «Tutti», averti tra i suoi amici e aver aperto LenzApp da poco.</p></div>`;}
function localPos(){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(p=>{CH.myLocal={lat:p.coords.latitude,lon:p.coords.longitude};if(CH.tab==='mappa'&&S.tab==='chat')mapMarkers();},()=>{},{enableHighAccuracy:true,timeout:15000,maximumAge:120000});}
function mapInit(){
  const el=document.getElementById('cmap');if(!el||!window.L)return;
  CH.map?.remove();CH._fitted=false;if(CH._locTry>3){CH._locTry=0;CH.locMode=null;}const me0=CH.locs[me()?.uid],sp=activeSpot();
  const c=me0?[me0.lat,me0.lon]:sp&&sp.lat!=null?[sp.lat,sp.lon]:[41.9,12.5];
  CH.map=L.map(el,{zoomControl:true,attributionControl:true}).setView(c,me0||sp?10:6);
  baseLayers(CH.map);
  CH.mlayer=L.layerGroup().addTo(CH.map);locListen();if(locVis()!=='off')pushLoc(false);else localPos();mapMarkers();
}
// omino colorato: blu tu, verde gli amici, rosso gli altri utenti
const manIcon=col=>L.divIcon({className:'',iconSize:[34,42],iconAnchor:[17,40],popupAnchor:[0,-36],
  html:`<svg width="34" height="42" viewBox="0 0 34 42"><path d="M17 41c-1-4-14-14-14-24a14 14 0 0 1 28 0c0 10-13 20-14 24z" fill="${col}" stroke="#fff" stroke-width="2"/><circle cx="17" cy="11.5" r="4" fill="#fff"/><path d="M10.5 25c0-4.2 2.9-7.5 6.5-7.5s6.5 3.3 6.5 7.5z" fill="#fff"/></svg>`});
// tu: omino piccolo senza goccia, sotto gli altri
const meIcon=(col='#3b8cff')=>L.divIcon({className:'',iconSize:[20,24],iconAnchor:[10,22],popupAnchor:[0,-20],
  html:`<svg width="20" height="24" viewBox="0 0 20 24"><circle cx="10" cy="6" r="4.6" fill="${col}" stroke="#fff" stroke-width="1.8"/><path d="M2.5 22.5c0-5 3.4-8.6 7.5-8.6s7.5 3.6 7.5 8.6z" fill="${col}" stroke="#fff" stroke-width="1.8"/></svg>`});
// nome sotto ogni omino, semitrasparente; si nasconde mentre è aperta la sua scheda
function nameTag(m,name,mine){
  m.bindTooltip(esc(name),{permanent:true,direction:'bottom',offset:[0,mine?2:4],className:'mlabel'+(mine?' me':''),interactive:false});
  m.on('popupopen',()=>m.closeTooltip());m.on('popupclose',()=>m.openTooltip());}
function mapMarkers(){
  if(!CH.map||!CH.mlayer||!document.getElementById('cmap'))return;CH.mlayer.clearLayers();
  const u=me()?.uid,fr=new Set(friends().map(f=>f.uid)),bl=blocked(),now=Date.now(),pts=[];
  const mode=locVis();
  const vis=Object.values(CH.locs).filter(l=>l.lat!=null&&!bl.includes(l.id)&&now-l.ts<=LOC_MAX_H*3600e3&&(l.id===u||(mode==='all')||(mode==='friends'&&fr.has(l.id))));
  // stesse coordinate (posizioni arrotondate a 100 m): distanzio gli omini in cerchio, così si vedono tutti
  const groups={};vis.forEach(l=>{(groups[l.lat+','+l.lon]=groups[l.lat+','+l.lon]||[]).push(l);});
  const pos={};for(const g of Object.values(groups)){g.sort((a,b)=>(a.id===u)-(b.id===u));g.forEach((l,i)=>{
    if(g.length===1){pos[l.id]=[l.lat,l.lon];return;}const a=2*Math.PI*i/g.length,r=.00035;pos[l.id]=[l.lat+r*Math.cos(a),l.lon+r*Math.sin(a)/Math.cos(l.lat*Math.PI/180)];});}
  for(const l of vis){
    const mine=l.id===u,col=mine?'#3b8cff':fr.has(l.id)?'#2ecc71':'#ff5a5f';
    const m=L.marker(pos[l.id],{icon:mine?meIcon():manIcon(col),zIndexOffset:mine?-1000:0}).addTo(CH.mlayer);pts.push(pos[l.id]);
    nameTag(m,mine?'Io':(l.name||'Pescatore'),mine);
    m.bindPopup(`<b>${esc(mine?'Tu':l.name||'Pescatore')}</b><br><span style="font-size:12px">aggiornata ${ago(l.ts)} fa${mine?' · '+(l.vis==='all'?'visibile a tutti':'visibile agli amici'):fr.has(l.id)?' · amico':''}</span>${mine?'':`<br><button class="btn" style="margin-top:6px;padding:6px 12px" onclick="CHAT.dm('${l.id}','${esc(l.name||'').replace(/'/g,'')}')">💬 Scrivi</button>`}`);
  }
  // posizione non condivisa: mi mostro lo stesso, in rosso, con il GPS letto solo sul telefono (non viene inviato)
  if(mode==='off'&&CH.myLocal){const p0=[CH.myLocal.lat,CH.myLocal.lon];
    const mm=L.marker(p0,{icon:meIcon('#ff5a5f')}).addTo(CH.mlayer);nameTag(mm,'Io',true);mm.bindPopup('<b>Tu</b><br><span style="font-size:12px">posizione non condivisa: la vedi solo tu</span>');pts.push(p0);}
  if(pts.length&&!CH._fitted){CH._fitted=true;if(pts.length>1)CH.map.fitBounds(pts,{padding:[40,40],maxZoom:13});else CH.map.setView(pts[0],12);}
}

/* ---------- segnalazioni (solo amministratori) ---------- */
CH.modView=async v=>{
  if(!CH.isAdmin()){go('altro');return;}
  CH.start();const ff=F(),db=D();
  const groups={};for(const r of CH.reports){const k=r.rid+'/'+r.mid;(groups[k]=groups[k]||{rid:r.rid,mid:r.mid,uid:r.uid,name:r.name,text:r.text,list:[]}).list.push(r);}
  const gs=Object.values(groups).sort((a,b)=>Math.max(...b.list.map(x=>x.ts))-Math.max(...a.list.map(x=>x.ts)));
  v.innerHTML=subHead('Segnalazioni','Messaggi della chat segnalati dagli utenti')+
    (gs.length?gs.map((g,i)=>`<div class="card"><div class="row" style="justify-content:space-between;align-items:flex-start;gap:8px"><div><b>${esc(g.name||'Utente')}</b> <span class="small mut">in <span id="mr${i}">${esc(roomName(g.rid))}</span></span></div>
        <span class="pill" style="background:#ff5a5f22;color:#ff8a8d">🚩 ${g.list.length} ${g.list.length===1?'segnalazione':'segnalazioni'}</span></div>
      <div class="cb" style="max-width:none;margin:10px 0;cursor:default" id="mt${i}">${esc(g.text||'(cattura o condizioni del mare)')}</div>
      <div class="small mut">Ultima segnalazione: ${new Date(Math.max(...g.list.map(x=>x.ts))).toLocaleString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}${g.list.length>=REP_HIDE?' · nascosto in chat':''}</div>
      <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn" style="flex:1;padding:9px 10px" onclick="CHAT.modDel('${g.rid}','${g.mid}')">🗑️ Elimina</button>
        <button class="btn ghost" style="flex:1;padding:9px 10px" onclick="CHAT.modOk('${g.rid}','${g.mid}')">✔ Ignora</button>
        <button class="btn ghost" style="flex:1;padding:9px 10px;color:#ff8a8d" onclick="CHAT.modBan('${g.rid}','${g.mid}','${g.uid}','${esc(g.name||'').replace(/'/g,'')}')">🚫 Blocca utente</button></div></div>`).join('')
    :`<div class="card" style="text-align:center;padding:28px 18px"><div style="font-size:44px">🛡️</div><h3 style="margin:6px 0 2px">Nessuna segnalazione</h3><p class="small mut">Quando un utente segnala un messaggio lo trovi qui.</p></div>`)+
    `<div class="card"><h3>🗑️ Cancella utente</h3><p class="small mut" style="margin:-4px 0 8px">Elimina tutti i dati di un utente (spot, diario, impostazioni, Premium, profilo, posizione, avvisi) e i suoi messaggi in chat. Per un utente già cancellato cerca il nome con cui appare in chat. L'account di accesso va poi eliminato da Console Firebase › Authentication.</p>
      <div class="row" style="gap:8px"><input id="delq" placeholder="Email, codice utente (UID) o nome in chat" style="flex:1" autocomplete="off"><button class="btn" onclick="CHAT.delFind()">Cerca</button></div><div id="delres" style="margin-top:10px"></div></div>
    <div class="card" id="bannedbox"><h3>🚫 Utenti bloccati</h3><p class="small mut">Carico…</p></div>`;
  // testo attuale del messaggio (potrebbe essere già stato cancellato dal suo autore)
  gs.forEach(async(g,i)=>{try{const m=await ff.getDoc(ff.doc(db,'rooms',g.rid,'msgs',g.mid));const el=document.getElementById('mt'+i);if(!el)return;
    if(!m.exists())el.innerHTML='<i class="mut">Messaggio già eliminato</i>';else{const d=m.data();if(d.kind==='catch'&&d.catch?.photo)el.innerHTML=`<img src="${d.catch.photo}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px;margin-bottom:6px"><div>${esc('🐟 '+(d.catch.sp||'')+(d.text?' · '+d.text:''))}</div>`;}
    const r=await ff.getDoc(ff.doc(db,'rooms',g.rid));const n=document.getElementById('mr'+i);if(n&&r.exists())n.textContent=r.data().type==='dm'?'messaggio privato':r.data().type==='group'?'gruppo «'+(r.data().name||'')+'»':(r.data().name||'chat');}catch(e){}});
  try{const b=await ff.getDocs(ff.collection(db,'banned'));const box=document.getElementById('bannedbox');if(!box)return;
    box.innerHTML='<h3>🚫 Utenti bloccati</h3>'+(b.docs.length?b.docs.map(d=>`<div class="croom" style="cursor:default"><div style="flex:1"><b>${esc(d.data().name||'Utente')}</b><div class="small mut">dal ${new Date(d.data().ts).toLocaleDateString('it-IT')}</div></div><button class="btn ghost" style="padding:7px 12px" onclick="CHAT.modUnban('${d.id}')">Sblocca</button></div>`).join(''):'<p class="small mut">Nessun utente bloccato.</p>');}
  catch(e){const box=document.getElementById('bannedbox');if(box)box.innerHTML='<h3>🚫 Utenti bloccati</h3><p class="small mut">⚠️ '+esc(e.code||e.message)+'</p>';}
};
async function closeReports(rid,mid){const ff=F(),db=D();for(const r of CH.reports.filter(x=>x.rid===rid&&x.mid===mid)){try{await ff.deleteDoc(ff.doc(db,'reports',r.id));}catch(e){}}
  CH.reports=CH.reports.filter(x=>!(x.rid===rid&&x.mid===mid));CH.badge();render();}
CH.modDel=async(rid,mid)=>{if(!confirm('Eliminare il messaggio per tutti?'))return;
  try{await F().deleteDoc(F().doc(D(),'rooms',rid,'msgs',mid));await closeReports(rid,mid);toast('🗑️ Messaggio eliminato');}catch(e){toast('⚠️ '+(e.code||e.message));}};
CH.modOk=async(rid,mid)=>{
  try{const ref=F().doc(D(),'rooms',rid,'msgs',mid),m=await F().getDoc(ref);if(m.exists())await F().updateDoc(ref,{rep:0});await closeReports(rid,mid);toast('✔ Segnalazione chiusa, messaggio di nuovo visibile');}catch(e){toast('⚠️ '+(e.code||e.message));}};
CH.modBan=async(rid,mid,uid,name)=>{if(!confirm(`Bloccare ${name||'questo utente'}? Non potrà più scrivere in chat. Il messaggio segnalato viene eliminato.`))return;
  try{await F().setDoc(F().doc(D(),'banned',uid),{name,ts:Date.now(),by:me().uid});try{await F().deleteDoc(F().doc(D(),'rooms',rid,'msgs',mid));}catch(e){}await closeReports(rid,mid);toast('🚫 '+(name||'Utente')+' bloccato');}
  catch(e){toast('⚠️ '+(e.code||e.message));}};
// cancellazione dei dati di un utente (solo amministratore; le regole di Firestore lo permettono solo a lui)
CH.delFind=async(pick)=>{
  if(!CH.isAdmin())return;if(pick)document.getElementById('delq').value=pick;let q=(document.getElementById('delq')?.value||'').trim(),box=document.getElementById('delres');if(!q){toast('Scrivi email, UID o nome');return;}
  box.innerHTML='<p class="small mut">Cerco…</p>';const ff=F(),db=D();
  try{
    let uid=null,email='';
    if(q.includes('@')){const r=await ff.getDocs(ff.query(ff.collection(db,'users'),ff.where('email','==',q.toLowerCase())));
      const r2=r.docs.length?r:await ff.getDocs(ff.query(ff.collection(db,'users'),ff.where('email','==',q)));if(r2.docs.length){uid=r2.docs[0].id;email=r2.docs[0].data().email;}}
    else if(pick||/^[A-Za-z0-9]{20,40}$/.test(q))uid=q;
    // non trovato per email: cerco il profilo con il nome che si vede in chat (con l'email è la parte prima della @)
    if(!uid){const nm=q.includes('@')?q.split('@')[0]:q;
      for(const n of [...new Set([nm,nm.toLowerCase()])]){const r=await ff.getDocs(ff.query(ff.collection(db,'profiles'),ff.where('name','==',n)));if(r.docs.length){uid=r.docs[0].id;if(r.docs.length>1)toast('Più utenti con il nome «'+n+'»: uso il primo');break;}}
      if(!uid&&q.includes('@'))q=nm;}
    if(uid===me().uid){box.innerHTML='<p class="small" style="color:var(--acc2)">Questo è il tuo account.</p>';return;}
    let u=null,data={docs:[]},diary={docs:[]},prof=null;
    if(uid)[u,data,diary,prof]=await Promise.all([ff.getDoc(ff.doc(db,'users',uid)),ff.getDocs(ff.collection(db,'users',uid,'data')),ff.getDocs(ff.collection(db,'users',uid,'diary')),ff.getDoc(ff.doc(db,'profiles',uid))]);
    // messaggi: per codice utente, oppure per nome (utenti già cancellati)
    const name0=prof?.exists()?prof.data().name:'';
    // messaggi: scorro le stanze una per una (nessun indice da creare su Firestore)
    const msgs={docs:[]},rooms=await ff.getDocs(ff.collection(db,'rooms'));
    for(const r of rooms.docs){try{const m=await ff.getDocs(ff.query(ff.collection(db,'rooms',r.id,'msgs'),uid?ff.where('uid','==',uid):ff.where('name','==',q)));msgs.docs.push(...m.docs);}catch(e){}}
    const hasData=u?.exists()||data.docs.length||diary.docs.length||prof?.exists();
    if(!hasData&&!msgs.docs.length){
      // nessuna corrispondenza esatta: propongo gli utenti con email o nome simili
      const cand=await delCandidates(q);
      if(cand.length){box.innerHTML=`<p class="small mut" style="margin:0 0 6px">Nessuna corrispondenza esatta. Utenti simili:</p>`+cand.map(c=>`<div class="croom" style="cursor:default"><div style="flex:1;min-width:0"><b>${esc(c.name||'—')}</b><div class="small mut" style="word-break:break-all">${esc(c.email||'email non salvata')} · ${esc(c.uid)}</div></div><button class="btn" style="padding:7px 12px" onclick="CHAT.delFind('${c.uid}')">Scegli</button></div>`).join('');return;}
      box.innerHTML=`<p class="small" style="color:var(--acc2)">Nessun dato né messaggio trovato per «${esc(q)}». Per un utente già cancellato prova con il nome come appare in chat.</p>`;return;}
    const get=k=>{const d=data.docs.find(x=>x.id===k);try{return d?JSON.parse(d.data().v):null;}catch(e){return null;}};
    email=email||(u?.exists()?u.data().email:'');
    CH._del={uid,email,name:q,msgs:msgs.docs.map(d=>d.ref.path),uids:[...new Set(msgs.docs.map(d=>d.data().uid).filter(Boolean))]};
    box.innerHTML=(hasData?`<div class="kv"><span>Utente</span><b>${esc(name0||'—')}</b></div><div class="kv"><span>Email</span><b style="word-break:break-all">${esc(email||'—')}</b></div><div class="kv"><span>UID</span><b style="word-break:break-all;font-size:12px">${esc(uid)}</b></div>
      <div class="kv"><span>Spot salvati</span><b>${(get('spots')||[]).filter(x=>x&&!x.here).length}</b></div><div class="kv"><span>Uscite nel diario</span><b>${diary.docs.filter(d=>!d.data().deleted).length}</b></div><div class="kv"><span>Premium</span><b>${get('premium')?.ok?'sì ⭐':'no'}</b></div>`
      :`<p class="small mut">Nessun dato dell'account (probabilmente già cancellato).</p>`)+
      `<div class="kv"><span>Messaggi in chat</span><b>${msgs.docs.length}</b></div>
      <button class="btn full" style="margin-top:10px;background:#c0392b;color:#fff" onclick="CHAT.delRun()">🗑️ Cancella ${hasData?'tutti i dati e i messaggi':'tutti i messaggi'}</button>`;
  }catch(e){box.innerHTML=`<p class="small" style="color:var(--acc2)">⚠️ ${e.code==='permission-denied'?'Permesso negato: pubblica le regole aggiornate (firestore.rules) in Console Firebase.':esc(e.code||e.message)}</p>`;}
};
// utenti con email o nome che contengono il testo cercato (o una sua parte)
async function delCandidates(q){const ff=F(),db=D(),map={};
  const parts=q.toLowerCase().split(/[@.\s_-]+/).filter(x=>x.length>=3&&!['gmail','com','it','hotmail','libero','yahoo','outlook','icloud'].includes(x));if(!parts.length)return [];
  try{(await ff.getDocs(ff.collection(db,'users'))).docs.forEach(d=>{map[d.id]={uid:d.id,email:d.data().email||''};});}catch(e){}
  try{(await ff.getDocs(ff.collection(db,'profiles'))).docs.forEach(d=>{map[d.id]={...(map[d.id]||{uid:d.id}),name:d.data().name||''};});}catch(e){}
  return Object.values(map).filter(c=>c.uid!==me().uid&&parts.some(p=>(c.email||'').toLowerCase().includes(p)||(c.name||'').toLowerCase().includes(p))).slice(0,10);}
CH.delRun=async()=>{
  const d=CH._del;if(!d||!CH.isAdmin())return;
  const t=prompt(`Cancellare definitivamente dati e messaggi di ${d.email||d.uid||d.name}?\nNon si può annullare. Scrivi CANCELLA per confermare.`);if(t==null)return;
  if(t.trim().toUpperCase()!=='CANCELLA'){toast('Cancellazione annullata');return;}
  const box=document.getElementById('delres'),ff=F(),db=D();box.innerHTML='<p class="small mut">Cancello…</p>';let n=0;
  const delCol=async(...p)=>{const s=await ff.getDocs(ff.collection(db,...p));for(const x of s.docs){await ff.deleteDoc(ff.doc(db,...p,x.id));n++;}};
  try{
    // messaggi scritti nei canali, nei gruppi e nei privati
    for(const path of d.msgs){try{await ff.deleteDoc(ff.doc(db,path));n++;}catch(e){}}
    for(const uid of d.uids.length?d.uids:(d.uid?[d.uid]:[])){
      // privati con l'utente: via la conversazione; gruppi: lo tolgo (se l'aveva creato lui, elimino il gruppo)
      const rs=await ff.getDocs(ff.query(ff.collection(db,'rooms'),ff.where('members','array-contains',uid)));
      for(const r of rs.docs){const x=r.data();
        if(x.type==='dm'||(x.type==='group'&&x.owner===uid)){await delCol('rooms',r.id,'msgs');await ff.deleteDoc(ff.doc(db,'rooms',r.id));n++;}
        else if(x.type==='group'){await ff.setDoc(ff.doc(db,'rooms',r.id),{members:(x.members||[]).filter(m=>m!==uid)},{merge:true});n++;}}
      // anteprima dell'ultimo messaggio nei canali
      const ls=await ff.getDocs(ff.query(ff.collection(db,'rooms'),ff.where('last.uid','==',uid)));
      for(const r of ls.docs){try{await ff.setDoc(ff.doc(db,'rooms',r.id),{last:null},{merge:true});}catch(e){}}}
    if(d.uid){
      await delCol('users',d.uid,'data');await delCol('users',d.uid,'diary');
      try{await delCol('notifs',d.uid,'items');}catch(e){}
      for(const p of [['users',d.uid],['profiles',d.uid],['locations',d.uid],['notifs',d.uid]]){try{await ff.deleteDoc(ff.doc(db,...p));n++;}catch(e){}}}
    CH._del=null;
    box.innerHTML=`<p class="small" style="color:var(--ok)">✅ Cancellati ${n} elementi.${d.uid?` Ora elimina l'account da Console Firebase › Authentication${d.email?` (${esc(d.email)})`:''}: poi l'utente potrà registrarsi di nuovo con la stessa email.`:''}</p>`;
    toast('🗑️ Cancellazione completata');
  }catch(e){box.innerHTML=`<p class="small" style="color:var(--acc2)">⚠️ Cancellazione interrotta: ${esc(e.code||e.message)} (${n} elementi già cancellati). Puoi riprovare.</p>`;}
};
CH.modUnban=async uid=>{try{await F().deleteDoc(F().doc(D(),'banned',uid));toast('Utente sbloccato');render();}catch(e){toast('⚠️ '+(e.code||e.message));}};

document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S.tab==='chat'&&CH.rid)markSeen(CH.rid);});
})();
