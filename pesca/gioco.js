/* ===================== LenzApp · Gioco 3D: surfcasting a Castelporziano =====================
   Scena 3D con three.js (cielo fisico, mare con riflessi), pescatore articolato e canne con mulinello.
   Cielo, sole e luna nella posizione vera, nuvole, pioggia, vento, onde e luce seguono le previsioni reali (Open-Meteo). */
(()=>{
'use strict';
// spot del Lazio, da nord a sud: orientamento della costa, sabbia, dune, vegetazione, scogli, stabilimenti, paesaggio e pesci
const SPOTS=[
  {id:'montalto',name:'Montalto Marina',lat:42.322,lon:11.585,face:240,sand:'#c8b08a',dune:.6,veg:.6,pines:.2,huts:1,npcs:2},
  {id:'tarquinia',name:'Tarquinia Lido',lat:42.2262,lon:11.7052,face:245,sand:'#c4ad86',dune:.5,veg:.5,pines:.3,huts:1,npcs:2},
  {id:'civitavecchia',name:'Civitavecchia · La Frasca',lat:42.1215,lon:11.768,face:250,sand:'#968b7c',dune:.15,veg:.8,rocks:1,ship:1,npcs:3,fishK:{'Sarago maggiore':1.7,'Dentice':2.5,'Spigola':1.2,'Orata':.8,'Mormora':.5,'Ombrina':.7}},
  {id:'santamarinella',name:'Santa Marinella',lat:42.033,lon:11.852,face:215,sand:'#9c8f7e',dune:.1,veg:.7,rocks:1,city:1,npcs:3,fishK:{'Sarago maggiore':1.6,'Dentice':1.8,'Orata':.9,'Mormora':.6}},
  {id:'santasevera',name:'Santa Severa',lat:42.021,lon:11.962,face:215,sand:'#a89a82',dune:.2,veg:.6,rocks:.5,huts:1,npcs:3,fishK:{'Sarago maggiore':1.3}},
  {id:'cerveteri',name:'Marina di Cerveteri',lat:41.978,lon:12.052,face:225,sand:'#8f8170',dune:.2,veg:.4,huts:1,npcs:2},
  {id:'ladispoli',name:'Ladispoli',lat:41.947,lon:12.071,face:225,sand:'#7d7266',dune:.1,veg:.3,huts:1,city:1,npcs:3},
  {id:'passoscuro',name:'Passoscuro',lat:41.901,lon:12.155,face:230,sand:'#9a8a72',dune:.3,veg:.4,huts:1,npcs:2},
  {id:'fregene',name:'Fregene',lat:41.8507,lon:12.1982,face:235,sand:'#b6a07c',dune:.3,veg:.4,pines:1,huts:1,npcs:3},
  {id:'focene',name:'Focene',lat:41.8155,lon:12.2107,face:235,sand:'#a69172',dune:.4,veg:.5,huts:1,npcs:2},
  {id:'fiumicino',name:'Fiumicino · Isola Sacra',lat:41.7545,lon:12.2303,face:230,sand:'#9e896c',dune:.2,veg:.3,huts:1,npcs:3,fishK:{'Spigola':1.3,'Serra':1.3,'Granchio blu':1.4}},
  {id:'ostia',name:'Ostia',lat:41.73,lon:12.278,face:220,sand:'#bda780',dune:.12,veg:.2,huts:1,pier:1,city:1,npcs:4},
  {id:'castelfusano',name:'Castel Fusano',lat:41.713,lon:12.316,face:222,sand:'#cdb488',dune:.6,veg:.8,pines:1,huts:1,npcs:3},
  {id:'castelporziano',name:'Castel Porziano',lat:41.6797,lon:12.3786,face:225,sand:'#d6b98a',dune:1,veg:1,pines:1,npcs:4},
  {id:'torvaianica',name:'Torvaianica',lat:41.6205,lon:12.4605,face:222,sand:'#c3a97f',dune:.5,veg:.6,huts:1,npcs:3},
  {id:'torsanlorenzo',name:'Tor San Lorenzo',lat:41.552,lon:12.539,face:218,sand:'#c4a97e',dune:.6,veg:.6,huts:1,npcs:2},
  {id:'lavinio',name:'Lavinio',lat:41.502,lon:12.587,face:212,sand:'#bfa47a',dune:.4,veg:.5,rocks:.3,huts:1,npcs:3},
  {id:'anzio',name:'Anzio',lat:41.452,lon:12.608,face:205,sand:'#b09b78',dune:.3,veg:.5,rocks:.6,city:1,npcs:3,fishK:{'Sarago maggiore':1.4,'Spigola':1.2}},
  {id:'nettuno',name:'Nettuno',lat:41.455,lon:12.67,face:195,sand:'#b8a07a',dune:.3,veg:.4,city:1,npcs:3,fishK:{'Spigola':1.2,'Sarago maggiore':1.2}},
  {id:'latina',name:'Latina · Capo Portiere',lat:41.395,lon:12.841,face:215,sand:'#d0b27d',dune:1.1,veg:.8,huts:1,npcs:2},
  {id:'sabaudia',name:'Sabaudia',lat:41.281,lon:13.005,face:215,sand:'#dcc08a',dune:1.7,veg:.9,npcs:2,fishK:{'Orata':1.2,'Mormora':1.2,'Leccia stella':1.3}},
  {id:'sanfelice',name:'San Felice Circeo',lat:41.229,lon:13.11,face:170,sand:'#d8bf90',dune:.3,veg:.9,pines:.4,rocks:.7,huts:1,npcs:3,fishK:{'Sarago maggiore':1.4,'Orata':1.2,'Dentice':1.3}},
  {id:'terracina',name:'Terracina',lat:41.285,lon:13.22,face:190,sand:'#cdb489',dune:.3,veg:.4,huts:1,city:1,pier:1,npcs:4,fishK:{'Orata':1.2,'Spigola':1.2,'Mormora':1.1}},
  {id:'sperlonga',name:'Sperlonga',lat:41.2555,lon:13.4405,face:190,sand:'#e2cf9f',dune:.4,veg:.6,rocks:.6,huts:1,npcs:3,fishK:{'Sarago maggiore':1.4,'Orata':1.2,'Mormora':1.2}},
  {id:'gaeta',name:'Gaeta · Serapo',lat:41.2138,lon:13.5598,face:215,sand:'#d9c294',dune:.2,veg:.5,rocks:.5,huts:1,city:1,npcs:4,fishK:{'Sarago maggiore':1.5,'Dentice':1.4,'Orata':1.1}},
  {id:'formia',name:'Formia · Vindicio',lat:41.2552,lon:13.6235,face:185,sand:'#a8987c',dune:.1,veg:.4,huts:1,city:1,pier:1,npcs:3,fishK:{'Spigola':1.2,'Orata':1.2}},
  {id:'scauri',name:'Scauri · Minturno',lat:41.2505,lon:13.7165,face:200,sand:'#b9a57f',dune:.3,veg:.5,huts:1,npcs:3,fishK:{'Mormora':1.3,'Spigola':1.2,'Ombrina':1.2}}];
const CIRCEO={lat:41.235,lon:13.06,h:541};
let SPOT={...SPOTS.find(x=>x.id==='castelporziano'),mode:'coast'};
let FACE=SPOT.face;         // direzione in cui guarda la spiaggia (verso il mare)
function setSpot(sp){SPOT={...sp,mode:'coast',id:'g_'+sp.id};FACE=sp.face;LSS('spot',sp.id);}
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
  {k:'granchio',n:'Granchio',e:'🦀',d:'Raccolto sulla battigia: orate, spigole, saraghi',life:60,lim:true},
];
const B=Object.fromEntries(BAITS.map(b=>[b.k,b]));

/* ---------- specie (stagioni, esche, mare, ora, distanza, taglie) ---------- */
// mo: mesi 1-12 con peso; bait: gradimento; wave:[min,ideale,max] m; time: alba/giorno/tramonto/notte; d:[min,max] m dalla riva
// w:[min,tipico,max] kg; pow: forza in combattimento; lw:[a,b] (g, cm); legal: misura minima cm; ab: abbondanza
const SP=[
  {n:'Orata',ab:.8,mo:{1:.3,2:.2,3:.3,4:.8,5:1,6:.9,7:.6,8:.6,9:1,10:1,11:.9,12:.5},bait:{bibi:1,cannolicchio:1,cozza:.8,granchio:.9,gambero:.7,americano:.5,koreano:.5,arenicola:.4},wave:[0,.4,1.1],time:{alba:1,giorno:.8,tramonto:1,notte:.5},d:[35,120],w:[.3,.8,3.2],pow:.85,lw:[.0115,3.05],legal:20,bite:'decisa',col:{b:'#9aa7b0',t:'#c9d2d8',belly:'#eef2f4',band:'#d9b24a',spot:'#1d2328'},shape:{h:.42,fork:.55}},
  {n:'Spigola',ab:.5,mo:{1:1,2:1,3:.8,4:.5,5:.3,6:.2,7:.2,8:.2,9:.4,10:.8,11:1,12:1},bait:{cefalotto:1,seppia:.8,sarda:.7,arenicola:.7,gambero:.7,granchio:.7,americano:.5,koreano:.5},wave:[.3,.9,2.2],time:{alba:1,giorno:.35,tramonto:.9,notte:1},d:[10,70],w:[.4,1.2,7],pow:1,lw:[.0087,3.08],legal:25,bite:'violenta',col:{b:'#5d6b78',t:'#aeb8c0',belly:'#edf0f2',spot:'#2a3036'},shape:{h:.3,fork:.25}},
  {n:'Sarago maggiore',ab:.55,mo:{1:.9,2:.9,3:.8,4:.6,5:.5,6:.4,7:.4,8:.4,9:.6,10:.9,11:1,12:1},bait:{cozza:1,granchio:.8,arenicola:.8,koreano:.7,bibi:.6,cannolicchio:.6,gambero:.6},wave:[.3,.8,1.6],time:{alba:.9,giorno:.5,tramonto:1,notte:.9},d:[25,90],w:[.2,.5,1.8],pow:.9,lw:[.0151,3.03],legal:23,bite:'nervosa',col:{b:'#8c969e',t:'#c3cbd1',belly:'#e9edef',bars:'#3a4248',spot:'#15191c'},shape:{h:.46,fork:.5}},
  {n:'Serra',ab:.4,mo:{6:.4,7:.8,8:.9,9:1,10:1,11:.8,12:.3},bait:{sarda:1,cefalotto:.8,seppia:.5},wave:[0,.6,1.8],time:{alba:.9,giorno:.4,tramonto:1,notte:.6},d:[30,120],w:[.5,1.5,7],pow:1.15,lw:[.0098,3.06],legal:0,bite:'violenta',teeth:true,col:{b:'#4f7f8f',t:'#9cc0c8',belly:'#eaf1f2',spot:'#22383f'},shape:{h:.28,fork:.6}},
  {n:'Mormora',ab:1,mo:{3:.3,4:.7,5:1,6:1,7:1,8:1,9:.9,10:.7,11:.4},bait:{koreano:1,americano:.9,arenicola:.8,bibi:.7,cannolicchio:.4},wave:[0,.3,.9],time:{alba:.9,giorno:.9,tramonto:1,notte:.7},d:[30,100],w:[.1,.25,.7],pow:.5,lw:[.0106,3.07],legal:20,bite:'picchiettata',col:{b:'#b4b9ba',t:'#d9dcdc',belly:'#f2f3f3',vbars:'#4d5355',spot:'#2a2d2e'},shape:{h:.33,fork:.55}},
  {n:'Leccia stella',ab:.5,mo:{6:.6,7:.9,8:1,9:1,10:.8,11:.4},bait:{americano:.7,gambero:.7,sarda:.6,cefalotto:.6,koreano:.4},wave:[0,.4,1],time:{alba:1,giorno:.9,tramonto:.9,notte:.3},d:[15,80],w:[.2,.6,1.6],pow:1,lw:[.013,3.0],legal:0,bite:'decisa',col:{b:'#8ea0ae',t:'#cfd8de',belly:'#f4f6f7',dots:'#2c3a44',spot:'#2c3a44'},shape:{h:.44,fork:.75}},
  {n:'Ombrina',ab:.35,mo:{4:.5,5:.8,6:1,7:1,8:1,9:.8,10:.6,11:.3},bait:{arenicola:1,cannolicchio:.9,bibi:.8,koreano:.7,granchio:.5,gambero:.5},wave:[.2,.6,1.4],time:{alba:.6,giorno:.3,tramonto:.8,notte:1},d:[20,80],w:[.5,1.5,6],pow:.85,lw:[.0102,3.07],legal:0,bite:'decisa',col:{b:'#8f8a6d',t:'#c7c1a0',belly:'#efece0',lines:'#c9a24a',spot:'#3a3626'},shape:{h:.32,fork:.05}},
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
function reelTick(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),v=c.createGain(),f=c.createBiquadFilter();o.type='square';o.frequency.value=2600+Math.random()*400;f.type='bandpass';f.frequency.value=3000;
  v.gain.setValueAtTime(.025,t);v.gain.exponentialRampToValueAtTime(.0001,t+.018);o.connect(f).connect(v).connect(c.destination);o.start(t);o.stop(t+.02);}
function reelWhir(level,rate){const c=AU.on&&level>0?ac():null;if(!c){if(AU.whir)AU.whir.v.gain.setTargetAtTime(0,AU.ctx.currentTime,.05);return;}
  if(!AU.whir){const o=c.createOscillator();o.type='sawtooth';const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const v=c.createGain();v.gain.value=0;o.connect(f).connect(v).connect(c.destination);o.start();AU.whir={o,v};}
  AU.whir.o.frequency.setTargetAtTime(90+rate*25,c.currentTime,.05);AU.whir.v.gain.setTargetAtTime(level,c.currentTime,.05);}
function vib(p){try{if(LSG('vib',true))navigator.vibrate?.(p);}catch(e){}}
function click(){const c=ac();if(!c)return;const o=c.createOscillator(),v=c.createGain();o.type='square';o.frequency.value=1800;v.gain.setValueAtTime(.04,c.currentTime);v.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.03);o.connect(v).connect(c.destination);o.start();o.stop(c.currentTime+.04);}
function whoosh(){const c=ac();if(!c)return;const s=c.createBufferSource();s.buffer=noiseBuf(c);const f=c.createBiquadFilter();f.type='highpass';f.frequency.setValueAtTime(400,c.currentTime);f.frequency.linearRampToValueAtTime(2500,c.currentTime+.5);const v=c.createGain();v.gain.setValueAtTime(.0001,c.currentTime);v.gain.linearRampToValueAtTime(.25,c.currentTime+.12);v.gain.exponentialRampToValueAtTime(.001,c.currentTime+.8);s.connect(f).connect(v).connect(c.destination);s.start();s.stop(c.currentTime+.9);}
// onda che si rompe a riva: rumore filtrato con attacco morbido e coda lunga
function surfCrash(vol){const c=ac();if(!c||vol<=0)return;const t=c.currentTime,s=c.createBufferSource();s.buffer=AU.nb||(AU.nb=noiseBuf(c));
  const f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(220,t);f.frequency.linearRampToValueAtTime(650+vol*1200,t+.6);f.frequency.exponentialRampToValueAtTime(260,t+3.2);
  const v=c.createGain();v.gain.setValueAtTime(.0001,t);v.gain.linearRampToValueAtTime(vol,t+.6);v.gain.exponentialRampToValueAtTime(.0001,t+3.6);s.connect(f).connect(v).connect(c.destination);s.start(t,Math.random());s.stop(t+3.7);}
// vento: rumore passa-banda con raffiche
function windSound(level,t){const c=AU.on&&level>0?ac():null;
  if(!c){if(AU.wind){AU.wind.v.gain.setTargetAtTime(0,AU.ctx.currentTime,.4);}return;}
  if(!AU.wind){const s=c.createBufferSource();s.buffer=AU.nb||(AU.nb=noiseBuf(c));s.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=.8;f.frequency.value=600;const h=c.createBiquadFilter();h.type='highpass';h.frequency.value=180;const v=c.createGain();v.gain.value=0;s.connect(h).connect(f).connect(v).connect(c.destination);s.start();AU.wind={s,f,v};}
  const gust=.75+.2*Math.sin(t*.23)*Math.sin(t*.07+1)+.05*Math.sin(t*.9);AU.wind.v.gain.setTargetAtTime(level*clamp(gust,.5,1),c.currentTime,1.5);AU.wind.f.frequency.setTargetAtTime(380+gust*250,c.currentTime,2);}
function seaSound(level){const c=AU.on?ac():null;
  if(!c){if(AU.sea){try{AU.sea.s.stop();}catch(e){}AU.sea=null;}return;}
  if(!AU.sea){const s=c.createBufferSource();s.buffer=noiseBuf(c);s.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=500;const v=c.createGain();v.gain.value=0;s.connect(f).connect(v).connect(c.destination);s.start();AU.sea={s,v,f};}
  AU.sea.v.gain.setTargetAtTime(level,c.currentTime,.3);}

/* ---------- stato del gioco ---------- */
const G={};window.GAME=G;
let T=null,renderer,scene,camera,sky,water,sunLight,hemi,moonLight,headLamp,clock,raf=0,root,ui,hud,cvs;
const st={phase:'load',gt:Date.now(),speed:[1,2,4,8,16,32].includes(LSG('speed',8))?LSG('speed',8):8,lamp:LSG('lamp',true),X:null,sim:false,rods:[],sel:0,msg:'',fight:null,cast:null,catchShow:null,
  bag:LSG('bag',[]),inv:{granchio:0},best:LSG('best',{}),total:LSG('total',{n:0,kg:0,pts:0}),lead:LSG('lead',150),outfit:LSG('outfit','waders'),castMode:'mano',castDist:LSG('cdist',120),hook:LSG('hook','medio'),nRods:LSG('nrods',3),busy:false,lightning:0};
const gameDate=()=>new Date(st.gt);
G._st=st;
const CHAIR={x:-1.5,z:14};const ROD_Z=1.6;
const rodX=(i,n)=>n===2?[-3,3][i]:[-5,0,5][i];

/* ---------- caricamento di three.js (stessa versione usata dal gioco a cavallo) ---------- */
function loadScript(u){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>ko(new Error('Non riesco a scaricare '+u.split('/').pop()));document.head.appendChild(s);});}
async function loadThree(){if(window.THREE&&THREE.Water&&THREE.Sky)return THREE;const B='https://cdn.jsdelivr.net/npm/three@0.128.0/';
  if(!window.THREE)await loadScript(B+'build/three.min.js');await Promise.all([THREE.Sky?0:loadScript(B+'examples/js/objects/Sky.js'),THREE.Water?0:loadScript(B+'examples/js/objects/Water.js')]);return THREE;}

/* ---------- texture generate al volo ---------- */
function canvasTex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;}
function normalTex(){// mappa delle normali per le increspature del mare (rumore a più scale)
  const N=256,h=new Float32Array(N*N);for(let o=0;o<5;o++){const f=2<<o,a=1/(o+1.2),ph=Array.from({length:6},()=>Math.random()*6.28);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N*6.2832,v=y/N*6.2832;h[y*N+x]+=a*(Math.sin(u*f+ph[0]+Math.sin(v*f*.5+ph[1]))+Math.sin(v*f+ph[2]+Math.sin(u*f*.7+ph[3]))+.6*Math.sin((u+v)*f*.8+ph[4]));}}
  return canvasTex(N,N,(g)=>{const im=g.createImageData(N,N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,dx=h[y*N+(x+1)%N]-h[y*N+(x+N-1)%N],dy=h[((y+1)%N)*N+x]-h[((y+N-1)%N)*N+x];
    let nx=-dx*1.2,ny=-dy*1.2,nz=1;const l=Math.hypot(nx,ny,nz);im.data[i*4]=(nx/l*.5+.5)*255;im.data[i*4+1]=(ny/l*.5+.5)*255;im.data[i*4+2]=(nz/l*.5+.5)*255;im.data[i*4+3]=255;}g.putImageData(im,0,0);},[1,1]);}
function sandTex(){return canvasTex(512,512,(g,w,h)=>{g.fillStyle=SPOT.sand||'#d6b98a';g.fillRect(0,0,w,h);for(let i=0;i<26000;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(255,250,235,${Math.random()*.35})`:`rgba(110,85,55,${Math.random()*.28})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*1.5,1+Math.random()*1.5);}
  g.strokeStyle='rgba(150,120,80,.18)';for(let i=0;i<40;i++){g.beginPath();const y=Math.random()*h;for(let x=0;x<=w;x+=8)g.lineTo(x,y+Math.sin(x*.05+i)*3);g.stroke();}},[40,12]);}
// schiuma a chiazze con buchi: ogni cresta ha la sua
function foamTex2(){return canvasTex(1024,64,(g,w,h)=>{let x=0;while(x<w){const len=rnd(60,320),gap=rnd(4,90);
    const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.45,'rgba(255,255,255,.7)');gr.addColorStop(.6,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x+6,0,len-12,h);
    for(let i=0;i<len*3;i++){const px=x+Math.random()*len,py=h/2+(Math.random()-.5)*h*.85*Math.random(),r=1+Math.random()*5;g.fillStyle=`rgba(255,255,255,${.25+Math.random()*.6})`;g.beginPath();g.arc(px,py,r,0,7);g.fill();}x+=len+gap;}},[rnd(2.5,5),1]);}
function newWave(m){const u=m.userData;u.k=[rnd(.01,.03),rnd(.04,.09),rnd(.12,.25)];u.a=[rnd(1,3.5),rnd(.4,1.4),rnd(.1,.4)];u.ph=[rnd(0,6.3),rnd(0,6.3),rnd(0,6.3)];u.w=[rnd(-.3,.3),rnd(-.6,.6),rnd(-1,1)];u.d0=rnd(8,34);u.str=rnd(.75,1);m.material.map.offset.x=Math.random();u.tilt=rnd(-.01,.01);}
function foamTex(){return canvasTex(1024,64,(g,w,h)=>{for(let i=0;i<2600;i++){const x=Math.random()*w,y=h/2+(Math.random()-.5)*h*.7*Math.random(),r=1+Math.random()*4;g.fillStyle=`rgba(255,255,255,${.15+Math.random()*.5})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},[6,1]);}
function cloudTex(seed){return canvasTex(512,256,(g)=>{let s=seed;const rr=()=>(s=(s*9301+49297)%233280)/233280;for(let i=0;i<40;i++){const x=60+rr()*390,y=150+rr()*40-Math.sin((x-60)/390*Math.PI)*80,r=30+rr()*60;
  const gr=g.createRadialGradient(x,y-r*.3,r*.1,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.6,'rgba(240,242,248,.55)');gr.addColorStop(1,'rgba(220,225,235,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();}});}
function glowTex(col){return canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col);gr.addColorStop(.25,col.replace(/[\d.]+\)$/,'.5)'));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});}
function moonTex(ph){return canvasTex(128,128,(g)=>{const r=56,c=64,waxing=ph<180,k=Math.cos(ph*R);g.fillStyle='#2a2f3c';g.beginPath();g.arc(c,c,r,0,7);g.fill();g.fillStyle='#f3efe0';g.beginPath();waxing?g.arc(c,c,r,-Math.PI/2,Math.PI/2):g.arc(c,c,r,Math.PI/2,Math.PI*1.5);g.fill();
  g.fillStyle=k>0?'#2a2f3c':'#f3efe0';g.beginPath();g.ellipse(c,c,Math.abs(k)*r+.5,r+.5,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<9;i++){g.beginPath();g.arc(c+Math.cos(i*2.3)*r*.5,c+Math.sin(i*1.7)*r*.5,4+i%4*3,0,7);g.fill();}});}

/* ---------- materiali ---------- */
const MAT={};
function mats(){const S=(c,r=.8,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  Object.assign(MAT,{skin:S('#cf9878',.6),lips:S('#a8615a',.5),eyeW:S('#f2efe8',.25),iris:S('#3a2a1c',.2),brow:S('#3a2a1e',.9),stubble:S('#a9806a',.9),jacket:S('#2f5544',.85),jacket2:S('#264638',.9),pants:S('#2c3445',.9),boot:S('#3a2a1e',.7),cap:S('#b8352a',.85),hair:S('#2a2018',.95),
    alu:S('#b9c2cb',.35,.8),blank:S('#18222e',.35,.3),blank2:S('#2c3f55',.35,.3),tip:S('#e9eef2',.4),cork:S('#9c7a52',.95),reel:S('#3d4550',.35,.7),spool:S('#c9a24a',.3,.8),
    chair:S('#2a5d8a',.8),chairF:S('#9aa3ad',.4,.7),bag:S('#4a5a32',.9),bucket:S('#e8e8e8',.6),lead:S('#666a70',.4,.6),line:new T.LineBasicMaterial({color:0xd6e0e6,transparent:true,opacity:.2,depthWrite:false})});}

/* ---------- il pescatore: corpo articolato ---------- */
function limb(len,r1,r2,mat){// segmento che pende verso il basso dal suo perno, con articolazione arrotondata
  const g=new T.Group(),m=new T.Mesh(new T.CylinderGeometry(r2,r1,len,12),mat);m.position.y=-len/2;m.castShadow=true;g.add(m);
  const j=new T.Mesh(new T.SphereGeometry(r1*1.02,12,10),mat);j.castShadow=true;g.add(j);g.userData.len=len;return g;}
// pescatore con abbigliamento e aspetto a scelta:
// o={j,j2,c,p: colori; hat:'cap'|'beanie'|'bucket'|'none'; beard:'stubble'|'full'|'mustache'|'none'; beardCol; glasses; suit:'jacket'|'waders'|'tracksuit'|'wetsuit'; boots:'boots'|'tall'|'shoes'; skin; hair}
function makeAngler(o={}){
  const S=(c,r=.85,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const suit=o.suit||'jacket',skin=S(o.skin||'#cf9878',.6),hairM=S(o.hair||'#3a2a1e',.95),beardM=S(o.beardCol||o.hair||'#5a4636',.95);
  let jacket=S(o.j||'#2f5544'),jacket2=S(o.j2||'#264638',.9),pants=S(o.p||'#2c3445',.9),capM=S(o.c||'#b8352a');
  if(suit==='wetsuit'){jacket=pants=jacket2=S('#16191d',.55);}
  const rubber=S(o.rubber||'#2e3a2a',.5),bootM=S(o.boots==='shoes'?'#d8d8d2':'#2b2a28',.7);
  const legM=suit==='waders'?rubber:pants;
  const A=new T.Group(),J={};A.userData.J=J;
  const hips=new T.Group();hips.position.y=.95;A.add(hips);J.hips=hips;
  const pelvis=new T.Mesh(new T.SphereGeometry(.17,18,14),legM);pelvis.scale.set(1.12,.72,.82);hips.add(pelvis);
  const spine=new T.Group();spine.position.y=.05;hips.add(spine);J.spine=spine;
  // busto modellato: vita stretta, petto, spalle
  const prof=[[.001,0],[.155,0],[.15,.08],[.158,.2],[.18,.34],[.2,.44],[.205,.5],[.17,.57],[.08,.62],[.001,.63]].map(([x,y])=>new T.Vector2(x,y));
  const torso=new T.Mesh(new T.LatheGeometry(prof,22),jacket);torso.scale.z=.72;spine.add(torso);
  for(const s of[-1,1]){const dl=new T.Mesh(new T.SphereGeometry(.075,14,10),jacket);dl.position.set(s*.2,.5,0);dl.scale.set(1,.85,.9);spine.add(dl);}
  if(suit==='jacket'){const hood=new T.Mesh(new T.TorusGeometry(.1,.04,8,16),jacket2);hood.position.set(0,.6,.07);hood.rotation.x=1.2;spine.add(hood);
    const zip=new T.Mesh(new T.BoxGeometry(.012,.5,.01),jacket2);zip.position.set(0,.3,-.148);spine.add(zip);
    for(const s of[-1,1]){const pk=new T.Mesh(new T.BoxGeometry(.09,.07,.02),jacket2);pk.position.set(s*.09,.14,-.13);spine.add(pk);}}
  if(suit==='tracksuit'){for(const s of[-1,1]){const st1=new T.Mesh(new T.BoxGeometry(.012,.5,.01),S('#f2f2f2'));st1.position.set(s*.06,.3,-.148);spine.add(st1);}}
  if(suit==='waders'){// salopette di gomma fino al petto, con bretelle
    const bib=new T.Mesh(new T.LatheGeometry(prof.slice(0,6).map(v=>new T.Vector2(v.x*1.05+.004,v.y)),22),rubber);bib.scale.z=.74;spine.add(bib);
    for(const s of[-1,1]){const br=new T.Mesh(new T.BoxGeometry(.03,.3,.012),S('#1f2620'));br.position.set(s*.09,.48,-.135);br.rotation.z=s*.12;spine.add(br);
      const br2=br.clone();br2.position.z=.135;spine.add(br2);}}
  if(suit==='wetsuit'){const st2=new T.Mesh(new T.BoxGeometry(.3,.04,.21),S('#2f6fb5',.5));st2.position.y=.42;spine.add(st2);}
  const neck=new T.Group();neck.position.y=.62;spine.add(neck);J.neck=neck;
  const nk=new T.Mesh(new T.CylinderGeometry(.048,.055,.09,12),suit==='wetsuit'?jacket:skin);nk.position.y=.035;neck.add(nk);
  const head=new T.Group();head.position.y=.15;neck.add(head);J.head=head;
  // volto
  const skull=new T.Mesh(new T.SphereGeometry(.1,26,20),skin);skull.scale.set(.9,1.08,1);head.add(skull);
  const jaw=new T.Mesh(new T.SphereGeometry(.075,22,16),skin);jaw.scale.set(.95,.78,.95);jaw.position.set(0,-.055,-.018);head.add(jaw);
  const chin=new T.Mesh(new T.SphereGeometry(.03,12,10),skin);chin.scale.set(1.1,.8,.8);chin.position.set(0,-.1,-.058);head.add(chin);
  const bd=o.beard||'stubble';
  if(bd==='stubble'){const stub=new T.Mesh(new T.SphereGeometry(.078,20,12,0,6.3,1.75,1.1),S('#a9806a',.9));stub.scale.set(.96,.8,.97);stub.position.set(0,-.052,-.02);head.add(stub);}
  if(bd==='full'){const fb=new T.Mesh(new T.SphereGeometry(.083,22,14,0,6.3,1.7,1.25),beardM);fb.scale.set(1,.95,1);fb.position.set(0,-.05,-.018);head.add(fb);
    const ch=new T.Mesh(new T.SphereGeometry(.04,12,10),beardM);ch.scale.set(1.2,1.1,.9);ch.position.set(0,-.112,-.06);head.add(ch);}
  if(bd==='full'||bd==='mustache'){const mu=new T.Mesh(new T.BoxGeometry(.048,.012,.016),beardM);mu.position.set(0,-.041,-.099);head.add(mu);}
  for(const s of[-1,1]){
    const eye=new T.Mesh(new T.SphereGeometry(.0135,12,10),MAT.eyeW);eye.position.set(s*.034,.012,-.088);eye.scale.z=.6;head.add(eye);
    const iris=new T.Mesh(new T.SphereGeometry(.0078,10,8),MAT.iris);iris.position.set(s*.034,.012,-.0955);head.add(iris);
    const lid=new T.Mesh(new T.SphereGeometry(.0142,12,8,0,6.3,0,1),skin);lid.position.set(s*.034,.013,-.087);lid.scale.z=.65;lid.rotation.x=-.35;head.add(lid);
    const brow=new T.Mesh(new T.BoxGeometry(.032,.006,.01),hairM);brow.position.set(s*.035,.036,-.094);brow.rotation.z=-s*.12;head.add(brow);
    const ear=new T.Mesh(new T.SphereGeometry(.024,10,8),skin);ear.scale.set(.45,1,.75);ear.position.set(s*.093,.002,.008);head.add(ear);}
  const nose=new T.Mesh(new T.ConeGeometry(.012,.034,10),skin);nose.rotation.x=-1.15;nose.position.set(0,-.01,-.098);head.add(nose);
  const tipN=new T.Mesh(new T.SphereGeometry(.0095,10,8),skin);tipN.position.set(0,-.022,-.106);head.add(tipN);
  const lipU=new T.Mesh(new T.CylinderGeometry(.005,.005,.032,8),MAT.lips);lipU.rotation.z=Math.PI/2;lipU.position.set(0,-.052,-.094);head.add(lipU);
  const lipL=new T.Mesh(new T.CylinderGeometry(.0055,.0055,.026,8),MAT.lips);lipL.rotation.z=Math.PI/2;lipL.position.set(0,-.061,-.092);head.add(lipL);
  if(o.glasses){const gm=S('#151515',.3,.4),lens=new T.MeshStandardMaterial({color:'#1e2a33',roughness:.1,metalness:.6,transparent:true,opacity:.85});
    for(const s of[-1,1]){const fr=new T.Mesh(new T.TorusGeometry(.017,.0028,6,16),gm);fr.position.set(s*.034,.012,-.102);head.add(fr);const ln=new T.Mesh(new T.CircleGeometry(.016,14),lens);ln.position.set(s*.034,.012,-.1035);ln.rotation.y=Math.PI;head.add(ln);
      const arm=new T.Mesh(new T.BoxGeometry(.003,.003,.09),gm);arm.position.set(s*.05,.014,-.06);head.add(arm);}
    const bri=new T.Mesh(new T.BoxGeometry(.016,.003,.003),gm);bri.position.set(0,.016,-.104);head.add(bri);}
  // capelli e copricapo
  const hat=o.hat||'cap',hairTop=hat==='none';
  const hair=new T.Mesh(new T.SphereGeometry(.104,18,12,hairTop?0:-.25,hairTop?6.3:Math.PI+.5,hairTop?0:.5,hairTop?1.5:1.35),hairM);hair.position.set(0,.008,.006);head.add(hair);
  if(hat==='cap'){const cap=new T.Mesh(new T.SphereGeometry(.112,18,12,0,6.3,0,1.45),capM);cap.position.y=.02;head.add(cap);
    const brim=new T.Mesh(new T.CylinderGeometry(.11,.11,.012,16,1,false,-1.2,2.4),capM);brim.position.set(0,.03,-.07);brim.scale.z=.9;head.add(brim);}
  if(hat==='beanie'){const bn=new T.Mesh(new T.SphereGeometry(.113,18,12,0,6.3,0,1.5),capM);bn.position.y=.02;bn.scale.y=1.08;head.add(bn);
    const roll=new T.Mesh(new T.TorusGeometry(.105,.018,8,24),capM);roll.rotation.x=Math.PI/2;roll.position.y=.03;head.add(roll);}
  if(hat==='bucket'){const cr=new T.Mesh(new T.CylinderGeometry(.09,.108,.08,18),capM);cr.position.y=.085;head.add(cr);const tp=new T.Mesh(new T.SphereGeometry(.09,16,8,0,6.3,0,1.2),capM);tp.position.y=.12;tp.scale.y=.4;head.add(tp);
    const br=new T.Mesh(new T.CylinderGeometry(.16,.17,.01,24),capM);br.position.y=.045;head.add(br);}
  const band=new T.Mesh(new T.TorusGeometry(.108,.006,6,28),S('#3d434b',.8));band.rotation.x=Math.PI/2;band.position.y=.055;head.add(band);
  const lamp=new T.Mesh(new T.BoxGeometry(.03,.02,.014),new T.MeshStandardMaterial({color:'#6b7480',metalness:.4,roughness:.4,emissive:'#fffbe0',emissiveIntensity:0}));lamp.position.set(0,.058,-.112);head.add(lamp);J.lamp=lamp;
  // braccia (spalla, gomito, mano con pollice) e gambe (anca, ginocchio, stivale)
  const armM=jacket,stripe=suit==='tracksuit'?S('#f2f2f2'):null;
  for(const s of[-1,1]){const k=s<0?'l':'r';
    const sh=new T.Group();sh.position.set(s*.22,.52,0);spine.add(sh);J[k+'Sh']=sh;
    const ua=limb(.29,.06,.05,armM);sh.add(ua);const el=new T.Group();el.position.y=-.29;ua.add(el);J[k+'El']=el;
    const fa=limb(.27,.049,.04,armM);el.add(fa);const hand=new T.Group();hand.position.y=-.29;fa.add(hand);J[k+'Hand']=hand;
    if(stripe){const a1=new T.Mesh(new T.BoxGeometry(.012,.28,.012),stripe);a1.position.set(s*.055,-.15,0);ua.add(a1);const a2=a1.clone();a2.position.set(s*.045,-.14,0);fa.add(a2);}
    const cuff=new T.Mesh(new T.CylinderGeometry(.043,.043,.025,12),suit==='wetsuit'?armM:jacket2);cuff.position.y=-.265;fa.add(cuff);
    const palm=new T.Mesh(new T.SphereGeometry(.04,12,10),suit==='wetsuit'?armM:skin);palm.scale.set(.75,1.15,.5);palm.position.y=-.03;hand.add(palm);
    const th=new T.Mesh(new T.CylinderGeometry(.011,.009,.04,6),suit==='wetsuit'?armM:skin);th.position.set(-s*.025,-.02,-.018);th.rotation.z=s*.6;hand.add(th);
    const hp=new T.Group();hp.position.set(s*.1,-.02,0);hips.add(hp);J[k+'Hip']=hp;
    const thg=limb(.44,.088,.066,legM);hp.add(thg);const kn=new T.Group();kn.position.y=-.44;thg.add(kn);J[k+'Knee']=kn;
    const sn=limb(.42,.064,.05,legM);kn.add(sn);
    if(stripe){const l1=new T.Mesh(new T.BoxGeometry(.012,.42,.012),stripe);l1.position.set(s*.085,-.22,0);thg.add(l1);}
    const bt=o.boots||(suit==='waders'?'tall':'boots');
    if(bt==='tall'&&suit!=='waders'){const tb=new T.Mesh(new T.CylinderGeometry(.068,.062,.3,12),bootM);tb.position.y=-.28;sn.add(tb);}
    const foot=new T.Group();foot.position.set(0,-.43,0);sn.add(foot);
    const sole=new T.Mesh(new T.BoxGeometry(.1,.035,.27),bt==='shoes'?S('#f0f0ea'):S('#1e1d1b'));sole.position.set(0,-.025,-.05);foot.add(sole);
    const up=new T.Mesh(new T.SphereGeometry(.07,14,10),bt==='shoes'?bootM:(suit==='waders'?rubber:bootM));up.scale.set(.75,.6,1.7);up.position.set(0,.01,-.055);foot.add(up);J[k+'Foot']=foot;}
  // foto profilo come viso: copre la parte davanti della testa al posto di occhi, naso e bocca disegnati
  if(o.photo){const hd=J.head;hd.children.forEach((m,i)=>{if(i>0&&(m.position.z<-.075||m.position.y<-.04))m.visible=false;});
    // viso intero: dalla fronte al mento (foto 4:5), un po' più largo e più basso della testa disegnata
    const mk=new T.Mesh(new T.SphereGeometry(.104,28,24,Math.PI*1.5-1.25,2.5,Math.PI*.18,Math.PI*.7),new T.MeshStandardMaterial({map:photoTex(o.photo),roughness:.75}));mk.scale.set(.92,1.22,1);mk.position.y=-.018;hd.add(mk);}
  A.traverse(m=>{if(m.isMesh)m.castShadow=true;});return A;}
const PHOTOT={};function photoTex(u){if(PHOTOT[u])return PHOTOT[u];const t=new T.TextureLoader().load(u);t.encoding=T.sRGBEncoding;return PHOTOT[u]=t;}
function myPhoto(){try{return JSON.parse(localStorage.getItem('lenza.photo'))||null;}catch(e){return null;}}
// pose: angoli delle articolazioni (x avanti/indietro, z apertura, y torsione)
const POSES={
  stand:{hy:.95,sp:[0,0,0],hd:[0,0,0],lSh:[.05,0,.12],rSh:[.05,0,-.12],lEl:[.15,0,0],rEl:[.15,0,0],lHip:[0,0,0],rHip:[0,0,0],lKnee:[0,0,0],rKnee:[0,0,0],rod:null},
  sit:{hy:.6,sp:[.12,0,0],hd:[-.05,0,0],lSh:[.35,0,.18],rSh:[.35,0,-.18],lEl:[.9,0,0],rEl:[.9,0,0],lHip:[1.5,0,.08],rHip:[1.5,0,-.08],lKnee:[-1.45,0,0],rKnee:[-1.45,0,0],rod:null},
  bend:{hy:.82,sp:[-.75,0,0],hd:[.3,0,0],lSh:[.9,0,.1],rSh:[1.2,0,-.1],lEl:[.3,0,0],rEl:[.2,0,0],lHip:[.55,0,0],rHip:[.55,0,0],lKnee:[-.5,0,0],rKnee:[-.5,0,0],rod:{p:20,f:.5}},
  hold:{hy:.95,sp:[-.05,0,0],hd:[-.05,0,0],lSh:[.75,0,.25],rSh:[.85,0,-.05],lEl:[1.1,0,0],rEl:[.85,0,0],lHip:[.05,0,0],rHip:[-.1,0,0],lKnee:[-.05,0,0],rKnee:[-.1,0,0],rod:{p:45,f:0}},
  castBack:{hy:.93,sp:[.2,.55,0],hd:[-.1,-.3,0],lSh:[2.5,0,.3],rSh:[2.8,0,-.3],lEl:[.6,0,0],rEl:[.4,0,0],lHip:[.15,0,0],rHip:[-.35,0,0],lKnee:[-.1,0,0],rKnee:[-.25,0,0],rod:{p:128,f:0,y:.35}},
  castFwd:{hy:.92,sp:[-.3,-.3,0],hd:[-.15,.2,0],lSh:[1.1,0,.2],rSh:[1.5,0,-.1],lEl:[.3,0,0],rEl:[.2,0,0],lHip:[-.3,0,0],rHip:[.25,0,0],lKnee:[-.3,0,0],rKnee:[-.05,0,0],rod:{p:25,f:0,y:-.1}},
  strike:{hy:.96,sp:[.3,.1,0],hd:[-.25,0,0],lSh:[2.4,0,.3],rSh:[2.5,0,-.2],lEl:[.5,0,0],rEl:[.4,0,0],lHip:[-.2,0,0],rHip:[.25,0,0],lKnee:[-.1,0,0],rKnee:[-.25,0,0],rod:{p:80,f:0}},
  reel:{hy:.93,sp:[.12,.05,0],hd:[-.1,0,0],lSh:[.9,0,.35],rSh:[1.15,0,-.05],lEl:[1.25,0,0],rEl:[.7,0,0],lHip:[-.15,0,0],rHip:[.2,0,0],lKnee:[-.12,0,0],rKnee:[-.2,0,0],rod:{p:42,f:0}},
};
const AN={faceTo:null,obj:null,pose:JSON.parse(JSON.stringify(POSES.sit)),target:'sit',walk:0,moving:false,speed:1.4,pos:null,rotY:0,holding:-1,reelSpin:0,crank:0};
function lerpPose(dt,k=6,a=AN){const tp=POSES[a.target],p=a.pose,f=1-Math.exp(-k*dt);p.hy=lerp(p.hy,tp.hy,f);
  for(const j of['sp','hd','lSh','rSh','lEl','rEl','lHip','rHip','lKnee','rKnee'])for(let i=0;i<3;i++)p[j][i]=lerp(p[j][i],tp[j][i],f);
  if(tp.rod){if(!p.rod)p.rod={...tp.rod};p.rod.p=lerp(p.rod.p,tp.rod.p,f);p.rod.f=lerp(p.rod.f||0,tp.rod.f||0,f);p.rod.y=lerp(p.rod.y||0,tp.rod.y||0,f);}}
function applyPose(t,a=AN){const J=a.obj.userData.J,p=a.pose,set=(o,v)=>o.rotation.set(v[0],v[1],v[2]);
  const mv=a.moving&&!a.swim,spd=a.speed||1.4,run=mv&&spd>3.2,A1=mv?clamp(spd/1.5,.55,1.5):0,ph=a.walk,s1=Math.sin(ph),c1=Math.cos(ph);
  // bacino: sale e scende, ruota e oscilla; il busto compensa e la testa resta stabile
  J.hips.position.y=p.hy+(mv?Math.abs(c1)*.045*A1-.035*A1:Math.sin(t*1.3)*.004);J.hips.rotation.set(0,mv?s1*.11*A1:0,mv?Math.sin(2*ph)*.035*A1:0);
  set(J.spine,[p.sp[0]+(mv?.04+(run?.2:0):0),p.sp[1]-(mv?s1*.17*A1:0),p.sp[2]]);
  set(J.head,[p.hd[0]-(run?.15:0),p.hd[1]+(mv?s1*.07*A1:0),p.hd[2]]);
  const arms=a.holding<0&&mv,aA=.38*A1;
  set(J.lSh,[p.lSh[0]-(arms?s1*aA:0),p.lSh[1],p.lSh[2]]);set(J.rSh,[p.rSh[0]+(arms?s1*aA:0),p.rSh[1],p.rSh[2]]);
  set(J.lEl,[p.lEl[0]+(arms?.25+(run?.9:0)+Math.max(0,-s1)*.3*A1:0),0,0]);set(J.rEl,[p.rEl[0]+(arms?.25+(run?.9:0)+Math.max(0,s1)*.3*A1:0),0,0]);
  // recupero: la mano sinistra gira la manovella
  if(a.reelSpin>0&&a.holding>=0){const c=a.crank;J.lSh.rotation.x+=Math.sin(c)*.14;J.lSh.rotation.z+=Math.cos(c)*.09;J.lEl.rotation.x+=Math.sin(c)*.18;}
  // gambe: la gamba che avanza piega il ginocchio, quella d'appoggio resta quasi tesa; il piede rulla
  const tA=.45*A1;set(J.lHip,[p.lHip[0]+(mv?s1*tA:0),p.lHip[1],p.lHip[2]]);set(J.rHip,[p.rHip[0]-(mv?s1*tA:0),p.rHip[1],p.rHip[2]]);
  set(J.lKnee,[p.lKnee[0]-(mv?Math.max(0,c1)*1.05*A1+.06*A1:0),0,0]);set(J.rKnee,[p.rKnee[0]-(mv?Math.max(0,-c1)*1.05*A1+.06*A1:0),0,0]);
  if(J.lFoot){J.lFoot.rotation.x=mv?-s1*.22*A1+Math.max(0,c1)*.25*A1:0;J.rFoot.rotation.x=mv?s1*.22*A1+Math.max(0,-c1)*.25*A1:0;}
  a.obj.position.copy(a.pos);
  if(a.swim){// a stile libero: corpo orizzontale, bracciate alternate, gambe a forbice, testa alta
    a.obj.rotation.set(-1.35,a.rotY,0,'YXZ');J.hips.position.y=.1;J.hips.rotation.set(0,Math.sin(ph)*.25,0);const sw=a.moving?ph:t*1.2;
    J.lSh.rotation.set(sw%(Math.PI*2),0,.25);J.rSh.rotation.set((sw+Math.PI)%(Math.PI*2),0,-.25);J.lEl.rotation.set(.3,0,0);J.rEl.rotation.set(.3,0,0);
    J.lHip.rotation.set(Math.sin(sw*3)*.28,0,0);J.rHip.rotation.set(-Math.sin(sw*3)*.28,0,0);J.lKnee.rotation.set(-.15,0,0);J.rKnee.rotation.set(-.15,0,0);J.head.rotation.set(-1.05,Math.sin(sw)*.3,0);J.spine.rotation.set(0,0,0);}
  else a.obj.rotation.set(0,a.rotY,0,'YXZ');}

/* ---------- canne con fusto che si piega, anelli e mulinello ---------- */
const ROD_LEN=4.2,SEG=14;
function makeRod(){const g=new T.Group(),segs=[];let parent=g;
  for(let i=0;i<SEG;i++){const u=i/SEG,len=ROD_LEN/SEG,r1=lerp(.017,.004,u),r2=lerp(.017,.004,(i+1)/SEG),s=new T.Group();s.position.y=i?len:0;parent.add(s);
    const m=new T.Mesh(new T.CylinderGeometry(r2,r1,len,8),u<.25?MAT.blank:u<.8?MAT.blank2:MAT.tip);m.position.y=len/2;m.castShadow=true;s.add(m);
    if(i===2||i===3){const c=new T.Mesh(new T.CylinderGeometry(r1*1.5,r1*1.5,len,10),MAT.cork);c.position.y=len/2;s.add(c);}
    if(i>=4&&i%2===0){const ring=new T.Mesh(new T.TorusGeometry(lerp(.03,.008,u),.003,6,12),MAT.alu);ring.position.set(0,len*.5,lerp(.05,.015,u));s.add(ring);}
    segs.push(s);parent=s;}
  // mulinello sotto il fusto: corpo, rotore e bobina che girano, manovella
  const reel=new T.Group();reel.position.set(0,.1,0);reel.rotation.y=Math.PI;segs[3].add(reel);
  const stem=new T.Mesh(new T.BoxGeometry(.015,.02,.07),MAT.reel);stem.position.z=.02;reel.add(stem);
  const body=new T.Mesh(new T.CylinderGeometry(.035,.04,.08,14),MAT.reel);body.position.z=.07;reel.add(body);
  const rotor=new T.Group();rotor.position.set(0,.065,.07);reel.add(rotor);
  const rm=new T.Mesh(new T.CylinderGeometry(.05,.045,.05,16),MAT.reel);rotor.add(rm);
  const bail=new T.Mesh(new T.TorusGeometry(.055,.004,6,16,Math.PI),MAT.alu);bail.position.y=.04;rotor.add(bail);
  const spool=new T.Mesh(new T.CylinderGeometry(.052,.052,.035,18),MAT.spool);spool.position.set(0,.115,.07);reel.add(spool);
  const lt=canvasTex(64,16,(g)=>{for(let x=0;x<64;x+=8){g.fillStyle=x%16?'#f2f6f8':'#ff7a3c';g.fillRect(x,0,8,16);}});
  const lineOn=new T.Mesh(new T.CylinderGeometry(.047,.047,.03,24),new T.MeshStandardMaterial({map:lt,roughness:.4}));lineOn.position.copy(spool.position);reel.add(lineOn);reel.scale.setScalar(1.35);
  const crank=new T.Group();crank.position.set(-.045,.0,.07);reel.add(crank);
  const arm=new T.Mesh(new T.BoxGeometry(.012,.07,.012),MAT.alu);arm.position.y=.035;crank.add(arm);const knob=new T.Mesh(new T.CylinderGeometry(.012,.012,.03,8),MAT.cork);knob.rotation.z=Math.PI/2;knob.position.set(-.02,.07,0);crank.add(knob);
  crank.rotation.z=Math.PI/2;
  g.userData={segs,rotor,crank,reel,lineOn,tip:new T.Object3D()};segs[SEG-1].add(g.userData.tip);g.userData.tip.position.y=ROD_LEN/SEG;
  // campanello e luce chimica in cima
  const bell=new T.Mesh(new T.SphereGeometry(.018,8,8),MAT.spool);bell.position.set(0,-.08,.02);segs[SEG-1].add(bell);
  const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(150,255,130,1)'),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));glow.scale.set(.5,.5,.5);glow.position.y=ROD_LEN/SEG;segs[SEG-1].add(glow);g.userData.glow=glow;
  return g;}
function bendRod(rod,b){const s=rod.userData.segs;for(let i=0;i<SEG;i++){const u=i/SEG;s[i].rotation.x=-b*u*u*.32;}}
function makeSpike(){const g=new T.Group(),p=new T.Mesh(new T.CylinderGeometry(.012,.006,1.6,8),MAT.alu);p.position.y=.55;g.add(p);
  const cup=new T.Mesh(new T.CylinderGeometry(.035,.025,.12,10,1,true),MAT.alu);cup.position.y=.12;g.add(cup);
  const v=new T.Mesh(new T.TorusGeometry(.04,.006,6,12,Math.PI),MAT.alu);v.position.y=1.32;v.rotation.z=Math.PI;g.add(v);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}

/* ---------- mondo ---------- */
let overcast=null,SAND=null,CHAIRG=null,MYG=[],CHAIRHIT=null,NPCS=[],foams=[],swash,clouds=[],stars,moon,rain,cityL,grass,lineObjs=[],sinkers=[],splashP,fishMesh,bushes;
function buildWorld(){
  scene=new T.Scene();camera=new T.PerspectiveCamera(55,1,.1,20000);
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  mats();
  sky=new T.Sky();sky.scale.setScalar(15000);scene.add(sky);
  // coltre grigia del cielo coperto (pioggia, nuvolosità alta)
  overcast=new T.Mesh(new T.SphereGeometry(9000,32,12,0,Math.PI*2,0,Math.PI/2),new T.MeshBasicMaterial({color:0x9aa3ab,side:T.BackSide,transparent:true,opacity:0,fog:false,depthWrite:false}));overcast.renderOrder=-1;scene.add(overcast);
  sunLight=new T.DirectionalLight(0xffffff,1);sunLight.castShadow=true;sunLight.shadow.mapSize.set(1024,1024);Object.assign(sunLight.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:120});scene.add(sunLight);scene.add(sunLight.target);
  hemi=new T.HemisphereLight(0xbfd8ff,0xc9a878,.6);scene.add(hemi);
  moonLight=new T.DirectionalLight(0x9fb4ff,0);scene.add(moonLight);
  // mare con riflessi
  const wn=normalTex();wn.encoding=T.LinearEncoding;wn.wrapS=wn.wrapT=T.RepeatWrapping;
  water=new T.Water(new T.PlaneGeometry(6000,6000),{textureWidth:256,textureHeight:256,waterNormals:wn,sunDirection:new T.Vector3(),sunColor:0xffffff,waterColor:0x0b4a63,distortionScale:2.5,fog:true});
  water.material.uniforms.size.value=2.2;
  water.rotation.x=-Math.PI/2;water.position.y=0;scene.add(water);
  // spiaggia: sale dalla battigia alle dune
  const sg=new T.PlaneGeometry(420,90,140,60);sg.rotateX(-Math.PI/2);const pa=sg.attributes.position,col=[];
  const DK=SPOT.dune??1;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i)+30;let y=z<-6?-1.2+(z+6)*.05:z<0?z*.06-.15:z<24?z*.035+Math.sin(x*.21+z*.3)*.015:.84+(Math.pow((z-24)/10,1.6)*1.4+Math.sin(x*.07)*.8+Math.sin(x*.19+1)*.35)*DK;
    if(z>24)y+=Math.max(0,Math.sin(x*.13+z*.2))*.6*DK;pa.setXYZ(i,x,y,z);const wet=clamp(1-(z+1)/5,0,1);col.push(lerp(1,.62,wet),lerp(1,.56,wet),lerp(1,.48,wet));}
  sg.setAttribute('color',new T.Float32BufferAttribute(col,3));sg.computeVertexNormals();
  SAND=new T.Mesh(sg,new T.MeshStandardMaterial({map:sandTex(),vertexColors:true,roughness:1}));SAND.receiveShadow=true;scene.add(SAND);
  // macchia mediterranea e ammofila sulle dune
  const bg=new T.SphereGeometry(1,10,8),bm=new T.MeshStandardMaterial({color:'#3a5a2c',roughness:1});bushes=new T.InstancedMesh(bg,bm,260);const mtx=new T.Matrix4(),q=new T.Quaternion();
  const NB=Math.round(260*(SPOT.veg??1));for(let i=0;i<260;i++){const x=i<NB?rnd(-200,200):9999,z=rnd(27,58),s=rnd(.6,1.8),y=.84+(Math.pow((z-24)/10,1.6)*1.4+Math.sin(x*.07)*.8+Math.sin(x*.19+1)*.35)*DK;mtx.compose(new T.Vector3(x,y+s*.25,z),q,new T.Vector3(s*1.4,s*.75,s*1.2));bushes.setMatrixAt(i,mtx);bushes.setColorAt(i,new T.Color().setHSL(.25+rnd(-.03,.04),.35,rnd(.16,.26)));}
  scene.add(bushes);
  const gg=new T.ConeGeometry(.04,.6,3);gg.translate(0,.3,0);grass=new T.InstancedMesh(gg,new T.MeshStandardMaterial({color:'#a8a964',roughness:1}),900);
  for(let i=0;i<900;i++){const x=rnd(-120,120),z=rnd(20,27),y=z*.035;mtx.compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rnd(-.3,.3),rnd(0,6),rnd(-.3,.3))),new T.Vector3(1,rnd(.6,1.4),1));grass.setMatrixAt(i,mtx);}scene.add(grass);
  // pini lontani sulla duna (silhouette)
  const pm=new T.MeshStandardMaterial({color:'#2b4024',roughness:1}),tm=new T.MeshStandardMaterial({color:'#5a4030',roughness:1});
  for(let i=0;i<Math.round(26*(SPOT.pines??0));i++){const x=rnd(-220,220),z=rnd(62,90),h=rnd(9,15),p=new T.Group();const tr=new T.Mesh(new T.CylinderGeometry(.25,.4,h,6),tm);tr.position.y=h/2;p.add(tr);
    const cr=new T.Mesh(new T.SphereGeometry(1,10,8),pm);cr.scale.set(rnd(4,6.5),rnd(1.4,2),rnd(4,6));cr.position.y=h;p.add(cr);p.position.set(x,2,z);scene.add(p);}
  buildLandmarks();
  // frangenti: strisce di schiuma che avanzano verso riva, e risacca sulla sabbia
  const ft=foamTex();for(let i=0;i<9;i++){const g=new T.PlaneGeometry(420,3.4,160,2);g.rotateX(-Math.PI/2);const base=Float32Array.from(g.attributes.position.array);
    const tx=foamTex2();const m=new T.Mesh(g,new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,opacity:0}));m.position.y=.06;m.userData={base,cyc:Math.random(),rate:rnd(.75,1.35)};newWave(m);scene.add(m);foams.push(m);}
  swash=new T.Mesh(new T.PlaneGeometry(420,3),new T.MeshBasicMaterial({map:ft.clone(),transparent:true,depthWrite:false,opacity:.5,color:0xdff3f5}));swash.material.map.needsUpdate=true;swash.rotation.x=-Math.PI/2;scene.add(swash);
  // nuvole
  for(let i=0;i<18;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex(Math.floor(Math.random()*1e6)),transparent:true,depthWrite:false,fog:false,opacity:0}));respawnCloud(sp,true);scene.add(sp);clouds.push(sp);}
  // stelle
  const sv=[];for(let i=0;i<1500;i++){const th=Math.random()*6.283,ph=Math.acos(Math.random()*.95);sv.push(Math.sin(ph)*Math.cos(th)*9000,Math.cos(ph)*9000,Math.sin(ph)*Math.sin(th)*9000);}
  const sgeo=new T.BufferGeometry();sgeo.setAttribute('position',new T.Float32BufferAttribute(sv,3));stars=new T.Points(sgeo,new T.PointsMaterial({color:0xffffff,size:14,sizeAttenuation:true,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(stars);
  moon=new T.Sprite(new T.SpriteMaterial({map:moonTex(90),transparent:true,fog:false,depthWrite:false,toneMapped:false}));moon.scale.set(420,420,1);scene.add(moon);
  const halo=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(210,225,255,1)'),transparent:true,fog:false,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,opacity:.35}));halo.scale.set(1700,1700,1);moon.add(halo);halo.scale.set(4,4,1);moon.userData.halo=halo;
  // luci di Ostia (destra) e Torvaianica (sinistra) di notte
  const cv=[];for(let i=0;i<260;i++){const left=i<110;const x=left?rnd(-2600,-900):rnd(900,3200),z=left?rnd(-200,400):rnd(-300,500);cv.push(x,rnd(1,6),z);}
  const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(cv,3));cityL=new T.Points(cg,new T.PointsMaterial({color:0xffd59a,size:6,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(cityL);
  // pioggia
  const rv=[];for(let i=0;i<1600;i++){const x=rnd(-30,30),y=rnd(0,25),z=rnd(-25,25);rv.push(x,y,z,x,y-.45,z);}const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(rv,3));
  rain=new T.LineSegments(rg,new T.LineBasicMaterial({color:0xbfcbd8,transparent:true,opacity:0}));scene.add(rain);
  // schizzi
  const spv=new Float32Array(60*3);const spg=new T.BufferGeometry();spg.setAttribute('position',new T.BufferAttribute(spv,3));splashP=new T.Points(spg,new T.PointsMaterial({color:0xffffff,size:.12,transparent:true,opacity:0}));scene.add(splashP);splashP.userData={v:Array.from({length:60},()=>new T.Vector3()),t:0};
  // sedia, zaino, secchio, borsone
  const ch=new T.Group(),tela=new T.MeshStandardMaterial({color:'#4b5a36',roughness:.95}),tube=(a,b,r=.013)=>{const v=new T.Vector3().subVectors(b,a),m=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),8),MAT.chairF);m.position.copy(a).addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());ch.add(m);return m;},V=(x,y,z)=>new T.Vector3(x,y,z);
  for(const sx of[-1,1])for(const sz of[-1,1]){tube(V(sx*.2,.55,sz*.17),V(sx*.26,0,sz*.24),.016);const foot=new T.Mesh(new T.CylinderGeometry(.05,.05,.012,12),MAT.chairF);foot.position.set(sx*.26,.006,sz*.24);ch.add(foot);}
  tube(V(-.2,.55,-.17),V(.2,.55,-.17));tube(V(-.2,.55,.17),V(.2,.55,.17));tube(V(-.2,.55,-.17),V(-.2,.55,.17));tube(V(.2,.55,-.17),V(.2,.55,.17));
  const seat=new T.Mesh(new T.BoxGeometry(.4,.025,.34),tela);seat.position.y=.56;ch.add(seat);
  tube(V(-.2,.55,.17),V(-.21,.95,.26));tube(V(.2,.55,.17),V(.21,.95,.26));tube(V(-.21,.95,.26),V(.21,.95,.26));
  const back=new T.Mesh(new T.BoxGeometry(.4,.34,.02),tela);back.position.set(0,.77,.215);back.rotation.x=-.22;ch.add(back);
  for(const sx of[-1,1]){tube(V(sx*.22,.75,-.15),V(sx*.22,.75,.2),.014);tube(V(sx*.22,.75,-.15),V(sx*.2,.55,-.15));const pad=new T.Mesh(new T.BoxGeometry(.05,.02,.3),MAT.boot);pad.position.set(sx*.22,.765,.03);ch.add(pad);}
  const rh=new T.Mesh(new T.CylinderGeometry(.025,.02,.22,10,1,true),MAT.chairF);rh.position.set(.27,.68,-.05);rh.rotation.x=-.5;ch.add(rh);// porta-canna laterale
  CHAIRHIT=new T.Mesh(new T.BoxGeometry(1.6,1.6,1.4),new T.MeshBasicMaterial({visible:false}));CHAIRHIT.position.set(CHAIR.x+.3,CHAIR.z*.035+.7,CHAIR.z);scene.add(CHAIRHIT);
  ch.position.set(CHAIR.x,CHAIR.z*.035,CHAIR.z);ch.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(ch);CHAIRG=ch;
  const bag=new T.Mesh(new T.BoxGeometry(.4,.35,.25),MAT.bag);bag.position.set(CHAIR.x+.8,CHAIR.z*.035+.17,CHAIR.z+.6);bag.castShadow=true;scene.add(bag);
  // cassettina da pesca con coperchio aperto, scomparti e minuteria colorata, e scatola delle esche
  const box=new T.Group(),bxm=new T.MeshStandardMaterial({color:'#2f6b57',roughness:.55}),bl=new T.MeshStandardMaterial({color:'#3e8a70',roughness:.5});
  const body=new T.Mesh(new T.BoxGeometry(.46,.2,.26),bxm);body.position.y=.1;box.add(body);
  const tray=new T.Mesh(new T.BoxGeometry(.44,.02,.24),new T.MeshStandardMaterial({color:'#d8dcd6',roughness:.6}));tray.position.y=.2;box.add(tray);
  for(let i=0;i<6;i++)for(let j=0;j<2;j++){const sep=new T.Mesh(new T.BoxGeometry(.004,.03,.22),bl);sep.position.set(-.22+i*.088,.215,0);box.add(sep);
    const it=new T.Mesh(i%3?new T.SphereGeometry(.012,6,6):new T.ConeGeometry(.01,.03,6),new T.MeshStandardMaterial({color:['#d9b24a','#c0392b','#9aa3ad','#2f6fb5','#e07a2f','#5ee08a'][(i+j)%6],metalness:.5,roughness:.4}));
    it.position.set(-.18+i*.088,.218,j?.05:-.05);box.add(it);}
  const lid=new T.Group();lid.position.set(0,.2,.13);box.add(lid);const lm=new T.Mesh(new T.BoxGeometry(.46,.04,.26),bl);lm.position.set(0,.02,-.13);lid.add(lm);lid.rotation.x=1.9;
  const hdl=new T.Mesh(new T.TorusGeometry(.06,.01,6,12,Math.PI),new T.MeshStandardMaterial({color:'#222'}));hdl.position.set(0,.04,-.13);lid.add(hdl);
  box.position.set(CHAIR.x+.62,CHAIR.z*.035,CHAIR.z-.25);box.rotation.y=-.4;box.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(box);
  const eb=new T.Group(),ebm=new T.Mesh(new T.BoxGeometry(.16,.06,.11),new T.MeshStandardMaterial({color:'#e8e2d0',roughness:.7}));ebm.position.y=.03;eb.add(ebm);
  for(let i=0;i<7;i++){const w=new T.Mesh(new T.TorusGeometry(.018,.005,5,10,rnd(2,4)),new T.MeshStandardMaterial({color:i%2?'#b8434e':'#d9705a',roughness:.6}));w.position.set(rnd(-.05,.05),.065,rnd(-.03,.03));w.rotation.set(Math.PI/2,0,rnd(0,6));eb.add(w);}
  eb.position.set(CHAIR.x+.62,CHAIR.z*.035,CHAIR.z+.12);scene.add(eb);MYG.push(bag,box,eb);
  const buck=new T.Mesh(new T.CylinderGeometry(.16,.13,.3,16),MAT.bucket);buck.position.set(CHAIR.x-.75,CHAIR.z*.035+.15,CHAIR.z-.2);buck.castShadow=true;scene.add(buck);MYG.push(buck);
  const fodero=new T.Mesh(new T.CylinderGeometry(.08,.08,1.4,10),MAT.bag);fodero.rotation.z=Math.PI/2;fodero.position.set(CHAIR.x+1.6,CHAIR.z*.035+.08,CHAIR.z+.9);scene.add(fodero);MYG.push(fodero);
  // il pescatore e la sua frontale
  AN.obj=makeAngler({photo:myPhoto(),beard:myPhoto()?'none':undefined});scene.add(AN.obj);buildNpcs();buildCrabs();buildGear();AN.pos=new T.Vector3(CHAIR.x,CHAIR.z*.035,CHAIR.z-.05);AN.rotY=0;
  headLamp=new T.SpotLight(0xfff6d8,0,40,.45,.5,1.2);AN.obj.userData.J.head.add(headLamp);headLamp.position.set(0,.06,-.12);const lt=new T.Object3D();lt.position.set(0,-1.2,-6);AN.obj.userData.J.head.add(lt);headLamp.target=lt;
  // pesce che esce dall'acqua alla fine
  fishMesh=new T.Group();const fb=new T.Mesh(new T.SphereGeometry(1,18,12),new T.MeshStandardMaterial({color:'#b8c2c8',roughness:.3,metalness:.6}));fb.scale.set(.5,.2,.08);fishMesh.add(fb);
  const tail=new T.Mesh(new T.ConeGeometry(.16,.25,4),fb.material);tail.rotation.z=Math.PI/2;tail.position.x=.58;tail.scale.z=.2;fishMesh.add(tail);fishMesh.visible=false;fishMesh.userData.body=fb;scene.add(fishMesh);
  clock=new T.Clock();
}
// vicini di spiaggia: ognuno con sedia, due canne sui picchetti e le sue abitudini
function buildNpcs(){const defs=[
    {x:-22,col:{j:'#b5562a',j2:'#8f4220',c:'#2b3a55',p:'#3a3a3a',suit:'waders',hat:'cap',beard:'full',beardCol:'#9a9a94',hair:'#8a8a84',skin:'#d8a588'}},
    {x:25,col:{j:'#2e4f7a',j2:'#233d60',c:'#3a3a3a',p:'#2e4f7a',suit:'tracksuit',hat:'beanie',beard:'mustache',hair:'#2a1d14',boots:'tall',skin:'#c98d6a'}},
    {x:-46,col:{suit:'wetsuit',hat:'none',beard:'stubble',glasses:true,hair:'#4a3020',skin:'#bf8460'}},
    {x:52,col:{j:'#6b6a4a',j2:'#55543a',c:'#c9b78a',p:'#3a3a32',suit:'jacket',hat:'bucket',beard:'full',beardCol:'#e8e6e0',hair:'#d8d6d0',glasses:true,boots:'shoes',skin:'#e0b098'}}];
  const PERS=[{name:'Franco',age:64,town:'Acilia',yrs:35,bait:'bibi',lead:150,rig:'lungo',app:true,mood:'chiacchierone'},{name:'Peppe',age:51,town:'Ostia',yrs:20,bait:'arenicola',lead:175,rig:'corto',app:false,mood:'brontolone'},
    {name:'Marco',age:33,town:'Torvaianica',yrs:8,bait:'koreano',lead:125,rig:'2ami',app:true,mood:'entusiasta'},{name:'Luigi',age:72,town:'Roma, Garbatella',yrs:50,bait:'cannolicchio',lead:150,rig:'lungo',app:false,mood:'saggio'}];
  // i pescatori vengono dai paesi vicini allo spot
  const TOWNS={sperlonga:['Sperlonga','Fondi','Itri','Terracina'],gaeta:['Gaeta','Formia','Itri','Sperlonga'],formia:['Formia','Gaeta','Maranola','Itri'],scauri:['Minturno','Scauri','Formia','Santi Cosma e Damiano'],montalto:['Montalto di Castro','Pescia Romana','Canino','Tarquinia'],santamarinella:['Santa Marinella','Civitavecchia','Cerveteri','Tolfa'],santasevera:['Santa Severa','Santa Marinella','Cerveteri','Roma, Boccea'],cerveteri:['Cerveteri','Ladispoli','Valcanneto','Bracciano'],ladispoli:['Ladispoli','Cerveteri','Palo Laziale','Roma, Aurelio'],passoscuro:['Passoscuro','Maccarese','Fiumicino','Torrimpietra'],castelfusano:['Ostia','Acilia','Infernetto','Roma, Eur'],torsanlorenzo:['Ardea','Tor San Lorenzo','Pomezia','Aprilia'],lavinio:['Lavinio','Anzio','Ardea','Aprilia'],nettuno:['Nettuno','Anzio','Velletri','Aprilia'],sanfelice:['San Felice Circeo','Sabaudia','Terracina','Latina'],terracina:['Terracina','Fondi','Sonnino','San Felice Circeo'],tarquinia:['Tarquinia','Montalto di Castro','Viterbo','Civitavecchia'],civitavecchia:['Civitavecchia','Santa Marinella','Tolfa','Allumiere'],fregene:['Fregene','Maccarese','Fiumicino','Roma, Aurelio'],
    focene:['Focene','Fiumicino','Maccarese','Roma, Magliana'],fiumicino:['Fiumicino','Isola Sacra','Ostia','Roma, Portuense'],ostia:['Ostia','Acilia','Infernetto','Roma, EUR'],castelporziano:['Acilia','Ostia','Torvaianica','Roma, Garbatella'],
    torvaianica:['Torvaianica','Pomezia','Ardea','Roma, Laurentino'],anzio:['Anzio','Nettuno','Lavinio','Aprilia'],latina:['Latina','Borgo Sabotino','Cisterna di Latina','Sermoneta'],sabaudia:['Sabaudia','San Felice Circeo','Terracina','Pontinia']};
  const tw=TOWNS[(SPOT.id||'').replace(/^g_/,'')]||TOWNS.castelporziano;
  defs.forEach((d,k)=>d.per={...PERS[k],town:tw[k%tw.length]});defs.length=Math.min(defs.length,SPOT.npcs||4);
  for(const d of defs){const a={per:d.per,bag:Array.from({length:Math.floor(rnd(0,3))},()=>npcFish(d.per.bait)),obj:makeAngler(d.col),pose:JSON.parse(JSON.stringify(POSES.sit)),target:'sit',walk:0,moving:false,speed:1.2,pos:new T.Vector3(d.x,12*.035,12),rotY:rnd(-.2,.2),holding:-1,reelSpin:0,crank:0,faceTo:null,
      home:{x:d.x,z:12},rods:[],t:rnd(5,30),st:'sit'};scene.add(a.obj);
    const ch=new T.Mesh(new T.BoxGeometry(.42,.03,.36),new T.MeshStandardMaterial({color:'#4b5a36'}));ch.position.set(d.x,12*.035+.56,12.05);scene.add(ch);
    for(const sx of[-1,1])for(const sz of[-1,1]){const l=new T.Mesh(new T.CylinderGeometry(.014,.014,.58,6),MAT.chairF);l.position.set(d.x+sx*.2,12*.035+.28,12.05+sz*.16);scene.add(l);}
    const bk=new T.Mesh(new T.BoxGeometry(.4,.32,.02),ch.material);bk.position.set(d.x,12*.035+.78,12.24);bk.rotation.x=-.2;scene.add(bk);
    for(let k=0;k<2;k++){const x=d.x+(k?2.5:-2.5),sp=makeSpike();sp.position.set(x,ROD_Z*.035,ROD_Z);scene.add(sp);const rod=makeRod();scene.add(rod);
      const r={x,obj:rod,dist:rnd(70,115),bend:0,held:false,line:null,sx:x+rnd(-4,4)};const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(20*3),3));r.line=new T.Line(lg,MAT.line);r.line.frustumCulled=false;scene.add(r.line);placeRodOnSpike(r);a.rods.push(r);}
    NPCS.push(a);}}
const npcGo=(a,x,z,cb)=>{a.walkTarget={x,z,res:cb};a.moving=true;a.target='stand';};
function npcFish(bait){const m=gameDate().getMonth()+1,c=SP.filter(sp=>!sp.crab&&(sp.bait[bait]||0)>0).map(sp=>[sp,(sp.mo[m]||.05)*sp.ab*(sp.bait[bait]||0)]);let u=Math.random()*c.reduce((a,x)=>a+x[1],0)||0;
  for(const [sp,f] of c){u-=f;if(u<=0){const w=sizeOf(sp);return {n:sp.n,w,l:lenOf(sp,w)};}}const sp=SP[4],w=sizeOf(sp);return {n:sp.n,w,l:lenOf(sp,w)};}
// fumetti sopra la testa
function say(a,text,secs=4){if(a.bub){a.obj.remove(a.bub);a.bub.material.map.dispose();}const lines=[];let cur='';for(const w of String(text).split(' ')){if((cur+' '+w).length>26){lines.push(cur);cur=w;}else cur=(cur?cur+' ':'')+w;}lines.push(cur);
  const H=40+lines.length*34,tx=canvasTex(512,H,(g)=>{g.fillStyle='rgba(255,255,255,.93)';g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=3;const r=22;g.beginPath();g.moveTo(r,2);g.arcTo(510,2,510,H-2,r);g.arcTo(510,H-2,2,H-2,r);g.arcTo(2,H-2,2,2,r);g.arcTo(2,2,510,2,r);g.fill();g.stroke();
    g.fillStyle='#1c2430';g.font='600 28px Outfit,sans-serif';g.textAlign='center';lines.forEach((l,i)=>g.fillText(l,256,44+i*34));});
  const sp=new T.Sprite(new T.SpriteMaterial({map:tx,depthTest:false,transparent:true}));sp.scale.set(1.6,1.6*H/512,1);sp.position.y=2.35;sp.renderOrder=10;a.obj.add(sp);a.bub=sp;a.bubT=secs;}
const NPC_LINES={
  greet:a=>pick([`Ciao! Io sono ${a.per.name}.`,...(window.GP_NAME?[`Ciao ${window.GP_NAME}! Io sono ${a.per.name}.`,`Oh, ${window.GP_NAME}! Come va?`]:[]),'Buongiorno! Come va da te?','Allora, abboccano?','Ciao collega!']),
  catch:(a,f)=>pick([`Presa! ${f.n} da ${Math.round(f.l)} cm!`,`Eccola! ${f.n}!`,`${f.n}! Finalmente…`]),
  miss:()=>pick(['Niente, mi ha pulito l\'amo.','Granchi maledetti!','Era solo l\'onda…','Mancato!']),
  chat:()=>pick(['Hai visto che mare?','Da te abboccano?','Stanotte ho preso una spigola!','Hai un piombo da 150?','Domani gira il vento…','Passami un bibi, va.','Il caffè è finito?']),
  eat:()=>pick(['Panino con la porchetta…','Un caffè ci vuole.','Mo\' mangio, poi rilancio.'])};
function updNpcs(dt,t){const w=wxAt(st.gt);
  for(const [ai,a] of NPCS.entries()){a.t-=dt;if(a.bub){a.bubT-=dt;if(a.bubT<=0){a.obj.remove(a.bub);a.bub=null;}}
    if(a.t<=0&&!a.moving){const r=a.rods[Math.floor(Math.random()*2)],u=Math.random(),dP=a.pos.distanceTo(AN.pos);
      if(a.st==='sit'){a.eating=0;
        if(u<.35){a.st='going';npcGo(a,r.x+.6,ROD_Z+1.3,()=>{a.faceTo=0;a.st='atrod';a.cur=r;a.t=rnd(2,6);});}
        else if(u<.5){a.st='sitEat';a.eating=rnd(25,50);a.t=a.eating;say(a,NPC_LINES.eat(),3);}
        else if(u<.62&&dP<60){a.st='visit';const ox=AN.pos.x+(a.pos.x>AN.pos.x?2.2:-2.2);npcGo(a,ox,clamp(AN.pos.z+.5,.5,24),()=>{a.st='visiting';a.t=rnd(15,28);say(a,NPC_LINES.greet(a));});}
        else if(u<.75){const o=NPCS[(ai+1+Math.floor(Math.random()*(NPCS.length-1)))%NPCS.length];if(o.st==='sit'||o.st==='sitEat'){a.st='visitNpc';a.other=o;npcGo(a,o.pos.x+1.6,o.pos.z-.6,()=>{a.st='chatting';a.t=rnd(14,26);a.chatT=0;});}else a.t=rnd(10,30);}
        else if(u<.85){a.st='stroll';npcGo(a,a.home.x+rnd(-14,14),rnd(1.5,4),()=>{a.faceTo=0;a.st='watch';a.t=rnd(6,15);});}
        else a.t=rnd(20,60);}
      else if(a.st==='sitEat'){a.st='sit';a.eating=0;a.t=rnd(15,40);}
      else if(a.st==='atrod'){if(Math.random()<.45){a.target='bend';a.st='reel';a.t=1.2;}else{a.st='watch';a.t=rnd(4,12);}}
      else if(a.st==='reel'){const r2=a.cur;if(!r2.held){r2.held=true;a.holding=0;a.target='reel';a.reelSpin=1;a.t=rnd(5,9);}else{r2.held=false;a.holding=-1;a.reelSpin=0;placeRodOnSpike(r2);a.target='stand';a.st='watch';a.t=rnd(3,8);r2.dist=rnd(70,115);
        if(Math.random()<.35){const f=npcFish(a.per.bait);a.bag.push(f);say(a,NPC_LINES.catch(a,f),4.5);}else if(Math.random()<.4)say(a,NPC_LINES.miss(),3);}}
      else if(a.st==='visiting'||a.st==='chatting'||a.st==='watch'||a.st==='stand'){a.other=null;a.st='back';npcGo(a,a.home.x,a.home.z-.05,()=>{a.faceTo=0;a.target='sit';a.st='sit';a.t=rnd(25,80);});}}
    // chiacchiere tra vicini; chi è vicino a te si gira verso di te
    if(a.st==='chatting'&&a.other){a.faceTo=Math.atan2(-(a.other.pos.x-a.pos.x),-(a.other.pos.z-a.pos.z));a.chatT-=dt;if(a.chatT<=0){a.chatT=rnd(3.5,6);const who=Math.random()<.5?a:a.other;if(!who.bub)say(who,NPC_LINES.chat(),3.2);}}
    else if(!a.moving&&a.st!=='reel'&&AN.pos.distanceTo(a.pos)<5)a.faceTo=Math.atan2(-(AN.pos.x-a.pos.x),-(AN.pos.z-a.pos.z));else if(!a.moving&&a.faceTo!==0&&a.st!=='reel'&&AN.pos.distanceTo(a.pos)>=5)a.faceTo=0;
    moveActor(a,dt);lerpPose(dt,6,a);applyPose(t,a);
    // mangia: la mano porta il panino alla bocca
    if(!a.sand){a.sand=new T.Mesh(new T.BoxGeometry(.09,.04,.06),new T.MeshStandardMaterial({color:'#d9b27a'}));a.sand.position.set(0,-.05,-.03);a.obj.userData.J.rHand.add(a.sand);}a.sand.visible=a.eating>0;
    if(a.eating>0&&a.target==='sit'){const J=a.obj.userData.J,k=Math.max(0,Math.sin(t*1.3+ai));J.rSh.rotation.x=.35+k*1.25;J.rSh.rotation.z=-.35*k;J.rEl.rotation.x=.9+k*1.2;J.head.rotation.x=-.1+k*.1;}
    if(a.reelSpin){a.crank+=dt*7;}
    for(const r of a.rods){const swell=Math.sin(t*2*Math.PI/Math.max(3,w.wper||5)+r.x)*(w.wave||.3)*.12;r.bend=lerp(r.bend,(r.held?.5+Math.sin(t*3)*.15:.12)+swell,.2);bendRod(r.obj,r.bend);
      if(r.held){rodInHand(r,a);r.obj.userData.rotor.rotation.y+=dt*22;r.obj.userData.lineOn.rotation.y+=dt*22;r.dist=Math.max(5,r.dist-dt*6);}
      r.obj.userData.glow.visible=night()>.25;
      const tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const L=r.line.geometry.attributes.position;
      for(let i=0;i<20;i++){const u=i/19;L.setXYZ(i,lerp(tip.x,r.sx,u),lerp(tip.y,-.02,u)-Math.sin(u*Math.PI)*.8,lerp(tip.z,-r.dist,u));}L.needsUpdate=true;}
    a.obj.userData.J.lamp.material.emissiveIntensity=night()>.5?2:0;}}
function respawnCloud(sp,first){const a=rnd(-Math.PI,Math.PI),d=rnd(700,3000);sp.position.set(Math.sin(a)*d,rnd(160,520),-Math.cos(a)*d);
  sp.userData.w=rnd(700,1400);sp.userData.h=rnd(240,440);sp.userData.life=first?Math.random():0;sp.userData.dur=rnd(900,2400);sp.userData.ph=Math.random()*6.3;sp.userData.vis=0;
  if(!first){sp.material.map.dispose();sp.material.map=cloudTex(Math.floor(Math.random()*1e6));sp.material.needsUpdate=true;}}
let CRABS=[];
function makeCrab(){const g=new T.Group(),m=new T.MeshStandardMaterial({color:'#b07a48',roughness:.7}),b=new T.Mesh(new T.SphereGeometry(.045,10,8),m);b.scale.set(1.2,.45,.85);b.position.y=.025;g.add(b);
  for(const sx of[-1,1]){for(let k=0;k<3;k++){const l=new T.Mesh(new T.CylinderGeometry(.004,.003,.06,4),m);l.position.set(sx*.05,.015,(k-1)*.022);l.rotation.z=sx*1.1;g.add(l);}
    const c=new T.Mesh(new T.SphereGeometry(.016,8,6),new T.MeshStandardMaterial({color:'#c8643c',roughness:.6}));c.scale.set(1.4,.7,1);c.position.set(sx*.035,.025,-.055);g.add(c);}
  g.userData={vx:0,t:0,hid:0};return g;}
function buildCrabs(){CRABS=[];for(let i=0;i<7;i++){const c=makeCrab();c.position.set(rnd(-25,25),0,rnd(-.2,1.2));c.rotation.y=rnd(0,6);scene.add(c);CRABS.push(c);}}
function updCrabs(dt,t){const nightK=night();for(const c of CRABS){const u=c.userData;u.t-=dt;
    if(u.hid>0){u.hid-=dt;c.visible=false;if(u.hid<=0){c.position.set(AN.pos.x+rnd(-14,14),0,rnd(-.2,1.2));}continue;}c.visible=true;
    if(u.t<=0){u.vx=Math.random()<.35?0:rnd(-.6,.6)*(1+nightK);u.t=rnd(.6,2.5);if(Math.random()<.08)u.hid=rnd(8,30);}
    // camminano di lato, seguono la risacca e si fermano ogni tanto
    c.position.x+=u.vx*dt;c.position.z=clamp(c.position.z+Math.sin(t*.8+c.id)*dt*.15,-.3,1.3);c.position.y=Math.max(sandY(c.position.z),-.02)+.005;c.rotation.y=Math.PI/2+Math.sin(t*3+c.id)*.15;
    if(Math.abs(c.position.x-AN.pos.x)>40)u.hid=1;}}
function nearCrab(){let best=null,bd=1.6;for(const c of CRABS){if(!c.visible)continue;const d=Math.hypot(c.position.x-AN.pos.x,c.position.z-AN.pos.z);if(d<bd){bd=d;best=c;}}return best;}
G.crab=()=>seq(async()=>{const c=nearCrab();if(!c)return;st.phase='busy';setUI();const fc=Math.atan2(-(c.position.x-AN.pos.x),-(c.position.z-AN.pos.z));AN.faceTo=fc;pose('bend');await sleep(.7);
  c.userData.hid=rnd(15,40);c.visible=false;st.inv.granchio++;click();pose('stand');AN.faceTo=null;st.msg=`🦀 Preso un granchio! Ne hai ${st.inv.granchio} da innescare.`;st.phase='wait';setUI();});
function cooler(x,z,ry,c1='#2f6fb5'){const g=new T.Group(),b=new T.Mesh(new T.BoxGeometry(.5,.32,.32),new T.MeshStandardMaterial({color:c1,roughness:.5}));b.position.y=.16;g.add(b);
  const lid=new T.Mesh(new T.BoxGeometry(.52,.06,.34),new T.MeshStandardMaterial({color:'#f2f2f2',roughness:.5}));lid.position.y=.34;g.add(lid);const h=new T.Mesh(new T.TorusGeometry(.12,.012,6,12,Math.PI),MAT.chairF);h.position.y=.37;g.add(h);
  g.position.set(x,Math.max(0,z*.035),z);g.rotation.y=ry;g.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(g);return g;}
function lantern(x,z,light){const g=new T.Group(),base=new T.Mesh(new T.CylinderGeometry(.06,.07,.04,12),MAT.reel);base.position.y=.02;g.add(base);
  const glass=new T.Mesh(new T.CylinderGeometry(.05,.05,.14,12),new T.MeshStandardMaterial({color:'#fff7d6',emissive:'#ffd27a',emissiveIntensity:0,transparent:true,opacity:.85}));glass.position.y=.11;g.add(glass);
  const top=new T.Mesh(new T.ConeGeometry(.07,.05,12),MAT.reel);top.position.y=.205;g.add(top);g.position.set(x,Math.max(0,z*.035),z);scene.add(g);g.userData.glass=glass;
  if(light){const pl=new T.PointLight(0xffc870,0,9,2);pl.position.y=.25;g.add(pl);g.userData.pl=pl;}LANTERNS.push(g);return g;}
let LANTERNS=[];
function buildGear(){LANTERNS=[];const y=CHAIR.z;MYG.push(cooler(CHAIR.x-1.3,y+.4,.3));const myL=lantern(CHAIR.x+.95,y-.6,true);MYG.push(myL);
  const th=new T.Mesh(new T.CylinderGeometry(.04,.04,.3,12),new T.MeshStandardMaterial({color:'#9aa3ad',metalness:.7,roughness:.3}));th.position.set(CHAIR.x-.55,y*.035+.15,y+.35);th.castShadow=true;scene.add(th);MYG.push(th);
  // porta-esche e telo per l'attrezzatura
  const telo=new T.Mesh(new T.PlaneGeometry(1.6,1.1),new T.MeshStandardMaterial({color:'#6b5a3a',roughness:1}));telo.rotation.x=-Math.PI/2;telo.position.set(CHAIR.x+.4,y*.035+.01,y+.2);telo.receiveShadow=true;scene.add(telo);MYG.push(telo);
  for(const a of NPCS){cooler(a.home.x+1.1,a.home.z+.35,rnd(-.5,.5),pick(['#c0392b','#2f6fb5','#3a8a5a','#d9b24a']));lantern(a.home.x-.8,a.home.z-.4,false);
    const b=new T.Mesh(new T.CylinderGeometry(.15,.12,.28,14),MAT.bucket);b.position.set(a.home.x-.6,a.home.z*.035+.14,a.home.z+.5);b.castShadow=true;scene.add(b);
    const bag=new T.Mesh(new T.BoxGeometry(.4,.3,.25),new T.MeshStandardMaterial({color:pick(['#4a5a32','#3d434b','#5a3a2a']),roughness:.9}));bag.position.set(a.home.x+.4,a.home.z*.035+.15,a.home.z+.9);bag.castShadow=true;scene.add(bag);}}
// paesaggio: scogli, cabine degli stabilimenti, pontile, Circeo all'orizzonte, navi, case
/* ---------- luoghi caratteristici della costa: nella guida e, se vicini, anche dalla spiaggia ---------- */
const LMK=[
  {t:'tower',n:'Torre di Montalto',lat:42.3305,lon:11.5868},
  {t:'port',n:'Porto di Civitavecchia',lat:42.0965,lon:11.7838,ferry:1},
  {t:'fort',n:'Forte Michelangelo',lat:42.0942,lon:11.7928},
  {t:'castle',n:'Castello Odescalchi',lat:42.0347,lon:11.8527},
  {t:'castle',n:'Castello di Santa Severa',lat:42.0172,lon:11.9622},
  {t:'tower',n:'Torre Flavia',lat:41.9586,lon:12.0452,sea:1},
  {t:'lighthouse',n:'Vecchio Faro di Fiumicino',lat:41.7688,lon:12.2357},
  {t:'port',n:'Porto di Roma',lat:41.7392,lon:12.2493},
  {t:'pier',n:'Pontile di Ostia',lat:41.7324,lon:12.2773},
  {t:'dune',n:'Dune di Castel Porziano',lat:41.6765,lon:12.3832},
  {t:'tower',n:'Torre San Lorenzo',lat:41.5603,lon:12.5306},
  {t:'port',n:'Porto di Anzio',lat:41.4468,lon:12.6262},
  {t:'fort',n:'Forte Sangallo',lat:41.4578,lon:12.6594},
  {t:'dune',n:'Dune del Circeo',lat:41.33,lon:12.95},
  {t:'tower',n:'Torre Paola',lat:41.2448,lon:13.0338},
  {t:'lighthouse',n:'Faro di Capo Circeo',lat:41.2236,lon:13.0627},
  {t:'port',n:'Porto di San Felice',lat:41.2262,lon:13.0944},
  {t:'temple',n:'Tempio di Giove Anxur',lat:41.2918,lon:13.2563},
  {t:'port',n:'Porto di Terracina',lat:41.2838,lon:13.2478},
  {t:'tower',n:'Torre Truglia',lat:41.2586,lon:13.4322},
  {t:'castle',n:'Castello di Gaeta',lat:41.2113,lon:13.5742},
  {t:'port',n:'Porto di Gaeta',lat:41.2165,lon:13.5795},
  {t:'tower',n:'Torre di Mola',lat:41.2573,lon:13.6113}];
// modello in metri: il mare è verso -z, la terra verso +z
function lmModel(L){const g=new T.Group(),m=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.85,...o}),add=(geo,mat,x,y,z)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);g.add(o);return o;};
  const stone=m('#c9b391'),white=m('#f4f2ec'),red=m('#c0392b'),t=L.t;
  if(t==='tower'){if(L.sea)add(new T.CylinderGeometry(9,10,3,10),m('#8d8577'),0,1.5,0);add(new T.CylinderGeometry(4.5,5.4,18,12),stone,0,9+(L.sea?2:0),0);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;add(new T.BoxGeometry(1.6,1.6,1.2),stone,Math.cos(a)*4.6,18.8+(L.sea?2:0),Math.sin(a)*4.6);}}
  else if(t==='lighthouse'){add(new T.BoxGeometry(9,6,9),white,0,3,0);add(new T.CylinderGeometry(2.2,3,30,14),white,0,21,0);[12,22].forEach(y=>add(new T.CylinderGeometry(2.75,2.95,3,14),red,0,y,0));
    add(new T.CylinderGeometry(3.6,3.6,.6,14),m('#333'),0,36.3,0);add(new T.CylinderGeometry(1.8,1.8,3.2,10),m('#fff6c0',{emissive:'#ffd24a',emissiveIntensity:1.2}),0,38.2,0);add(new T.ConeGeometry(2.4,2.6,10),red,0,41,0);}
  else if(t==='castle'||t==='fort'){const c=t==='fort'?m('#b99d78'):stone,S2=t==='fort'?40:46,H=t==='fort'?11:13;
    [[0,-S2/2,S2,3],[0,S2/2,S2,3],[-S2/2,0,3,S2],[S2/2,0,3,S2]].forEach(([x,z,w,d])=>add(new T.BoxGeometry(w,H,d),c,x,H/2,z));
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>add(t==='fort'?new T.CylinderGeometry(7,8,H+1,6):new T.CylinderGeometry(5,5.5,H+6,12),c,a*S2/2,(t==='fort'?H+1:H+6)/2,b*S2/2));
    if(t==='castle'){add(new T.BoxGeometry(14,26,14),c,4,13,4);add(new T.BoxGeometry(14.5,1.2,14.5),m('#9c8a6c'),4,26.6,4);}else add(new T.BoxGeometry(S2-6,.8,S2-6),m('#8a7a5e'),0,H-1,0);}
  else if(t==='temple'){add(new T.ConeGeometry(260,150,9),m('#6f7d4c'),0,75,90);const top=150;add(new T.BoxGeometry(70,8,26),stone,0,top+2,20);
    for(let i=0;i<12;i++){add(new T.BoxGeometry(3.2,14,3.2),stone,-30+i*5.45,top+13,10);}add(new T.BoxGeometry(68,3,6),stone,0,top+21.5,10);}
  else if(t==='pier'){const pm=m('#a39c90');add(new T.BoxGeometry(7,1,320),pm,0,2.2,-160);for(let i=0;i<16;i++)add(new T.CylinderGeometry(.5,.5,6,8),pm,0,-.5,-i*20);add(new T.CylinderGeometry(16,16,1.2,24),pm,0,2.3,-326);
    for(let i=0;i<8;i++)add(new T.CylinderGeometry(.12,.12,4,5),m('#333'),3.2*(i%2?1:-1),4.5,-i*40);}
  else if(t==='port'){const bw=m('#9a958c');add(new T.BoxGeometry(14,5,300),bw,-170,1.5,-150);add(new T.BoxGeometry(220,5,14),bw,-60,1.5,-300);add(new T.BoxGeometry(14,5,200),bw,170,1.5,-100);
    add(new T.CylinderGeometry(2,2,10,10),red,50,6,-300);add(new T.CylinderGeometry(2,2,10,10),m('#2e9b4f'),170,6,-200);
    const hull=m('#f7f7f2');for(let i=0;i<16;i++){const x=-140+(i%8)*36,z=-40-Math.floor(i/8)*60;add(new T.BoxGeometry(4,2.2,12),i%3?hull:m('#2b62c9'),x,1,z);add(new T.CylinderGeometry(.15,.15,13,4),m('#ddd'),x,8,z);}
    if(L.ferry)for(let k=0;k<2;k++){const f=new T.Group(),h=new T.Mesh(new T.BoxGeometry(26,14,170),m('#f2f2f2'));h.position.y=6;f.add(h);const st=new T.Mesh(new T.BoxGeometry(26.4,2,170.4),m('#1f4fa0'));st.position.y=3;f.add(st);
      const sup=new T.Mesh(new T.BoxGeometry(22,10,90),m('#ffffff'));sup.position.set(0,18,10);f.add(sup);const fn=new T.Mesh(new T.CylinderGeometry(3,3.4,10,12),m('#d23a2a'));fn.position.set(0,27,-20);f.add(fn);
      f.position.set(-60+k*110,0,-140-k*40);f.rotation.y=Math.PI/2*(k?1:.9);g.add(f);}}
  else if(t==='dune'){const sd=m('#e6d09b'),gr=m('#7b8f4c');for(let i=0;i<26;i++){const d=new T.Mesh(new T.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI/2),sd);d.scale.set(rnd(25,55),rnd(5,11),rnd(14,24));d.position.set(rnd(-400,400),0,rnd(-10,40));g.add(d);
      for(let k=0;k<4;k++)add(new T.SphereGeometry(rnd(1.5,3),6,4),gr,d.position.x+rnd(-15,15),d.scale.y*.8,d.position.z+rnd(-8,8));}}
  return g;}
function azPos(lat,lon){const dy=(lat-SPOT.lat)*110570,dx=(lon-SPOT.lon)*111320*Math.cos(SPOT.lat*R),d=Math.hypot(dx,dy),az=(Math.atan2(dx,dy)/R+360)%360,a=(az-FACE)*R;return {x:Math.sin(a)*d,z:-Math.cos(a)*d,d};}
function buildLandmarks(){const rm=new T.MeshStandardMaterial({color:'#6f6a62',roughness:.95});
  if(SPOT.rocks){for(let i=0;i<Math.round(60*SPOT.rocks);i++){const r=new T.Mesh(new T.DodecahedronGeometry(rnd(.3,1.3),0),rm);const x=rnd(-120,120),z=rnd(-10,3);r.position.set(x,sandY(z)+rnd(-.1,.3),z);r.scale.y=rnd(.4,.8);r.rotation.set(rnd(0,3),rnd(0,3),0);r.castShadow=true;scene.add(r);}
    for(let k=0;k<3;k++){const g=new T.Group(),x0=rnd(-90,90);for(let i=0;i<14;i++){const r=new T.Mesh(new T.DodecahedronGeometry(rnd(.8,2),0),rm);r.position.set(x0+rnd(-3,3),rnd(-.6,.6),-rnd(12,40)*(i/14));g.add(r);}scene.add(g);}}
  if(SPOT.huts){const cols=['#2f6fb5','#e8e2d0','#c0392b','#2f8a5a','#d9b24a'];for(let i=0;i<22;i++){const x=-110+i*10+rnd(-1,1);if(Math.abs(x)<14)continue;const c=new T.Mesh(new T.BoxGeometry(1.4,2.2,1.4),new T.MeshStandardMaterial({color:cols[i%5],roughness:.8}));c.position.set(x,1.1+22*.035,22);c.castShadow=true;scene.add(c);
    const rf=new T.Mesh(new T.ConeGeometry(1.15,.6,4),new T.MeshStandardMaterial({color:'#8a6a48'}));rf.rotation.y=Math.PI/4;rf.position.set(x,2.5+22*.035,22);scene.add(rf);
    if(i%2){const u=new T.Group(),pole=new T.Mesh(new T.CylinderGeometry(.03,.03,2.3,6),MAT.chairF);pole.position.y=1.15;u.add(pole);const cl=new T.Mesh(new T.ConeGeometry(.2,1.4,8),new T.MeshStandardMaterial({color:cols[(i+2)%5]}));cl.position.y=1.9;u.add(cl);u.position.set(x+3,18*.035,18);scene.add(u);}}}
  if(SPOT.pier&&!LMK.some(L=>L.t==='pier'&&azPos(L.lat,L.lon).d<4000)){const pm=new T.MeshStandardMaterial({color:'#9a9488',roughness:.9}),pier=new T.Mesh(new T.BoxGeometry(8,1,260),pm);pier.position.set(380,1.5,-110);scene.add(pier);
    for(let i=0;i<14;i++){const pl=new T.Mesh(new T.CylinderGeometry(.4,.4,5,8),pm);pl.position.set(380,-1,10-i*19);scene.add(pl);}const rot=new T.Mesh(new T.CylinderGeometry(14,14,1.2,24),pm);rot.position.set(380,1.6,-245);scene.add(rot);}
  if(SPOT.city||SPOT.huts){const bm=new T.MeshStandardMaterial({color:'#d8cfc0',roughness:.9});for(let i=0;i<40;i++){const side=i%2?1:-1,x=side*rnd(250,1400),z=rnd(30,500),h=rnd(6,28);if(!SPOT.city&&Math.abs(x)<600)continue;const b=new T.Mesh(new T.BoxGeometry(rnd(10,24),h,rnd(10,20)),bm);b.position.set(x,h/2,z);scene.add(b);}}
  if(SPOT.ship){const sm=new T.MeshStandardMaterial({color:'#3a3f48',roughness:.7});for(let i=0;i<2;i++){const g=new T.Group(),h=new T.Mesh(new T.BoxGeometry(180,18,28),sm);g.add(h);const bd=new T.Mesh(new T.BoxGeometry(40,24,26),new T.MeshStandardMaterial({color:'#e9e9e9'}));bd.position.set(60,20,0);g.add(bd);g.position.set(rnd(-1500,1500),8,-rnd(2500,4500));g.rotation.y=rnd(-.3,.3);scene.add(g);}}
  // luoghi caratteristici vicini: vecchio faro, pontile, porti e navi, castelli, torri, tempio
  for(const L of LMK){if(L.t==='dune')continue;const p=azPos(L.lat,L.lon);if(p.d>14000)continue;const g=lmModel(L),k=1+Math.max(0,(p.d-500)/700);g.scale.setScalar(k);
    // la spiaggia del gioco è una riva dritta: castelli, torri e fari restano sulla terraferma (la costa vera curva), porti e pontili partono dalla riva
    const z=L.sea?Math.max(p.z,-60):L.t==='pier'||L.t==='port'?Math.max(p.z,0):Math.max(p.z,40+25*k);g.position.set(p.x,0,z);scene.add(g);}
  // il Circeo all'orizzonte (da Anzio a Sabaudia)
  const c=azPos(CIRCEO.lat,CIRCEO.lon);if(c.d>2000&&c.d<70000&&c.z<1000){const k=Math.min(1,9000/c.d),m=new T.Mesh(new T.ConeGeometry(2400*k*2.2,CIRCEO.h*1.3*k*2,7,1),new T.MeshStandardMaterial({color:'#4f5a52',roughness:1}));const sc=Math.min(1,6000/c.d);m.position.set(c.x*sc,CIRCEO.h*k*.6,Math.max(c.z*sc,0)+2000*k);m.scale.set(.75,1,.4);scene.add(m);}}
function setupRods(){st.rods.forEach(r=>{scene.remove(r.hit);scene.remove(r.obj);scene.remove(r.spike);scene.remove(r.line);scene.remove(r.sinker);});
  st.rods=Array.from({length:st.nRods},(_,i)=>{const x=rodX(i,st.nRods),spike=makeSpike();spike.position.set(x,ROD_Z*.035,ROD_Z);scene.add(spike);
    const obj=makeRod();scene.add(obj);const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(40*3),3));const line=new T.Line(lg,MAT.line);line.frustumCulled=false;scene.add(line);
    const sinker=new T.Mesh(new T.SphereGeometry(.05,8,6),MAT.lead);sinker.visible=false;scene.add(sinker);
    const hit=new T.Mesh(new T.CylinderGeometry(.6,.6,4.6,8),new T.MeshBasicMaterial({visible:false}));hit.position.set(x,2,ROD_Z-1.1);hit.rotation.x=-40*R;scene.add(hit);
    return {lead:st.lead,hook:st.hook,rig:'lungo',broken:false,dismantled:false,i,x,spike,obj,line,sinker,hit,bait:null,dist:0,state:'idle',baitLeft:0,bend:0,bitePlan:null,held:false,sx:x,sz:-1};});}
function placeRodOnSpike(r){const by=ROD_Z*.035;r.obj.position.set(r.x,by+.12,ROD_Z);r.obj.rotation.set(-40*R,0,0,'YXZ');}
function rodInHand(r,a=AN){const J=a.obj.userData.J,hp=new T.Vector3();J.rHand.getWorldPosition(hp);const p=a.pose.rod||{p:45,f:0,y:0};
  r.obj.rotation.set((p.p-90)*R,a.rotY+(p.y||0),0,'YXZ');const dir=new T.Vector3(0,1,0).applyEuler(r.obj.rotation);r.obj.position.copy(hp).addScaledVector(dir,-.5);}

/* ---------- viaggio in auto lungo la costa del Lazio (vista dall'alto) ---------- */
const MP={zoom:42};
const LAT0=41.75,LON0=12.4,KX=111.32*Math.cos(41.75*R),KY=110.57;
const PJ=(lat,lon)=>[(lon-LON0)*KX,(lat-LAT0)*KY];
async function startMap(){st.phase='map';
  ['#gspd','#glamp','#gjoy'].forEach(q=>{const e=root.querySelector(q);if(e)e.style.display='none';});hud.innerHTML='';
  const c=document.createElement('canvas');c.id='gmapc';root.insertBefore(c,root.firstChild);MP.c=c;MP.g=c.getContext('2d');
  ui.innerHTML='<div class="gpanel"><b>🚗 Lazio</b><div class="gs">Carico la costa…</div></div>';
  const r0=root,from=MP.from;MP.from=null;const posP=from?Promise.resolve(null):gamePos();let C=null;try{C=await window.costa();}catch(e){}if(root!==r0)return;
  if(!C){ui.innerHTML=`<div class="gpanel"><b>Mappa non disponibile</b><div class="gs">Scegli direttamente lo spot.</div><div class="gtalk">${SPOTS.map((sp,i)=>`<button class="gc" onclick="GAME.arrive(${i})">${sp.name}</button>`).join('')}</div></div>`;return;}
  const pts=[],segs=[];
  for(const l of C.L){const p=l.p;let seg=[];for(let i=0;i+1<p.length;i+=2){const lon=p[i],lat=p[i+1];if(lat>40.95&&lat<42.42&&lon>11.45&&lon<13.95){const q=PJ(lat,lon);pts.push(q);seg.push(q);}else if(seg.length){segs.push(seg);seg=[];}}if(seg.length>1)segs.push(seg);}
  const A=PJ(42.32,11.6),Bq=PJ(41.2,13.1),L0=Math.hypot(Bq[0]-A[0],Bq[1]-A[1]),ax=[(Bq[0]-A[0])/L0,(Bq[1]-A[1])/L0],sn=[ax[1],-ax[0]];// sn: direzione media verso il mare
  const sm=(arr,w)=>arr.map((_,i)=>{let x=0,y=0,n=0;for(let j=Math.max(0,i-w);j<=Math.min(arr.length-1,i+w);j++){x+=arr[j][0];y+=arr[j][1];n++;}return [x/n,y/n];});
  MP.segs=segs;
  // costa continua: unisco i tratti della terraferma in ordine da Montalto fino a Minturno (Garigliano)
  const key=q=>q[0].toFixed(3)+','+q[1].toFixed(3),byStart=new Map();segs.forEach(sg=>{if(sg.length>1)byStart.set(key(sg[0]),sg);});
  let chain=[];for(const sg of segs){if(sg.length<2)continue;let c=[...sg],cur=sg,guard=0;while(guard++<200){const nx=byStart.get(key(cur[cur.length-1]));if(!nx||nx===sg)break;c=c.concat(nx.slice(1));cur=nx;}if(c.length>chain.length)chain=c;}
  chain.reverse();const ML=PJ(41.25,13.79)[0];chain=chain.filter(q=>q[0]<ML);
  {const rs=[chain[0]];for(let i=1;i<chain.length;i++){const a=chain[i-1],b=chain[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.1));for(let k=1;k<=n;k++)rs.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)]);}chain=rs;}
  const cs=sm(sm(chain,6),6),bend=sm(sm(chain,15),15);
  // la strada: costa molto smussata spostata verso terra (la terra è a sinistra andando verso sud-est)
  const lnorm=(P,i)=>{const a=P[Math.max(0,i-3)],b=P[Math.min(P.length-1,i+3)],x=b[0]-a[0],y=b[1]-a[1],l=Math.hypot(x,y)||1;return [-y/l,x/l];};
  let road=bend.map((q,i)=>{const n=lnorm(bend,i);return [q[0]+n[0]*.45,q[1]+n[1]*.45];});
  // ogni punto va verso l'interno finché è sulla terraferma e ad almeno 300 m da qualsiasi tratto di costa (anche moli e porti)
  // terraferma = dentro il poligono chiuso dalla costa e da una linea 60 km all'interno
  const PG=chain.filter((_,i)=>i%4===0);{const a=PG[0],b=PG[PG.length-1],na=lnorm(chain,0),nb=lnorm(chain,chain.length-1);PG.push([b[0]+nb[0]*60,b[1]+nb[1]*60],[a[0]+na[0]*60,a[1]+na[1]*60]);}
  const onLand=q=>{let c=false;for(let i=0,j=PG.length-1;i<PG.length;j=i++){const a=PG[i],b=PG[j];if((a[1]>q[1])!==(b[1]>q[1])&&q[0]<(b[0]-a[0])*(q[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  const inland=(r,n)=>{let q=r;for(let k=0;k<120;k++){if(onLand(q)){const c=coastNear(q,.3);if(!c||c.d>=.3)break;}q=[q[0]+n[0]*.05,q[1]+n[1]*.05];}return q;};
  // toglie gli anelli: se la strada si incrocia, salta il tratto in mezzo
  const unloop=P=>{const X=(a,b,c,d)=>{const r=(b[0]-a[0])*(d[1]-c[1])-(b[1]-a[1])*(d[0]-c[0]);if(Math.abs(r)<1e-12)return false;const t=((c[0]-a[0])*(d[1]-c[1])-(c[1]-a[1])*(d[0]-c[0]))/r,u=((c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0]))/r;return t>0&&t<1&&u>0&&u<1;};
    const out=[];for(let i=0;i<P.length;i++){out.push(P[i]);for(let j=Math.min(P.length-2,i+400);j>i+1;j--){if(X(P[i],P[i+1],P[j],P[j+1])){i=j;break;}}}return out;};
  for(let it=0;it<3;it++){const P=road;road=sm(unloop(P.map((q,i)=>inland(q,lnorm(P,i)))),it<2?4:1);}road=unloop(road.map((q,i)=>inland(q,lnorm(road,i))));
  const cum=[0];for(let i=1;i<road.length;i++)cum.push(cum[i-1]+Math.hypot(road[i][0]-road[i-1][0],road[i][1]-road[i-1][1]));
  Object.assign(MP,{segs,coast:cs,road,cum,len:cum[cum.length-1],sn,towns:(C.T||[]).filter(t=>t[1]>41.12&&t[1]<42.42&&t[2]>11.45&&t[2]<13.78&&!/Diocese|bishopric|Archidiocese/i.test(t[0]))});
  MP.spots=SPOTS.map(sp=>{const q=PJ(sp.lat,sp.lon);let bi=0,bd=1e9;road.forEach((r,i)=>{const d=Math.hypot(r[0]-q[0],r[1]-q[1]);if(d<bd){bd=d;bi=i;}});return {sp,q,s:cum[bi]};});
  const last=LSG('spot','castelporziano'),ls=MP.spots.find(x=>x.sp.id===last)||MP.spots.find(x=>x.sp.id==='castelporziano');
  MP.car={s:Math.max(0,ls.s-4),v:0,dir:1,acc:0,brk:0,ramp:null};MP.near=-1;MP.parking=null;MP.arm=null;MP.key='';MP.land=landTex();
  // grafica 3D se possibile, altrimenti la mappa disegnata
  const myRoot=root;try{T=await (MP.three||loadThree());if(root!==myRoot||!root.isConnected||st.phase!=='map')return;
    if(!from)ui.innerHTML='<div class="gpanel"><b>🧭 Cerco la tua posizione…</b><div class="gs">Parti da dove sei e la strada ti porta verso la costa.</div></div>';
    const pos=await posP;let ap=null;if(from){const fs=MP.spots.find(x=>x.sp.id===from);if(fs)ap={s:fs.s};}else if(pos){ui.querySelector('b').textContent='🧭 Calcolo la strada verso il mare…';ap=await approachRoute(pos);}
    if(root!==myRoot||!root.isConnected||st.phase!=='map')return;MP.app=null;
    if(ap){MP.car.s=ap.s;MP.car.dir=ls.s>=ap.s?1:-1;if(ap.app){MP.app={...ap.app,s:ap.s};MP.car.app={...ap.app,u:0,dir:MP.car.dir};}}
    c.remove();MP.c=null;build3D();}catch(e){console.warn(e);dispose3D();if(!MP.c){c.id='gmapc';root.insertBefore(c,root.firstChild);MP.c=c;MP.g=c.getContext('2d');}}
  mapUI();sizeMap();addEventListener('resize',sizeMap);let lt=performance.now();
  const step=now=>{if(st.phase!=='map'&&st.phase!=='parking')return;const dt=clamp((now-lt)/1000,0,.05);lt=now;if(M3.on){mapPhys3(dt);draw3D(dt);}else{mapPhys(dt);drawMap(now/1000);}MP.raf=requestAnimationFrame(step);};MP.raf=requestAnimationFrame(step);}
// punto della costa vera più vicino; nei dati OSM qui la terra sta a destra della linea
function coastNear(q,maxD=3){let bd=maxD*maxD,b=null;for(const sg of MP.segs)for(let j=0;j+1<sg.length;j++){const a=sg[j],e=sg[j+1];if(Math.min(a[0],e[0])-q[0]>maxD||q[0]-Math.max(a[0],e[0])>maxD||Math.min(a[1],e[1])-q[1]>maxD||q[1]-Math.max(a[1],e[1])>maxD)continue;const vx=e[0]-a[0],vy=e[1]-a[1],l2=vx*vx+vy*vy||1e-12;const t=clamp(((q[0]-a[0])*vx+(q[1]-a[1])*vy)/l2,0,1),px=a[0]+vx*t,py=a[1]+vy*t,d=(q[0]-px)**2+(q[1]-py)**2;if(d<bd){bd=d;b=[px,py,vx,vy];}}
  if(!b)return null;const [px,py,vx,vy]=b,l=Math.hypot(vx,vy)||1,lx=vy/l,ly=-vx/l;return {px,py,lx,ly,d:Math.sqrt(bd),side:(q[0]-px)*lx+(q[1]-py)*ly};}
function landTex(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#7d9656';g.fillRect(0,0,256,256);
  for(let i=0;i<1800;i++){g.fillStyle=`rgba(${Math.random()<.5?'40,70,30':'160,170,100'},${Math.random()*.25})`;const r=Math.random()*6;g.beginPath();g.arc(Math.random()*256,Math.random()*256,r,0,7);g.fill();}
  for(let i=0;i<30;i++){g.fillStyle=`rgba(${pick(['180,160,90','120,140,70','90,120,60'])},.35)`;g.fillRect(Math.random()*256,Math.random()*256,20+Math.random()*40,14+Math.random()*30);}return c;}
function sizeMap(){const d=Math.min(2,devicePixelRatio||1);MP.d=d;
  if(M3.R){const w=root.clientWidth,h=root.clientHeight;M3.R.setSize(w,h);M3.cam.aspect=w/h;M3.cam.fov=w<h?60:45;M3.cam.updateProjectionMatrix();if(M3.mini){M3.mini.width=90*d;M3.mini.height=140*d;M3.mini.style.width='90px';M3.mini.style.height='140px';M3.mbg=null;}}
  if(!MP.c)return;MP.c.width=root.clientWidth*d;MP.c.height=root.clientHeight*d;MP.c.style.width=root.clientWidth+'px';MP.c.style.height=root.clientHeight+'px';MP.d=d;}
function roadAt(s){const c=MP.cum,r=MP.road;s=clamp(s,0,MP.len);let lo=0,hi=c.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<=s)lo=m;else hi=m;}
  const k=(s-c[lo])/Math.max(1e-6,c[hi]-c[lo]),x=lerp(r[lo][0],r[hi][0],k),y=lerp(r[lo][1],r[hi][1],k),tx=r[hi][0]-r[lo][0],ty=r[hi][1]-r[lo][1],tl=Math.hypot(tx,ty)||1;return {x,y,tx:tx/tl,ty:ty/tl};}
function mapPhys(dt){const c=MP.car;if(MP.parking){const P=MP.parking;P.t+=dt;c.v=Math.max(0,c.v-dt*1.5);if(P.t>1.6&&!P.done){P.done=1;G.arrive(P.i);}return;}
  if(c.acc)c.v+=dt*.45;else c.v-=dt*.08;if(c.brk)c.v-=dt*1.4;c.v=clamp(c.v,0,1.3);c.s=clamp(c.s+c.v*c.dir*dt,0,MP.len);if(c.s<=0||c.s>=MP.len)c.v=0;
  carSound(c.v);
  let ni=-1,nd=.7;MP.spots.forEach((p,i)=>{const d=Math.abs(p.s-c.s);if(d<nd){nd=d;ni=i;}});const slow=c.v<.3;const key=ni+'|'+slow;if(key!==MP.key){MP.key=key;MP.near=ni;MP.slow=slow;mapPark();}
  const sp=document.getElementById('gkmh');if(sp)sp.textContent=Math.round(c.v/1.3*130)+' km/h';}
function mapUI(){ui.innerHTML=`<div class="gpanel slim"><div class="grow" style="justify-content:space-between"><b style="font-size:16px">🚗 Lungo la costa del Lazio</b><b id="gkmh">0 km/h</b></div>
  <div id="gpark" class="gs" style="min-height:22px"></div>
  <div class="grow"><button class="gb" id="gbrk" style="flex:1;background:#4a1f26">🛑 Frena</button><button class="gb big" id="gacc" style="flex:2">⬆ Accelera</button></div>
  <div class="grow" style="justify-content:center"><button class="gc" onclick="GAME.flip()">🔄 Inverti senso</button><button class="gc" onclick="GAME.spotList()">📍 Scegli lo spot</button>${M3.on?'<button class="gc" onclick="GAME.mapView()">🎯 Visuale</button>':''}</div>${M3.on?'<div style="font-size:10.5px;opacity:.55;text-align:center;margin-top:4px">Trascina per girare la visuale, due dita per lo zoom · Immagini © Esri, Maxar · Strade © OpenStreetMap (OSRM)</div>':''}</div>`;
  const hold=(id,k)=>{const b=document.getElementById(id);const on=e=>{e.preventDefault();ac();MP.car[k]=1;},off=()=>{MP.car[k]=0;};b.onpointerdown=on;b.onpointerup=off;b.onpointerleave=off;b.onpointercancel=off;};hold('gacc','acc');hold('gbrk','brk');mapPark();}
function mapPark(){const e=document.getElementById('gpark');if(!e)return;const i=MP.near;
  if(i<0){const nx=MP.spots.map((p,k)=>[k,(p.s-MP.car.s)*MP.car.dir]).filter(x=>x[1]>0).sort((a,b)=>a[1]-b[1])[0];e.innerHTML=nx?`Prossimo spot: <b>${MP.spots[nx[0]].sp.name}</b> tra ${nx[1].toFixed(1).replace('.',',')} km`:'Fine della strada: inverti il senso.';return;}
  const n=MP.spots[i].sp.name;e.innerHTML=MP.slow?`<button class="gb big" style="margin:0" onclick="GAME.park(${i})">🅿️ Parcheggia a ${n}</button>`:`🅿️ <b>${n}</b>: rallenta per fermarti`;}
G.flip=()=>{if(MP.car.ramp||MP.car.app)return;if(MP.car.v<.1){MP.car.dir*=-1;MP.key='';MP.arm=null;}else{const e=document.getElementById('gpark');if(e)e.textContent='Fermati prima di invertire.';}};
G.park=i=>{if(MP.car.v>.3)return;MP.parking={i,t:0};st.phase='parking';ui.innerHTML=`<div class="gpanel"><b>🅿️ Parcheggi a ${MP.spots[i].sp.name}</b><div class="gs">Prendi l'attrezzatura e scendi in spiaggia…</div></div>`;};
G.spotList=()=>{ui.innerHTML=`<div class="gpanel"><b>📍 Dove vuoi pescare?</b><div class="gtalk">${SPOTS.map((sp,i)=>`<button class="gc" onclick="GAME.arrive(${i})">${sp.name}</button>`).join('')}</div>${btn('↩ Torna a guidare','mapBack()')}</div>`;};
G.mapBack=()=>mapUI();
function drawMap(t){const g=MP.g,d=MP.d,W=MP.c.width,H=MP.c.height,c=MP.car,ra=roadAt(c.s),k=(MP.zoom-c.v*12)*d;
  g.setTransform(1,0,0,1,0,0);g.fillStyle=g.createPattern(MP.land,'repeat');g.fillRect(0,0,W,H);
  const cx=W/2,cy=H*.42,X=x=>cx+(x-ra.x)*k,Y=y=>cy-(y-ra.y)*k;
  // mare
  const cs=MP.coast,far=60,sn=MP.sn;g.beginPath();g.moveTo(X(cs[0][0]),Y(cs[0][1]));cs.forEach(q=>g.lineTo(X(q[0]),Y(q[1])));const e1=cs[cs.length-1],e0=cs[0];
  g.lineTo(X(e1[0]+sn[0]*far),Y(e1[1]+sn[1]*far));g.lineTo(X(e0[0]+sn[0]*far),Y(e0[1]+sn[1]*far));g.closePath();const sg=g.createLinearGradient(0,0,W,H);sg.addColorStop(0,'#2b7aa8');sg.addColorStop(1,'#1d5f8a');g.fillStyle=sg;g.fill();
  // spiaggia e linea di costa vera
  g.lineJoin='round';g.lineCap='round';g.strokeStyle='#e6d3a2';g.lineWidth=.22*k;g.beginPath();cs.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.stroke();
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=Math.max(1,.02*k);for(const sgm of MP.segs){g.beginPath();sgm.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.stroke();}
  // strada
  g.strokeStyle='#3e4248';g.lineWidth=Math.max(9*d,.14*k);g.beginPath();MP.road.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.stroke();
  g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5*d;g.setLineDash([8*d,8*d]);g.lineDashOffset=-c.s*k*c.dir;g.stroke();g.setLineDash([]);
  // paesi
  g.font=`600 ${12*d}px Outfit,sans-serif`;g.textAlign='left';for(const tw of MP.towns){const q=PJ(tw[1],tw[2]),x=X(q[0]),y=Y(q[1]);if(x<-50||x>W+50||y<-20||y>H+20)continue;g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x,y,2.5*d,0,7);g.fill();g.fillStyle='rgba(20,30,20,.75)';g.fillText(tw[0],x+5*d,y-4*d);}
  // spot
  MP.spots.forEach((p,i)=>{const x=X(p.q[0]),y=Y(p.q[1]);if(x<-80||x>W+80||y<-40||y>H+40)return;const on=i===MP.near;
    g.fillStyle=on?'#ffb547':'#2fe0cf';g.beginPath();g.arc(x,y-14*d,9*d,Math.PI*.15,Math.PI*.85,true);g.lineTo(x,y);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x,y-14*d,3.5*d,0,7);g.fill();
    g.font=`800 ${(on?15:13)*d}px Outfit,sans-serif`;const tw=g.measureText(p.sp.name).width;g.fillStyle='rgba(4,14,26,.75)';g.fillRect(x+11*d,y-30*d,tw+12*d,20*d);g.fillStyle='#fff';g.fillText(p.sp.name,x+17*d,y-15*d);});
  // auto
  const ang=Math.atan2(-ra.ty*c.dir,ra.tx*c.dir);g.save();g.translate(cx,cy);g.rotate(ang);const L=30*d,Wd=15*d;
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(-L/2+2*d,-Wd/2+3*d,L,Wd);g.fillStyle='#1f8a7f';g.beginPath();g.roundRect?g.roundRect(-L/2,-Wd/2,L,Wd,4*d):g.rect(-L/2,-Wd/2,L,Wd);g.fill();
  g.fillStyle='#bfe3f2';g.fillRect(L*.08,-Wd/2+2*d,L*.18,Wd-4*d);g.fillRect(-L*.36,-Wd/2+2.5*d,L*.12,Wd-5*d);g.fillStyle='#165f58';g.fillRect(-L*.2,-Wd/2+2*d,L*.26,Wd-4*d);
  g.fillStyle='#fff8c8';g.fillRect(L/2-2*d,-Wd/2+1.5*d,2*d,3*d);g.fillRect(L/2-2*d,Wd/2-4.5*d,2*d,3*d);if(c.brk){g.fillStyle='#ff3b30';g.fillRect(-L/2,-Wd/2+1.5*d,2*d,3*d);g.fillRect(-L/2,Wd/2-4.5*d,2*d,3*d);}g.restore();
  // minimappa
  const mw=96*d,mh=150*d,mx=W-mw-10*d,my=60*d;g.fillStyle='rgba(4,14,26,.7)';g.fillRect(mx,my,mw,mh);const xs=MP.road.map(q=>q[0]),ys=MP.road.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),ks=Math.min((mw-16*d)/(x1-x0),(mh-16*d)/(y1-y0));
  const MX=x=>mx+8*d+(x-x0)*ks,MY=y=>my+mh-8*d-(y-y0)*ks;g.strokeStyle='#e6d3a2';g.lineWidth=2*d;g.beginPath();MP.coast.forEach((q,i)=>i?g.lineTo(MX(q[0]),MY(q[1])):g.moveTo(MX(q[0]),MY(q[1])));g.stroke();
  MP.spots.forEach(p=>{g.fillStyle='#2fe0cf';g.beginPath();g.arc(MX(p.q[0]),MY(p.q[1]),2.2*d,0,7);g.fill();});g.fillStyle='#ff4d5e';g.beginPath();g.arc(MX(ra.x),MY(ra.y),4*d,0,7);g.fill();}

/* ---------- guida in 3D vista dall'alto: strada costiera, paesi, pinete e uscite verso gli spot (unità: km) ---------- */
const M3={on:false};
function seaN(t){return [t.ty,-t.tx];}// la strada va da nord-ovest a sud-est: il mare è sempre a destra
function roadDir(s){const a=roadAt(s-.08),b=roadAt(s+.08);const x=b.x-a.x,y=b.y-a.y,l=Math.hypot(x,y)||1;return [x/l,y/l];}
function flatGeo(pos,uv,idx){const g=new T.BufferGeometry(),n=[];for(let i=0;i<pos.length/3;i++)n.push(0,1,0);g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);return g;}
// nastro largo w lungo una polilinea (strade); v lungo il percorso ogni vlen km
function ribbonGeo(P,w,y,vlen){const pos=[],uv=[],idx=[];let acc=0;
  for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;const nx=-ty,ny=tx;
    if(i)acc+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
    pos.push(P[i][0]+nx*w/2,y,-(P[i][1]+ny*w/2),P[i][0]-nx*w/2,y,-(P[i][1]-ny*w/2));uv.push(0,acc/vlen,1,acc/vlen);
    if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k);}}
  return flatGeo(pos,uv,idx);}
// fascia tra due polilinee parallele (terra, spiaggia); uv in coordinate del mondo
function stripGeo(A,B,y,us){const pos=[],uv=[],idx=[];for(let i=0;i<A.length;i++){pos.push(A[i][0],y,-A[i][1],B[i][0],y,-B[i][1]);uv.push(A[i][0]/us,A[i][1]/us,B[i][0]/us,B[i][1]/us);if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k);}}return flatGeo(pos,uv,idx);}
function labelSprite(txt,o={}){const fs=o.fs||52,c=document.createElement('canvas'),g=c.getContext('2d');g.font=`800 ${fs}px Outfit,sans-serif`;const w=Math.ceil(g.measureText(txt).width)+fs*.9,h=Math.ceil(fs*1.5);c.width=w;c.height=h;
  g.font=`800 ${fs}px Outfit,sans-serif`;g.textBaseline='middle';g.textAlign='center';
  if(o.bg){g.fillStyle=o.bg;const r=h/2;g.beginPath();g.moveTo(r,0);g.arcTo(w,0,w,h,r);g.arcTo(w,h,0,h,r);g.arcTo(0,h,0,0,r);g.arcTo(0,0,w,0,r);g.fill();}
  else{g.lineWidth=fs*.18;g.strokeStyle='rgba(10,25,15,.75)';g.strokeText(txt,w/2,h/2);}
  g.fillStyle=o.col||'#fff';g.fillText(txt,w/2,h/2);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;
  const s=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,depthWrite:false,transparent:true,fog:false}));const k=(o.k||.045)/h*1.5;s.scale.set(w*k/1.5*1.5,h*k,1);s.renderOrder=20;return s;}
function landTex3(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#7f9a55';g.fillRect(0,0,512,512);
  const F=['#93a85e','#a7a45f','#6f8f4a','#b9ad6c','#8aa457','#c2b475','#5f8442','#9aa860'];
  for(let i=0;i<70;i++){g.save();g.translate(Math.random()*512,Math.random()*512);g.rotate((Math.random()<.5?0:Math.PI/2)+rnd(-.15,.15));const w=rnd(40,110),h=rnd(30,80),col=pick(F);g.fillStyle=col;g.fillRect(-w/2,-h/2,w,h);
    g.strokeStyle='rgba(0,0,0,.08)';g.lineWidth=1;for(let y=-h/2;y<h/2;y+=5){g.beginPath();g.moveTo(-w/2,y);g.lineTo(w/2,y);g.stroke();}g.strokeStyle='rgba(60,80,40,.5)';g.lineWidth=2;g.strokeRect(-w/2,-h/2,w,h);g.restore();}
  for(let i=0;i<2500;i++){g.fillStyle=`rgba(${Math.random()<.5?'40,70,30':'170,180,110'},${Math.random()*.2})`;g.beginPath();g.arc(Math.random()*512,Math.random()*512,Math.random()*3,0,7);g.fill();}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;}
function roadTex(){return canvasTex(64,256,(g,w,h)=>{g.fillStyle='#41454b';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},255,${Math.random()*.06})`;g.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);}
  g.fillStyle='#f2f2ee';g.fillRect(3,0,3,h);g.fillRect(w-6,0,3,h);g.fillRect(w/2-1.5,0,3,h*.55);});}
function makeCar3(col,rods){const g=new T.Group(),m=c=>new T.MeshLambertMaterial({color:c});
  const body=new T.Mesh(new T.BoxGeometry(.019,.007,.042),m(col));body.position.y=.0065;g.add(body);
  const cab=new T.Mesh(new T.BoxGeometry(.016,.0065,.021),m(0x1d2b3a));cab.position.set(0,.0128,-.003);g.add(cab);
  const roof=new T.Mesh(new T.BoxGeometry(.0145,.0012,.017),m(col));roof.position.set(0,.0166,-.003);g.add(roof);
  const wg=new T.CylinderGeometry(.0042,.0042,.003,10);wg.rotateZ(Math.PI/2);const wm=m(0x111111);[[-.0095,.013],[.0095,.013],[-.0095,-.014],[.0095,-.014]].forEach(([x,z])=>{const w=new T.Mesh(wg,wm);w.position.set(x,.0042,z);g.add(w);});
  const hl=new T.MeshBasicMaterial({color:0xfff6c8});[-.006,.006].forEach(x=>{const l=new T.Mesh(new T.BoxGeometry(.004,.002,.001),hl);l.position.set(x,.007,.0211);g.add(l);});
  const bl=new T.MeshBasicMaterial({color:0x661111});g.userData.brake=bl;[-.007,.007].forEach(x=>{const l=new T.Mesh(new T.BoxGeometry(.004,.002,.001),bl);l.position.set(x,.0075,-.0211);g.add(l);});
  if(rods){const rm=m(0x222222);for(const x of [-.004,0,.004]){const r=new T.Mesh(new T.CylinderGeometry(.0004,.0004,.03,4),rm);r.rotation.x=Math.PI/2;r.position.set(x,.0178,-.004);g.add(r);}
    const bm=new T.MeshBasicMaterial({color:0xffa31a});g.userData.blink=[];[[-1],[1]].forEach(([sx])=>{const b=new T.Mesh(new T.BoxGeometry(.002,.003,.004),bm);b.position.set(sx*.0102,.0075,.017);b.visible=false;g.add(b);const b2=b.clone();b2.position.z=-.017;g.add(b2);g.userData.blink.push([b,b2]);});}
  if(M3.beamMat){const bg=new T.BufferGeometry(),z0=.021,z1=.07,y=.0056;bg.setAttribute('position',new T.Float32BufferAttribute([-.008,y,z0,.008,y,z0,-.026,y,z1,.026,y,z1],3));bg.setAttribute('color',new T.Float32BufferAttribute([1,.93,.7,1,.93,.7,0,0,0,0,0,0],3));bg.setIndex([0,2,1,1,2,3]);g.add(new T.Mesh(bg,M3.beamMat));}
  const sh=new T.Mesh(new T.PlaneGeometry(.03,.052),new T.MeshBasicMaterial({map:M3.blob,transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.0008;g.add(sh);
  return g;}
function blobTex(){return canvasTex(64,64,(g)=>{const r=g.createRadialGradient(32,32,4,32,32,32);r.addColorStop(0,'rgba(0,0,0,.45)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});}
function exitSign(name,left){const t=canvasTex(512,256,(g,w,h)=>{g.fillStyle='#1450a8';g.fillRect(0,0,w,h);g.strokeStyle='#fff';g.lineWidth=10;g.strokeRect(12,12,w-24,h-24);
  g.fillStyle='#fff';g.textAlign='center';g.font='700 46px Outfit,sans-serif';g.fillText('USCITA',w/2,78);let fs=70;g.font=`800 ${fs}px Outfit,sans-serif`;while(g.measureText(name).width>w-150&&fs>30){fs-=4;g.font=`800 ${fs}px Outfit,sans-serif`;}
  g.fillText(name,w/2+(left?40:-40),168);g.font='800 90px Outfit,sans-serif';g.fillText(left?'↖':'↗',left?70:w-70,182);});
  const grp=new T.Group(),pm=new T.MeshLambertMaterial({color:0x9aa0a6});[-.022,.022].forEach(x=>{const p=new T.Mesh(new T.CylinderGeometry(.0012,.0012,.04,5),pm);p.position.set(x,.02,0);grp.add(p);});
  const pl=new T.Mesh(new T.PlaneGeometry(.07,.035),new T.MeshBasicMaterial({map:t,side:T.DoubleSide}));pl.position.y=.045;pl.rotation.x=-.75;grp.add(pl);return grp;}
function nearRoad(q){let bi=0,bd=1e9;const r=MP.road;for(let i=0;i<r.length;i+=2){const d=(r[i][0]-q[0])**2+(r[i][1]-q[1])**2;if(d<bd){bd=d;bi=i;}}const t=roadAt(MP.cum[bi]),n=seaN(t);return {i:bi,s:MP.cum[bi],o:(q[0]-t.x)*n[0]+(q[1]-t.y)*n[1],t,n};}
// posizione attuale: GPS del telefono, altrimenti quella già nota all'app
function gamePos(){if(window.GP_POS)return Promise.resolve(window.GP_POS);return new Promise(res=>{let done=false,net=null,dev=null;const fin=v=>{if(!done){done=true;res(v);}};
  const app=(()=>{try{const h=(0,eval)('S').spots.find(x=>x.here&&x.approx!==true);return h?{lat:+h.lat,lon:+h.lon}:null;}catch(e){return null;}})();
  // posizione veloce: quella del telefono se è già pronta (anche di qualche minuto fa), altrimenti quella approssimata dalla rete (in pochi decimi di secondo)
  if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{dev={lat:p.coords.latitude,lon:p.coords.longitude};fin(dev);},()=>{},{enableHighAccuracy:false,timeout:4000,maximumAge:3600000});
  fetch('https://get.geojs.io/v1/ip/geo.json').then(r=>r.json()).then(j=>{const la=+j.latitude,lo=+j.longitude;if(!isNaN(la)&&!isNaN(lo))net={lat:la,lon:lo};}).catch(()=>{});
  const t0=Date.now(),iv=setInterval(()=>{const el=Date.now()-t0;if(done){clearInterval(iv);return;}if(net&&el>1500){clearInterval(iv);fin(net);}else if(el>5000){clearInterval(iv);fin(net||app);}},150);});}
// strada vera (OSRM, dati OpenStreetMap) da dove sei fino alla strada costiera; se non risponde, una strada diritta
async function approachRoute(pos){const q=PJ(pos.lat,pos.lon),nr=nearRoad(q),dist=Math.hypot(q[0]-nr.t.x,q[1]-nr.t.y);
  if(dist<1.2)return {s:nr.s};if(dist>250)return null;
  const tla=nr.t.y/KY+LAT0,tlo=nr.t.x/KX+LON0;let pts=null;
  try{const ac=new AbortController();setTimeout(()=>ac.abort(),8000);
    const j=await (await fetch(`https://router.project-osrm.org/route/v1/driving/${pos.lon.toFixed(3)},${pos.lat.toFixed(3)};${tlo.toFixed(4)},${tla.toFixed(4)}?overview=full&geometries=geojson`,{signal:ac.signal})).json();
    const co=j.routes?.[0]?.geometry?.coordinates;if(co&&co.length>1){pts=[];for(const [lo,la] of co){const p=PJ(la,lo),l=pts[pts.length-1];if(!l||Math.hypot(p[0]-l[0],p[1]-l[1])>.025)pts.push(p);}}}catch(e){}
  if(!pts){pts=[];const n=Math.max(2,Math.ceil(dist/.3));for(let i=0;i<n;i++)pts.push([lerp(q[0],nr.t.x,i/n),lerp(q[1],nr.t.y,i/n)]);}
  // arrivati vicino alla costa niente giri tra le stradine: si va dritti alla litoranea e lì c'è un incrocio (destra/sinistra)
  let J=nr;for(let k=0;k<pts.length;k++){const n2=nearRoad(pts[k]);if(Math.hypot(pts[k][0]-n2.t.x,pts[k][1]-n2.t.y)<1.3){const a=pts[k];pts=pts.slice(0,k+1);J=n2;const L=Math.hypot(J.t.x-a[0],J.t.y-a[1]),m=Math.max(1,Math.ceil(L/.1));for(let i=1;i<m;i++)pts.push([lerp(a[0],J.t.x,i/m),lerp(a[1],J.t.y,i/m)]);break;}}
  pts.push([J.t.x,J.t.y]);const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  return {s:J.s,app:{pts,cum,len:cum[cum.length-1]}};}
// immagini satellitari (le stesse della mappa degli spot) caricate a tessere attorno all'auto
const SAT={cache:new Map(),any:false};
function satLoad(z,x,y,k){const o={m:null,ok:false,t:M3.t};SAT.cache.set(k,o);
  const n=2**z,lo=i=>i/n*360-180,la=j=>Math.atan(Math.sinh(Math.PI*(1-2*j/n)))/R,a=PJ(la(y),lo(x)),b=PJ(la(y+1),lo(x+1)),h=z<15?-.001:0;
  const m=new T.Mesh(flatGeo([a[0],h,-a[1],b[0],h,-a[1],a[0],h,-b[1],b[0],h,-b[1]],[0,1,1,1,0,0,1,0],[0,2,1,1,2,3]),new T.MeshBasicMaterial({color:M3.tint?M3.tint.clone():0xffffff,side:T.DoubleSide,toneMapped:false}));m.visible=false;M3.S.add(m);o.m=m;
  new T.TextureLoader().setCrossOrigin('anonymous').load(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,t=>{if(!M3.S||!o.m){t.dispose();return;}t.encoding=T.sRGBEncoding;t.anisotropy=4;m.material.map=t;m.material.needsUpdate=true;o.ok=true;SAT.any=true;},undefined,()=>{});}
function satTiles(cx,cy,z,rad,on,need){const lat=cy/KY+LAT0,lon=cx/KX+LON0,n=2**z,tx=Math.floor((lon+180)/360*n),ty=Math.floor((1-Math.log(Math.tan(lat*R)+1/Math.cos(lat*R))/Math.PI)/2*n);
  if(!on)return;for(let dx=-rad;dx<=rad;dx++)for(let dy=-rad;dy<=rad;dy++){const k=z+'/'+(tx+dx)+'/'+(ty+dy);need.add(k);if(!SAT.cache.has(k))satLoad(z,tx+dx,ty+dy,k);}}
function satUpdate(cx,cy,fast){const need=new Set();satTiles(cx,cy,13,2,true,need);satTiles(cx,cy,15,2,!fast,need);
  for(const [k,o] of SAT.cache){const v=need.has(k);if(o.m)o.m.visible=v&&o.ok;if(v)o.t=M3.t;}
  if(SAT.cache.size>170){[...SAT.cache].filter(([k])=>!need.has(k)).sort((a,b)=>a[1].t-b[1].t).slice(0,SAT.cache.size-140).forEach(([k,o])=>{if(o.m){M3.S.remove(o.m);o.m.geometry.dispose();o.m.material.map?.dispose();o.m.material.dispose();o.m=null;}SAT.cache.delete(k);});}
  if(M3.deco)M3.deco.visible=!SAT.any;}
function build3D(){SAT.cache.clear();SAT.any=false;
  const R=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});R.setPixelRatio(Math.min(1.6,devicePixelRatio||1));R.toneMapping=T.ACESFilmicToneMapping;R.outputEncoding=T.sRGBEncoding;
  const cv=R.domElement;cv.id='gmapc';cv.style.width=cv.style.height='100%';(root.querySelector('#g3')||root).appendChild(cv);
  // visuale: un dito ruota (orizzontale) e inclina (verticale), due dita o rotella zoomano, doppio tocco rimette com'era
  M3.zoom=1;M3.orb=0;M3.tilt=1;{const pts=new Map();let pd=0;
    cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId);}catch(x){}pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===2){const [a,b]=[...pts.values()];pd=Math.hypot(a.x-b.x,a.y-b.y);}});
    cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
      if(pts.size===1){M3.orb-=dx*.008;M3.tilt=clamp(M3.tilt-dy*.006,.4,2.2);}else if(pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pd&&d)M3.zoom=clamp(M3.zoom*pd/d,.35,7);pd=d;}});
    const up=e=>{pts.delete(e.pointerId);pd=0;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    cv.addEventListener('wheel',e=>{e.preventDefault();M3.zoom=clamp(M3.zoom*Math.exp(e.deltaY*.0015),.35,7);},{passive:false});
    cv.addEventListener('dblclick',()=>G.mapView());}
  const S=new T.Scene();S.background=new T.Color('#9fd3f0');S.fog=new T.Fog('#b4dcf2',2.2,6.5);
  const cam=new T.PerspectiveCamera(52,1,.02,80);Object.assign(M3,{R,S,cam,on:true,blob:blobTex(),cars:[],pins:[],t:0});
  const sun=new T.DirectionalLight(0xfff1dc,1.15);S.add(sun);S.add(sun.target);M3.sun=sun;M3.sunDir=new T.Vector3(-.45,.8,.4).normalize();
  M3.hemi=new T.HemisphereLight(0xcfe6ff,0x6d7a4a,.75);S.add(M3.hemi);M3.N=0;M3.Nap=-1;M3.nT=0;
  M3.beamMat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
  M3.glowMat=new T.SpriteMaterial({map:glowTex('rgba(255,200,120,1)'),transparent:true,opacity:0,depthWrite:false,depthTest:false,blending:T.AdditiveBlending,fog:false});
  // mare
  const wn=normalTex();wn.encoding=T.LinearEncoding;wn.wrapS=wn.wrapT=T.RepeatWrapping;const mid=MP.road[MP.road.length>>1];
  wn.repeat.set(420,420);const wat=new T.Mesh(new T.PlaneGeometry(160,160),new T.MeshPhongMaterial({color:0x1b78a8,specular:0xbfe6ff,shininess:70,normalMap:wn,normalScale:new T.Vector2(.55,.55)}));M3.wn=wn;
  wat.rotation.x=-Math.PI/2;wat.position.set(mid[0],-.005,-mid[1]);S.add(wat);M3.water=wat;
  // terra e spiaggia lungo la costa
  const cs=MP.coast,sn=MP.sn,ext=(a,b,k)=>{const x=a[0]-b[0],y=a[1]-b[1],l=Math.hypot(x,y)||1;return [a[0]+x/l*k,a[1]+y/l*k];};
  const C2=[ext(cs[0],cs[6],40),ext(cs[0],cs[6],6),...cs,ext(cs[cs.length-1],cs[cs.length-7],6),ext(cs[cs.length-1],cs[cs.length-7],40)];
  const off=(P,k)=>P.map(q=>[q[0]+sn[0]*k,q[1]+sn[1]*k]);
  const deco=new T.Group();S.add(deco);M3.deco=deco;const lt=landTex3();S.add(new T.Mesh(stripGeo(off(C2,-.06),off(C2,-45),-.003,.9),new T.MeshLambertMaterial({map:lt,side:T.DoubleSide})));
  const st2=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#e6d09c';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle=`rgba(${Math.random()<.5?'160,130,80':'255,245,215'},${Math.random()*.35})`;g.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);}},[1,1]);st2.wrapS=st2.wrapT=T.RepeatWrapping;
  deco.add(new T.Mesh(stripGeo(off(C2,.018),off(C2,-.12),.0015,.08),new T.MeshLambertMaterial({map:st2,side:T.DoubleSide})));
  // schiuma della battigia
  deco.add(new T.Mesh(stripGeo(off(C2,.032),off(C2,.016),.0012,.05),new T.MeshBasicMaterial({color:0xf4fbff,transparent:true,opacity:.55,side:T.DoubleSide})));
  // strada
  const rt=roadTex();rt.wrapS=rt.wrapT=T.RepeatWrapping;const roadM=new T.MeshLambertMaterial({map:rt,side:T.DoubleSide});
  S.add(new T.Mesh(ribbonGeo(MP.road,.042,.004,.07),new T.MeshLambertMaterial({color:0x8a8f6a,side:T.DoubleSide})).translateY(-.0005));
  S.add(new T.Mesh(ribbonGeo(MP.road,.03,.0045,.07),roadM));
  if(MP.app){S.add(new T.Mesh(ribbonGeo(MP.app.pts,.038,.0039,.07),new T.MeshLambertMaterial({color:0x8a8f6a,side:T.DoubleSide})));S.add(new T.Mesh(ribbonGeo(MP.app.pts,.026,.0044,.07),roadM));
    const me=labelSprite('📍 Posizione attuale',{bg:'rgba(255,77,94,.9)',fs:40,k:.022});me.position.set(MP.app.pts[0][0],.1,-MP.app.pts[0][1]);S.add(me);}
  // Monte Circeo
  const cq=PJ(CIRCEO.lat,CIRCEO.lon),mg=new T.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI/2);const mp=mg.attributes.position;for(let i=0;i<mp.count;i++){const y=mp.getY(i);mp.setY(i,y*(1+.12*Math.sin(mp.getX(i)*9)*Math.cos(mp.getZ(i)*7)));}mg.computeVertexNormals();
  const mt=new T.Mesh(mg,new T.MeshLambertMaterial({color:0x5b7a3c}));mt.scale.set(2.6,.54,.9);mt.rotation.y=.15;mt.position.set(cq[0],0,-cq[1]);deco.add(mt);{const lb=labelSprite('⛰️ Monte Circeo',{fs:44,k:.03,col:'#ffe9a8',bg:'rgba(30,20,4,.72)'});lb.position.set(cq[0],.12,-cq[1]);S.add(lb);}
  // paesi: case con tetti in coppo
  const bx=new T.BoxGeometry(1,1,1);bx.translate(0,.5,0);const rf=new T.ConeGeometry(.75,1,4);rf.rotateY(Math.PI/4);rf.translate(0,.5,0);
  const houses=[],exitZ=[];MP.spots.forEach(q=>{const J=roadAt(q.s),n=seaN(J);exitZ.push([J.x+n[0]*.1,J.y+n[1]*.1,.17]);for(const d of [-1,1]){const A=roadAt(clamp(q.s-d*.15,0,MP.len));exitZ.push([A.x+n[0]*.04,A.y+n[1]*.04,.08]);}});const big=/Ostia|Civitavecchia|Terracina|Anzio|Nettuno|Ladispoli|Fiumicino|Sabaudia|Santa Marinella|Torvaianica/;
  for(const tw of MP.towns){if(/Diocese/.test(tw[0]))continue;let q=PJ(tw[1],tw[2]);const nr=nearRoad(q);if(nr.o>.05)q=[q[0]-nr.n[0]*(nr.o-.05),q[1]-nr.n[1]*(nr.o-.05)];tw.q=q;
    const N=big.test(tw[0])?220:90;for(let k=0;k<N;k++){const a=Math.random()*7,r=(big.test(tw[0])?.9:.5)*Math.sqrt(Math.random()),p=[q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r],o=nearRoad(p);if(Math.abs(o.o)<.03||o.o>.15||exitZ.some(e=>Math.hypot(e[0]-p[0],e[1]-p[1])<e[2]))continue;houses.push([p,Math.atan2(o.t.ty,o.t.tx)+(Math.random()<.5?0:Math.PI/2)]);}
    {const gl=new T.Sprite(M3.glowMat);const big2=big.test(tw[0]);gl.scale.set(big2?1.2:.7,big2?1.2:.7,1);gl.renderOrder=2;gl.position.set(q[0],.02,-q[1]);S.add(gl);}
    const lb=labelSprite(tw[0].replace(/-Foce Verde|Marina di Ardea-/,''),{fs:44,k:.03});lb.position.set(q[0],.06,-q[1]);S.add(lb);}
  const HM=new T.InstancedMesh(bx,new T.MeshLambertMaterial(),houses.length),RM=new T.InstancedMesh(rf,new T.MeshLambertMaterial(),houses.length),o3=new T.Object3D(),HC=['#f3ead8','#ead4a6','#f6f1e7','#dfb88c','#efe1c2','#e9c9a8'].map(c=>new T.Color(c));
  houses.forEach(([p,a],i)=>{const w=rnd(.014,.032),d=rnd(.012,.026),h=rnd(.008,.026);o3.position.set(p[0],0,-p[1]);o3.rotation.set(0,a,0);o3.scale.set(w,h,d);o3.updateMatrix();HM.setMatrixAt(i,o3.matrix);HM.setColorAt(i,pick(HC));
    o3.position.y=h;o3.scale.set(w*1.02,Math.min(w,d)*.45,d*1.02);o3.updateMatrix();RM.setMatrixAt(i,o3.matrix);RM.setColorAt(i,new T.Color(pick(['#b5563a','#a94c33','#c0674a','#9c4a35'])));});
  deco.add(HM,RM);
  // uscite: due rampe (una per senso di marcia), parcheggio, sentiero sulla spiaggia, cartelli e segnaposto
  const pkT=canvasTex(128,96,(g,w,h)=>{g.fillStyle='#55595f';g.fillRect(0,0,w,h);g.strokeStyle='#fff';g.lineWidth=2;for(let x=8;x<w;x+=16){g.beginPath();g.moveTo(x,4);g.lineTo(x,30);g.moveTo(x,h-4);g.lineTo(x,h-30);g.stroke();}});
  const pathM=new T.MeshLambertMaterial({color:0xd9c08a,side:T.DoubleSide});
  MP.spots.forEach((p,i)=>{const J=roadAt(p.s),n=seaN(J),cn=coastNear([J.x,J.y])||{px:J.x+n[0]*.3,py:J.y+n[1]*.3,lx:-n[0],ly:-n[1]},B=[cn.px+cn.lx*.025,cn.py+cn.ly*.025];let E=[cn.px+cn.lx*.1,cn.py+cn.ly*.1];
    if(Math.hypot(E[0]-J.x,E[1]-J.y)<.06)E=[J.x+n[0]*.06,J.y+n[1]*.06];const dn0=E[0]-J.x,dn1=E[1]-J.y,dl=Math.hypot(dn0,dn1)||1,dn=[dn0/dl,dn1/dl],tt=[J.tx,J.ty],SL=k=>[E[0]+tt[0]*(k-1.5)*.024-dn[0]*.004,E[1]+tt[1]*(k-1.5)*.024-dn[1]*.004],MINE=1,ME=SL(MINE);
    p.E=E;p.B=B;p.n=n;p.ramps={};
    for(const d of [1,-1]){const rs=clamp(p.s-d*.25,0,MP.len),A=roadAt(rs),hd=roadDir(rs),rt2=[hd[1]*d,-hd[0]*d],P0=[A.x+rt2[0]*.0075,A.y+rt2[1]*.0075],B1=roadAt(clamp(p.s-d*.1,0,MP.len)),P1=[B1.x+dn[0]*.012,B1.y+dn[1]*.012],P2=[J.x+dn0*.5,J.y+dn1*.5];
      const pts=[];for(let k=0;k<=40;k++){const u=k/40,a=(1-u)**3,b=3*u*(1-u)**2,c=3*u*u*(1-u),e=u**3;pts.push([a*P0[0]+b*P1[0]+c*P2[0]+e*ME[0],a*P0[1]+b*P1[1]+c*P2[1]+e*ME[1]]);}
      const cum=[0];for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));p.ramps[d]={rs,pts,cum,len:cum[cum.length-1]};
      S.add(new T.Mesh(ribbonGeo(pts,.02,.0042,.07),roadM));
      const sg=roadAt(clamp(p.s-d*.8,0,MP.len)),sd=roadDir(clamp(p.s-d*.8,0,MP.len)),side=d===1?1:-1,hx=sd[0]*d,hy=sd[1]*d,rx=hy,ry=-hx,sgn=exitSign(p.sp.name,d!==1);
      sgn.position.set(sg.x+rx*.034,0,-(sg.y+ry*.034));sgn.rotation.y=Math.atan2(-hx,hy);S.add(sgn);}
    const pk=new T.Mesh(new T.PlaneGeometry(.11,.06),new T.MeshLambertMaterial({map:pkT}));pk.rotation.set(-Math.PI/2,0,Math.atan2(J.ty,J.tx));pk.position.set(E[0],.0046,-E[1]);S.add(pk);
    // il posto MINE resta sempre libero per la mia auto
    for(let k=0;k<4;k++){if(k===MINE||Math.random()<.25)continue;const c=makeCar3(pick([0xd94a3a,0xf2f2f2,0x2b62c9,0x333840,0xe0b33a]));const q=SL(k);c.position.set(q[0],0,-q[1]);c.rotation.y=Math.atan2(dn[0],-dn[1]);S.add(c);}
    S.add(new T.Mesh(ribbonGeo([[E[0]+dn[0]*.03,E[1]+dn[1]*.03],[(E[0]+B[0])/2+dn[0]*.015,(E[1]+B[1])/2+dn[1]*.015],[B[0],B[1]]],.008,.0043,.05),pathM));
    const pin=new T.Group(),pm=new T.MeshLambertMaterial({color:0x2fe0cf,emissive:0x0b5a54});const hd2=new T.Mesh(new T.SphereGeometry(.011,16,10),pm);hd2.position.y=.03;const tip=new T.Mesh(new T.ConeGeometry(.0105,.026,16),pm);tip.rotation.x=Math.PI;tip.position.y=.013;
    const dot=new T.Mesh(new T.SphereGeometry(.0045,10,8),new T.MeshBasicMaterial({color:0xffffff}));dot.position.set(0,.03,0);dot.scale.setScalar(1.05);pin.add(hd2,tip,dot);
    const lb=labelSprite('🎣 '+p.sp.name,{bg:'rgba(4,14,26,.82)',fs:46,k:.034});lb.position.y=.062;pin.add(lb);
    pin.position.set(B[0],0,-B[1]);S.add(pin);M3.pins.push(pin);});
  // pini domestici e macchia
  const trees=[];
  for(let k=0;k<7000;k++){const s=Math.random()*MP.len,t=roadAt(s),n=seaN(t),o=Math.random()<.8?-rnd(.035,1.6):rnd(.035,.16),p=[t.x+n[0]*o,t.y+n[1]*o];
    if(MP.towns.some(tw=>tw.q&&Math.hypot(tw.q[0]-p[0],tw.q[1]-p[1])<(big.test(tw[0])?.95:.55)))continue;if(MP.spots.some(q=>Math.hypot(q.E[0]-p[0],q.E[1]-p[1])<.2))continue;trees.push(p);}
  M3.treeP=trees;
  const crown=new T.SphereGeometry(1,8,5);crown.scale(1,.45,1);const trunk=new T.CylinderGeometry(.08,.1,1,5);trunk.translate(0,.5,0);
  const TC=new T.InstancedMesh(crown,new T.MeshLambertMaterial(),trees.length),TT=new T.InstancedMesh(trunk,new T.MeshLambertMaterial({color:0x6b4a32}),trees.length),GC=['#2f5a2a','#3c6a2f','#29502a','#467536'].map(c=>new T.Color(c));
  trees.forEach((p,i)=>{const s=rnd(.008,.015),h=s*rnd(1.2,1.9);o3.position.set(p[0],0,-p[1]);o3.rotation.set(0,0,0);o3.scale.set(s,h,s);o3.updateMatrix();TT.setMatrixAt(i,o3.matrix);o3.position.y=h;o3.scale.set(s,s,s);o3.updateMatrix();TC.setMatrixAt(i,o3.matrix);TC.setColorAt(i,pick(GC));});
  deco.add(TT,TC);
  // luoghi caratteristici della costa con il loro nome
  for(const L of LMK){const q=PJ(L.lat,L.lon),nr=nearRoad(q),g=lmModel(L);
    if(L.t==='temple')g.scale.set(.001,.0016,.001);else if(L.t==='pier')g.scale.set(.003,.0025,.001);else if(L.t==='port'||L.t==='dune')g.scale.set(.001,.0025,.001);else g.scale.setScalar(.0022);
    let gp=q,sv=nr.n;if(L.t==='pier'||L.t==='port'){const c=coastNear(q);if(c){gp=[c.px,c.py];sv=[-c.lx,-c.ly];}}
    g.position.set(gp[0],0,-gp[1]);g.rotation.y=Math.atan2(-sv[0],sv[1]);S.add(g);
    const lb=labelSprite(L.n,{fs:40,k:.024,col:'#ffe9a8',bg:'rgba(30,20,4,.72)'});lb.userData.n=L.n;lb.position.set(q[0],{tower:.06,lighthouse:.11,castle:.08,fort:.05,temple:.3,pier:.03,port:.04,dune:.04}[L.t],-q[1]);S.add(lb);}
  // auto: la mia (con le canne sul tetto) e il traffico
  M3.car=makeCar3(0x1f9a8e,true);S.add(M3.car);M3.yaw=null;
  for(let k=0;k<22;k++){const c=makeCar3(pick([0xd94a3a,0xf2f2f2,0x2b62c9,0x333840,0xe0b33a,0x8a2be2,0x2e7d32]));S.add(c);M3.cars.push({o:c,s:Math.random()*MP.len,d:Math.random()<.5?1:-1,v:rnd(.5,1.05)});}
  // minimappa
  const mm=document.createElement('canvas');mm.id='gmini';root.appendChild(mm);M3.mini=mm;
  sizeMap();}
function polyPose(P,cu,u,lane){let lo=0,hi=cu.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(cu[m]<=u)lo=m;else hi=m;}const k=hi,f=clamp((u-cu[k-1])/Math.max(1e-6,cu[k]-cu[k-1]),0,1);
  const a=P[Math.max(0,k-3)],b=P[Math.min(P.length-1,k+2)];let hx=b[0]-a[0],hy=b[1]-a[1];const l=Math.hypot(hx,hy)||1;hx/=l;hy/=l;return {x:lerp(P[k-1][0],P[k][0],f)+hy*lane,y:lerp(P[k-1][1],P[k][1],f)-hx*lane,hx,hy};}
function carPose(){const c=MP.car;if(c.ramp)return polyPose(c.ramp.r.pts,c.ramp.r.cum,c.ramp.u,0);if(c.app)return polyPose(c.app.pts,c.app.cum,c.app.u,.0075);
  const t=roadAt(c.s),h=roadDir(c.s),hx=h[0]*c.dir,hy=h[1]*c.dir;return {x:t.x+hy*.0075,y:t.y-hx*.0075,hx,hy};}
function mapPhys3(dt){const c=MP.car;
  if(c.ramp){const R=c.ramp,left=R.r.len-R.u,vmax=Math.min(.45,left*1.6+.04);if(c.acc)c.v+=dt*.45;else c.v-=dt*.06;if(c.brk)c.v-=dt*1.4;if(c.v>vmax)c.v=Math.max(vmax,c.v-dt*Math.max(1.6,c.v*2));c.v=clamp(c.v,.03,8);R.u=Math.min(R.r.len,R.u+c.v*dt);
    if(R.u>=R.r.len-.002&&!R.done){R.done=1;c.v=0;motor(false);st.phase='parking';ui.innerHTML=`<div class="gpanel"><b>🅿️ Parcheggi a ${MP.spots[R.i].sp.name}</b><div class="gs">Prendi l'attrezzatura e scendi in spiaggia…</div></div>`;setTimeout(()=>{if(st.phase==='parking')G.arrive(R.i);},1500);}
    if(!R.done)carSound(c.v);kmh();return;}
  // più tieni premuto l'acceleratore, più l'auto va veloce (fino a 800 km/h)
  if(c.acc){c.hold=(c.hold||0)+dt;c.v+=dt*(.45+Math.max(0,c.hold-1.2)*1.1);}else{c.hold=0;c.v-=dt*(.08+c.v*.05);}if(c.brk)c.v-=dt*(1.4+c.v*.8);c.v=clamp(c.v,0,8);
  if(c.app){const A=c.app;A.u=Math.min(A.len,A.u+c.v*dt);carSound(c.v);kmh();
    const d=A.len-A.u;
    // all'incrocio con la litoranea: a destra o a sinistra? senza scelta l'auto si ferma all'incrocio
    if(!A.chosen&&d<2.5){const vt=Math.max(0,Math.sqrt(2*3*Math.max(0,d-.02)));if(c.v>vt)c.v=vt;if(d<.03){c.v=0;A.u=A.len-.02;}}
    if(A.u>=A.len&&A.chosen){c.app=null;c.dir=A.dir;MP.key='';return;}
    const e=document.getElementById('gpark');if(e){const near=d<2.5&&!A.chosen,key='app'+near+A.chosen;
      if(MP.key!==key){MP.key=key;if(near){if(A.left==null){const P=A.pts,n=P.length,hx=P[n-1][0]-P[Math.max(0,n-4)][0],hy=P[n-1][1]-P[Math.max(0,n-4)][1],t=roadAt(c.s);A.left=hx*t.ty-hy*t.tx>0?1:-1;}
          const sx=d2=>d2===1?'Sud · Terracina':'Nord · Civitavecchia';e.innerHTML=`<div style="margin-bottom:6px">🛣️ Incrocio con la litoranea tra <b id="gexd"></b>: dove vai?</div><div class="grow" style="margin:0"><button class="gb" style="flex:1;margin:0" onclick="GAME.appDir(${A.left})">⬅ ${sx(A.left)}</button><button class="gb" style="flex:1;margin:0" onclick="GAME.appDir(${-A.left})">${sx(-A.left)} ➡</button></div>`;}
        else e.innerHTML=A.chosen?`${A.dir===1?'⬇ Verso sud':'⬆ Verso nord'}: all'incrocio giri tra <b id="gexd"></b>`:`🧭 Verso la costa: <b id="gexd"></b> · tieni premuto ⬆ per andare più veloce`;}
      const x=document.getElementById('gexd');if(x)x.textContent=d<1?Math.round(d*20)*50+' m':d.toFixed(1).replace('.',',')+' km';}
    return;}
  // con la freccia inserita l'auto rallenta da sola per prendere l'uscita
  if(MP.arm!=null){const r=MP.spots[MP.arm].ramps[c.dir],d=(r.rs-c.s)*c.dir;if(d>0){const vt=Math.max(.5,Math.sqrt(2*3*d));if(c.v>vt)c.v=vt;}}
  const prev=c.s;c.s=clamp(c.s+c.v*c.dir*dt,0,MP.len);if(c.s<=0||c.s>=MP.len)c.v=0;
  carSound(c.v);
  if(MP.arm!=null){const p=MP.spots[MP.arm],r=p.ramps[c.dir];if(r&&(prev-r.rs)*c.dir<=0&&(c.s-r.rs)*c.dir>=0){c.ramp={i:MP.arm,r,u:0};c.v=Math.min(c.v,.6);MP.arm=null;ui.querySelector('#gpark').innerHTML=`↘ Esci per <b>${p.sp.name}</b>…`;MP.key='ramp';return;}
    if((c.s-r.rs)*c.dir>.05){MP.arm=null;}}
  let nx=-1,nd=1e9;MP.spots.forEach((p,i)=>{const d=(p.ramps[c.dir].rs-c.s)*c.dir;if(d>.01&&d<nd){nd=d;nx=i;}});
  const nearK=nd<Math.max(2,c.v*3),key=nx+'|'+nearK+'|'+MP.arm;if(key!==MP.key){MP.key=key;MP.nx=nx;exitUI(nx,nearK);}
  const e=document.getElementById('gexd');if(e&&nx>=0){const d=MP.arm!=null?(MP.spots[MP.arm].ramps[c.dir].rs-c.s)*c.dir:nd;e.textContent=d<1?Math.max(0,Math.round(d*20)*50)+' m':d.toFixed(1).replace('.',',')+' km';}
  kmh();}
function kmh(){const sp=document.getElementById('gkmh');if(sp){const k=Math.min(300,Math.round(MP.car.v*100));sp.textContent=k+' km/h';sp.style.color=k>150?'#ffb547':'';}}
function exitUI(nx,near){const e=document.getElementById('gpark');if(!e)return;
  if(nx<0){e.innerHTML='Fine della strada: fermati e inverti il senso.';return;}const n=MP.spots[nx].sp.name;
  if(MP.arm!=null)e.innerHTML=`<span style="color:#ffb547">⟹ Freccia inserita</span>: esci per <b>${MP.spots[MP.arm].sp.name}</b> tra <b id="gexd"></b>`;
  else if(near)e.innerHTML=`<button class="gb big" style="margin:0;background:#1450a8" onclick="GAME.takeExit(${nx})">↘ Prendi l'uscita <b>${n}</b> · <span id="gexd"></span></button>`;
  else e.innerHTML=`🛣️ Prossima uscita: <b>${n}</b> tra <b id="gexd"></b>`;}
G.appDir=d=>{const c=MP.car;if(!c.app)return;c.app.dir=d;c.app.chosen=true;MP.key='';click();};G.mapView=()=>{M3.zoom=1;M3.orb=0;M3.tilt=1;};G.takeExit=i=>{MP.arm=i;MP.key='';click();};G._mp=()=>({MP,M3});
function draw3D(dt){const c=MP.car,P=carPose(),car=M3.car;M3.t+=dt;const t=M3.t;
  const yaw=Math.atan2(P.hx,-P.hy);if(M3.yaw==null)M3.yaw=yaw;let dy=yaw-M3.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));M3.yaw+=dy*Math.min(1,dt*6);
  car.position.set(P.x,0,-P.y);car.rotation.y=M3.yaw;car.userData.brake.color.set(c.brk?0xff2a2a:0x661111);
  const bl=(MP.arm!=null||c.ramp&&!c.ramp.done)&&(t*2.2%1)<.5,side=(c.app?1:c.ramp?c.ramp.r===MP.spots[c.ramp.i].ramps[1]:c.dir===1)?1:0;car.userData.blink.forEach((pr,k)=>pr.forEach(b=>b.visible=bl&&k===(side?0:1)));
  // telecamera dall'alto, un po' dietro
  const fx=Math.sin(M3.yaw),fz=Math.cos(M3.yaw),back=.22+Math.min(c.v,8)*.1,hgt=.52+Math.min(c.v,8)*.16,cam=M3.cam,sn2=c.ramp?MP.spots[c.ramp.i].n:seaN(roadAt(c.app?MP.app.s??c.s:c.s));if(!M3.sn)M3.sn=[...sn2];M3.sn[0]=lerp(M3.sn[0],sn2[0],Math.min(1,dt*2));M3.sn[1]=lerp(M3.sn[1],sn2[1],Math.min(1,dt*2));const nx=M3.sn[0],nz=-M3.sn[1],Z=M3.zoom||1,TL=M3.tilt||1,co=Math.cos(M3.orb||0),si=Math.sin(M3.orb||0),ox=(-fx*back+nx*.08)*Z/TL,oz=(-fz*back+nz*.08)*Z/TL,tp=new T.Vector3(P.x+ox*co-oz*si,hgt*Z*TL,-P.y+ox*si+oz*co);
  if(!M3.cp)M3.cp=tp.clone();M3.cp.lerp(tp,Math.min(1,dt*3));cam.position.copy(M3.cp);cam.lookAt(P.x+fx*.05+nx*.06,0,-P.y+fz*.05+nz*.06);car.scale.setScalar((1+Math.min(c.v,8)*.28)*Math.max(1,Z*.7));
  const lx=P.x+fx*.4+nx*.1,ly=P.y-(fz*.4+nz*.1);satUpdate(lx,ly,c.v>2.2||Z>1.8);M3.S.fog.near=(2.2+c.v*.5)*Math.max(1,Z);M3.S.fog.far=(6.5+c.v*.9)*Math.max(1,Z);
  M3.sun.position.set(P.x+M3.sunDir.x*3,M3.sunDir.y*3,-P.y+M3.sunDir.z*3);M3.sun.target.position.set(P.x,0,-P.y);
  M3.wn.offset.x+=dt*.02;M3.wn.offset.y+=dt*.013;
  M3.pins.forEach((p,i)=>{p.position.y=.008+Math.sin(t*2.2+i)*.006;p.children[0].parent.rotation.y=t*.8;});
  for(const k of M3.cars){k.s+=k.d*k.v*dt;if(k.s<0)k.s+=MP.len;if(k.s>MP.len)k.s-=MP.len;const r=roadAt(k.s),h=roadDir(k.s),hx=h[0]*k.d,hy=h[1]*k.d;k.o.position.set(r.x+hy*.0075,0,-(r.y-hx*.0075));k.o.rotation.y=Math.atan2(hx,-hy);}
  if(!(M3.lmT>0)){M3.lmT=.5;let best=null,bd=1.3;for(const L of LMK){const q=L.q||(L.q=PJ(L.lat,L.lon)),d=Math.hypot(q[0]-P.x,q[1]-P.y);if(d<bd){bd=d;best=L;}}const h=best?`<div>📍 ${best.n} · ${Math.round(bd*20)*50} m</div>`:'';if(hud.innerHTML!==h)hud.innerHTML=h;}else M3.lmT-=dt;
  // giorno e notte: sole vero dove si trova l'auto, con il buio che arriva mezz'ora prima (e la luce mezz'ora dopo)
  if(!(M3.nT>0)){M3.nT=1;const d=new Date(),la=P.y/KY+LAT0,lo=P.x/KX+LON0,s0=sunPos(d,la,lo),sun=sunPos(new Date(d.getTime()+30*60e3*clamp((s0.az-180)/30,-1,1)),la,lo);M3.N=clamp((-sun.alt+4)/11,0,1);}else M3.nT-=dt;
  if(Math.abs(M3.N-M3.Nap)>.01){const N=M3.N;M3.Nap=N;M3.tint=new T.Color().setRGB(1-N*.93,1-N*.91,1-N*.82);for(const o of SAT.cache.values())if(o.m)o.m.material.color.copy(M3.tint);
    const sky=new T.Color('#9fd3f0').lerp(new T.Color('#08111f'),N),fogc=new T.Color('#b4dcf2').lerp(new T.Color('#08111f'),N);M3.S.background.copy(sky);M3.S.fog.color.copy(fogc);
    M3.sun.intensity=1.15*(1-N*.97);M3.hemi.intensity=.75*(1-N*.88);M3.beamMat.opacity=clamp((N-.25)*1.6,0,1);M3.glowMat.opacity=clamp((N-.2)*1.2,0,.9);}
  M3.R.render(M3.S,cam);drawMini(P);}
function drawMini(P){const c=M3.mini;if(!c)return;const g=c.getContext('2d'),d=MP.d||1,W=c.width,H=c.height;
  if(!M3.mbg||M3.mbg.width!==W){const b=document.createElement('canvas');b.width=W;b.height=H;const bg=b.getContext('2d');const all=MP.app?MP.road.concat(MP.app.pts):MP.road,xs=all.map(q=>q[0]),ys=all.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),ks=Math.min((W-16*d)/(x1-x0),(H-16*d)/(y1-y0));
    M3.MX=x=>8*d+(x-x0)*ks;M3.MY=y=>H-8*d-(y-y0)*ks;bg.fillStyle='rgba(4,14,26,.72)';bg.fillRect(0,0,W,H);bg.strokeStyle='#e6d3a2';bg.lineWidth=2*d;bg.beginPath();MP.coast.forEach((q,i)=>i?bg.lineTo(M3.MX(q[0]),M3.MY(q[1])):bg.moveTo(M3.MX(q[0]),M3.MY(q[1])));bg.stroke();
    if(MP.app){bg.strokeStyle='#ffffff';bg.lineWidth=1.5*d;bg.beginPath();MP.app.pts.forEach((q,i)=>i?bg.lineTo(M3.MX(q[0]),M3.MY(q[1])):bg.moveTo(M3.MX(q[0]),M3.MY(q[1])));bg.stroke();}MP.spots.forEach(p=>{bg.fillStyle='#2fe0cf';bg.beginPath();bg.arc(M3.MX(p.q[0]),M3.MY(p.q[1]),2.2*d,0,7);bg.fill();});M3.mbg=b;}
  g.clearRect(0,0,W,H);g.drawImage(M3.mbg,0,0);g.fillStyle='#ff4d5e';g.beginPath();g.arc(M3.MX(P.x),M3.MY(P.y),4*d,0,7);g.fill();}
function dispose3D(){if(M3.R){try{M3.R.dispose();M3.R.forceContextLoss?.();}catch(e){}}M3.R=null;M3.on=false;M3.S=null;SAT.cache.clear();M3.cp=null;M3.sn=null;M3.mbg=null;document.getElementById('gmini')?.remove();}

/* ---------- giocatori veri: amici (cappello verde) e utenti pubblici (cappello blu) nello stesso spot ----------
   gamers/{uid}: {name, photo, spot, x, z, ry, vis:'friends'|'all', friends:[uid], t}  (la visibilità è quella della posizione in Social › Mappa)
   gamemsgs/{id}: {from, name, to, spot, text, t}: messaggi scritti nel gioco, li legge solo il destinatario */
const RP={list:new Map(),subs:[],pubT:0,last:null,log:{},chk:0};
const rpLS=(k,d)=>{try{const v=JSON.parse(localStorage.getItem('lenza.'+k));return v==null?d:v;}catch(e){return d;}};
const rpVis=()=>{const v=rpLS('chatloc','off');return v==='friends'||v==='all'?v:'off';};
const rpFriends=()=>(rpLS('chatfriends',[])||[]).filter(f=>f&&typeof f.uid==='string');
const rpCloud=()=>{const C=window.CLOUD;return C&&C.user&&C.db&&C.ff?C:null;};
function rpStart(){rpStop();const C=rpCloud(),v=rpVis();if(!C||v==='off')return;const ff=C.ff,db=C.db,me=C.user.uid,sid=SPOT.id,col=ff.collection(db,'gamers');RP.me=me;RP.on=true;RP.photoSent=false;
  const on=snap=>snap.docChanges().forEach(ch=>{const d=ch.doc.data(),id=ch.doc.id;if(id===me)return;if(ch.type==='removed'||d.spot!==sid||Date.now()-(d.t||0)>90000){rpDrop(id);return;}rpUpsert(id,d);});
  RP.subs.push(ff.onSnapshot(ff.query(col,ff.where('spot','==',sid),ff.where('friends','array-contains',me)),on,e=>console.warn('gamers amici',e)));
  if(v==='all')RP.subs.push(ff.onSnapshot(ff.query(col,ff.where('spot','==',sid),ff.where('vis','==','all')),on,e=>console.warn('gamers tutti',e)));
  RP.subs.push(ff.onSnapshot(ff.query(ff.collection(db,'gamemsgs'),ff.where('to','==',me)),snap=>snap.docChanges().forEach(ch=>{if(ch.type!=='added')return;const m=ch.doc.data();ff.deleteDoc(ch.doc.ref).catch(()=>{});if(Date.now()-(m.t||0)<180000)rpGotMsg(m);}),e=>console.warn('gamemsgs',e)));
  rpPublish(true);}
function rpStop(){RP.subs.forEach(u=>{try{u();}catch(e){}});RP.subs=[];for(const id of [...RP.list.keys()])rpDrop(id);
  const C=rpCloud();if(RP.on&&C){C.ff.deleteDoc(C.ff.doc(C.db,'gamers',C.user.uid)).catch(()=>{});}RP.on=false;RP.last=null;}
function rpPublish(force){const C=rpCloud();if(!RP.on||!C||!AN.pos)return;const p={x:+AN.pos.x.toFixed(2),z:+AN.pos.z.toFixed(2)},L=RP.last,now=Date.now();
  if(!force&&L&&Math.hypot(p.x-L.x,p.z-L.z)<.4&&now-L.t<20000)return;RP.last={...p,t:now};
  const d={name:C.name()||'Pescatore',spot:SPOT.id,x:p.x,z:p.z,ry:+AN.rotY.toFixed(2),vis:rpVis(),friends:rpFriends().map(f=>f.uid),t:now};if(!RP.photoSent){d.photo=myPhoto()||null;RP.photoSent=true;}
  C.ff.setDoc(C.ff.doc(C.db,'gamers',C.user.uid),d,{merge:true}).catch(e=>console.warn('gamers',e));}
function rpLabel(name,friend){const t=canvasTex(512,96,(g)=>{g.font='800 46px Outfit,sans-serif';const w=Math.min(500,g.measureText(name).width+60);g.fillStyle=friend?'rgba(46,155,79,.92)':'rgba(36,89,201,.92)';const x=(512-w)/2,r=40;g.beginPath();g.moveTo(x+r,8);g.arcTo(x+w,8,x+w,88,r);g.arcTo(x+w,88,x,88,r);g.arcTo(x,88,x,8,r);g.arcTo(x,8,x+w,8,r);g.fill();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(name,256,50);});
  const s=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(1.5,.28,1);s.position.y=2.05;s.renderOrder=9;return s;}
function rpUpsert(id,d){let a=RP.list.get(id);const friend=rpFriends().some(f=>f.uid===id)||(d.friends||[]).includes(RP.me);
  if(!a||a.friend!==friend||(d.photo!==undefined&&d.photo!==a.photo)){const keep=a;if(a)rpDrop(id);const ph=d.photo!==undefined?d.photo:keep?.photo;
    a={real:true,id,name:String(d.name||'Pescatore').slice(0,24),friend,photo:ph||null,obj:makeAngler({suit:'jacket',hat:'cap',c:friend?'#2e9b4f':'#2459c9',j:friend?'#3d5a3a':'#34465e',j2:friend?'#30492e':'#2a394d',p:'#2c3445',beard:ph?'none':'stubble',photo:ph||null}),
      pose:JSON.parse(JSON.stringify(POSES.stand)),target:'stand',walk:0,moving:false,speed:2.2,pos:keep?keep.pos.clone():new T.Vector3((d.x||0)+3.5,0,d.z||10),off:keep?keep.off:null,rotY:d.ry||0,holding:-1,reelSpin:0,crank:0,faceTo:null};
    a.lab=rpLabel(a.name,friend);a.obj.add(a.lab);scene.add(a.obj);RP.list.set(id,a);
    if(!keep){st.msg=`${friend?'🟢 Il tuo amico':'🔵'} ${a.name} è qui a pescare: toccalo per scrivergli.`;if(st.phase==='wait')setUI();}}
  // ognuno pesca dalla sua postazione: chi è nello stesso punto lo mostro qualche metro più in là
  if(a.off==null){let h=0;for(const ch of id)h=(h*31+ch.charCodeAt(0))>>>0;a.off=(h%2?1:-1)*(3.5+h%4);}
  a.name=String(d.name||a.name);a.seen=Date.now();a.tx=(d.x||0)+a.off;a.tz=d.z;a.try=d.ry;}
function rpDrop(id){const a=RP.list.get(id);if(!a)return;scene?.remove(a.obj);RP.list.delete(id);if(st.rtalk===id&&st.phase==='rtalk'){st.phase='wait';setUI();}}
function rpUpd(dt,t){if(AN.bub){AN.bubT-=dt;if(AN.bubT<=0){AN.obj.remove(AN.bub);AN.bub=null;}}if(!RP.on)return;RP.pubT-=dt;if(RP.pubT<=0){RP.pubT=3;rpPublish(false);}
  for(const a of RP.list.values()){if(a.tx!=null){const d=Math.hypot(a.tx-a.pos.x,a.tz-a.pos.z);if(d>15){a.pos.set(a.tx,0,a.tz);}else if(d>.15&&!a.moving){a.walkTarget={x:a.tx,z:a.tz,res:()=>{a.target='stand';a.faceTo=a.try;}};a.moving=true;a.target='stand';}}
    if(a.bub){a.bubT-=dt;if(a.bubT<=0){a.obj.remove(a.bub);a.bub=null;}}moveActor(a,dt);lerpPose(dt,6,a);applyPose(t,a);}
  RP.chk-=dt;if(RP.chk<=0){RP.chk=10;for(const [id,a] of RP.list)if(Date.now()-a.seen>90000)rpDrop(id);}}
function rpGotMsg(m){const a=RP.list.get(m.from);(RP.log[m.from]=RP.log[m.from]||[]).push({me:false,text:String(m.text||'').slice(0,300)});
  if(a)say(a,m.text,8);try{navigator.vibrate?.(80);}catch(e){}
  if(st.phase==='rtalk'&&st.rtalk===m.from){const el=document.getElementById('grlog');if(el)el.innerHTML=rpLog(m.from);}
  else{st.msg=`💬 ${escH(m.name||'Pescatore')}: ${escH(m.text)}${a?' (toccalo per rispondere)':''}`;if(st.phase==='wait')setUI();}}
const rpLog=id=>(RP.log[id]||[]).slice(-6).map(m=>`<div class="gs" style="margin:2px 0"><b>${m.me?'Tu':escH(RP.list.get(id)?.name||'')}:</b> ${escH(m.text)}</div>`).join('')||'<div class="gs">Scrivi un messaggio: lo vedrà sopra la tua testa nel suo gioco.</div>';
function rtalkHtml(){const a=RP.list.get(st.rtalk);if(!a)return `<div class="gpanel"><b>Non è più qui</b><div class="grow">${btn('↩ Torna a pescare','rback()','big')}</div></div>`;
  return `<div class="gpanel"><div class="grow" style="justify-content:space-between"><b>${a.friend?'🟢':'🔵'} ${escH(a.name)}</b><span class="gs">${a.friend?'tuo amico':'utente LenzApp'}</span></div><div id="grlog" style="max-height:30vh;overflow:auto">${rpLog(a.id)}</div>
    <div class="grow" style="gap:6px;margin-top:6px"><input id="grtx" maxlength="200" placeholder="Scrivi un messaggio…" autocomplete="off" style="flex:1;min-width:0;padding:11px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:500 16px Outfit,sans-serif;user-select:text;-webkit-user-select:text" onkeydown="if(event.key==='Enter')GAME.rsend()"><button class="gb" style="margin:0" onclick="GAME.rsend()">Invia</button></div>
    <div class="grow">${btn('↩ Torna a pescare','rback()')}</div></div>`;}
G.rtalk=id=>{const a=RP.list.get(id);if(!a)return;st.rtalk=id;a.faceTo=Math.atan2(-(AN.pos.x-a.pos.x),-(AN.pos.z-a.pos.z));AN.faceTo=Math.atan2(-(a.pos.x-AN.pos.x),-(a.pos.z-AN.pos.z));st.phase='rtalk';setUI();setTimeout(()=>document.getElementById('grtx')?.focus(),50);};
G.rback=()=>{st.phase='wait';st.msg='';setUI();};
G.rsend=()=>{const el=document.getElementById('grtx'),txt=(el?.value||'').trim().slice(0,200),C=rpCloud(),a=RP.list.get(st.rtalk);if(!txt||!C||!a)return;el.value='';
  C.ff.setDoc(C.ff.doc(C.db,'gamemsgs',C.user.uid+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,6)),{from:C.user.uid,name:C.name()||'Pescatore',to:a.id,spot:SPOT.id,text:txt,t:Date.now()}).catch(e=>{st.msg='Messaggio non inviato: '+(e.code||e.message);});
  (RP.log[a.id]=RP.log[a.id]||[]).push({me:true,text:txt});say(AN,txt,6);const lg=document.getElementById('grlog');if(lg)lg.innerHTML=rpLog(a.id);};
G._rp=RP;

/* ---------- interfaccia ---------- */
function mount(v){
  stop();root=document.createElement('div');root.id='gamebox';
  root.innerHTML=`<div id="g3"></div><div id="ghud"></div><div id="gui"></div><button id="gx" aria-label="Esci">✕</button><button id="gau" aria-label="Audio">${AU.on?'🔊':'🔇'}</button><button id="glamp" aria-label="Torcia" class="${st.lamp?'':'off'}">🔦</button><button id="gspd" aria-label="Velocità del tempo">⏩ ${st.speed}x</button><div id="gjoy"><i></i></div>`;
  document.body.appendChild(root);document.body.classList.add('gaming');ui=root.querySelector('#gui');hud=root.querySelector('#ghud');
  root.querySelector('#gx').onclick=()=>G.exit();
  root.querySelector('#gspd').onclick=()=>{const L=[1,2,4,8,16,32];G.setSpeed(L[(L.indexOf(st.speed)+1)%L.length]);};
  root.querySelector('#glamp').onclick=e=>{st.lamp=!st.lamp;LSS('lamp',st.lamp);e.currentTarget.classList.toggle('off',!st.lamp);click();};
  root.querySelector('#gau').onclick=e=>{AU.on=!AU.on;LSS('audio',AU.on);e.target.textContent=AU.on?'🔊':'🔇';if(!AU.on){seaSound(0);windSound(0);}};
  st.phase='load';st.gt=Date.now();
  if(v)v.innerHTML='<div class="card" style="text-align:center;padding:30px"><p class="mut">Il gioco è aperto a tutto schermo.</p><button class="btn" onclick="GAME.mount()">🎣 Riapri il gioco</button></div>';
  MP.three=loadThree().catch(e=>{throw e;});startMap();
}
// arrivo allo spot: meteo e mare reali di quel posto, poi la spiaggia in 3D
G.arrive=async i=>{cancelAnimationFrame(MP.raf);motor(false);dispose3D();removeEventListener('resize',sizeMap);setSpot(SPOTS[i]);st.phase='load';root.querySelector('#gmapc')?.remove();MP.c=null;
  ui.innerHTML=`<div class="gpanel"><b>🏖️ ${SPOT.name}</b><div class="gs">Scendi in spiaggia: leggo meteo e mare reali di questo posto…</div></div>`;
  try{const [three]=await Promise.all([MP.three||loadThree(),loadWx()]);T=three;if(!document.getElementById('gamebox'))return;
    renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(1.6,devicePixelRatio||1));cvs=renderer.domElement;root.querySelector('#g3').appendChild(cvs);
    ['#gspd','#glamp'].forEach(q=>{const e=root.querySelector(q);if(e)e.style.display='';});
    buildWorld();size();addEventListener('resize',size);bindLook();
    // all'inizio la mia postazione è ancora da montare
    MYG.forEach(o=>o.visible=false);if(CHAIRG)CHAIRG.visible=false;AN.pos.set(CHAIR.x+1.5,sandY(25),25);AN.target='stand';AN.pose=JSON.parse(JSON.stringify(POSES.stand));AN.rotY=0;
    st.phase='setup';setUI();raf=requestAnimationFrame(loop);rpStart();}
  catch(e){ui.innerHTML=`<div class="gpanel"><b>Il gioco 3D non si è caricato</b><div class="gs">${escH(e.message||e)}</div>${btn('↻ Riprova','mount()','big')}</div>`;}};
G.toMap=()=>{stop();mount(null);};
function stop(){rpStop();cancelAnimationFrame(MP.raf);dispose3D();removeEventListener('resize',sizeMap);windSound(0);motor(false);reelWhir(0);cancelAnimationFrame(raf);raf=0;removeEventListener('resize',size);try{renderer?.dispose();renderer?.forceContextLoss?.();}catch(e){}renderer=null;foams=[];clouds=[];st.rods=[];NPCS=[];MYG=[];CRABS=[];LANTERNS=[];CAM.p=null;document.getElementById('gamebox')?.remove();document.body.classList.remove('gaming');seaSound(0);}
addEventListener('hashchange',()=>{if(location.hash!=='#gioco'&&document.getElementById('gamebox'))stop();});
G.mount=mount;G.exit=()=>{if(st.phase!=='map'&&st.phase!=='parking'&&renderer&&SPOT){MP.from=String(SPOT.id||'').replace(/^g_/,'');stop();mount(null);return;}MP.from=null;stop();if(window.go)go('home');};
function size(){if(!renderer)return;const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<h?68:50;camera.updateProjectionMatrix();}
const btn=(t,f,cls='')=>`<button class="gb ${cls}" onclick="GAME.${f}">${t}</button>`;
const suggestLead=w=>w<.3?100:w<.6?125:w<1?150:w<1.6?175:200;
function rodStatus(r){if(r.state==='tangled')return '🧶 lenza incrociata';if(r.dismantled)return 'smontata';if(r.broken)return 'terminale rotto';if(r.held)return 'in mano';if(r.state==='hooked')return '🐟 PESCE ALLAMATO!';if(!r.bait)return 'da innescare';if(r.state==='bite')return '🔔 ABBOCCATA!';if(r.baitLeft<=0)return 'esca finita?';return r.baitLeft>20?'in pesca':'esca consumata';}
function setUI(){const p=st.phase;let h='';
  if(p==='setup'){const w=wxAt(st.gt),sug=suggestLead(w.wave);
    h=`<div class="gpanel"><b>🎣 ${SPOT.name} · ${gameDate().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</b>
      <div class="gs">Mare ${seaName(w.wave)} (${w.wave.toFixed(1).replace('.',',')} m), vento ${Math.round(w.ws)} km/h da ${windName(w.wd)}, acqua ${Math.round(w.sst)}°</div>
      <div class="grow"><span>Canne</span>${[2,3].map(n=>`<button class="gc ${st.nRods===n?'on':''}" onclick="GAME.setN(${n})">${n}</button>`).join('')}</div>
      <div class="grow"><span>Piombo</span>${[80,100,125,150,175,200].map(g=>`<button class="gc ${st.lead===g?'on':''}" onclick="GAME.setLead(${g})">${g} g</button>`).join('')}</div>
      <div class="gs">Consigliato ${sug} g: più leggero lanci più lontano, ma la corrente lo trascina.</div>
      <div class="grow"><span>Amo</span>${[['piccolo','n. 6'],['medio','n. 2'],['grande','2/0']].map(([k,n])=>`<button class="gc ${st.hook===k?'on':''}" onclick="GAME.setHook('${k}')">${n}</button>`).join('')}</div>
      <div class="grow"><span>Vestito</span>${[['waders','Salopette waders'],['jacket','Giacca'],['wetsuit','Muta'],['tracksuit','Tuta']].map(([k,n])=>`<button class="gc ${st.outfit===k?'on':''}" onclick="GAME.setOutfit('${k}')">${n}</button>`).join('')}</div>
      <div class="gs">Con salopette o muta entri in acqua senza bagnarti (e senza congelarti).</div>
      ${btn('🔧 Monta l\'attrezzatura','start(1)','big')}${btn('🎣 Già montato: vai subito in pesca','ready()')}</div>`;}
  else if(p==='mount'){const S2=st.steps,i=Math.min(st.stepI,S2.length-1),cur=S2[i];h=`<div class="gpanel slim"><div class="grow" style="justify-content:space-between"><b>🔧 Monta la postazione</b><b>${st.stepI}/${S2.length}</b></div>
    <div class="gbar dist" style="height:8px"><i style="width:${st.stepI/S2.length*100}%"></i></div>
    <div class="gs">${st.busy?'⏳ '+cur.e+' '+cur.t+'…':st.stepI<S2.length?'Prossimo: '+cur.e+' '+cur.t:''}${st.stepI+1<S2.length?`<br><small style="opacity:.7">poi: ${S2[st.stepI+1].t}</small>`:''}</div>
</div>`;}
  else if(p==='wait'){h=`<div class="gpanel slim"><div class="grods">${st.rods.map((r,i)=>`<button class="gr ${r.state==='bite'||r.state==='hooked'||r.state==='tangled'?'alert':''}" onclick="GAME.rod(${i})" ${st.busy?'disabled':''}><b>Canna ${i+1}</b><small>${r.bait?B[r.bait].n:'senza esca'}${r.dist?' · '+Math.round(r.dist)+' m':''}</small><small>${rodStatus(r)}</small></button>`).join('')}</div>
    ${st.busy?'':`<div class="grow" style="justify-content:center;flex-wrap:nowrap;gap:5px;overflow-x:auto"><button class="gc" onclick="GAME.bagView()">🧺 ${st.bag.length}</button>${skipUp()?'<button class="gc" onclick="GAME.skip(1)">🌅 Alba</button>':'<button class="gc" onclick="GAME.skip(0)">🌇 Tramonto</button>'}${(()=>{const ni=NPCS.findIndex(a=>a.pos.distanceTo(AN.pos)<3.2);return ni>=0?`<button class="gc" style="background:#2fe0cf;color:#03282a" onclick="GAME.talk(${ni})">💬 Parla con ${NPCS[ni].per.name}</button>`:'';})()}${nearCrab()?'<button class="gc" style="background:#ffb547;color:#3a2400" onclick="GAME.crab()">🦀 Prendi il granchio</button>':''}<button class="gc" onclick="GAME.toMap()">🚗 Spot</button><button class="gc" onclick="GAME.center()" title="Guarda le canne">🎯</button>${AN.target!=='sit'?'<button class="gc" onclick="GAME.sit()">🪑 Siediti</button>':'<button class="gc" onclick="GAME.rise()">🚶 Alzati</button>'}</div>`}${st.msg?`<div class="gs" style="text-align:center">${st.msg}</div>`:''}</div>`;}
  else if(p==='atrod'){const r=st.rods[st.sel];h=`<div class="gpanel"><b>Canna ${st.sel+1}</b><div class="gs">${r.bait?B[r.bait].n+' a '+Math.round(r.dist)+' m · '+rodStatus(r):'Senza esca'}</div>
    ${r.state==='bite'?btn('⚡ FERRA!','strike()','big hot'):''}${r.state==='hooked'?btn('🌀 Prendi la canna e recupera','fightHooked()','big hot'):''}${r.state==='tangled'?btn('🧶 Recupera e districa','untangle()','big hot'):''}${r.dismantled?btn('🔧 Rimonta la canna','remount()','big'):(r.state==='tangled'?'':r.bait?btn('🌀 Recupera e cambia esca','rebait()'):btn('🪝 Innesca','rebait()','big'))+(r.state==='tangled'?'':btn('🔧 Montatura · '+r.lead+' g, amo '+({piccolo:'n.6',medio:'n.2',grande:'2/0'})[r.hook]+', '+({lungo:'lungo',corto:'corto','2ami':'2 ami'})[r.rig],'rigAt()'))+(r.bait?'':btn('🧰 Smonta la canna','dismantle()'))}${btn('🪑 Torna a sedere','back()')}</div>`;}
  else if(p==='rig'){const r=st.rods[st.sel],w=wxAt(st.gt);h=`<div class="gpanel"><b>🔧 Montatura della canna ${st.sel+1}</b>${r.broken?'<div class="gs warn">La lenza si è rotta: rifai il terminale (perdi piombo e amo).</div>':''}
    <div class="grow"><span>Piombo</span>${[80,100,125,150,175,200].map(g=>`<button class="gc ${r.lead===g?'on':''}" onclick="GAME.setRig('lead',${g})">${g} g</button>`).join('')}</div>
    <div class="gs">Con mare ${seaName(w.wave)} servono almeno ${suggestLead(w.wave)} g, sennò la corrente trascina il piombo verso riva.</div>
    <div class="grow"><span>Amo</span>${[['piccolo','n. 6'],['medio','n. 2'],['grande','2/0']].map(([k,n])=>`<button class="gc ${r.hook===k?'on':''}" onclick="GAME.setRig('hook','${k}')">${n}</button>`).join('')}</div>
    <div class="grow"><span>Terminale</span>${[['lungo','lungo 2 m'],['corto','corto 70 cm'],['2ami','trave a 2 ami']].map(([k,n])=>`<button class="gc ${r.rig===k?'on':''}" onclick="GAME.setRig('rig','${k}')">${n}</button>`).join('')}</div>
    <div class="gs">Lungo: più naturale con mare calmo (orate, mormore). Corto: lancia meglio e regge il mare mosso. Due ami: più abboccate, lancio più corto.</div>${btn(r.broken?'🔧 Rifai il terminale':'✅ Fatto','rigDone()','big')}</div>`;}
  else if(p==='snag'){const sn=st.snag;h=`<div class="gpanel"><b>⚠️ Incagliato!</b><div class="gs">${sn.msg||'Il piombo si è incastrato sul fondo.'}</div>${btn('💪 Tira forte','snagPull()','big')}${btn('↔️ Spostati e cambia angolo','snagMove()')}${btn('🏊 Entra in acqua e nuota fino all\'incaglio','snagSwim()')}</div>`;}
  else if(p==='talk'){const tk=st.talk,a=NPCS[tk.i];h=`<div class="gpanel"><b>💬 ${a.per.name} · ${a.per.age} anni, ${a.per.town}</b><div class="gs" style="font-size:15.5px;background:rgba(255,255,255,.08);border-radius:12px;padding:8px 10px">«${escH(tk.txt)}»</div>
    <div class="gtalk">${Q.map(([k,n])=>`<button class="gc" onclick="GAME.ask('${k}')">${n}</button>`).join('')}</div></div>`;}
  else if(p==='pilot'){const v=VEH.obj,r=st.rods[st.sel];h=`<div class="gpanel slim"><div class="grow" style="justify-content:space-between"><b>${VEH.type==='drone'?'🛸 Guida il drone':'🚤 Guida il barchino'}</b><b id="gvd">—</b></div>
    <div class="gs">Joystick: su verso il largo, giù verso riva, destra e sinistra lungo la costa. Fermati sul punto e sgancia.</div><button class="gb big" id="gdrop" onclick="GAME.drop()" disabled>🎯 Fermati per sganciare</button></div>`;}
  else if(p==='bait')h=`<div class="gpanel"><b>🪝 Innesca la canna ${st.sel+1}</b><div class="gbaits">${BAITS.filter(b=>!b.lim||st.inv[b.k]>0).map(b=>`<button class="gbt" onclick="GAME.bait('${b.k}')"><span>${b.e}</span><b>${b.n}${b.lim?' ('+st.inv[b.k]+')':''}</b><small>${b.d}</small></button>`).join('')}</div>${btn('🔧 Cambia montatura prima','rig()')}</div>`;
  else if(p==='cast'&&st.castMode!=='mano'){const mx=st.castMode==='drone'?400:300;st.castDist=Math.min(st.castDist,mx);h=`<div class="gpanel"><b>${st.castMode==='drone'?'🛸 Drone':'🚤 Barchino elettrico'} · ${B[st.rods[st.sel].bait].n}</b>
    <div class="grow">${[['mano','🎣 A mano'],['barchino','🚤 Barchino'],['drone','🛸 Drone']].map(([k,n])=>`<button class="gc ${st.castMode===k?'on':''}" onclick="GAME.mode('${k}')">${n}</button>`).join('')}</div>
    <div class="gs">${st.castMode==='drone'?'Lo guidi tu con il joystick (su = verso il largo) fino a 400 m, ti fermi sul punto e sganci esca e piombo. Poi torna da solo.':'Lo guidi tu con il joystick (su = verso il largo) fino a 300 m, ti fermi sul punto e sganci dalla tramoggia. Poi torna da solo. Con mare molto mosso rischia di ribaltarsi nei frangenti.'}</div>${btn('🚀 Parti','deliver()','big')}</div>`;}
  else if(p==='cast')h=`<div class="gpanel"><b>🎯 Lancia · ${B[st.rods[st.sel].bait].n}</b><div class="grow">${[['mano','🎣 A mano'],['barchino','🚤 Barchino'],['drone','🛸 Drone']].map(([k,n])=>`<button class="gc ${st.castMode===k?'on':''}" onclick="GAME.mode('${k}')">${n}</button>`).join('')}</div><div class="gs">Tieni premuto per caricare, rilascia nella zona verde. ${(()=>{const w=wxAt(st.gt),hp=windHelp(w.wd);return w.ws>12?(hp>.3?'Vento da terra: ti aiuta.':hp<-.3?'Vento dal mare: lancerai più corto.':'Vento laterale.'):'';})()}</div><div class="gpow"><i id="gpw"></i><s></s></div><button class="gb big" id="gcastb">🎣 Carica e lancia</button></div>`;
  else if(p==='fight')h=`<div class="gpanel"><b id="gfti">Combattimento</b><div class="gbar"><i id="gten"></i><span>tensione</span></div><div class="gbar dist"><i id="gdis"></i><span id="gdt">distanza</span></div>
    <div class="grow"><span>Frizione</span><input type="range" min="1" max="10" value="${st.fight?.drag||5}" oninput="GAME.drag(this.value)" style="flex:1"></div><div class="gs" id="galert" style="color:#ffb547;font-weight:700;min-height:0"></div><button class="gb big" id="greel">🌀 Tieni premuto per recuperare</button></div>`;
  else if(p==='catch'){const c=st.catchShow;h=`<div class="gpanel">${c.fish?'<div class="gfish"><canvas id="gfc" width="600" height="260"></canvas></div>':''}
    <b style="font-size:22px">${c.fish?escH(c.sp.n):c.txt}</b>${c.fish?`<div class="gs" style="font-size:17px">${c.crab?'larghezza '+c.l+' cm':c.l+' cm'} · ${c.w<1?Math.round(c.w*1000)+' g':c.w.toFixed(2).replace('.',',')+' kg'}${c.rec?' · 🏆 record!':''}</div>
    ${c.sp.legal&&c.l<c.sp.legal?`<div class="gs warn">⚠️ Sotto misura (minimo ${c.sp.legal} cm): va rilasciato.</div>`:''}${c.crab?'<div class="gs">Specie invasiva: non va rimessa in mare.</div>':''}`:`<div class="gs">${c.why||''}</div>`}
    <div class="grow" style="justify-content:center">${c.fish?(c.crab?btn('🪣 Nel secchio','keep()','big'):(c.sp.legal&&c.l<c.sp.legal?btn('💚 Rilascia','release()','big'):btn('💚 Rilascia','release()')+btn('🧺 Tieni','keep()','big'))):(c.left?btn('↩ Rimetti sul picchetto','putBack()'):'')+btn('🪝 Innesca di nuovo','rebait()','big')}</div></div>`;}
  else if(p==='bag')h=`<div class="gpanel"><b>🧺 Il tuo carniere</b><div class="gs">Oggi: ${st.bag.length} pesci · ${st.bag.reduce((a,c)=>a+c.w,0).toFixed(2).replace('.',',')} kg · Totale: ${st.total.n} pesci, ${st.total.pts} punti</div>
    <div class="glist">${st.bag.slice().reverse().map(c=>`<div>${c.rel?'💚':'🧺'} <b>${escH(c.n)}</b> ${c.l} cm · ${c.w<1?Math.round(c.w*1000)+' g':c.w.toFixed(2).replace('.',',')+' kg'} <small>${new Date(c.t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})} · ${escH(c.bait)}</small></div>`).join('')||'<div class="gs">Ancora niente: pazienza, è surfcasting!</div>'}</div>
    <div class="gs">Record: ${Object.entries(st.best).map(([k,v])=>`${escH(k)} ${v.toFixed(2).replace('.',',')} kg`).join(' · ')||'nessuno'}</div>${btn('↩ Torna alle canne','toWait()','big')}</div>`;
  else if(p==='rtalk')h=rtalkHtml();
  else if(p==='busy')h=st.msg?`<div class="gpanel slim"><div class="gs" style="text-align:center">${st.msg}</div></div>`:'';
  ui.innerHTML=h;
  const cb=document.getElementById('gcastb');if(cb){cb.onpointerdown=e=>{e.preventDefault();ac();st.cast={p:0,dir:1,on:true};AN.target='castBack';};const rel=()=>{if(st.cast?.on)doCast();};cb.onpointerup=rel;cb.onpointerleave=rel;}
  const rb=document.getElementById('greel');if(rb){const on=e=>{e.preventDefault();if(st.fight)st.fight.reel=true;},off=()=>{if(st.fight)st.fight.reel=false;};rb.onpointerdown=on;rb.onpointerup=off;rb.onpointerleave=off;rb.onpointercancel=off;}
  if(p==='catch')setTimeout(drawFishCard,0);
  const jb=root?.querySelector('#gjoy');if(jb&&!(p==='wait'&&!st.busy)&&p!=='pilot')jb.style.display='none';
}
G.setN=n=>{st.nRods=n;LSS('nrods',n);setUI();};G.setLead=g=>{st.lead=g;LSS('lead',g);setUI();};G.setHook=k=>{st.hook=k;LSS('hook',k);setUI();};
G.setSpeed=s=>{st.speed=s;LSS('speed',s);const b=document.getElementById('gspd');if(b)b.textContent='⏩ '+s+'x';if(st.phase==='wait')setUI();};G.bagView=()=>{st.phase='bag';setUI();};G.toWait=()=>{st.phase='wait';setUI();};G.drag=v=>{if(st.fight)st.fight.drag=+v;};
G.setOutfit=k=>{st.outfit=k;LSS('outfit',k);setUI();};
function setPlayerLook(){const old=AN.obj,ph=myPhoto();const n=makeAngler({suit:st.outfit,hat:'cap',beard:ph?'none':'stubble',photo:ph,j:'#2f5544',j2:'#264638',c:'#b8352a',p:'#2c3445'});
  n.position.copy(old.position);n.rotation.copy(old.rotation);scene.remove(old);scene.add(n);AN.obj=n;
  AN.obj.userData.J.head.add(headLamp);const lt=new T.Object3D();lt.position.set(0,-1.2,-6);AN.obj.userData.J.head.add(lt);headLamp.target=lt;}
function buildSteps(){const S2=[],q=st.auto?.55:1,sp=st.auto?3.4:2.4;
  S2.push({e:'🚶',t:'Scendi in spiaggia con l\'attrezzatura',f:async()=>{await walkTo(CHAIR.x+.6,CHAIR.z+.9,sp);AN.faceTo=0;}});
  S2.push({e:'🧺',t:'Stendi il telo e appoggia l\'attrezzatura',f:async()=>{pose('bend');await sleep(1.2*q);MYG.forEach(o=>o.visible=true);click();pose('stand');}});
  S2.push({e:'🪑',t:'Apri la sedia',f:async()=>{pose('bend');await sleep(.8*q);CHAIRG.visible=true;click();pose('stand');}});
  st.rods.forEach((r,i)=>S2.push({e:'📍',t:`Pianta il picchetto ${i+1}`,f:async()=>{await walkTo(r.x+.5,ROD_Z+.9,sp);AN.faceTo=0;pose('bend');await sleep(1*q);burst(new T.Vector3(r.x,.1,ROD_Z),.25);r.spike.visible=true;click();pose('stand');}}));
  st.rods.forEach((r,i)=>S2.push({e:'🎣',t:`Monta la canna ${i+1}: mulinello, anelli e terminale`,f:async()=>{await walkTo(CHAIR.x+1.4,CHAIR.z+.4,sp);pose('bend');await sleep(1.8*q);r.obj.visible=true;r.held=true;AN.holding=i;pose('hold');await sleep(.3);
    await walkTo(r.x+.55,ROD_Z+1.3,sp);AN.faceTo=0;await putRod(i);}}));
  S2.push({e:'⚓',t:'Prepara piombi e terminali di scorta',f:async()=>{await walkTo(CHAIR.x+1,CHAIR.z-.3,sp);pose('bend');await sleep(1.2*q);pose('stand');}});
  if(night()>.3)S2.push({e:'🏮',t:'Accendi la lanterna e le luci chimiche',f:async()=>{pose('bend');await sleep(.7*q);click();pose('stand');}});
  return S2;}
G.doStep=()=>seq(async()=>{const S2=st.steps;if(st.stepI>=S2.length)return;setUI();await S2[st.stepI].f();st.stepI++;if(st.stepI>=S2.length)return mountDone();setUI();});
G.autoSteps=()=>seq(async()=>{st.auto=true;const S2=st.steps;while(st.stepI<S2.length){setUI();await S2[st.stepI].f();st.stepI++;}mountDone();});
function mountDone(){st.phase='wait';st.msg='';setUI();}
G.start=auto=>{setPlayerLook();setupRods();st.rods.forEach(r=>{placeRodOnSpike(r);r.spike.visible=false;r.obj.visible=false;});st.auto=!!auto;st.steps=buildSteps();st.stepI=0;st.phase='mount';setUI();if(auto)G.autoSteps();};
G.ready=()=>{MYG.forEach(o=>o.visible=true);if(CHAIRG)CHAIRG.visible=true;AN.pos.set(CHAIR.x,CHAIR.z*.035,CHAIR.z-.05);AN.target='sit';AN.pose=JSON.parse(JSON.stringify(POSES.sit));AN.rotY=0;AN.faceTo=0;G.startOld();};
G.startOld=()=>{setPlayerLook();setupRods();st.rods.forEach(placeRodOnSpike);st.phase='wait';st.msg='';setUI();};

/* ---------- movimenti del pescatore (sequenze) ---------- */
const sleep=s=>new Promise(r=>setTimeout(r,s*1000));
function pose(name){AN.target=name;}
function walkTo(x,z,speed=1.4){return new Promise(res=>{AN.walkTarget={x,z,res};AN.speed=speed;AN.moving=true;});}
function faceSea(){AN.faceTo=0;}
async function standUp(){if(AN.target!=='sit')return;pose('stand');AN.pos.z-=.05;await sleep(.4);}
async function sitDown(){AN.faceTo=0;pose('sit');await sleep(.45);}
async function goToRod(i,run){const r=st.rods[i];await standUp();await walkTo(r.x+.55,ROD_Z+1.3,run?4.6:2.8);AN.faceTo=0;await sleep(.25);}
async function pickRod(i){const r=st.rods[i];pose('bend');await sleep(.55);r.held=true;AN.holding=i;pose('hold');await sleep(.5);}
async function putRod(i){const r=st.rods[i];pose('bend');await sleep(.55);r.held=false;AN.holding=-1;placeRodOnSpike(r);pose('stand');await sleep(.4);}
async function stepBack(i){const r=st.rods[i];await walkTo(r.x+.9,ROD_Z+3,2);AN.faceTo=0;pose('stand');}
G.sit=()=>seq(async()=>{st.phase='busy';st.msg='';setUI();if(AN.holding>=0)await putRod(AN.holding);await backToChair();LOOK.yaw=0;LOOK.pitch=0;st.msg='';st.phase='wait';setUI();});
async function backToChair(){await walkTo(CHAIR.x,CHAIR.z-.05,2.8);await sitDown();}
const seq=async f=>{if(st.busy)return;st.busy=true;try{await f();}finally{st.busy=false;if(st.phase==='wait')setUI();}};

G.rod=i=>seq(async()=>{st.sel=i;const r=st.rods[i];st.phase='busy';st.msg=r.state==='bite'||r.state==='hooked'?'🏃 Corre alla canna!':'🚶 Va alla canna '+(i+1)+'…';setUI();
  await goToRod(i,r.state==='bite'||r.state==='hooked');st.phase='atrod';st.msg='';setUI();});
G.back=()=>seq(async()=>{st.phase='busy';st.msg='';setUI();if(AN.holding>=0)await putRod(AN.holding);await backToChair();st.phase='wait';setUI();});
G.rebait=()=>seq(async()=>{const r=st.rods[st.sel];st.phase='busy';st.msg=r.dist?'🌀 Recupera la lenza…':'';setUI();
  if(!r.held)await pickRod(st.sel);
  if(r.dist>0){pose('reel');const d0=r.dist,snagAt=r.dist>20&&Math.random()<.12?rnd(.2,.8):2;for(let t=0;t<1;t+=.05){if(t>=snagAt){AN.reelSpin=0;st.snag={r,stage:'rebait',at:t};st.phase='snag';vib([120,60,120]);setUI();return;}r.dist=d0*(1-t);AN.reelSpin=1;await sleep(.07);}r.dist=0;AN.reelSpin=0;}
  afterRecover(r);});
function afterRecover(r){r.bait=null;r.state='idle';r.bitePlan=null;r.sinker.visible=false;r.dist=0;r.driftMsg=0;pose('bend');st.phase=r.broken?'rig':'bait';setUI();}
G.snagPull=()=>seq(async()=>{const sn=st.snag;if(!sn)return;st.phase='busy';setUI();pose('strike');AN.reelSpin=1;vib([200]);await sleep(1);AN.reelSpin=0;
  const u=Math.random();if(u<.45){st.snag=null;st.msg='Liberato! Il piombo si è sbloccato.';if(sn.stage==='fight'){st.fight.snag=false;st.phase='fight';pose('reel');setUI();return;}pose('reel');for(let t=0;t<1;t+=.08){sn.r.dist*=.9;AN.reelSpin=1;await sleep(.06);}AN.reelSpin=0;afterRecover(sn.r);return;}
  if(u<.8){splash(.2);st.snag=null;sn.r.broken=true;sn.r.bait=null;sn.r.dist=0;sn.r.sinker.visible=false;AN.reelSpin=0;pose('hold');
    if(sn.stage==='fight'){const f=st.fight;st.fight=null;sn.r.state='idle';showCatch({fish:false,txt:'Lenza rotta!',why:'Incagliato con il pesce attaccato: la lenza ha ceduto. Rifai il terminale.'});return;}
    st.msg='💥 La lenza si è rotta: hai perso piombo e amo.';st.phase='rig';setUI();return;}
  st.snag.msg='Niente da fare, è ancora incastrato. Prova a cambiare angolo.';pose('reel');st.phase='snag';setUI();});
G.snagSwim=()=>seq(async()=>{const sn=st.snag;if(!sn)return;const r=sn.r,w=wxAt(st.gt);st.phase='busy';st.msg='🏊 Posa la canna ed entra in acqua…';setUI();
  if(r.held)await putRod(r.i);const back={x:AN.pos.x,z:AN.pos.z};const far=Math.min(r.dist*.7,45),tx=lerp(r.x,r.sx,far/Math.max(1,r.dist));
  await walkTo(r.x+.3,-.5,2.6);st.msg=(w.sst<18&&!['waders','wetsuit'].includes(st.outfit))?`🥶 Brrr, l'acqua è a ${Math.round(w.sst)}°!`:'🏊 Nuota lungo la lenza…';setUI();
  await walkTo(tx,-far,2.4);st.msg='🤿 Si immerge e libera il piombo…';setUI();AN.dive=1;splash(.3);burst(new T.Vector3(AN.pos.x,0,AN.pos.z),.6);await sleep(2.2);AN.dive=0;burst(new T.Vector3(AN.pos.x,0,AN.pos.z),.6);
  const ok=Math.random()<.85;st.msg=ok?'Liberato! Torna a riva.':'Non ci arriva: è troppo profondo.';setUI();await walkTo(r.x+.55,ROD_Z+1.3,2.6);AN.faceTo=0;await pickRod(r.i);
  if(!ok){st.snag.msg='A nuoto non ci sei arrivato. Tira forte o cambia angolo.';st.phase='snag';setUI();return;}
  st.snag=null;if(sn.stage==='fight'){if(Math.random()<.5&&st.fight){st.fight.snag=false;st.fight.dist=Math.max(5,st.fight.dist*.8);st.phase='fight';pose('reel');st.msg='';setUI();return;}const f=st.fight;st.fight=null;r.state='idle';r.bait=null;r.dist=0;r.sinker.visible=false;showCatch({fish:false,txt:'Liberato, ma il pesce è scappato',why:'Mentre nuotavi il pesce si è slamato.'});return;}
  pose('reel');for(let t=0;t<1;t+=.08){r.dist*=.9;AN.reelSpin=1;await sleep(.06);}AN.reelSpin=0;afterRecover(r);});
G.snagMove=()=>seq(async()=>{const sn=st.snag;if(!sn)return;st.phase='busy';setUI();const side=Math.random()<.5?-1:1;await walkTo(AN.pos.x+side*3.5,AN.pos.z,1.6);AN.faceTo=0;pose('reel');AN.reelSpin=1;await sleep(.8);AN.reelSpin=0;
  if(Math.random()<.65){st.snag=null;st.msg='Cambiando angolo il piombo si è liberato.';if(sn.stage==='fight'){st.fight.snag=false;st.phase='fight';setUI();return;}for(let t=0;t<1;t+=.08){sn.r.dist*=.9;AN.reelSpin=1;await sleep(.06);}AN.reelSpin=0;afterRecover(sn.r);return;}
  st.snag.msg='Ancora incastrato. Tira forte o prova dall\'altro lato.';st.phase='snag';setUI();});
G.putBack=()=>seq(async()=>{st.phase='busy';setUI();await putRod(st.sel);await stepBack(st.sel);st.phase='wait';setUI();});
G.rigAt=()=>seq(async()=>{const r=st.rods[st.sel];st.phase='busy';setUI();if(r.dist>0){await pickRod(st.sel);pose('reel');const d0=r.dist;for(let t=0;t<1;t+=.06){r.dist=d0*(1-t);AN.reelSpin=1;await sleep(.06);}AN.reelSpin=0;r.dist=0;r.bait=null;r.state='idle';r.sinker.visible=false;}else if(!r.held)await pickRod(st.sel);st.phase='rig';setUI();});
G.dismantle=()=>seq(async()=>{const r=st.rods[st.sel];st.phase='busy';st.msg='🧰 Smonta la canna e la mette nel fodero…';setUI();if(!r.held)await pickRod(st.sel);pose('bend');await sleep(1.6);r.held=false;AN.holding=-1;r.dismantled=true;r.obj.visible=false;r.line.visible=false;pose('stand');st.msg='Canna '+(r.i+1)+' smontata.';st.phase='wait';setUI();});
G.remount=()=>seq(async()=>{const r=st.rods[st.sel];st.phase='busy';st.msg='🔧 Monta la canna…';setUI();pose('bend');await sleep(1.8);r.dismantled=false;r.obj.visible=true;placeRodOnSpike(r);pose('stand');st.msg='';st.phase='atrod';setUI();});
G.rig=()=>{st.phase='rig';setUI();};
G.setRig=(k,v)=>{const r=st.rods[st.sel];r[k]=v;click();setUI();};
G.rigDone=()=>seq(async()=>{const r=st.rods[st.sel];st.phase='busy';st.msg=r.broken?'🔧 Rifà il terminale…':'🔧 Cambia la montatura…';setUI();pose('bend');await sleep(r.broken?2.2:1.4);r.broken=false;pose('hold');st.msg='';st.phase='bait';setUI();});
G.bait=k=>{const r=st.rods[st.sel];if(B[k].lim){if(!(st.inv[k]>0))return;st.inv[k]--;}r.bait=k;r.baitLeft=B[k].life*(k==='cozza'&&st.hook==='piccolo'?1.2:1);click();pose('hold');st.phase='cast';setUI();};
function doCast(){const c=st.cast;c.on=false;const r=st.rods[st.sel],w=wxAt(st.gt);
  const p=c.p,green=p>=.78&&p<=.92,q=green?1:p<.78?p/.78*.9:.7;
  // zona verde: fino a 150 m; con poca potenza anche solo 10 m; oltre la zona verde il lancio si sporca
  const base=green?150*(1-Math.abs(p-.85)*.45):p<.78?lerp(10,138,Math.pow(p/.78,1.15)):lerp(138,60,(p-.92)/.08);
  const leadF=clamp(1.15-((r.lead||st.lead)-100)/400,.85,1.1)*(r.rig==='2ami'?.93:r.rig==='corto'?1.04:1),baitF=r.bait==='cefalotto'?.55:r.bait==='sarda'||r.bait==='seppia'?.85:1,wind=1+windHelp(w.wd)*clamp(w.ws/60,0,.35);
  const dist=clamp(base*leadF*baitF*wind+rnd(-3,3),8,150);st.cast=null;
  seq(async()=>{st.phase='busy';st.msg='';setUI();pose('castFwd');whoosh();await sleep(.18);
    // il piombo vola: parabola dalla cima al punto d'arrivo
    const tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const drift=(Math.sin((w.wd-FACE)*R))*w.ws/40*3;const end=new T.Vector3(r.x+drift+rnd(-2,2),0,-dist);
    r.flight={a:tip.clone(),b:end,t:0,dur:1.1+dist/120};r.sinker.visible=true;r.dist=0.01;r.state='flying';
    await sleep(r.flight.dur);splash();burst(end,1);r.flight=null;r.dist=dist;r.sx=end.x;r.sz=end.z;r.state='fishing';r.landT=st.gt;
    st.msg=q>=1?`Lancio perfetto: ${Math.round(dist)} m!`:q>.8?`Buon lancio: ${Math.round(dist)} m`:`Lancio corto: ${Math.round(dist)} m`;checkTangle(r);setUI();
    pose('hold');await sleep(.6);await putRod(st.sel);await stepBack(st.sel);st.phase='wait';if(r.state!=='tangled')st.msg='Tocca la sedia per sederti, o un\'altra canna per andarci.';setUI();});}

/* ---------- barchino elettrico e drone ---------- */
G.mode=k=>{st.castMode=k;setUI();};G.cdist=v=>{st.castDist=+v;LSS('cdist',st.castDist);const e=document.getElementById('gcdv');if(e)e.textContent=v+' m';};
const VEH={};
function makeBoat(){const g=new T.Group(),y=new T.MeshStandardMaterial({color:'#f2c21b',roughness:.4}),d=new T.MeshStandardMaterial({color:'#2b2f36',roughness:.5});
  const hull=new T.Mesh(new T.BoxGeometry(.48,.16,.85),y);hull.position.y=.08;g.add(hull);const bow=new T.Mesh(new T.CylinderGeometry(.24,.24,.16,16,1,false,0,Math.PI),y);bow.rotation.set(0,Math.PI/2,0);bow.position.set(0,.08,-.425);g.add(bow);
  for(const s of[-1,1]){const hop=new T.Mesh(new T.BoxGeometry(.16,.12,.24),d);hop.position.set(s*.11,.22,-.1);g.add(hop);const pr=new T.Mesh(new T.CylinderGeometry(.04,.04,.08,10),d);pr.rotation.x=Math.PI/2;pr.position.set(s*.15,.04,.46);g.add(pr);}
  const ant=new T.Mesh(new T.CylinderGeometry(.004,.004,.3,4),d);ant.position.set(.18,.3,.3);g.add(ant);
  const led=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(255,60,60,1)'),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));led.scale.set(.5,.5,.5);led.position.set(0,.35,.3);g.add(led);g.userData.led=led;
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
function makeDrone(){const g=new T.Group(),w=new T.MeshStandardMaterial({color:'#e9ecef',roughness:.35}),d=new T.MeshStandardMaterial({color:'#2b2f36',roughness:.4});
  const b=new T.Mesh(new T.BoxGeometry(.28,.1,.36),w);g.add(b);const props=[];
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const arm=new T.Mesh(new T.CylinderGeometry(.012,.012,.32,6),d);arm.rotation.z=Math.PI/2;arm.rotation.y=Math.atan2(sz,sx);arm.position.set(sx*.13,0,sz*.13);g.add(arm);
    const m=new T.Mesh(new T.CylinderGeometry(.03,.03,.05,8),d);m.position.set(sx*.25,.03,sz*.25);g.add(m);const pr=new T.Mesh(new T.BoxGeometry(.34,.006,.03),new T.MeshStandardMaterial({color:'#444',transparent:true,opacity:.7}));pr.position.set(sx*.25,.06,sz*.25);g.add(pr);props.push(pr);
    const led=new T.Sprite(new T.SpriteMaterial({map:glowTex(sz<0?'rgba(80,255,120,1)':'rgba(255,60,60,1)'),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));led.scale.set(.35,.35,.35);led.position.set(sx*.25,-.03,sz*.25);g.add(led);}
  const cam=new T.Mesh(new T.SphereGeometry(.035,10,8),d);cam.position.set(0,-.07,-.12);g.add(cam);
  const hook=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,-.05,0),new T.Vector3(0,-2.5,0)]),new T.LineBasicMaterial({color:0xdddddd,transparent:true,opacity:.6}));g.add(hook);
  const pay=new T.Mesh(new T.SphereGeometry(.06,8,6),MAT.lead);pay.position.y=-2.55;g.add(pay);g.userData={props,pay,hook};g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
// motore dell'auto: 4 cilindri con giri e marce, rumore delle gomme sull'asfalto e vento ad alta velocità
function carSound(v){const c=AU.on&&v>.015?ac():null,S=AU.car;if(!c){if(S&&AU.ctx)S.out.gain.setTargetAtTime(0,AU.ctx.currentTime,.25);return;}
  if(!S){const out=c.createGain();out.gain.value=0;out.connect(c.destination);
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.Q.value=.9;lp.frequency.value=300;
    const o1=c.createOscillator(),o2=c.createOscillator(),o3=c.createOscillator();o1.type='sawtooth';o2.type='triangle';o2.detune.value=9;o3.type='sine';
    const g1=c.createGain();g1.gain.value=.35;const g2=c.createGain();g2.gain.value=.6;const g3=c.createGain();g3.gain.value=1;o1.connect(g1).connect(lp);o2.connect(g2).connect(lp);o3.connect(g3).connect(lp);
    const am=c.createGain();am.gain.value=.7;const lfo=c.createOscillator();lfo.type='sine';const lg=c.createGain();lg.gain.value=.22;lfo.connect(lg).connect(am.gain);lp.connect(am).connect(out);
    const nb=c.createBufferSource();nb.buffer=noiseBuf(c);nb.loop=true;
    const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=420;bp.Q.value=.6;const tire=c.createGain();tire.gain.value=0;nb.connect(bp).connect(tire).connect(out);
    const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=1100;const wind=c.createGain();wind.gain.value=0;nb.connect(hp).connect(wind).connect(out);
    [o1,o2,o3,lfo,nb].forEach(x=>x.start());AU.car={out,lp,o1,o2,o3,lfo,tire,wind};}
  const A=AU.car,t=c.currentTime,kmh=Math.min(v*100,320),G=[0,25,50,80,115,160,1e9];let g=1;while(kmh>G[g])g++;
  const lo=G[g-1],hi=Math.min(G[g],330),rpm=900+(g>1?700:0)+clamp((kmh-lo)/(hi-lo),0,1)*(g===1?2600:2300),fire=rpm/30;// 4 cilindri: 2 scoppi a giro
  A.o1.frequency.setTargetAtTime(fire,t,.08);A.o2.frequency.setTargetAtTime(fire,t,.08);A.o3.frequency.setTargetAtTime(fire/2,t,.08);A.lfo.frequency.setTargetAtTime(rpm/60,t,.08);
  A.lp.frequency.setTargetAtTime(160+rpm*.11,t,.1);A.out.gain.setTargetAtTime(.11,t,.2);
  A.tire.gain.setTargetAtTime(Math.min(.3,kmh/400),t,.2);A.wind.gain.setTargetAtTime(clamp((kmh-120)/900,0,.12),t,.3);}
function motor(on,f){if(!on)carSound(0);const c=AU.on&&on?ac():null;if(!c){if(AU.mot)AU.mot.v.gain.setTargetAtTime(0,AU.ctx.currentTime,.2);return;}
  if(!AU.mot){const o=c.createOscillator();o.type='sawtooth';const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=700;const v=c.createGain();v.gain.value=0;o.connect(fl).connect(v).connect(c.destination);o.start();AU.mot={o,v};}
  AU.mot.o.frequency.setTargetAtTime(f,c.currentTime,.1);AU.mot.v.gain.setTargetAtTime(.018,c.currentTime,.2);}
// guida manuale: il joystick muove il mezzo; da fermo si può sganciare
function pilot(dt,t){const v=VEH.obj,r=st.rods[st.sel];if(!VEH.manual||!v)return;const maxD=VEH.type==='drone'?400:300,spd=VEH.type==='drone'?11:6.5;
  const tx=JOY.on?JOY.x*spd:0,tz=JOY.on?JOY.y*spd:0;VEH.vel.x=lerp(VEH.vel.x,tx,1-Math.exp(-2.5*dt));VEH.vel.z=lerp(VEH.vel.z,tz,1-Math.exp(-2.5*dt));
  v.position.x=clamp(v.position.x+VEH.vel.x*dt,r.x-160,r.x+160);v.position.z=clamp(v.position.z+VEH.vel.z*dt,-maxD,-4);
  const sp=Math.hypot(VEH.vel.x,VEH.vel.z);if(VEH.type==='boat'&&sp>.3)v.rotation.y=lerpAng(v.rotation.y,Math.atan2(-VEH.vel.x,-VEH.vel.z),.08);
  if(VEH.type==='boat'&&sp>.5){VEH.wk=(VEH.wk||0)-dt;if(VEH.wk<=0){VEH.wk=.25;burst(new T.Vector3(v.position.x,.03,v.position.z+.5),.3);}}
  motor(true,(VEH.type==='drone'?230:85)+sp*12);AN.reelSpin=VEH.vel.z<-.3?-1:VEH.vel.z>.3?1:0;
  // barchino nei frangenti con mare grosso: può ribaltarsi
  if(VEH.type==='boat'&&!VEH.rolled&&v.position.z<-15){VEH.rolled=true;if(wxAt(st.gt).wave>1.6&&Math.random()<.35)VEH.dropRes?.('capsize');}
  VEH.uiT=(VEH.uiT||0)-dt;if(VEH.uiT<=0){VEH.uiT=.2;const d=document.getElementById('gvd');if(d){const lat=v.position.x-r.x;d.textContent=`${Math.round(-v.position.z)} m${Math.abs(lat)>3?' · '+Math.round(Math.abs(lat))+' m '+(lat>0?'a destra':'a sinistra'):''}`;}
    const b=document.getElementById('gdrop');if(b){const still=sp<.35&&!JOY.on&&-v.position.z>=20;b.disabled=!still;b.textContent=still?'🎯 Sgancia l\'esca qui':-v.position.z<20?'Allontanati almeno 20 m':'🎯 Fermati per sganciare';}}}
G.drop=()=>{if(VEH.manual&&VEH.dropRes)VEH.dropRes('drop');};
function vehTo(x,y,z,speed){return new Promise(res=>{VEH.goal={x,y,z,speed,res};});}
function updVeh(dt,t,w){const v=VEH.obj;if(!v||!v.visible)return;const g=VEH.goal;
  if(g){const d=new T.Vector3(g.x-v.position.x,g.y-v.position.y,g.z-v.position.z),L=d.length();if(L<.3){VEH.goal=null;g.res();}else{const st2=Math.min(L,g.speed*dt);v.position.addScaledVector(d.normalize(),st2);if(VEH.type==='boat'){v.rotation.y=lerpAng(v.rotation.y,Math.atan2(-d.x,-d.z),.1);}}}
  if(VEH.type==='boat'){v.position.y=.02+Math.sin(t*2.2)*(w.wave||.3)*.12;v.rotation.z=Math.sin(t*1.7)*(w.wave||.3)*.12;v.rotation.x=Math.sin(t*1.3)*(w.wave||.3)*.1;VEH.wk=(VEH.wk||0)-dt;if(VEH.goal&&VEH.wk<=0){VEH.wk=.25;burst(new T.Vector3(v.position.x,.03,v.position.z+.5),.3);}v.userData.led.visible=night()>.3;}
  else{v.userData.props.forEach((p,i)=>p.rotation.y+=dt*60*(i%2?1:-1));v.rotation.z=Math.sin(t*1.1)*.05;v.rotation.x=VEH.goal?-.12:Math.sin(t*.9)*.03;}}
G.deliver=()=>{const r=st.rods[st.sel],w=wxAt(st.gt),boat=st.castMode==='barchino';
  seq(async()=>{st.phase='busy';st.msg=boat?'🚤 Carica esca e piombo nella tramoggia…':'🛸 Aggancia esca e piombo al drone…';setUI();pose('bend');await sleep(1);pose('hold');
    if(VEH.obj)scene.remove(VEH.obj);VEH.type=boat?'boat':'drone';VEH.obj=boat?makeBoat():makeDrone();scene.add(VEH.obj);VEH.obj.visible=true;
    if(boat){VEH.obj.position.set(r.x,.02,-.6);}else{VEH.obj.position.set(AN.pos.x+.5,.3,AN.pos.z-1);}
    st.follow=VEH.obj;r.sinker.visible=true;r.state='flying';r.ride=VEH.obj;
    if(!boat){motor(true,230);await vehTo(VEH.obj.position.x,20,VEH.obj.position.z-4,4);}
    if(boat)await vehTo(r.x,.02,-5,3);
    // ora lo guida il pescatore: si ferma sul punto e sgancia
    VEH.manual=true;VEH.vel=new T.Vector3();VEH.rolled=false;st.phase='pilot';setUI();
    const how=await new Promise(res=>{VEH.dropRes=res;});VEH.manual=false;VEH.dropRes=null;AN.reelSpin=0;
    const dist=Math.round(-VEH.obj.position.z),sp=boat?Math.max(5,dist/16):Math.max(8,dist/16);
    if(how==='capsize'){VEH.obj.rotation.z=Math.PI;splash(.4);burst(VEH.obj.position.clone(),.8);motor(false);r.ride=null;st.phase='busy';
      st.msg='🌊 Il barchino si è ribaltato nei frangenti! Lo recuperi e lanci a mano.';setUI();st.follow=null;await sleep(2);VEH.obj.visible=false;r.sinker.visible=false;r.state='idle';st.castMode='mano';st.phase='cast';setUI();return;}
    st.phase='busy';st.msg='🎯 Sgancio…';setUI();
    // sgancio: esca e piombo cadono in acqua
    const drop=new T.Vector3(VEH.obj.position.x,0,VEH.obj.position.z);r.ride=null;
    if(!boat){const pay=VEH.obj.userData.pay;pay.visible=false;VEH.obj.userData.hook.visible=false;const fall=r.sinker;fall.position.set(drop.x,20,drop.z);for(let y=20;y>0;y-=2.5){fall.position.y=y;await sleep(.04);}}
    splash();burst(drop,1);r.dist=dist;r.sx=drop.x;r.sz=drop.z;r.state='fishing';r.landT=st.gt;st.msg=`✅ Esca sganciata a ${dist} m.`;checkTangle(r);setUI();await sleep(1.2);st.follow=null;
    // torna a riva da solo mentre il pescatore rimette la canna sul picchetto
    vehTo(boat?r.x+1:AN.pos.x+1,boat?.02:6,boat?-.6:AN.pos.z-1,sp*1.2).then(async()=>{if(!boat)await vehTo(VEH.obj.position.x,.3,VEH.obj.position.z,3);motor(false);await sleep(.6);if(VEH.obj){VEH.obj.visible=false;if(!boat){VEH.obj.userData.pay.visible=true;VEH.obj.userData.hook.visible=true;}}});
    await putRod(st.sel);await stepBack(st.sel);st.phase='wait';setUI();});};

/* ---------- lenze incrociate ---------- */
// ogni lenza in acqua è un segmento dalla canna al piombo: se due si tagliano o i piombi sono a meno di 3 m, si incrociano
function lineSeg(x,sx,dist){return [x,ROD_Z,sx,-dist];}
function segX(a,b){const [x1,y1,x2,y2]=a,[x3,y3,x4,y4]=b,d=(x2-x1)*(y4-y3)-(y2-y1)*(x4-x3);if(Math.abs(d)<1e-9)return false;
  const t=((x3-x1)*(y4-y3)-(y3-y1)*(x4-x3))/d,u=((x3-x1)*(y2-y1)-(y3-y1)*(x2-x1))/d;return t>.08&&t<1&&u>.08&&u<1;}
function checkTangle(r){if(r.state!=='fishing'||!(r.dist>5))return false;const me=lineSeg(r.x,r.sx,r.dist),near=(a,b)=>Math.hypot(a[2]-b[2],a[3]-b[3])<3;
  for(const o of st.rods){if(o===r||o.state!=='fishing'&&o.state!=='bite'&&o.state!=='hooked'||!(o.dist>5))continue;const os=lineSeg(o.x,o.sx,o.dist);
    if(segX(me,os)||near(me,os)){r.state='tangled';r.tangle={own:o.i};o.state='tangled';o.tangle={own:r.i};o.bitePlan=null;vib([80,40,80]);st.msg=`🧶 La canna ${r.i+1} si è incrociata con la canna ${o.i+1}!`;return true;}}
  for(const [ai,a] of NPCS.entries())for(const [ri,o] of a.rods.entries()){if(o.held)continue;const os=lineSeg(o.x,o.sx,o.dist);
    if(segX(me,os)||near(me,os)){r.state='tangled';r.tangle={npc:ai,rod:ri};o.tangled=true;say(a,pick(['Ehi! Mi hai incrociato la lenza!','Ma dove lanci?! Siamo incrociati!','Occhio, hai preso la mia lenza!']),4.5);
      if(a.st==='sit'||a.st==='sitEat'||a.st==='watch'||a.st==='stand'){a.eating=0;a.st='going';npcGo(a,o.x+.6,ROD_Z+1.3,()=>{a.faceTo=0;a.st='watch';a.t=rnd(20,40);});}
      vib([80,40,80]);st.msg=`🧶 La tua lenza si è incrociata con quella di ${a.per.name}!`;return true;}}
  return false;}
G.untangle=()=>seq(async()=>{const r=st.rods[st.sel],tg=r.tangle;if(!tg)return;st.phase='busy';st.msg='🧶 Recupera piano e prova a districare…';setUI();
  if(!r.held)await pickRod(st.sel);pose('reel');const d0=r.dist;for(let t=0;t<1;t+=.05){r.dist=d0*(1-t*.85);AN.reelSpin=1;await sleep(.09);}AN.reelSpin=0;pose('bend');await sleep(1.4);
  const u=Math.random(),other=tg.own!=null?st.rods[tg.own]:null,npc=tg.npc!=null?NPCS[tg.npc]:null;let txt;
  const reset=o=>{o.state='idle';o.bait=null;o.dist=0;o.bitePlan=null;o.sinker.visible=false;o.tangle=null;};
  if(u<.55){txt='Districate! Le lenze sono libere, ma le esche vanno rimesse.';if(other)reset(other);if(npc){const o=npc.rods[tg.rod];o.tangled=false;o.dist=rnd(70,110);say(npc,'Grazie, tutto a posto!',3);}}
  else if(u<.85){txt='Niente da fare: hai dovuto tagliare. Il tuo terminale è perso.';r.broken=true;if(other)reset(other);if(npc){const o=npc.rods[tg.rod];o.tangled=false;say(npc,'Va be\', capita…',3);}}
  else{txt='Groviglio tremendo: persi tutti e due i terminali.';r.broken=true;if(other){reset(other);other.broken=true;}if(npc){const o=npc.rods[tg.rod];o.tangled=false;o.dist=rnd(70,110);say(npc,'Mannaggia! Mi tocca rifare il terminale.',3.5);}}
  r.tangle=null;r.state='fishing';st.msg=txt;afterRecover(r);});

/* ---------- abboccate, ferrata e combattimento ---------- */
function startBite(r){
  const ws=speciesWeights(r),tot=ws.reduce((a,[,f])=>a+f,0),u=Math.random()*(tot+.12);let acc=0,sp=null;for(const [s,f] of ws){acc+=f;if(u<acc){sp=s;break;}}
  const kind=sp?sp.bite:'picchiettata',steal=!sp||Math.random()<.18;
  const pats={picchiettata:t=>(Math.sin(t*22)>.6?.25:0)*(Math.sin(t*3.1)>-.2?1:.2),nervosa:t=>(Math.sin(t*15)>.3?.32:0)+(t%2.3<.25?.4:0),decisa:t=>t<1.5?(Math.sin(t*18)>.5?.22:0):(t%1.8<.8?.7:.18),violenta:t=>t<.6?.15:(t%1.2<.8?.95:.35),partenza:t=>t<1?.3:1};
  r.state='bite';r.biteT=0;r.bitePlan={sp,steal,kind,pattern:pats[kind],len:kind==='partenza'?13:kind==='violenta'?12:kind==='decisa'?16:12};
  bell(kind==='picchiettata'?2:kind==='partenza'||kind==='violenta'?5:3,kind==='picchiettata'?.12:.3);try{navigator.vibrate?.(kind==='violenta'||kind==='partenza'?[120,60,200]:[60]);}catch(e){}
  st.msg=`🔔 Canna ${r.i+1}: ${kind==='picchiettata'?'piccole tocche…':kind==='nervosa'?'tocche nervose':kind==='decisa'?'la cima si piega decisa!':'partenza violenta!'}`;st.speed=1;const sb=document.getElementById('gspd');if(sb)sb.textContent='⏩ 1x';if(st.phase==='wait'||st.phase==='atrod')setUI();}
function beginFight(r,sp){const w=sizeOf(sp);st.fight={r,sp,w,len:lenOf(sp,w),dist:r.dist,ten:.3,reel:false,drag:5,run:0,slack:0,t:0,pow:sp.pow*(0.6+Math.min(1.6,w/sp.w[1])*.45)};
  r.state='fight';pose('reel');st.phase='fight';vib([160,60,90]);setUI();}
G.fightHooked=()=>seq(async()=>{const r=st.rods[st.sel];if(r.state!=='hooked')return;st.phase='busy';setUI();await pickRod(st.sel);pose('reel');beginFight(r,r.bitePlan.sp);});
G.strike=()=>seq(async()=>{const r=st.rods[st.sel];if(r.state!=='bite')return;const p=r.bitePlan,strong=p.pattern(r.biteT)>.4;
  st.phase='busy';setUI();await pickRod(st.sel);pose('strike');whoosh();await sleep(.35);
  let ok=p.sp&&!p.steal&&(strong?.85:.3)>Math.random();if(p.sp&&st.hook==='grande'&&p.sp.w[1]<.4)ok=ok&&Math.random()<.5;
  if(!ok){r.state='fishing';const lost=p.steal||Math.random()<.5;if(lost)r.baitLeft=0;pose('hold');await sleep(.4);
    showCatch({fish:false,txt:strong?'Mancato!':'Troppo presto',why:strong?'Hai ferrato ma il pesce non era allamato.':'Erano solo tocche: aspetta che la cima si pieghi decisa prima di ferrare.',left:!lost});return;}
  const sp=p.sp,w=sizeOf(sp);st.fight={r,sp,w,len:lenOf(sp,w),dist:r.dist,ten:.3,reel:false,drag:5,run:0,slack:0,t:0,pow:sp.pow*(0.6+Math.min(1.6,w/sp.w[1])*.45)};
  r.state='fight';pose('reel');st.phase='fight';vib([160,60,90]);setUI();});
function updFight(dt){const f=st.fight;if(!f||st.phase!=='fight')return;f.t+=dt;const r=f.r,w=wxAt(st.gt);
  if(!f.snag&&f.dist>15&&Math.random()<dt*.005){f.snag=true;f.reel=false;AN.reelSpin=0;st.snag={r,stage:'fight',msg:'Il pesce si è infilato tra i detriti sul fondo e la lenza si è incagliata.'};st.phase='snag';vib([150,60,150]);setUI();return;}
  if(f.run<=0&&Math.random()<dt*.5*f.pow){f.run=rnd(.6,2)*f.pow;vib([90+Math.round(f.pow*60),50,140+Math.round(f.pow*80)]);}f.run=Math.max(0,f.run-dt);
  // durante la fuga e con la tensione alta: piccoli strattoni
  f.vt=(f.vt||0)-dt;if(f.vt<=0&&(f.run>0||f.ten>.75)){vib(f.run>0?Math.round(35+f.pow*30):25);f.vt=f.run>0?rnd(.25,.5):rnd(.6,1.1);}
  const pull=(f.run>0?.6:.18)*f.pow+(w.wave||0)*.08*Math.max(0,Math.sin(performance.now()/700));const dragMax=.35+f.drag*.07;
  let ten=(f.reel?.45:.12)+pull;if(ten>dragMax){f.dist+=(ten-dragMax)*dt*25;ten=dragMax+(ten-dragMax)*.25;if(Math.random()<dt*3)click();AN.reelSpin=-.6;}
  else AN.reelSpin=f.reel?1:0;
  if(f.reel&&f.run<=0)f.dist-=dt*(7-f.pow*1.5)*(1.15-f.drag*.02);else if(f.reel)f.dist-=dt*1.2;
  f.ten=lerp(f.ten,clamp(ten,0,1.2),.15);r.dist=Math.max(0,f.dist);
  const lim=f.sp.teeth&&st.hook!=='grande'?.92:1;if(f.ten>lim){f.over=(f.over||0)+dt;if(f.over>.35)return endFight(false,f.sp.teeth?'Il serra ha tranciato la lenza con i denti!':'Lenza rotta: troppa tensione. Apri un po\' la frizione.');}else f.over=0;
  if(f.ten<.16)f.slack+=dt;else f.slack=Math.max(0,f.slack-dt*2);if(f.slack>2.6)return endFight(false,'Slamato: con la lenza lenta il pesce si è liberato.');
  if(st.hook==='piccolo'&&f.w>2.5&&f.ten>.85&&Math.random()<dt*.6)return endFight(false,'L\'amo piccolo si è aperto: pesce troppo grosso.');
  if(f.run>0&&Math.random()<dt*4)burst(new T.Vector3(r.sx*(f.dist/Math.max(1,-r.sz))+r.x*(1-f.dist/Math.max(1,-r.sz)),0,-f.dist),.4);
  if(f.dist<=0)return endFight(true);
  const Te=document.getElementById('gten'),D=document.getElementById('gdis'),DT=document.getElementById('gdt'),TI=document.getElementById('gfti');
  if(Te){Te.style.width=clamp(f.ten*100,0,100)+'%';Te.style.background=f.ten>.85?'#ff4d5e':f.ten>.6?'#ffb547':'#2fe0cf';}
  if(D)D.style.width=clamp(f.dist/Math.max(1,-r.sz)*100,0,100)+'%';if(DT)DT.textContent=Math.max(0,Math.round(f.dist))+' m';
  const AL=document.getElementById('galert');if(AL){const o=st.rods.filter(x=>x!==r&&(x.state==='bite'||x.state==='hooked'));AL.textContent=o.length?o.map(x=>`🔔 Canna ${x.i+1}: ${x.state==='hooked'?'pesce allamato!':'abboccata!'}`).join(' · '):'';}
  if(TI)TI.textContent=f.run>0?'💥 Il pesce scappa! Non forzare':f.dist<12?'🌊 È nella risacca: portalo a riva':'🌀 Recupera senza dare lenza lenta';}
function endFight(ok,why){const f=st.fight;st.fight=null;AN.reelSpin=0;const r=f.r,bait=B[r.bait]?.n||'';r.state='idle';r.bait=null;r.dist=0;r.sinker.visible=false;
  if(!ok){pose('hold');showCatch({fish:false,txt:'Perso!',why});return;}
  splash(.5);const rec=!st.best[f.sp.n]||f.w>st.best[f.sp.n];
  // il pesce esce dall'acqua appeso alla lenza
  fishMesh.visible=true;fishMesh.userData.body.material.color.set(f.sp.col?.b||'#b8c2c8');const s=clamp(lenOf(f.sp,f.w)/60,.25,1.6);fishMesh.scale.setScalar(s);fishMesh.userData.show=performance.now();
  seq(async()=>{pose('strike');await sleep(1.2);fishMesh.visible=false;pose('hold');showCatch({fish:true,sp:f.sp,w:f.w,l:f.len,crab:!!f.sp.crab,rec,bait});});}
function showCatch(c){st.catchShow=c;st.phase='catch';setUI();}
G.release=()=>{record(true);st.msg='💚 Rilasciato. Bravo!';G.rebait();};
G.keep=()=>{record(false);st.msg='🧺 Nel carniere';G.rebait();};
function burst(p,k){const s=splashP.userData;s.t=1;s.o=p.clone();s.v.forEach(v=>v.set(rnd(-1,1)*k,rnd(1.5,3.5)*k,rnd(-1,1)*k));const a=splashP.geometry.attributes.position;for(let i=0;i<60;i++)a.setXYZ(i,p.x,p.y,p.z);a.needsUpdate=true;}
// seduto: trascinando ti giri e guardi attorno; solo toccando una canna il pescatore si alza e ci va
const LOOK={yaw:0,pitch:0,zoom:1};const JOY={x:0,y:0,on:false};
function bindLook(){let d=null;const P=new Map();let pinch=null;
  cvs.addEventListener('pointerdown',e=>{ac();P.set(e.pointerId,{x:e.clientX,y:e.clientY});cvs.setPointerCapture?.(e.pointerId);
    if(P.size===2){const [a,b]=[...P.values()];pinch={d0:Math.hypot(a.x-b.x,a.y-b.y),z0:LOOK.zoom};d=null;return;}
    d={x:e.clientX,y:e.clientY,t:performance.now(),y0:LOOK.yaw,p0:LOOK.pitch,moved:false};});
  cvs.addEventListener('pointermove',e=>{if(P.has(e.pointerId))P.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&P.size>=2){const [a,b]=[...P.values()];LOOK.zoom=clamp(pinch.z0*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(20,pinch.d0),1,5);return;}
    if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>8)d.moved=true;if(!d.moved)return;
    LOOK.yaw=d.y0-dx*.006/LOOK.zoom;LOOK.pitch=clamp(d.p0+dy*.005/LOOK.zoom,-.35,1.25);});
  const up=e=>{P.delete(e.pointerId);if(P.size<2)pinch=null;if(!d)return;const tap=!d.moved&&performance.now()-d.t<450;d=null;if(tap)onTap(e);};
  cvs.addEventListener('pointerup',up);cvs.addEventListener('pointercancel',e=>{P.delete(e.pointerId);pinch=null;d=null;});
  cvs.addEventListener('wheel',e=>{e.preventDefault();LOOK.zoom=clamp(LOOK.zoom*(1-e.deltaY*.0015),1,5);},{passive:false});
  // joystick: il pollice muove il pescatore nella direzione in cui guardi
  const jb=root.querySelector('#gjoy'),kn=jb.querySelector('i');let jid=null;
  const setK=(e)=>{const r=jb.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R0=r.width/2;let x=(e.clientX-cx)/R0,y=(e.clientY-cy)/R0;const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}JOY.x=x;JOY.y=y;kn.style.transform=`translate(${x*R0*.6}px,${y*R0*.6}px)`;};
  jb.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();ac();jid=e.pointerId;jb.setPointerCapture?.(e.pointerId);JOY.on=true;setK(e);});
  jb.addEventListener('pointermove',e=>{if(e.pointerId!==jid)return;setK(e);});
  const jend=e=>{if(e.pointerId!==jid)return;jid=null;JOY.on=false;JOY.x=JOY.y=0;kn.style.transform='';};jb.addEventListener('pointerup',jend);jb.addEventListener('pointercancel',jend);}
const sittingView=()=>st.phase==='wait'&&!st.busy;
const RAY={r:null};
function onTap(e){if(!sittingView())return;
  const rect=cvs.getBoundingClientRect(),m=new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  RAY.r=RAY.r||new T.Raycaster();RAY.r.setFromCamera(m,camera);const hits=RAY.r.intersectObjects(st.rods.map(r=>r.hit),false);
  if(hits.length){const i=st.rods.findIndex(r=>r.hit===hits[0].object);if(i>=0)return G.rod(i);}
  if(AN.target!=='sit'&&RAY.r.intersectObject(CHAIRHIT,false).length)return G.sit();
  const ci=CRABS.findIndex(c=>c.visible&&RAY.r.ray.distanceToPoint(c.position)<.6);if(ci>=0&&nearCrab()===CRABS[ci])return G.crab();
  for(const a of RP.list.values())if(RAY.r.ray.distanceToPoint(a.pos.clone().add(new T.Vector3(0,1,0)))<.8&&a.pos.distanceTo(AN.pos)<8)return G.rtalk(a.id);
  const ni=NPCS.findIndex(a=>RAY.r.ray.distanceToPoint(a.pos.clone().add(new T.Vector3(0,1,0)))<.8);if(ni>=0&&NPCS[ni].pos.distanceTo(AN.pos)<4)return G.talk(ni);}
G.walk=(x,z)=>seq(async()=>{st.phase='busy';st.msg='';setUI();await walkTo(x,z,2.8);AN.faceTo=null;pose('stand');st.phase='wait';talkNear();setUI();});
G.rise=()=>seq(async()=>{st.phase='busy';setUI();await standUp();await walkTo(AN.pos.x+.4,AN.pos.z-1.2,1.6);AN.faceTo=0;st.phase='wait';st.msg='';setUI();});
// due chiacchiere con i vicini
const NPC_NAMES=['Franco','Peppe','Marco','Luigi'];
const Q=[['come','👋 Come va?'],['nome','🙂 Come ti chiami?'],['preso','🐟 Cosa hai preso?'],['esca','🪱 Con che esca peschi?'],['mont','⚓ Che montatura usi?'],['app','📱 Usi LenzApp?'],['cons','💡 Mi dai un consiglio?'],['caffe','☕ Ti offro un caffè'],['ciao','👋 Ciao, buona pesca!']];
function answer(a,q){const P=a.per,w=wxAt(st.gt),per=period(gameDate()),bag=a.bag,B1=B[P.bait]?.n.toLowerCase()||P.bait,idx=w.idx;
  const tot=bag.length,best=bag.slice().sort((x,y)=>y.w-x.w)[0];
  switch(q){
    case 'come':return P.mood==='brontolone'?pick(['Male, troppa corrente.','Si mangia poco oggi, colpa della luna.','Granchi ovunque, che strazio.']):tot?`Bene dai! Ho già preso ${tot} ${tot>1?'pesci':'pesce'}.`:pick(['Ancora niente, ma è presto.','Tranquillo, si aspetta.','Tocche sì, pesci no!']);
    case 'nome':return `Mi chiamo ${P.name}, ho ${P.age} anni e vengo da ${P.town}. Pesco qui a ${SPOT.name.split(' · ')[0]} da ${P.yrs} anni.`;
    case 'preso':return tot?`Finora: ${bag.map(f=>f.n.toLowerCase()+' '+Math.round(f.l)+' cm').join(', ')}.${best&&best.w>1?' Quella grossa l\'ho portata a riva a fatica!':''}`:pick(['Niente di niente, solo alghe.','Zero. Un granchio, se vale.','Per ora il cappotto.']);
    case 'esca':return `Io vado di ${B1}${P.bait==='bibi'?': le orate ci impazziscono':P.bait==='arenicola'?': profuma e porta saraghi e spigole':P.bait==='koreano'?': resiste e piace alle mormore':': per orate e ombrine non c\'è di meglio'}. Sulla battigia trovi anche i granchietti: li prendi e li inneschi.`;
    case 'mont':return `Piombo da ${P.lead} grammi, terminale ${P.rig==='2ami'?'a due ami':P.rig==='corto'?'corto da 70 cm':'lungo due metri'}, amo ${P.rig==='2ami'?'n. 4':'n. 2'}. ${w.wave>1?'Con questo mare non scendere sotto i '+suggestLead(w.wave)+' grammi.':'Col mare calmo allunga il terminale.'}`;
    case 'app':return P.app?pick([`Certo! LenzApp oggi dà indice ${idx}: ${idx>=70?'ottimo, infatti sono qui':idx>=50?'discreto':'bassino, ma ci provo'}.`,'Sì, guardo sempre la Settimana e le finestre migliori. E segno le catture nel diario.','Sì! Con la mappa vedo dove prendono gli amici.']):pick(['LenzApp? Mai sentita… è gratis? Me la scarico.','No, io guardo il mare e basta. Ma mio nipote ce l\'ha.','Ah, quella dell\'indice di pesca? Prima o poi la provo.']);
    case 'cons':return per==='notte'?'Di notte le spigole vengono sotto riva: lancia corto, a 30-40 metri, con arenicola o sarda.':per==='alba'||per==='tramonto'?'Adesso è il momento buono: tieni le cime d\'occhio e ferra solo quando piega decisa.':w.wave<.3?'Col mare piatto peschi lontano, oltre gli 80 metri, terminale lungo e amo piccolo.':w.wave>1.2?'Mare grosso: piombo pesante e pesca nella buca dopo il primo frangente.':'Prova il cannolicchio a 70-90 metri, le orate girano.';
    case 'caffe':if(a.gift){return 'Grazie, ne ho già bevuti due! Il cuore…';}a.gift=1;st.inv.granchio+=3;return `Grazie, sei un amico! Tieni, tre granchietti che ho raccolto: sono ottimi per le orate.`;
    case 'ciao':return pick(['Ciao, in bocca al lupo!','Buona pesca, e occhio alle cime!','A dopo!']);}}
G.talk=i=>{const a=NPCS[i];if(!a)return;st.talk={i,txt:NPC_LINES.greet(a)};a.faceTo=Math.atan2(-(AN.pos.x-a.pos.x),-(AN.pos.z-a.pos.z));AN.faceTo=Math.atan2(-(a.pos.x-AN.pos.x),-(a.pos.z-AN.pos.z));say(a,st.talk.txt,3);st.phase='talk';setUI();};
G.ask=q=>{const tk=st.talk,a=NPCS[tk.i];if(q==='ciao'){say(a,answer(a,q),3);st.talk=null;st.phase='wait';st.msg='';setUI();return;}tk.txt=answer(a,q);tk.q=q;say(a,tk.txt,6);setUI();};

function talkNear(){let best=null,bd=4.5;NPCS.forEach((a,i)=>{const d=a.pos.distanceTo(AN.pos);if(d<bd){bd=d;best=i;}});if(best==null)return;
  const a=NPCS[best],w=wxAt(st.gt),per=period(gameDate()),hrs=gameDate().getHours();AN.faceTo=Math.atan2(-(a.pos.x-AN.pos.x),-(a.pos.z-AN.pos.z));
  const sp=SP.filter(x=>(x.mo[gameDate().getMonth()+1]||0)>.6&&!x.crab).map(x=>x.n.toLowerCase());
  const L=[`Ciao! ${a.st==='reel'?'Aspetta che recupero…':'Tutto tranquillo qui.'}`,`Stamattina ${pick(['due mormore','un sarago','niente, solo granchi','una bella orata','un\'ombrina'])}${pick([' con il bibi',' con l\'arenicola',' con il koreano',''])}.`,
    w.wave>1?`Con questo mare ci vogliono almeno ${suggestLead(w.wave)} grammi, sennò ti porta via.`:`Mare ${seaName(w.wave)}: ${w.wave<.3?'troppo calmo, si pesca poco':'buono per le orate'}.`,
    per==='notte'?'Di notte vengono sotto riva le spigole: lancia corto.':per==='alba'||per==='tramonto'?'Questo è il momento migliore, tieni d\'occhio le cime!':'Di giorno si pesca lontano, oltre gli 80 metri.',
    sp.length?`In questo periodo girano ${sp.slice(0,3).join(', ')}.`:'Periodo difficile, ci vuole pazienza.'];
  st.msg=`💬 ${NPC_NAMES[best]}: ${pick(L)}`;}
// poco prima dell'alba propongo il tramonto, poco prima del tramonto l'alba
function skipUp(){const d=gameDate(),a=sunPos(d,SPOT.lat,SPOT.lon).alt,morning=d.getHours()<12;if(a<0&&a>-6&&morning)return false;if(a>=0&&a<6&&!morning)return true;return a<0;}
// salto di tempo: alba (il sole sorge) o tramonto (il sole tramonta), 20 minuti prima
G.skip=up=>{if(st.busy||st.phase!=='wait')return;let t=st.gt,prev=sunPos(new Date(t),SPOT.lat,SPOT.lon).alt;const end=t+36*3600e3;
  for(t+=5*60e3;t<end;t+=5*60e3){const a=sunPos(new Date(t),SPOT.lat,SPOT.lon).alt;if(up?(prev<0&&a>=0):(prev>=0&&a<0))break;prev=a;}
  const target=t-20*60e3;if(target<=st.gt)return;const mins=(target-st.gt)/60e3;st.gt=target;
  // nel frattempo le esche si consumano e le abboccate finiscono
  for(const r of st.rods){if(r.state==='bite'||r.state==='hooked'){r.state='fishing';r.bitePlan=null;}if(r.bait&&r.state==='fishing')r.baitLeft-=mins*(.6+Math.random()*.6);}
  const d=new Date(target);st.msg=`${up?'🌅 Alba':'🌇 Tramonto'} in arrivo: sono le ${d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}.${st.rods.some(r=>r.bait&&r.baitLeft<=0)?' Controlla le esche: in queste ore sono state mangiate.':''}`;setUI();};
G.center=()=>{LOOK.yaw=0;LOOK.pitch=0;};

/* ---------- ciclo principale ---------- */
function loop(){raf=requestAnimationFrame(loop);if(!renderer)return;const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
  const gmul=(st.phase==='wait'&&!st.busy)?st.speed:1;st.gmul=gmul;st.gt+=dt*1000*gmul;const gmin=dt*gmul/60;const w=wxAt(st.gt);
  // pescatore e vicini di spiaggia
  joyMove(dt,t);moveActor(AN,dt);lerpPose(dt,AN.target==='castFwd'||AN.target==='strike'?14:6);applyPose(t);updCrabs(dt,t);nearUI(t);
  updNpcs(dt,t);rpUpd(dt,t);
  if(st.cast?.on){st.cast.p+=st.cast.dir*dt*1.15;if(st.cast.p>1){st.cast.p=1;st.cast.dir=-1;}if(st.cast.p<0){st.cast.p=0;st.cast.dir=1;}const el=document.getElementById('gpw');if(el)el.style.width=(st.cast.p*100)+'%';}
  // canne
  for(const r of st.rods){
    if(r.state==='fishing'&&r.dist>8){const need=suggestLead(w.wave||0);if((r.lead||st.lead)<need-20){const k=(need-(r.lead||st.lead))/100;r.dist-=gmin*k*6;r.sx+=gmin*k*Math.sin((w.wd-FACE)*R)*3;r.tgT=(r.tgT||0)-gmin;if(r.tgT<=0){r.tgT=1;if(checkTangle(r)&&st.phase==='wait')setUI();}if(!r.driftMsg){r.driftMsg=1;st.msg=`Canna ${r.i+1}: il piombo da ${r.lead} g «ara», la corrente lo trascina verso riva. Metti un piombo più pesante.`;if(st.phase==='wait')setUI();}}}
    if(r.state==='fishing'){r.baitLeft-=gmin*(1+(w.wave||0)*.6);if(Math.random()<biteRate(r)*gmin)startBite(r);}
    if(r.state==='bite'){r.biteT+=dt;if(r.biteT>r.bitePlan.len){const pl=r.bitePlan,auto={partenza:.6,violenta:.45,decisa:.3,nervosa:.15,picchiettata:.05}[pl.kind]||0;
        if(pl.sp&&!pl.steal&&Math.random()<auto){r.state='hooked';r.hookT=0;bell(4,.3);try{navigator.vibrate?.([200,80,200]);}catch(e){}st.msg=`🐟 Canna ${r.i+1}: il pesce si è allamato da solo! Vai a recuperarlo.`;if(st.phase==='wait'||st.phase==='atrod')setUI();continue;}
        r.state='fishing';r.baitLeft-=pl.steal?999:10;st.msg=`Canna ${r.i+1}: ha smesso di battere${pl.steal?' (forse ti hanno rubato l\'esca)':''}.`;if(st.phase==='wait'||st.phase==='atrod')setUI();}}
    if(r.state==='hooked'){r.hookT+=dt;if(Math.random()<dt*.012||r.hookT>150){r.state='fishing';r.baitLeft=0;r.bitePlan=null;st.msg=`Canna ${r.i+1}: il pesce si è slamato. Controlla l'esca.`;if(st.phase==='wait'||st.phase==='atrod')setUI();}
      else if(Math.random()<dt*.25)bell(1,.15);}
    const swell=r.dist>0?Math.sin(t*2*Math.PI/Math.max(3,w.wper||5)+r.i)*(w.wave||.3)*.12:0;let bite=r.state==='tangled'?.3+.2*Math.max(0,Math.sin(t*1.7+r.i*2)):r.state==='bite'?r.bitePlan.pattern(r.biteT):r.state==='hooked'?.55+.35*Math.max(0,Math.sin(t*2.3+r.i))*Math.max(0,Math.sin(t*.7)):0;if(st.fight?.r===r)bite=st.fight.ten*1.1;if(r.state==='flying')bite=0;
    r.bend=lerp(r.bend,(r.dist>0?.12:0)+swell+bite,.25);bendRod(r.obj,clamp(r.bend,0,1.3)*(r.held?.8:1));
    if(r.held)rodInHand(r);
    // mulinello: rotore e manovella girano quando si recupera
    if(r.held&&AN.holding===r.i&&AN.reelSpin>0){AN.tick=(AN.tick||0)+dt*AN.reelSpin*7;while(AN.tick>.75){AN.tick-=.75;reelTick();}}
    if(r.held&&AN.holding===r.i){const U=r.obj.userData;U.rotor.rotation.y+=dt*AN.reelSpin*22;U.lineOn.rotation.y+=dt*AN.reelSpin*22;U.crank.rotation.x+=dt*AN.reelSpin*7;AN.crank+=dt*AN.reelSpin*7;U.lineOn.position.y=.115+Math.sin(AN.crank*.5)*.008*(AN.reelSpin?1:0);}
    r.obj.userData.glow.visible=night()>.25;r.obj.userData.glow.material.opacity=r.state==='bite'?(.6+.4*Math.sin(t*20)):.9;
    // lenza
    const tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const a=r.line.geometry.attributes.position;
    if(r.ride){r.sinker.position.copy(r.ride.position);if(VEH.type==='drone')r.sinker.position.y-=2.55;}
    else if(r.flight){const f=r.flight;f.t+=dt/f.dur;const k=clamp(f.t,0,1),pnt=new T.Vector3().lerpVectors(f.a,f.b,k);pnt.y+=Math.sin(k*Math.PI)*(12+f.b.distanceTo(f.a)*.12);r.sinker.position.copy(pnt);}
    else if(r.dist>0){const fd=st.fight?.r===r?Math.max(0,st.fight.dist):r.dist,kk=fd/Math.max(1,-r.sz);r.sinker.position.set(lerp(r.x,r.sx,kk),.0,-fd);}
    const end=r.sinker.visible?r.sinker.position:tip;const tens=st.fight?.r===r?st.fight.ten:.2+r.bend*.4;
    for(let i=0;i<40;i++){const u=i/39,x=lerp(tip.x,end.x,u),z=lerp(tip.z,end.z,u),y=lerp(tip.y,end.y,u)-Math.sin(u*Math.PI)*(r.flight?0:(1-tens)*Math.min(3,tip.distanceTo(end)*.05));a.setXYZ(i,x,Math.max(y,end===tip?y:-.02),z);}
    a.needsUpdate=true;r.line.visible=r.sinker.visible;}
  reelWhir(AN.reelSpin>0&&AN.holding>=0?.012:0,AN.reelSpin*7);
  pilot(dt,t);updVeh(dt,t,w);
  updFight(dt);
  // pesce appeso che esce dall'acqua
  if(fishMesh.visible&&st.fight==null){const r=st.rods[st.sel],tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const k=clamp((performance.now()-fishMesh.userData.show)/900,0,1);
    fishMesh.position.set(lerp(r.x,tip.x,k),lerp(.1,tip.y-.6,k),lerp(-2,tip.z+.2,k));fishMesh.rotation.set(0,0,Math.PI/2+Math.sin(t*14)*.4);}
  // schizzi
  const sp=splashP.userData;if(sp.t>0){sp.t-=dt*1.2;const a=splashP.geometry.attributes.position;for(let i=0;i<60;i++){const v=sp.v[i];v.y-=9.8*dt;a.setXYZ(i,a.getX(i)+v.x*dt,Math.max(0,a.getY(i)+v.y*dt),a.getZ(i)+v.z*dt);}a.needsUpdate=true;splashP.material.opacity=clamp(sp.t,0,1);}
  updEnv(w,t,dt);updCam(dt,t);
  if(!loop.h||t-loop.h>.5||t<loop.h){loop.h=t;drawHud(w);if(st.phase==='wait'){const els=ui.querySelectorAll('.gr small:last-child');st.rods.forEach((r,i)=>{if(els[i])els[i].textContent=rodStatus(r);});}}
  renderer.setScissorTest(false);renderer.setViewport(0,0,root.clientWidth,root.clientHeight);renderer.render(scene,camera);
  if((st.phase==='fight'||(st.phase==='busy'&&AN.reelSpin))&&AN.holding>=0){const r=st.rods[AN.holding],rp=new T.Vector3();r.obj.userData.reel.getWorldPosition(rp);
    if(!G.rc)G.rc=new T.PerspectiveCamera(32,1,.02,200);const W=root.clientWidth,H=root.clientHeight,sz=Math.round(Math.min(W,H)*.38),x=10,y=H-sz-Math.round(H*.13);
    const side=new T.Vector3(Math.cos(AN.rotY),0,-Math.sin(AN.rotY));G.rc.position.copy(rp).addScaledVector(side,-.8).add(new T.Vector3(0,.3,.35));G.rc.lookAt(rp.x,rp.y+.04,rp.z);G.rc.aspect=1;G.rc.updateProjectionMatrix();
    renderer.setScissorTest(true);renderer.setScissor(x-3,y-3,sz+6,sz+6);renderer.setViewport(x-3,y-3,sz+6,sz+6);renderer.setClearColor(0xffffff,1);renderer.clear();
    renderer.setScissor(x,y,sz,sz);renderer.setViewport(x,y,sz,sz);renderer.render(scene,G.rc);renderer.setScissorTest(false);}}
function moveActor(a,dt){
  if(a.moving&&a.walkTarget){const wt=a.walkTarget,dx=wt.x-a.pos.x,dz=wt.z-a.pos.z,d=Math.hypot(dx,dz);
    if(d<.05){a.moving=false;a.walkTarget=null;wt.res();}else{const s=Math.min(d,a.speed*dt);a.pos.x+=dx/d*s;a.pos.z+=dz/d*s;a.walk+=dt*a.speed*5.2;const ty=Math.atan2(-dx,-dz);a.rotY=lerpAng(a.rotY,ty,1-Math.exp(-10*dt));}
    if(a===AN){const dp=sandY(a.pos.z);a.swim=dp<-1;a.pos.y=a.swim?(a.dive?-1.1:-.2):dp;}else a.pos.y=Math.max(0,a.pos.z*.035);if(a.target==='sit'||a.target==='bend')a.target=a.holding>=0?'hold':'stand';}
  else if(a.faceTo!=null){a.rotY=lerpAng(a.rotY,a.faceTo,1-Math.exp(-8*dt));}}
function joyMove(dt,t){const m=Math.hypot(JOY.x,JOY.y);const free=st.phase==='wait'&&!st.busy;
  if(!JOY.on||m<.15||!free){if(AN.joying){AN.joying=false;AN.moving=false;}return;}
  if(AN.target==='sit'){pose('stand');AN.pos.z-=.35;}
  const fw=new T.Vector3().subVectors(CAM.l||new T.Vector3(0,0,-10),camera.position);fw.y=0;fw.normalize();const rt=new T.Vector3(-fw.z,0,fw.x);
  const dir=fw.multiplyScalar(-JOY.y).add(rt.multiplyScalar(JOY.x));if(dir.lengthSq()<1e-4)return;dir.normalize();
  const inWater=AN.pos.z<-.1,deep=sandY(AN.pos.z)<-1,sp=(deep?1.3:inWater?1.1:3)*Math.min(1,m);AN.joying=true;AN.moving=true;AN.walkTarget=null;AN.speed=sp;AN.faceTo=null;
  AN.pos.x=clamp(AN.pos.x+dir.x*sp*dt,-110,110);AN.pos.z=clamp(AN.pos.z+dir.z*sp*dt,-150,26);AN.swim=sandY(AN.pos.z)<-1;AN.pos.y=AN.swim?-.2:sandY(AN.pos.z);AN.walk+=dt*sp*5.2;
  AN.rotY=lerpAng(AN.rotY,Math.atan2(-dir.x,-dir.z),1-Math.exp(-10*dt));
  if(inWater){AN.splT=(AN.splT||0)-dt;if(AN.splT<=0){AN.splT=deep?.5:.35;burst(new T.Vector3(AN.pos.x,.05,AN.pos.z-.2),deep?.4:.25);if(deep&&Math.random()<.3)splash(.05);}}}
// pulsanti che compaiono quando sei vicino a un granchio o a un altro pescatore
function nearUI(t){if(!nearUI.t||t-nearUI.t>.3||t<nearUI.t){nearUI.t=t;const c=nearCrab(),ni=NPCS.findIndex(a=>a.pos.distanceTo(AN.pos)<3.2),k=(c?'c':'')+ni+(AN.pos.z<-.1?'w':'')+(AN.target==='sit'?'s':'');
  if(k!==nearUI.k){nearUI.k=k;if(st.phase==='wait'&&!st.busy)setUI();}
  const jb=root?.querySelector('#gjoy');if(jb){jb.style.display=(st.phase==='wait'&&!st.busy)||st.phase==='pilot'?'block':'none';const pn=ui.firstElementChild;jb.style.bottom=((pn?.offsetHeight||0)+24)+'px';}}}
const sandY=z=>z<-6?-1.2+(z+6)*.05:z<0?z*.06-.15:z*.035;
const lerpAng=(a,b,f)=>{let d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+d*f;};
let NIGHT=0;const night=()=>NIGHT;
function updEnv(w,t,dt){const d=gameDate(),s0=sunPos(d,SPOT.lat,SPOT.lon),sun=sunPos(new Date(d.getTime()+30*60e3*clamp((180-s0.az)/30,-1,1)),SPOT.lat,SPOT.lon),// luce: mezz'ora in più di chiaro all'alba e al tramonto
  mo=moonPosG(d,SPOT.lat,SPOT.lon);
  const dir=(alt,az)=>{const a=(az-FACE)*R,e=alt*R;return new T.Vector3(Math.sin(a)*Math.cos(e),Math.sin(e),-Math.cos(a)*Math.cos(e));};
  const sd=dir(sun.alt,sun.az),md=dir(mo.alt,mo.az),cc0=clamp(w.cc/100,0,1),rainy=w.pr>.05||(w.code>=51&&w.code<=99),cc=rainy?Math.max(cc0,w.code>=63||w.pr>1?1:.85):cc0;// se piove il cielo è coperto anche se il dato delle nuvole è basso
  NIGHT=clamp((-sun.alt+2)/10,0,1);
  const u=sky.material.uniforms;u.sunPosition.value.copy(sd);u.turbidity.value=2+cc*9;u.rayleigh.value=lerp(1.2,3,clamp(1-sun.alt/25,0,1))*(1-cc*.6);u.mieCoefficient.value=.004+cc*.01;u.mieDirectionalG.value=.8;
  const day=clamp((sun.alt+3)/12,0,1);sunLight.position.copy(AN.pos).addScaledVector(sd,60);sunLight.target.position.copy(AN.pos);sunLight.intensity=day*(1.6-cc*1.1);
  sunLight.color.setHSL(.09,clamp(1-sun.alt/25,0,1)*.7,lerp(.55,.95,clamp(sun.alt/30,0,1)));
  moonLight.position.copy(md).multiplyScalar(60);moonLight.intensity=NIGHT*clamp(mo.alt/10,0,1)*mo.illum*.5*(1-cc*.7);
  hemi.intensity=lerp(.08,.75,day)*(1-cc*.25)+(NIGHT*.06);hemi.color.setHSL(.6,.4,lerp(.25,.75,day));hemi.groundColor.setHSL(.09,.3,lerp(.08,.45,day));
  renderer.toneMappingExposure=lerp(.32,.55,day);
  const wu=water.material.uniforms;wu.time.value+=dt*(.35+clamp(w.ws/30,0,1)*.9);wu.sunDirection.value.copy(sun.alt>-2?sd:md).normalize();wu.distortionScale.value=1.5+clamp(w.wave,0,3)*2.2+w.ws/25;
  wu.sunColor.value.setRGB(...(sun.alt>-2?[1,lerp(.6,1,clamp(sun.alt/15,0,1)),lerp(.4,1,clamp(sun.alt/15,0,1))]:[.6*mo.illum,.65*mo.illum,.75*mo.illum]));
  wu.waterColor.value.setRGB(lerp(.005,.03,day),lerp(.02,.2,day)*(1-cc*.3),lerp(.04,.26,day)*(1-cc*.3));
  const fogCol=new T.Color().setHSL(.58,lerp(.15,.3,day),lerp(.03,.62,day)*(1-cc*.25));
  scene.fog=scene.fog||new T.FogExp2(0xffffff,.0004);scene.fog.color.copy(fogCol);scene.fog.density=.00015+(w.code===45||w.code===48?.006:0)+(w.pr>.1?.0015:0)+cc*.0002;
  stars.material.opacity=NIGHT*(1-cc)*.9;cityL.material.opacity=NIGHT*.85;
  moon.position.copy(md).multiplyScalar(8000);moon.visible=mo.alt>-3;moon.material.opacity=clamp(.25+NIGHT,0,1)*(1-cc*.6);moon.userData.halo.material.opacity=.3*NIGHT*mo.illum*(1-cc*.7);if(moon.userData.ph==null||Math.abs(moon.userData.ph-mo.ph)>6){moon.material.map=moonTex(mo.ph);moon.material.needsUpdate=true;moon.userData.ph=mo.ph;}
  if(overcast){overcast.position.set(camera.position.x,0,camera.position.z);overcast.material.opacity=clamp((cc-.5)/.5,0,1)*(rainy?.86:.75);overcast.material.color.setHSL(.58,.06,lerp(.05,.6,day)*(rainy?.85:1));overcast.visible=overcast.material.opacity>.01;}
  const n=Math.round(cc*clouds.length),tint=new T.Color().setHSL(.07,sun.alt<10&&sun.alt>-6&&!rainy?.5:.05,lerp(.12,.92,day)*(rainy?.5:1));
  // le nuvole vanno dove spira il vento (in quota un po' più forte) e vivono: nascono, crescono, si sfaldano e svaniscono
  const gm=st.gmul||1,wa=(w.wd+180-FACE)*R,vx=Math.sin(wa)*(w.ws/3.6)*1.6,vz=-Math.cos(wa)*(w.ws/3.6)*1.6;
  clouds.forEach((c,i)=>{const u=c.userData;u.life+=dt*gm/u.dur;if(u.life>=1||Math.hypot(c.position.x,c.position.z)>3600){respawnCloud(c,false);}
    c.position.x+=vx*dt*gm;c.position.z+=vz*dt*gm;
    const env=Math.sin(Math.min(1,u.life)*Math.PI),want=i<n?1:0;u.vis=lerp(u.vis,want,1-Math.exp(-dt*gm/(rainy?6:40)));
    const grow=.75+.35*u.life+.06*Math.sin(u.ph+st.gt/9e5);c.scale.set(u.w*grow,u.h*(.85+.3*env),1);
    c.material.color.copy(tint);c.material.opacity=clamp(.55+cc*.4,0,1)*Math.pow(env,.6)*u.vis;c.visible=c.material.opacity>.01;});
  for(const L of LANTERNS){L.userData.glass.material.emissiveIntensity=NIGHT>.4?1.6:0;if(L.userData.pl)L.userData.pl.intensity=NIGHT>.4?1.1:0;}
  const lampOn=NIGHT>.5&&st.lamp;headLamp.intensity=lampOn?1.6:0;AN.obj.userData.J.lamp.material.emissiveIntensity=lampOn?2:0;
  // frangenti e risacca: più numerosi e alti con mare grosso
  const per=Math.max(3,w.wper||5),wh=w.wave||.3,nb=wh<.2?1:wh<.6?2:wh<1.2?3:4;
  const nf=Math.min(foams.length,2+Math.round(wh*4));
  foams.forEach((f,i)=>{const u=f.userData,on=i<nf;f.visible=on;if(!on)return;u.cyc+=dt/(per*u.rate*(1.4+u.d0/30));if(u.cyc>=1){u.cyc=0;newWave(f);}
    const cyc=u.cyc,a=f.geometry.attributes.position,b=u.base,d=lerp(u.d0*(1+wh*.4),-.4,cyc);
    if(!u.crashed&&cyc>.8){u.crashed=true;const now=performance.now();if(wh>=.4&&now-(AU.lastCrash||0)>Math.max(7,per*1.2)*1000){AU.lastCrash=now;surfCrash(clamp((wh-.3)*.09,.015,.18)*(.8+Math.random()*.4));}}if(cyc<.1)u.crashed=false;
    for(let j=0;j<a.count;j++){const x=b[j*3],bend=u.a[0]*Math.sin(x*u.k[0]+u.ph[0]+t*u.w[0])+u.a[1]*Math.sin(x*u.k[1]+u.ph[1]+t*u.w[1])+u.a[2]*Math.sin(x*u.k[2]+u.ph[2]+t*u.w[2]*2)+x*u.tilt;
      a.setZ(j,b[j*3+2]*(1+wh*1.2*(1-cyc))+bend*(1-cyc*.6));}a.needsUpdate=true;
    f.position.z=-d;f.position.y=.05+Math.sin(cyc*Math.PI)*wh*.18;
    f.material.opacity=clamp(.55+wh*.6,.55,1)*u.str*Math.pow(Math.sin(cyc*Math.PI),.6)*(NIGHT>.6?.4:1);f.material.map.offset.x+=dt*u.w[1]*.004;});
  const sw=(Math.sin(t*2*Math.PI/per)*.5+.5);swash.position.set(0,.02+sw*.03,-.4-wh*.5+sw*(1.2+wh*2.2));swash.material.opacity=(.25+wh*.3)*(1-sw*.5)*(NIGHT>.6?.35:1);
  // pioggia
  const rainOn=w.pr>.05||(w.code>=51&&w.code<=99);rain.material.opacity=rainOn?clamp(.25+w.pr*.15,0,.6):0;if(rainOn){rain.position.copy(camera.position);rain.position.y=0;const a=rain.geometry.attributes.position;for(let i=0;i<a.count;i+=2){let y=a.getY(i)-dt*14;if(y<0)y+=25;a.setY(i,y);a.setY(i+1,y-.45);}a.needsUpdate=true;}
  if(w.code>=95&&Math.random()<dt*.06)st.lightning=1;st.lightning=Math.max(0,st.lightning-dt*3);if(st.lightning>0)hemi.intensity+=st.lightning*2;
  // ammofila mossa dal vento
  grass.rotation.z=Math.sin(t*1.5)*w.ws*.0006;
  // mare: fruscio continuo come prima, ma solo con mare mosso; vento: appena percettibile e solo con vento vero
  seaSound(clamp(((w.wave||0)-.3)*.11,0,.25));windSound(w.ws>20?clamp((w.ws-20)/80,0,.018):0,t);}
// telecamera: dietro al pescatore quando si muove, larga sulle canne quando è seduto, vicina al mulinello nel combattimento
const CAM={p:null,l:null};
function updCam(dt,t){let p,l;const a=AN.pos;
  if(G.camOv){camera.position.set(...G.camOv.p);camera.lookAt(...G.camOv.l);return;}
  if(st.follow){const v=st.follow.position,boat=VEH.type==='boat';p=new T.Vector3(v.x+2,v.y+(boat?3.5:6),v.z+(boat?9:11));l=new T.Vector3(v.x,boat?0:v.y-4,v.z-8);}
  else if(st.phase==='fight'||(AN.holding>=0&&st.phase!=='wait')){p=new T.Vector3(a.x+1.5,a.y+1.9,a.z+4.6);l=new T.Vector3(a.x-.2,a.y+1.7,a.z-6);}
  else if(st.busy||st.phase==='atrod'||st.phase==='bait'||st.phase==='cast'){p=new T.Vector3(a.x+.9,a.y+2.3,a.z+5.4);l=new T.Vector3(a.x,a.y+1.2,a.z-8);}
  else{const por=camera.aspect<1,sitting=AN.target==='sit',H=sitting?new T.Vector3(CHAIR.x,CHAIR.z*.035+1.2,CHAIR.z):AN.pos.clone().add(new T.Vector3(0,1.4,0)),rad=sitting?(por?9:6.5):(por?7:5.5),yb=Math.atan2(CHAIR.x-.6,14+(por?9:6.5))*0+0;
    const fy=LOOK.yaw+.05,fx=Math.sin(fy),fz=-Math.cos(fy),cp=Math.cos(LOOK.pitch),sp=Math.sin(LOOK.pitch);
    p=new T.Vector3(H.x-fx*rad+(por?.6:1)*Math.cos(fy),H.y+(por?2.2:1.5)-sp*1.5,H.z-fz*rad);
    l=new T.Vector3(H.x+fx*28*cp,H.y-.3+sp*28,H.z+fz*28*cp);
    if(AN.target==='sit'){AN.obj.userData.J.head.rotation.y=clamp(-LOOK.yaw,-1.1,1.1);AN.obj.userData.J.head.rotation.x=clamp(-LOOK.pitch*.5,-.4,.2);}}
  const fov0=camera.aspect<1?68:50,fz=fov0/LOOK.zoom;if(Math.abs(camera.fov-fz)>.05){camera.fov=lerp(camera.fov,fz,.3);camera.updateProjectionMatrix();}
  if(!CAM.p){CAM.p=p.clone();CAM.l=l.clone();}const f=1-Math.exp(-(sittingView()?7:2.5)*dt);CAM.p.lerp(p,f);CAM.l.lerp(l,f);camera.position.copy(CAM.p);camera.position.y+=Math.sin(t*.4)*.02;camera.lookAt(CAM.l);}
function drawHud(w){const d=gameDate(),mp=moonPosG(d,SPOT.lat,SPOT.lon);
  const wi=w.code>=95?'⛈️':w.code>=80?'🌦️':w.code>=51?'🌧️':w.code>=45?'🌫️':w.cc>75?'☁️':w.cc>35?'⛅':sunPos(d,SPOT.lat,SPOT.lon).alt>0?'☀️':'🌙';
  const h=`<div>📍 ${escH(SPOT.name.split(' · ')[0])} · <b>${d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</b>${st.speed>1&&st.phase==='wait'&&!st.busy?' ⏩':''}</div><div>${wi} ${Math.round(w.temp)}° ${['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][Math.round(mp.ph/45)%8]} 🎣${w.idx}${st.sim?' ⚠️':''}</div><br><div>🌬️ ${Math.round(w.ws)} ${windName(w.wd)}</div><div>🌊 ${(w.wave||0).toFixed(1).replace('.',',')} m · ${Math.round(w.sst)}°</div>`;if(hud.innerHTML!==h)hud.innerHTML=h;}
G._bite=i=>startBite(st.rods[i]);G._sp=n=>SP.find(x=>x.n===n);G._ui=()=>setUI();G._an=AN;G._cam=()=>camera;G._npcs=()=>NPCS;G._crabs=()=>CRABS;G._tangle=r=>checkTangle(r);G._look=(y,p)=>{LOOK.yaw=y;LOOK.pitch=p;};
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

/* ---------- probabilità di abboccata: stagione, esca, mare, ora, distanza, indice reale ---------- */
function period(date){const s=sunPos(date,SPOT.lat,SPOT.lon).alt;return s<-6?'notte':s<8?(date.getHours()<12?'alba':'tramonto'):'giorno';}
function waveF(sp,h){const [a,o,b]=sp.wave;if(h<a)return .5+.5*(h/(a||1));if(h>b)return Math.max(.05,1-(h-b));return h<=o?.7+.3*((h-a)/((o-a)||1)):.7+.3*((b-h)/((b-o)||1));}
function distF(sp,d){const [a,b]=sp.d;return d<a?Math.max(.15,d/a):d>b?Math.max(.15,1-(d-b)/60):1;}
function speciesWeights(r){const d=gameDate(),w=wxAt(st.gt),m=d.getMonth()+1,per=period(d),temp=w.sst||17;
  return SP.map(sp=>{const b=sp.bait[r.bait]||0;if(!b)return [sp,0];
    let f=sp.ab*(sp.mo[m]||.05)*b*waveF(sp,w.wave||0)*(sp.time[per]||.5)*distF(sp,r.dist)*(SPOT.fishK?.[sp.n]||1);
    if(sp.n==='Spigola'&&temp<15)f*=1.2;if(sp.n==='Orata'&&temp<13)f*=.4;if((sp.n==='Serra'||sp.n==='Leccia stella')&&temp<18)f*=.3;
    const hk=r.hook||st.hook;if(hk==='piccolo'&&sp.w[1]>1)f*=.7;if(hk==='grande'&&sp.w[1]<.4)f*=.35;
    if(r.rig==='lungo'&&['Orata','Mormora','Sarago maggiore'].includes(sp.n))f*=(w.wave||0)<.7?1.2:.85;if(r.rig==='corto')f*=(w.wave||0)>=.8?1.15:.95;
    return [sp,f];});}
function biteRate(r){// abboccate per minuto di gioco
  if(!r.bait||r.state!=='fishing'||r.baitLeft<=0)return 0;const w=wxAt(st.gt),idx=clamp(w.idx??50,0,100);
  const s=speciesWeights(r).reduce((a,[,f])=>a+f,0);return (s*(.35+idx/100*1.3)*.045+.004)*(r.rig==='2ami'?1.25:1); // + piccoli pesci e granchietti che rubano l'esca
}

function sizeOf(sp){const [a,t,b]=sp.w;let x=Math.exp(Math.log(t)+(Math.random()+Math.random()+Math.random()-1.5)*.55);if(Math.random()<.04)x*=1.6;return clamp(x,a,b);}
function lenOf(sp,w){const [a,b]=sp.lw;return Math.round(Math.pow(w*1000/a,1/b)*(sp.crab?.1:1)*10)/10||Math.round(Math.pow(w*1000/a,1/b));}
function record(rel){const c=st.catchShow,r=st.rods[st.sel];const e={n:c.sp.n,w:Math.round(c.w*100)/100,l:c.l,t:st.gt,rel,bait:c.bait||''};st.bag.push(e);LSS('bag',st.bag.slice(-200));
  if(c.rec){st.best[c.sp.n]=e.w;LSS('best',st.best);}st.total.n++;st.total.kg+=e.w;st.total.pts+=Math.round(e.w*100)+(rel?50:0)+(c.sp.ab<.1?300:0);LSS('total',st.total);}
G.release=()=>{record(true);st.msg='💚 Rilasciato. Bravo!';G.rebait();};
G.keep=()=>{record(false);st.msg='🧺 Nel carniere';G.rebait();};

function mix(a,b,t){const p=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)],A=p(a),Bb=p(b);return '#'+A.map((v,i)=>Math.round(lerp(v,Bb[i],clamp(t,0,1))).toString(16).padStart(2,'0')).join('');}
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
#g3{position:absolute;inset:0}#g3 canvas{display:block;width:100%;height:100%}.gr[disabled]{opacity:.55}
#ghud{position:absolute;left:6px;right:140px;top:calc(env(safe-area-inset-top) + 6px);display:flex;flex-wrap:wrap;gap:4px;pointer-events:none}#ghud br{flex-basis:100%;height:0;content:''}
#ghud div{background:rgba(4,14,26,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border-radius:10px;padding:3px 8px;font:600 12.5px Outfit,sans-serif;white-space:nowrap}
#gx,#gau{position:absolute;top:calc(env(safe-area-inset-top) + 8px);width:40px;height:40px;border-radius:12px;border:0;background:rgba(4,14,26,.65);color:#fff;font-size:18px;cursor:pointer}
#gmapc{position:absolute;inset:0;display:block;touch-action:none}#gmini{position:absolute;top:calc(env(safe-area-inset-top) + 56px);right:8px;border-radius:12px;pointer-events:none}#gx{right:8px}#gau{right:54px}#glamp{position:absolute;top:calc(env(safe-area-inset-top) + 8px);right:100px;width:40px;height:40px;border-radius:12px;border:0;background:rgba(4,14,26,.65);color:#fff;font-size:18px;cursor:pointer}#gjoy{position:absolute;left:16px;bottom:200px;width:116px;height:116px;border-radius:50%;background:rgba(4,14,26,.45);border:2px solid rgba(255,255,255,.35);touch-action:none;display:none}#gjoy i{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;background:rgba(255,255,255,.8);box-shadow:0 2px 8px rgba(0,0,0,.4)}
#glamp.off{opacity:.45;filter:grayscale(1)}#gspd{position:absolute;top:calc(env(safe-area-inset-top) + 56px);right:8px;height:36px;padding:0 12px;border-radius:12px;border:0;background:rgba(4,14,26,.7);color:#fff;font:700 14px Outfit,sans-serif;cursor:pointer}
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
.gc{padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;font:600 13.5px Outfit,sans-serif;cursor:pointer}
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
.grods{display:flex;gap:6px}.gtalk{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.gtalk .gc{flex:1 1 45%;text-align:left}
.gr{flex:1;padding:6px 5px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font:600 13px Outfit,sans-serif;text-align:center}
.gr small{display:block;font-weight:500;font-size:12px;opacity:.85}
.gr.alert{background:linear-gradient(135deg,#ffb547,#ff4d5e);animation:gpulse .4s infinite alternate}.gr.alert small:nth-of-type(1){display:none}.gr b,.gr small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gbar{position:relative;height:20px;border-radius:10px;background:rgba(255,255,255,.12);overflow:hidden;margin:6px 0}
.gbar i{position:absolute;left:0;top:0;bottom:0;width:30%;background:#2fe0cf;transition:width .1s}.gbar.dist i{background:#3b8cff}
.gbar span{position:absolute;left:8px;top:1px;font-size:12.5px;font-weight:700;text-shadow:0 1px 2px #000}
.gfish canvas{width:100%;height:auto;display:block;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}
.glist{max-height:34vh;overflow:auto;margin:8px 0;font-size:14px}.glist div{padding:5px 0;border-bottom:1px solid rgba(255,255,255,.08)}.glist small{opacity:.7}
`;document.head.appendChild(css);
})();
