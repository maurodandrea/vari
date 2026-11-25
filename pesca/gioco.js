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
function baitGone(){const c=ac();if(!c)return;[0,.28].forEach((d,k)=>{const o=c.createOscillator(),v=c.createGain(),t=c.currentTime+d;o.type='triangle';o.frequency.setValueAtTime(k?330:440,t);o.frequency.exponentialRampToValueAtTime(k?220:300,t+.22);v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(.12,t+.02);v.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(v).connect(c.destination);o.start(t);o.stop(t+.3);});}
function dragTick(d=0){const c=ac();if(!c)return;const t=c.currentTime+d,b=c.createBuffer(1,Math.floor(c.sampleRate*.012),c.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/x.length,3);
  const s=c.createBufferSource();s.buffer=b;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=3200+Math.random()*600;bp.Q.value=4;const v=c.createGain();v.gain.value=.5;s.connect(bp).connect(v).connect(c.destination);s.start(t);}
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
  bag:LSG('bag',[]),inv:{granchio:0},best:LSG('best',{}),total:LSG('total',{n:0,kg:0,pts:0}),lead:LSG('lead',150),outfit:LSG('outfit','jeans'),castMode:'mano',castStyle:LSG('cstyle','above'),castDist:LSG('cdist',120),hook:hookNum(LSG('hook',2)),nRods:LSG('nrods',1),busy:false,lightning:0};
const gameDate=()=>new Date(st.gt);
G._st=st;
const CHAIR={x:-1.5,z:14};const ROD_Z=1.6;
const rodX=(i,n)=>n===1?0:n===2?[-3,3][i]:[-5,0,5][i];
function hookNum(h){return typeof h==='number'?h:({piccolo:6,medio:2,grande:0})[h]??2;}
function hookCat(h){h=hookNum(h);return h<=1?'grande':h>=6?'piccolo':'medio';}// 0 grande, 2-4 medio, 6-8 piccolo

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
  Object.assign(MAT,{pupil:S('#08090b',.1),skin:S('#cf9878',.6),lips:S('#a8615a',.5),eyeW:S('#f2efe8',.12),iris:S('#4a3a26',.15),brow:S('#3a2a1e',.9),stubble:S('#a9806a',.9),jacket:S('#2f5544',.85),jacket2:S('#264638',.9),pants:S('#2c3445',.9),boot:S('#3a2a1e',.7),cap:S('#b8352a',.85),hair:S('#2a2018',.95),
    alu:S('#b9c2cb',.35,.8),blank:S('#18222e',.35,.3),blank2:S('#2c3f55',.35,.3),tip:S('#e9eef2',.4),cork:S('#9c7a52',.95),reel:S('#3d4550',.35,.7),spool:S('#c9a24a',.3,.8),
    chair:S('#2a5d8a',.8),chairF:S('#9aa3ad',.4,.7),bag:S('#4a5a32',.9),bucket:S('#e8e8e8',.6),lead:S('#666a70',.4,.6),line:new T.LineBasicMaterial({color:0xd6e0e6,transparent:true,opacity:.2,depthWrite:false})});}

/* ---------- il pescatore: corpo articolato ---------- */
function limb(len,r1,r2,mat,jk=.88){// segmento che pende verso il basso dal suo perno: profilo con il ventre del muscolo e articolazione arrotondata
  const pts=[];for(let i=12;i>=0;i--){const t=i/12,r=lerp(r1,r2,t)*(1+.13*Math.sin(Math.PI*Math.min(1,t*1.35)))*(t>.92?1-(t-.92)*1.2:1);pts.push(new T.Vector2(Math.max(.001,r),len/2-t*len));}
  const g=new T.Group(),m=new T.Mesh(new T.LatheGeometry(pts,18),mat);m.position.y=-len/2;m.castShadow=true;g.add(m);
  const j=new T.Mesh(new T.SphereGeometry(r1*jk,14,10),mat);j.scale.y=.8;j.castShadow=true;g.add(j);g.userData.len=len;return g;}
// pescatore con abbigliamento e aspetto a scelta:
// o={j,j2,c,p: colori; hat:'cap'|'beanie'|'bucket'|'none'; beard:'stubble'|'full'|'mustache'|'none'; beardCol; glasses; suit:'jacket'|'waders'|'tracksuit'|'wetsuit'; boots:'boots'|'tall'|'shoes'; skin; hair}
// trama del tessuto (giacca, pantaloni) e grana della gomma
let FABRIC=null;function fabricTex(){if(FABRIC)return FABRIC;FABRIC=canvasTex(256,256,(g,W,H)=>{g.fillStyle='#808080';g.fillRect(0,0,W,H);for(let y=0;y<H;y++)for(let x=0;x<W;x+=2){const v=128+((x+y)%4<2?10:-10)+rnd(-8,8);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x,y,2,1);}},[10,10]);return FABRIC;}
let HAIRT=null;function hairTex(){if(HAIRT)return HAIRT;HAIRT=canvasTex(256,256,(g,W,H)=>{g.fillStyle='#d8d8d8';g.fillRect(0,0,W,H);for(let i=0;i<1600;i++){const x=Math.random()*W,v=Math.random()<.5?40:255;g.strokeStyle=`rgba(${v},${v},${v},.22)`;g.lineWidth=1;g.beginPath();g.moveTo(x,Math.random()*H);g.lineTo(x+rnd(-4,4),Math.random()*H);g.stroke();}},[4,4]);return HAIRT;}
// testa scolpita: cranio, arcate, orbite, zigomi, naso, labbra, mento e mandibola; colori della pelle dipinti sui vertici
const HEADG={};
function headGeo(o){const key=[o.skin,o.beard,o.hair,o.beardCol,!!o.photo].join('|');if(HEADG[key])return HEADG[key];
  const g=new T.SphereGeometry(1,128,96),P=g.attributes.position,N=P.count,col=new Float32Array(N*3);
  const G=(x,y,cx,cy,sx,sy)=>Math.exp(-((x-cx)**2/(2*sx*sx)+(y-cy)**2/(2*sy*sy)));
  const sk=new T.Color(o.skin||'#cf9878'),lip=sk.clone().lerp(new T.Color('#a2474a'),.55),cheek=new T.Color('#d4776a'),beard=new T.Color(o.beardCol||o.hair||'#3a2a1e'),brow=new T.Color(o.hair||'#3a2a1e'),tmp=new T.Color();
  const bd=o.beard||'stubble',plain=!!o.photo;
  for(let i=0;i<N;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);
    let X=x*.086,Y=y*.11,Z=z*.1;const F=clamp(-z,0,1),Fs=F*F;
    // mandibola che si stringe verso il mento, nuca piena
    if(Y<-.015){const k=clamp((-Y-.015)/.095,0,1);X*=1-.3*k*k;Z*=1-.12*k*(z>0?1.4:0);}
    if(z>0&&Y>-.02)Z*=1.06;
    let d=0;
    if(!plain){d+=.0045*G(X,Y,0,.036,.05,.007)*Fs;// arcate sopraccigliari
      for(const s of[-1,1]){d-=.0085*G(X,Y,s*.033,.012,.014,.011)*Fs;d+=.0065*G(X,Y,s*.05,-.018,.018,.014)*F;}// orbite, zigomi
      const t=clamp((.034-Y)/.066,0,1.25),nw=.0085+.008*Math.min(1,t);d+=(Y<.034&&Y>-.046?(.005+.021*Math.pow(Math.min(t,1),1.5))*(t>1?Math.max(0,1-(t-1)*5):1):0)*Math.exp(-(X*X)/(2*nw*nw))*Fs;// naso
      for(const s of[-1,1])d+=.006*G(X,Y,s*.013,-.033,.006,.006)*Fs;// ali del naso
      d+=.004*G(X,Y,0,-.049,.017,.005)*Fs+.0035*G(X,Y,0,-.061,.015,.005)*Fs-.0025*G(X,Y,0,-.055,.02,.0018)*Fs;// labbra e taglio della bocca
      d+=.007*G(X,Y,0,-.093,.018,.012)*Fs;// mento
    }
    P.setXYZ(i,X,Y,Z-d);
    // colori: pelle con variazioni, guance, labbra, occhiaie, barba, sopracciglia
    tmp.copy(sk).multiplyScalar(.96+Math.random()*.06);if(!plain){
      for(const s of[-1,1]){tmp.lerp(cheek,.22*G(X,Y,s*.046,-.022,.016,.014)*F);tmp.multiplyScalar(1-.18*G(X,Y,s*.033,.004,.013,.008)*F);}
      tmp.lerp(cheek,.18*G(X,Y,0,-.028,.008,.008)*Fs);for(const s of[-1,1]){tmp.multiplyScalar(1-.22*G(X,Y,s*.014,-.012,.004,.022)*Fs-.55*G(X,Y,s*.0065,-.041,.0025,.0018)*Fs-.12*G(X,Y,s*.022,-.045,.004,.01)*Fs);}
      const lipW=G(X,Y,0,-.049,.016,.0045)+G(X,Y,0,-.061,.014,.0045);tmp.lerp(lip,clamp(lipW*.85,0,.85)*Fs);
      if(bd==='stubble'||bd==='full'||bd==='mustache'){const jaw=clamp((-.025-Y)/.02,0,1)*(1-clamp(lipW*1.3,0,1))*(z<.4?1:0),mus=G(X,Y,0,-.042,.02,.004)*Fs;tmp.lerp(beard,(bd==='stubble'?.4:.75)*Math.max(jaw*(.4+.6*F),bd!=='stubble'?mus:mus*.6));}
      for(const s of[-1,1]){const bx=X*s,by=.032-14*(bx-.036)**2;if(bx>.016&&bx<.055)tmp.lerp(brow,.85*Math.exp(-((Y-by)**2)/(2*.0028*.0028))*Fs);}}
    col[i*3]=tmp.r;col[i*3+1]=tmp.g;col[i*3+2]=tmp.b;}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();return HEADG[key]=g;}
function makeAngler(o={}){
  const S=(c,r=.85,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});const SF=(c,r=.9)=>new T.MeshStandardMaterial({color:c,roughness:Math.max(r,.88),bumpMap:fabricTex(),bumpScale:.06});
  const suit=o.suit||'jacket',skin=S(o.skin||'#cf9878',.62),hairM=new T.MeshStandardMaterial({color:o.hair||'#3a2a1e',roughness:.8,bumpMap:hairTex(),bumpScale:.3}),beardM=new T.MeshStandardMaterial({color:o.beardCol||o.hair||'#5a4636',roughness:.85,bumpMap:hairTex(),bumpScale:.35});
  let jacket=SF(o.j||'#2f5544'),jacket2=SF(o.j2||'#264638',.9),pants=SF(o.p||'#2c3445',.9),capM=SF(o.c||'#b8352a');
  if(suit==='wetsuit'){jacket=pants=jacket2=S('#16191d',.55);}
  const rubber=S(o.rubber||'#2e3a2a',.5),bootM=S(o.boots==='shoes'?'#d8d8d2':'#2b2a28',.7);
  const legM=suit==='waders'?rubber:pants;
  const A=new T.Group(),J={};A.userData.J=J;
  const hips=new T.Group();hips.position.y=.95;A.add(hips);J.hips=hips;
  const pelvis=new T.Mesh(new T.SphereGeometry(.17,18,14),legM);pelvis.scale.set(1.18,.78,.86);hips.add(pelvis);
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
    const strapM=S('#1f2620',.8);for(const s of[-1,1]){const cv=new T.CatmullRomCurve3([[.085,.33,-.142],[.095,.47,-.14],[.115,.565,-.1],[.125,.615,0],[.115,.565,.1],[.095,.47,.14],[.085,.33,.142]].map(([x,y,z])=>new T.Vector3(s*x,y,z)));
      const br=new T.Mesh(new T.TubeGeometry(cv,40,.011,6,false),strapM);br.scale.set(1,1,1);spine.add(br);
      for(const z of[-.142,.142]){const bk=new T.Mesh(new T.BoxGeometry(.03,.022,.008),S('#9aa3ad',.4,.7));bk.position.set(s*.085,.34,z*1.02);spine.add(bk);}}}
  if(suit==='wetsuit'){const st2=new T.Mesh(new T.BoxGeometry(.3,.04,.21),S('#2f6fb5',.5));st2.position.y=.42;spine.add(st2);}
  const neck=new T.Group();neck.position.y=.62;spine.add(neck);J.neck=neck;
  const nk=new T.Mesh(new T.CylinderGeometry(.054,.064,.11,16),suit==='wetsuit'?jacket:skin);nk.position.y=.035;neck.add(nk);
  const head=new T.Group();head.position.y=.15;neck.add(head);J.head=head;
  // volto
  const skull=new T.Mesh(headGeo(o),new T.MeshStandardMaterial({vertexColors:true,roughness:.62}));head.add(skull);
  const bd=o.beard||'stubble';
  if(bd==='full'){const fb=new T.Mesh(new T.SphereGeometry(.078,26,16,0,6.3,1.75,1.2),beardM);fb.scale.set(.92,.92,.98);fb.position.set(0,-.048,-.008);head.add(fb);
    const ch=new T.Mesh(new T.SphereGeometry(.032,14,10),beardM);ch.scale.set(1.15,1.05,.85);ch.position.set(0,-.104,-.06);head.add(ch);}
  if(bd==='full'||bd==='mustache'){const mu=new T.Mesh(new T.SphereGeometry(.01,12,8),beardM);mu.scale.set(2.6,.75,.9);mu.position.set(0,-.041,-.103);head.add(mu);}
  for(const s of[-1,1]){
    // occhio: bulbo lucido, iride con pupilla e riflesso, palpebre e ciglia
    const eye=new T.Mesh(new T.SphereGeometry(.0106,16,12),MAT.eyeW);eye.position.set(s*.033,.012,-.0772);head.add(eye);
    const iris=new T.Mesh(new T.SphereGeometry(.0058,14,10),MAT.iris);iris.scale.z=.45;iris.position.set(s*.033,.0112,-.0872);head.add(iris);
    const pup=new T.Mesh(new T.SphereGeometry(.0027,10,8),MAT.pupil);pup.scale.z=.4;pup.position.set(s*.033,.0112,-.0884);head.add(pup);
    const gl=new T.Mesh(new T.SphereGeometry(.0011,6,6),new T.MeshBasicMaterial({color:'#ffffff'}));gl.position.set(s*.033-.0015,.0132,-.089);head.add(gl);
    const lid=new T.Mesh(new T.SphereGeometry(.0114,16,8,0,6.3,0,1.15),skin);lid.position.set(s*.033,.0122,-.0769);lid.rotation.x=-.42;head.add(lid);
    const lash=new T.Mesh(new T.TorusGeometry(.0105,.0007,4,14,2.2),MAT.pupil);lash.position.set(s*.033,.0125,-.0858);lash.rotation.set(.35,0,.47);head.add(lash);
    const lidL=new T.Mesh(new T.SphereGeometry(.0112,14,6,0,6.3,2.3,.85),skin);lidL.position.set(s*.033,.0112,-.0769);head.add(lidL);
    const brow=new T.Mesh(new T.TorusGeometry(.03,.0024,5,12,.95),hairM);brow.position.set(s*.036,.006,-.093);brow.rotation.set(-.15,0,Math.PI/2-.47+(s<0?.94:0));brow.scale.set(1,1,.6);head.add(brow);
    // orecchio: padiglione con bordo
    const ear=new T.Group();ear.position.set(s*.089,.0,.008);ear.rotation.y=s*.25;head.add(ear);
    const ep=new T.Mesh(new T.SphereGeometry(.022,12,10),skin);ep.scale.set(.32,1.05,.72);ear.add(ep);const rim=new T.Mesh(new T.TorusGeometry(.018,.0045,6,16),skin);rim.rotation.y=Math.PI/2;rim.scale.set(1,1.2,.8);rim.position.x=s*.002;ear.add(rim);}
  if(o.glasses){const gm=S('#151515',.3,.4),lens=new T.MeshStandardMaterial({color:'#1e2a33',roughness:.1,metalness:.6,transparent:true,opacity:.85});
    for(const s of[-1,1]){const fr=new T.Mesh(new T.TorusGeometry(.017,.0028,6,16),gm);fr.position.set(s*.034,.012,-.102);head.add(fr);const ln=new T.Mesh(new T.CircleGeometry(.016,14),lens);ln.position.set(s*.034,.012,-.1035);ln.rotation.y=Math.PI;head.add(ln);
      const arm=new T.Mesh(new T.BoxGeometry(.003,.003,.09),gm);arm.position.set(s*.05,.014,-.06);head.add(arm);}
    const bri=new T.Mesh(new T.BoxGeometry(.016,.003,.003),gm);bri.position.set(0,.016,-.104);head.add(bri);}
  // capelli e copricapo
  const hat=o.hat||'cap',hairTop=hat==='none';
  const hair=new T.Mesh(new T.SphereGeometry(.104,18,12,hairTop?0:-.25,hairTop?6.3:Math.PI+.5,hairTop?0:.5,hairTop?1.5:1.35),hairM);hair.position.set(0,.008,.006);hair.scale.set(.86,1,1);head.add(hair);
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
    const hm=suit==='wetsuit'?armM:skin,palm=new T.Mesh(new T.SphereGeometry(.038,14,12),hm);palm.scale.set(.82,1.08,.45);palm.position.y=-.032;hand.add(palm);
    // quattro dita piegate a presa e il pollice
    for(let f=0;f<4;f++){const fg=new T.Group();fg.position.set((f-1.5)*.0145,-.066,-.004);fg.rotation.x=.9;hand.add(fg);const L1=[.026,.028,.027,.022][f];
      const p1=new T.Mesh(new T.CylinderGeometry(.0068,.0072,L1,8),hm);p1.position.y=-L1/2;fg.add(p1);const k2=new T.Group();k2.position.y=-L1;k2.rotation.x=1.1;fg.add(k2);
      const p2=new T.Mesh(new T.CylinderGeometry(.006,.0066,L1*.85,8),hm);p2.position.y=-L1*.42;k2.add(p2);const tp=new T.Mesh(new T.SphereGeometry(.006,8,6),hm);tp.position.y=-L1*.85;k2.add(tp);}
    const th=new T.Mesh(new T.CylinderGeometry(.0085,.0095,.04,8),hm);th.position.set(-s*.026,-.035,-.016);th.rotation.set(-.6,0,s*.75);hand.add(th);
    const hp=new T.Group();hp.position.set(s*.1,-.02,0);hips.add(hp);J[k+'Hip']=hp;
    const thg=limb(.44,.088,.066,legM,.78);hp.add(thg);const kn=new T.Group();kn.position.y=-.44;thg.add(kn);J[k+'Knee']=kn;
    const sn=limb(.42,.06,.05,legM,.86);kn.add(sn);
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
  castBack:{hy:.93,sp:[.2,.55,0],hd:[-.1,-.3,0],lSh:[2.5,0,.3],rSh:[2.8,0,-.3],lEl:[.6,0,0],rEl:[.4,0,0],lHip:[.15,0,0],rHip:[-.35,0,0],lKnee:[-.1,0,0],rKnee:[-.25,0,0],rod:{p:180,f:0,y:0}},
  castSide:{hy:.9,sp:[.05,.95,0],hd:[-.05,-.7,0],lSh:[1.35,0,.55],rSh:[1.5,0,-.95],lEl:[.35,0,0],rEl:[.2,0,0],lHip:[.15,0,0],rHip:[-.3,0,0],lKnee:[-.15,0,0],rKnee:[-.3,0,0],rod:{p:158,f:0,y:1.35}},
  castSideFwd:{hy:.92,sp:[-.15,-.85,0],hd:[-.1,.4,0],lSh:[1.2,0,.4],rSh:[1.45,0,-.5],lEl:[.25,0,0],rEl:[.15,0,0],lHip:[-.25,0,0],rHip:[.2,0,0],lKnee:[-.25,0,0],rKnee:[-.05,0,0],rod:{p:40,f:0,y:-.7}},
  castGround:{hy:.8,sp:[.3,1.3,0],hd:[-.15,-.95,0],lSh:[1.0,0,.65],rSh:[1.2,0,-1.05],lEl:[.25,0,0],rEl:[.15,0,0],lHip:[.55,0,0],rHip:[-.2,0,0],lKnee:[-.8,0,0],rKnee:[-.45,0,0],rod:{p:166,f:0,y:.95}},
  castPendUp:{hy:.95,sp:[-.05,0,0],hd:[-.25,0,0],lSh:[2.2,0,.2],rSh:[2.5,0,-.2],lEl:[.4,0,0],rEl:[.3,0,0],lHip:[0,0,0],rHip:[0,0,0],lKnee:[0,0,0],rKnee:[0,0,0],rod:{p:68,f:0,y:0}},
  castPend:{hy:.86,sp:[.2,1.15,0],hd:[-.1,-.85,0],lSh:[1.3,0,.55],rSh:[1.6,0,-.95],lEl:[.3,0,0],rEl:[.2,0,0],lHip:[.4,0,0],rHip:[-.25,0,0],lKnee:[-.5,0,0],rKnee:[-.35,0,0],rod:{p:150,f:0,y:1.05}},
  castOverTop:{hy:.95,sp:[-.05,.15,0],hd:[-.2,-.1,0],lSh:[2.4,0,.25],rSh:[2.9,0,-.2],lEl:[.9,0,0],rEl:[.35,0,0],lHip:[-.05,0,0],rHip:[.05,0,0],lKnee:[-.05,0,0],rKnee:[-.15,0,0],rod:{p:95,f:0,y:.1}},
  castFollow:{hy:.93,sp:[-.35,-.2,0],hd:[-.2,.1,0],lSh:[1.0,0,.15],rSh:[1.65,0,-.05],lEl:[.6,0,0],rEl:[.05,0,0],lHip:[-.35,0,0],rHip:[.35,0,0],lKnee:[-.35,0,0],rKnee:[-.05,0,0],rod:{p:22,f:0,y:-.05}},
  sideSweep:{hy:.9,sp:[0,.45,0],hd:[-.05,-.2,0],lSh:[1.3,0,.45],rSh:[1.55,0,-.7],lEl:[.35,0,0],rEl:[.2,0,0],lHip:[0,0,0],rHip:[-.1,0,0],lKnee:[-.2,0,0],rKnee:[-.2,0,0],rod:{p:135,f:0,y:.75}},
  otgAddress:{hy:.8,sp:[.35,1.5,0],hd:[-.25,-1.1,0],lSh:[.9,0,.6],rSh:[1.1,0,-1.0],lEl:[.25,0,0],rEl:[.15,0,0],lHip:[.6,0,0],rHip:[-.2,0,0],lKnee:[-.85,0,0],rKnee:[-.45,0,0],rod:{p:172,f:0,y:1.1}},
  otgTurn:{hy:.86,sp:[.15,.8,0],hd:[-.15,-.4,0],lSh:[1.4,0,.5],rSh:[1.8,0,-.8],lEl:[.3,0,0],rEl:[.2,0,0],lHip:[.25,0,0],rHip:[-.1,0,0],lKnee:[-.45,0,0],rKnee:[-.3,0,0],rod:{p:140,f:0,y:.7}},
  pendStart:{hy:.95,sp:[-.05,0,0],hd:[-.25,0,0],lSh:[1.6,0,.2],rSh:[1.9,0,-.2],lEl:[.6,0,0],rEl:[.4,0,0],lHip:[0,0,0],rHip:[0,0,0],lKnee:[0,0,0],rKnee:[0,0,0],rod:{p:85,f:0,y:0}},
  pendOut:{hy:.95,sp:[-.12,0,0],hd:[-.3,0,0],lSh:[1.8,0,.2],rSh:[2.1,0,-.2],lEl:[.5,0,0],rEl:[.35,0,0],lHip:[-.05,0,0],rHip:[.05,0,0],lKnee:[0,0,0],rKnee:[-.05,0,0],rod:{p:70,f:0,y:0}},
  castFwd:{hy:.92,sp:[-.3,-.3,0],hd:[-.15,.2,0],lSh:[1.1,0,.2],rSh:[1.5,0,-.1],lEl:[.3,0,0],rEl:[.2,0,0],lHip:[-.3,0,0],rHip:[.25,0,0],lKnee:[-.3,0,0],rKnee:[-.05,0,0],rod:{p:25,f:0,y:-.1}},
  showFish:{hy:.95,sp:[.04,0,0],hd:[.25,0,0],lSh:[.45,0,.42],rSh:[.45,0,-.42],lEl:[1.05,0,0],rEl:[1.05,0,0],lHip:[0,0,0],rHip:[0,0,0],lKnee:[0,0,0],rKnee:[0,0,0],rod:null},
  strike:{hy:.96,sp:[.3,.1,0],hd:[-.25,0,0],lSh:[2.4,0,.3],rSh:[2.5,0,-.2],lEl:[.5,0,0],rEl:[.4,0,0],lHip:[-.2,0,0],rHip:[.25,0,0],lKnee:[-.1,0,0],rKnee:[-.25,0,0],rod:{p:80,f:0}},
  reel:{hy:.93,sp:[.12,.05,0],hd:[-.1,0,0],lSh:[.9,0,.35],rSh:[1.15,0,-.05],lEl:[1.25,0,0],rEl:[.7,0,0],lHip:[-.15,0,0],rHip:[.2,0,0],lKnee:[-.12,0,0],rKnee:[-.2,0,0],rod:{p:42,f:0}},
};
const AN={faceTo:null,obj:null,pose:JSON.parse(JSON.stringify(POSES.sit)),target:'sit',walk:0,moving:false,speed:1.4,pos:null,rotY:0,holding:-1,reelSpin:0,crank:0};
function lerpPose(dt,k=6,a=AN){const tp=POSES[a.target],p=a.pose,f=1-Math.exp(-k*dt);p.hy=lerp(p.hy,tp.hy,f);
  for(const j of['sp','hd','lSh','rSh','lEl','rEl','lHip','rHip','lKnee','rKnee'])for(let i=0;i<3;i++)p[j][i]=lerp(p[j][i],tp[j][i],f);
  if(tp.rod){if(!p.rod)p.rod={...tp.rod};p.rod.p=lerp(p.rod.p,tp.rod.p,f);p.rod.f=lerp(p.rod.f||0,tp.rod.f||0,f);p.rod.y=lerp(p.rod.y||0,tp.rod.y||0,f);}}
function reelIK(){const r=st.rods[AN.holding];if(!r||!r.held||!AN.obj)return;const J=AN.obj.userData.J,knob=r.obj.userData.crank.children[1];if(!knob)return;
  const tg=new T.Vector3();r.obj.updateMatrixWorld(true);knob.getWorldPosition(tg);const hp=new T.Vector3(),P=[[J.lSh.rotation,'x'],[J.lSh.rotation,'z'],[J.lSh.rotation,'y'],[J.lEl.rotation,'x']];
  const err=()=>{J.lSh.updateMatrixWorld(true);J.lHand.getWorldPosition(hp);return hp.distanceTo(tg);};let e=err(),st0=.12;
  for(let it=0;it<7;it++){for(const [o,k] of P){const v=o[k];o[k]=v+st0;let e1=err();if(e1<e){e=e1;continue;}o[k]=v-st0;e1=err();if(e1<e){e=e1;continue;}o[k]=v;}st0*=.6;}}
function applyPose(t,a=AN){const J=a.obj.userData.J,p=a.pose,set=(o,v)=>o.rotation.set(v[0],v[1],v[2]);
  const dtp=a.lt!=null?clamp(t-a.lt,0,.1):0;a.lt=t;const mv0=a.moving&&!a.swim,spd=a.speed||1.4,run=mv0&&spd>3.2;a.gA=lerp(a.gA||0,mv0?clamp(spd/1.5,.55,1.5):0,1-Math.exp(-dtp*7));const A1=a.gA,mv=A1>.02,ph=a.walk,s1=Math.sin(ph),c1=Math.cos(ph);
  // bacino: sale e scende, ruota e oscilla; il busto compensa e la testa resta stabile
  J.hips.position.y=p.hy+(mv?Math.abs(c1)*.045*A1-.035*A1:Math.sin(t*1.3)*.004);J.hips.rotation.set(0,mv?s1*.09*A1:0,mv?Math.sin(2*ph)*.03*A1:0);
  set(J.spine,[p.sp[0]+(mv?(.05+(run?.2:0))*Math.min(1,A1)+Math.abs(c1)*.015*A1:0),p.sp[1]-(mv?s1*.12*A1:0),p.sp[2]-(mv?Math.sin(2*ph)*.02*A1:0)]);
  set(J.head,[p.hd[0]-(run?.15:0),p.hd[1]+(mv?s1*.07*A1:0),p.hd[2]]);
  const arms=a.holding<0&&mv,aA=.32*A1,sa=Math.sin(ph-.35);
  set(J.lSh,[p.lSh[0]-(arms?sa*aA:0),p.lSh[1],p.lSh[2]+(arms?.05:0)]);set(J.rSh,[p.rSh[0]+(arms?sa*aA:0),p.rSh[1],p.rSh[2]-(arms?.05:0)]);
  set(J.lEl,[p.lEl[0]+(arms?(.22+(run?.9:0))*Math.min(1,A1)+Math.max(0,-Math.sin(ph-.6))*.32*A1:0),0,0]);set(J.rEl,[p.rEl[0]+(arms?(.22+(run?.9:0))*Math.min(1,A1)+Math.max(0,Math.sin(ph-.6))*.32*A1:0),0,0]);
  // recupero: la mano sinistra gira la manovella
  if(a.reelSpin>0&&a.holding>=0){const c=a.crank;J.lSh.rotation.x+=Math.sin(c)*.14;J.lSh.rotation.z+=Math.cos(c)*.09;J.lEl.rotation.x+=Math.sin(c)*.18;}
  // gambe: la gamba che avanza piega il ginocchio, quella d'appoggio resta quasi tesa; il piede rulla
  const tA=.45*A1;set(J.lHip,[p.lHip[0]+(mv?s1*tA:0),p.lHip[1],p.lHip[2]]);set(J.rHip,[p.rHip[0]-(mv?s1*tA:0),p.rHip[1],p.rHip[2]]);
  const kn=x=>(.92*Math.pow(Math.max(0,Math.cos(x+.55)),2)+.14*Math.pow(Math.max(0,Math.sin(x+.3)),2)+.05)*A1;// piega in oscillazione e ammortizza l'appoggio
  set(J.lKnee,[p.lKnee[0]-(mv?kn(ph):0),0,0]);set(J.rKnee,[p.rKnee[0]-(mv?kn(ph+Math.PI):0),0,0]);
  const an=x=>(-.2*Math.sin(x)+.28*Math.pow(Math.max(0,Math.cos(x+.9)),3)-.1*Math.pow(Math.max(0,-Math.cos(x-.4)),4))*A1;
  if(J.lFoot){J.lFoot.rotation.x=mv?an(ph):0;J.rFoot.rotation.x=mv?an(ph+Math.PI):0;}
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
  const crank=new T.Group();crank.position.set(.045,.0,.07);reel.add(crank);
  const arm=new T.Mesh(new T.BoxGeometry(.012,.07,.012),MAT.alu);arm.position.y=.035;crank.add(arm);const knob=new T.Mesh(new T.CylinderGeometry(.012,.012,.03,8),MAT.cork);knob.rotation.z=Math.PI/2;knob.position.set(.02,.07,0);crank.add(knob);
  crank.rotation.z=-Math.PI/2;
  g.userData={segs,rotor,crank,reel,lineOn,tip:new T.Object3D()};segs[SEG-1].add(g.userData.tip);g.userData.tip.position.y=ROD_LEN/SEG;
  // campanello e luce chimica in cima
  const bell=new T.Mesh(new T.SphereGeometry(.018,8,8),MAT.spool);bell.position.set(0,-.08,.02);segs[SEG-1].add(bell);
  const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(150,255,130,1)'),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));glow.scale.set(.5,.5,.5);glow.position.y=ROD_LEN/SEG;segs[SEG-1].add(glow);g.userData.glow=glow;
  return g;}
function bendRod(rod,b){const s=rod.userData.segs;for(let i=0;i<SEG;i++){const u=i/SEG;s[i].rotation.x=-b*u*u*.32;}}
// picchetto da surfcasting: barra piatta in alluminio a punta, forcella in alto e portacalcio a metà (in plastica verde), piantato un po' inclinato verso il mare
const SPIKE_TILT=-8,SPIKE_CUP=.7;
function makeSpike(kind){const g=new T.Group(),inner=new T.Group();inner.rotation.x=SPIKE_TILT*R;g.add(inner);
  const H=kind==='long'?1.75:kind==='pvc'||!kind?1.25:1.45,bm=kind==='pvc'||!kind?new T.MeshStandardMaterial({color:'#e8e8e2',roughness:.6}):new T.MeshStandardMaterial({color:'#cfd5da',roughness:.35,metalness:.45}),gm=new T.MeshStandardMaterial({color:'#9fe8a8',roughness:.45,transparent:true,opacity:.92});
  // barra piatta con la punta piantata nella sabbia
  const bar=new T.Mesh(new T.BoxGeometry(.032,H+.3,.009),bm);bar.position.y=(H-.3)/2;inner.add(bar);const fold=new T.Mesh(new T.BoxGeometry(.009,H+.3,.022),bm);fold.position.set(.0115,(H-.3)/2,.008);inner.add(fold);
  // forcella in alto: base e due denti, il fusto della canna ci appoggia
  const fork=new T.Group();fork.position.set(0,H,-.03);inner.add(fork);const fb=new T.Mesh(new T.BoxGeometry(.075,.025,.05),gm);fork.add(fb);
  for(const sx of[-1,1]){const t=new T.Mesh(new T.BoxGeometry(.016,.05,.05),gm);t.position.set(sx*.03,.035,0);fork.add(t);}const fc=new T.Mesh(new T.BoxGeometry(.03,.04,.012),gm);fc.position.set(0,-.02,.025);fork.add(fc);
  // portacalcio a metà: tazza aperta davanti dove entra il calcio della canna
  const cy=SPIKE_CUP*(H/1.45),cup=new T.Mesh(new T.CylinderGeometry(.034,.03,.085,14,1,true,Math.PI*.15,Math.PI*1.7),new T.MeshStandardMaterial({color:'#9fe8a8',roughness:.45,side:T.DoubleSide}));cup.position.set(0,cy,-.035);inner.add(cup);
  const cb=new T.Mesh(new T.CylinderGeometry(.034,.034,.008,14),gm);cb.position.set(0,cy-.042,-.035);inner.add(cb);const ck=new T.Mesh(new T.BoxGeometry(.04,.06,.014),gm);ck.position.set(0,cy,-.004);inner.add(ck);
  g.userData.cupY=cy-.038;g.userData.H=H;
  // tripode: gambe aperte dall'alto verso la sabbia
  if(kind==='tripod'){for(let k=0;k<3;k++){const a=k*2.09+.5,A=new T.Vector3(0,1.15,0),B=new T.Vector3(Math.cos(a)*.55,-.05,Math.sin(a)*.55),v=new T.Vector3().subVectors(B,A),l=new T.Mesh(new T.CylinderGeometry(.012,.012,v.length(),6),MAT.alu);l.position.copy(A).addScaledVector(v,.5);l.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());g.add(l);}}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}

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
  ch.position.set(CHAIR.x,CHAIR.z*.035,CHAIR.z);ch.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(ch);CHAIRG=ch;ch.userData.tela=tela;styleCamp();
  
  // cassettina da pesca con coperchio aperto, scomparti e minuteria colorata, e scatola delle esche
  const box=new T.Group(),bxm=new T.MeshStandardMaterial({color:'#2f6b57',roughness:.55}),bl=new T.MeshStandardMaterial({color:'#3e8a70',roughness:.5});
  const body=new T.Mesh(new T.BoxGeometry(.46,.2,.26),bxm);body.position.y=.1;box.add(body);
  const tray=new T.Mesh(new T.BoxGeometry(.44,.02,.24),new T.MeshStandardMaterial({color:'#d8dcd6',roughness:.6}));tray.position.y=.2;box.add(tray);
  for(let i=0;i<6;i++)for(let j=0;j<2;j++){const sep=new T.Mesh(new T.BoxGeometry(.004,.03,.22),bl);sep.position.set(-.22+i*.088,.215,0);box.add(sep);
    const it=new T.Mesh(i%3?new T.SphereGeometry(.012,6,6):new T.ConeGeometry(.01,.03,6),new T.MeshStandardMaterial({color:['#d9b24a','#c0392b','#9aa3ad','#2f6fb5','#e07a2f','#5ee08a'][(i+j)%6],metalness:.5,roughness:.4}));
    it.position.set(-.18+i*.088,.218,j?.05:-.05);box.add(it);}
  const lid=new T.Group();lid.position.set(0,.2,.13);box.add(lid);const lm=new T.Mesh(new T.BoxGeometry(.46,.04,.26),bl);lm.position.set(0,.02,-.13);lid.add(lm);lid.rotation.x=1.9;
  const hdl=new T.Mesh(new T.TorusGeometry(.06,.01,6,12,Math.PI),new T.MeshStandardMaterial({color:'#222'}));hdl.position.set(0,.04,-.13);lid.add(hdl);
  if(!st.gear.bought?.box){box.clear();const bm=new T.MeshStandardMaterial({color:'#eef2f4',roughness:.35,transparent:true,opacity:.78,side:T.DoubleSide}),bg=new T.SphereGeometry(.13,14,10);const P=bg.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i);P.setY(i,Math.max(-.02,y)*.9+Math.sin(P.getX(i)*40)*.008);P.setX(i,P.getX(i)*(1.2+Math.sin(P.getZ(i)*30)*.05));}bg.computeVertexNormals();
    const bag=new T.Mesh(bg,bm);bag.position.y=.02;box.add(bag);for(const [x,c] of [[-.05,'#c0392b'],[.03,'#d9b24a'],[.07,'#2f6fb5']]){const it=new T.Mesh(new T.BoxGeometry(.04,.02,.03),new T.MeshStandardMaterial({color:c}));it.position.set(x,.03,0);box.add(it);}
    for(const sx of[-1,1]){const h=new T.Mesh(new T.TorusGeometry(.035,.006,6,12,Math.PI),bm);h.position.set(sx*.06,.12,0);box.add(h);}}
  box.position.set(CHAIR.x+.62,CHAIR.z*.035,CHAIR.z-.25);box.rotation.y=-.4;box.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(box);
  const eb=new T.Group(),ebm=new T.Mesh(new T.BoxGeometry(.16,.06,.11),new T.MeshStandardMaterial({color:'#e8e2d0',roughness:.7}));ebm.position.y=.03;eb.add(ebm);
  for(let i=0;i<7;i++){const w=new T.Mesh(new T.TorusGeometry(.018,.005,5,10,rnd(2,4)),new T.MeshStandardMaterial({color:i%2?'#b8434e':'#d9705a',roughness:.6}));w.position.set(rnd(-.05,.05),.065,rnd(-.03,.03));w.rotation.set(Math.PI/2,0,rnd(0,6));eb.add(w);}
  eb.position.set(CHAIR.x+.62,CHAIR.z*.035,CHAIR.z+.12);scene.add(eb);MYG.push(box,eb);
  const buck=new T.Mesh(new T.CylinderGeometry(.16,.13,.3,16),MAT.bucket);buck.position.set(CHAIR.x-.75,CHAIR.z*.035+.15,CHAIR.z-.2);buck.castShadow=true;buck.visible=false;scene.add(buck);
  const fodero=new T.Group();MYG.push(fodero);
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
    for(let k=0;k<2;k++){const x=d.x+(k?2.5:-2.5),sp=makeSpike('alu');sp.position.set(x,ROD_Z*.035,ROD_Z);scene.add(sp);const rod=makeRod();scene.add(rod);
      const r={x,spike:sp,obj:rod,dist:rnd(70,115),bend:0,held:false,line:null,sx:x+rnd(-4,4)};const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(20*3),3));r.line=new T.Line(lg,MAT.line);r.line.frustumCulled=false;scene.add(r.line);placeRodOnSpike(r);a.rods.push(r);}
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
// sedia scelta, riparo, borsoni e frangivento sulla postazione
const Y0=()=>CHAIR.z*.035;let CAMPX=[];function styleCamp(){const g=st.gear,ch=CHAIRG;if(!ch)return;CAMPX.forEach(o=>scene.remove(o));CAMPX=[];const add=o=>{o.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(o);CAMPX.push(o);MYG.push(o);return o;};
  const c=g.chair||'';ch.visible=!!c;{const bk=new T.Mesh(new T.CylinderGeometry(.15,.18,c?.32:.5,16),MAT.bucket);bk.position.set(c?CHAIR.x-.75:CHAIR.x,Y0()+(c?.16:.25),c?CHAIR.z-.2:CHAIR.z+.02);add(bk);}
  if(c)ch.userData.tela.color.set({chairStd:'#4b5a36',chairHigh:'#1d3557',chairLevel:'#2f6fb5',chairArm:'#7a2018'}[c]);if(c)ch.scale.set(1,c==='chairHigh'?1.12:1,1);
  const Y=CHAIR.z*.035,M=(cl,o={})=>new T.MeshStandardMaterial({color:cl,roughness:.8,...o});
  if(c==='chairArm'){for(const sx of[-1,1]){const a=new T.Mesh(new T.BoxGeometry(.09,.1,.36),M('#5a1810'));a.position.set(CHAIR.x+sx*.24,Y+.78,CHAIR.z+.02);add(a);}const cup=new T.Mesh(new T.CylinderGeometry(.04,.035,.09,10,1,true),M('#2b2f36'));cup.position.set(CHAIR.x-.32,Y+.8,CHAIR.z-.1);add(cup);}
  if(g.shelter==='umbrella'){const u=new T.Group(),pole=new T.Mesh(new T.CylinderGeometry(.02,.02,2.3,8),M('#c0c4c8',{metalness:.7}));pole.position.y=1.15;u.add(pole);const can=new T.Mesh(new T.ConeGeometry(1.25,.5,14,1,true),new T.MeshStandardMaterial({color:'#2f6fb5',side:T.DoubleSide,roughness:.7}));can.position.y=2.2;u.add(can);
    const sk=new T.Mesh(new T.CylinderGeometry(1.25,1.25,.9,14,1,true,Math.PI*.2,Math.PI*.9),new T.MeshStandardMaterial({color:'#24548a',side:T.DoubleSide,roughness:.8}));sk.position.y=1.5;sk.rotation.y=Math.PI*.5;u.add(sk);u.position.set(CHAIR.x+.2,Y,CHAIR.z+.4);u.rotation.z=-.08;add(u);}
  if(g.shelter==='bivvy'){const b=new T.Mesh(new T.SphereGeometry(1.2,20,10,Math.PI*.05,Math.PI*.9,0,Math.PI/2),new T.MeshStandardMaterial({color:'#3a4a2a',side:T.DoubleSide,roughness:.9}));b.scale.set(1,.85,.9);b.position.set(CHAIR.x,Y,CHAIR.z+.3);b.rotation.y=Math.PI;add(b);}
  if(g.bought?.windbreak){for(let k=0;k<4;k++){const pnl=new T.Mesh(new T.PlaneGeometry(.9,1),new T.MeshStandardMaterial({color:['#c0392b','#e8e2d0'][k%2],side:T.DoubleSide,roughness:.9}));pnl.position.set(CHAIR.x-1.6+k*.85,Y+.5,CHAIR.z+1.4+Math.sin(k)*.1);add(pnl);}}
  if(g.bought?.bagRod){const t=new T.Mesh(new T.CylinderGeometry(.07,.07,1.6,10),M('#2b2f36'));t.rotation.z=Math.PI/2;t.position.set(CHAIR.x+1.1,Y+.07,CHAIR.z+.9);add(t);}
  if(g.bought?.bagBack){const z=new T.Mesh(new T.BoxGeometry(.32,.48,.2),M('#3a5a2a'));z.position.set(CHAIR.x-.75,Y+.24,CHAIR.z+.75);z.rotation.y=.4;add(z);}
  if(g.bought?.bagTackle){const z=new T.Mesh(new T.BoxGeometry(.38,.22,.26),M('#2f6fb5'));z.position.set(CHAIR.x+.55,Y+.11,CHAIR.z+.95);add(z);}
  if(g.bought?.cart){const cg=new T.Group(),bd=new T.Mesh(new T.BoxGeometry(.9,.3,.55),M('#5a6470',{metalness:.5}));bd.position.y=.35;cg.add(bd);for(const sx of[-1,1]){const w=new T.Mesh(new T.CylinderGeometry(.16,.16,.14,16),M('#1b1b1b'));w.rotation.x=Math.PI/2;w.position.set(sx*.3,.16,.32);cg.add(w);}cg.position.set(CHAIR.x-1.5,Y,CHAIR.z+.4);add(cg);}
  // tutto quello che hai nello zaino, in bella vista sul telo
  const T0=[CHAIR.x+.4,CHAIR.z+.2],put=(o,x,z,ry=0)=>{o.position.set(T0[0]+x,Y+.012,T0[1]+z);o.rotation.y=ry;return add(o);},box3=(w,h,d,cl,o={})=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(cl,o));m.position.y=h/2;const gg=new T.Group();gg.add(m);return gg;};
  const BC={koreano:'#c0392b',bibi:'#8e44ad',arenicola:'#6b3e26',americano:'#d35400',cannolicchio:'#d9cfb0',cozza:'#2c3e50',sarda:'#7f8c8d',seppia:'#ecf0f1',gambero:'#e67e22',cefalotto:'#3498db'};
  // scatole delle esche
  Object.entries(g.baits||{}).filter(([,n])=>n>0).forEach(([k,n],i)=>{const bx=box3(.11,.05,.08,BC[k]||'#888');const lid=new T.Mesh(new T.BoxGeometry(.112,.008,.082),M('#f4f4f0'));lid.position.y=.054;bx.add(lid);put(bx,-.65+(i%5)*.13,.42-Math.floor(i/5)*.11,rnd(-.3,.3));});
  // piombi (fino a 8)
  {let i=0;for(const [w,n] of Object.entries(g.leads||{}))for(let k=0;k<n&&i<8;k++,i++){const sz=.018+(+w-80)/120*.012,pb=new T.Mesh(new T.ConeGeometry(sz,sz*1.6,4),M('#6b7480',{metalness:.6,roughness:.4}));pb.position.y=sz*.8;const gg=new T.Group();gg.add(pb);put(gg,-.1+(i%4)*.06,.45-Math.floor(i/4)*.06,i);}}
  // bustine di ami, girelle, moschettoni, starlight
  const card=(cl,lab,x,z)=>{const c=new T.Mesh(new T.BoxGeometry(.07,.004,.1),M(cl));c.position.y=.003;const gg=new T.Group();gg.add(c);const w=new T.Mesh(new T.BoxGeometry(.055,.002,.04),M('#ffffff'));w.position.set(0,.006,.02);gg.add(w);put(gg,x,z,rnd(-.4,.4));};
  Object.entries(g.hooks||{}).filter(([,n])=>n>0).forEach(([m],i)=>card('#c9a24a','',.18+i*.075,.42));
  if(g.swivels>0)card('#2f6fb5','',.18,.3);if(g.snaps>0)card('#3a8a5a','',.26,.3);if(g.starlight>0)card('#7dff5a','',.34,.3);
  // bobine: filo o trecciato, terminali, shock leader
  const spool=(cl,r,x,z)=>{const sp=new T.Group(),c=new T.Mesh(new T.CylinderGeometry(r,r,.03,16),M(cl,{roughness:.4}));c.position.y=.015;sp.add(c);const rim=new T.Mesh(new T.CylinderGeometry(r*1.15,r*1.15,.006,16),M('#222'));rim.position.y=.031;sp.add(rim);put(sp,x,z);};
  spool(g.braid?'#2ecc71':'#e8e8e8',.035,.48,.42);if(g.term>0)spool('#9fd3f0',.025,.57,.42);if(g.leader>0)spool('#e74c3c',.022,.64,.42);
  // ago, elastico, perline, forbici
  if(g.needle){const nd=new T.Mesh(new T.CylinderGeometry(.002,.002,.14,6),M('#d0d4d8',{metalness:.8,roughness:.2}));nd.rotation.z=Math.PI/2;nd.position.y=.004;const gg=new T.Group();gg.add(nd);put(gg,.5,.3,.3);}
  if(g.elastic)spool('#f39c12',.016,.62,.3);
  if(g.bought?.beads){for(let k=0;k<6;k++){const bd=new T.Mesh(new T.SphereGeometry(.006,8,6),new T.MeshStandardMaterial({color:'#9dff7a',emissive:'#5aff3a',emissiveIntensity:.4}));bd.position.y=.006;const gg=new T.Group();gg.add(bd);put(gg,.7+k*.015,.32);}}
  // mulinelli e canne di scorta (quelli che non sono montati), picchetti in più piantati nella sabbia
  const used=st.rods?.length||st.nRods||1,spareR=Math.max(0,Object.values(g.reelCnt||{}).reduce((a,b)=>a+b,0)-used),spareC=Math.max(0,Object.values(g.rodCnt||{}).reduce((a,b)=>a+b,0)-used),spareS=Math.max(0,(g.spikes||0)-used-(g.spikeT==='tripod'?2:0));
  for(let k=0;k<Math.min(3,spareR);k++){const rl=new T.Group(),b=new T.Mesh(new T.CylinderGeometry(.045,.05,.07,14),M('#3d4550',{metalness:.6}));b.rotation.z=Math.PI/2;b.position.y=.05;rl.add(b);const sp=new T.Mesh(new T.CylinderGeometry(.04,.04,.05,14),M('#c9a24a',{metalness:.7}));sp.rotation.z=Math.PI/2;sp.position.set(-.06,.05,0);rl.add(sp);put(rl,.85,.2+k*.13,.5);}
  for(let k=0;k<Math.min(3,spareC);k++){const rd=new T.Mesh(new T.CylinderGeometry(.006,.014,3.6,8),M('#2b2f36',{roughness:.3}));rd.rotation.z=Math.PI/2;rd.position.y=.015;const gg=new T.Group();gg.add(rd);put(gg,.2,.75+k*.06,.05);}
  for(let k=0;k<Math.min(3,spareS);k++){const pk=new T.Mesh(new T.CylinderGeometry(.012,.006,1.2,8),MAT.alu);pk.position.y=.45;const gg=new T.Group();gg.add(pk);put(gg,-1.1-k*.25,.6);}
}
function cooler(x,z,ry,c1='#2f6fb5'){const g=new T.Group(),b=new T.Mesh(new T.BoxGeometry(.5,.32,.32),new T.MeshStandardMaterial({color:c1,roughness:.5}));b.position.y=.16;g.add(b);
  const lid=new T.Mesh(new T.BoxGeometry(.52,.06,.34),new T.MeshStandardMaterial({color:'#f2f2f2',roughness:.5}));lid.position.y=.34;g.add(lid);const h=new T.Mesh(new T.TorusGeometry(.12,.012,6,12,Math.PI),MAT.chairF);h.position.y=.37;g.add(h);
  g.position.set(x,Math.max(0,z*.035),z);g.rotation.y=ry;g.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(g);return g;}
function lantern(x,z,light){const g=new T.Group(),base=new T.Mesh(new T.CylinderGeometry(.06,.07,.04,12),MAT.reel);base.position.y=.02;g.add(base);
  const glass=new T.Mesh(new T.CylinderGeometry(.05,.05,.14,12),new T.MeshStandardMaterial({color:'#fff7d6',emissive:'#ffd27a',emissiveIntensity:0,transparent:true,opacity:.85}));glass.position.y=.11;g.add(glass);
  const top=new T.Mesh(new T.ConeGeometry(.07,.05,12),MAT.reel);top.position.y=.205;g.add(top);g.position.set(x,Math.max(0,z*.035),z);scene.add(g);g.userData.glass=glass;
  if(light){const pl=new T.PointLight(0xffc870,0,9,2);pl.position.y=.25;g.add(pl);g.userData.pl=pl;}LANTERNS.push(g);return g;}
let LANTERNS=[];
function buildGear(){LANTERNS=[];const y=CHAIR.z,gb=st.gear.bought||{};if(gb.cooler)MYG.push(cooler(CHAIR.x-1.3,y+.4,.3));if(st.gear.lanternLED){const myL=lantern(CHAIR.x+.95,y-.6,true);MYG.push(myL);}
  const th=new T.Mesh(new T.CylinderGeometry(.04,.04,.3,12),new T.MeshStandardMaterial({color:'#9aa3ad',metalness:.7,roughness:.3}));th.position.set(CHAIR.x-.55,y*.035+.15,y+.35);th.castShadow=true;if(gb.cooler){scene.add(th);MYG.push(th);}
  // porta-esche e telo per l'attrezzatura
  const telo=new T.Mesh(new T.PlaneGeometry(1.6,1.1),new T.MeshStandardMaterial({color:'#6b5a3a',roughness:1}));telo.rotation.x=-Math.PI/2;telo.position.set(CHAIR.x+.4,y*.035+.01,y+.2);telo.receiveShadow=true;scene.add(telo);MYG.push(telo);
  {const o=st.gear.own||{},b=st.gear.bought||{},Y=y*.035;
    if(false&&b.box){const bx=new T.Mesh(new T.BoxGeometry(.42,.14,.26),new T.MeshStandardMaterial({color:'#2f6fb5',roughness:.5}));bx.position.set(CHAIR.x+.2,Y+.08,y+.05);bx.castShadow=true;scene.add(bx);MYG.push(bx);const lid=new T.Mesh(new T.BoxGeometry(.43,.02,.27),new T.MeshStandardMaterial({color:'#e9eef2',transparent:true,opacity:.6}));lid.position.set(CHAIR.x+.2,Y+.16,y+.05);scene.add(lid);MYG.push(lid);}
    if(b.bucket){const bu=new T.Mesh(new T.CylinderGeometry(.16,.13,.3,16),new T.MeshStandardMaterial({color:'#e8e2d0',roughness:.6}));bu.position.set(CHAIR.x+.85,Y+.15,y+.45);bu.castShadow=true;scene.add(bu);MYG.push(bu);const lc=new T.Mesh(new T.CylinderGeometry(.165,.165,.03,16),new T.MeshStandardMaterial({color:'#2f8a5a'}));lc.position.set(CHAIR.x+.85,Y+.31,y+.45);scene.add(lc);MYG.push(lc);}
    if(b.scis){const sc=new T.Mesh(new T.BoxGeometry(.14,.01,.04),new T.MeshStandardMaterial({color:'#c0392b'}));sc.position.set(CHAIR.x+.6,Y+.02,y-.05);sc.rotation.y=.6;scene.add(sc);MYG.push(sc);}
    if(b.star){for(let k=0;k<3;k++){const s2=new T.Mesh(new T.CylinderGeometry(.006,.006,.05,6),new T.MeshStandardMaterial({color:'#9dff7a',emissive:'#5aff3a',emissiveIntensity:.6}));s2.rotation.z=Math.PI/2;s2.position.set(CHAIR.x-.05+k*.03,Y+.02,y+.3);scene.add(s2);MYG.push(s2);}}}
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
  st.rods=Array.from({length:st.nRods},(_,i)=>{const x=rodX(i,st.nRods),spike=makeSpike(st.gear.spikeT||(st.gear.bought?.spike?'alu':''));spike.position.set(x,ROD_Z*.035,ROD_Z);scene.add(spike);
    planFix();const g0=st.gear,PQ=st.plan[i]||{},rid=PQ.rodId||g0.rod,lid=PQ.reelId||g0.reel,obj=makeRod();skinRod(obj,rid,lid);scene.add(obj);const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(40*3),3));const line=new T.Line(lg,MAT.line);line.frustumCulled=false;scene.add(line);
    const sinker=new T.Mesh(new T.SphereGeometry(.05,8,6),MAT.lead);sinker.visible=false;scene.add(sinker);
    const hit=new T.Mesh(new T.CylinderGeometry(.6,.6,4.6,8),new T.MeshBasicMaterial({visible:false}));hit.position.set(x,2.2,ROD_Z-.3);hit.rotation.x=-8*R;scene.add(hit);
    return {rodId:rid,reelId:lid,lineT:PQ.lineT||'nylon',leadT:PQ.leadT||'piramidale',hookT:PQ.hookT||'aberdeen',grip:PQ.leadT==='ragno',lead:PQ.lead??st.lead,hook:PQ.hook??st.hook,rig:PQ.rig||'lungo',broken:false,dismantled:false,i,x,spike,obj,line,sinker,hit,bait:null,dist:0,state:'idle',baitLeft:0,bend:0,bitePlan:null,held:false,sx:x,sz:-1};});}
function placeRodOnSpike(r){const by=ROD_Z*.035,cy=r.spike?.userData.cupY??.62,t=SPIKE_TILT*R;// calcio nella tazza, fusto parallelo al picchetto
  r.obj.position.set(r.x,by+cy*Math.cos(t)+.035*Math.sin(t),ROD_Z+cy*Math.sin(t)-.035*Math.cos(t));r.obj.rotation.set(t,0,0,'YXZ');}
function rodInHand(r,a=AN){const J=a.obj.userData.J,hp=new T.Vector3();J.rHand.getWorldPosition(hp);const p=a.pose.rod||{p:45,f:0,y:0};
  r.obj.rotation.set((p.p-90)*R,a.rotY+(p.y||0),0,'YXZ');const dir=new T.Vector3(0,1,0).applyEuler(r.obj.rotation);r.obj.position.copy(hp).addScaledVector(dir,-.5);}

/* ---------- viaggio in auto lungo la costa del Lazio (vista dall'alto) ---------- */
const MP={zoom:42};
const LAT0=41.75,LON0=12.4,KX=111.32*Math.cos(41.75*R),KY=110.57;
const PJ=(lat,lon)=>[(lon-LON0)*KX,(lat-LAT0)*KY];
async function startMap(){st.phase='map';
  if(!MP.skipAsk&&!MP.from){const ch=await new Promise(res=>{G.startChoice=v=>{root.querySelector('#gstart')?.remove();res(v);};ui.innerHTML='';const d=document.createElement('div');d.id='gstart';
      d.innerHTML=`<div class="gst-h"><b>Dove andiamo?</b><span>💶 Portafoglio del gioco <b>${eur(st.money)}</b></span><span style="font-size:12.5px;opacity:.8">Sono soldi virtuali: si spendono solo nel negozio di pesca del gioco.</span></div><div class="gst-row"><div class="gst-c"><canvas id="gsc1" width="300" height="620"></canvas><button class="gb big gst-b" onclick="GAME.startChoice('pesca')">🎣 A Pesca</button></div><div class="gst-c"><canvas id="gsc2" width="300" height="620"></canvas><button class="gb big gst-b gst-shop" onclick="GAME.startChoice('negozio')">🛒 Al Negozio</button></div></div>
        <div class="gst-f">Euro virtuali: li guadagni pescando (0,50 € al minuto, fino a 15 € al giorno), con ogni cattura, usando l'app e con il bonus giornaliero del negozio.</div>`;root.appendChild(d);for(const [id,fn] of [['#gsc1',paintBeach],['#gsc2',paintShop]]){const c=d.querySelector(id);if(c.clientWidth&&c.clientHeight)c.width=Math.round(c.height*c.clientWidth/c.clientHeight);fn(c);}});
    if(ch==='negozio'){openShop();return;}}
  MP.skipAsk=false;
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
// immagini della schermata iniziale: spiaggia al tramonto e vetrina del negozio
function paintBeach(c){const g=c.getContext('2d'),W=c.width,H=c.height;let gr=g.createLinearGradient(0,0,0,H*.55);gr.addColorStop(0,'#1d3f6e');gr.addColorStop(.55,'#e88a5a');gr.addColorStop(1,'#ffd08a');g.fillStyle=gr;g.fillRect(0,0,W,H*.55);
  g.fillStyle='rgba(255,236,180,.95)';g.beginPath();g.arc(W*.62,H*.5,40,0,7);g.fill();g.fillStyle='rgba(255,220,150,.25)';g.beginPath();g.arc(W*.62,H*.5,80,0,7);g.fill();
  for(let k=0;k<5;k++){g.fillStyle=`rgba(255,${200+k*8},${190+k*8},.35)`;g.beginPath();g.ellipse(rnd(0,W),rnd(H*.08,H*.3),rnd(50,110),rnd(8,16),0,0,7);g.fill();}
  gr=g.createLinearGradient(0,H*.5,0,H*.72);gr.addColorStop(0,'#2a5f87');gr.addColorStop(1,'#1b4566');g.fillStyle=gr;g.fillRect(0,H*.5,W,H*.24);
  for(let y=H*.51;y<H*.73;y+=6){g.strokeStyle=`rgba(255,${190+Math.random()*50},140,${.12+Math.random()*.2})`;g.lineWidth=1.5;g.beginPath();g.moveTo(W*.62-60-(y-H*.5)*.8+rnd(-10,10),y);g.lineTo(W*.62+60+(y-H*.5)*.8+rnd(-10,10),y);g.stroke();}
  for(let k=0;k<4;k++){const y=H*(.66+k*.022);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;g.beginPath();for(let x=0;x<=W;x+=12)g.lineTo(x,y+Math.sin(x/30+k)*3);g.stroke();}
  gr=g.createLinearGradient(0,H*.72,0,H);gr.addColorStop(0,'#c9a876');gr.addColorStop(1,'#a8865a');g.fillStyle=gr;g.beginPath();g.moveTo(0,H*.74);for(let x=0;x<=W;x+=20)g.lineTo(x,H*.73+Math.sin(x/60)*6);g.lineTo(W,H);g.lineTo(0,H);g.fill();
  for(let i=0;i<900;i++){g.fillStyle=`rgba(${Math.random()<.5?'90,70,40':'240,220,180'},.25)`;g.fillRect(rnd(0,W),rnd(H*.74,H),2,2);}
  // pescatore in controluce che piega la canna e tira un pesce che salta fuori dall'acqua
  const k=Math.min(W/200,H/620*1.6),X=v=>W*v,Y=v=>H*v,S='#121619';g.lineCap='round';g.lineJoin='round';g.strokeStyle=S;g.fillStyle=S;
  const fx=X(.26),fy=Y(.885),hip=[fx+4*k,fy-62*k],sho=[fx-6*k,fy-112*k],hd=[fx-8*k,fy-128*k];
  g.lineWidth=13*k;g.beginPath();g.moveTo(hip[0],hip[1]);g.lineTo(fx+22*k,fy-30*k);g.lineTo(fx+30*k,fy);g.stroke();// gamba avanti
  g.beginPath();g.moveTo(hip[0],hip[1]);g.lineTo(fx-10*k,fy-30*k);g.lineTo(fx-16*k,fy);g.stroke();// gamba dietro, piegata all'indietro
  g.lineWidth=7*k;g.beginPath();g.moveTo(fx+26*k,fy);g.lineTo(fx+40*k,fy);g.moveTo(fx-20*k,fy);g.lineTo(fx-6*k,fy);g.stroke();
  g.lineWidth=24*k;g.beginPath();g.moveTo(hip[0],hip[1]);g.lineTo(sho[0],sho[1]);g.stroke();// busto inclinato all'indietro
  g.beginPath();g.arc(hd[0],hd[1],10*k,0,7);g.fill();g.lineWidth=4*k;g.beginPath();g.moveTo(hd[0]-4*k,hd[1]-8*k);g.lineTo(hd[0]+14*k,hd[1]-7*k);g.stroke();// testa e visiera
  const hand1=[fx+30*k,fy-96*k],hand2=[fx+12*k,fy-74*k];g.lineWidth=8*k;g.beginPath();g.moveTo(sho[0],sho[1]);g.lineTo(fx+18*k,fy-104*k);g.lineTo(hand1[0],hand1[1]);g.stroke();
  g.beginPath();g.moveTo(sho[0]+2*k,sho[1]+6*k);g.lineTo(fx+2*k,fy-84*k);g.lineTo(hand2[0],hand2[1]);g.stroke();
  // canna piegata ad arco e mulinello
  const tip=[X(.86),Y(.43)],cp=[X(.66),Y(.37)];g.lineWidth=4.5*k;g.beginPath();g.moveTo(hand2[0]-10*k,hand2[1]+14*k);g.lineTo(hand1[0],hand1[1]);g.quadraticCurveTo(cp[0],cp[1],tip[0],tip[1]);g.stroke();
  g.lineWidth=2.5*k;g.beginPath();g.moveTo(hand1[0],hand1[1]);g.quadraticCurveTo(cp[0],cp[1],tip[0],tip[1]);g.stroke();g.beginPath();g.arc(hand2[0]+4*k,hand2[1]+2*k,6*k,0,7);g.fill();
  // lenza tesa fino al pesce
  const fish=[X(.74),Y(.61)];g.strokeStyle='rgba(255,240,220,.85)';g.lineWidth=1.2;g.beginPath();g.moveTo(tip[0],tip[1]);g.lineTo(fish[0]+12*k,fish[1]-6*k);g.stroke();
  // spruzzi e cerchi d'acqua
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=2;for(const r of[14,24,34]){g.beginPath();g.ellipse(fish[0],Y(.66),r*k,r*k*.25,0,0,7);g.stroke();}
  g.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<22;i++){const a=rnd(-2.8,-.3),d=rnd(8,32)*k;g.beginPath();g.arc(fish[0]+Math.cos(a)*d,Y(.655)+Math.sin(a)*d*1.2,rnd(1,2.6)*k,0,7);g.fill();}
  // il pesce che salta, argentato e inarcato
  g.save();g.translate(fish[0],fish[1]);g.rotate(-.6);const L=34*k;let fg=g.createLinearGradient(0,-L*.3,0,L*.3);fg.addColorStop(0,'#3a4a58');fg.addColorStop(.5,'#c9d2d8');fg.addColorStop(1,'#f4f6f7');g.fillStyle=fg;
  g.beginPath();g.moveTo(L*.55,0);g.quadraticCurveTo(L*.2,-L*.32,-L*.35,-L*.08);g.lineTo(-L*.55,-L*.26);g.lineTo(-L*.5,0);g.lineTo(-L*.55,L*.26);g.lineTo(-L*.35,L*.08);g.quadraticCurveTo(L*.2,L*.32,L*.55,0);g.fill();
  g.fillStyle='#0b0d10';g.beginPath();g.arc(L*.38,-L*.05,L*.05,0,7);g.fill();g.restore();}
function paintShop(c){const g=c.getContext('2d'),W=c.width,H=c.height;g.fillStyle='#e9e1d2';g.fillRect(0,0,W,H);
  for(let i=0;i<14;i++)for(let j=0;j<24;j++){g.fillStyle=`rgba(150,120,90,${.08+Math.random()*.08})`;g.fillRect(i*32+(j%2)*16,j*28,30,26);}
  // insegna e tenda a strisce
  g.fillStyle='#0f3b57';g.fillRect(16,30,W-32,74);g.strokeStyle='#ffd76a';g.lineWidth=4;g.strokeRect(22,36,W-44,62);g.fillStyle='#ffd76a';g.font=`800 ${Math.round(W*.105)}px Outfit,sans-serif`;g.textAlign="center";g.textBaseline="middle";g.fillText("PESCA SPORT",W/2,68);
  {const sw=(W-20)/6;for(let i=0;i<6;i++){g.fillStyle=i%2?'#f4f1ea':'#1d5f8a';g.beginPath();g.moveTo(10+i*sw,112);g.lineTo(10+(i+1)*sw,112);g.lineTo(10+(i+1)*sw,150);g.quadraticCurveTo(10+(i+.5)*sw,166,10+i*sw,150);g.fill();}}
  // vetrina illuminata con canne, mulinelli, esche e la giacca
  const x0=22,y0=170,w=W-68,h=H*.62;let gr=g.createLinearGradient(0,y0,0,y0+h);gr.addColorStop(0,'#fff6dc');gr.addColorStop(1,'#d9c9a0');g.fillStyle=gr;g.fillRect(x0,y0,w,h);
  for(let k=0;k<6;k++){g.strokeStyle=['#1b1b1b','#0f2f5a','#5a0f12','#1b3d22','#d9b24a','#3a1f5c'][k];g.lineWidth=5;g.beginPath();g.moveTo(x0+18+k*14,y0+h-20);g.lineTo(x0+24+k*15,y0+20);g.stroke();g.fillStyle='#b98d58';g.fillRect(x0+14+k*14,y0+h-90,9,60);}
  for(let k=0;k<3;k++){const cx=x0+w*.5+k*w*.2,cy=y0+h*.52;g.fillStyle=['#2b2f36','#c9a24a','#b8352a'][k];g.beginPath();g.arc(cx,cy,w*.08,0,7);g.fill();g.fillStyle='#d0d4d8';g.fillRect(cx-w*.11,cy-6,w*.05,12);}
  g.fillStyle='#7a5a3a';g.fillRect(x0+w*.5,y0+h*.62,w*.48,8);for(let k=0;k<4;k++){g.fillStyle=['#e67e22','#2f6fb5','#c0392b','#3a8a5a'][k];g.fillRect(x0+w*.52+k*w*.11,y0+h*.62-34,w*.09,34);}
  g.fillStyle='#c0392b';g.beginPath();g.moveTo(x0+w*.62,y0+30);g.lineTo(x0+w*.88,y0+30);g.lineTo(x0+w*.92,y0+h*.4);g.lineTo(x0+w*.58,y0+h*.4);g.fill();
  g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+w*.3,y0);g.lineTo(x0,y0+h*.5);g.fill();g.strokeStyle='#4a3a28';g.lineWidth=10;g.strokeRect(x0,y0,w,h);
  g.fillStyle='#c0392b';g.save();g.translate(x0+w*.5,y0+h*.86);g.rotate(-.1);g.fillRect(-w*.38,-20,w*.76,40);g.fillStyle='#fff';g.font=`800 ${Math.round(w*.13)}px Outfit,sans-serif`;g.fillText('OFFERTE',0,2);g.restore();
  g.fillStyle='#a8865a';g.fillRect(0,y0+h+5,W,H);}
// cosa manca per pescare: esche, ami, piombi, terminali, girelle, moschettoni, canne
let SUPPLAST='';setInterval(()=>{if(!st.gear||!['wait','atrod','bait','rig'].includes(st.phase))return;const m=supplyMissing().join(',');if(m&&m!==SUPPLAST){vib([80,60,80]);baitGone();setUI();}SUPPLAST=m;},1500);
function supplyMissing(){const g=st.gear,sum=o=>Object.values(o||{}).reduce((a,b)=>a+b,0),m=[];
  if(sum(g.baits)<=0&&!(st.inv?.granchio>0))m.push('le esche');if(sum(g.hooks)<=0)m.push('gli ami');if(sum(g.leads)<=0)m.push('i piombi');if(!(g.term>0))m.push('il filo per i terminali');if(!(g.swivels>0))m.push('le girelle');if(!(g.snaps>0))m.push('i moschettoni');if(maxRods()<1)m.push('una canna completa');return m;}
function shopBanner(m){return m.length?`<div class="gs warn" style="text-align:center">🧺 Hai finito ${m.join(', ')}: senza non puoi pescare.</div><button class="gb big gshop-b" onclick="GAME.goShop()">🛒 Vai al negozio di pesca</button>`:'';}
G.goShop=()=>{st.needShop=false;st.phase='busy';openShop();};
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
G._rp=RP;G._chair=()=>CHAIR;G._cast=(style,pw,ms=1600)=>{st.castStyle=style;st.cast={p:pw,dir:0,on:true};castAnimStart('load');setTimeout(()=>doCast(),ms);};G._bolt=()=>strikeBolt();G._land=n=>{const sp=SP.find(x=>x.n===n);const r=st.rods[0];st.sel=0;r.held=true;AN.holding=0;r.bait="bibi";const w=sp.w[1]*1.6;st.fight={r,sp,w,len:lenOf(sp,w),dist:0,ten:.3,reel:false,drag:5,run:0,slack:0,t:0,pow:1};endFight(true);};G._jump=n=>{const sp=SP.find(x=>x.n===n);const r=st.rods[1];r.dist=20;r.sz=-90;const w=sp.w[2];st.fight={r,sp,w,len:lenOf(sp,w),dist:20,ten:.3,run:0,slack:0,t:0,pow:1,jump:{t:0}};st.fight.obj=makeFish3D(sp,st.fight.len/100);scene.add(st.fight.obj);};

/* ============ negozio di pesca: portafoglio, zaino e catalogo da surfcasting ============ */
const today=()=>new Date().toISOString().slice(0,10);
// kit di partenza: il minimo indispensabile. Tutto il resto si compra al negozio
const GEAR0={v:2,rod:'beach390',rods:['beach390'],rodCnt:{beach390:1},reel:'r5000',reels:['r5000'],reelCnt:{r5000:1},drag:7,line:.25,leader:5,fluo:.30,term:10,
  baits:{koreano:15},hooks:{4:10},leads:{80:1,100:1,125:1},grip:{},ogiva:{},forged:{},starlight:0,swivels:15,snaps:15,needle:true,elastic:false,lamp:false,torch:0,spikes:1,spikeT:'pvc',
  chair:'',chairs:[],hat:'none',hats:['none'],outfits:[],shelters:[],shelter:'',boots:false,own:{},bought:{scis:true}};
function gearLoad(){let g=LSG('gear',null);const G0=JSON.parse(JSON.stringify(GEAR0));if(!g||g.v!==2){LSS('outfit','jeans');LSS('nrods',1);return G0;}if(!g.boxFix){g.boxFix=true;if(g.bought)delete g.bought.box;}for(const k in G0)if(g[k]===undefined)g[k]=G0[k];return g;}
st.gear=gearLoad();st.money=LSG('money',10000);if(!LSG('eco10k',0)){st.money=Math.max(st.money,10000);LSS('eco10k',1);LSS('eco3',1);LSS('money',st.money);}// per le prove si parte con 10.000 € virtuali
// guadagni: tempo di pesca nel gioco, catture e uso dell'app (con un tetto al giorno)
const EARN={fish:.5,fishMax:15};function earnDay(){const e=LSG('earn',{});if(e.d!==today())return {d:today(),fish:0,app:0};return e;}
function earn(kind,v,why){const e=earnDay(),max=kind==='fish'?EARN.fishMax:1e9,add=Math.max(0,Math.min(v,max-(e[kind]||0)));if(add<=0)return 0;e[kind]=(e[kind]||0)+add;LSS('earn',e);st.money+=add;gearSave();moneyPop(add,why);return add;}
function moneyPop(v,why){if(!root)return;const d=document.createElement('div');d.className='gmoney';d.textContent='💶 +'+eur(v)+(why?' · '+why:'');root.appendChild(d);setTimeout(()=>d.remove(),2600);}
function appCredit(){try{const v=+JSON.parse(localStorage.getItem('lenza.gioco.pend')||'0');if(v>0){localStorage.setItem('lenza.gioco.pend','0');st.money+=v;gearSave();setTimeout(()=>moneyPop(v,'uso dell\'app'),1500);}}catch(e){}}
function earnTick(dt){if(document.hidden||!['wait','atrod','fight','cast','bait','rig','busy','catch','snag','talk','rtalk','pilot','gear','bag'].includes(st.phase))return;st.fishSec=(st.fishSec||0)+dt;if(st.fishSec>=60){st.fishSec-=60;earn('fish',EARN.fish,'un minuto di pesca');}}
const gearSave=()=>{LSS('gear',st.gear);LSS('money',Math.round(st.money*100)/100);};
const eur=v=>'€ '+v.toFixed(2).replace('.',',');
const ROD={surf420:{n:'Surf 4,20 m 3 pz',mul:1},beach390:{n:'Beach 3,90 m 3 pz',mul:.9},tele420:{n:'Telescopica 4,20 m',mul:.92},surf420s:{n:'Spiaggia 4,20 m leggera 3 pz',mul:1.02},surf420c:{n:'Surf 4,20 m carbonio 3 pz',mul:1.04},surf420c2:{n:'Surf 4,20 m carbonio 2 pz',mul:1.06},surf450:{n:'Surf 4,50 m carbonio 3 pz',mul:1.06},surf450_2:{n:'Surf 4,50 m carbonio 2 pz',mul:1.08},surf450h:{n:'Surf 4,50 m ibrida 3 pz',mul:1.08},surf470:{n:'Surf 4,70 m parabolica 3 pz',mul:1.1},surf480:{n:'Tournament 4,80 m 3 pz',mul:1.12},surf480_2:{n:'Tournament 4,80 m 2 pz',mul:1.14},surf500:{n:'Long Cast 5,00 m 3 pz',mul:1.16},surf500_2:{n:'Long Cast 5,00 m 2 pz',mul:1.18}};
const REELS={r5000:{n:'5000 leggero',drag:7,cast:1},r6000:{n:'6000',drag:8,cast:1},r8000:{n:'8000',drag:12,cast:1},r10000:{n:'10000',drag:15,cast:1},r14000:{n:'14000',drag:20,cast:1.01},rRear:{n:'7000 frizione posteriore',drag:10,cast:1},rLC:{n:'Long Cast 12000',drag:18,cast:1.04},rMult:{n:'Mulinello rotante',drag:22,cast:1.06},rT:{n:'Tournament 14000',drag:25,cast:1.03}};
const reelN=id=>REELS[id]?.n||id,reelDrag=id=>REELS[id]?.drag||12;
// livello dell'attrezzatura montata su una canna: 0 = di base, 1 = il top (canna Long Cast + Tournament)
function gearTier(r){const g=st.gear,rt=clamp(((ROD[r?.rodId||g.rod]?.mul||1)-.9)/.28,0,1),RL=REELS[r?.reelId||g.reel]||REELS.r8000,lt=clamp((RL.drag-7)/18*.7+(RL.cast-1)/.06*.3,0,1);return {rod:rt,reel:lt,all:(rt+lt)/2};}
// prezzi e confezioni realistici; o = opzioni scelte
const CAT=[
  {k:'canne',n:'🎣 Canne',items:[
    {id:'beach390',rod:1,n:'Canna Beach 3,90 m · 3 pezzi',d:'Vetro pieno, 80-150 g: indistruttibile, perfetta per la pesca sotto riva (-10% distanza).',p:()=>39},
    {id:'tele420',rod:1,n:'Canna telescopica 4,20 m · da viaggio',d:'Si chiude in 1,2 m, sta nel bagagliaio. Lancia un po\' meno (-8%).',p:()=>45},
    {id:'surf420',rod:1,n:'Canna surfcasting 4,20 m · 3 pezzi',d:'Vetro-carbonio, lancio 100-200 g. Robusta, ideale per iniziare.',p:()=>69},
    {id:'surf420s',rod:1,n:'Canna Spiaggia 4,20 m leggera · 3 pezzi',d:'Carbonio, 50-150 g, vetta in fibra piena sensibile: mormore e orate con mare calmo.',p:()=>89},
    {id:'surf420c',rod:1,n:'Canna surfcasting 4,20 m carbonio · 3 pezzi',d:'Carbonio 30 t, 100-200 g, anelli SiC: leggera e reattiva (+4%).',p:()=>119},
    {id:'surf420c2',rod:1,n:'Canna surfcasting 4,20 m carbonio · 2 pezzi',d:'Un solo innesto: azione più continua e sensibile (+6%). Si trasporta lunga 2,15 m.',p:()=>149},
    {id:'surf450',rod:1,n:'Canna surfcasting 4,50 m carbonio · 3 pezzi',d:'Carbonio, 100-250 g, azione di punta: più distanza (+6%).',p:()=>139},
    {id:'surf450_2',rod:1,n:'Canna surfcasting 4,50 m carbonio · 2 pezzi',d:'Carbonio 36 t, 100-250 g, un solo innesto: più potenza nel lancio (+8%).',p:()=>189},
    {id:'surf450h',rod:1,n:'Canna surfcasting 4,50 m ibrida · 3 pezzi',d:'Fusto tubolare e vetta in carbonio pieno: lancia lontano (+8%) e segnala le tocche delicate.',p:()=>169},
    {id:'surf470',rod:1,n:'Canna surfcasting 4,70 m parabolica · 3 pezzi',d:'Azione progressiva, 120-250 g: perdona gli errori nel lancio pendolare (+10%).',p:()=>199},
    {id:'surf480',rod:1,n:'Canna Tournament 4,80 m · 3 pezzi',d:'Carbonio alto modulo, 150-250 g, per i lanci lunghi (+12%). Da veri agonisti.',p:()=>279},
    {id:'surf480_2',rod:1,n:'Canna Tournament 4,80 m · 2 pezzi',d:'Carbonio alto modulo, 150-250 g, un solo innesto: la scelta dei campioni (+14%).',p:()=>339},
    {id:'surf500',rod:1,n:'Canna Long Cast 5,00 m · 3 pezzi',d:'Carbonio 46 t, 175-275 g, anelli Low Rider: la regina della distanza (+16%).',p:()=>389},
    {id:'surf500_2',rod:1,n:'Canna Long Cast 5,00 m · 2 pezzi',d:'Carbonio 46 t, 175-275 g, un solo innesto da 2,55 m: il massimo della distanza (+18%).',p:()=>459}]},
  {k:'mulinelli',n:'⚙️ Mulinelli',items:[
    {id:'reel',n:'Mulinello surfcasting bobina lunga',d:'Bobina conica in alluminio, frizione anteriore. Più grande = frizione più potente.',opts:[{k:'t',n:'Taglia',v:['6000','8000','10000','14000']}],p:o=>[45,69,119,189][o.t]},
    {id:'reelBase',reel:'r6000',n:'Mulinello 6000 base',d:'Semplice e robusto, frizione 8 kg.',p:()=>29},
    {id:'rm_r5000',reel:'r5000',n:'Mulinello leggero 5000',d:'Per la canna leggera e i pesci di taglia piccola: frizione 7 kg.',p:()=>35},
    {id:'rm_rRear',reel:'rRear',n:'Mulinello 7000 a frizione posteriore',d:'La frizione si regola senza toccare la bobina: comoda in combattimento, 10 kg.',p:()=>59},
    {id:'rm_rLC',reel:'rLC',n:'Mulinello Long Cast 12000',d:'Bobina conica da 30 mm a passo corto: il filo esce senza attriti (+4% distanza), 18 kg.',p:()=>159},
    {id:'rm_rMult',reel:'rMult',n:'Mulinello rotante',d:'Il mulinello a bobina rotante dei campioni di distanza (+6%): frizione a stella 22 kg.',p:()=>229},
    {id:'reelT',n:'Mulinello Tournament 14000 SA',d:'Corpo in alluminio, 7+1 cuscinetti, frizione 25 kg in carbonio.',p:()=>299}]},
  {k:'esche',n:'🪱 Esche',items:BAITS.filter(b=>!b.lim).map(b=>({id:'b_'+b.k,n:b.n+' '+b.e,d:b.d,bait:b.k,pk:{koreano:15,bibi:6,arenicola:7,americano:3,cannolicchio:10,cozza:15,sarda:10,seppia:3,gambero:10,cefalotto:5}[b.k],p:()=>({koreano:5,bibi:7,arenicola:7.5,americano:7.5,cannolicchio:2,cozza:3,sarda:3,seppia:5,gambero:5,cefalotto:10})[b.k]}))},
  {k:'ami',n:'🪝 Ami',items:[{id:'hook',n:'Ami da surfcasting · busta da 10',d:'Aberdeen a filo sottile per vermi e bibi, oppure forgiati per esche dure e pesci grossi.',opts:[{k:'m',n:'Misura',v:['0','2','4','6','8']},{k:'t',n:'Tipo',v:['Aberdeen','Forgiato']}],p:()=>4.5}]},
  {k:'piombi',n:'⚓ Piombi',items:[{id:'lead',n:'Piombi da surfcasting · confezione da 2',d:'Piramidale tiene sulla sabbia, ogiva vola più lontano, a ragno (grip) resta fermo anche con la corrente.',opts:[{k:'g',n:'Peso',v:['80 g','100 g','125 g','150 g','175 g','200 g']},{k:'t',n:'Forma',v:['Piramidale','Ogiva','A ragno']}],p:o=>[3,4.5,5,6,6.5,7][o.g||0]}]},
  {k:'fili',n:'🧵 Fili',items:[
    {id:'line',n:'Filo madre nylon · bobina 300 m',d:'Più sottile = lanci più lunghi ma meno resistenza.',opts:[{k:'d',n:'Diametro',v:['0,20 mm','0,22 mm','0,25 mm','0,28 mm','0,30 mm']}],p:o=>[9.9,9.9,10.9,11.9,12.9][o.d]},
    {id:'braid',n:'Trecciato per bobina · 300 m',d:'Lenza madre in multifibra: non si allunga e regge molto di più. Con il trecciato sul mulinello la lenza si spezza la metà delle volte.',opts:[{k:'d',n:'Diametro',v:['0,10 mm','0,12 mm','0,14 mm','0,16 mm']}],p:()=>29},
    {id:'leader',n:'Shock leader conico 0,26→0,57 · 5 pezzi',d:'Il tratto che regge la forza del lancio: niente più crack-off.',p:()=>8.9},
    {id:'fluo',n:'Terminale fluorocarbon · 50 m',d:'Invisibile in acqua: più sottile, più abboccate.',opts:[{k:'d',n:'Diametro',v:['0,25 mm','0,30 mm','0,35 mm','0,40 mm']}],p:o=>[7.5,7.9,8.5,8.9][o.d]}]},
  {k:'accessori',n:'🧰 Minuterie',items:[
    {id:'star',n:'Starlight 4,5 mm · busta da 10',d:'Luce chimica sulla vetta: di notte vedi le tocche.',p:()=>3.9},
    {id:'swiv',n:'Girelle a barilotto n. 8 · busta da 15',d:'Tolgono le torsioni al filo; servono per rifare il terminale.',p:()=>2.9},
    {id:'snap',n:'Moschettoni rapidi · busta da 15',d:'Per agganciare il piombo al volo; servono per rifare il terminale.',p:()=>2.9},
    {id:'needle',n:'Aghi da innesco · set da 3',d:'Indispensabili per innescare bibi, coreani e arenicole.',p:()=>4.5},
    {id:'elastic',n:'Filo elastico per esche · bobina',d:'Avvolto sull\'esca morbida la fa durare il 30% in più.',p:()=>3.9},
    {id:'beads',n:'Perline fosforescenti e salvanodo',d:'Proteggono i nodi e attirano il pesce di notte.',p:()=>2},
    {id:'box',n:'Cassetta portaminuteria',d:'Tutto in ordine: ami, girelle, moschettoni, starlight.',p:()=>12.9},
    {id:'bucket',n:'Secchio portaesche con coperchio',d:'Tiene vive e fresche le esche.',p:()=>9.9},
    {id:'cooler',n:'Frigo portatile 25 l e thermos',d:'Bibite fresche e caffè caldo in postazione.',p:()=>39},
    {id:'scis',n:'Forbici per trecciato',d:'Taglio netto anche del multifibra.',p:()=>8.9}]},
  {k:'sedie',n:'🪑 Sedie',items:[
    {id:'chairStd',chair:1,n:'Sedia pieghevole',d:'La classica sedia da spiaggia: meglio del secchio!',p:()=>19},
    {id:'chairHigh',chair:1,n:'Sedia alta da surfcasting',d:'Seduta a 60 cm con schienale alto: vedi meglio le cime.',p:()=>39},
    {id:'chairLevel',chair:1,n:'Sedia con gambe regolabili',d:'Ogni gamba si regola: sempre dritta anche sulla sabbia in pendenza.',p:()=>54},
    {id:'chairArm',chair:1,n:'Poltrona imbottita con braccioli',d:'Imbottita, con portacanna e portabicchiere: per le nottate lunghe.',p:()=>79}]},
  {k:'borsoni',n:'👜 Borsoni',items:[
    {id:'bagTackle',n:'Borsa portaminuteria con 4 scatole',d:'Ami, girelle e piombi sempre in ordine.',p:()=>29},
    {id:'bagRod',n:'Fodero porta canne 1,70 m',d:'Porta 3 canne montate con i mulinelli.',p:()=>50},
    {id:'bagBack',n:'Zaino da surfcasting 45 l',d:'Mani libere per portare tutto in spiaggia.',p:()=>49},
    {id:'cart',n:'Carrello da spiaggia con ruote larghe',d:'Porta tutta l\'attrezzatura senza fatica sulla sabbia.',p:()=>89}]},
  {k:'abbigliamento',n:'🧥 Abbigliamento',items:[
    {id:'o_track',outfit:'tracksuit',n:'Tuta da pesca',d:'Comoda e calda per le uscite di tutti i giorni.',p:()=>29},
    {id:'o_waders',outfit:'waders',n:'Scafandro in PVC',d:'Entri in acqua fino al petto senza bagnarti.',p:()=>35},
    {id:'o_jacket',outfit:'jacket',n:'Giacca impermeabile',d:'Con cappuccio: niente più pioggia addosso.',p:()=>39},
    {id:'o_neo',outfit:'neo',n:'Scafandro in neoprene 4 mm',d:'Caldo anche d\'inverno: entri in acqua senza congelarti.',p:()=>59},
    {id:'o_thermo',outfit:'thermo',n:'Giacca impermeabile termica',d:'Imbottita e antipioggia, cappuccio e polsini stagni.',p:()=>89},
    {id:'o_wind',outfit:'wind',n:'Tuta antivento',d:'Leggera, blocca il vento di tramontana.',p:()=>49},
    {id:'o_float',outfit:'float',n:'Giacca galleggiante arancione',d:'Visibile e sicura sugli scogli.',p:()=>99},
    {id:'h_cap',hat:'cap',n:'Berretto con visiera',d:'Ripara gli occhi dal sole.',p:()=>8},
    {id:'h_bucket',hat:'bucket',n:'Cappello da pescatore',d:'Ripara dal sole e dalla pioggia.',p:()=>15},
    {id:'h_beanie',hat:'beanie',n:'Berretto di lana',d:'Per le uscite invernali.',p:()=>12},
    {id:'h_none',hat:'none',n:'Fascia per la frontale (senza cappello)',d:'Solo la frontale, capelli al vento.',p:()=>5},
    {id:'boots',n:'Stivali in gomma alti',d:'Piedi asciutti sulla battigia.',p:()=>29}]},
  {k:'picchetti',n:'📍 Picchetti',items:[
    {id:'spikePVC',n:'Picchetto in PVC 1,20 m',d:'Il più semplice: un posto per una canna.',p:()=>6},
    {id:'spike',n:'Picchetto portacanna in alluminio 1,5 m',d:'Con il treppiede: ben piantato, la canna non cade con il vento.',p:()=>14.9},
    {id:'spikeLong',n:'Picchetto 1,80 m con doppio supporto',d:'Tiene la canna più alta, sopra i frangenti.',p:()=>22},
    {id:'tripod',n:'Tripode portacanne per 3 canne',d:'In alluminio, per gli scogli e la sabbia dura.',p:()=>59}]},
  {k:'torce',n:'🔦 Torce',items:[
    {id:'lampB',torch:1,n:'Torcia frontale base 100 lumen',d:'Per vedere le canne di notte.',p:()=>9.9},
    {id:'lampF',torch:2,n:'Frontale LED 500 lumen',d:'Luce più forte per pescare di notte.',p:()=>24.9},
    {id:'lamp1000',torch:3,n:'Frontale 1000 lumen ricaricabile',d:'La più potente: illumina la canna a 10 m.',p:()=>39},
    {id:'lampRed',n:'Frontale con luce rossa',d:'La luce rossa non spaventa i pesci sotto riva: di notte abboccano un po\' di più.',p:()=>19},
    {id:'lanternLED',n:'Lanterna LED da campeggio',d:'Illumina tutta la postazione.',p:()=>24}]},
  {k:'ombrelloni',n:'⛱️ Ombrelloni',items:[
    {id:'umbrella',shelter:1,n:'Ombrellone da pesca 2,50 m con teli',d:'Ripara da sole, vento e pioggia.',p:()=>45},
    {id:'bivvy',shelter:1,n:'Tenda riparo da spiaggia',d:'Mezza cupola chiusa: per le nottate di pesca.',p:()=>99},
    {id:'windbreak',n:'Frangivento 4 pannelli',d:'Ferma la sabbia e il vento sulla postazione.',p:()=>25}]}];
const ITEM0=0;const ITEM=Object.fromEntries(CAT.flatMap(c=>c.items.map(i=>[i.id,{...i,cat:c.k}])));
const fullO=(it,o)=>{const r={};(it.opts||[]).forEach(op=>r[op.k]=o?.[op.k]||0);return r;};
const optTxt=(it,o)=>(it.opts||[]).map(op=>op.v[o[op.k]||0]).join(' · ');
// effetti sull'attrezzatura
function giveItem(it,o){const g=st.gear;(g.bought=g.bought||{})[it.id]=true;switch(it.id){
  case 'needle':g.needle=true;break;case 'elastic':g.elastic=true;break;
  case 'lamp1000':g.lamp=true;g.torch=3;break;case 'lampB':g.torch=Math.max(g.torch||0,1);break;case 'lampF':g.lamp=true;g.torch=Math.max(g.torch||0,2);break;case 'lampRed':g.red=true;break;case 'lanternLED':g.lanternLED=true;break;
  case 'spikePVC':g.spikes=(g.spikes||0)+1;break;case 'spike':g.spikes=(g.spikes||0)+1;g.spikeT='alu';break;case 'spikeLong':g.spikes=(g.spikes||0)+1;g.spikeT='long';break;case 'tripod':g.spikes=(g.spikes||0)+3;g.spikeT='tripod';break;
  case 'boots':g.boots=true;break;
  case 'reel':{const t=['6000','8000','10000','14000'][o.t||0],id='r'+t;if(!g.reels.includes(id))g.reels.push(id);g.reelCnt[id]=(g.reelCnt[id]||0)+1;g.reel=id;g.drag=[8,12,15,20][o.t||0];break;}
  case 'reelT':if(!g.reels.includes('rT'))g.reels.push('rT');g.reelCnt.rT=(g.reelCnt.rT||0)+1;g.reel='rT';g.drag=25;break;
  case 'hook':{const m=[0,2,4,6,8][o.m||0];g.hooks[m]=(g.hooks[m]||0)+10;if(o.t===1){g.forged=g.forged||{};g.forged[m]=(g.forged[m]||0)+10;}break;}
  case 'lead':{const w=[80,100,125,150,175,200][o.g||0];if(o.t===2)g.grip[w]=(g.grip[w]||0)+2;if(o.t===1){g.ogiva=g.ogiva||{};g.ogiva[w]=(g.ogiva[w]||0)+2;}g.leads[w]=(g.leads[w]||0)+2;break;}
  case 'line':g.line=[.2,.22,.25,.28,.3][o.d||0];break;
  case 'leader':g.leader+=5;break;
  case 'braid':g.braid=[.10,.12,.14,.16][o.d||0];g.braidN=(g.braidN||0)+1;break;
  case 'fluo':g.fluo=[.25,.3,.35,.4][o.d||0];g.term=(g.term||0)+10;break;
  case 'star':g.starlight+=10;break;case 'swiv':g.swivels+=15;break;case 'snap':g.snaps+=15;break;
  default:if(it.rod){if(!g.rods.includes(it.id))g.rods.push(it.id);g.rodCnt[it.id]=(g.rodCnt[it.id]||0)+1;g.rod=it.id;break;}
    if(it.reel){if(!g.reels.includes(it.reel))g.reels.push(it.reel);g.reelCnt[it.reel]=(g.reelCnt[it.reel]||0)+1;g.reel=it.reel;g.drag=reelDrag(it.reel);break;}
    if(it.chair){g.chairs=g.chairs||['chairStd'];if(!g.chairs.includes(it.id))g.chairs.push(it.id);g.chair=it.id;break;}
    if(it.outfit){g.outfits=g.outfits||[];if(!g.outfits.includes(it.outfit))g.outfits.push(it.outfit);st.outfit=it.outfit;LSS('outfit',it.outfit);break;}
    if(it.hat){g.hats=g.hats||['cap'];if(!g.hats.includes(it.hat))g.hats.push(it.hat);g.hat=it.hat;break;}
    if(it.shelter){g.shelters=g.shelters||[];if(!g.shelters.includes(it.id))g.shelters.push(it.id);g.shelter=it.id;break;}if(it.bait){g.baits[it.bait]=(g.baits[it.bait]||0)+it.pk;}else g.own[it.id]=(g.own[it.id]||0)+1;}}
// premi: un bonus al giorno e un compenso per ogni cattura
function gearQuality(){const g=st.gear,b=g.bought||{},w=wxAt(st.gt);let q=.7;
  q+={surf420:0,surf420s:(w.wave||0)<.6?.12:.04,surf450:.1,surf480:.14}[g.rod]||0;q+={r6000:.02,r8000:0,r10000:.05,r14000:.06,rT:.09}[g.reel]||0;
  if(b.fluo)q+=g.fluo<=.25?.07:g.fluo<=.3?.05:.03;if(b.line)q+=.02;if(b.hook)q+=.03;if(b.beads&&night()>.3)q+=.05;if(g.red&&night()>.3)q+=.04;if(b.bucket)q+=.03;if(Object.keys(b).some(k=>k.startsWith('b_')))q+=.04;
  return Math.min(1.2,q);}
const ROD_COL={surf420:['#2b2f36','#3a4049'],beach390:['#d9b24a','#c9a24a'],tele420:['#1b1b1b','#2b2b2b'],surf420s:['#e8e8e4','#cfd3d6'],surf420c:['#1b3d22','#2b5d32'],surf450:['#0f2f5a','#1d4f8a'],surf450h:['#3a1f5c','#5a3a8a'],surf470:['#7a5a2a','#9a7a3a'],surf480:['#5a0f12','#8a1c20'],surf500:['#101010','#c9a24a'],surf420c2:['#14301a','#c9a24a'],surf450_2:['#0a2240','#c9a24a'],surf480_2:['#3a0a0c','#c9a24a'],surf500_2:['#050505','#d9dde2']},REEL_COL={r5000:'#6b7480',r6000:'#2b2f36',r8000:'#3d4550',r10000:'#b8352a',r14000:'#c9a24a',rRear:'#2f6fb5',rLC:'#d4d8dc',rMult:'#8a1c20',rT:'#d9dde2'};
// la canna e il mulinello scelti si vedono sul modello
function skinRod(obj,rodId,reelId){const g=st.gear,U=obj.userData;if(!U.sk){U.sk={m1:new T.MeshStandardMaterial({roughness:.3,metalness:.35}),m2:new T.MeshStandardMaterial({roughness:.3,metalness:.35}),mr:new T.MeshStandardMaterial({roughness:.3,metalness:.75}),base:U.reel.scale.x};
    obj.traverse(o=>{if(!o.isMesh)return;if(o.material===MAT.blank)o.material=U.sk.m1;else if(o.material===MAT.blank2)o.material=U.sk.m2;else if(o.material===MAT.reel)o.material=U.sk.mr;});}
  const rc=ROD_COL[rodId]||ROD_COL.surf420;U.sk.m1.color.set(rc[0]);U.sk.m2.color.set(rc[1]);U.sk.mr.color.set(REEL_COL[reelId]||'#3d4550');
  U.reel.scale.setScalar(U.sk.base*({r5000:.85,r10000:1.08,r14000:1.16,rLC:1.12,rMult:.9,rT:1.18,r6000:.92}[reelId]||1));
  if(g.bought?.beads){const bm=new T.MeshStandardMaterial({color:'#9dff7a',emissive:'#5aff3a',emissiveIntensity:.5});obj.userData.beads=bm;}}
function gearChips(noRR){const g=st.gear,b=g.bought||{},q=gearQuality(),rn=id=>id==='rT'?'Tournament 14000':id.slice(1);
  return `${noRR?'':`<div class="grow" style="flex-wrap:wrap;gap:4px"><span>Canna</span>${g.rods.map(id=>`<button class="gc ${g.rod===id?'on':''}" onclick="GAME.useRod('${id}')">${ROD[id].n}</button>`).join('')}</div>
    <div class="grow" style="flex-wrap:wrap;gap:4px"><span>Mulinello</span>${g.reels.map(id=>`<button class="gc ${g.reel===id?'on':''}" onclick="GAME.useReel('${id}')">${reelN(id)}</button>`).join('')}</div>`}
    <div class="gs">🎒 ${g.braid?'Trecciato '+String(g.braid).replace('.',',')+' mm':'Filo '+String(g.line).replace('.',',')+' mm'}${b.leader||g.leader?` · shock leader ${g.leader}`:''}${b.fluo?` · fluorocarbon ${String(g.fluo).replace('.',',')}`:''} · starlight ${g.starlight}${b.beads?' · perline':''}${b.elastic?' · elastico':''}${b.lamp||b.lampF?' · frontale LED':''}${b.spike?' · picchetti in alluminio':''}${b.box?' · cassetta':' · busta per la minuteria'}${b.bucket?' · secchio esche':''}</div>
    <div class="gs" style="color:${q<.8?'#ffb547':'#5ee08a'}">${q<.8?'⚠️ Attrezzatura di base: pescherai meno. Al negozio trovi di meglio.':'✅ Attrezzatura buona: '+Math.round(q*100)+'% di efficacia.'}</div>`;}
G.useReel=id=>{const g=st.gear;g.reel=id;g.drag=reelDrag(id);gearSave();if(st.phase==='shop')shopUI();else setUI();};
G.gearView=()=>{st.phaseBack=st.phase;st.phase='gear';setUI();};G.gearBack=()=>{st.phase=st.phaseBack||'wait';setUI();};
// ogni canna montata prende dallo zaino un piombo, un amo, una girella, un moschettone e un terminale
function rigFromBag(){const g=st.gear;for(const r of st.rods){const lw=[r.lead,80,100,125,150,175,200].find(w=>g.leads[w]>0),hk=[hookNum(r.hook),0,2,4,6,8].find(h=>g.hooks[h]>0);
  if(lw==null||hk==null||!(g.swivels>0)||!(g.snaps>0)||!(g.term>0)){r.broken=true;continue;}r.lead=lw;r.hook=hk;g.leads[lw]--;g.hooks[hk]--;g.swivels--;g.snaps--;g.term--;}gearSave();}
// piano di montaggio: per ogni canna canna, mulinello, lenza madre, piombo, terminale e amo, senza usare più pezzi di quelli che hai
function planUsed(key,val,except){return (st.plan||[]).reduce((a,q,i)=>a+(i!==except&&q&&q[key]===val?1:0),0);}
function planAvail(key,val,i){const g=st.gear,tot=key==='rodId'?g.rodCnt?.[val]||0:key==='reelId'?g.reelCnt?.[val]||0:key==='lineT'?(val==='braid'?g.braidN||(g.braid?1:0):99):key==='lead'?g.leads?.[val]||0:key==='hook'?g.hooks?.[val]||0:99;return tot-planUsed(key,val,i);}
function planFix(){const g=st.gear,n=Math.max(1,Math.min(st.nRods,maxRods()||1));st.plan=(st.plan||[]).slice(0,n);
  for(let i=0;i<n;i++){const q=st.plan[i]=st.plan[i]||{};const pick=(key,opts,pref)=>{if(q[key]!=null&&planAvail(key,q[key],i)>0)return;q[key]=[pref,...opts].find(v=>v!=null&&planAvail(key,v,i)>0)??opts[0];};
    pick('rodId',g.rods,g.rod);pick('reelId',g.reels,g.reel);pick('lineT',['nylon','braid'],'nylon');pick('lead',[125,100,150,80,175,200],st.lead);pick('hook',[4,2,6,0,8],st.hook);q.rig=q.rig||'lungo';q.leadT=q.leadT||'piramidale';q.hookT=q.hookT||'aberdeen';}}
function planHtml(){planFix();const g=st.gear,i=Math.min(st.pi||0,st.plan.length-1),q=st.plan[i],chip=(key,v,lab,extra='')=>{const on=q[key]===v,av=planAvail(key,v,i);return `<button class="gc ${on?'on':''}" ${!on&&av<=0?'disabled style="opacity:.35"':''} onclick="GAME.planSet('${key}',${typeof v==='string'?`'${v}'`:v})">${lab}${extra}</button>`;};
  const row=(t,html)=>`<div class="grow" style="flex-wrap:wrap;gap:4px"><span>${t}</span>${html}</div>`,cnt=n=>` <small style="opacity:.7">${n}</small>`;
  return `<div class="grow" style="gap:4px">${st.plan.map((_,k)=>`<button class="gc ${k===i?'on':''}" onclick="GAME.planPick(${k})">🎣 Canna ${k+1}</button>`).join('')}</div>
    ${row('Canna',g.rods.map(id=>chip('rodId',id,ROD[id].n,cnt(planAvail('rodId',id,i)+(q.rodId===id?0:0)))).join(''))}
    ${row('Mulinello',g.reels.map(id=>chip('reelId',id,reelN(id),cnt(planAvail('reelId',id,i)))).join(''))}
    ${row('Lenza madre',chip('lineT','nylon','Nylon '+String(g.line).replace('.',','))+(g.braid?chip('lineT','braid','Trecciato '+String(g.braid).replace('.',','),cnt(planAvail('lineT','braid',i))):''))}
    ${row('Piombo',[80,100,125,150,175,200].map(w=>chip('lead',w,w+' g',cnt(planAvail('lead',w,i)))).join(''))}
    ${(g.grip?.[q.lead]>0||g.ogiva?.[q.lead]>0)?row('Forma',[['piramidale','🔺'],['ogiva','💧'],['ragno','🕷️']].filter(([k])=>leadOk(q.lead,k)).map(([k,e])=>chip('leadT',k,e+' '+k)).join('')):''}
    ${row('Terminale',[['lungo','lungo 1,5 m'],['corto','corto 75 cm'],['2ami','trave a 2 ami']].map(([k,n])=>chip('rig',k,n)).join(''))}
    ${row('Amo',[0,2,4,6,8].map(k=>chip('hook',k,'n. '+k,cnt(planAvail('hook',k,i)))).join(''))}
    ${g.forged?.[q.hook]>0?row('Tipo amo',chip('hookT','aberdeen','Aberdeen')+chip('hookT','forgiato','Forgiato')):''}`;}
G.planPick=k=>{st.pi=k;setUI();};
G.planSet=(key,v)=>{planFix();const i=Math.min(st.pi||0,st.plan.length-1),q=st.plan[i];if(q[key]!==v&&planAvail(key,v,i)<=0){st.msg='Non ne hai altri liberi: '+(key==='rodId'||key==='reelId'?'compra un altro pezzo al negozio.':'cambia scelta o passa dal negozio.');setUI();return;}q[key]=v;if(key==='lead'&&!leadOk(v,q.leadT))q.leadT='piramidale';if(key==='hook'&&!(st.gear.forged?.[v]>0))q.hookT='aberdeen';st.msg='';click();setUI();};
function maxRods(){const g=st.gear,rc=Object.values(g.rodCnt||{}).reduce((a,b)=>a+b,0),lc=Object.values(g.reelCnt||{}).reduce((a,b)=>a+b,0);return Math.max(0,Math.min(3,rc,lc,g.spikes||0));}
function loseGear(kind,id){const g=st.gear,C=kind==='rod'?g.rodCnt:g.reelCnt,L=kind==='rod'?g.rods:g.reels;if(!C[id])return;C[id]--;if(C[id]<=0){delete C[id];const k=L.indexOf(id);if(k>=0)L.splice(k,1);}
  if(kind==='rod'&&g.rod===id)g.rod=L[0]||'';if(kind==='reel'&&g.reel===id){g.reel=L[0]||'';g.drag=reelDrag(g.reel);}st.nRods=Math.min(st.nRods,Math.max(1,maxRods()));LSS('nrods',st.nRods);gearSave();}
function dailyBonus(){if(LSG('bonusDay','')!==today()){LSS('bonusDay',today());st.money+=20;gearSave();return true;}return false;}

/* ---------- la scena del negozio ---------- */
const SH={cart:[],cat:'canne',sel:{},cam:{p:null,l:null},hits:[]};
const SHCAM={ingresso:[[0,1.7,1.2],[0,1.3,-5]],canne:[[-2.1,1.6,-3.6],[-4.9,1.5,-4.2]],mulinelli:[[1.4,1.6,-1.4],[3.6,1.05,-2.4]],esche:[[2,1.6,-5],[3.9,1.2,-7.4]],ami:[[-2.4,1.6,-5],[-2.6,1.4,-7.9]],piombi:[[-2.4,1.6,-5],[-2.6,1.2,-7.9]],fili:[[-.4,1.6,-5],[-.4,1.4,-7.9]],accessori:[[1.3,1.6,-5.2],[1.4,1.4,-7.9]],cassa:[[1.6,1.7,-3],[4.2,1.4,-4.1]],sedie:[[.6,1.6,.6],[2.8,.8,-1.2]],ombrelloni:[[.6,1.7,.6],[2.8,1.4,-1.2]],abbigliamento:[[-.6,1.6,.6],[-3.2,1.2,-1.2]],borsoni:[[-.6,1.6,.6],[-3.2,.8,-1.2]],picchetti:[[-2.1,1.6,-3.6],[-4.9,1.2,-4.2]],torce:[[1.3,1.6,-5.2],[1.4,1.4,-7.9]]};
function shopTex(txt,o={}){return canvasTex(o.w||512,o.h||128,(g,W,H)=>{g.fillStyle=o.bg||'#12324a';g.fillRect(0,0,W,H);if(o.border){g.strokeStyle=o.border;g.lineWidth=8;g.strokeRect(6,6,W-12,H-12);}g.fillStyle=o.col||'#fff';g.textAlign='center';g.textBaseline='middle';let fs=o.fs||64;g.font=`800 ${fs}px Outfit,sans-serif`;while(g.measureText(txt).width>W-40&&fs>20){fs-=4;g.font=`800 ${fs}px Outfit,sans-serif`;}g.fillText(txt,W/2,H/2+3);});}
function buildShop(){scene=new T.Scene();scene.background=new T.Color('#1a1612');camera=new T.PerspectiveCamera(60,1,.05,80);
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.outputEncoding=T.sRGBEncoding;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=false;
  const M=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.8,...o}),box=(w,h,d,m,x,y,z,par=scene)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);par.add(b);return b;};
  scene.add(new T.HemisphereLight(0xfff4e0,0x6b5a45,.55));
  for(const [x,z] of [[-2.5,-2],[2.5,-2],[-2.5,-6],[2.5,-6]]){const l=new T.PointLight(0xfff1d6,.9,9,1.6);l.position.set(x,2.85,z);scene.add(l);box(1.2,.04,.5,M('#ffffff',{emissive:'#fff5e0',emissiveIntensity:1.2}),x,2.98,z);}
  // pavimento in parquet, pareti e soffitto
  const fl=canvasTex(512,512,(g,W,H)=>{for(let i=0;i<8;i++)for(let j=0;j<3;j++){const c=`hsl(${28+Math.random()*6},${38+Math.random()*10}%,${32+Math.random()*12}%)`;g.fillStyle=c;const off=(i%2)*85;g.fillRect(j*170-off,i*64,170,64);g.fillRect(j*170-off+510,i*64,170,64);g.strokeStyle='rgba(0,0,0,.35)';g.strokeRect(j*170-off,i*64,170,64);
    for(let k=0;k<6;k++){g.strokeStyle='rgba(60,30,10,.18)';g.beginPath();g.moveTo(j*170-off,i*64+8+k*9);g.bezierCurveTo(j*170-off+60,i*64+4+k*9,j*170-off+110,i*64+14+k*9,j*170-off+170,i*64+8+k*9);g.stroke();}}},[4,4]);
  const flm=new T.Mesh(new T.PlaneGeometry(10,9),new T.MeshStandardMaterial({map:fl,roughness:.55}));flm.rotation.x=-Math.PI/2;flm.position.set(0,0,-4);scene.add(flm);
  const wallM=M('#e9e1d2',{roughness:.95}),wall=(w,h,x,y,z,ry)=>{const p=new T.Mesh(new T.PlaneGeometry(w,h),wallM);p.position.set(x,y,z);p.rotation.y=ry;scene.add(p);return p;};
  wall(10,3,0,1.5,-8.5,0);wall(9,3,-5,1.5,-4,Math.PI/2);wall(9,3,5,1.5,-4,-Math.PI/2);const ce=new T.Mesh(new T.PlaneGeometry(10,9),M('#f4f1ea'));ce.rotation.x=Math.PI/2;ce.position.set(0,3,-4);scene.add(ce);
  box(10,.5,.05,M('#1d5f8a'),0,2.65,-8.47);box(.05,.5,9,M('#1d5f8a'),-4.97,2.65,-4);
  // ingresso con vetrina luminosa
  const fw=new T.Mesh(new T.PlaneGeometry(10,3),M('#cfd8dc',{transparent:true,opacity:.25,emissive:'#bfe3ff',emissiveIntensity:.6}));fw.position.set(0,1.5,.45);fw.rotation.y=Math.PI;scene.add(fw);
  // insegna
  const sg=new T.Mesh(new T.PlaneGeometry(3.4,.6),new T.MeshBasicMaterial({map:shopTex('PESCA SPORT · LAZIO',{bg:'#0f3b57',col:'#ffd76a',border:'#ffd76a',w:1024,h:180,fs:90})}));sg.position.set(-.4,2.62,-8.44);sg.scale.set(.8,.8,1);scene.add(sg);
  const lab=(t,x,y,z,ry=0)=>{const p=new T.Mesh(new T.PlaneGeometry(1.6,.36),new T.MeshBasicMaterial({map:shopTex(t,{bg:'#1d5f8a',fs:70})}));p.position.set(x,y,z);p.rotation.y=ry;scene.add(p);};
  // rastrelliera delle canne sulla parete sinistra
  lab('CANNE',-4.95,2.4,-4.2,Math.PI/2);box(.08,.08,5.6,M('#6b4a32'),-4.85,.35,-4.2);box(.08,.08,5.6,M('#6b4a32'),-4.85,1.9,-4.2);
  const blanks=['#1b1b1b','#0f2f5a','#5a0f12','#1b3d22','#e3e3e3','#26303a','#3a1f5c'];for(let i=0;i<15;i++){const z=-6.8+i*.37,h=rnd(2.1,2.45),g=new T.Group();
    const bl=new T.Mesh(new T.CylinderGeometry(.006,.016,h,8),M(blanks[i%7],{roughness:.3,metalness:.3}));bl.position.y=h/2;g.add(bl);
    const cork=new T.Mesh(new T.CylinderGeometry(.019,.019,.45,10),M('#b98d58'));cork.position.y=.35;g.add(cork);for(let k=1;k<6;k++){const ri=new T.Mesh(new T.TorusGeometry(.012+.02*(1-k/6),.003,6,12),M('#c0c4c8',{metalness:.9,roughness:.2}));ri.rotation.y=Math.PI/2;ri.position.set(.03,.6+k*.3,0);g.add(ri);}
    g.position.set(-4.82,.05,z);g.rotation.z=-.08;scene.add(g);}
  // scaffali sulla parete di fondo con le confezioni
  const shelf=(x,title)=>{lab(title,x,2.14,-8.4);const fr=M('#7a5a3a');box(.05,2,.45,fr,x-.95,1,-8.2);box(.05,2,.45,fr,x+.95,1,-8.2);box(1.95,2,.03,M('#d8cdb8'),x,1,-8.42);
    for(let k=0;k<5;k++){const y=.15+k*.42;box(1.9,.03,.45,fr,x,y,-8.2);for(let i=0;i<8;i++){const w=rnd(.12,.2),h=rnd(.16,.32),c=new T.Color().setHSL(Math.random(),.55,.5);const pk=box(w,h,rnd(.05,.12),M(c,{roughness:.6}),x-.82+i*.235,y+.015+h/2,-8.16+rnd(-.05,.05));
      const lb=box(w*.8,h*.3,.002,M('#ffffff',{roughness:.4}),0,h*.12,0,pk);lb.position.z=pk.geometry.parameters.depth/2+.001;}}};
  shelf(-2.6,'AMI · PIOMBI');shelf(-.4,'FILI · TERMINALI');shelf(1.8,'MINUTERIE');
  // frigo delle esche vive
  lab('ESCHE VIVE',3.9,2.45,-7.6,-Math.PI/4);const fr=box(1.1,2.1,.8,M('#dfe6ea',{metalness:.4,roughness:.3}),3.9,1.05,-7.7);fr.rotation.y=-Math.PI/4;
  const gl=new T.Mesh(new T.PlaneGeometry(.95,1.7),new T.MeshStandardMaterial({color:'#bfe9ff',emissive:'#9fe0ff',emissiveIntensity:.8,transparent:true,opacity:.55}));gl.position.set(3.9+Math.sin(-Math.PI/4)*.41,1.15,-7.7+Math.cos(-Math.PI/4)*.41);gl.rotation.y=-Math.PI/4;scene.add(gl);
  // bancone di vetro con i mulinelli, cassa e commesso
  lab('MULINELLI',3.6,1.6,-1.6,-Math.PI/2);box(.9,.9,3,M('#6b4a32'),3.8,.45,-2.6);const glass=new T.Mesh(new T.BoxGeometry(.9,.3,3),new T.MeshStandardMaterial({color:'#e8f6ff',transparent:true,opacity:.25,roughness:.05,metalness:.2}));glass.position.set(3.8,1.05,-2.6);scene.add(glass);
  for(let i=0;i<5;i++){const g=new T.Group(),bd=new T.Mesh(new T.CylinderGeometry(.06,.06,.08,16),M(['#2b2f36','#c0392b','#c9c9c9','#1d5f8a','#d4a017'][i],{metalness:.7,roughness:.3}));bd.rotation.z=Math.PI/2;g.add(bd);
    const sp=new T.Mesh(new T.CylinderGeometry(.045,.055,.07,16),M('#d0d4d8',{metalness:.9,roughness:.2}));sp.rotation.z=Math.PI/2;sp.position.x=-.07;g.add(sp);const ft=box(.02,.08,.02,M('#2b2f36'),.0,-.07,0,g);
    g.position.set(3.8,.98,-1.5-i*.55);g.rotation.y=Math.PI/2;scene.add(g);}
  box(.35,.25,.3,M('#2b2f36'),3.9,1.33,-4.0);box(.3,.12,.02,M('#5ee08a',{emissive:'#1f7a3a',emissiveIntensity:.8}),3.75,1.5,-3.95);
  // poster delle specie con le foto vere
  ['Orata','Spigola','Sarago maggiore'].forEach((n,i)=>{if(!FISHLOC[n])return;const tx=new T.TextureLoader().load(GBASE+FISHLOC[n].f);tx.encoding=T.sRGBEncoding;const p=new T.Mesh(new T.PlaneGeometry(.9,.6),new T.MeshBasicMaterial({map:tx}));p.position.set(4.97,1.9,-5.2-i*1.05);p.rotation.y=-Math.PI/2;scene.add(p);
    const t=new T.Mesh(new T.PlaneGeometry(.9,.16),new T.MeshBasicMaterial({map:shopTex(n.toUpperCase(),{bg:'#0f3b57',fs:60})}));t.position.set(4.97,1.52,-5.2-i*1.05);t.rotation.y=-Math.PI/2;scene.add(t);});
  // il commesso
  const so=makeAngler({suit:'jacket',j:'#7a3b2e',j2:'#5e2c22',hat:'none',beard:'full',beardCol:'#8a8a84',hair:'#8a8a84',glasses:true,skin:'#d8a588',p:'#3a3a3a'});
  SH.clerk={obj:so,pose:JSON.parse(JSON.stringify(POSES.stand)),target:'stand',walk:0,moving:false,speed:1,pos:new T.Vector3(4.45,0,-3.6),rotY:Math.PI/2,holding:-1,reelSpin:0,crank:0,faceTo:null};scene.add(so);
  // esposizione: sedia e ombrellone aperto, stand dei vestiti con le giacche, borsoni
  {const u=new T.Group(),pole=box(.03,2.2,.03,M('#c0c4c8',{metalness:.7}),0,1.1,0,u);const can=new T.Mesh(new T.ConeGeometry(1.1,.45,12,1,true),new T.MeshStandardMaterial({color:'#2f6fb5',side:T.DoubleSide,roughness:.7}));can.position.y=2.1;u.add(can);u.position.set(2.8,0,-1.2);scene.add(u);
    const c=new T.Group();box(.45,.04,.4,M('#4b5a36'),0,.5,0,c);box(.45,.45,.04,M('#4b5a36'),0,.75,.2,c);for(const x of[-.2,.2])for(const z of[-.18,.18])box(.025,.5,.025,M('#9aa3ad',{metalness:.6}),x,.25,z,c);c.position.set(2.6,0,-.8);c.rotation.y=-.6;scene.add(c);
    const rk=new T.Group();box(1.4,.03,.03,M('#9aa3ad',{metalness:.7}),0,1.7,0,rk);for(const x of[-.65,.65])box(.03,1.7,.03,M('#9aa3ad',{metalness:.7}),x,.85,0,rk);
    ['#c0392b','#2f6fb5','#3a5a2a','#e67e22','#2b2f36'].forEach((cl,i)=>{const j=box(.26,.6,.1,M(cl),-.5+i*.25,1.32,0,rk);j.rotation.y=.3;});rk.position.set(-3.2,0,-1.2);rk.rotation.y=.4;scene.add(rk);
    ['#3d434b','#5a3a2a','#2f6fb5'].forEach((cl,i)=>box(.5,.32,.3,M(cl),-3.4+i*.55,.16,-.3));}
  // zone toccabili
  SH.hits=[['canne',-4.8,1.3,-4.2,.6,2.6,5.6],['mulinelli',3.8,.9,-2.6,1,.9,3],['esche',3.9,1,-7.7,1.2,2.1,1.2],['ami',-2.6,1,-8.2,2,2,.6],['fili',-.4,1,-8.2,2,2,.6],['accessori',1.8,1,-8.2,2,2,.6],['cassa',4.4,1,-3.8,.8,2,1],['sedie',2.7,.6,-1,1.4,1.4,1.4],['abbigliamento',-3.2,1,-1.2,1.6,2,.8]].map(([k,x,y,z,w,h,d])=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({visible:false}));m.position.set(x,y,z);m.userData.k=k;scene.add(m);return m;});
  SH.cam.p=new T.Vector3(0,1.7,2.4);SH.cam.l=new T.Vector3(0,1.3,-5);SH.go='ingresso';}
async function openShop(){st.phase='shop';stop();root=null;mountShell();try{T=await (MP.three||loadThree());}catch(e){ui.innerHTML='<div class="gpanel">Negozio non disponibile</div>';return;}
  renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(1.6,devicePixelRatio||1));cvs=renderer.domElement;root.querySelector('#g3').appendChild(cvs);
  buildShop();size();addEventListener('resize',size);clock=new T.Clock();SH.cart=[];
  const name=window.GP_NAME||(window.CLOUD?.name?.()||'').split(/[ .]/)[0]||'';const bonus=dailyBonus();
  setTimeout(()=>say(SH.clerk,`Buongiorno${name?' '+name:''}! Cosa ti serve oggi?`,4),900);if(bonus)st.msg='🎁 Bonus del giorno: +€ 20';
  cvs.addEventListener('pointerup',e=>{const r=cvs.getBoundingClientRect(),m=new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),rc=new T.Raycaster();rc.setFromCamera(m,camera);const h=rc.intersectObjects(SH.hits,false)[0];if(h)G.shopCat(h.object.userData.k==='cassa'?'cassa':h.object.userData.k);});
  shopUI();const lp=()=>{raf=requestAnimationFrame(lp);if(!renderer||st.phase!=='shop')return;const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
    const C=SHCAM[SH.go]||SHCAM.ingresso;SH.cam.p.lerp(new T.Vector3(...C[0]),1-Math.exp(-dt*2.5));SH.cam.l.lerp(new T.Vector3(...C[1]),1-Math.exp(-dt*3));camera.position.copy(SH.cam.p);camera.position.y+=Math.sin(t*.8)*.01;camera.lookAt(SH.cam.l);
    const k=SH.clerk;if(k.bub){k.bubT-=dt;if(k.bubT<=0){k.obj.remove(k.bub);k.bub=null;}}const tr=new T.Vector3(SH.cam.p.x,0,SH.cam.p.z);k.rotY=lerpAng(k.rotY,Math.atan2(-(tr.x-k.pos.x),-(tr.z-k.pos.z)),1-Math.exp(-dt*3));lerpPose(dt,5,k);applyPose(t,k);
    renderer.render(scene,camera);};lp();}
function mountShell(){root=document.createElement('div');root.id='gamebox';root.innerHTML=`<div id="g3"></div><div id="ghud"></div><div id="gui"></div><button id="gx" aria-label="Esci">✕</button><button id="gau" aria-label="Audio">${AU.on?'🔊':'🔇'}</button>`;document.body.appendChild(root);document.body.classList.add('gaming');ui=root.querySelector('#gui');hud=root.querySelector('#ghud');root.querySelector('#gx').onclick=()=>G.shopExit();root.querySelector('#gau').onclick=e=>{AU.on=!AU.on;LSS('audio',AU.on);e.target.textContent=AU.on?'🔊':'🔇';};}
const cartTot=()=>SH.cart.reduce((a,c)=>a+c.price,0);
function shopUI(){const c=CAT.find(x=>x.k===SH.cat),tot=cartTot();hud.innerHTML=`<div>🛒 Pesca Sport</div><div>💶 <b>${eur(st.money)}</b> virtuali</div>${SH.cart.length?`<div>🧺 ${SH.cart.length} · ${eur(tot)}</div>`:''}`;
  if(SH.cat==='zaino'){const g=st.gear;ui.innerHTML=`<div class="gpanel"><div class="grow" style="justify-content:space-between"><b>🎒 Il tuo zaino</b>${btn('↩ Negozio',"shopCat('canne')")}</div>
    <div class="gs">Canne: <b>${g.rods.map(id=>ROD[id].n+(g.rodCnt[id]>1?' ×'+g.rodCnt[id]:'')).join(', ')||'nessuna'}</b></div>
    <div class="gs">Mulinelli: <b>${g.reels.map(id=>reelN(id)+(g.reelCnt[id]>1?' ×'+g.reelCnt[id]:'')).join(', ')||'nessuno'}</b> · posti canna ${g.spikes||0} (frizione ${g.drag} kg) · ${g.braid?'trecciato '+String(g.braid).replace('.',','):'filo madre '+String(g.line).replace('.',',')} mm · terminale ${String(g.fluo).replace('.',',')} mm · shock leader ${g.leader} · terminali ${g.term||0}</div>
    <div class="gs">Esche: ${BAITS.filter(b=>!b.lim).map(b=>`${b.n} ${g.baits[b.k]||0}`).join(' · ')}</div>
    <div class="gs">Ami: ${[0,2,4,6,8].map(m=>`n.${m}: ${g.hooks[m]||0}`).join(' · ')}</div>
    <div class="gs">Piombi: ${[80,100,125,150,175,200].map(w=>`${w} g: ${g.leads[w]||0}${g.grip[w]?' ('+g.grip[w]+' a ragno)':''}`).join(' · ')}</div>
    <div class="gs">Starlight ${g.starlight} · girelle ${g.swivels} · moschettoni ${g.snaps} · ago ${g.needle?'sì':'no'} · elastico ${g.elastic?'sì':'no'} · frontale ${['nessuna','100 lm','500 lm','1000 lm'][g.torch||0]}${Object.keys(g.own).length?' · '+Object.keys(g.own).map(k=>ITEM[k]?.n.split(' ')[0]).join(', '):''}</div></div>`;return;}
  const items=SH.cat==='cassa'?null:c.items.slice().sort((a,b)=>a.p(fullO(a,{}))-b.p(fullO(b,{})));// dal più economico
  ui.innerHTML=`<div class="gpanel" style="max-height:56vh"><div class="grow" style="flex-wrap:nowrap;overflow-x:auto;gap:5px;scrollbar-width:none">${CAT.map(x=>`<button class="gc ${SH.cat===x.k?'on':''}" style="flex:none" onclick="GAME.shopCat('${x.k}')">${x.n}</button>`).join('')}<button class="gc" style="flex:none" onclick="GAME.shopCat('zaino')">🎒 Zaino</button></div>
    ${items?items.map(it=>{const o=SH.sel[it.id]||(SH.sel[it.id]={});const G2=st.gear,own=(it.chair&&(G2.chairs||[]).includes(it.id))||(it.outfit&&(G2.outfits||[]).includes(it.outfit))||(it.hat&&(G2.hats||[]).includes(it.hat))||(it.shelter&&(G2.shelters||[]).includes(it.id))||(['lampB','lampF','lamp1000','lampRed','lanternLED','boots','bagTackle','bagRod','bagBack','cart','windbreak','elastic','box','bucket','scis','cooler'].includes(it.id)&&G2.bought?.[it.id]),nOwn=it.rod?G2.rodCnt?.[it.id]||0:it.reel?G2.reelCnt?.[it.reel]||0:it.id==='reelT'?G2.reelCnt?.rT||0:0;return `<div class="gitem"><div style="flex:1;min-width:0"><b>${it.n}</b><div class="gs" style="margin:2px 0">${it.d}${it.pk?` · confezione da ${it.pk} innesci (ne hai ${st.gear.baits[it.bait]||0})`:''}${nOwn?` · ne hai ${nOwn}`:''}${['spikePVC','spike','spikeLong','tripod'].includes(it.id)?` · posti canna: ${G2.spikes||0}`:''}</div>
      ${(it.opts||[]).map(op=>`<div class="grow" style="gap:4px;margin:3px 0;flex-wrap:wrap"><span style="font-size:12.5px;opacity:.8">${op.n}</span>${op.v.map((v,i)=>`<button class="gc ${(o[op.k]||0)===i?'on':''}" style="padding:4px 9px;font-size:12.5px" onclick="GAME.shopOpt('${it.id}','${op.k}',${i})">${v}</button>`).join('')}</div>`).join('')}</div>
      <div style="text-align:right;flex:none"><b style="color:#ffd76a">${eur(it.p(fullO(it,o)))}</b><br>${own?'<span class="gs">già tua</span>':`<button class="gb" style="margin:4px 0 0;padding:8px 12px" onclick="GAME.shopAdd('${it.id}')">＋ Carrello</button>`}</div></div>`;}).join('')
    :`<b>🧾 Alla cassa</b>${SH.cart.length?SH.cart.map((x,i)=>`<div class="grow" style="justify-content:space-between;margin:3px 0"><span class="gs" style="margin:0">${ITEM[x.id].n}${x.o&&ITEM[x.id].opts?' · '+optTxt(ITEM[x.id],x.o):''}</span><span>${eur(x.price)} <u style="cursor:pointer" onclick="GAME.shopDel(${i})">✕</u></span></div>`).join(''):'<div class="gs">Il carrello è vuoto.</div>'}`}
    <div class="grow" style="margin-top:8px">${SH.cart.length?`<button class="gb ${SH.cat==='cassa'?'big':''}" style="flex:2" onclick="GAME.${SH.cat==='cassa'?'shopPay':"shopCat('cassa')"}()">💳 ${SH.cat==='cassa'?'Paga':'Vai alla cassa'} ${eur(tot)}</button>`:''}<button class="gb" style="flex:1;background:#33404d" onclick="GAME.shopExit()">🚪 Esci</button></div>${st.msg?`<div class="gs" style="text-align:center">${st.msg}</div>`:''}</div>`;}
G.shopCat=k=>{SH.cat=k;SH.go=k==='zaino'?'ingresso':k;st.msg='';click();shopUI();const L={sedie:'Una sedia comoda fa la differenza nelle nottate.',ombrelloni:'Con l\'ombrellone niente più pioggia sulla testa.',abbigliamento:'Lo scafandro in neoprene è caldissimo.',borsoni:'Con il carrello porti tutto in un viaggio.',picchetti:'Il tripode è perfetto sugli scogli.',torce:'La luce rossa non spaventa i pesci.',canne:'Queste sono le canne: più lunghe lanciano più lontano.',mulinelli:'I mulinelli sono nel bancone: con la bobina lunga il filo esce meglio.',esche:'Esche vive, appena arrivate!',ami:'Ami di tutte le misure: più è alto il numero, più è piccolo.',piombi:'Il piombo a ragno tiene anche con la corrente.',fili:'Lo shock leader ti salva dal crack-off.',accessori:'Minuterie: starlight, girelle, moschettoni… non devono mai mancare!',cassa:'Vieni pure alla cassa.'};if(L[k])say(SH.clerk,L[k],3.5);};
G.shopOpt=(id,k,i)=>{(SH.sel[id]=SH.sel[id]||{})[k]=i;shopUI();};
G.shopAdd=id=>{const it=ITEM[id],o=fullO(it,SH.sel[id]),price=Math.round(it.p(o)*100)/100;SH.cart.push({id,o,price});st.msg=`🧺 Aggiunto: ${it.n}${it.opts?' · '+optTxt(it,o):''}`;click();shopUI();};
G.shopDel=i=>{SH.cart.splice(i,1);shopUI();};
G.shopPay=()=>{const tot=cartTot();if(!SH.cart.length)return;if(tot>st.money+1e-6){say(SH.clerk,`Mancano ${eur(tot-st.money)}... togli qualcosa o torna dopo una pescata!`,4);st.msg='💸 Non bastano i soldi: togli qualcosa dal carrello.';shopUI();return;}
  st.money-=tot;SH.cart.forEach(x=>giveItem(ITEM[x.id],x.o||{}));SH.cart=[];gearSave();bell(2,.18);vib(40);say(SH.clerk,`Sono ${eur(tot)}. Grazie, a presto!`,4);st.msg=`✅ Pagato ${eur(tot)}. Trovi tutto nello zaino.`;SH.cat='zaino';SH.go='cassa';shopUI();};
G.useRod=id=>{st.gear.rod=id;gearSave();if(st.phase==='shop')shopUI();else setUI();};
G.shopExit=()=>{cancelAnimationFrame(raf);stop();MP.skipAsk=true;mount(null);};

/* ---------- interfaccia ---------- */
function mount(v){setTimeout(appCredit,0);
  stop();root=document.createElement('div');root.id='gamebox';
  root.innerHTML=`<div id="g3"></div><div id="ghud"></div><div id="gui"></div><button id="gx" aria-label="Esci">✕</button><button id="gau" aria-label="Audio">${AU.on?'🔊':'🔇'}</button><button id="glamp" aria-label="Torcia" class="${st.lamp?'':'off'}">🔦</button><button id="gspd" aria-label="Velocità del tempo">⏩ ${st.speed}x</button><div id="gjoy"><i></i></div><div id="gflash" style="position:absolute;inset:0;background:#eef4ff;opacity:0;pointer-events:none;mix-blend-mode:screen"></div>`;
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
function stop(){rpStop();st.bolt=null;st.castAnim=null;st.castLead=null;st.castCam=false;cancelAnimationFrame(MP.raf);dispose3D();removeEventListener('resize',sizeMap);windSound(0);motor(false);reelWhir(0);cancelAnimationFrame(raf);raf=0;removeEventListener('resize',size);try{renderer?.dispose();renderer?.forceContextLoss?.();}catch(e){}renderer=null;foams=[];clouds=[];st.rods=[];NPCS=[];MYG=[];CRABS=[];LANTERNS=[];CAM.p=null;document.getElementById('gamebox')?.remove();document.body.classList.remove('gaming');seaSound(0);}
addEventListener('hashchange',()=>{if(location.hash!=='#gioco'&&document.getElementById('gamebox'))stop();});
G.mount=mount;G.exit=()=>{if(st.phase!=='map'&&st.phase!=='parking'&&renderer&&SPOT){MP.from=String(SPOT.id||'').replace(/^g_/,'');stop();mount(null);return;}MP.from=null;stop();if(window.go)go('home');};
function size(){if(!renderer)return;const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<h?68:50;camera.updateProjectionMatrix();}
const btn=(t,f,cls='')=>`<button class="gb ${cls}" onclick="GAME.${f}">${t}</button>`;
const suggestLead=w=>w<.3?100:w<.6?125:w<1?150:w<1.6?175:200;
function rodStatus(r){if(r.state==='tangled')return '🧶 lenza incrociata';if(r.dismantled)return 'smontata';if(r.broken)return 'terminale rotto';if(r.held)return 'in mano';if(r.state==='hooked')return '🐟 PESCE ALLAMATO!';if(!r.bait)return 'da innescare';if(r.state==='bite')return '🔔 ABBOCCATA!';if(r.baitLeft<=0)return 'esca finita?';return r.baitLeft>20?'in pesca':'esca consumata';}
function setUI(){const p=st.phase;let h='';if(p==='wait'&&CHAIRG&&scene){const g=st.gear,k=JSON.stringify([g.baits,g.leads,g.hooks,g.swivels>0,g.snaps>0,g.starlight>0,g.term>0,g.leader>0]);if(k!==st.campKey){st.campKey=k;styleCamp();}}
  if(p==='setup'){const w=wxAt(st.gt),sug=suggestLead(w.wave),G9=st.gear;if(!(G9.leads[st.lead]>0)){const l=[sug,125,100,150,80,175,200].find(x=>G9.leads[x]>0);if(l)st.lead=l;}if(!(G9.hooks[st.hook]>0)){const h=[4,2,6,0,8].find(x=>G9.hooks[x]>0);if(h!=null)st.hook=h;}st.nRods=Math.max(1,Math.min(st.nRods,maxRods()||1));
    h=`<div class="gpanel"><b>🎣 ${SPOT.name} · ${gameDate().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</b>
      <div class="gs">Mare ${seaName(w.wave)} (${w.wave.toFixed(1).replace('.',',')} m), vento ${Math.round(w.ws)} km/h da ${windName(w.wd)}, acqua ${Math.round(w.sst)}°</div>
      <div class="grow"><span>Canne</span>${[1,2,3].map(n=>`<button class="gc ${st.nRods===n?'on':''}" ${n>maxRods()?'style="opacity:.4"':''} onclick="GAME.setN(${n})">${n}</button>`).join('')}</div>${maxRods()<1?'<div class="gs warn">Non hai una canna completa (canna, mulinello e picchetto): passa dal negozio.</div>':''}
      ${planHtml()}
      <div class="gs">Mare ${seaName(w.wave)}: consigliato piombo da ${sug} g. ${st.msg||''}</div>
      <div class="grow" style="flex-wrap:wrap;gap:4px"><span>Vestito</span>${['jeans',...(st.gear.outfits||[])].map(k=>`<button class="gc ${st.outfit===k?'on':''}" onclick="GAME.setOutfit('${k}')">${OUTF[k].n}</button>`).join('')}</div>
      ${(st.gear.hats||[]).length>1?`<div class="grow" style="gap:4px"><span>Cappello</span>${st.gear.hats.map(k=>`<button class="gc ${(st.gear.hat||'none')===k?'on':''}" onclick="GAME.setHat('${k}')">${{cap:'Berretto',bucket:'Da pescatore',beanie:'Lana',none:'Nessuno'}[k]}</button>`).join('')}</div>`:''}
      ${(st.gear.chairs||[]).length?`<div class="grow" style="gap:4px;flex-wrap:wrap"><span>Sedia</span>${['',...st.gear.chairs].map(k=>`<button class="gc ${(st.gear.chair||'chairStd')===k?'on':''}" onclick="GAME.setGearK('chair','${k}')">${{'':'Sul secchio',chairStd:'Pieghevole',chairHigh:'Alta',chairLevel:'Regolabile',chairArm:'Poltrona'}[k]}</button>`).join('')}</div>`:''}
      ${(st.gear.shelters||[]).length?`<div class="grow" style="gap:4px"><span>Riparo</span>${['',...st.gear.shelters].map(k=>`<button class="gc ${(st.gear.shelter||'')===k?'on':''}" onclick="GAME.setGearK('shelter','${k}')">${{'':'Nessuno',umbrella:'Ombrellone',bivvy:'Tenda'}[k]}</button>`).join('')}</div>`:''}
      <div class="gs">${['waders','neo'].includes(st.outfit)?'Con lo scafandro entri in acqua senza bagnarti (e senza congelarti).':'Senza scafandro, se entri in acqua ti bagni.'}</div>
      ${gearChips(true)}
      ${btn('🔧 Monta l\'attrezzatura','start(1)','big')}${btn('🎣 Già montato: vai subito in pesca','ready()')}</div>`;}
  else if(p==='mount'){const S2=st.steps,i=Math.min(st.stepI,S2.length-1),cur=S2[i];h=`<div class="gpanel slim"><div class="grow" style="justify-content:space-between"><b>🔧 Monta la postazione</b><b>${st.stepI}/${S2.length}</b></div>
    <div class="gbar dist" style="height:8px"><i style="width:${st.stepI/S2.length*100}%"></i></div>
    <div class="gs">${st.busy?'⏳ '+cur.e+' '+cur.t+'…':st.stepI<S2.length?'Prossimo: '+cur.e+' '+cur.t:''}${st.stepI+1<S2.length?`<br><small style="opacity:.7">poi: ${S2[st.stepI+1].t}</small>`:''}</div>
</div>`;}
  else if(p==='wait'){const SM=supplyMissing();h=`<div class="gpanel slim">${SM.length?shopBanner(SM):''}<div class="grods">${st.rods.map((r,i)=>`<button class="gr ${r.state==='bite'||r.state==='hooked'||r.state==='tangled'?'alert':r.bait&&r.state==='fishing'&&r.baitLeft<=0?'empty':''}" onclick="GAME.rod(${i})" ${st.busy?'disabled':''}><b>Canna ${i+1}</b><small>${r.bait?B[r.bait].n:'senza esca'}${r.dist?' · '+Math.round(r.dist)+' m':''}</small><small>${rodStatus(r)}</small></button>`).join('')}</div>
    ${st.busy?'':`<div class="grow" style="justify-content:center;flex-wrap:nowrap;gap:5px;overflow-x:auto"><button class="gc" onclick="GAME.gearView()">🎒</button><button class="gc" onclick="GAME.bagView()">🧺 ${st.bag.length}</button>${skipUp()?'<button class="gc" onclick="GAME.skip(1)">🌅 Alba</button>':'<button class="gc" onclick="GAME.skip(0)">🌇 Tramonto</button>'}${(()=>{const ni=NPCS.findIndex(a=>a.pos.distanceTo(AN.pos)<3.2);return ni>=0?`<button class="gc" style="background:#2fe0cf;color:#03282a" onclick="GAME.talk(${ni})">💬 Parla con ${NPCS[ni].per.name}</button>`:'';})()}${nearCrab()?'<button class="gc" style="background:#ffb547;color:#3a2400" onclick="GAME.crab()">🦀 Prendi il granchio</button>':''}<button class="gc" onclick="GAME.toMap()">🚗 Spot</button><button class="gc" onclick="GAME.center()" title="Guarda le canne">🎯</button>${AN.target!=='sit'?'<button class="gc" onclick="GAME.sit()">🪑 Siediti</button>':'<button class="gc" onclick="GAME.rise()">🚶 Alzati</button>'}</div>`}${st.msg?`<div class="gs" style="text-align:center">${st.msg}</div>`:''}</div>`;}
  else if(p==='atrod'){const r=st.rods[st.sel];h=`<div class="gpanel"><b>Canna ${st.sel+1}</b><div class="gs">${r.bait?B[r.bait].n+' a '+Math.round(r.dist)+' m · '+rodStatus(r):'Senza esca'}</div>
    ${r.state==='bite'?btn('⚡ FERRA!','strike()','big hot'):''}${r.state==='hooked'?btn('🌀 Prendi la canna e recupera','fightHooked()','big hot'):''}${r.state==='tangled'?btn('🧶 Recupera e districa','untangle()','big hot'):''}${r.dismantled?btn('🔧 Rimonta la canna','remount()','big'):(r.state==='tangled'?'':r.bait?btn('🌀 Recupera e cambia esca','rebait()'):btn('🪝 Innesca','rebait()','big'))+(r.state==='tangled'?'':btn('🔧 Montatura · '+r.lead+' g, amo '+'n. '+hookNum(r.hook)+', '+({lungo:'lungo 1,5 m',corto:'corto 75 cm','2ami':'2 ami'})[r.rig],'rigAt()'))+(r.bait?'':btn('🧰 Smonta la canna','dismantle()'))}${btn('🪑 Torna a sedere','back()')}</div>`;}
  else if(p==='rig'){const r=st.rods[st.sel],w=wxAt(st.gt);h=`<div class="gpanel"><b>🔧 Montatura della canna ${st.sel+1}</b>${r.broken?'<div class="gs warn">La lenza si è rotta: rifai il terminale (perdi piombo e amo).</div>':''}
    ${st.gear.rods.length>1?`<div class="grow" style="flex-wrap:wrap;gap:4px"><span>Canna</span>${st.gear.rods.map(id=>`<button class="gc ${r.rodId===id?'on':''}" onclick="GAME.setRig('rodId','${id}')">${ROD[id].n}</button>`).join('')}</div>`:''}
    ${st.gear.braid?`<div class="grow" style="gap:4px"><span>Lenza madre</span>${[['nylon','Nylon'],['braid','Trecciato']].map(([k,n])=>`<button class="gc ${(r.lineT||'nylon')===k?'on':''}" onclick="GAME.setRig('lineT','${k}')">${n}</button>`).join('')}</div>`:''}
    ${st.gear.reels.length>1?`<div class="grow" style="flex-wrap:wrap;gap:4px"><span>Mulinello</span>${st.gear.reels.map(id=>`<button class="gc ${r.reelId===id?'on':''}" onclick="GAME.setRig('reelId','${id}')">${reelN(id)}</button>`).join('')}</div>`:''}
    <div class="grow"><span>Piombo</span>${[80,100,125,150,175,200].map(g=>`<button class="gc ${r.lead===g?'on':''}" ${st.gear.leads[g]>0||r.lead===g?'':'disabled style="opacity:.4"'} onclick="GAME.setRig('lead',${g})">${g} g <small style="opacity:.7">${st.gear.leads[g]||0}</small></button>`).join('')}</div>${(st.gear.grip[r.lead]>0||(st.gear.ogiva||{})[r.lead]>0)?`<div class="grow" style="gap:4px"><span>Forma</span>${[['piramidale','🔺 Piramidale'],['ogiva','💧 Ogiva'],['ragno','🕷️ A ragno']].filter(([k])=>leadOk(r.lead,k)).map(([k,n])=>`<button class="gc ${(r.leadT||'piramidale')===k?'on':''}" onclick="GAME.setRig('leadT','${k}')">${n}</button>`).join('')}</div>`:''}
    <div class="gs">Con mare ${seaName(w.wave)} servono almeno ${suggestLead(w.wave)} g, sennò la corrente trascina il piombo verso riva.</div>
    <div class="grow"><span>Amo</span>${[0,2,4,6,8].map(k=>`<button class="gc ${hookNum(r.hook)===k?'on':''}" ${st.gear.hooks[k]>0||hookNum(r.hook)===k?'':'disabled style="opacity:.4"'} onclick="GAME.setRig('hook',${k})">${k} <small style="opacity:.7">${st.gear.hooks[k]||0}</small></button>`).join('')}</div>${(st.gear.forged||{})[hookNum(r.hook)]>0?`<div class="grow" style="gap:4px"><span>Tipo amo</span>${[['aberdeen','Aberdeen (filo sottile)'],['forgiato','Forgiato (robusto)']].map(([k,n])=>`<button class="gc ${(r.hookT||'aberdeen')===k?'on':''}" onclick="GAME.setRig('hookT','${k}')">${n}</button>`).join('')}</div>`:''}
    <div class="gs">⚙️ Canna e mulinello: ${['di base','buoni','ottimi','da gara'][Math.min(3,Math.floor(gearTier(r).all*4))]} · lancio fino a ${Math.round(150+gearTier(r).all*35)} m, recupero +${Math.round(gearTier(r).reel*60)}%, tenuta +${Math.round(gearTier(r).all*100)}%</div>
    <div class="gs">${(r.leadT==='ogiva'?'Ogiva: vola più lontano (+5%) ma rotola con la corrente. ':r.leadT==='ragno'?'A ragno: resta fermo anche con la corrente forte. ':'')+(r.hookT==='forgiato'?'Amo forgiato: non si apre con i pesci grossi, meno abboccate dei piccoli.':'')}</div>
    <div class="grow"><span>Terminale</span>${[['lungo','lungo 1,5 m'],['corto','corto 75 cm'],['2ami','trave a 2 ami']].map(([k,n])=>`<button class="gc ${r.rig===k?'on':''}" onclick="GAME.setRig('rig','${k}')">${n}</button>`).join('')}</div>
    <div class="gs">Lungo: più naturale con mare calmo (orate, mormore). Corto: lancia meglio e regge il mare mosso. Due ami: più abboccate, lancio più corto.</div>${btn(r.broken?'🔧 Rifai il terminale':'✅ Fatto','rigDone()','big')}${st.needShop?`<button class="gb gshop-b" onclick="GAME.goShop()">🛒 Vai al negozio di pesca</button>`:''}</div>`;}
  else if(p==='snag'){const sn=st.snag;h=`<div class="gpanel"><b>${sn.kind==='scogli'?'🪨 Incagliato negli scogli!':sn.kind==='sabbia'?'⏳ Piombo insabbiato!':'⚠️ Incagliato!'}</b><div class="gs">${sn.msg||'Il piombo si è incastrato sul fondo.'}</div>${btn('💪 Tira forte','snagPull()','big')}${btn('↔️ Spostati e cambia angolo','snagMove()')}${btn('🏊 Entra in acqua e nuota fino all\'incaglio','snagSwim()')}</div>`;}
  else if(p==='talk'){const tk=st.talk,a=NPCS[tk.i];h=`<div class="gpanel"><b>💬 ${a.per.name} · ${a.per.age} anni, ${a.per.town}</b><div class="gs" style="font-size:15.5px;background:rgba(255,255,255,.08);border-radius:12px;padding:8px 10px">«${escH(tk.txt)}»</div>
    <div class="gtalk">${Q.map(([k,n])=>`<button class="gc" onclick="GAME.ask('${k}')">${n}</button>`).join('')}</div></div>`;}
  else if(p==='pilot'){const v=VEH.obj,r=st.rods[st.sel];h=`<div class="gpanel slim"><div class="grow" style="justify-content:space-between"><b>${VEH.type==='drone'?'🛸 Guida il drone':'🚤 Guida il barchino'}</b><b id="gvd">—</b></div>
    <div class="gs">Joystick: su verso il largo, giù verso riva, destra e sinistra lungo la costa. Fermati sul punto e sgancia.</div><button class="gb big" id="gdrop" onclick="GAME.drop()" disabled>🎯 Fermati per sganciare</button></div>`;}
  else if(p==='bait')h=`<div class="gpanel"><b>🪝 Innesca la canna ${st.sel+1}</b>${shopBanner(supplyMissing().filter(x=>x==='le esche'))}<div class="gbaits">${BAITS.filter(b=>!b.lim||st.inv[b.k]>0).map(b=>{const n=b.lim?st.inv[b.k]:(st.gear.baits[b.k]||0);return `<button class="gbt" ${n>0?'':'disabled style="opacity:.45"'} onclick="GAME.bait('${b.k}')"><span>${b.e}</span><b>${b.n} (${n})</b><small>${n>0?b.d:'Finita: comprala al negozio'}</small></button>`;}).join('')}</div>${btn('🔧 Cambia montatura prima','rig()')}</div>`;
  else if(p==='cast'&&st.castMode!=='mano'){const mx=st.castMode==='drone'?400:300;st.castDist=Math.min(st.castDist,mx);h=`<div class="gpanel"><b>${st.castMode==='drone'?'🛸 Drone':'🚤 Barchino elettrico'} · ${B[st.rods[st.sel].bait].n}</b>
    <div class="grow">${[['mano','🎣 A mano'],['barchino','🚤 Barchino'],['drone','🛸 Drone']].map(([k,n])=>`<button class="gc ${st.castMode===k?'on':''}" onclick="GAME.mode('${k}')">${n}</button>`).join('')}</div>
    <div class="gs">${st.castMode==='drone'?'Lo guidi tu con il joystick (su = verso il largo) fino a 400 m, ti fermi sul punto e sganci esca e piombo. Poi torna da solo.':'Lo guidi tu con il joystick (su = verso il largo) fino a 300 m, ti fermi sul punto e sganci dalla tramoggia. Poi torna da solo. Con mare molto mosso rischia di ribaltarsi nei frangenti.'}</div>${btn('🚀 Parti','deliver()','big')}</div>`;}
  else if(p==='cast')h=`<div class="gpanel"><b>🎯 Lancia · ${B[st.rods[st.sel].bait].n}</b><div class="grow">${[['mano','🎣 A mano'],['barchino','🚤 Barchino'],['drone','🛸 Drone']].map(([k,n])=>`<button class="gc ${st.castMode===k?'on':''}" onclick="GAME.mode('${k}')">${n}</button>`).join('')}</div><div class="grow" style="flex-wrap:nowrap;gap:5px">${Object.entries(CSTY).map(([k,v])=>`<button class="gc ${st.castStyle===k?'on':''}" onclick="GAME.cstyle('${k}')">${v.n}</button>`).join('')}</div><div class="gs">${cSty().d}</div><div class="gs">Tieni premuto per caricare, rilascia nella zona verde. ${(()=>{const w=wxAt(st.gt),hp=windHelp(w.wd);return w.ws>12?(hp>.3?'Vento da terra: ti aiuta.':hp<-.3?'Vento dal mare: lancerai più corto.':'Vento laterale.'):'';})()}</div><div class="gpow"><i id="gpw"></i><s style="left:${cSty().g[0]*100}%;width:${(cSty().g[1]-cSty().g[0])*100}%"></s></div><button class="gb big" id="gcastb">🎣 Carica e lancia · ${cSty().n}</button></div>`;
  else if(p==='fight')h=`<div class="gpanel"><b id="gfti">Combattimento</b><div class="gbar"><i id="gten"></i><span>tensione</span></div><div class="gbar dist"><i id="gdis"></i><span id="gdt">distanza</span></div>
    <div class="grow"><span>Frizione</span><input type="range" min="1" max="10" value="${st.fight?.drag||5}" oninput="GAME.drag(this.value)" style="flex:1"></div><div class="gs" id="galert" style="color:#ffb547;font-weight:700;min-height:0"></div><button class="gb big" id="greel">🌀 Tieni premuto per recuperare</button></div>`;
  else if(p==='catch'){const c=st.catchShow;h=`<div class="gpanel">${c.fish?'<div class="gfish"><img id="gfi" alt="" style="display:none;width:100%;max-height:22vh;object-fit:cover;border-radius:14px"><canvas id="gfc" width="600" height="260"></canvas><div id="gfcr" style="font-size:10.5px;opacity:.55;text-align:right"></div></div>':''}
    <b style="font-size:22px">${c.fish?escH(c.sp.n):c.txt}</b>${c.fish?`<div class="gs" style="font-size:17px">${c.crab?'larghezza '+c.l+' cm':c.l+' cm'} · ${c.w<1?Math.round(c.w*1000)+' g':c.w.toFixed(2).replace('.',',')+' kg'}${c.rec?' · 🏆 record!':''}</div>
    ${c.sp.legal&&c.l<c.sp.legal?`<div class="gs warn">⚠️ Sotto misura (minimo ${c.sp.legal} cm): va rilasciato.</div>`:''}${c.crab?'<div class="gs">Specie invasiva: non va rimessa in mare.</div>':''}`:`<div class="gs">${c.why||''}</div>`}
    <div class="grow" style="justify-content:center">${c.fish?(c.crab?btn('🪣 Nel secchio','keep()','big'):(c.sp.legal&&c.l<c.sp.legal?btn('💚 Rilascia','release()','big'):btn('💚 Rilascia','release()')+btn('🧺 Tieni','keep()','big'))):(c.left?btn('↩ Rimetti sul picchetto','putBack()'):'')+btn('🪝 Innesca di nuovo','rebait()','big')}</div></div>`;}
  else if(p==='bag')h=`<div class="gpanel"><b>🧺 Il tuo carniere</b><div class="gs">Oggi: ${st.bag.length} pesci · ${st.bag.reduce((a,c)=>a+c.w,0).toFixed(2).replace('.',',')} kg · Totale: ${st.total.n} pesci, ${st.total.pts} punti</div>
    <div class="glist">${st.bag.slice().reverse().map(c=>`<div>${c.rel?'💚':'🧺'} <b>${escH(c.n)}</b> ${c.l} cm · ${c.w<1?Math.round(c.w*1000)+' g':c.w.toFixed(2).replace('.',',')+' kg'} <small>${new Date(c.t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})} · ${escH(c.bait)}</small></div>`).join('')||'<div class="gs">Ancora niente: pazienza, è surfcasting!</div>'}</div>
    <div class="gs">Record: ${Object.entries(st.best).map(([k,v])=>`${escH(k)} ${v.toFixed(2).replace('.',',')} kg`).join(' · ')||'nessuno'}</div>${btn('↩ Torna alle canne','toWait()','big')}</div>`;
  else if(p==='rtalk')h=rtalkHtml();
  else if(p==='gear')h=`<div class="gpanel"><div class="grow" style="justify-content:space-between"><b>🎒 La tua attrezzatura</b>${btn('↩ Indietro','gearBack()')}</div>${gearChips()}<div class="gs">Esche: ${BAITS.filter(b=>!b.lim).map(b=>b.n+' '+(st.gear.baits[b.k]||0)).join(' · ')}</div><div class="gs">Ami: ${[0,2,4,6,8].map(m=>'n.'+m+' '+(st.gear.hooks[m]||0)).join(' · ')} · Piombi: ${[80,100,125,150,175,200].map(w=>w+' g '+(st.gear.leads[w]||0)).join(' · ')} · girelle ${st.gear.swivels} · moschettoni ${st.gear.snaps}</div><div class="gs">La canna e il mulinello nuovi li monti alla prossima postazione (o da «Cambia spot»).</div></div>`;
  else if(p==='busy')h=st.msg?`<div class="gpanel slim"><div class="gs" style="text-align:center">${st.msg}</div></div>`:'';
  ui.innerHTML=h;
  const cb=document.getElementById('gcastb');if(cb){cb.onpointerdown=e=>{e.preventDefault();ac();st.cast={p:0,dir:1,on:true};castAnimStart('load');};const rel=()=>{if(st.cast?.on)doCast();};cb.onpointerup=rel;cb.onpointerleave=rel;}
  const rb=document.getElementById('greel');if(rb){const on=e=>{e.preventDefault();if(st.fight)st.fight.reel=true;},off=()=>{if(st.fight)st.fight.reel=false;};rb.onpointerdown=on;rb.onpointerup=off;rb.onpointerleave=off;rb.onpointercancel=off;}
  if(p==='catch')setTimeout(drawFishCard,0);
  const jb=root?.querySelector('#gjoy');if(jb&&!(p==='wait'&&!st.busy)&&p!=='pilot')jb.style.display='none';
}
G.setN=n=>{if(n<=maxRods()){st.nRods=n;planFix();}if(n>maxRods()){st.msg=`🎣 Per ${n} canne servono ${n} canne, ${n} mulinelli e ${n} posti sul picchetto: passa dal negozio.`;setUI();return;}st.nRods=n;LSS('nrods',n);setUI();};G.setLead=g=>{st.lead=g;LSS('lead',g);setUI();};G.setHook=k=>{st.hook=k;LSS('hook',k);setUI();};
G.setSpeed=s=>{st.speed=s;LSS('speed',s);const b=document.getElementById('gspd');if(b)b.textContent='⏩ '+s+'x';if(st.phase==='wait')setUI();};G.bagView=()=>{st.phase='bag';setUI();};G.toWait=()=>{st.phase='wait';setUI();};G.drag=v=>{if(st.fight)st.fight.drag=+v;};
G.setOutfit=k=>{st.outfit=k;LSS('outfit',k);setUI();};G.setHat=k=>{st.gear.hat=k;gearSave();setUI();};G.setGearK=(k,v)=>{st.gear[k]=v;gearSave();if(scene&&CHAIRG){styleCamp();}setUI();};
const OUTF={jeans:{n:'Jeans e maglia',suit:'casual',j:'#8a8f94',j2:'#7a7f84',p:'#355a8a'},tracksuit:{n:'Tuta',suit:'tracksuit',j:'#2f5544',j2:'#264638',p:'#2c3445'},waders:{n:'Scafandro',suit:'waders',j:'#2f5544',j2:'#264638',p:'#2c3445'},jacket:{n:'Giacca impermeabile',suit:'jacket',j:'#2f5544',j2:'#264638',p:'#2c3445'},neo:{n:'Neoprene',suit:'waders',rubber:'#16191d',j:'#16191d',j2:'#2f6fb5',p:'#16191d'},thermo:{n:'Giacca termica',suit:'jacket',j:'#b8352a',j2:'#7a2018',p:'#2b2f36'},wind:{n:'Tuta antivento',suit:'tracksuit',j:'#1d3557',j2:'#14243b',p:'#1d3557'},float:{n:'Galleggiante',suit:'jacket',j:'#e67e22',j2:'#c0392b',p:'#2b2f36'}};
function setPlayerLook(){const old=AN.obj,ph=myPhoto(),O=OUTF[st.outfit]||OUTF.jeans,g=st.gear;const n=makeAngler({...O,hat:g.hat||'none',boots:O.suit==='waders'?undefined:g.boots?'tall':'shoes',beard:ph?'none':'stubble',photo:ph,c:'#b8352a'});
  n.position.copy(old.position);n.rotation.copy(old.rotation);scene.remove(old);scene.add(n);AN.obj=n;
  AN.obj.userData.J.head.add(headLamp);const lt=new T.Object3D();lt.position.set(0,-1.2,-6);AN.obj.userData.J.head.add(lt);headLamp.target=lt;}
function buildSteps(){const S2=[],q=st.auto?.55:1,sp=st.auto?3.4:2.4;
  S2.push({e:'🚶',t:'Scendi in spiaggia con l\'attrezzatura',f:async()=>{await walkTo(CHAIR.x+.6,CHAIR.z+.9,sp);AN.faceTo=0;}});
  S2.push({e:'🧺',t:'Stendi il telo e appoggia l\'attrezzatura',f:async()=>{pose('bend');await sleep(1.2*q);MYG.forEach(o=>o.visible=true);click();pose('stand');}});
  S2.push({e:'🪑',t:st.gear.chair?'Apri la sedia':'Capovolgi il secchio per sederti',f:async()=>{pose('bend');await sleep(.8*q);CHAIRG.visible=!!st.gear.chair;click();pose('stand');}});
  st.rods.forEach((r,i)=>S2.push({e:'📍',t:`Pianta il picchetto ${i+1}`,f:async()=>{await walkTo(r.x+.5,ROD_Z+.9,sp);AN.faceTo=0;pose('bend');await sleep(1*q);burst(new T.Vector3(r.x,.1,ROD_Z),.25);r.spike.visible=true;click();pose('stand');}}));
  st.rods.forEach((r,i)=>S2.push({e:'🎣',t:`Monta la canna ${i+1}: mulinello, anelli e terminale`,f:async()=>{await walkTo(CHAIR.x+1.4,CHAIR.z+.4,sp);pose('bend');await sleep(1.8*q);r.obj.visible=true;r.held=true;AN.holding=i;pose('hold');await sleep(.3);
    await walkTo(r.x+.55,ROD_Z+1.3,sp);AN.faceTo=0;await putRod(i);}}));
  S2.push({e:'⚓',t:'Prepara piombi e terminali di scorta',f:async()=>{await walkTo(CHAIR.x+1,CHAIR.z-.3,sp);pose('bend');await sleep(1.2*q);pose('stand');}});
  if(night()>.3)S2.push({e:'🏮',t:'Accendi la lanterna e le luci chimiche',f:async()=>{pose('bend');await sleep(.7*q);click();pose('stand');}});
  return S2;}
G.doStep=()=>seq(async()=>{const S2=st.steps;if(st.stepI>=S2.length)return;setUI();await S2[st.stepI].f();st.stepI++;if(st.stepI>=S2.length)return mountDone();setUI();});
G.autoSteps=()=>seq(async()=>{st.auto=true;const S2=st.steps;while(st.stepI<S2.length){setUI();await S2[st.stepI].f();st.stepI++;}mountDone();});
function mountDone(){st.phase='wait';st.msg='';setUI();}
G.start=auto=>{if(maxRods()<1){st.msg='Non hai una canna completa: passa dal negozio.';setUI();return;}st.nRods=Math.min(st.nRods,maxRods());setPlayerLook();setupRods();rigFromBag();st.rods.forEach(r=>{placeRodOnSpike(r);r.spike.visible=false;r.obj.visible=false;});st.auto=!!auto;st.steps=buildSteps();st.stepI=0;st.phase='mount';setUI();if(auto)G.autoSteps();};
G.ready=()=>{if(maxRods()<1){st.msg='Non hai una canna completa: passa dal negozio.';setUI();return;}MYG.forEach(o=>o.visible=true);if(CHAIRG)CHAIRG.visible=!!st.gear.chair;AN.pos.set(CHAIR.x,CHAIR.z*.035,CHAIR.z-.05);AN.target='sit';AN.pose=JSON.parse(JSON.stringify(POSES.sit));AN.rotY=0;AN.faceTo=0;G.startOld();};
G.startOld=()=>{if(maxRods()<1){st.msg='Non hai una canna completa: passa dal negozio.';setUI();return;}st.nRods=Math.min(st.nRods,maxRods());setPlayerLook();setupRods();rigFromBag();st.rods.forEach(placeRodOnSpike);st.phase='wait';st.msg='';setUI();};

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
G.rebait=()=>seq(async()=>{endShowFish();const r=st.rods[st.sel];st.phase='busy';st.msg=r.dist?'🌀 Recupera la lenza…':'';setUI();
  if(!r.held)await pickRod(st.sel);
  if(r.dist>0){pose('reel');const d0=r.dist,K=riskOf(),u0=Math.random(),far=r.dist>20;if(r.lineT==='braid')K.brk*=.5;
    const kind=!far?null:u0<K.snag?(K.rocks>.3?'scogli':'fondo'):u0<K.snag+K.sand?'sabbia':u0<K.snag+K.sand+K.brk?'rottura':u0<K.snag+K.sand+K.brk+K.weed?'alghe':null,snagAt=kind?rnd(.2,.8):2;
    for(let t=0;t<1;t+=.05){if(t>=snagAt){AN.reelSpin=0;
      if(kind==='rottura'){vib([80,40,200]);click();r.broken=true;r.bait=null;r.dist=0;r.sinker.visible=false;r.state='idle';pose('hold');st.msg=K.rocks>.3?'💥 La lenza ha sfregato sugli scogli e si è spezzata: piombo perso, rifai il terminale.':'💥 Con le onde la lenza si è spezzata durante il recupero: rifai il terminale.';st.phase='rig';setUI();return;}
      if(kind==='alghe'){st.msg='🌿 Hai raccolto un ciuffo di alghe sulla lenza: il recupero è pesante.';setUI();for(let k=0;k<1;k+=.04){r.dist=Math.max(0,r.dist-d0*.03);AN.reelSpin=.5;await sleep(.12);}r.dist=0;AN.reelSpin=0;st.msg='🌿 Lenza ripulita dalle alghe.';afterRecover(r);return;}
      st.snag={r,stage:'rebait',at:t,kind,msg:kind==='scogli'?'Il piombo si è infilato tra gli scogli.':kind==='sabbia'?'Il piombo si è insabbiato: le onde lo hanno coperto di sabbia.':'Il piombo si è incastrato sul fondo.'};st.phase='snag';vib([120,60,120]);setUI();return;}r.dist=d0*(1-t);AN.reelSpin=1;await sleep(.07);}r.dist=0;AN.reelSpin=0;}
  afterRecover(r);});
function afterRecover(r){r.bait=null;r.state='idle';r.bitePlan=null;r.sinker.visible=false;r.dist=0;r.driftMsg=0;pose('bend');st.phase=r.broken?'rig':'bait';setUI();}
G.snagPull=()=>seq(async()=>{const sn=st.snag;if(!sn)return;st.phase='busy';setUI();pose('strike');AN.reelSpin=1;vib([200]);await sleep(1);AN.reelSpin=0;
  const u=Math.random()*(sn.kind==='scogli'?1.35:sn.kind==='sabbia'?.75:1);if(u<.45){st.snag=null;st.msg=sn.kind==='sabbia'?'Tirando forte il piombo è uscito dalla sabbia.':'Liberato! Il piombo si è sbloccato.';if(sn.stage==='fight'){st.fight.snag=false;st.phase='fight';pose('reel');setUI();return;}pose('reel');for(let t=0;t<1;t+=.08){sn.r.dist*=.9;AN.reelSpin=1;await sleep(.06);}AN.reelSpin=0;afterRecover(sn.r);return;}
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
G.setRig=(k,v)=>{const r=st.rods[st.sel],g=st.gear;if((k==='rodId'||k==='reelId'||k==='lineT')&&r[k]!==v){const tot=k==='rodId'?g.rodCnt?.[v]||0:k==='reelId'?g.reelCnt?.[v]||0:v==='braid'?g.braidN||(g.braid?1:0):99,used=st.rods.filter(o=>o!==r&&o[k]===v).length;if(used>=tot){st.msg='Non ne hai altri liberi: sono già montati sulle altre canne.';setUI();return;}}if(!r.broken&&k==='lead'&&v!==r.lead){if(!(g.leads[v]>0))return;g.leads[r.lead]=(g.leads[r.lead]||0)+1;g.leads[v]--;gearSave();}if(!r.broken&&k==='hook'&&v!==hookNum(r.hook)){if(!(g.hooks[v]>0))return;const o=hookNum(r.hook);g.hooks[o]=(g.hooks[o]||0)+1;g.hooks[v]--;gearSave();}r[k]=v;if(k==='leadT')r.grip=v==='ragno';if(k==='rodId'||k==='reelId')skinRod(r.obj,r.rodId,r.reelId);if(k==='lead'&&!leadOk(r.lead,r.leadT)){r.leadT='piramidale';r.grip=false;}if(k==='hook'&&r.hookT==='forgiato'&&!((st.gear.forged||{})[v]>0))r.hookT='aberdeen';click();setUI();};
function leadOk(w,t){const g=st.gear;return t==='ragno'?g.grip[w]>0:t==='ogiva'?(g.ogiva||{})[w]>0:true;}
G.rigDone=()=>seq(async()=>{const r=st.rods[st.sel],g=st.gear;if(r.broken){const h=hookNum(r.hook),miss=[!(g.leads[r.lead]>0)&&'piombo da '+r.lead+' g',!(g.hooks[h]>0)&&'amo n. '+h,!(g.swivels>0)&&'girelle',!(g.snaps>0)&&'moschettoni',!(g.term>0)&&'filo per terminali'].filter(Boolean);
    if(miss.length){st.msg='🧰 Ti mancano: '+miss.join(', ')+'. Cambia misura o vai al negozio.';st.needShop=true;setUI();return;}g.leads[r.lead]--;g.hooks[h]--;g.swivels--;g.snaps--;g.term--;st.needShop=false;if(r.leadT==='ragno'&&g.grip[r.lead]>0)g.grip[r.lead]--;if(r.leadT==='ogiva'&&g.ogiva?.[r.lead]>0)g.ogiva[r.lead]--;if(r.hookT==='forgiato'&&g.forged?.[h]>0)g.forged[h]--;if(!leadOk(r.lead,r.leadT)){r.leadT='piramidale';r.grip=false;}if(r.hookT==='forgiato'&&!(g.forged?.[h]>0))r.hookT='aberdeen';gearSave();}st.phase='busy';st.msg=r.broken?'🔧 Rifà il terminale…':'🔧 Cambia la montatura…';setUI();pose('bend');await sleep(r.broken?2.2:1.4);r.broken=false;pose('hold');st.msg='';st.phase='bait';setUI();});
G.bait=k=>{const r=st.rods[st.sel],g=st.gear;if(B[k].lim){if(!(st.inv[k]>0))return;st.inv[k]--;}else{if(!(g.baits[k]>0))return;if(['bibi','koreano','arenicola','americano'].includes(k)&&!g.needle){st.msg='🪡 Per innescare i vermi serve l\'ago da innesco: lo trovi al negozio.';setUI();return;}g.baits[k]--;gearSave();}r.bait=k;r.baitLeft=B[k].life*(k==='cozza'&&hookCat(st.hook)==='piccolo'?1.2:1)*(g.elastic&&['cozza','bibi','arenicola','sarda','gambero'].includes(k)?1.3:1);click();pose('hold');st.phase='cast';setUI();};
// stili di lancio a mano: zona verde, gittata massima, precisione e rischio di rottura del filo
const CSTY={above:{n:'Above',it:'dall\'alto',g:[.76,.92],max:115,spr:2,crack:0,load:'castBack',fwd:'castFwd',d:'Dall\'alto sopra la testa: facile e preciso, fino a 115 m.'},
  side:{n:'Side',it:'laterale',g:[.79,.92],max:125,spr:7,crack:0,load:'castSide',fwd:'castSideFwd',d:'Laterale, canna di fianco: più lungo ma meno preciso, fino a 125 m.'},
  ground:{n:'Ground',it:'da terra',g:[.81,.91],max:140,spr:4,crack:.25,load:'castGround',fwd:'castFwd',d:'Off the ground: piombo appoggiato a terra dietro, busto girato. Fino a 140 m, zona verde più stretta.'},
  pendulum:{n:'Pendulum',it:'pendolare',g:[.84,.9],max:150,spr:4,crack:.5,load:'castPend',fwd:'castFwd',d:'Pendolare: il piombo oscilla e parte dall\'alto. Il più lungo, fino a 150 m, ma difficile: se esageri rischi il crack-off.'}};
const cSty=()=>CSTY[st.castStyle]||CSTY.above;
// fasi di ogni lancio: caricamento (mentre tieni premuto) e uscita (dopo il rilascio); hit = momento in cui parte il piombo
const CSEQ={above:{drop:1.2,load:[['castBack',.5]],fire:[['castOverTop',.13],['castFwd',.11],['castFollow',.7]],hit:.2},
  side:{drop:1.6,load:[['castSide',.6]],fire:[['sideSweep',.13],['castOverTop',.11],['castFwd',.1],['castFollow',.7]],hit:.3},
  ground:{drop:2,load:[['otgAddress',.7]],fire:[['otgTurn',.16],['castOverTop',.12],['castFwd',.1],['castFollow',.7]],hit:.34},
  pendulum:{drop:1.5,load:[['pendStart',.45],['pendOut',.45],['castPend',.5]],fire:[['otgTurn',.13],['castOverTop',.11],['castFwd',.1],['castFollow',.7]],hit:.3}};
function castAnimStart(phase){st.castCam=true;const q=CSEQ[st.castStyle]||CSEQ.above;st.castAnim={q,phase,i:0,t:0};AN.target=q[phase][0][0];
  const r=st.rods[st.sel];if(phase==='load'&&r){const tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const p=tip.clone();p.y-=q.drop;
    if(st.castStyle==='ground'){const back=new T.Vector3(Math.sin(AN.rotY)*1.6+1.2,0,Math.cos(AN.rotY)*1.6);p.set(tip.x+back.x,.05,tip.z+back.z);}
    st.castLead={r,p,q:p.clone(),drop:q.drop};r.sinker.visible=true;r.sinker.position.copy(p);}}
function updCastAnim(dt){const A=st.castAnim;if(A){const seq=A.q[A.phase];A.t+=dt;while(A.i<seq.length-1&&A.t>=seq[A.i][1]){A.t-=seq[A.i][1];A.i++;AN.target=seq[A.i][0];
    if(A.phase==='load'&&seq[A.i][0]==='pendOut'&&st.castLead){st.castLead.q.z+=.09;}}
    if(A.phase==='fire'&&A.i===seq.length-1&&A.t>=seq[A.i][1])st.castAnim=null;}
  // piombo: pendolo appeso alla cima, che si appoggia sulla sabbia
  const L=st.castLead;if(!L)return;const r=L.r,tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const h=Math.min(dt,.033);
  const v=L.p.clone().sub(L.q).multiplyScalar(.985);L.q.copy(L.p);L.p.add(v);L.p.y-=9.8*h*h;
  const d=L.p.clone().sub(tip);if(d.length()>L.drop)L.p.copy(tip).add(d.setLength(L.drop));
  const gy=sandY(L.p.z)+.04;if(L.p.y<gy){L.p.y=gy;L.q.x=lerp(L.q.x,L.p.x,.3);L.q.z=lerp(L.q.z,L.p.z,.3);}
  r.sinker.position.copy(L.p);}
G.cstyle=k=>{st.castStyle=k;LSS('cstyle',k);setUI();};
// probabilità degli imprevisti: scogli, sabbia smossa dalle onde, alghe, lenza che si spezza
function riskOf(){const w=wxAt(st.gt),rk=SPOT.rocks||0,wv=w.wave||0;return {rocks:rk,wave:wv,snag:.05+.1*rk+.035*wv,weed:.05+(wv>1?.06:0)+(SPOT.veg||0)*.02,brk:.015+.04*rk+(wv>1.5?.04:0),sand:wv>.8?.05+.03*wv:.02};}
function doCast(){const c=st.cast;c.on=false;const r=st.rods[st.sel],w=wxAt(st.gt),S=cSty();
  const p=c.p,[g0,g1]=S.g,gm=(g0+g1)/2,green=p>=g0&&p<=g1,q=green?1:p<g0?p/g0*.9:.7;
  // troppa forza con ground e pendulum: il filo si rompe al lancio (crack-off) e il piombo vola via
  const rnd2=Math.random(),lk=(st.gear.leader>0?.3:1)*(r.lineT==='braid'?.5:1);if((S.crack&&p>g1+.03&&rnd2<S.crack*lk)||rnd2<(.02+((r.lead||st.lead)>175?.015:0))*lk){if(st.gear.leader>0){st.gear.leader--;gearSave();}st.cast=null;seq(async()=>{st.phase='busy';setUI();castAnimStart('fire');await sleep(.3);whoosh();st.castLead=null;await sleep(.4);st.castAnim=null;st.castCam=false;CAM.cl=null;click();vib([60,30,60]);r.broken=true;r.bait=null;r.state='idle';r.dist=0;r.sinker.visible=false;pose('hold');
    st.msg=p>g1+.03?'💥 Crack-off! Troppa forza: il filo si è rotto al lancio e il piombo è volato via. Rifai il terminale.':'💥 La lenza si è spezzata al lancio (nodo indebolito): piombo perso, rifai il terminale.';st.phase='rig';setUI();});return;}
  // zona verde: fino al massimo dello stile; con poca potenza anche solo 10 m; oltre la zona verde il lancio si sporca
  const GR=st.gear,M=S.max*(ROD[r.rodId||GR.rod]?.mul||1)*(REELS[r.reelId||GR.reel]?.cast||1)*(1+gearTier(r).all*.08)*(1+(.25-GR.line)*.8)*(r.leadT==='ogiva'?1.05:1),base=green?M*(1-Math.abs(p-gm)*.45):p<g0?lerp(10,M*.92,Math.pow(p/g0,1.15)):lerp(M*.92,M*.4,(p-g1)/(1-g1));
  const leadF=clamp(1.15-((r.lead||st.lead)-100)/400,.85,1.1)*(r.rig==='2ami'?.93:r.rig==='corto'?1.04:1),baitF=r.bait==='cefalotto'?.55:r.bait==='sarda'||r.bait==='seppia'?.85:1,wind=1+windHelp(w.wd)*clamp(w.ws/60,0,.35);
  const dist=clamp(base*leadF*baitF*wind+rnd(-3,3),8,150+gearTier(r).all*35);st.cast=null;
  r.star=night()>.25?(st.gear.starlight>0?(st.gear.starlight--,gearSave(),true):false):r.star;
  seq(async()=>{st.phase='busy';st.msg='';setUI();castAnimStart('fire');const H=(CSEQ[st.castStyle]||CSEQ.above).hit;await sleep(H*.6);whoosh();await sleep(H*.4);const L0=st.castLead;st.castLead=null;
    // il piombo vola: parabola dalla cima al punto d'arrivo
    const tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);if(L0)tip.copy(L0.p);const drift=(Math.sin((w.wd-FACE)*R))*w.ws/40*3;const end=new T.Vector3(r.x+drift+rnd(-S.spr,S.spr)+(st.castStyle==='side'?S.spr*.5:0),0,-dist);
    r.flight={a:tip.clone(),b:end,t:0,dur:1.1+dist/120,low:st.castStyle==='side'};r.sinker.visible=true;r.dist=0.01;r.state='flying';
    await sleep(r.flight.dur);splash();burst(end,1);r.flight=null;setTimeout(()=>{st.castCam=false;CAM.cl=null;},700);r.dist=dist;r.sx=end.x;r.sz=end.z;r.state='fishing';r.landT=st.gt;
    st.msg=(q>=1?`Lancio ${S.n} perfetto: ${Math.round(dist)} m!`:q>.8?`Buon lancio ${S.n}: ${Math.round(dist)} m`:`Lancio ${S.n} corto: ${Math.round(dist)} m`);checkTangle(r);setUI();
    st.castAnim=null;pose('hold');await sleep(.6);await putRod(st.sel);await stepBack(st.sel);st.phase='wait';if(r.state!=='tangled')st.msg='Tocca la sedia per sederti, o un\'altra canna per andarci.';setUI();});}

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
  let ok=p.sp&&!p.steal&&(strong?.85:.3)>Math.random();if(p.sp&&hookCat(st.hook)==='grande'&&p.sp.w[1]<.4)ok=ok&&Math.random()<.5;
  if(!ok){r.state='fishing';const lost=p.steal||Math.random()<.5;if(lost)r.baitLeft=0;pose('hold');await sleep(.4);
    showCatch({fish:false,txt:strong?'Mancato!':'Troppo presto',why:strong?'Hai ferrato ma il pesce non era allamato.':'Erano solo tocche: aspetta che la cima si pieghi decisa prima di ferrare.',left:!lost});return;}
  const sp=p.sp,w=sizeOf(sp);st.fight={r,sp,w,len:lenOf(sp,w),dist:r.dist,ten:.3,reel:false,drag:5,run:0,slack:0,t:0,pow:sp.pow*(0.6+Math.min(1.6,w/sp.w[1])*.45)};
  r.state='fight';pose('reel');st.phase='fight';vib([160,60,90]);setUI();});
function updFight(dt){const f=st.fight;if(!f||st.phase!=='fight')return;f.t+=dt;const r=f.r,w=wxAt(st.gt);
  {const K=riskOf();if(f.dist<14&&(K.wave>1.2||K.rocks>.3)&&f.ten>.7&&Math.random()<dt*(.004*K.wave+.01*K.rocks)*(r.lineT==='braid'?.5:1))return endFight(false,K.rocks>.3?'La lenza ha toccato gli scogli e si è spezzata!':'Nei frangenti la lenza ha preso un colpo d\'onda e si è spezzata!');}
  if(!f.snag&&f.dist>15&&Math.random()<dt*.005){f.snag=true;f.reel=false;AN.reelSpin=0;st.snag={r,stage:'fight',msg:'Il pesce si è infilato tra i detriti sul fondo e la lenza si è incagliata.'};st.phase='snag';vib([150,60,150]);setUI();return;}
  if(f.run<=0&&Math.random()<dt*.5*f.pow){f.run=rnd(.6,2)*f.pow;vib([90+Math.round(f.pow*60),50,140+Math.round(f.pow*80)]);}f.run=Math.max(0,f.run-dt);
  // durante la fuga e con la tensione alta: piccoli strattoni
  f.vt=(f.vt||0)-dt;if(f.vt<=0&&(f.run>0||f.ten>.75)){vib(f.run>0?Math.round(35+f.pow*30):25);f.vt=f.run>0?rnd(.25,.5):rnd(.6,1.1);}
  const GT=gearTier(r),pull=((f.run>0?.6:.18)*f.pow)*(1-GT.rod*.22)+(w.wave||0)*.08*Math.max(0,Math.sin(performance.now()/700));const dragMax=.35+f.drag*.07+(reelDrag(r.reelId||st.gear.reel)-12)*.012;
  let ten=(f.reel?.45:.12)+pull;if(ten>dragMax){const out=(ten-dragMax)*dt*25;f.dist+=out;ten=dragMax+(ten-dragMax)*.25;AN.reelSpin=-.6;
    // la frizione cede: crepitio tanto più fitto quanto più filo esce, e vibrazione continua
    f.dAcc=(f.dAcc||0)+out;let n=0;while(f.dAcc>.05&&n<4){f.dAcc-=.05;n++;dragTick(n*.012);}f.dv=(f.dv||0)-dt;if(f.dv<=0){f.dv=.22;vib(Math.round(40+Math.min(80,out/dt*6)));}}
  else AN.reelSpin=f.reel?1:0;
  if(f.reel&&f.run<=0)f.dist-=dt*(7-f.pow*1.5)*(1.15-f.drag*.02)*(1+GT.reel*.6);else if(f.reel)f.dist-=dt*1.2*(1+GT.reel*.5);
  f.ten=lerp(f.ten,clamp(ten,0,1.2),.15);r.dist=Math.max(0,f.dist);
  const lim=(f.sp.teeth&&hookCat(st.hook)!=='grande'?.92:1)*(1+GT.all*.12)*Math.min(1.12,Math.pow((st.gear.line||.25)/.25,.5))*(r.lineT==='braid'?1.08:1);if(f.ten>lim){f.over=(f.over||0)+dt;if(f.over>(r.lineT==='braid'?.7:.35))return endFight(false,f.sp.teeth?'Il serra ha tranciato la lenza con i denti!':'Lenza rotta: troppa tensione. Apri un po\' la frizione.');}else f.over=0;
  if(f.ten<.16)f.slack+=dt;else f.slack=Math.max(0,f.slack-dt*2);if(f.slack>2.6+GT.all*2)return endFight(false,'Slamato: con la lenza lenta il pesce si è liberato.');
  if(hookCat(st.hook)==='piccolo'&&r.hookT!=='forgiato'&&f.w>2.5&&f.ten>.85&&Math.random()<dt*.6)return endFight(false,'L\'amo piccolo si è aperto: pesce troppo grosso.');
  if(f.run>0&&Math.random()<dt*4)burst(new T.Vector3(r.sx*(f.dist/Math.max(1,-r.sz))+r.x*(1-f.dist/Math.max(1,-r.sz)),0,-f.dist),.4);
  if(!f.sp.crab&&!f.jump&&(f.jumps||0)<2&&f.w>=Math.max(1.1,f.sp.w[1]*1.25)&&f.dist<32&&f.dist>7&&Math.random()<dt*.22){f.jumps=(f.jumps||0)+1;f.jump={t:0};if(!f.obj){f.obj=makeFish3D(f.sp,f.len/100);f.obj.visible=false;scene.add(f.obj);}burst(lineEnd(r,f.dist),.6);splash(.2);}
  if(f.ten>.9&&Math.random()<dt*.01*(1-GT.rod*.8)*(f.w>2?1.6:1)){const id=r.rodId||st.gear.rod;loseGear('rod',id);r.dismantled=true;r.obj.visible=false;return endFight(false,`💥 Crack! La canna ${ROD[id]?.n||''} si è spezzata sotto sforzo. Comprane un'altra al negozio.`);}
  if(f.reel&&f.w>2.5&&f.ten>.75&&Math.random()<dt*.004*(1-GT.reel*.8)){const id=r.reelId||st.gear.reel;loseGear('reel',id);r.dismantled=true;return endFight(false,`⚙️ Il mulinello ${reelN(id)} si è bloccato: ingranaggi rotti. Serve un mulinello nuovo.`);}
  if(f.dist<=0)return endFight(true);
  const Te=document.getElementById('gten'),D=document.getElementById('gdis'),DT=document.getElementById('gdt'),TI=document.getElementById('gfti');
  if(Te){Te.style.width=clamp(f.ten*100,0,100)+'%';Te.style.background=f.ten>.85?'#ff4d5e':f.ten>.6?'#ffb547':'#2fe0cf';}
  if(D)D.style.width=clamp(f.dist/Math.max(1,-r.sz)*100,0,100)+'%';if(DT)DT.textContent=Math.max(0,Math.round(f.dist))+' m';
  const AL=document.getElementById('galert');if(AL){const o=st.rods.filter(x=>x!==r&&(x.state==='bite'||x.state==='hooked'));AL.textContent=o.length?o.map(x=>`🔔 Canna ${x.i+1}: ${x.state==='hooked'?'pesce allamato!':'abboccata!'}`).join(' · '):'';}
  if(TI)TI.textContent=f.run>0?'💥 Il pesce scappa! Non forzare':f.dist<12?'🌊 È nella risacca: portalo a riva':'🌀 Recupera senza dare lenza lenta';}
function lineEnd(r,d){const k=d/Math.max(1,-r.sz);return new T.Vector3(r.sx*k+r.x*(1-k),0,-d);}
function updJump(dt,t){const f=st.fight;if(!f?.jump||!f.obj)return;const J=f.jump;J.t+=dt;const k=J.t/1.05,p=lineEnd(f.r,f.dist),hJ=.7+f.len/120;
  if(k>=1){f.obj.visible=false;burst(p,.7);splash(.3);f.jump=null;return;}
  f.obj.visible=true;f.obj.scale.setScalar(1.6);f.obj.position.set(p.x,Math.sin(Math.PI*k)*hJ-.1,p.z);f.obj.rotation.set(Math.sin(t*20)*.25,.2,(.5-k)*2.4);}
/* ---------- pesce 3D realistico per specie: corpo, pinne, occhi e livrea dipinta ---------- */
const FISHTEX={};
function fishTex(sp){if(FISHTEX[sp.n])return FISHTEX[sp.n];const co=sp.col||{b:'#9aa7b0',t:'#c9d2d8',belly:'#eef2f4'};
  const t=canvasTex(1024,512,(g,W,H)=>{
    // controombreggiatura: dorso scuro, fianchi argentati, ventre chiaro
    const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,mix(co.b,'#000000',.35));gr.addColorStop(.28,co.b);gr.addColorStop(.5,co.t);gr.addColorStop(.72,co.belly);gr.addColorStop(1,co.belly);g.fillStyle=gr;g.fillRect(0,0,W,H);
    // riflessi iridescenti
    const ir=g.createLinearGradient(0,0,W,0);ir.addColorStop(0,'rgba(255,220,170,.06)');ir.addColorStop(.4,'rgba(160,220,255,.10)');ir.addColorStop(.8,'rgba(255,190,230,.06)');g.fillStyle=ir;g.fillRect(0,H*.25,W,H*.45);
    // macchie e disegni tipici della specie
    if(co.stripe){g.fillStyle=co.stripe;g.globalAlpha=.75;g.beginPath();g.moveTo(W*.06,H*.4);g.bezierCurveTo(W*.3,H*.36,W*.7,H*.39,W,H*.44);g.lineTo(W,H*.5);g.bezierCurveTo(W*.7,H*.46,W*.3,H*.44,W*.06,H*.46);g.fill();g.globalAlpha=1;}
    if(co.bars){g.fillStyle=co.bars;for(let i=0;i<9;i++){const x=W*(.2+i*.075);const gb=g.createLinearGradient(0,0,0,H*.75);gb.addColorStop(0,'rgba(0,0,0,0)');gb.addColorStop(.15,co.bars);gb.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gb;g.globalAlpha=i%2?.35:.55;g.fillRect(x,0,W*.035,H*.75);}g.globalAlpha=1;
      g.fillStyle=co.spot;g.beginPath();g.ellipse(W*.93,H*.42,W*.035,H*.12,0,0,7);g.fill();}
    if(co.vbars){for(let i=0;i<13;i++){const x=W*(.18+i*.058);g.fillStyle=co.vbars;g.globalAlpha=.45;g.fillRect(x,H*.06,W*.012,H*.68);}g.globalAlpha=1;}
    if(co.lines){g.strokeStyle=co.lines;g.globalAlpha=.55;g.lineWidth=4;for(let i=-6;i<16;i++){g.beginPath();g.moveTo(W*(i*.07),H*.05);g.bezierCurveTo(W*(i*.07+.06),H*.25,W*(i*.07+.04),H*.45,W*(i*.07+.12),H*.7);g.stroke();}g.globalAlpha=1;}
    if(co.lat){g.strokeStyle=co.lat;g.lineWidth=6;g.globalAlpha=.8;g.beginPath();g.moveTo(W*.18,H*.3);g.bezierCurveTo(W*.35,H*.25,W*.4,H*.55,W*.6,H*.5);g.bezierCurveTo(W*.75,H*.47,W*.85,H*.46,W,H*.46);g.stroke();g.globalAlpha=1;}
    if(co.dots){g.fillStyle=co.dots;if(sp.n==='Dentice'){for(let i=0;i<160;i++){g.globalAlpha=.55;g.beginPath();g.arc(W*rnd(.12,.95),H*rnd(.06,.5),rnd(3,6),0,7);g.fill();}}else{for(let i=0;i<5;i++){g.globalAlpha=.85;g.beginPath();g.arc(W*(.32+i*.12),H*.4,H*.045,0,7);g.fill();}}g.globalAlpha=1;}
    if(co.band){g.fillStyle=co.band;g.globalAlpha=.9;g.beginPath();g.ellipse(W*.06,H*.32,W*.03,H*.12,.2,0,7);g.fill();g.globalAlpha=.25;g.fillRect(0,H*.36,W,H*.012);g.globalAlpha=1;}
    // opercolo con la sua macchia scura
    g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=5;g.beginPath();g.moveTo(W*.18,H*.18);g.quadraticCurveTo(W*.23,H*.48,W*.17,H*.8);g.stroke();
    if(co.spot&&!co.bars){g.fillStyle=co.spot;g.globalAlpha=.7;g.beginPath();g.ellipse(W*.19,H*.36,W*.025,H*.08,0,0,7);g.fill();g.globalAlpha=1;}
    // squame
    for(let r=0;r<34;r++)for(let c=0;c<70;c++){const x=W*(.2+c*.0115+(r%2)*.0058),y=H*(.04+r*.026),s=W*.009*(.6+.4*(x/W));if(x>W)continue;
      g.strokeStyle='rgba(0,0,0,.10)';g.lineWidth=1.4;g.beginPath();g.arc(x,y,s,-.3*Math.PI,.3*Math.PI);g.stroke();g.strokeStyle='rgba(255,255,255,.13)';g.beginPath();g.arc(x-1,y-1,s,-.25*Math.PI,.05*Math.PI);g.stroke();}
    // linea laterale
    g.strokeStyle='rgba(30,35,40,.4)';g.lineWidth=3;g.beginPath();g.moveTo(W*.2,H*.27);g.bezierCurveTo(W*.45,H*.22,W*.7,H*.33,W,H*.42);g.stroke();
    // bocca
    g.strokeStyle='rgba(40,20,20,.6)';g.lineWidth=4;g.beginPath();g.moveTo(0,H*.5);g.quadraticCurveTo(W*.04,H*.53,W*.075,H*.5);g.stroke();
    for(let i=0;i<2500;i++){g.fillStyle=`rgba(${Math.random()<.5?'0,0,0':'255,255,255'},${Math.random()*.05})`;g.fillRect(Math.random()*W,Math.random()*H,2,2);}
  });return FISHTEX[sp.n]=t;}
// lungo L metri, testa verso -x e coda verso +x, centrato sul baricentro
function makeFish3D(sp,L){const g=new T.Group();if(sp.crab)return makeCrab3D(L);const co=sp.col||{b:'#9aa7b0'},sh=sp.shape||{h:.35,fork:.5},Lb=L*.8,H=L*sh.h*.5,ped=.16;
  const N=34,M=24,pos=[],uv=[],idx=[];
  const hh=u=>u<.3?H*(.08+.92*Math.pow(Math.sin(u/.3*Math.PI/2),.75)):H*(1-Math.pow((u-.3)/.7,1.5)*(1-ped)),y0=u=>H*.1*Math.sin(Math.PI*Math.min(1,u*1.2))-H*.05*u;
  for(let i=0;i<=N;i++){const u=i/N,h=hh(u),wd=h*(.36+.1*(1-u));for(let j=0;j<=M;j++){const a=j/M*Math.PI*2,sy=Math.cos(a),sz=Math.sin(a);
    pos.push(u*Lb-L*.45,y0(u)+h*sy,wd*sz);uv.push(u*.98+.01,.5+sy*.5*(h/H)*.98);}}
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(pos,3));bg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));bg.setIndex(idx);bg.computeVertexNormals();
  const body=new T.Mesh(bg,new T.MeshStandardMaterial({map:fishTex(sp),roughness:.32,metalness:.35}));g.add(body);
  const finM=new T.MeshStandardMaterial({color:mix(co.b,'#000000',.15),roughness:.5,metalness:.1,transparent:true,opacity:.82,side:T.DoubleSide});
  const finY=sp.n==='Leccia stella'||sp.n==='Ricciola'?new T.MeshStandardMaterial({color:co.stripe||'#c9b25a',roughness:.5,transparent:true,opacity:.8,side:T.DoubleSide}):finM;
  const shape=(pts,m,z=0)=>{const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)s.lineTo(pts[k][0],pts[k][1]);const me=new T.Mesh(new T.ShapeGeometry(s),m);me.position.z=z;g.add(me);return me;};
  const xt=Lb-L*.45,fk=sh.fork;
  // coda
  shape([[xt-L*.02,H*ped],[xt+L*.2,H*1.15],[xt+L*(.2-fk*.12),H*.05],[xt+L*(.2-fk*.12),-H*.05],[xt+L*.2,-H*1.1],[xt-L*.02,-H*ped]],finY);
  // dorsale con raggi, anale, ventrali e pettorali
  const yd=u=>y0(u)+hh(u)*.96;shape([[L*.15-L*.45+Lb*.15,yd(.3)],[L*.2-L*.45+Lb*.15,yd(.3)+H*.55],[Lb*.62-L*.45,yd(.62)+H*.3],[Lb*.72-L*.45,yd(.72)]],finM);
  const ya=u=>y0(u)-hh(u)*.96;shape([[Lb*.6-L*.45,ya(.6)],[Lb*.66-L*.45,ya(.66)-H*.35],[Lb*.8-L*.45,ya(.8)-H*.12],[Lb*.8-L*.45,ya(.8)]],finM);
  for(const s of[-1,1]){const pf=shape([[0,0],[L*.12,H*.18],[L*.14,-H*.05]],finY);pf.position.set(Lb*.22-L*.45,y0(.22)-H*.1,s*hh(.22)*.42);pf.rotation.y=s*.5;
    const vf=shape([[0,0],[L*.08,-H*.25],[L*.11,-H*.05]],finM);vf.position.set(Lb*.3-L*.45,y0(.3)-hh(.3)*.85,s*hh(.3)*.2);
    // occhio: iride chiara, pupilla nera e riflesso
    const ex=Lb*.075-L*.45,ey=y0(.075)+hh(.075)*.28,ez=s*hh(.075)*.36;const ir=new T.Mesh(new T.SphereGeometry(H*.13,14,10),new T.MeshStandardMaterial({color:sp.n==='Orata'?'#d9b24a':'#d8dcdc',roughness:.2,metalness:.4}));ir.scale.z=.45;ir.position.set(ex,ey,ez);g.add(ir);
    const pu=new T.Mesh(new T.SphereGeometry(H*.085,12,10),new T.MeshStandardMaterial({color:'#050608',roughness:.05,metalness:.1}));pu.scale.z=.5;pu.position.set(ex,ey,ez+s*H*.03);g.add(pu);
    const hl=new T.Mesh(new T.SphereGeometry(H*.022,8,6),new T.MeshBasicMaterial({color:'#ffffff'}));hl.position.set(ex-H*.03,ey+H*.03,ez+s*H*.075);g.add(hl);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
function makeCrab3D(L){const g=new T.Group(),W=L,m=new T.MeshStandardMaterial({color:'#3f6f7a',roughness:.45,metalness:.15}),cl=new T.MeshStandardMaterial({color:'#2f6fb5',roughness:.4}),tip=new T.MeshStandardMaterial({color:'#c0392b',roughness:.4});
  const cara=new T.Mesh(new T.SphereGeometry(1,24,12),m);cara.scale.set(W*.5,W*.12,W*.28);g.add(cara);
  for(const s of[-1,1]){const sp=new T.Mesh(new T.ConeGeometry(W*.03,W*.18,8),m);sp.rotation.z=-s*Math.PI/2;sp.position.set(s*W*.56,0,0);g.add(sp);
    const arm=new T.Mesh(new T.CylinderGeometry(W*.035,W*.03,W*.3,8),cl);arm.rotation.z=s*1.1;arm.rotation.x=.5;arm.position.set(s*W*.32,0,-W*.3);g.add(arm);
    const cw=new T.Mesh(new T.SphereGeometry(W*.09,12,8),cl);cw.scale.set(1.6,.7,.8);cw.position.set(s*W*.42,0,-W*.45);g.add(cw);const tp=new T.Mesh(new T.ConeGeometry(W*.03,W*.12,6),tip);tp.rotation.x=-Math.PI/2;tp.position.set(s*W*.46,0,-W*.58);g.add(tp);
    for(let k=0;k<4;k++){const lg=new T.Mesh(new T.CylinderGeometry(W*.015,W*.01,W*.36,6),m);lg.rotation.z=s*1.25;lg.rotation.y=(k-1.5)*.25;lg.position.set(s*W*.48,-W*.04,(k-1.5)*W*.12);g.add(lg);}}
  return g;}

function endFight(ok,why){const f=st.fight;st.fight=null;AN.reelSpin=0;if(f.obj){scene.remove(f.obj);f.obj=null;}const r=f.r,bait=B[r.bait]?.n||'';r.state='idle';r.bait=null;r.dist=0;r.sinker.visible=false;
  if(!ok){pose('hold');showCatch({fish:false,txt:'Perso!',why});return;}
  splash(.5);const rec=!st.best[f.sp.n]||f.w>st.best[f.sp.n];
  // il pesce esce dall'acqua appeso alla lenza
  const model=makeFish3D(f.sp,f.len/100);fishMesh.children.forEach(c=>{if(!c.userData.real)c.visible=false;});model.userData.real=true;fishMesh.add(model);fishMesh.scale.setScalar(1);fishMesh.visible=true;fishMesh.userData.show=performance.now();
  seq(async()=>{pose('strike');await sleep(1.2);fishMesh.visible=false;fishMesh.remove(model);
    // il pescatore prende il pesce in mano e lo mostra
    r.obj.visible=false;AN.holding=-1;pose('showFish');model.position.set(0,1.1,-.36);model.rotation.set(0,0,f.sp.crab?0:.08);if(f.sp.crab)model.rotation.x=-.9;AN.obj.add(model);st.showFish={model,r};vib(60);
    await sleep(.9);showCatch({fish:true,sp:f.sp,w:f.w,l:f.len,crab:!!f.sp.crab,rec,bait});});}
function endShowFish(){const h=st.showFish;if(!h)return;h.model.parent?.remove(h.model);h.r.obj.visible=true;if(h.r.held)AN.holding=h.r.i;pose("hold");st.showFish=null;}
function showCatch(c){st.catchShow=c;st.phase='catch';setUI();}
G.release=()=>{record(true);st.msg='💚 Rilasciato. Bravo!';G.rebait();};
G.keep=()=>{record(false);st.msg='🧺 Nel carniere';G.rebait();};
function strikeBolt(){const ang=rnd(-1.1,1.1),d=rnd(1600,4200),x=Math.sin(ang)*d,z=-Math.cos(ang)*d,top=rnd(700,1000),g=new T.Group();
  const mat=new T.LineBasicMaterial({color:0xeef4ff,transparent:true,opacity:1,fog:false}),glow=new T.LineBasicMaterial({color:0x9fb8ff,transparent:true,opacity:.5,fog:false,blending:T.AdditiveBlending});
  const zig=(x0,y0,z0,y1,spread,n)=>{const p=[new T.Vector3(x0,y0,z0)];let cx=x0,cz=z0;for(let i=1;i<=n;i++){cx+=rnd(-spread,spread);cz+=rnd(-spread,spread)*.4;p.push(new T.Vector3(cx,lerp(y0,y1,i/n),cz));}return p;};
  const main=zig(x,top,z,0,60,26);[mat,glow].forEach((m,k)=>{const l=new T.Line(new T.BufferGeometry().setFromPoints(main.map(v=>v.clone().add(new T.Vector3(k*4,0,0)))),m);g.add(l);});
  for(let k=0;k<3;k++){const s0=main[Math.floor(rnd(4,16))],br=zig(s0.x,s0.y,s0.z,s0.y-rnd(150,350),45,8);g.add(new T.Line(new T.BufferGeometry().setFromPoints(br),mat));}
  scene.add(g);st.bolt={obj:g,t:0,k:clamp(2600/d,.45,1)};thunder(d);}
function thunder(d){const c=AU.on?ac():null;if(!c)return;setTimeout(()=>{if(!AU.on||!AU.ctx)return;const t=c.currentTime,src=c.createBufferSource();src.buffer=noiseBuf(c);src.loop=true;
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(120,t+2.5);const v=c.createGain(),k=clamp(2600/d,.3,1);
  v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(.5*k,t+.08);v.gain.linearRampToValueAtTime(.25*k,t+.6);v.gain.linearRampToValueAtTime(.35*k,t+1);v.gain.exponentialRampToValueAtTime(.001,t+3.6);
  src.connect(lp).connect(v).connect(c.destination);src.start(t);src.stop(t+3.8);},Math.min(9000,d/343*1000*.6));}
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
const Q=[['come','👋 Come va?'],['nome','🙂 Come ti chiami?'],['preso','🐟 Cosa hai preso?'],['esca','🪱 Con che esca peschi?'],['mont','⚓ Che montatura usi?'],['app','📱 Usi LenzApp?'],['cons','💡 Mi dai un consiglio?'],['caffe','☕ Ti offro un caffè'],['ciao','👋 Ciao, a dopo!']];
function answer(a,q){const P=a.per,w=wxAt(st.gt),per=period(gameDate()),bag=a.bag,B1=B[P.bait]?.n.toLowerCase()||P.bait,idx=w.idx;
  const tot=bag.length,best=bag.slice().sort((x,y)=>y.w-x.w)[0];
  switch(q){
    case 'come':return P.mood==='brontolone'?pick(['Male, troppa corrente.','Si mangia poco oggi, colpa della luna.','Granchi ovunque, che strazio.']):tot?`Bene dai! Ho già preso ${tot} ${tot>1?'pesci':'pesce'}.`:pick(['Ancora niente, ma è presto.','Tranquillo, si aspetta.','Tocche sì, pesci no!']);
    case 'nome':return `Mi chiamo ${P.name}, ho ${P.age} anni e vengo da ${P.town}. Pesco qui a ${SPOT.name.split(' · ')[0]} da ${P.yrs} anni.`;
    case 'preso':return tot?`Finora: ${bag.map(f=>f.n.toLowerCase()+' '+Math.round(f.l)+' cm').join(', ')}.${best&&best.w>1?' Quella grossa l\'ho portata a riva a fatica!':''}`:pick(['Niente di niente, solo alghe.','Zero. Un granchio, se vale.','Per ora il cappotto.']);
    case 'esca':return `Io vado di ${B1}${P.bait==='bibi'?': le orate ci impazziscono':P.bait==='arenicola'?': profuma e porta saraghi e spigole':P.bait==='koreano'?': resiste e piace alle mormore':': per orate e ombrine non c\'è di meglio'}. Sulla battigia trovi anche i granchietti: li prendi e li inneschi.`;
    case 'mont':return `Piombo da ${P.lead} grammi, terminale ${P.rig==='2ami'?'a due ami':P.rig==='corto'?'corto da 75 cm':'lungo un metro e mezzo'}, amo ${P.rig==='2ami'?'n. 4':'n. 2'}. ${w.wave>1?'Con questo mare non scendere sotto i '+suggestLead(w.wave)+' grammi.':'Col mare calmo allunga il terminale.'}`;
    case 'app':return P.app?pick([`Certo! LenzApp oggi dà indice ${idx}: ${idx>=70?'ottimo, infatti sono qui':idx>=50?'discreto':'bassino, ma ci provo'}.`,'Sì, guardo sempre la Settimana e le finestre migliori. E segno le catture nel diario.','Sì! Con la mappa vedo dove prendono gli amici.']):pick(['LenzApp? Mai sentita… è gratis? Me la scarico.','No, io guardo il mare e basta. Ma mio nipote ce l\'ha.','Ah, quella dell\'indice di pesca? Prima o poi la provo.']);
    case 'cons':return per==='notte'?'Di notte le spigole vengono sotto riva: lancia corto, a 30-40 metri, con arenicola o sarda.':per==='alba'||per==='tramonto'?'Adesso è il momento buono: tieni le cime d\'occhio e ferra solo quando piega decisa.':w.wave<.3?'Col mare piatto peschi lontano, oltre gli 80 metri, terminale lungo e amo piccolo.':w.wave>1.2?'Mare grosso: piombo pesante e pesca nella buca dopo il primo frangente.':'Prova il cannolicchio a 70-90 metri, le orate girano.';
    case 'caffe':if(a.gift){return 'Grazie, ne ho già bevuti due! Il cuore…';}a.gift=1;st.inv.granchio+=3;return `Grazie, sei un amico! Tieni, tre granchietti che ho raccolto: sono ottimi per le orate.`;
    case 'ciao':return pick(['Ciao, in bocca al lupo!','Occhio alle cime!','A dopo!']);}}
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
function loop(){raf=requestAnimationFrame(loop);if(!renderer)return;const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;earnTick(dt);
  const gmul=(st.phase==='wait'&&!st.busy)?st.speed:1;st.gmul=gmul;st.gt+=dt*1000*gmul;const gmin=dt*gmul/60;const w=wxAt(st.gt);
  // pescatore e vicini di spiaggia
  joyMove(dt,t);moveActor(AN,dt);lerpPose(dt,st.castAnim?(st.castAnim.phase==='fire'?16:7):/Fwd$|^strike$/.test(AN.target)?14:6);applyPose(t);if(AN.holding>=0&&(st.phase==='fight'||AN.reelSpin!==0||AN.target==='reel'))reelIK();updCrabs(dt,t);nearUI(t);
  updNpcs(dt,t);rpUpd(dt,t);
  if(st.cast?.on){st.cast.p+=st.cast.dir*dt*1.15;if(st.cast.p>1){st.cast.p=1;st.cast.dir=-1;}if(st.cast.p<0){st.cast.p=0;st.cast.dir=1;}const el=document.getElementById('gpw');if(el)el.style.width=(st.cast.p*100)+'%';}
  // canne
  for(const r of st.rods){
    if(r.state==='fishing'&&r.dist>8){const need=suggestLead(w.wave||0)-(r.grip?25:0)+(r.leadT==='ogiva'?15:0);if((r.lead||st.lead)<need-20){const k=(need-(r.lead||st.lead))/100;r.dist-=gmin*k*6;r.sx+=gmin*k*Math.sin((w.wd-FACE)*R)*3;r.tgT=(r.tgT||0)-gmin;if(r.tgT<=0){r.tgT=1;if(checkTangle(r)&&st.phase==='wait')setUI();}if(!r.driftMsg){r.driftMsg=1;st.msg=`Canna ${r.i+1}: il piombo da ${r.lead} g «ara», la corrente lo trascina verso riva. Metti un piombo più pesante.`;if(st.phase==='wait')setUI();}}}
    if(r.state==='fishing'){const was=r.baitLeft;r.baitLeft-=gmin*(1+(w.wave||0)*.6);if(r.bait&&was>0&&r.baitLeft<=0){baitGone();vib([60,80,60]);st.msg=`🪝 Canna ${r.i+1}: l'esca è finita, va reinnescata.`;if(st.phase==='wait')setUI();}if(Math.random()<biteRate(r)*gmin)startBite(r);}
    if(r.state==='bite'){r.biteT+=dt;if(r.biteT>r.bitePlan.len){const pl=r.bitePlan,auto={partenza:.6,violenta:.45,decisa:.3,nervosa:.15,picchiettata:.05}[pl.kind]||0;
        if(pl.sp&&!pl.steal&&Math.random()<auto){r.state='hooked';r.hookT=0;bell(4,.3);try{navigator.vibrate?.([200,80,200]);}catch(e){}st.msg=`🐟 Canna ${r.i+1}: il pesce si è allamato da solo! Vai a recuperarlo.`;if(st.phase==='wait'||st.phase==='atrod')setUI();continue;}
        r.state='fishing';r.baitLeft-=pl.steal?999:10;st.msg=`Canna ${r.i+1}: ha smesso di battere${pl.steal?' (forse ti hanno rubato l\'esca)':''}.`;if(st.phase==='wait'||st.phase==='atrod')setUI();}}
    if(r.state==='hooked'){r.hookT+=dt;if(Math.random()<dt*.012*(1-gearTier(r).all*.6)||r.hookT>150+gearTier(r).all*120){r.state='fishing';r.baitLeft=0;r.bitePlan=null;st.msg=`Canna ${r.i+1}: il pesce si è slamato. Controlla l'esca.`;if(st.phase==='wait'||st.phase==='atrod')setUI();}
      else if(Math.random()<dt*.25)bell(1,.15);}
    const swell=r.dist>0?Math.sin(t*2*Math.PI/Math.max(3,w.wper||5)+r.i)*(w.wave||.3)*.12:0;let bite=r.state==='tangled'?.3+.2*Math.max(0,Math.sin(t*1.7+r.i*2)):r.state==='bite'?r.bitePlan.pattern(r.biteT):r.state==='hooked'?.55+.35*Math.max(0,Math.sin(t*2.3+r.i))*Math.max(0,Math.sin(t*.7)):0;if(st.fight?.r===r)bite=st.fight.ten*1.1;if(r.state==='flying')bite=0;
    r.bend=lerp(r.bend,(r.dist>0?.12:0)+swell+bite,.25);bendRod(r.obj,clamp(r.bend,0,1.3)*(r.held?.8:1));
    if(r.held)rodInHand(r);
    // mulinello: rotore e manovella girano quando si recupera
    if(r.held&&AN.holding===r.i&&AN.reelSpin>0){AN.tick=(AN.tick||0)+dt*AN.reelSpin*7;while(AN.tick>.75){AN.tick-=.75;reelTick();}}
    if(r.held&&AN.holding===r.i){const U=r.obj.userData;U.rotor.rotation.y+=dt*AN.reelSpin*22;U.lineOn.rotation.y+=dt*AN.reelSpin*22;U.crank.rotation.x+=dt*AN.reelSpin*7;AN.crank+=dt*AN.reelSpin*7;U.lineOn.position.y=.115+Math.sin(AN.crank*.5)*.008*(AN.reelSpin?1:0);}
    r.obj.userData.glow.visible=night()>.25&&r.star!==false;r.obj.userData.glow.material.opacity=r.state==='bite'?(.6+.4*Math.sin(t*20)):.9;
    // lenza
    const tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const a=r.line.geometry.attributes.position;
    if(r.ride){r.sinker.position.copy(r.ride.position);if(VEH.type==='drone')r.sinker.position.y-=2.55;}
    else if(st.castLead&&st.castLead.r===r){}
    else if(r.flight){const f=r.flight;f.t+=dt/f.dur;const k=clamp(f.t,0,1),pnt=new T.Vector3().lerpVectors(f.a,f.b,k);pnt.y+=Math.sin(k*Math.PI)*(12+f.b.distanceTo(f.a)*.12)*(f.low?.6:1);r.sinker.position.copy(pnt);}
    else if(r.dist>0){const fd=st.fight?.r===r?Math.max(0,st.fight.dist):r.dist,kk=fd/Math.max(1,-r.sz);r.sinker.position.set(lerp(r.x,r.sx,kk),.0,-fd);}
    const end=r.sinker.visible?r.sinker.position:tip;const tens=st.fight?.r===r?st.fight.ten:.2+r.bend*.4;
    for(let i=0;i<40;i++){const u=i/39,x=lerp(tip.x,end.x,u),z=lerp(tip.z,end.z,u),y=lerp(tip.y,end.y,u)-Math.sin(u*Math.PI)*(r.flight?0:(1-tens)*Math.min(3,tip.distanceTo(end)*.05));a.setXYZ(i,x,Math.max(y,end===tip?y:-.02),z);}
    a.needsUpdate=true;r.line.visible=r.sinker.visible;}
  reelWhir(AN.reelSpin>0&&AN.holding>=0?.012:0,AN.reelSpin*7);
  pilot(dt,t);updVeh(dt,t,w);
  updFight(dt);updJump(dt,t);updCastAnim(dt);
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
  for(const L of LANTERNS){L.userData.glass.material.emissiveIntensity=NIGHT>.4?1.6:0;if(L.userData.pl)L.userData.pl.intensity=NIGHT>.4?(st.gear.lanternLED?2.2:1.1):0;}
  const lampOn=NIGHT>.5&&st.lamp;headLamp.intensity=lampOn?[0,1.4,2.6,3.6][st.gear.torch||0]:0;if(lampOn)headLamp.color.set(st.gear.red?0xff6a5a:0xfff6d8);AN.obj.userData.J.lamp.material.emissiveIntensity=lampOn&&st.gear.torch?2:0;AN.obj.userData.J.lamp.visible=!!st.gear.torch;
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
  // temporale: saette sul mare, lampo e tuono (che arriva dopo, secondo la distanza)
  if(w.code>=95&&!st.bolt&&Math.random()<dt*.07)strikeBolt();
  if(st.bolt){const b=st.bolt;b.t+=dt;const fl=b.t<.08||(b.t>.16&&b.t<.24)||(b.t>.34&&b.t<.4)?1:0;b.obj.visible=fl>0;st.lightning=Math.max(st.lightning,fl*b.k);if(b.t>.55){scene.remove(b.obj);b.obj.traverse(o=>{o.geometry?.dispose();});st.bolt=null;}}
  st.lightning=Math.max(0,st.lightning-dt*4);if(st.lightning>0){hemi.intensity+=st.lightning*2.2;if(overcast)overcast.material.color.offsetHSL(0,0,st.lightning*.35);}
  {const fl=document.getElementById('gflash');if(fl)fl.style.opacity=(st.lightning*.45).toFixed(2);}
  // ammofila mossa dal vento
  grass.rotation.z=Math.sin(t*1.5)*w.ws*.0006;
  // mare: fruscio continuo come prima, ma solo con mare mosso; vento: appena percettibile e solo con vento vero
  seaSound(clamp(((w.wave||0)-.3)*.11,0,.25));windSound(w.ws>20?clamp((w.ws-20)/80,0,.018):0,t);}
// telecamera: dietro al pescatore quando si muove, larga sulle canne quando è seduto, vicina al mulinello nel combattimento
const CAM={p:null,l:null};
function updCam(dt,t){let p,l;const a=AN.pos;
  if(G.camOv){camera.position.set(...G.camOv.p);camera.lookAt(...G.camOv.l);return;}
  if(st.castCam&&AN.obj){const a=AN.rotY,fx=-Math.sin(a),fz=-Math.cos(a),rx=-fz,rz=fx,P=AN.pos;
    // di lato e un po' davanti, a circa 22 m: si vede tutto il pescatore con la canna; quando il piombo vola lo segue verso il mare
    const tp=new T.Vector3(P.x+rx*21+fx*5,P.y+3.2,P.z+rz*21+fz*5),r=st.rods[st.sel];let look=new T.Vector3(P.x+fx*.8,P.y+2.3,P.z+fz*.8);
    // da lontano ma con il teleobiettivo: pescatore e canna riempiono l'inquadratura senza la deformazione del grandangolo
    {const fw=(camera.aspect<1?34:24)*(r?.flight?1.6:1);if(Math.abs(camera.fov-fw)>.05){camera.fov=lerp(camera.fov,fw,Math.min(1,dt*3));camera.updateProjectionMatrix();}}
    if(r?.flight){const s2=r.sinker.position;look=look.lerp(s2,clamp(r.flight.t*1.2,0,.85));tp.lerp(new T.Vector3(P.x+rx*26+fx*10,P.y+6,P.z+rz*26+fz*10),clamp(r.flight.t,0,1));}
    camera.position.lerp(tp,Math.min(1,dt*3));CAM.cl=CAM.cl?CAM.cl.lerp(look,Math.min(1,dt*5)):look.clone();camera.lookAt(CAM.cl);return;}
  if(st.showFish&&AN.obj){{const J=AN.obj.userData.J,h1=new T.Vector3(),h2=new T.Vector3();J.lHand.getWorldPosition(h1);J.rHand.getWorldPosition(h2);const m=h1.add(h2).multiplyScalar(.5);m.y-=.04;AN.obj.worldToLocal(m);st.showFish.model.position.lerp(m,.5);}const a=AN.rotY,fx=-Math.sin(a),fz=-Math.cos(a),fp=new T.Vector3();st.showFish.model.getWorldPosition(fp);const tp=new T.Vector3(AN.pos.x+fx*1.45-fz*.35,AN.pos.y+1.4,AN.pos.z+fz*1.45+fx*.35);
    camera.position.lerp(tp,Math.min(1,dt*4));camera.lookAt(fp.x,fp.y+.08,fp.z);return;}
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
  const h=`<div>📍 ${escH(SPOT.name.split(' · ')[0])} · <b>${d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</b>${st.speed>1&&st.phase==='wait'&&!st.busy?' ⏩':''}</div><div>${wi} ${Math.round(w.temp)}° ${['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][Math.round(mp.ph/45)%8]} 🎣${w.idx}${st.sim?' ⚠️':''}</div><br><div>🌬️ ${Math.round(w.ws)} ${windName(w.wd)}</div><div>🌊 ${(w.wave||0).toFixed(1).replace('.',',')} m · ${Math.round(w.sst)}°</div><div>💶 ${eur(st.money)}</div>`;if(hud.innerHTML!==h)hud.innerHTML=h;}
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
    const hk=hookCat(r.hook??st.hook);if(r.hookT==='forgiato'&&sp.w[1]<.5)f*=.85;if(hk==='piccolo'&&sp.w[1]>1)f*=.7;if(hk==='grande'&&sp.w[1]<.4)f*=.35;
    if(r.rig==='lungo'&&['Orata','Mormora','Sarago maggiore'].includes(sp.n))f*=(w.wave||0)<.7?1.2:.85;if(r.rig==='corto')f*=(w.wave||0)>=.8?1.15:.95;
    return [sp,f];});}
function biteRate(r){// abboccate per minuto di gioco
  if(!r.bait||r.state!=='fishing'||r.baitLeft<=0)return 0;const w=wxAt(st.gt),idx=clamp(w.idx??50,0,100);
  const s=speciesWeights(r).reduce((a,[,f])=>a+f,0);return (s*(.35+idx/100*1.3)*.045+.004)*(r.rig==='2ami'?1.25:1)*gearQuality(); // + piccoli pesci e granchietti che rubano l'esca
}

function sizeOf(sp){const [a,t,b]=sp.w;let x=Math.exp(Math.log(t)+(Math.random()+Math.random()+Math.random()-1.5)*.55);if(Math.random()<.04)x*=1.6;return clamp(x,a,b);}
function lenOf(sp,w){const [a,b]=sp.lw;return Math.round(Math.pow(w*1000/a,1/b)*(sp.crab?.1:1)*10)/10||Math.round(Math.pow(w*1000/a,1/b));}
function record(rel){const c=st.catchShow,r=st.rods[st.sel];{const gain=Math.round((3+c.w*2+(rel?2:0)+(c.rec?5:0))*100)/100;earn('catch',gain,c.rec?'cattura da record':'cattura');}const e={n:c.sp.n,w:Math.round(c.w*100)/100,l:c.l,t:st.gt,rel,bait:c.bait||''};st.bag.push(e);LSS('bag',st.bag.slice(-200));
  if(c.rec){st.best[c.sp.n]=e.w;LSS('best',st.best);}st.total.n++;st.total.kg+=e.w;st.total.pts+=Math.round(e.w*100)+(rel?50:0)+(c.sp.ab<.1?300:0);LSS('total',st.total);}
G.release=()=>{record(true);st.msg='💚 Rilasciato. Bravo!';G.rebait();};
G.keep=()=>{record(false);st.msg='🧺 Nel carniere';G.rebait();};

function mix(a,b,t){const p=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)],A=p(a),Bb=p(b);return '#'+A.map((v,i)=>Math.round(lerp(v,Bb[i],clamp(t,0,1))).toString(16).padStart(2,'0')).join('');}
/* ---------- il pesce catturato, disegnato ---------- */
const SCI={'Orata':'Sparus aurata','Spigola':'Dicentrarchus labrax','Sarago maggiore':'Diplodus sargus','Serra':'Pomatomus saltatrix','Mormora':'Lithognathus mormyrus','Leccia stella':'Trachinotus ovatus','Ombrina':'Umbrina cirrosa','Granchio blu':'Callinectes sapidus','Leccia amia':'Lichia amia','Ricciola':'Seriola dumerili','Dentice':'Dentex dentex'},FISHPH={};
// foto vera della specie (Wikipedia); se non arriva resta il disegno
const FISHLOC={"Orata": {"f": "img/fish/orata.jpg", "by": "(c) Julien Renoult, some rights reserved (CC BY), uploaded by Julien Renoult"}, "Spigola": {"f": "img/fish/spigola.jpg", "by": "(c) Julien Renoult, some rights reserved (CC BY), uploaded by Julien Renoult"}, "Sarago maggiore": {"f": "img/fish/sarago-maggiore.jpg", "by": "(c) Roberto Pillon, some rights reserved (CC BY)"}, "Serra": {"f": "img/fish/serra.jpg", "by": "(c) Susanne Spindler, some rights reserved (CC BY-NC-ND), uploaded by Susanne Spindler"}, "Mormora": {"f": "img/fish/mormora.jpg", "by": "(c) Luis P. B., some rights reserved (CC BY-NC), uploaded by Luis P. B."}, "Leccia stella": {"f": "img/fish/leccia-stella.jpg", "by": "(c) Dennis Rabeling, some rights reserved (CC BY-NC-ND), uploaded by Dennis Rabeling"}, "Ombrina": {"f": "img/fish/ombrina.jpg", "by": "(c) Julien Renoult, some rights reserved (CC BY), uploaded by Julien Renoult"}, "Granchio blu": {"f": "img/fish/granchio-blu.jpg", "by": "(c) Le Gallais, some rights reserved (CC BY-NC), uploaded by Le Gallais"}, "Leccia amia": {"f": "img/fish/leccia-amia.jpg", "by": "(c) NasserHalaweh, some rights reserved (CC BY-SA)"}, "Ricciola": {"f": "img/fish/ricciola.jpg", "by": "(c) Luis P. B., some rights reserved (CC BY-NC), uploaded by Luis P. B."}, "Dentice": {"f": "img/fish/dentice.jpg", "by": "(c) Hectonichus, some rights reserved (CC BY-SA)"}};
const GBASE=(document.currentScript&&document.currentScript.src)?document.currentScript.src.replace(/gioco\.js.*$/,''):'';
function fishPhoto(sp){if(FISHLOC[sp.n])return Promise.resolve(GBASE+FISHLOC[sp.n].f);const sci=SCI[sp.n];if(!sci)return Promise.resolve(null);if(FISHPH[sci]!==undefined)return Promise.resolve(FISHPH[sci]);
  return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(sci.replace(/ /g,'_'))).then(r=>r.json()).then(j=>{const u=j.thumbnail?.source?j.thumbnail.source.replace(/\/(\d+)px-/,'/800px-'):j.originalimage?.source||null;return FISHPH[sci]=u;}).catch(()=>FISHPH[sci]=null);}
function drawFishCard(){const c=st.catchShow,el=document.getElementById('gfc');if(!el||!c?.fish)return;
  fishPhoto(c.sp).then(u=>{const im=document.getElementById('gfi'),cv=document.getElementById('gfc'),cr=document.getElementById('gfcr');if(!u||!im||st.catchShow!==c)return;im.onload=()=>{im.style.display='block';if(cv)cv.style.display='none';if(cr)cr.textContent=FISHLOC[c.sp.n]?'Foto: '+FISHLOC[c.sp.n].by+' · iNaturalist':'Foto: '+SCI[c.sp.n]+' · Wikipedia / Wikimedia Commons';};im.src=u;});const g=el.getContext('2d'),Wd=600,Hd=260;g.clearRect(0,0,Wd,Hd);
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
.gpanel.slim{padding:8px 10px}#gx,#gau{z-index:8}#gstart{position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 58px) 12px calc(env(safe-area-inset-bottom) + 14px);background:radial-gradient(900px 600px at 50% 0,#12405c,#04101e);color:#fff;font:500 15px Outfit,sans-serif;gap:10px}.gst-h{display:flex;flex-direction:column;gap:2px}.gst-h>b{font-size:24px}.gst-row{flex:1;display:flex;gap:10px;min-height:0}.gst-c{flex:1 1 0;display:flex;flex-direction:column;gap:10px;min-width:0}.gst-c canvas{flex:1;width:100%;min-height:0;object-fit:cover;border-radius:18px;box-shadow:0 12px 30px -10px rgba(0,0,0,.7)}.gst-c .gb{margin:0}.gst-b{height:58px;padding:0 6px!important;font-size:16.5px!important;white-space:nowrap;display:flex;align-items:center;justify-content:center}.gst-shop,.gshop-b{background:linear-gradient(135deg,#ffb23a,#f06a12)!important;color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.25)}.gst-f{font-size:12.5px;opacity:.75;text-align:center}.gmoney{position:absolute;left:50%;top:calc(env(safe-area-inset-top) + 70px);transform:translateX(-50%);background:linear-gradient(135deg,#ffd76a,#e0a92a);color:#3a2400;border-radius:999px;padding:6px 14px;font:800 14px Outfit,sans-serif;pointer-events:none;animation:gmoney 2.6s ease forwards;z-index:9}@keyframes gmoney{0%{opacity:0;transform:translate(-50%,8px)}12%{opacity:1;transform:translate(-50%,0)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-14px)}}.gitem{display:flex;gap:10px;align-items:flex-start;padding:9px 2px;border-bottom:1px solid rgba(255,255,255,.08)}.gitem:last-of-type{border-bottom:0}.gr.empty{background:rgba(200,40,55,.55);border-color:#ff4d5e}
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
