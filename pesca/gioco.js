/* ===================== LenzApp · Gioco: surfcasting a Castelporziano =====================
   Tutta la grafica è disegnata in tempo reale (niente immagini): cielo, sole e luna nella posizione vera,
   nuvole, pioggia, vento, onde e luce seguono le previsioni reali (Open-Meteo) per l'ora di gioco. */
(()=>{
'use strict';
const SPOT={id:'g_castelporziano',name:'Castelporziano',lat:41.6797,lon:12.3786,mode:'coast'};
const FACE=225;            // la spiaggia guarda a sud-ovest: davanti hai il mare, a destra Ostia, a sinistra Torvaianica
const R=Math.PI/180,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const LSG=(k,d)=>{try{const v=JSON.parse(localStorage.getItem('lenza.gioco.'+k));return v==null?d:v;}catch(e){return d;}};
const LSS=(k,v)=>{try{localStorage.setItem('lenza.gioco.'+k,JSON.stringify(v));}catch(e){}};
const escH=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- esche ---------- */
const BAITS=[
  {k:'koreano',n:'Koreano',e:'🪱',d:'Verme resistente: mormore, orate, ombrine',life:55},
  {k:'bibi',n:'Bibi',e:'🪱',d:'Il preferito delle orate, ottimo per ombrine',life:45},
  {k:'arenicola',n:'Arenicola',e:'🪱',d:'Profumata: saraghi, spigole, ombrine, mormore',life:35},
  {k:'americano',n:'Americano',e:'🪱',d:'Coreano americano: mormore, lecce stella, orate',life:40},
  {k:'cannolicchio',n:'Cannolicchio',e:'🐚',d:'Esca regina per orate e ombrine',life:40},
  {k:'cozza',n:'Cozza',e:'🦪',d:'Saraghi e orate; si sfila facilmente',life:25},
  {k:'sarda',n:'Sarda',e:'🐟',d:'Filetto: serra, spigole, lecce (e granchi!)',life:30},
  {k:'seppia',n:'Seppia',e:'🦑',d:'Strisce resistenti: spigole, serra, dentici',life:70},
  {k:'gambero',n:'Gambero',e:'🦐',d:'Spigole, orate, lecce stella, saraghi',life:35},
  {k:'cefalotto',n:'Cefalotto vivo',e:'🐠',d:'Esca viva: leccia amia, ricciola, spigole grosse',life:90},
];
const B=Object.fromEntries(BAITS.map(b=>[b.k,b]));

/* ---------- specie (stagioni, esche, mare, ora, distanza, taglie) ---------- */
// mo: mesi 1-12 con peso; bait: gradimento; wave:[min,ideale,max] m; time: alba/giorno/tramonto/notte; d:[min,max] m dalla riva
// w:[min,tipico,max] kg; pow: forza in combattimento; lw:[a,b] (g, cm); legal: misura minima cm; ab: abbondanza
const SP=[
  {n:'Orata',ab:.8,mo:{1:.3,2:.2,3:.3,4:.8,5:1,6:.9,7:.6,8:.6,9:1,10:1,11:.9,12:.5},bait:{bibi:1,cannolicchio:1,cozza:.8,gambero:.7,americano:.5,koreano:.5,arenicola:.4},wave:[0,.4,1.1],time:{alba:1,giorno:.8,tramonto:1,notte:.5},d:[35,120],w:[.3,.8,3.2],pow:.85,lw:[.0115,3.05],legal:20,bite:'decisa',col:{b:'#9aa7b0',t:'#c9d2d8',belly:'#eef2f4',band:'#d9b24a',spot:'#1d2328'},shape:{h:.42,fork:.55}},
  {n:'Spigola',ab:.5,mo:{1:1,2:1,3:.8,4:.5,5:.3,6:.2,7:.2,8:.2,9:.4,10:.8,11:1,12:1},bait:{cefalotto:1,seppia:.8,sarda:.7,arenicola:.7,gambero:.7,americano:.5,koreano:.5},wave:[.3,.9,2.2],time:{alba:1,giorno:.35,tramonto:.9,notte:1},d:[10,70],w:[.4,1.2,7],pow:1,lw:[.0087,3.08],legal:25,bite:'violenta',col:{b:'#5d6b78',t:'#aeb8c0',belly:'#edf0f2',spot:'#2a3036'},shape:{h:.3,fork:.25}},
  {n:'Sarago maggiore',ab:.55,mo:{1:.9,2:.9,3:.8,4:.6,5:.5,6:.4,7:.4,8:.4,9:.6,10:.9,11:1,12:1},bait:{cozza:1,arenicola:.8,koreano:.7,bibi:.6,cannolicchio:.6,gambero:.6},wave:[.3,.8,1.6],time:{alba:.9,giorno:.5,tramonto:1,notte:.9},d:[25,90],w:[.2,.5,1.8],pow:.9,lw:[.0151,3.03],legal:23,bite:'nervosa',col:{b:'#8c969e',t:'#c3cbd1',belly:'#e9edef',bars:'#3a4248',spot:'#15191c'},shape:{h:.46,fork:.5}},
  {n:'Serra',ab:.4,mo:{6:.4,7:.8,8:.9,9:1,10:1,11:.8,12:.3},bait:{sarda:1,cefalotto:.8,seppia:.5},wave:[0,.6,1.8],time:{alba:.9,giorno:.4,tramonto:1,notte:.6},d:[30,120],w:[.5,1.5,7],pow:1.15,lw:[.0098,3.06],legal:0,bite:'violenta',teeth:true,col:{b:'#4f7f8f',t:'#9cc0c8',belly:'#eaf1f2',spot:'#22383f'},shape:{h:.28,fork:.6}},
  {n:'Mormora',ab:1,mo:{3:.3,4:.7,5:1,6:1,7:1,8:1,9:.9,10:.7,11:.4},bait:{koreano:1,americano:.9,arenicola:.8,bibi:.7,cannolicchio:.4},wave:[0,.3,.9],time:{alba:.9,giorno:.9,tramonto:1,notte:.7},d:[30,100],w:[.1,.25,.7],pow:.5,lw:[.0106,3.07],legal:20,bite:'picchiettata',col:{b:'#b4b9ba',t:'#d9dcdc',belly:'#f2f3f3',vbars:'#4d5355',spot:'#2a2d2e'},shape:{h:.33,fork:.55}},
  {n:'Leccia stella',ab:.5,mo:{6:.6,7:.9,8:1,9:1,10:.8,11:.4},bait:{americano:.7,gambero:.7,sarda:.6,cefalotto:.6,koreano:.4},wave:[0,.4,1],time:{alba:1,giorno:.9,tramonto:.9,notte:.3},d:[15,80],w:[.2,.6,1.6],pow:1,lw:[.013,3.0],legal:0,bite:'decisa',col:{b:'#8ea0ae',t:'#cfd8de',belly:'#f4f6f7',dots:'#2c3a44',spot:'#2c3a44'},shape:{h:.44,fork:.75}},
  {n:'Ombrina',ab:.35,mo:{4:.5,5:.8,6:1,7:1,8:1,9:.8,10:.6,11:.3},bait:{arenicola:1,cannolicchio:.9,bibi:.8,koreano:.7,gambero:.5},wave:[.2,.6,1.4],time:{alba:.6,giorno:.3,tramonto:.8,notte:1},d:[20,80],w:[.5,1.5,6],pow:.85,lw:[.0102,3.07],legal:0,bite:'decisa',col:{b:'#8f8a6d',t:'#c7c1a0',belly:'#efece0',lines:'#c9a24a',spot:'#3a3626'},shape:{h:.32,fork:.05}},
  {n:'Granchio blu',ab:.7,crab:true,mo:{6:.6,7:1,8:1,9:1,10:.9,11:.6,12:.2},bait:{sarda:1,cozza:.9,seppia:.8,cannolicchio:.7,gambero:.7,bibi:.4,arenicola:.4,koreano:.3,americano:.3},wave:[0,.2,.8],time:{alba:.6,giorno:.5,tramonto:.8,notte:1},d:[5,70],w:[.15,.3,.55],pow:.35,lw:[.25,2.6],legal:0,bite:'picchiettata',col:{b:'#2f6fb5',t:'#79a9d8'}},
  {n:'Leccia amia',ab:.09,mo:{4:.3,5:.6,6:.5,9:.8,10:1,11:.9,12:.3},bait:{cefalotto:1,sarda:.15},wave:[0,.5,1.4],time:{alba:1,giorno:.5,tramonto:1,notte:.3},d:[25,110],w:[3,7,22],pow:2.1,lw:[.0128,2.97],legal:0,bite:'partenza',col:{b:'#6e7568',t:'#b9bcb0',belly:'#efefe9',spot:'#2c2f28',lat:'#3a3d36'},shape:{h:.3,fork:.7}},
  {n:'Ricciola',ab:.05,mo:{8:.4,9:.9,10:1,11:.8},bait:{cefalotto:1,seppia:.25},wave:[0,.5,1.4],time:{alba:1,giorno:.6,tramonto:.9,notte:.2},d:[40,130],w:[2,5,15],pow:1.9,lw:[.0158,2.92],legal:0,bite:'partenza',col:{b:'#5f7a86',t:'#b8c2b4',belly:'#f1efe4',stripe:'#d9b24a',spot:'#2d3a40'},shape:{h:.3,fork:.7}},
  {n:'Dentice',ab:.03,mo:{5:.6,6:.9,7:1,8:1,9:.9,10:.6},bait:{cefalotto:1,seppia:.8,gambero:.3},wave:[0,.4,1.2],time:{alba:1,giorno:.7,tramonto:.8,notte:.2},d:[60,140],w:[1,2,7],pow:1.5,lw:[.0142,3.0],legal:0,bite:'violenta',col:{b:'#c08a86',t:'#e0b7b0',belly:'#f6ece8',dots:'#3d6fa8',spot:'#7a4f4c'},shape:{h:.4,fork:.45}},
];

/* ---------- astronomia (sole e luna veri, per l'ora di gioco) ---------- */
const jd=d=>d/864e5+2440587.5;
function sunPos(date,lat,lon){
  const d=jd(date)-2451545,g=(357.529+.98560028*d)*R,q=280.459+.98564736*d,L=(q+1.915*Math.sin(g)+.02*Math.sin(2*g))*R,e=(23.439-3.6e-7*d)*R;
  const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)),dec=Math.asin(Math.sin(e)*Math.sin(L));
  return altAz(d,ra,dec,lat,lon);
}
function moonPosG(date,lat,lon){
  const d=jd(date)-2451545,L=(218.316+13.176396*d)*R,M=(134.963+13.064993*d)*R,F=(93.272+13.22935*d)*R;
  const l=L+6.289*R*Math.sin(M),b=5.128*R*Math.sin(F),e=23.4397*R;
  const ra=Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l)),dec=Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));
  const r=altAz(d,ra,dec,lat,lon);
  const Ms=(357.5291+.98560028*d)*R,sl=Ms+(1.9148*Math.sin(Ms)+.02*Math.sin(2*Ms))*R+(102.9372+180)*R;
  let ph=((l-sl)/R)%360;if(ph<0)ph+=360;r.ph=ph;r.illum=(1-Math.cos(ph*R))/2;return r;
}
function altAz(d,ra,dec,lat,lon){
  const lst=(280.16+360.9856235*d)*R+lon*R,H=lst-ra,p=lat*R;
  const alt=Math.asin(Math.sin(p)*Math.sin(dec)+Math.cos(p)*Math.cos(dec)*Math.cos(H));
  const az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(p)-Math.tan(dec)*Math.cos(p));
  return {alt:alt/R,az:((az/R+180)%360+360)%360};
}

/* ---------- audio (sintetizzato, niente file) ---------- */
const AU={on:LSG('audio',true),ctx:null,sea:null};
function ac(){if(!AU.on)return null;if(!AU.ctx){try{AU.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}if(AU.ctx.state==='suspended')AU.ctx.resume();return AU.ctx;}
function bell(n=1,vol=.25){const c=ac();if(!c)return;for(let i=0;i<n;i++){const t=c.currentTime+i*.16;
  for(const [f,g] of [[2350,1],[3520,.5],[5150,.25]]){const o=c.createOscillator(),v=c.createGain();o.frequency.value=f*(1+Math.random()*.01);v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(vol*g,t+.005);v.gain.exponentialRampToValueAtTime(.0001,t+1.1);o.connect(v).connect(c.destination);o.start(t);o.stop(t+1.2);}}}
function noiseBuf(c){const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5;}return b;}
function splash(vol=.35){const c=ac();if(!c)return;const s=c.createBufferSource();s.buffer=noiseBuf(c);const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=900;const v=c.createGain();v.gain.setValueAtTime(vol,c.currentTime);v.gain.exponentialRampToValueAtTime(.001,c.currentTime+.6);s.connect(f).connect(v).connect(c.destination);s.start();s.stop(c.currentTime+.7);}
function click(){const c=ac();if(!c)return;const o=c.createOscillator(),v=c.createGain();o.type='square';o.frequency.value=1800;v.gain.setValueAtTime(.04,c.currentTime);v.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.03);o.connect(v).connect(c.destination);o.start();o.stop(c.currentTime+.04);}
function whoosh(){const c=ac();if(!c)return;const s=c.createBufferSource();s.buffer=noiseBuf(c);const f=c.createBiquadFilter();f.type='highpass';f.frequency.setValueAtTime(400,c.currentTime);f.frequency.linearRampToValueAtTime(2500,c.currentTime+.5);const v=c.createGain();v.gain.setValueAtTime(.0001,c.currentTime);v.gain.linearRampToValueAtTime(.25,c.currentTime+.12);v.gain.exponentialRampToValueAtTime(.001,c.currentTime+.8);s.connect(f).connect(v).connect(c.destination);s.start();s.stop(c.currentTime+.9);}
function seaSound(level){const c=AU.on?ac():null;
  if(!c){if(AU.sea){try{AU.sea.s.stop();}catch(e){}AU.sea=null;}return;}
  if(!AU.sea){const s=c.createBufferSource();s.buffer=noiseBuf(c);s.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=500;const v=c.createGain();v.gain.value=0;s.connect(f).connect(v).connect(c.destination);s.start();AU.sea={s,v,f};}
  AU.sea.v.gain.setTargetAtTime(level,c.currentTime,.3);}

/* ---------- stato del gioco ---------- */
const G={};window.GAME=G;
let cv,cx,W=0,H=0,DPR=1,raf=0,last=0,root,ui,hud;
const st={phase:'load',t0:0,gt:0,speed:LSG('speed',10),X:null,sim:false,wx:null,rods:[],sel:0,msg:'',car:{x:-.4,v:0,stop:false},items:[],walk:0,clouds:[],stars:[],drops:[],
  fight:null,cast:null,catchShow:null,bag:LSG('bag',[]),best:LSG('best',{}),total:LSG('total',{n:0,kg:0,pts:0}),seed:Math.random()*1000,lead:LSG('lead',150),hook:LSG('hook','medio'),nRods:LSG('nrods',3),flash:0,lightning:0,setupStep:0};
const gameDate=()=>new Date(st.gt);
G._st=st;G._bite=i=>startBite(st.rods[i]);G._sp=n=>SP.find(x=>x.n===n);G._ui=()=>setUI();G._rate=i=>({r:biteRate(st.rods[i]),sp:speciesWeights(st.rods[i]).filter(x=>x[1]>0).map(([a,f])=>a.n+':'+f.toFixed(3)).join(' ')});

/* ---------- meteo reale per l'ora di gioco ---------- */
async function loadWx(){
  try{const r=await window.fetchRaw(SPOT);st.sim=!!r.sim;st.X=window.build(r.w,r.m,SPOT,'coast');}catch(e){st.X=null;st.sim=true;}
}
function wxAt(t){
  const X=st.X;const def={temp:16,ws:10,wd:240,wg:15,cc:30,pr:0,code:1,wave:.5,wper:5,sst:17,idx:55,p:1015};
  if(!X||!X.hours?.length)return def;const hs=X.hours;let i=hs.findIndex(h=>h.t.getTime()>t);if(i<=0)i=i<0?hs.length-1:1;
  const a=hs[i-1],b=hs[i],f=clamp((t-a.t.getTime())/(b.t.getTime()-a.t.getTime()||1),0,1),L=k=>a[k]==null?b[k]:b[k]==null?a[k]:lerp(a[k],b[k],f);
  const ang=(p,q)=>{let d=((q-p+540)%360)-180;return (p+d*f+360)%360;};
  return {temp:L('temp'),ws:L('ws'),wd:ang(a.wd||0,b.wd||0),wg:L('wg'),cc:L('cc'),pr:L('pr'),code:f<.5?a.code:b.code,wave:L('wave')??.4,wper:L('wper')??5,sst:L('sst')??17,idx:Math.round(L('idx')??50),p:L('p')};
}
const windName=d=>['Tramontana','Grecale','Levante','Scirocco','Ostro','Libeccio','Ponente','Maestrale'][Math.round(((d%360)+360)%360/45)%8];
const seaName=h=>h<.1?'calmo':h<.5?'poco mosso':h<1.25?'mosso':h<2.5?'molto mosso':'agitato';
// vento rispetto alla spiaggia: >0 da terra (aiuta il lancio), <0 dal mare (frena)
const windHelp=(wd)=>-Math.cos((wd-FACE)*R);

/* ---------- interfaccia ---------- */
function mount(v){
  stop();root=document.createElement('div');root.id='gamebox';
  root.innerHTML=`<canvas id="gcv"></canvas><div id="ghud"></div><div id="gui"></div><button id="gx" aria-label="Esci">✕</button><button id="gau" aria-label="Audio">${AU.on?'🔊':'🔇'}</button>`;
  document.body.appendChild(root);document.body.classList.add('gaming');
  cv=root.querySelector('#gcv');cx=cv.getContext('2d');ui=root.querySelector('#gui');hud=root.querySelector('#ghud');
  root.querySelector('#gx').onclick=()=>{G.exit();};
  root.querySelector('#gau').onclick=e=>{AU.on=!AU.on;LSS('audio',AU.on);e.target.textContent=AU.on?'🔊':'🔇';if(!AU.on)seaSound(0);};
  cv.addEventListener('pointerdown',onTap);
  addEventListener('resize',size);size();
  st.gt=Date.now();st.phase='load';st.rods=[];st.items=[];st.car={x:-.45,v:.0,stop:false,parked:false};st.walk=0;st.fight=null;st.cast=null;st.catchShow=null;
  initSky();setUI();last=performance.now();raf=requestAnimationFrame(loop);
  loadWx().then(()=>{st.phase='park';st.car.v=.22;setUI();});
  if(v)v.innerHTML='<div class="card" style="text-align:center;padding:30px"><p class="mut">Il gioco è aperto a tutto schermo.</p><button class="btn" onclick="GAME.mount()">🎣 Riapri il gioco</button></div>';
}
function stop(){cancelAnimationFrame(raf);raf=0;removeEventListener('resize',size);document.getElementById('gamebox')?.remove();document.body.classList.remove('gaming');seaSound(0);}
addEventListener('hashchange',()=>{if(location.hash!=='#gioco'&&document.getElementById('gamebox'))stop();});
G.mount=mount;G.exit=()=>{stop();if(window.go)go('altro');};
function size(){DPR=Math.min(2,devicePixelRatio||1);W=root.clientWidth;H=root.clientHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';cx.setTransform(DPR,0,0,DPR,0,0);SAND=null;}

const btn=(t,f,cls='')=>`<button class="gb ${cls}" onclick="GAME.${f}">${t}</button>`;
function setUI(){
  const p=st.phase;let h='';
  if(p==='load')h=`<div class="gpanel"><b>Castelporziano · ${new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'})}</b><div class="gs">Leggo meteo, vento e mare reali…</div></div>`;
  else if(p==='park')h=`<div class="gpanel"><b>🚗 Parcheggia</b><div class="gs">Via Litoranea, Cancello 8. Frena quando l'auto è sulle strisce del posto libero.</div>${btn('🛑 Frena','brake()','big')}</div>`;
  else if(p==='trunk'){const all=TRUNK.every(k=>st.items.includes(k.k));h=`<div class="gpanel"><b>🎒 Prendi l'attrezzatura dal bagagliaio</b><div class="gitems">${TRUNK.map(k=>`<button class="gi ${st.items.includes(k.k)?'on':''}" onclick="GAME.take('${k.k}')"><span>${k.e}</span>${k.n}</button>`).join('')}</div>${all?btn('🚶 Scendi in spiaggia','toBeach()','big'):'<div class="gs">Tocca ogni oggetto per caricarlo</div>'}</div>`;}
  else if(p==='walk')h=`<div class="gpanel"><b>🚶 Passerella sulle dune</b><div class="gs">Tieni premuto per camminare verso il mare</div><button class="gb big" id="gwalk">👣 Cammina</button></div>`;
  else if(p==='setup'){const w=wxAt(st.gt),sug=suggestLead(w.wave);
    h=`<div class="gpanel"><b>🔧 Monta l'attrezzatura</b>
      <div class="grow"><span>Canne</span>${[2,3].map(n=>`<button class="gc ${st.nRods===n?'on':''}" onclick="GAME.setN(${n})">${n}</button>`).join('')}</div>
      <div class="grow"><span>Piombo</span>${[80,100,125,150,175,200].map(g=>`<button class="gc ${st.lead===g?'on':''}" onclick="GAME.setLead(${g})">${g} g</button>`).join('')}</div>
      <div class="gs">Con mare ${seaName(w.wave)} (${w.wave.toFixed(1)} m) consiglio ${sug} g: più leggero lanci più lontano, ma la corrente lo trascina.</div>
      <div class="grow"><span>Amo</span>${[['piccolo','n. 6'],['medio','n. 2'],['grande','2/0']].map(([k,n])=>`<button class="gc ${st.hook===k?'on':''}" onclick="GAME.setHook('${k}')">${n}</button>`).join('')}</div>
      <div class="gs">Amo piccolo: più abboccate di mormore e saraghi, ma i pesci grossi lo aprono. Grande: per esche grosse e predatori.</div>
      ${btn('🔧 Monta le canne','assemble()','big')}</div>`;}
  else if(p==='assemble'){const steps=ASM();h=`<div class="gpanel"><b>🔧 Montaggio (${st.nRods} canne)</b><div class="gsteps">${steps.map((x,i)=>`<button class="gst ${i<st.setupStep?'done':i===st.setupStep?'now':''}" ${i===st.setupStep?'onclick="GAME.step()"':''}><span>${i<st.setupStep?'✅':x[0]}</span>${x[1]}</button>`).join('')}</div>
    ${st.setupStep>=steps.length?btn('🪝 Pronto: innesca le esche','plant()','big'):'<div class="gs">Tocca il passo evidenziato</div>'}</div>`;}
  else if(p==='bait'){const r=st.rods[st.sel];h=`<div class="gpanel"><b>🪝 Innesca la canna ${st.sel+1}</b><div class="gbaits">${BAITS.map(b=>`<button class="gbt" onclick="GAME.bait('${b.k}')"><span>${b.e}</span><b>${b.n}</b><small>${b.d}</small></button>`).join('')}</div>${r?.bait?btn('Annulla','toWait()'):''}</div>`;}
  else if(p==='cast')h=`<div class="gpanel"><b>🎯 Lancia la canna ${st.sel+1} · ${B[st.rods[st.sel].bait].n}</b><div class="gs">Tieni premuto per caricare, rilascia nella zona verde. ${(()=>{const w=wxAt(st.gt),hp=windHelp(w.wd);return w.ws>12?(hp>.3?'Vento da terra: ti aiuta.':hp<-.3?'Vento dal mare: lancerai più corto.':'Vento laterale: la lenza farà pancia.'):'';})()}</div><div class="gpow"><i id="gpw"></i><s></s></div><button class="gb big" id="gcastb">🎣 Carica e lancia</button></div>`;
  else if(p==='wait'){h=`<div class="gpanel slim"><div class="grods">${st.rods.map((r,i)=>`<button class="gr ${r.state==='bite'?'alert':''}" onclick="GAME.rod(${i})"><b>Canna ${i+1}</b><small>${r.bait?B[r.bait].n:'senza esca'}${r.dist?' · '+Math.round(r.dist)+' m':''}</small><small>${rodStatus(r)}</small></button>`).join('')}</div>
    <div class="grow" style="justify-content:center">${[1,10,60].map(s=>`<button class="gc ${st.speed===s?'on':''}" onclick="GAME.setSpeed(${s})">${s===1?'▶ tempo reale':'⏩ x'+s}</button>`).join('')}<button class="gc" onclick="GAME.bagView()">🧺 ${st.bag.length}</button></div>${st.msg?`<div class="gs" style="text-align:center">${st.msg}</div>`:''}</div>`;}
  else if(p==='rod'){const r=st.rods[st.sel];h=`<div class="gpanel"><b>Canna ${st.sel+1}</b><div class="gs">${r.bait?B[r.bait].n+' a '+Math.round(r.dist)+' m · '+rodStatus(r):'Senza esca'}</div>
    ${r.state==='bite'?btn('⚡ FERRA!','strike()','big hot'):''}${btn('🔄 Recupera e cambia esca','rebait()')}${btn('↩ Torna a sedere','toWait()')}</div>`;}
  else if(p==='fight')h=`<div class="gpanel"><b id="gfti">Combattimento</b><div class="gbar"><i id="gten"></i><span>tensione</span></div><div class="gbar dist"><i id="gdis"></i><span id="gdt">distanza</span></div>
    <div class="grow"><span>Frizione</span><input type="range" min="1" max="10" value="${st.fight?.drag||5}" oninput="GAME.drag(this.value)" style="flex:1"></div><button class="gb big" id="greel">🌀 Tieni premuto per recuperare</button></div>`;
  else if(p==='catch'){const c=st.catchShow;h=`<div class="gpanel"><div class="gfish"><canvas id="gfc" width="600" height="260"></canvas></div>
    <b style="font-size:22px">${c.fish?escH(c.sp.n):c.txt}</b>${c.fish?`<div class="gs" style="font-size:17px">${c.crab?'larghezza '+c.l+' cm':c.l+' cm'} · ${c.w<1?Math.round(c.w*1000)+' g':c.w.toFixed(2).replace('.',',')+' kg'}${c.rec?' · 🏆 record!':''}</div>
    ${c.sp.legal&&c.l<c.sp.legal?`<div class="gs warn">⚠️ Sotto misura (minimo ${c.sp.legal} cm): va rilasciato.</div>`:''}${c.crab?'<div class="gs">Specie invasiva: non va rimessa in mare.</div>':''}`:`<div class="gs">${c.why||''}</div>`}
    <div class="grow" style="justify-content:center">${c.fish?(c.crab?btn('🪣 Nel secchio','keep()','big'):(c.sp.legal&&c.l<c.sp.legal?btn('💚 Rilascia','release()','big'):btn('💚 Rilascia','release()')+btn('🧺 Tieni','keep()','big'))):(st.rods[st.sel]?.bait&&st.rods[st.sel].baitLeft>0?btn('↩ Lascia l\'esca e torna a sedere','missBack()'):'')+btn('🪝 Recupera e innesca di nuovo','rebaitAfter()','big')}</div></div>`;}
  else if(p==='bag'){h=`<div class="gpanel"><b>🧺 Il tuo carniere</b><div class="gs">Oggi: ${st.bag.length} pesci · ${st.bag.reduce((a,c)=>a+c.w,0).toFixed(2).replace('.',',')} kg · Totale: ${st.total.n} pesci, ${st.total.pts} punti</div>
    <div class="glist">${st.bag.slice().reverse().map(c=>`<div>${c.rel?'💚':'🧺'} <b>${escH(c.n)}</b> ${c.l} cm · ${c.w<1?Math.round(c.w*1000)+' g':c.w.toFixed(2).replace('.',',')+' kg'} <small>${new Date(c.t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})} · ${escH(c.bait)}</small></div>`).join('')||'<div class="gs">Ancora niente: pazienza, è surfcasting!</div>'}</div>
    <div class="gs">Record: ${Object.entries(st.best).map(([k,v])=>`${escH(k)} ${v.toFixed(2).replace('.',',')} kg`).join(' · ')||'nessuno'}</div>${btn('↩ Torna alle canne','toWait()','big')}</div>`;}
  ui.innerHTML=h;
  const wb=document.getElementById('gwalk');if(wb){const on=e=>{e.preventDefault();st.walking=true;},off=()=>{st.walking=false;};wb.onpointerdown=on;wb.onpointerup=off;wb.onpointerleave=off;wb.onpointercancel=off;}
  const cb=document.getElementById('gcastb');if(cb){cb.onpointerdown=e=>{e.preventDefault();ac();st.cast={p:0,dir:1,on:true};};const rel=()=>{if(st.cast?.on)doCast();};cb.onpointerup=rel;cb.onpointerleave=rel;}
  const rb=document.getElementById('greel');if(rb){const on=e=>{e.preventDefault();if(st.fight)st.fight.reel=true;},off=()=>{if(st.fight)st.fight.reel=false;};rb.onpointerdown=on;rb.onpointerup=off;rb.onpointerleave=off;rb.onpointercancel=off;}
  if(p==='catch')setTimeout(drawFishCard,0);
}
const ASM=()=>[['📍','Pianta i picchetti sulla battigia'],['⚙️','Monta i mulinelli sulle canne'],['🧵','Passa il filo negli anelli'],['🪢','Lega il trave con il nodo e lo shock leader'],['⚓','Aggancia il piombo da '+st.lead+' g'],['🔔','Metti campanelli'+(sunPos(gameDate(),SPOT.lat,SPOT.lon).alt<2?' e starlite':'')]];
const TRUNK=[{k:'zaino',n:'Zaino',e:'🎒'},{k:'canne',n:'Borsone canne',e:'🎣'},{k:'esche',n:'Esche',e:'🪱'},{k:'picchetti',n:'Picchetti',e:'📍'},{k:'sedia',n:'Sedia',e:'🪑'},{k:'frontale',n:'Frontale',e:'🔦'}];
const suggestLead=w=>w<.3?100:w<.6?125:w<1?150:w<1.6?175:200;
function rodStatus(r){if(!r.bait)return 'da innescare';if(r.state==='bite')return '🔔 ABBOCCATA!';if(r.baitLeft<=0)return 'esca finita?';const m=Math.round((r.baitLeft));return m>20?'in pesca':'esca consumata';}

/* ---------- azioni ---------- */
G.brake=()=>{if(st.phase!=='park')return;st.car.v=0;st.car.stop=true;const off=Math.abs(st.car.x-.56);
  st.msg=off<.03?'Parcheggio perfetto!':off<.08?'Un po\' storto, ma va bene':'Lontano dal posto… lo sistemi a mano';st.car.x=.56;
  setTimeout(()=>{st.phase='trunk';st.msg='';setUI();},900);setUI();ui.querySelector('.gs').textContent=st.msg;};
G.take=k=>{if(!st.items.includes(k)){st.items.push(k);click();}setUI();};
G.toBeach=()=>{st.phase='walk';st.walk=0;setUI();};
G.setN=n=>{st.nRods=n;LSS('nrods',n);setUI();};G.setLead=g=>{st.lead=g;LSS('lead',g);setUI();};G.setHook=k=>{st.hook=k;LSS('hook',k);setUI();};
G.assemble=()=>{st.phase='assemble';st.setupStep=0;setUI();};
G.step=()=>{st.setupStep++;click();if(st.setupStep===1)splash(.08);setUI();};
G.plant=()=>{const n=st.nRods;st.rods=Array.from({length:n},(_,i)=>({i,x:n===2?[.5,.72][i]:[.42,.6,.78][i],bait:null,dist:0,state:'idle',baitLeft:0,bend:0,bitePlan:null,lineSlack:0}));
  splash(.1);st.sel=0;st.phase='bait';st.msg='';setUI();};
G.bait=k=>{const r=st.rods[st.sel];r.bait=k;r.baitLeft=B[k].life*(k==='cozza'&&st.hook==='piccolo'?1.2:1);st.phase='cast';click();setUI();};
function doCast(){const c=st.cast;c.on=false;const r=st.rods[st.sel],w=wxAt(st.gt);
  const p=c.p,q=p>.78&&p<.92?1:p>.92?.8-(p-.92)*3:p/.78*.95;  // zona verde 78-92%
  const leadF=clamp(1.15-(st.lead-100)/400,.85,1.1),baitF=r.bait==='cefalotto'?.55:r.bait==='sarda'||r.bait==='seppia'?.85:1,wind=1+windHelp(w.wd)*clamp(w.ws/60,0,.35);
  r.dist=clamp(130*q*leadF*baitF*wind+rnd(-6,6),8,150);r.castT=performance.now();r.state='flying';whoosh();
  st.msg=q>=1?'Lancio perfetto!':q>.8?'Buon lancio':'Lancio corto';
  setTimeout(()=>{splash();r.state='fishing';r.landT=st.gt;r.drift=0;st.cast=null;
    const nx=st.rods.findIndex(x=>!x.bait);if(nx>=0){st.sel=nx;st.phase='bait';}else{st.phase='wait';st.msg=`Canna ${r.i+1} a ${Math.round(r.dist)} m. Ora siediti e guarda le cime.`;}setUI();},900);
  setUI();}
G.toWait=()=>{st.phase='wait';setUI();};
G.setSpeed=s=>{st.speed=s;LSS('speed',s);setUI();};
G.rod=i=>{st.sel=i;if(!st.rods[i].bait){st.phase='bait';setUI();return;}st.phase='rod';setUI();};
G.rebait=()=>{const r=st.rods[st.sel];r.bait=null;r.state='idle';r.dist=0;r.bitePlan=null;st.phase='bait';setUI();};
G.rebaitAfter=()=>{G.rebait();};G.missBack=()=>{st.phase='wait';setUI();};
G.bagView=()=>{st.phase='bag';setUI();};
G.drag=v=>{if(st.fight)st.fight.drag=+v;};

/* ---------- probabilità di abboccata: stagione, esca, mare, ora, distanza, indice reale ---------- */
function period(date){const s=sunPos(date,SPOT.lat,SPOT.lon).alt;return s<-6?'notte':s<8?(date.getHours()<12?'alba':'tramonto'):'giorno';}
function waveF(sp,h){const [a,o,b]=sp.wave;if(h<a)return .5+.5*(h/(a||1));if(h>b)return Math.max(.05,1-(h-b));return h<=o?.7+.3*((h-a)/((o-a)||1)):.7+.3*((b-h)/((b-o)||1));}
function distF(sp,d){const [a,b]=sp.d;return d<a?Math.max(.15,d/a):d>b?Math.max(.15,1-(d-b)/60):1;}
function speciesWeights(r){const d=gameDate(),w=wxAt(st.gt),m=d.getMonth()+1,per=period(d),temp=w.sst||17;
  return SP.map(sp=>{const b=sp.bait[r.bait]||0;if(!b)return [sp,0];
    let f=sp.ab*(sp.mo[m]||.05)*b*waveF(sp,w.wave||0)*(sp.time[per]||.5)*distF(sp,r.dist);
    if(sp.n==='Spigola'&&temp<15)f*=1.2;if(sp.n==='Orata'&&temp<13)f*=.4;if((sp.n==='Serra'||sp.n==='Leccia stella')&&temp<18)f*=.3;
    if(st.hook==='piccolo'&&sp.w[1]>1)f*=.7;if(st.hook==='grande'&&sp.w[1]<.4)f*=.35;
    return [sp,f];});}
function biteRate(r){// abboccate per minuto di gioco
  if(!r.bait||r.state!=='fishing'||r.baitLeft<=0)return 0;const w=wxAt(st.gt),idx=clamp(w.idx??50,0,100);
  const s=speciesWeights(r).reduce((a,[,f])=>a+f,0);return s*(.35+idx/100*1.3)*.045+.004; // + piccoli pesci e granchietti che rubano l'esca
}

/* ---------- ciclo principale ---------- */
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  const gdt=dt*(st.phase==='wait'||st.phase==='rod'?st.speed:1)*1000;st.gt+=gdt;
  update(dt,gdt/60000,now);draw(now);
  raf=requestAnimationFrame(loop);
}
function update(dt,gmin,now){
  const w=wxAt(st.gt);
  if(st.phase==='park'&&!st.car.stop){st.car.x+=st.car.v*dt;if(st.car.x>1.2){st.car.x=-.45;}}
  if(st.phase==='walk'&&st.walking){st.walk+=dt*.22;if(st.walk>=1){st.walking=false;st.phase='setup';setUI();}}
  if(st.cast?.on){st.cast.p+=st.cast.dir*dt*1.15;if(st.cast.p>1){st.cast.p=1;st.cast.dir=-1;}if(st.cast.p<0){st.cast.p=0;st.cast.dir=1;}const el=document.getElementById('gpw');if(el)el.style.width=(st.cast.p*100)+'%';}
  // canne in pesca
  for(const r of st.rods){
    if(r.state==='fishing'){r.baitLeft-=gmin*(1+(w.wave||0)*.6);
      if(Math.random()<biteRate(r)*gmin)startBite(r);}
    if(r.state==='bite'){r.biteT+=dt;const pl=r.bitePlan;
      // fine dell'abboccata senza ferrata: esca rubata o pesce che si è allontanato
      if(r.biteT>pl.len){r.state='fishing';r.baitLeft-=pl.steal?999:10;st.msg=`Canna ${r.i+1}: ha smesso di battere${pl.steal?' (forse ti hanno rubato l\'esca)':''}.`;if(st.phase==='wait'||st.phase==='rod')setUI();}}
    // flessione della cima: onde (falsi segnali) + abboccata
    const swell=Math.sin(now/1000*2*Math.PI/Math.max(3,w.wper||5)+r.i)*(w.wave||.3)*.06;
    let bite=0;if(r.state==='bite'){const p=r.bitePlan,t=r.biteT;bite=p.pattern(t);}
    if(st.fight&&st.fight.r===r)bite=st.fight.ten*.9;
    r.bend=lerp(r.bend,(r.state==='fishing'||r.state==='bite'||st.fight?.r===r?.08:0)+swell+bite,.25);
  }
  if(st.phase==='fight')updFight(dt);
  // effetti meteo
  if(w.code>=95&&Math.random()<dt*.08){st.lightning=1;}st.lightning=Math.max(0,st.lightning-dt*2.5);
  seaSound(st.phase==='park'?.04:clamp(.05+(w.wave||.3)*.12,.05,.35));
  // HUD ogni ~0,5 s
  if(!update.h||now-update.h>500){update.h=now;drawHud(w);if(st.phase==='wait'){const els=ui.querySelectorAll('.gr small:last-child');st.rods.forEach((r,i)=>{if(els[i])els[i].textContent=rodStatus(r);});}}
}
function startBite(r){
  const ws=speciesWeights(r),tot=ws.reduce((a,[,f])=>a+f,0),u=Math.random()*(tot+.12);
  let acc=0,sp=null;for(const [s,f] of ws){acc+=f;if(u<acc){sp=s;break;}}
  const kind=sp?sp.bite:'picchiettata',steal=!sp||Math.random()<.18;
  const pats={picchiettata:t=>(Math.sin(t*22)>.6?.22:0)*(Math.sin(t*3.1)>-.2?1:.2),nervosa:t=>(Math.sin(t*15)>.3?.3:0)+(t%2.3<.25?.35:0),decisa:t=>t<1.2?(Math.sin(t*18)>.5?.2:0):(t%1.8<.7?.6:.15),violenta:t=>t<.6?.15:(t%1.2<.8?.85:.3),partenza:t=>t<1?.3:.95};
  r.state='bite';r.biteT=0;r.bitePlan={sp,steal,kind,pattern:pats[kind],len:kind==='partenza'?7:kind==='violenta'?6:kind==='decisa'?9:7};
  bell(kind==='picchiettata'?2:kind==='partenza'||kind==='violenta'?5:3,kind==='picchiettata'?.12:.3);
  try{navigator.vibrate?.(kind==='violenta'||kind==='partenza'?[120,60,200]:[60]);}catch(e){}
  st.msg=`🔔 Canna ${r.i+1}: ${kind==='picchiettata'?'piccole tocche…':kind==='nervosa'?'tocche nervose':kind==='decisa'?'la cima si piega decisa!':'partenza violenta!'}`;
  if(st.phase==='wait'){st.speed=Math.min(st.speed,1);setUI();}
}
G.strike=()=>{const r=st.rods[st.sel];if(r.state!=='bite')return;const p=r.bitePlan,t=r.biteT,strong=p.pattern(t)>.4;whoosh();
  let ok=p.sp&&!p.steal&&(strong?.85:.3)>Math.random();
  if(p.sp&&st.hook==='grande'&&p.sp.w[1]<.4)ok=ok&&Math.random()<.5;
  if(!ok){r.state='fishing';r.baitLeft=p.steal||Math.random()<.5?0:r.baitLeft;showCatch({fish:false,txt:strong?'Mancato!':'Troppo presto',why:strong?'Hai ferrato ma il pesce non era allamato.':'Erano solo tocche: aspetta che la cima si pieghi decisa prima di ferrare.'});return;}
  const sp=p.sp,w=sizeOf(sp);
  st.fight={r,sp,w,len:lenOf(sp,w),dist:r.dist,ten:.3,reel:false,drag:5,run:0,slack:0,t:0,pow:sp.pow*(0.6+Math.min(1.6,w/sp.w[1])*.45)};
  r.state='fight';st.phase='fight';st.speed=1;setUI();};
function sizeOf(sp){const [a,t,b]=sp.w;let x=Math.exp(Math.log(t)+(Math.random()+Math.random()+Math.random()-1.5)*.55);if(Math.random()<.04)x*=1.6;return clamp(x,a,b);}
function lenOf(sp,w){const [a,b]=sp.lw;return Math.round(Math.pow(w*1000/a,1/b)*(sp.crab?.1:1)*10)/10||Math.round(Math.pow(w*1000/a,1/b));}
function updFight(dt){const f=st.fight;if(!f)return;f.t+=dt;const r=f.r,w=wxAt(st.gt);
  // fughe del pesce
  if(f.run<=0&&Math.random()<dt*.5*f.pow)f.run=rnd(.6,2)*f.pow;f.run=Math.max(0,f.run-dt);
  const pull=(f.run>0?.6:.18)*f.pow+(w.wave||0)*.08*Math.max(0,Math.sin(performance.now()/700));
  const dragMax=.35+f.drag*.07;// frizione chiusa: tieni di più ma rischi di rompere
  let ten=(f.reel?.45:.12)+pull;if(ten>dragMax){f.dist+=(ten-dragMax)*dt*25;ten=dragMax+(ten-dragMax)*.25;if(Math.random()<dt*3)click();}
  if(f.reel&&f.run<=0)f.dist-=dt*(7-f.pow*1.5)*(1.15-f.drag*.02);else if(f.reel)f.dist-=dt*1.2;
  f.ten=lerp(f.ten,clamp(ten,0,1.2),.15);
  const lim=f.sp.teeth&&st.hook!=='grande'?.92:1.0;
  if(f.ten>lim){f.over=(f.over||0)+dt;if(f.over>.35)return endFight(false,f.sp.teeth?'Il serra ha tranciato la lenza con i denti!':'Lenza rotta: troppa tensione. Apri un po\' la frizione.');}else f.over=0;
  if(f.ten<.16)f.slack+=dt;else f.slack=Math.max(0,f.slack-dt*2);
  if(f.slack>2.6)return endFight(false,'Slamato: con la lenza lenta il pesce si è liberato.');
  if(st.hook==='piccolo'&&f.w>2.5&&f.ten>.85&&Math.random()<dt*.6)return endFight(false,'L\'amo piccolo si è aperto: pesce troppo grosso.');
  if(f.dist<=0)return endFight(true);
  const T=document.getElementById('gten'),D=document.getElementById('gdis'),DT=document.getElementById('gdt'),TI=document.getElementById('gfti');
  if(T){T.style.width=clamp(f.ten*100,0,100)+'%';T.style.background=f.ten>.85?'#ff4d5e':f.ten>.6?'#ffb547':'#2fe0cf';}
  if(D)D.style.width=clamp(f.dist/Math.max(1,r.dist)*100,0,100)+'%';if(DT)DT.textContent=Math.max(0,Math.round(f.dist))+' m';
  if(TI)TI.textContent=f.run>0?'💥 Il pesce scappa! Non forzare':f.dist<12?'🌊 È nella risacca: porta a riva con l\'onda':'🌀 Recupera senza dare lenza lenta';
}
function endFight(ok,why){const f=st.fight;st.fight=null;const r=f.r,bait=B[r.bait]?.n||'';r.state='idle';r.bait=null;r.dist=0;
  if(!ok){showCatch({fish:false,txt:'Perso!',why});return;}
  splash(.5);const rec=!st.best[f.sp.n]||f.w>st.best[f.sp.n];
  showCatch({fish:true,sp:f.sp,w:f.w,l:f.len,crab:!!f.sp.crab,rec,bait});}
function showCatch(c){st.catchShow=c;st.phase='catch';setUI();}
function record(rel){const c=st.catchShow,r=st.rods[st.sel];const e={n:c.sp.n,w:Math.round(c.w*100)/100,l:c.l,t:st.gt,rel,bait:c.bait||''};st.bag.push(e);LSS('bag',st.bag.slice(-200));
  if(c.rec){st.best[c.sp.n]=e.w;LSS('best',st.best);}st.total.n++;st.total.kg+=e.w;st.total.pts+=Math.round(e.w*100)+(rel?50:0)+(c.sp.ab<.1?300:0);LSS('total',st.total);}
G.release=()=>{record(true);st.msg='💚 Rilasciato. Bravo!';G.rebait();};
G.keep=()=>{record(false);st.msg='🧺 Nel carniere';G.rebait();};

/* ---------- tocchi sulla scena ---------- */
function onTap(e){const x=e.offsetX/W,y=e.offsetY/H;ac();
  if(st.phase==='wait'||st.phase==='rod'){let bi=-1,bd=.09;st.rods.forEach((r,i)=>{const d=Math.abs(r.x-x);if(d<bd&&y>.3){bd=d;bi=i;}});if(bi>=0)G.rod(bi);}
  if(st.phase==='park')G.brake();}

/* ---------- HUD ---------- */
function drawHud(w){const d=gameDate(),mp=moonPosG(d,SPOT.lat,SPOT.lon);
  const wi=w.code>=95?'⛈️':w.code>=80?'🌦️':w.code>=51?'🌧️':w.code>=45?'🌫️':w.cc>75?'☁️':w.cc>35?'⛅':sunPos(d,SPOT.lat,SPOT.lon).alt>0?'☀️':'🌙';
  hud.innerHTML=`<div><b>${d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</b> ${d.toLocaleDateString('it-IT',{day:'numeric',month:'short'})}${st.speed>1&&(st.phase==='wait'||st.phase==='rod')?' ⏩':''}</div>
    <div>${wi} ${Math.round(w.temp)}°</div><div title="vento">🌬️ ${Math.round(w.ws)} km/h ${windName(w.wd)}</div><div>🌊 ${(w.wave||0).toFixed(1).replace('.',',')} m · ${Math.round(w.sst)}°</div><div>${['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][Math.round(mp.ph/45)%8]}</div><div title="indice di pesca reale">🎣 ${w.idx}</div>${st.sim?'<div title="dati simulati">⚠️</div>':''}`;}

/* ======================= GRAFICA ======================= */
const HZ=()=>H*.33;             // orizzonte
const SHORE=()=>H*.53;          // battigia
const dToY=d=>HZ()+(SHORE()-HZ())*18/(18+d);
const BASEY=()=>H*.72;          // dove sono piantati i picchetti
let SAND=null;
function initSky(){st.clouds=Array.from({length:14},(_,i)=>({x:Math.random(),y:Math.random(),s:rnd(.6,1.6),seed:Math.random()*1e4,k:i}));
  st.stars=Array.from({length:220},()=>({x:Math.random(),y:Math.pow(Math.random(),1.4),m:Math.random(),tw:Math.random()*6}));
  st.drops=Array.from({length:260},()=>({x:Math.random(),y:Math.random(),v:rnd(.8,1.4)}));}
function mix(a,b,t){const p=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)],A=p(a),Bb=p(b);return '#'+A.map((v,i)=>Math.round(lerp(v,Bb[i],clamp(t,0,1))).toString(16).padStart(2,'0')).join('');}
function skyCols(alt,cc){// colori in alto/orizzonte per altezza del sole
  const k=[[-18,'#02040b','#060b18'],[-10,'#050b1d','#14203c'],[-4,'#14224a','#5a4a6e'],[0,'#2a3f78','#e0855a'],[4,'#3f6aa8','#f2b077'],[12,'#3f7fc6','#cfe1f0'],[40,'#2f78cf','#b8d8f2'],[90,'#2a6fc9','#a9d0f0']];
  let i=k.findIndex(x=>x[0]>alt);if(i<=0)i=i<0?k.length-1:1;const a=k[i-1],b=k[i],t=clamp((alt-a[0])/(b[0]-a[0]),0,1);
  let top=mix(a[1],b[1],t),hor=mix(a[2],b[2],t);const g=clamp(cc/100,0,1)*.75;const gray=alt>0?'#8d96a0':alt>-6?'#3a3f4a':'#07090d';
  return [mix(top,gray,g),mix(hor,gray,g*.9)];}
function azX(az){let d=((az-FACE+540)%360)-180;return W/2+d/70*W/2;}
function altY(alt){return HZ()-alt/38*HZ();}

function draw(now){
  const d=gameDate(),w=wxAt(st.gt),sun=sunPos(d,SPOT.lat,SPOT.lon),moon=moonPosG(d,SPOT.lat,SPOT.lon),t=now/1000;
  const night=clamp((-sun.alt)/12,0,1),dayL=clamp((sun.alt+4)/20,0,1)*(1-clamp(w.cc/100,0,1)*.45);
  if(st.phase==='park'||st.phase==='trunk')return drawParking(d,w,sun,night,dayL,t);
  if(st.phase==='walk')return drawWalk(d,w,sun,night,dayL,t);
  // cielo
  const [top,hor]=skyCols(sun.alt,w.cc),hz=HZ();
  let g=cx.createLinearGradient(0,0,0,hz);g.addColorStop(0,top);g.addColorStop(1,hor);cx.fillStyle=g;cx.fillRect(0,0,W,hz+1);
  // stelle
  if(night>0&&w.cc<90){cx.fillStyle='#fff';for(const s of st.stars){const a=night*(1-w.cc/100)*(.35+.65*Math.abs(Math.sin(t*.7+s.tw)))*s.m;if(a<.05)continue;cx.globalAlpha=a;cx.fillRect(s.x*W,s.y*hz*.95,s.m>.85?2:1.2,s.m>.85?2:1.2);}cx.globalAlpha=1;}
  // sole
  const sx=azX(sun.az),sy=altY(sun.alt);
  if(sun.alt>-3&&sx>-80&&sx<W+80){const r=Math.max(14,W*.028),glow=cx.createRadialGradient(sx,sy,0,sx,sy,r*9);const warm=clamp(1-sun.alt/15,0,1);
    glow.addColorStop(0,`rgba(255,${Math.round(lerp(250,170,warm))},${Math.round(lerp(220,90,warm))},${.55*(1-w.cc/140)})`);glow.addColorStop(1,'rgba(255,180,100,0)');cx.fillStyle=glow;cx.fillRect(sx-r*9,sy-r*9,r*18,r*18);
    cx.save();cx.beginPath();cx.rect(0,0,W,hz);cx.clip();cx.fillStyle=`rgba(255,${Math.round(lerp(248,190,warm))},${Math.round(lerp(225,120,warm))},${1-w.cc/130})`;cx.beginPath();cx.arc(sx,sy,r,0,7);cx.fill();cx.restore();}
  // luna con la fase vera
  const mx=azX(moon.az),my=altY(moon.alt);
  if(moon.alt>-2&&mx>-40&&mx<W+40){const r=Math.max(9,W*.018),a=clamp(1-dayL*.7,.25,1)*(1-w.cc/150);cx.save();cx.globalAlpha=a;
    const gl=cx.createRadialGradient(mx,my,0,mx,my,r*6);gl.addColorStop(0,'rgba(220,230,255,.35)');gl.addColorStop(1,'rgba(220,230,255,0)');cx.fillStyle=gl;cx.fillRect(mx-r*6,my-r*6,r*12,r*12);
    cx.beginPath();cx.rect(0,0,W,hz);cx.clip();cx.fillStyle='#2b3140';cx.beginPath();cx.arc(mx,my,r,0,7);cx.fill();
    const ph=moon.ph,waxing=ph<180,k=Math.cos(ph*R),lit='#f4f1e4',dark='#2b3140';
    cx.fillStyle=lit;cx.beginPath();waxing?cx.arc(mx,my,r,-Math.PI/2,Math.PI/2):cx.arc(mx,my,r,Math.PI/2,Math.PI*1.5);cx.fill();
    cx.fillStyle=k>0?dark:lit;cx.beginPath();cx.ellipse(mx,my,Math.abs(k)*r+.3,r+.3,0,0,7);cx.fill();
    const sh=cx.createRadialGradient(mx-r*.3,my-r*.3,0,mx,my,r);sh.addColorStop(0,'rgba(255,255,255,.08)');sh.addColorStop(1,'rgba(0,0,0,.18)');cx.fillStyle=sh;cx.beginPath();cx.arc(mx,my,r,0,7);cx.fill();
    cx.restore();}
  // luci lontane sulla costa (Ostia a destra, Torvaianica a sinistra) di notte
  if(night>.2){for(let i=0;i<70;i++){const side=i<40,x=side?W*(.88+((i*37)%40)/40*.14):W*(-.02+((i*53)%30)/30*.1),y=hz-((i*13)%5)*.6-1;cx.fillStyle=`rgba(255,${200+((i*7)%40)},140,${night*(.5+.5*Math.sin(t*2+i))*.8})`;cx.fillRect(x,y,1.6,1.6);}}
  // nuvole
  drawClouds(w,sun,night,t);
  // fulmine
  if(st.lightning>0){cx.fillStyle=`rgba(230,235,255,${st.lightning*.5})`;cx.fillRect(0,0,W,H);}
  // mare
  drawSea(w,sun,moon,sx,mx,night,dayL,t);
  // spiaggia
  drawBeach(w,night,dayL,t);
  // canne, lenze e pescatore
  drawRods(w,night,t);
  drawAngler(night,t);
  // pioggia
  if(w.pr>.05||(w.code>=51&&w.code<=99)){const n=Math.min(st.drops.length,Math.round(60+w.pr*90)),sl=Math.sin((w.wd-FACE)*R)*clamp(w.ws/40,0,1)*.35;
    cx.strokeStyle=`rgba(${night>.5?'160,175,200':'210,220,235'},.45)`;cx.lineWidth=1;cx.beginPath();
    for(let i=0;i<n;i++){const p=st.drops[i];p.y+=p.v*.022;p.x+=sl*.01;if(p.y>1){p.y=0;p.x=Math.random();}if(p.x>1)p.x-=1;if(p.x<0)p.x+=1;const X=p.x*W,Y=p.y*H;cx.moveTo(X,Y);cx.lineTo(X+sl*14,Y+14);}cx.stroke();}
  // vignettatura
  const vg=cx.createRadialGradient(W/2,H*.55,Math.min(W,H)*.3,W/2,H*.55,Math.max(W,H)*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${.25+night*.35})`);cx.fillStyle=vg;cx.fillRect(0,0,W,H);
  // barra di lancio: traiettoria del piombo
  for(const r of st.rods)if(r.state==='flying'){const k=clamp((performance.now()-r.castT)/900,0,1),bx=W*r.x,by=BASEY()-H*.3,ex=W*(r.x+(.5-r.x)*.25),ey=dToY(r.dist);
    const x=lerp(bx,ex,k),y=lerp(by,ey,k)-Math.sin(k*Math.PI)*H*.35;cx.fillStyle='#ddd';cx.beginPath();cx.arc(x,y,2.5,0,7);cx.fill();}
}
function cloudSprite(seed,cl){// nuvola soffice fatta di sfere sfumate
  const c=document.createElement('canvas');c.width=360;c.height=150;const g=c.getContext('2d');let s=seed;const rr=()=>(s=(s*9301+49297)%233280)/233280;
  for(let i=0;i<26;i++){const x=40+rr()*280,y=60+rr()*50-Math.sin((x-40)/280*Math.PI)*35,r=18+rr()*38;const gr=g.createRadialGradient(x,y-r*.3,r*.1,x,y,r);
    gr.addColorStop(0,`rgba(255,255,255,${.85*cl})`);gr.addColorStop(.6,`rgba(235,238,244,${.55*cl})`);gr.addColorStop(1,'rgba(210,215,225,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
  return c;}
function drawClouds(w,sun,night,t){const n=Math.round(clamp(w.cc/100,0,1)*st.clouds.length),hz=HZ(),drift=(Math.sin((w.wd-FACE+90)*R))*w.ws/3600*.6;
  const tint=sun.alt>8?[255,255,255]:sun.alt>-2?[255,190,150]:sun.alt>-8?[120,110,140]:[38,44,60];
  for(let i=0;i<n;i++){const c=st.clouds[i];if(!c.img)c.img=cloudSprite(c.seed,1);c.x+=drift*.016+.00002;if(c.x>1.3)c.x=-.4;if(c.x<-.4)c.x=1.3;
    const y=hz*(.08+c.y*.75),sc=c.s*(.55+(y/hz)*.6)*W/700,wd=360*sc,ht=150*sc*(.6+.4*(1-y/hz));
    const key=tint.join(',')+'|'+Math.round(w.cc/10);if(c.key!==key){c.key=key;const tc=document.createElement('canvas');tc.width=360;tc.height=150;const tg=tc.getContext('2d');tg.drawImage(c.img,0,0);
      tg.globalCompositeOperation='source-atop';tg.globalAlpha=sun.alt>8?clamp(w.cc/130,0,.6):.78;tg.fillStyle=sun.alt>8?'rgb(150,158,170)':`rgb(${tint})`;tg.fillRect(0,0,360,150);
      // base più scura (volume)
      tg.globalAlpha=.35;const bg=tg.createLinearGradient(0,40,0,150);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(40,45,60,1)');tg.fillStyle=bg;tg.fillRect(0,0,360,150);c.tc=tc;}
    cx.save();cx.globalAlpha=clamp(.45+w.cc/150,0,1)*(night>.8?.55:1);cx.drawImage(c.tc,c.x*W-wd/2,y-ht/2,wd,ht);cx.restore();}
  // copertura totale: cielo grigio uniforme
  if(w.cc>85){cx.fillStyle=`rgba(${night>.5?'20,24,32':'150,158,168'},${(w.cc-85)/15*.55})`;cx.fillRect(0,0,W,hz);}
}
function drawSea(w,sun,moon,sx,mx,night,dayL,t){
  const hz=HZ(),sh=SHORE(),[top,hor]=skyCols(sun.alt,w.cc);
  const deep=mix(mix('#0b3d5c','#06121e',night),hor,.25),near=mix(mix('#2f8f9a','#0b1f2a',night),'#7a8c8a',clamp(w.wave/3,0,.4));
  let g=cx.createLinearGradient(0,hz,0,sh);g.addColorStop(0,mix(hor,deep,.55));g.addColorStop(.35,deep);g.addColorStop(1,near);cx.fillStyle=g;cx.fillRect(0,hz,W,sh-hz+2);
  // riflesso del sole o della luna (scia scintillante)
  const refl=(x,col,a)=>{if(x<-100||x>W+100||a<=0)return;for(let i=0;i<70;i++){const yy=hz+Math.pow(i/70,1.6)*(sh-hz),wv=(Math.sin(t*2+i*1.7)+Math.sin(t*3.3+i*.7))*.5,ww=(3+i*.9)*(1+Math.abs(wv));
    cx.fillStyle=col.replace('A',(a*(1-i/80)*(.4+.6*Math.abs(Math.sin(t*4+i*2.3)))).toFixed(3));cx.fillRect(x-ww/2+wv*i*.25,yy,ww,1.4+i*.03);}};
  if(sun.alt>-2)refl(sx,`rgba(255,${sun.alt<10?190:240},${sun.alt<10?120:210},A)`,.85*(1-w.cc/120));
  if(moon.alt>0&&night>.3)refl(mx,'rgba(230,235,255,A)',.6*moon.illum*(1-w.cc/110));
  // superficie: creste scure e luccichii in prospettiva, mossi dal vento e dall'onda
  const per=Math.max(3,w.wper||5),wh=w.wave||.3,wsF=clamp((w.ws||5)/30,.1,1),bright=night>.6?.25:1;
  for(let i=0;i<34;i++){const ph=((i/34)+t/per/34*4)%1,d=Math.pow(1-ph,2.4)*600,y=dToY(d),k=1-d/600,amp=(1+wh*4)*k;
    const sw=cx.createLinearGradient(0,y-amp*2-2,0,y+amp+2);sw.addColorStop(0,`rgba(0,10,20,${.14*k})`);sw.addColorStop(1,'rgba(0,10,20,0)');cx.fillStyle=sw;
    cx.beginPath();cx.moveTo(0,y+amp+2);for(let x=0;x<=W;x+=18)cx.lineTo(x,y+Math.sin(x*.01+i*1.7+t*.5)*amp*.8);cx.lineTo(W,y+amp+2);cx.fill();}
  if(!st.glints)st.glints=Array.from({length:420},()=>({x:Math.random(),d:Math.pow(Math.random(),1.7),p:Math.random()*6.28,s:.6+Math.random()}));
  const skyRGB=sun.alt>2?'255,255,255':sun.alt>-6?'255,200,160':'170,190,230';
  for(const gl of st.glints){const d=gl.d*500,y=dToY(d),k=1-gl.d,fl=Math.sin(t*(1.6+gl.s)*wsF*2+gl.p);if(fl<.55)continue;
    cx.fillStyle=`rgba(${skyRGB},${(fl-.55)*1.4*bright*(.25+.5*k)*(1-w.cc/160)})`;const ww=(1.5+k*9)*gl.s;cx.fillRect(((gl.x+t*.002*wsF)%1)*W-ww/2,y,ww,.8+k*1.2);}
  // frangenti: più file e più schiuma con mare grosso
  const nb=wh<.2?1:wh<.6?2:wh<1.2?3:4;
  for(let b=0;b<nb;b++){const cyc=((t/per+b/nb)%1),d=lerp(14+b*12+wh*22,0,cyc),y=dToY(d),foam=clamp(wh*1.3,.18,1)*(1-cyc*.55),al=(night>.6?.35:1);
    const hgt=(2+wh*9)*(1-cyc*.7)*(1-d/120);cx.fillStyle=`rgba(10,50,60,${.25*foam})`;cx.beginPath();cx.moveTo(0,y);for(let x=0;x<=W;x+=12)cx.lineTo(x,y-hgt+Math.sin(x*.015+b*2+t)*2);cx.lineTo(W,y+4);cx.lineTo(0,y+4);cx.fill();
    for(let L=0;L<3;L++){cx.fillStyle=`rgba(${245-L*10},${250-L*6},252,${(.5-L*.13)*foam*al})`;cx.beginPath();cx.moveTo(0,y+L*3);
      for(let x=0;x<=W;x+=7){const n=Math.sin(x*.05+b*3+L+t*1.6)*1.6+Math.sin(x*.13+L*2+t*2.3)*1.2;cx.lineTo(x,y-hgt*(1-L*.3)+n+L*2.5);}
      for(let x=W;x>=0;x-=7){const n=Math.sin(x*.07+b+L*1.7-t*1.1)*2;cx.lineTo(x,y+L*3+4+n+(1-cyc)*wh*6);}cx.fill();}}
}
function sandTex(){const c=document.createElement('canvas');c.width=Math.max(1,W);c.height=Math.max(1,Math.round(H*.4));const g=c.getContext('2d');
  for(let i=0;i<W*H*.02;i++){g.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'60,40,20'},${Math.random()*.08})`;g.fillRect(Math.random()*c.width,Math.random()*c.height,1.5,1.5);}
  for(let i=0;i<40;i++){g.fillStyle='rgba(80,60,40,.12)';g.beginPath();g.ellipse(Math.random()*c.width,Math.random()*c.height,4,2,0,0,7);g.fill();}// impronte
  return c;}
function drawBeach(w,night,dayL,t){const sh=SHORE(),wh=w.wave||.3,per=Math.max(3,w.wper||5);
  // sabbia bagnata e asciutta
  let g=cx.createLinearGradient(0,sh,0,H);const dry=mix('#e3cfa4','#20232a',night*.85),wet=mix('#9f8b67','#15171c',night*.85);
  g.addColorStop(0,wet);g.addColorStop(.25,mix(wet,dry,.6));g.addColorStop(1,mix(dry,'#d8c08f',.2*(1-night)));cx.fillStyle=g;cx.fillRect(0,sh,W,H-sh);
  // battigia: l'onda risale e si ritira
  const sw=(Math.sin(t*2*Math.PI/per)*.5+.5),ry=sh+(H*.05)*(.3+wh*.5)*sw;
  const wg=cx.createLinearGradient(0,sh,0,ry+6);wg.addColorStop(0,`rgba(200,230,235,${.5*(night>.6?.4:1)})`);wg.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=wg;
  cx.beginPath();cx.moveTo(0,sh-1);for(let x=0;x<=W;x+=10)cx.lineTo(x,ry+Math.sin(x*.03+t)*3);cx.lineTo(W,sh-1);cx.fill();
  cx.strokeStyle=`rgba(255,255,255,${.6*(night>.6?.35:1)})`;cx.lineWidth=1.5;cx.beginPath();for(let x=0;x<=W;x+=10){const y=ry+Math.sin(x*.03+t)*3;x?cx.lineTo(x,y):cx.moveTo(x,y);}cx.stroke();
  if(!SAND)SAND=sandTex();cx.globalAlpha=1-night*.7;cx.drawImage(SAND,0,sh+H*.04,W,H-sh-H*.04);cx.globalAlpha=1;
  // dune basse con ammofila e macchia mediterranea ai lati
  for(const side of [0,1]){const x0=side?W:0,dir=side?-1:1,top=sh-H*.035;const dg=cx.createLinearGradient(0,top,0,sh+H*.06);dg.addColorStop(0,mix('#dcc898','#1a1c20',night*.85));dg.addColorStop(1,mix('#c4ad7c','#121316',night*.85));cx.fillStyle=dg;
    cx.beginPath();cx.moveTo(x0,top-H*.01);cx.bezierCurveTo(x0+dir*W*.08,top-H*.02,x0+dir*W*.14,top+H*.01,x0+dir*W*.24,sh+H*.035);cx.lineTo(x0,sh+H*.06);cx.fill();
    for(let i=0;i<12;i++){const u=i/12,bx=x0+dir*W*(.005+u*.17),by=top+u*H*.03+Math.sin(i*1.7)*H*.004,br=W*(.02+((i*7)%4)*.006)*(1-u*.4);
      cx.fillStyle=mix(i%3?'#3d5a2c':'#2f4a24','#0b0f0c',night*.85);cx.beginPath();cx.ellipse(bx,by,br,br*.5,0,Math.PI,0);cx.fill();}
    cx.strokeStyle=mix('#8f9a5a','#1a1d12',night*.85);cx.lineWidth=1;for(let i=0;i<26;i++){const gx=x0+dir*W*(.02+i*.008),gy=top+i*H*.0012;for(let j=-1;j<=1;j++){cx.beginPath();cx.moveTo(gx,gy+H*.012);cx.quadraticCurveTo(gx+j*3+Math.sin(t+i)*w.ws*.03,gy,gx+j*6+Math.sin(t*1.3+i)*w.ws*.06,gy-H*.012);cx.stroke();}}}
  // sedia, zaino, secchio
  const fg=mix('#3a3f48','#0c0d10',night*.6);cx.fillStyle=fg;
  const oy=BASEY();cx.fillStyle=mix('#2a5d8a','#0e1a26',night*.7);cx.fillRect(W*.22,oy+H*.01,W*.05,H*.045);cx.fillStyle=mix('#1c4568','#08121c',night*.7);cx.fillRect(W*.22,oy+H*.01,W*.05,H*.008);
  cx.fillStyle=mix('#e9e9e9','#222',night*.8);cx.fillRect(W*.29,oy+H*.015,W*.036,H*.038);cx.beginPath();cx.ellipse(W*.308,oy+H*.015,W*.018,H*.006,0,0,7);cx.fill();
  cx.fillStyle=mix('#5a6a40','#101208',night*.8);cx.save();cx.translate(W*.06,oy+H*.06);cx.rotate(-.25);cx.fillRect(0,0,W*.3,H*.018);cx.restore();
  cx.strokeStyle=`rgba(120,95,60,${.18*(1-night*.7)})`;cx.lineWidth=1;for(let i=0;i<14;i++){const yy=SHORE()+H*.05+i*H*.032;cx.beginPath();for(let x=0;x<=W;x+=14){const y=yy+Math.sin(x*.05+i*1.9)*2.2;x?cx.lineTo(x,y):cx.moveTo(x,y);}cx.stroke();}
}
function drawRods(w,night,t){
  for(const r of st.rods){const bx=W*r.x,by=BASEY();
    // picchetto con il porta-canna
    cx.strokeStyle=mix('#aab3bd','#3a3e45',night*.7);cx.lineWidth=3.5;cx.beginPath();cx.moveTo(bx-6,by+H*.06);cx.lineTo(bx-3,by-H*.1);cx.stroke();
    cx.lineWidth=2.5;cx.beginPath();cx.arc(bx-3,by-H*.1,5,0,Math.PI);cx.stroke();
    if(!r.bait&&r.state==='idle'&&!r.dist)continue;
    const bend=clamp(r.bend,0,1.1),tx=bx+(W*.5-bx)*.42+(r.x-.6)*W*.12+bend*W*.03,ty=HZ()-H*.075+bend*H*.1;
    const mxp=lerp(bx,tx,.5)+bend*W*.015,myp=lerp(by,ty,.5)-H*.015+bend*H*.04;
    // fusto rastremato (calcio scuro, cimino chiaro) con anelli
    const seg=24,pts=[];for(let i=0;i<=seg;i++){const u=i/seg,x=(1-u)*(1-u)*bx+2*(1-u)*u*mxp+u*u*tx,y=(1-u)*(1-u)*(by+H*.05)+2*(1-u)*u*myp+u*u*ty;pts.push([x,y,u]);}
    for(let i=0;i<seg;i++){const [x1,y1,u]=pts[i],[x2,y2]=pts[i+1];cx.strokeStyle=u<.35?mix('#1b2530','#050608',night*.4):u<.8?mix('#2c3e52','#06080b',night*.4):mix('#e8eef2','#7a8088',night*.5);
      cx.lineWidth=lerp(6,1.2,u);cx.lineCap='round';cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();}
    for(const u of [.42,.56,.68,.78,.87,.94]){const p=pts[Math.round(u*seg)],q=pts[Math.round(u*seg)+1]||p,a=Math.atan2(q[1]-p[1],q[0]-p[0])+Math.PI/2,l=lerp(6,2,u);cx.strokeStyle=mix('#d6dde3','#2a2e34',night*.5);cx.lineWidth=1.3;cx.beginPath();cx.moveTo(p[0],p[1]);cx.lineTo(p[0]+Math.cos(a)*l,p[1]+Math.sin(a)*l);cx.stroke();}
    // mulinello
    const rp=pts[Math.round(.2*seg)];cx.fillStyle=mix('#4a5563','#0c0f13',night*.5);cx.beginPath();cx.ellipse(rp[0]+10,rp[1]+4,10,7,.3,0,7);cx.fill();cx.fillStyle=mix('#c9a24a','#3a3020',night*.5);cx.beginPath();cx.ellipse(rp[0]+10,rp[1]+4,5,3.5,.3,0,7);cx.fill();
    // lenza fino al piombo in acqua
    if(r.dist>0&&r.state!=='flying'){const ex=W*(r.x+(.5-r.x)*.25),ey=dToY(r.dist);const tens=st.fight?.r===r?st.fight.ten:.25+r.bend*.4;
      cx.strokeStyle=`rgba(${night>.5?'190,215,255':'255,255,255'},${.25+tens*.35})`;cx.lineWidth=.7;cx.beginPath();cx.moveTo(tx,ty);cx.quadraticCurveTo((tx+ex)/2,ey-(ty<ey?(ey-ty)*.15*tens:0)+(1-tens)*H*.02,ex,ey);cx.stroke();
      cx.strokeStyle=`rgba(255,255,255,${.25*(night>.6?.4:1)})`;cx.beginPath();cx.ellipse(ex,ey,4+Math.sin(t*3+r.i)*1.5,1.2,0,0,7);cx.stroke();
      if(st.fight?.r===r){const fy=dToY(Math.max(0,st.fight.dist));if(st.fight.run>0||Math.random()<.04){cx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<8;i++){cx.beginPath();cx.arc(ex+rnd(-9,9),fy+rnd(-4,2),rnd(1,2.8),0,7);cx.fill();}}}}
    // luce chimica sulla cima di notte, campanello
    if(night>.2){const gl=cx.createRadialGradient(tx,ty,0,tx,ty,16);const a=night*(r.state==='bite'?(.7+.3*Math.sin(t*20)):.85);gl.addColorStop(0,`rgba(150,255,130,${a})`);gl.addColorStop(1,'rgba(150,255,130,0)');cx.fillStyle=gl;cx.fillRect(tx-16,ty-16,32,32);cx.fillStyle=`rgba(200,255,190,${a})`;cx.fillRect(tx-1,ty,2,7);}
    cx.fillStyle='#d9b24a';cx.beginPath();cx.arc(tx+1,ty+10,3.2,0,7);cx.fill();
    if(r.state==='bite'){cx.strokeStyle=`rgba(255,210,80,${.5+.5*Math.sin(t*14)})`;cx.lineWidth=2;cx.beginPath();cx.arc(tx,ty,18+4*Math.sin(t*14),0,7);cx.stroke();}
    cx.fillStyle='rgba(255,255,255,.85)';cx.font='700 13px Outfit,sans-serif';cx.textAlign='center';cx.fillText(r.i+1,bx-4,by+H*.085);
  }
}
function drawAngler(night,t){// pescatore seduto, visto di spalle, con frontale di notte
  const x=W*.13,y=BASEY()+H*.045,s=H*.17,c=mix('#283240','#07090c',night*.6);
  cx.fillStyle=mix('#5a4a3a','#121010',night*.7);cx.fillRect(x-s*.35,y-s*.05,s*.7,s*.06);// sedia
  cx.strokeStyle=cx.fillStyle;cx.lineWidth=3;cx.beginPath();cx.moveTo(x-s*.3,y);cx.lineTo(x-s*.38,y+s*.25);cx.moveTo(x+s*.3,y);cx.lineTo(x+s*.38,y+s*.25);cx.stroke();
  const jg=cx.createLinearGradient(x-s*.3,0,x+s*.3,0);jg.addColorStop(0,mix('#1f3b2e','#05080a',night*.6));jg.addColorStop(.6,mix('#2f5a44','#07090c',night*.6));jg.addColorStop(1,mix('#1a3226','#05080a',night*.6));
  cx.fillStyle=jg;cx.beginPath();cx.moveTo(x-s*.3,y);cx.bezierCurveTo(x-s*.36,y-s*.35,x-s*.3,y-s*.6,x-s*.12,y-s*.64);cx.lineTo(x+s*.12,y-s*.64);cx.bezierCurveTo(x+s*.3,y-s*.6,x+s*.36,y-s*.35,x+s*.3,y);cx.fill();// giacca
  cx.strokeStyle=mix('#173025','#04060a',night*.6);cx.lineWidth=s*.11;cx.lineCap='round';cx.beginPath();cx.moveTo(x+s*.24,y-s*.5);cx.quadraticCurveTo(x+s*.36,y-s*.28,x+s*.2,y-s*.12);cx.stroke();// braccio
  cx.fillStyle=mix('#d9b08a','#2a1f18',night*.75);cx.beginPath();cx.arc(x,y-s*.74,s*.13,0,7);cx.fill();// collo/testa
  cx.fillStyle=mix('#1f3b2e','#05080a',night*.6);cx.beginPath();cx.arc(x,y-s*.75,s*.155,Math.PI*.85,Math.PI*2.15);cx.fill();// cappuccio
  cx.fillStyle=mix('#c0392b','#200806',night*.6);cx.beginPath();cx.arc(x,y-s*.82,s*.13,Math.PI,0);cx.fill();cx.fillRect(x-s*.13,y-s*.83,s*.26,s*.03);// berretto
  if(night>.3){const bx=x+s*.1,by=y-s*.78;const g=cx.createRadialGradient(bx,by,0,bx+s*.6,by+s*.2,s*1.4);g.addColorStop(0,`rgba(255,250,220,${.35*night})`);g.addColorStop(1,'rgba(255,250,220,0)');cx.fillStyle=g;cx.beginPath();cx.moveTo(bx,by);cx.lineTo(bx+s*1.6,by-s*.2);cx.lineTo(bx+s*1.6,by+s*.8);cx.fill();cx.fillStyle='#fffbe0';cx.beginPath();cx.arc(bx,by,2.2,0,7);cx.fill();}
}
/* ---------- parcheggio sotto i pini, sulla Litoranea ---------- */
function drawParking(d,w,sun,night,dayL,t){
  const [top,hor]=skyCols(sun.alt,w.cc);let g=cx.createLinearGradient(0,0,0,H*.6);g.addColorStop(0,top);g.addColorStop(1,hor);cx.fillStyle=g;cx.fillRect(0,0,W,H);
  drawClouds(w,sun,night,t);
  // pini domestici (ombrello)
  for(let i=0;i<7;i++){const x=W*(i/6)+Math.sin(i*2.1)*W*.04,y=H*(.2+Math.sin(i*1.3)*.035),r=W*(.13+Math.sin(i*4)*.025),sway=Math.sin(t*.8+i)*w.ws*.04;
    cx.strokeStyle=mix('#6a4a35','#100c0a',night*.8);cx.lineWidth=W*.014;cx.lineCap='round';cx.beginPath();cx.moveTo(x,H*.62);cx.bezierCurveTo(x+Math.sin(i)*25,H*.45,x-Math.sin(i*2)*20,y+r*.5,x+Math.sin(i*2)*12+sway,y+r*.15);cx.stroke();
    cx.lineWidth=W*.006;cx.beginPath();cx.moveTo(x+Math.sin(i*2)*12+sway,y+r*.18);cx.lineTo(x-r*.5+sway,y+r*.05);cx.moveTo(x+Math.sin(i*2)*12+sway,y+r*.18);cx.lineTo(x+r*.45+sway,y+r*.02);cx.stroke();
    for(let k=0;k<16;k++){const a=k/16*Math.PI,px=x+sway+Math.cos(a)*r*.85*(k%2?1:.8),py=y-Math.sin(a)*r*.22+r*.05,pr=r*(.22+((k*7)%5)*.03);
      cx.fillStyle=mix(k%3?'#2f4a26':'#3d5e30','#05070a',night*.85);cx.beginPath();cx.ellipse(px,py,pr,pr*.55,0,0,7);cx.fill();}
    cx.fillStyle=mix('#4f7240','#0a0d0b',night*.85);for(let k=0;k<6;k++){cx.beginPath();cx.ellipse(x+sway+(k-2.5)*r*.25,y-r*.12,r*.18,r*.08,0,0,7);cx.fill();}}
  // strada e parcheggio sterrato
  cx.fillStyle=mix('#3d4045','#0e0f11',night*.8);cx.fillRect(0,H*.6,W,H*.08);cx.strokeStyle='rgba(255,255,255,.6)';cx.setLineDash([24,18]);cx.lineWidth=2;cx.beginPath();cx.moveTo(0,H*.64);cx.lineTo(W,H*.64);cx.stroke();cx.setLineDash([]);
  cx.fillStyle=mix('#b9a27a','#17150f',night*.8);cx.fillRect(0,H*.68,W,H*.32);
  for(let i=0;i<6;i++){const x=W*(.12+i*.16);cx.strokeStyle='rgba(255,255,255,.55)';cx.lineWidth=3;cx.beginPath();cx.moveTo(x,H*.7);cx.lineTo(x-W*.03,H*.9);cx.stroke();}
  // cartello del cancello
  cx.fillStyle=mix('#2c6e3e','#0b1a10',night*.6);cx.fillRect(W*.03,H*.5,W*.16,H*.06);cx.fillStyle='#fff';cx.font=`700 ${Math.round(H*.022)}px Outfit,sans-serif`;cx.textAlign='left';cx.fillText('Cancello 8',W*.04,H*.538);
  cx.fillStyle=mix('#6b5a44','#100d09',night*.6);cx.fillRect(W*.1,H*.56,4,H*.12);
  // posto libero evidenziato
  cx.fillStyle='rgba(47,224,207,.18)';cx.beginPath();cx.moveTo(W*.5,H*.7);cx.lineTo(W*.66,H*.7);cx.lineTo(W*.63,H*.9);cx.lineTo(W*.47,H*.9);cx.fill();
  // auto parcheggiate
  for(const x of [.2,.36,.84])drawCar(W*x,H*.83,W*.13,['#8a1c1c','#c9c9c9','#1c3d8a'][Math.round(x*10)%3],night,false);
  // la tua auto
  const cxp=W*st.car.x,open=st.phase==='trunk';drawCar(cxp,st.car.stop?H*.82:H*.655,W*.16,'#1f8a7f',night,true,open);
  if(night>.3){const gl=cx.createRadialGradient(cxp+W*.08,H*.66,0,cxp+W*.2,H*.66,W*.25);gl.addColorStop(0,`rgba(255,250,210,${.45*night})`);gl.addColorStop(1,'rgba(255,250,210,0)');cx.fillStyle=gl;cx.fillRect(cxp,H*.55,W*.45,H*.2);}
  const vg=cx.createRadialGradient(W/2,H*.55,Math.min(W,H)*.3,W/2,H*.55,Math.max(W,H)*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${.25+night*.4})`);cx.fillStyle=vg;cx.fillRect(0,0,W,H);
}
function drawCar(x,y,len,col,night,mine,open){const h=len*.32;cx.save();cx.translate(x,y);
  cx.fillStyle='rgba(0,0,0,.25)';cx.beginPath();cx.ellipse(0,h*.55,len*.55,h*.15,0,0,7);cx.fill();
  cx.fillStyle=mix(col,'#050505',night*.6);cx.beginPath();cx.moveTo(-len*.5,h*.35);cx.lineTo(-len*.5,0);cx.quadraticCurveTo(-len*.42,-h*.12,-len*.25,-h*.15);cx.lineTo(-len*.12,-h*.62);cx.lineTo(len*.22,-h*.62);cx.lineTo(len*.36,-h*.15);cx.quadraticCurveTo(len*.5,-h*.1,len*.5,h*.1);cx.lineTo(len*.5,h*.35);cx.fill();
  cx.fillStyle=mix('#9fc4d8','#101820',night*.7);cx.beginPath();cx.moveTo(-len*.09,-h*.55);cx.lineTo(len*.05,-h*.55);cx.lineTo(len*.05,-h*.2);cx.lineTo(-len*.21,-h*.2);cx.fill();cx.beginPath();cx.moveTo(len*.09,-h*.55);cx.lineTo(len*.2,-h*.55);cx.lineTo(len*.31,-h*.2);cx.lineTo(len*.09,-h*.2);cx.fill();
  cx.fillStyle='#111';for(const wx of [-.3,.3]){cx.beginPath();cx.arc(len*wx,h*.35,h*.24,0,7);cx.fill();cx.fillStyle='#777';cx.beginPath();cx.arc(len*wx,h*.35,h*.1,0,7);cx.fill();cx.fillStyle='#111';}
  if(mine){cx.fillStyle=night>.3?'#fff6c8':'#ddd';cx.fillRect(len*.45,-h*.05,len*.05,h*.1);cx.fillStyle='#c0392b';cx.fillRect(-len*.5,-h*.05,len*.03,h*.12);}
  if(open){cx.fillStyle=mix(col,'#050505',night*.5);cx.save();cx.translate(-len*.42,-h*.15);cx.rotate(-1.1);cx.fillRect(0,-h*.05,len*.3,h*.1);cx.restore();
    // attrezzatura che resta nel bagagliaio
    const left=TRUNK.filter(k=>!st.items.includes(k.k));cx.font=`${Math.round(h*.35)}px serif`;cx.textAlign='center';left.forEach((k,i)=>cx.fillText(k.e,-len*.44+i*len*.06,-h*.02));}
  cx.restore();}
/* ---------- passerella sulle dune ---------- */
function drawWalk(d,w,sun,night,dayL,t){
  const [top,hor]=skyCols(sun.alt,w.cc);let g=cx.createLinearGradient(0,0,0,H*.5);g.addColorStop(0,top);g.addColorStop(1,hor);cx.fillStyle=g;cx.fillRect(0,0,W,H);drawClouds(w,sun,night,t);
  const k=st.walk;// il mare compare in fondo man mano che avanzi
  const sea=H*(.5-k*.04);cx.fillStyle=mix(mix('#1f6f8a','#06121e',night),hor,.2);cx.fillRect(0,sea,W,H*.08);
  for(let i=0;i<5;i++){cx.strokeStyle='rgba(255,255,255,.25)';cx.beginPath();cx.moveTo(0,sea+i*H*.015+Math.sin(t+i)*2);cx.lineTo(W,sea+i*H*.015+Math.cos(t+i)*2);cx.stroke();}
  // dune
  for(const [yy,c,a] of [[.55,'#d8c391',.0],[.62,'#cdb684',.5],[.72,'#c2aa77',1]]){cx.fillStyle=mix(c,'#141519',night*.85);cx.beginPath();cx.moveTo(0,H);for(let x=0;x<=W;x+=20)cx.lineTo(x,H*yy+Math.sin(x*.008+a*3+k*4)*H*.03);cx.lineTo(W,H);cx.fill();
    for(let i=0;i<12;i++){const bx=((i*97+k*W*(.4+a))%(W*1.2))-W*.1,by=H*yy-H*.01;cx.fillStyle=mix(i%2?'#3d5a2c':'#4b6b34','#0b0f0c',night*.85);cx.beginPath();cx.ellipse(bx,by,W*.03,H*.018,0,0,7);cx.fill();}}
  // passerella in legno in prospettiva
  cx.fillStyle=mix('#8a6a48','#191410',night*.8);cx.beginPath();cx.moveTo(W*.38,H);cx.lineTo(W*.47,H*.58);cx.lineTo(W*.53,H*.58);cx.lineTo(W*.62,H);cx.fill();
  for(let i=0;i<14;i++){const p=((i/14)+k*3)%1,y=lerp(H*.58,H,Math.pow(p,1.8));cx.strokeStyle=mix('#5d4630','#0f0c09',night*.8);cx.lineWidth=1+p*3;cx.beginPath();cx.moveTo(lerp(W*.47,W*.38,Math.pow(p,1.8)),y);cx.lineTo(lerp(W*.53,W*.62,Math.pow(p,1.8)),y);cx.stroke();}
  // il pescatore carico di attrezzatura, di spalle
  const bob=Math.abs(Math.sin(k*60))*H*.008,x=W*.5,y=H*.7-bob;cx.fillStyle=mix('#2a3646','#08090c',night*.6);
  cx.beginPath();cx.ellipse(x,y-H*.08,W*.045,H*.07,0,0,7);cx.fill();cx.fillStyle=mix('#3c2f26','#0a0807',night*.6);cx.beginPath();cx.arc(x,y-H*.17,H*.025,0,7);cx.fill();
  cx.fillStyle=mix('#a33a2a','#1a0806',night*.6);cx.fillRect(x-W*.035,y-H*.13,W*.07,H*.07);// zaino
  cx.strokeStyle=mix('#1d2a3a','#05070a',night*.4);cx.lineWidth=5;cx.beginPath();cx.moveTo(x+W*.04,y-H*.05);cx.lineTo(x+W*.09,y-H*.25);cx.stroke();// borsone canne
  cx.fillStyle='rgba(255,255,255,.85)';cx.font=`600 ${Math.round(H*.02)}px Outfit,sans-serif`;cx.textAlign='center';cx.fillText(`${Math.round(k*180)} / 180 m`,W/2,H*.95);
}
/* ---------- il pesce catturato, disegnato ---------- */
function drawFishCard(){const c=st.catchShow,el=document.getElementById('gfc');if(!el||!c?.fish)return;const g=el.getContext('2d'),Wd=600,Hd=260;g.clearRect(0,0,Wd,Hd);
  const sp=c.sp,co=sp.col;if(sp.crab)return drawCrab(g,Wd,Hd,co);
  const L=Wd*.8,Hh=L*sp.shape.h,x0=(Wd-L)/2+6,y0=Hd/2+4,fk=sp.shape.fork,ped=Hh*.13;
  // sagoma: muso, profilo dorsale alto, peduncolo sottile
  const body=new Path2D();body.moveTo(x0,y0+Hh*.04);
  body.bezierCurveTo(x0+L*.02,y0-Hh*.32,x0+L*.13,y0-Hh*.56,x0+L*.34,y0-Hh*.56);
  body.bezierCurveTo(x0+L*.55,y0-Hh*.55,x0+L*.7,y0-Hh*.28,x0+L*.8,y0-ped);
  body.lineTo(x0+L*.8,y0+ped);
  body.bezierCurveTo(x0+L*.7,y0+Hh*.26,x0+L*.5,y0+Hh*.48,x0+L*.3,y0+Hh*.47);
  body.bezierCurveTo(x0+L*.15,y0+Hh*.46,x0+L*.04,y0+Hh*.32,x0,y0+Hh*.04);
  const fin=(f,c2)=>{g.fillStyle=c2;g.globalAlpha=.88;g.fill(f);g.globalAlpha=1;};
  // coda biforcuta
  const tail=new Path2D();tail.moveTo(x0+L*.79,y0-ped*.9);tail.quadraticCurveTo(x0+L*.9,y0-Hh*.3,x0+L*.99,y0-Hh*.58);tail.quadraticCurveTo(x0+L*(.9+fk*.03),y0-Hh*.1,x0+L*(.97-fk*.1),y0);
  tail.quadraticCurveTo(x0+L*(.9+fk*.03),y0+Hh*.1,x0+L*.99,y0+Hh*.58);tail.quadraticCurveTo(x0+L*.9,y0+Hh*.3,x0+L*.79,y0+ped*.9);tail.closePath();
  const tg=g.createLinearGradient(x0+L*.78,0,x0+L,0);tg.addColorStop(0,co.b);tg.addColorStop(1,mix(co.b,'#000000',.35));g.fillStyle=tg;g.fill(tail);
  // pinne dorsale (con raggi), anale, ventrale
  const dor=new Path2D();dor.moveTo(x0+L*.26,y0-Hh*.55);dor.quadraticCurveTo(x0+L*.33,y0-Hh*.82,x0+L*.44,y0-Hh*.72);dor.quadraticCurveTo(x0+L*.58,y0-Hh*.62,x0+L*.68,y0-Hh*.34);dor.lineTo(x0+L*.6,y0-Hh*.45);dor.closePath();fin(dor,mix(co.b,'#000000',.15));
  g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1;for(let i=0;i<10;i++){const u=i/9;g.beginPath();g.moveTo(x0+L*(.27+u*.38),y0-Hh*(.55-u*.12));g.lineTo(x0+L*(.3+u*.38),y0-Hh*(.78-u*.38));g.stroke();}
  const an=new Path2D();an.moveTo(x0+L*.5,y0+Hh*.42);an.quadraticCurveTo(x0+L*.58,y0+Hh*.62,x0+L*.68,y0+Hh*.26);an.closePath();fin(an,mix(co.b,'#000000',.1));
  const ven=new Path2D();ven.moveTo(x0+L*.26,y0+Hh*.44);ven.quadraticCurveTo(x0+L*.3,y0+Hh*.66,x0+L*.37,y0+Hh*.46);ven.closePath();fin(ven,mix(co.t,'#000000',.1));
  // corpo con sfumatura dorso → ventre
  const gr=g.createLinearGradient(0,y0-Hh*.56,0,y0+Hh*.48);gr.addColorStop(0,co.b);gr.addColorStop(.42,co.t);gr.addColorStop(.68,co.belly||co.t);gr.addColorStop(1,mix(co.belly||co.t,'#000000',.08));
  g.fillStyle=gr;g.fill(body);g.save();g.clip(body);
  if(co.bars)for(let i=0;i<8;i++){g.fillStyle='rgba(40,46,52,.2)';g.fillRect(x0+L*(.24+i*.065),y0-Hh,L*.022,Hh*2);}
  if(co.vbars)for(let i=0;i<13;i++){g.fillStyle='rgba(50,55,57,.32)';g.fillRect(x0+L*(.17+i*.047),y0-Hh,L*.011,Hh*2);}
  if(co.lines)for(let i=0;i<9;i++){g.strokeStyle='rgba(201,162,74,.45)';g.lineWidth=2;g.beginPath();g.moveTo(x0+L*.18,y0-Hh*.4+i*Hh*.1);g.lineTo(x0+L*.8,y0-Hh*.68+i*Hh*.12);g.stroke();}
  if(co.dots){const n=sp.n==='Dentice'?36:5;for(let i=0;i<n;i++){g.fillStyle=co.dots;g.beginPath();g.arc(x0+L*(.26+((i*.137)%.5)),sp.n==='Dentice'?y0-Hh*(.45-((i*.29)%.45)):y0-Hh*.12,sp.n==='Dentice'?2.2:7,0,7);g.fill();}}
  if(co.stripe){g.fillStyle=co.stripe;g.globalAlpha=.85;g.fillRect(x0,y0-Hh*.14,L*.8,Hh*.07);g.globalAlpha=1;}
  // squame: piccoli archi chiari e scuri
  for(let yy=-Hh*.45;yy<Hh*.42;yy+=7){for(let xx=L*.2;xx<L*.78;xx+=8){const ox=(Math.round(yy/7)%2)*4;g.strokeStyle='rgba(255,255,255,.13)';g.lineWidth=1;g.beginPath();g.arc(x0+xx+ox,y0+yy,4,-.4*Math.PI,.4*Math.PI);g.stroke();g.strokeStyle='rgba(0,0,0,.06)';g.beginPath();g.arc(x0+xx+ox+1,y0+yy+1,4,-.4*Math.PI,.4*Math.PI);g.stroke();}}
  // linea laterale
  g.strokeStyle=co.lat||'rgba(40,45,50,.35)';g.lineWidth=co.lat?3:1.6;g.beginPath();g.moveTo(x0+L*.19,y0-Hh*.3);g.bezierCurveTo(x0+L*.4,y0-Hh*.42,x0+L*.6,y0-Hh*.2,x0+L*.8,y0-Hh*.02);g.stroke();
  // riflesso metallico
  const sh=g.createLinearGradient(0,y0-Hh*.45,0,y0+Hh*.1);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.6,'rgba(255,255,255,.22)');sh.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sh;g.fillRect(x0,y0-Hh*.45,L,Hh*.55);
  g.restore();
  // opercolo e macchia scura sul suo bordo
  g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=2;g.beginPath();g.moveTo(x0+L*.17,y0-Hh*.36);g.quadraticCurveTo(x0+L*.215,y0-Hh*.02,x0+L*.16,y0+Hh*.32);g.stroke();
  if(co.spot&&sp.n!=='Dentice'){g.fillStyle=co.spot;g.globalAlpha=.85;g.beginPath();g.ellipse(x0+L*.2,y0-Hh*.27,L*.012,Hh*.07,.2,0,7);g.fill();g.globalAlpha=1;
}
  if(sp.n==='Sarago maggiore'){g.fillStyle=co.spot;g.beginPath();g.ellipse(x0+L*.765,y0,L*.016,Hh*.12,0,0,7);g.fill();}
  // fascia dorata tra gli occhi (orata)
  if(co.band){g.strokeStyle=co.band;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(x0+L*.055,y0-Hh*.36);g.quadraticCurveTo(x0+L*.09,y0-Hh*.3,x0+L*.12,y0-Hh*.4);g.stroke();}
  // pinna pettorale
  const pec=new Path2D();pec.moveTo(x0+L*.2,y0+Hh*.02);pec.quadraticCurveTo(x0+L*.3,y0-Hh*.02,x0+L*.34,y0+Hh*.14);pec.quadraticCurveTo(x0+L*.27,y0+Hh*.16,x0+L*.2,y0+Hh*.08);fin(pec,mix(co.t,'#7a6a50',.25));
  // occhio con iride e riflesso
  const ex=x0+L*.085,ey=y0-Hh*.2,er=Hh*.085;g.fillStyle=mix(co.band||'#d8c070','#ffffff',.3);g.beginPath();g.arc(ex,ey,er,0,7);g.fill();g.fillStyle='#0c0d0e';g.beginPath();g.arc(ex,ey,er*.62,0,7);g.fill();g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(ex-er*.25,ey-er*.25,er*.2,0,7);g.fill();
  // bocca
  g.strokeStyle='rgba(30,30,30,.7)';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(x0+1,y0+Hh*.05);g.quadraticCurveTo(x0+L*.03,y0+Hh*.08,x0+L*.05,y0+Hh*.04);g.stroke();
  g.fillStyle='rgba(255,255,255,.75)';g.font='600 16px Outfit,sans-serif';g.textAlign='right';g.fillText(c.l+' cm',Wd-12,Hd-10);
}
function drawCrab(g,Wd,Hd,co){const x=Wd/2,y=Hd/2+10;g.strokeStyle=co.b;g.lineWidth=7;g.lineCap='round';
  for(const s of [-1,1]){for(let i=0;i<4;i++){g.beginPath();g.moveTo(x+s*60,y+i*10-10);g.quadraticCurveTo(x+s*(110+i*8),y-20+i*16,x+s*(130+i*12),y+30+i*10);g.stroke();}
    g.beginPath();g.moveTo(x+s*70,y-25);g.quadraticCurveTo(x+s*120,y-70,x+s*170,y-60);g.stroke();g.fillStyle=co.b;g.beginPath();g.ellipse(x+s*185,y-60,28,13,s*.3,0,7);g.fill();g.fillStyle='#e05a3a';g.beginPath();g.ellipse(x+s*205,y-62,10,6,s*.3,0,7);g.fill();}
  const gr=g.createLinearGradient(0,y-50,0,y+40);gr.addColorStop(0,'#5a7f6a');gr.addColorStop(1,co.b);g.fillStyle=gr;g.beginPath();g.moveTo(x-150,y-20);g.quadraticCurveTo(x,y-70,x+150,y-20);g.quadraticCurveTo(x,y+50,x-150,y-20);g.fill();
  g.fillStyle='#111';g.beginPath();g.arc(x-18,y-40,5,0,7);g.arc(x+18,y-40,5,0,7);g.fill();}

/* ---------- stile ---------- */
const css=document.createElement('style');css.textContent=`
body.gaming{overflow:hidden}
#gamebox{position:fixed;inset:0;z-index:5000;background:#02060c;touch-action:none;user-select:none;-webkit-user-select:none}
#gcv{position:absolute;inset:0;display:block}
#ghud{position:absolute;left:8px;right:96px;top:calc(env(safe-area-inset-top) + 8px);display:flex;flex-wrap:wrap;gap:6px;pointer-events:none}
#ghud div{background:rgba(4,14,26,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border-radius:12px;padding:5px 9px;font:600 13.5px Outfit,sans-serif}
#gx,#gau{position:absolute;top:calc(env(safe-area-inset-top) + 8px);width:40px;height:40px;border-radius:12px;border:0;background:rgba(4,14,26,.65);color:#fff;font-size:18px;cursor:pointer}
#gx{right:8px}#gau{right:54px}
#gui{position:absolute;left:0;right:0;bottom:0;padding:10px 10px calc(env(safe-area-inset-bottom) + 10px);pointer-events:none}
.gpanel{pointer-events:auto;max-width:620px;margin:0 auto;background:rgba(4,14,26,.72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:12px 14px;color:#fff;font:500 15px Outfit,sans-serif;max-height:62vh;overflow:auto}
.gpanel.slim{padding:8px 10px}
.gpanel>b{display:block;font-size:17px;margin-bottom:4px}
.gs{font-size:14px;opacity:.9;margin:4px 0}.gs.warn{color:#ffb547}
.gb{display:block;width:100%;margin-top:8px;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:700 16px Outfit,sans-serif;cursor:pointer;touch-action:none}
.gb.big{background:linear-gradient(135deg,#2fe0cf,#3b8cff);color:#03282a;border:0;font-size:17px}
.gb.hot{background:linear-gradient(135deg,#ffb547,#ff4d5e);color:#fff;animation:gpulse .5s infinite alternate}
@keyframes gpulse{to{transform:scale(1.04)}}
.grow{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0}.grow>span{font-size:13.5px;opacity:.85;min-width:58px}
.grow .gb{width:auto;flex:1}
.gc{padding:7px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;font:600 13.5px Outfit,sans-serif;cursor:pointer}
.gc.on{background:#2fe0cf;color:#03282a;border-color:transparent}
.gitems{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}
.gi{padding:10px 4px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;font:600 13px Outfit,sans-serif;cursor:pointer}
.gi span{display:block;font-size:26px}.gi.on{opacity:.35;text-decoration:line-through}
.gbaits{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px}
.gbt{text-align:left;padding:8px 10px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font:500 13px Outfit,sans-serif}
.gbt span{font-size:20px;float:left;margin-right:6px}.gbt b{display:block;font-size:14.5px}.gbt small{opacity:.75;font-size:12px}
.gsteps{display:grid;gap:6px;margin:8px 0}.gst{display:flex;gap:10px;align-items:center;text-align:left;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:rgba(255,255,255,.55);font:600 14.5px Outfit,sans-serif}
.gst span{font-size:20px}.gst.done{color:#fff;opacity:.75}.gst.now{color:#fff;background:rgba(47,224,207,.2);border-color:#2fe0cf;cursor:pointer;animation:gpulse .7s infinite alternate}
.gpow{position:relative;height:16px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden;margin:10px 0 2px}
.gpow i{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,#3b8cff,#ffb547,#ff4d5e)}
.gpow s{position:absolute;left:78%;width:14%;top:0;bottom:0;border:2px solid #5ee08a;border-radius:6px;background:rgba(94,224,138,.2)}
.grods{display:flex;gap:6px}
.gr{flex:1;padding:8px 6px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font:600 13px Outfit,sans-serif;text-align:center}
.gr small{display:block;font-weight:500;font-size:12px;opacity:.85}
.gr.alert{background:linear-gradient(135deg,#ffb547,#ff4d5e);animation:gpulse .4s infinite alternate}.gr.alert small:nth-of-type(1){display:none}.gr b,.gr small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gbar{position:relative;height:20px;border-radius:10px;background:rgba(255,255,255,.12);overflow:hidden;margin:6px 0}
.gbar i{position:absolute;left:0;top:0;bottom:0;width:30%;background:#2fe0cf;transition:width .1s}.gbar.dist i{background:#3b8cff}
.gbar span{position:absolute;left:8px;top:1px;font-size:12.5px;font-weight:700;text-shadow:0 1px 2px #000}
.gfish canvas{width:100%;height:auto;display:block;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}
.glist{max-height:34vh;overflow:auto;margin:8px 0;font-size:14px}.glist div{padding:5px 0;border-bottom:1px solid rgba(255,255,255,.08)}.glist small{opacity:.7}
`;document.head.appendChild(css);
})();
