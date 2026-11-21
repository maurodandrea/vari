/* ===================== LenzApp · Gioco 3D: surfcasting a Castelporziano =====================
   Scena 3D con three.js (cielo fisico, mare con riflessi), pescatore articolato e canne con mulinello.
   Cielo, sole e luna nella posizione vera, nuvole, pioggia, vento, onde e luce seguono le previsioni reali (Open-Meteo). */
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
let T=null,renderer,scene,camera,sky,water,sunLight,hemi,moonLight,headLamp,clock,raf=0,root,ui,hud,cvs;
const st={phase:'load',gt:Date.now(),speed:[1,2,4,8,16,32].includes(LSG('speed',8))?LSG('speed',8):8,lamp:LSG('lamp',true),X:null,sim:false,rods:[],sel:0,msg:'',fight:null,cast:null,catchShow:null,
  bag:LSG('bag',[]),best:LSG('best',{}),total:LSG('total',{n:0,kg:0,pts:0}),lead:LSG('lead',150),hook:LSG('hook','medio'),nRods:LSG('nrods',3),busy:false,lightning:0};
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
function sandTex(){return canvasTex(512,512,(g,w,h)=>{g.fillStyle='#d6b98a';g.fillRect(0,0,w,h);for(let i=0;i<26000;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(255,250,235,${Math.random()*.35})`:`rgba(110,85,55,${Math.random()*.28})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*1.5,1+Math.random()*1.5);}
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
  Object.assign(MAT,{skin:S('#c99a78',.65),jacket:S('#2f5544',.85),jacket2:S('#264638',.9),pants:S('#2c3445',.9),boot:S('#3a2a1e',.7),cap:S('#b8352a',.85),hair:S('#2a2018',.95),
    alu:S('#b9c2cb',.35,.8),blank:S('#18222e',.35,.3),blank2:S('#2c3f55',.35,.3),tip:S('#e9eef2',.4),cork:S('#9c7a52',.95),reel:S('#3d4550',.35,.7),spool:S('#c9a24a',.3,.8),
    chair:S('#2a5d8a',.8),chairF:S('#9aa3ad',.4,.7),bag:S('#4a5a32',.9),bucket:S('#e8e8e8',.6),lead:S('#666a70',.4,.6),line:new T.LineBasicMaterial({color:0xd6e0e6,transparent:true,opacity:.2,depthWrite:false})});}

/* ---------- il pescatore: corpo articolato ---------- */
function limb(len,r1,r2,mat){// segmento che pende verso il basso dal suo perno, con articolazione arrotondata
  const g=new T.Group(),m=new T.Mesh(new T.CylinderGeometry(r2,r1,len,12),mat);m.position.y=-len/2;m.castShadow=true;g.add(m);
  const j=new T.Mesh(new T.SphereGeometry(r1*1.02,12,10),mat);j.castShadow=true;g.add(j);g.userData.len=len;return g;}
function makeAngler(){
  const A=new T.Group(),J={};A.userData.J=J;
  const hips=new T.Group();hips.position.y=.95;A.add(hips);J.hips=hips;
  const pelvis=new T.Mesh(new T.SphereGeometry(.17,16,12),MAT.pants);pelvis.scale.set(1.15,.75,.85);pelvis.castShadow=true;hips.add(pelvis);
  const spine=new T.Group();spine.position.y=.05;hips.add(spine);J.spine=spine;
  // busto con giacca (tronco di cono arrotondato) e cappuccio
  const torso=new T.Mesh(new T.CylinderGeometry(.2,.16,.55,16),MAT.jacket);torso.position.y=.29;torso.scale.z=.75;torso.castShadow=true;spine.add(torso);
  const chest=new T.Mesh(new T.SphereGeometry(.205,16,12),MAT.jacket);chest.position.y=.52;chest.scale.set(1,.55,.78);chest.castShadow=true;spine.add(chest);
  const hood=new T.Mesh(new T.TorusGeometry(.11,.045,8,16),MAT.jacket2);hood.position.set(0,.6,.06);hood.rotation.x=1.2;spine.add(hood);
  const zip=new T.Mesh(new T.BoxGeometry(.012,.5,.01),MAT.jacket2);zip.position.set(0,.3,-.155);spine.add(zip);
  const neck=new T.Group();neck.position.y=.62;spine.add(neck);J.neck=neck;
  const nk=new T.Mesh(new T.CylinderGeometry(.05,.055,.1,10),MAT.skin);nk.position.y=.04;neck.add(nk);
  const head=new T.Group();head.position.y=.17;neck.add(head);J.head=head;
  const skull=new T.Mesh(new T.SphereGeometry(.105,20,16),MAT.skin);skull.scale.set(.92,1.1,1);skull.castShadow=true;head.add(skull);
  const nose=new T.Mesh(new T.ConeGeometry(.02,.05,8),MAT.skin);nose.rotation.x=-Math.PI/2;nose.position.set(0,-.01,-.105);head.add(nose);
  for(const s of[-1,1]){const ear=new T.Mesh(new T.SphereGeometry(.025,8,8),MAT.skin);ear.scale.set(.5,1,.8);ear.position.set(s*.098,0,.005);head.add(ear);}
  const beard=new T.Mesh(new T.SphereGeometry(.09,14,10,0,6.3,1.6,1.4),MAT.hair);beard.position.set(0,-.03,-.01);head.add(beard);
  const hair=new T.Mesh(new T.SphereGeometry(.108,16,12,0,6.3,0,1.7),MAT.hair);hair.position.y=.005;head.add(hair);
  const cap=new T.Mesh(new T.SphereGeometry(.112,18,12,0,6.3,0,1.45),MAT.cap);cap.position.y=.02;head.add(cap);
  const brim=new T.Mesh(new T.CylinderGeometry(.11,.11,.012,16,1,false,-1.2,2.4),MAT.cap);brim.position.set(0,.03,-.07);brim.scale.z=.9;head.add(brim);
  const lamp=new T.Mesh(new T.BoxGeometry(.05,.03,.02),new T.MeshStandardMaterial({color:'#222',emissive:'#fffbe0',emissiveIntensity:0}));lamp.position.set(0,.06,-.11);head.add(lamp);J.lamp=lamp;
  // braccia e gambe
  for(const s of[-1,1]){const k=s<0?'l':'r';
    const sh=new T.Group();sh.position.set(s*.23,.53,0);spine.add(sh);J[k+'Sh']=sh;
    const ua=limb(.3,.058,.05,MAT.jacket);sh.add(ua);const el=new T.Group();el.position.y=-.3;ua.add(el);J[k+'El']=el;
    const fa=limb(.27,.048,.04,MAT.jacket);el.add(fa);const hand=new T.Group();hand.position.y=-.29;fa.add(hand);J[k+'Hand']=hand;
    const hm=new T.Mesh(new T.SphereGeometry(.045,10,8),MAT.skin);hm.scale.set(.8,1.2,.6);hm.position.y=-.03;hand.add(hm);
    const hp=new T.Group();hp.position.set(s*.1,-.02,0);hips.add(hp);J[k+'Hip']=hp;
    const th=limb(.44,.085,.065,MAT.pants);hp.add(th);const kn=new T.Group();kn.position.y=-.44;th.add(kn);J[k+'Knee']=kn;
    const sn=limb(.42,.062,.05,MAT.pants);kn.add(sn);
    const boot=new T.Mesh(new T.BoxGeometry(.1,.09,.26),MAT.boot);boot.position.set(0,-.45,-.05);boot.castShadow=true;sn.add(boot);J[k+'Foot']=boot;}
  A.traverse(o=>{if(o.isMesh)o.castShadow=true;});return A;}
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
const AN={obj:null,pose:JSON.parse(JSON.stringify(POSES.sit)),target:'sit',walk:0,moving:false,speed:1.4,pos:null,rotY:0,holding:-1,reelSpin:0,crank:0};
function lerpPose(dt,k=6){const tp=POSES[AN.target],p=AN.pose,f=1-Math.exp(-k*dt);p.hy=lerp(p.hy,tp.hy,f);
  for(const j of['sp','hd','lSh','rSh','lEl','rEl','lHip','rHip','lKnee','rKnee'])for(let i=0;i<3;i++)p[j][i]=lerp(p[j][i],tp[j][i],f);
  if(tp.rod){if(!p.rod)p.rod={...tp.rod};p.rod.p=lerp(p.rod.p,tp.rod.p,f);p.rod.f=lerp(p.rod.f||0,tp.rod.f||0,f);p.rod.y=lerp(p.rod.y||0,tp.rod.y||0,f);}}
function applyPose(t){const J=AN.obj.userData.J,p=AN.pose,set=(o,a)=>o.rotation.set(a[0],a[1],a[2]);
  let wk=AN.moving?Math.sin(AN.walk):0,wk2=AN.moving?Math.sin(AN.walk+Math.PI):0,amp=AN.moving?Math.min(1,AN.speed/1.4)*.55:0;
  J.hips.position.y=p.hy+(AN.moving?Math.abs(Math.cos(AN.walk))*.035-.02:Math.sin(t*1.3)*.004);
  set(J.spine,[p.sp[0]+(AN.moving?.06:0),p.sp[1]+wk*.06*amp,p.sp[2]]);set(J.head,p.hd);
  set(J.lSh,[p.lSh[0]+(AN.holding<0?wk2*amp*.7:0),p.lSh[1],p.lSh[2]]);set(J.rSh,[p.rSh[0]+(AN.holding<0?wk*amp*.7:0),p.rSh[1],p.rSh[2]]);
  set(J.lEl,p.lEl);set(J.rEl,p.rEl);
  // recupero: la mano sinistra gira la manovella
  if(AN.reelSpin>0&&AN.holding>=0){const c=AN.crank;J.lSh.rotation.x+=Math.sin(c)*.14;J.lSh.rotation.z+=Math.cos(c)*.09;J.lEl.rotation.x+=Math.sin(c)*.18;}
  set(J.lHip,[p.lHip[0]+wk*amp,p.lHip[1],p.lHip[2]]);set(J.rHip,[p.rHip[0]+wk2*amp,p.rHip[1],p.rHip[2]]);
  set(J.lKnee,[p.lKnee[0]-Math.max(0,-Math.cos(AN.walk))*amp*1.3,0,0]);set(J.rKnee,[p.rKnee[0]-Math.max(0,Math.cos(AN.walk))*amp*1.3,0,0]);
  AN.obj.position.copy(AN.pos);AN.obj.rotation.y=AN.rotY;}

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
let foams=[],swash,clouds=[],stars,moon,rain,cityL,grass,lineObjs=[],sinkers=[],splashP,fishMesh,bushes;
function buildWorld(){
  scene=new T.Scene();camera=new T.PerspectiveCamera(55,1,.1,20000);
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  mats();
  sky=new T.Sky();sky.scale.setScalar(15000);scene.add(sky);
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
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i)+30;let y=z<-6?-1.2+(z+6)*.05:z<0?z*.06-.15:z<24?z*.035+Math.sin(x*.21+z*.3)*.015:.84+Math.pow((z-24)/10,1.6)*1.4+Math.sin(x*.07)*.8+Math.sin(x*.19+1)*.35;
    if(z>24)y+=Math.max(0,Math.sin(x*.13+z*.2))*.6;pa.setXYZ(i,x,y,z);const wet=clamp(1-(z+1)/5,0,1);col.push(lerp(1,.62,wet),lerp(1,.56,wet),lerp(1,.48,wet));}
  sg.setAttribute('color',new T.Float32BufferAttribute(col,3));sg.computeVertexNormals();
  const sand=new T.Mesh(sg,new T.MeshStandardMaterial({map:sandTex(),vertexColors:true,roughness:1}));sand.receiveShadow=true;scene.add(sand);
  // macchia mediterranea e ammofila sulle dune
  const bg=new T.SphereGeometry(1,10,8),bm=new T.MeshStandardMaterial({color:'#3a5a2c',roughness:1});bushes=new T.InstancedMesh(bg,bm,260);const mtx=new T.Matrix4(),q=new T.Quaternion();
  for(let i=0;i<260;i++){const x=rnd(-200,200),z=rnd(27,58),s=rnd(.6,1.8),y=.84+Math.pow((z-24)/10,1.6)*1.4+Math.sin(x*.07)*.8+Math.sin(x*.19+1)*.35;mtx.compose(new T.Vector3(x,y+s*.25,z),q,new T.Vector3(s*1.4,s*.75,s*1.2));bushes.setMatrixAt(i,mtx);bushes.setColorAt(i,new T.Color().setHSL(.25+rnd(-.03,.04),.35,rnd(.16,.26)));}
  scene.add(bushes);
  const gg=new T.ConeGeometry(.04,.6,3);gg.translate(0,.3,0);grass=new T.InstancedMesh(gg,new T.MeshStandardMaterial({color:'#a8a964',roughness:1}),900);
  for(let i=0;i<900;i++){const x=rnd(-120,120),z=rnd(20,27),y=z*.035;mtx.compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rnd(-.3,.3),rnd(0,6),rnd(-.3,.3))),new T.Vector3(1,rnd(.6,1.4),1));grass.setMatrixAt(i,mtx);}scene.add(grass);
  // pini lontani sulla duna (silhouette)
  const pm=new T.MeshStandardMaterial({color:'#2b4024',roughness:1}),tm=new T.MeshStandardMaterial({color:'#5a4030',roughness:1});
  for(let i=0;i<26;i++){const x=rnd(-220,220),z=rnd(62,90),h=rnd(9,15),p=new T.Group();const tr=new T.Mesh(new T.CylinderGeometry(.25,.4,h,6),tm);tr.position.y=h/2;p.add(tr);
    const cr=new T.Mesh(new T.SphereGeometry(1,10,8),pm);cr.scale.set(rnd(4,6.5),rnd(1.4,2),rnd(4,6));cr.position.y=h;p.add(cr);p.position.set(x,2,z);scene.add(p);}
  // frangenti: strisce di schiuma che avanzano verso riva, e risacca sulla sabbia
  const ft=foamTex();for(let i=0;i<9;i++){const g=new T.PlaneGeometry(420,3.4,160,2);g.rotateX(-Math.PI/2);const base=Float32Array.from(g.attributes.position.array);
    const tx=foamTex2();const m=new T.Mesh(g,new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,opacity:0}));m.position.y=.06;m.userData={base,cyc:Math.random(),rate:rnd(.75,1.35)};newWave(m);scene.add(m);foams.push(m);}
  swash=new T.Mesh(new T.PlaneGeometry(420,3),new T.MeshBasicMaterial({map:ft.clone(),transparent:true,depthWrite:false,opacity:.5,color:0xdff3f5}));swash.material.map.needsUpdate=true;swash.rotation.x=-Math.PI/2;scene.add(swash);
  // nuvole
  for(let i=0;i<16;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex(i*977+13),transparent:true,depthWrite:false,fog:false}));const a=rnd(-1.4,1.4),d=rnd(900,2600);sp.position.set(Math.sin(a)*d,rnd(140,420),-Math.cos(a)*d*.9+200);sp.scale.set(rnd(700,1300),rnd(260,420),1);sp.userData.a=a;scene.add(sp);clouds.push(sp);}
  // stelle
  const sv=[];for(let i=0;i<1500;i++){const th=Math.random()*6.283,ph=Math.acos(Math.random()*.95);sv.push(Math.sin(ph)*Math.cos(th)*9000,Math.cos(ph)*9000,Math.sin(ph)*Math.sin(th)*9000);}
  const sgeo=new T.BufferGeometry();sgeo.setAttribute('position',new T.Float32BufferAttribute(sv,3));stars=new T.Points(sgeo,new T.PointsMaterial({color:0xffffff,size:14,sizeAttenuation:true,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(stars);
  moon=new T.Sprite(new T.SpriteMaterial({map:moonTex(90),transparent:true,fog:false,depthWrite:false}));moon.scale.set(260,260,1);scene.add(moon);
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
  ch.position.set(CHAIR.x,CHAIR.z*.035,CHAIR.z);ch.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(ch);
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
  eb.position.set(CHAIR.x+.62,CHAIR.z*.035,CHAIR.z+.12);scene.add(eb);
  const buck=new T.Mesh(new T.CylinderGeometry(.16,.13,.3,16),MAT.bucket);buck.position.set(CHAIR.x-.75,CHAIR.z*.035+.15,CHAIR.z-.2);buck.castShadow=true;scene.add(buck);
  const fodero=new T.Mesh(new T.CylinderGeometry(.08,.08,1.4,10),MAT.bag);fodero.rotation.z=Math.PI/2;fodero.position.set(CHAIR.x+1.6,CHAIR.z*.035+.08,CHAIR.z+.9);scene.add(fodero);
  // il pescatore e la sua frontale
  AN.obj=makeAngler();scene.add(AN.obj);AN.pos=new T.Vector3(CHAIR.x,CHAIR.z*.035,CHAIR.z-.05);AN.rotY=0;
  headLamp=new T.SpotLight(0xfff6d8,0,40,.45,.5,1.2);AN.obj.userData.J.head.add(headLamp);headLamp.position.set(0,.06,-.12);const lt=new T.Object3D();lt.position.set(0,-1.2,-6);AN.obj.userData.J.head.add(lt);headLamp.target=lt;
  // pesce che esce dall'acqua alla fine
  fishMesh=new T.Group();const fb=new T.Mesh(new T.SphereGeometry(1,18,12),new T.MeshStandardMaterial({color:'#b8c2c8',roughness:.3,metalness:.6}));fb.scale.set(.5,.2,.08);fishMesh.add(fb);
  const tail=new T.Mesh(new T.ConeGeometry(.16,.25,4),fb.material);tail.rotation.z=Math.PI/2;tail.position.x=.58;tail.scale.z=.2;fishMesh.add(tail);fishMesh.visible=false;fishMesh.userData.body=fb;scene.add(fishMesh);
  clock=new T.Clock();
}
function setupRods(){st.rods.forEach(r=>{scene.remove(r.obj);scene.remove(r.spike);scene.remove(r.line);scene.remove(r.sinker);});
  st.rods=Array.from({length:st.nRods},(_,i)=>{const x=rodX(i,st.nRods),spike=makeSpike();spike.position.set(x,ROD_Z*.035,ROD_Z);scene.add(spike);
    const obj=makeRod();scene.add(obj);const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(40*3),3));const line=new T.Line(lg,MAT.line);line.frustumCulled=false;scene.add(line);
    const sinker=new T.Mesh(new T.SphereGeometry(.05,8,6),MAT.lead);sinker.visible=false;scene.add(sinker);
    return {i,x,spike,obj,line,sinker,bait:null,dist:0,state:'idle',baitLeft:0,bend:0,bitePlan:null,held:false,sx:x,sz:-1};});}
function placeRodOnSpike(r){const by=ROD_Z*.035;r.obj.position.set(r.x,by+.12,ROD_Z);r.obj.rotation.set(-40*R,0,0,'YXZ');}
function rodInHand(r){const J=AN.obj.userData.J,hp=new T.Vector3();J.rHand.getWorldPosition(hp);const p=AN.pose.rod||{p:45,f:0,y:0};
  r.obj.rotation.set((p.p-90)*R,AN.rotY+(p.y||0),0,'YXZ');const dir=new T.Vector3(0,1,0).applyEuler(r.obj.rotation);r.obj.position.copy(hp).addScaledVector(dir,-.5);}

/* ---------- interfaccia ---------- */
function mount(v){
  stop();root=document.createElement('div');root.id='gamebox';
  root.innerHTML=`<div id="g3"></div><div id="ghud"></div><div id="gui"></div><button id="gx" aria-label="Esci">✕</button><button id="gau" aria-label="Audio">${AU.on?'🔊':'🔇'}</button><button id="glamp" aria-label="Torcia" class="${st.lamp?'':'off'}">🔦</button>`;
  document.body.appendChild(root);document.body.classList.add('gaming');ui=root.querySelector('#gui');hud=root.querySelector('#ghud');
  root.querySelector('#gx').onclick=()=>G.exit();
  root.querySelector('#glamp').onclick=e=>{st.lamp=!st.lamp;LSS('lamp',st.lamp);e.currentTarget.classList.toggle('off',!st.lamp);click();};
  root.querySelector('#gau').onclick=e=>{AU.on=!AU.on;LSS('audio',AU.on);e.target.textContent=AU.on?'🔊':'🔇';if(!AU.on)seaSound(0);};
  st.phase='load';st.gt=Date.now();ui.innerHTML=`<div class="gpanel"><b>Castelporziano</b><div class="gs">Preparo la spiaggia in 3D e leggo meteo e mare reali…</div></div>`;
  if(v)v.innerHTML='<div class="card" style="text-align:center;padding:30px"><p class="mut">Il gioco è aperto a tutto schermo.</p><button class="btn" onclick="GAME.mount()">🎣 Riapri il gioco</button></div>';
  Promise.all([loadThree(),loadWx()]).then(([three])=>{T=three;if(!document.getElementById('gamebox'))return;
    renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(1.6,devicePixelRatio||1));cvs=renderer.domElement;root.querySelector('#g3').appendChild(cvs);
    buildWorld();size();addEventListener('resize',size);cvs.addEventListener('pointerdown',onTap);
    st.phase='setup';setUI();raf=requestAnimationFrame(loop);}).catch(e=>{ui.innerHTML=`<div class="gpanel"><b>Il gioco 3D non si è caricato</b><div class="gs">${escH(e.message||e)}</div>${btn('↻ Riprova','mount()','big')}</div>`;});
}
function stop(){cancelAnimationFrame(raf);raf=0;removeEventListener('resize',size);try{renderer?.dispose();renderer?.forceContextLoss?.();}catch(e){}renderer=null;foams=[];clouds=[];st.rods=[];document.getElementById('gamebox')?.remove();document.body.classList.remove('gaming');seaSound(0);}
addEventListener('hashchange',()=>{if(location.hash!=='#gioco'&&document.getElementById('gamebox'))stop();});
G.mount=mount;G.exit=()=>{stop();if(window.go)go('altro');};
function size(){if(!renderer)return;const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<h?68:50;camera.updateProjectionMatrix();}
const btn=(t,f,cls='')=>`<button class="gb ${cls}" onclick="GAME.${f}">${t}</button>`;
const suggestLead=w=>w<.3?100:w<.6?125:w<1?150:w<1.6?175:200;
function rodStatus(r){if(r.held)return 'in mano';if(!r.bait)return 'da innescare';if(r.state==='bite')return '🔔 ABBOCCATA!';if(r.baitLeft<=0)return 'esca finita?';return r.baitLeft>20?'in pesca':'esca consumata';}
function setUI(){const p=st.phase;let h='';
  if(p==='setup'){const w=wxAt(st.gt),sug=suggestLead(w.wave);
    h=`<div class="gpanel"><b>🎣 Castelporziano · ${gameDate().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</b>
      <div class="gs">Mare ${seaName(w.wave)} (${w.wave.toFixed(1).replace('.',',')} m), vento ${Math.round(w.ws)} km/h da ${windName(w.wd)}, acqua ${Math.round(w.sst)}°</div>
      <div class="grow"><span>Canne</span>${[2,3].map(n=>`<button class="gc ${st.nRods===n?'on':''}" onclick="GAME.setN(${n})">${n}</button>`).join('')}</div>
      <div class="grow"><span>Piombo</span>${[80,100,125,150,175,200].map(g=>`<button class="gc ${st.lead===g?'on':''}" onclick="GAME.setLead(${g})">${g} g</button>`).join('')}</div>
      <div class="gs">Consigliato ${sug} g: più leggero lanci più lontano, ma la corrente lo trascina.</div>
      <div class="grow"><span>Amo</span>${[['piccolo','n. 6'],['medio','n. 2'],['grande','2/0']].map(([k,n])=>`<button class="gc ${st.hook===k?'on':''}" onclick="GAME.setHook('${k}')">${n}</button>`).join('')}</div>
      ${btn('Pianta i picchetti e inizia','start()','big')}</div>`;}
  else if(p==='wait'){h=`<div class="gpanel slim"><div class="grods">${st.rods.map((r,i)=>`<button class="gr ${r.state==='bite'?'alert':''}" onclick="GAME.rod(${i})" ${st.busy?'disabled':''}><b>Canna ${i+1}</b><small>${r.bait?B[r.bait].n:'senza esca'}${r.dist?' · '+Math.round(r.dist)+' m':''}</small><small>${rodStatus(r)}</small></button>`).join('')}</div>
    ${st.busy?'':`<div class="grow" style="justify-content:center">${[1,2,4,8,16,32].map(s=>`<button class="gc ${st.speed===s?'on':''}" onclick="GAME.setSpeed(${s})">${s===1?'▶ 1x':s+'x'}</button>`).join('')}<button class="gc" onclick="GAME.bagView()">🧺 ${st.bag.length}</button></div>`}${st.msg?`<div class="gs" style="text-align:center">${st.msg}</div>`:''}</div>`;}
  else if(p==='atrod'){const r=st.rods[st.sel];h=`<div class="gpanel"><b>Canna ${st.sel+1}</b><div class="gs">${r.bait?B[r.bait].n+' a '+Math.round(r.dist)+' m · '+rodStatus(r):'Senza esca'}</div>
    ${r.state==='bite'?btn('⚡ FERRA!','strike()','big hot'):''}${r.bait?btn('🌀 Recupera e cambia esca','rebait()'):btn('🪝 Innesca','rebait()','big')}${btn('🪑 Torna a sedere','back()')}</div>`;}
  else if(p==='bait')h=`<div class="gpanel"><b>🪝 Innesca la canna ${st.sel+1}</b><div class="gbaits">${BAITS.map(b=>`<button class="gbt" onclick="GAME.bait('${b.k}')"><span>${b.e}</span><b>${b.n}</b><small>${b.d}</small></button>`).join('')}</div></div>`;
  else if(p==='cast')h=`<div class="gpanel"><b>🎯 Lancia · ${B[st.rods[st.sel].bait].n}</b><div class="gs">Tieni premuto per caricare, rilascia nella zona verde. ${(()=>{const w=wxAt(st.gt),hp=windHelp(w.wd);return w.ws>12?(hp>.3?'Vento da terra: ti aiuta.':hp<-.3?'Vento dal mare: lancerai più corto.':'Vento laterale.'):'';})()}</div><div class="gpow"><i id="gpw"></i><s></s></div><button class="gb big" id="gcastb">🎣 Carica e lancia</button></div>`;
  else if(p==='fight')h=`<div class="gpanel"><b id="gfti">Combattimento</b><div class="gbar"><i id="gten"></i><span>tensione</span></div><div class="gbar dist"><i id="gdis"></i><span id="gdt">distanza</span></div>
    <div class="grow"><span>Frizione</span><input type="range" min="1" max="10" value="${st.fight?.drag||5}" oninput="GAME.drag(this.value)" style="flex:1"></div><button class="gb big" id="greel">🌀 Tieni premuto per recuperare</button></div>`;
  else if(p==='catch'){const c=st.catchShow;h=`<div class="gpanel">${c.fish?'<div class="gfish"><canvas id="gfc" width="600" height="260"></canvas></div>':''}
    <b style="font-size:22px">${c.fish?escH(c.sp.n):c.txt}</b>${c.fish?`<div class="gs" style="font-size:17px">${c.crab?'larghezza '+c.l+' cm':c.l+' cm'} · ${c.w<1?Math.round(c.w*1000)+' g':c.w.toFixed(2).replace('.',',')+' kg'}${c.rec?' · 🏆 record!':''}</div>
    ${c.sp.legal&&c.l<c.sp.legal?`<div class="gs warn">⚠️ Sotto misura (minimo ${c.sp.legal} cm): va rilasciato.</div>`:''}${c.crab?'<div class="gs">Specie invasiva: non va rimessa in mare.</div>':''}`:`<div class="gs">${c.why||''}</div>`}
    <div class="grow" style="justify-content:center">${c.fish?(c.crab?btn('🪣 Nel secchio','keep()','big'):(c.sp.legal&&c.l<c.sp.legal?btn('💚 Rilascia','release()','big'):btn('💚 Rilascia','release()')+btn('🧺 Tieni','keep()','big'))):(c.left?btn('↩ Rimetti sul picchetto','putBack()'):'')+btn('🪝 Innesca di nuovo','rebait()','big')}</div></div>`;}
  else if(p==='bag')h=`<div class="gpanel"><b>🧺 Il tuo carniere</b><div class="gs">Oggi: ${st.bag.length} pesci · ${st.bag.reduce((a,c)=>a+c.w,0).toFixed(2).replace('.',',')} kg · Totale: ${st.total.n} pesci, ${st.total.pts} punti</div>
    <div class="glist">${st.bag.slice().reverse().map(c=>`<div>${c.rel?'💚':'🧺'} <b>${escH(c.n)}</b> ${c.l} cm · ${c.w<1?Math.round(c.w*1000)+' g':c.w.toFixed(2).replace('.',',')+' kg'} <small>${new Date(c.t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})} · ${escH(c.bait)}</small></div>`).join('')||'<div class="gs">Ancora niente: pazienza, è surfcasting!</div>'}</div>
    <div class="gs">Record: ${Object.entries(st.best).map(([k,v])=>`${escH(k)} ${v.toFixed(2).replace('.',',')} kg`).join(' · ')||'nessuno'}</div>${btn('↩ Torna alle canne','toWait()','big')}</div>`;
  else if(p==='busy')h=st.msg?`<div class="gpanel slim"><div class="gs" style="text-align:center">${st.msg}</div></div>`:'';
  ui.innerHTML=h;
  const cb=document.getElementById('gcastb');if(cb){cb.onpointerdown=e=>{e.preventDefault();ac();st.cast={p:0,dir:1,on:true};AN.target='castBack';};const rel=()=>{if(st.cast?.on)doCast();};cb.onpointerup=rel;cb.onpointerleave=rel;}
  const rb=document.getElementById('greel');if(rb){const on=e=>{e.preventDefault();if(st.fight)st.fight.reel=true;},off=()=>{if(st.fight)st.fight.reel=false;};rb.onpointerdown=on;rb.onpointerup=off;rb.onpointerleave=off;rb.onpointercancel=off;}
  if(p==='catch')setTimeout(drawFishCard,0);
}
G.setN=n=>{st.nRods=n;LSS('nrods',n);setUI();};G.setLead=g=>{st.lead=g;LSS('lead',g);setUI();};G.setHook=k=>{st.hook=k;LSS('hook',k);setUI();};
G.setSpeed=s=>{st.speed=s;LSS('speed',s);setUI();};G.bagView=()=>{st.phase='bag';setUI();};G.toWait=()=>{st.phase='wait';setUI();};G.drag=v=>{if(st.fight)st.fight.drag=+v;};
G.start=()=>{setupRods();st.rods.forEach(placeRodOnSpike);st.phase='wait';st.msg='Tocca una canna per innescarla e lanciare.';setUI();};

/* ---------- movimenti del pescatore (sequenze) ---------- */
const sleep=s=>new Promise(r=>setTimeout(r,s*1000));
function pose(name){AN.target=name;}
function walkTo(x,z,speed=1.4){return new Promise(res=>{AN.walkTarget={x,z,res};AN.speed=speed;AN.moving=true;});}
function faceSea(){AN.faceTo=0;}
async function standUp(){if(AN.target!=='sit')return;pose('stand');AN.pos.z-=.05;await sleep(.7);}
async function sitDown(){AN.faceTo=0;pose('sit');await sleep(.7);}
async function goToRod(i,run){const r=st.rods[i];await standUp();await walkTo(r.x+.55,ROD_Z+1.3,run?3.4:1.5);AN.faceTo=0;await sleep(.25);}
async function pickRod(i){const r=st.rods[i];pose('bend');await sleep(.55);r.held=true;AN.holding=i;pose('hold');await sleep(.5);}
async function putRod(i){const r=st.rods[i];pose('bend');await sleep(.55);r.held=false;AN.holding=-1;placeRodOnSpike(r);pose('stand');await sleep(.4);}
async function backToChair(){await walkTo(CHAIR.x,CHAIR.z-.05,1.4);await sitDown();}
const seq=async f=>{if(st.busy)return;st.busy=true;st.speed=1;try{await f();}finally{st.busy=false;}};

G.rod=i=>seq(async()=>{st.sel=i;const r=st.rods[i];st.phase='busy';st.msg=r.state==='bite'?'🏃 Corre alla canna!':'🚶 Va alla canna '+(i+1)+'…';setUI();
  await goToRod(i,r.state==='bite');st.phase='atrod';st.msg='';setUI();});
G.back=()=>seq(async()=>{st.phase='busy';st.msg='';setUI();if(AN.holding>=0)await putRod(AN.holding);await backToChair();st.phase='wait';setUI();});
G.rebait=()=>seq(async()=>{const r=st.rods[st.sel];st.phase='busy';st.msg=r.dist?'🌀 Recupera la lenza…':'';setUI();
  if(!r.held)await pickRod(st.sel);
  if(r.dist>0){pose('reel');const d0=r.dist;for(let t=0;t<1;t+=.05){r.dist=d0*(1-t);AN.reelSpin=1;await sleep(.07);}r.dist=0;AN.reelSpin=0;}
  r.bait=null;r.state='idle';r.bitePlan=null;r.sinker.visible=false;pose('bend');st.phase='bait';setUI();});
G.putBack=()=>seq(async()=>{st.phase='busy';setUI();await putRod(st.sel);await backToChair();st.phase='wait';setUI();});
G.bait=k=>{const r=st.rods[st.sel];r.bait=k;r.baitLeft=B[k].life*(k==='cozza'&&st.hook==='piccolo'?1.2:1);click();pose('hold');st.phase='cast';setUI();};
function doCast(){const c=st.cast;c.on=false;const r=st.rods[st.sel],w=wxAt(st.gt);
  const p=c.p,q=p>.78&&p<.92?1:p>.92?.8-(p-.92)*3:p/.78*.95;
  const leadF=clamp(1.15-(st.lead-100)/400,.85,1.1),baitF=r.bait==='cefalotto'?.55:r.bait==='sarda'||r.bait==='seppia'?.85:1,wind=1+windHelp(w.wd)*clamp(w.ws/60,0,.35);
  const dist=clamp(130*q*leadF*baitF*wind+rnd(-6,6),8,150);st.cast=null;
  seq(async()=>{st.phase='busy';st.msg='';setUI();pose('castFwd');whoosh();await sleep(.18);
    // il piombo vola: parabola dalla cima al punto d'arrivo
    const tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const drift=(Math.sin((w.wd-FACE)*R))*w.ws/40*3;const end=new T.Vector3(r.x+drift+rnd(-2,2),0,-dist);
    r.flight={a:tip.clone(),b:end,t:0,dur:1.1+dist/120};r.sinker.visible=true;r.dist=0.01;r.state='flying';
    await sleep(r.flight.dur);splash();burst(end,1);r.flight=null;r.dist=dist;r.sx=end.x;r.sz=end.z;r.state='fishing';r.landT=st.gt;
    st.msg=q>=1?`Lancio perfetto: ${Math.round(dist)} m!`:q>.8?`Buon lancio: ${Math.round(dist)} m`:`Lancio corto: ${Math.round(dist)} m`;setUI();
    pose('hold');await sleep(.6);await putRod(st.sel);await backToChair();st.phase='wait';setUI();});}

/* ---------- abboccate, ferrata e combattimento ---------- */
function startBite(r){
  const ws=speciesWeights(r),tot=ws.reduce((a,[,f])=>a+f,0),u=Math.random()*(tot+.12);let acc=0,sp=null;for(const [s,f] of ws){acc+=f;if(u<acc){sp=s;break;}}
  const kind=sp?sp.bite:'picchiettata',steal=!sp||Math.random()<.18;
  const pats={picchiettata:t=>(Math.sin(t*22)>.6?.25:0)*(Math.sin(t*3.1)>-.2?1:.2),nervosa:t=>(Math.sin(t*15)>.3?.32:0)+(t%2.3<.25?.4:0),decisa:t=>t<1.5?(Math.sin(t*18)>.5?.22:0):(t%1.8<.8?.7:.18),violenta:t=>t<.6?.15:(t%1.2<.8?.95:.35),partenza:t=>t<1?.3:1};
  r.state='bite';r.biteT=0;r.bitePlan={sp,steal,kind,pattern:pats[kind],len:kind==='partenza'?13:kind==='violenta'?12:kind==='decisa'?16:12};
  bell(kind==='picchiettata'?2:kind==='partenza'||kind==='violenta'?5:3,kind==='picchiettata'?.12:.3);try{navigator.vibrate?.(kind==='violenta'||kind==='partenza'?[120,60,200]:[60]);}catch(e){}
  st.msg=`🔔 Canna ${r.i+1}: ${kind==='picchiettata'?'piccole tocche…':kind==='nervosa'?'tocche nervose':kind==='decisa'?'la cima si piega decisa!':'partenza violenta!'}`;st.speed=1;if(st.phase==='wait'||st.phase==='atrod')setUI();}
G.strike=()=>seq(async()=>{const r=st.rods[st.sel];if(r.state!=='bite')return;const p=r.bitePlan,strong=p.pattern(r.biteT)>.4;
  st.phase='busy';setUI();await pickRod(st.sel);pose('strike');whoosh();await sleep(.35);
  let ok=p.sp&&!p.steal&&(strong?.85:.3)>Math.random();if(p.sp&&st.hook==='grande'&&p.sp.w[1]<.4)ok=ok&&Math.random()<.5;
  if(!ok){r.state='fishing';const lost=p.steal||Math.random()<.5;if(lost)r.baitLeft=0;pose('hold');await sleep(.4);
    showCatch({fish:false,txt:strong?'Mancato!':'Troppo presto',why:strong?'Hai ferrato ma il pesce non era allamato.':'Erano solo tocche: aspetta che la cima si pieghi decisa prima di ferrare.',left:!lost});return;}
  const sp=p.sp,w=sizeOf(sp);st.fight={r,sp,w,len:lenOf(sp,w),dist:r.dist,ten:.3,reel:false,drag:5,run:0,slack:0,t:0,pow:sp.pow*(0.6+Math.min(1.6,w/sp.w[1])*.45)};
  r.state='fight';pose('reel');st.phase='fight';setUI();});
function updFight(dt){const f=st.fight;if(!f||st.phase!=='fight')return;f.t+=dt;const r=f.r,w=wxAt(st.gt);
  if(f.run<=0&&Math.random()<dt*.5*f.pow)f.run=rnd(.6,2)*f.pow;f.run=Math.max(0,f.run-dt);
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
function onTap(e){ac();if(st.phase!=='wait'||st.busy)return;// tocco sulla scena: la canna più vicina
  const rect=cvs.getBoundingClientRect(),m=new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);let bi=-1,bd=.25;
  st.rods.forEach((r,i)=>{const p=new T.Vector3(r.x,2,ROD_Z).project(camera);const d=Math.abs(p.x-m.x);if(d<bd){bd=d;bi=i;}});if(bi>=0)G.rod(bi);}

/* ---------- ciclo principale ---------- */
function loop(){raf=requestAnimationFrame(loop);if(!renderer)return;const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
  const gmul=(st.phase==='wait'&&!st.busy)?st.speed:1;st.gt+=dt*1000*gmul;const gmin=dt*gmul/60;const w=wxAt(st.gt);
  // pescatore
  if(AN.moving&&AN.walkTarget){const wt=AN.walkTarget,dx=wt.x-AN.pos.x,dz=wt.z-AN.pos.z,d=Math.hypot(dx,dz);
    if(d<.05){AN.moving=false;AN.walkTarget=null;wt.res();}else{const s=Math.min(d,AN.speed*dt);AN.pos.x+=dx/d*s;AN.pos.z+=dz/d*s;AN.walk+=dt*AN.speed*5.2;const ty=Math.atan2(-dx,-dz);AN.rotY=lerpAng(AN.rotY,ty,1-Math.exp(-10*dt));}
    AN.pos.y=Math.max(0,AN.pos.z*.035);if(AN.target==='sit'||AN.target==='bend')pose(AN.holding>=0?'hold':'stand');}
  else if(AN.faceTo!=null){AN.rotY=lerpAng(AN.rotY,AN.faceTo,1-Math.exp(-8*dt));}
  lerpPose(dt,AN.target==='castFwd'||AN.target==='strike'?14:6);applyPose(t);
  if(st.cast?.on){st.cast.p+=st.cast.dir*dt*1.15;if(st.cast.p>1){st.cast.p=1;st.cast.dir=-1;}if(st.cast.p<0){st.cast.p=0;st.cast.dir=1;}const el=document.getElementById('gpw');if(el)el.style.width=(st.cast.p*100)+'%';}
  // canne
  for(const r of st.rods){
    if(r.state==='fishing'){r.baitLeft-=gmin*(1+(w.wave||0)*.6);if(Math.random()<biteRate(r)*gmin)startBite(r);}
    if(r.state==='bite'){r.biteT+=dt;if(r.biteT>r.bitePlan.len){const pl=r.bitePlan;r.state='fishing';r.baitLeft-=pl.steal?999:10;st.msg=`Canna ${r.i+1}: ha smesso di battere${pl.steal?' (forse ti hanno rubato l\'esca)':''}.`;if(st.phase==='wait'||st.phase==='atrod')setUI();}}
    const swell=r.dist>0?Math.sin(t*2*Math.PI/Math.max(3,w.wper||5)+r.i)*(w.wave||.3)*.12:0;let bite=r.state==='bite'?r.bitePlan.pattern(r.biteT):0;if(st.fight?.r===r)bite=st.fight.ten*1.1;if(r.state==='flying')bite=0;
    r.bend=lerp(r.bend,(r.dist>0?.12:0)+swell+bite,.25);bendRod(r.obj,clamp(r.bend,0,1.3)*(r.held?.8:1));
    if(r.held)rodInHand(r);
    // mulinello: rotore e manovella girano quando si recupera
    if(r.held&&AN.holding===r.i){const U=r.obj.userData;U.rotor.rotation.y+=dt*AN.reelSpin*22;U.lineOn.rotation.y+=dt*AN.reelSpin*22;U.crank.rotation.x+=dt*AN.reelSpin*7;AN.crank+=dt*AN.reelSpin*7;U.lineOn.position.y=.115+Math.sin(AN.crank*.5)*.008*(AN.reelSpin?1:0);}
    r.obj.userData.glow.visible=night()>.25;r.obj.userData.glow.material.opacity=r.state==='bite'?(.6+.4*Math.sin(t*20)):.9;
    // lenza
    const tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const a=r.line.geometry.attributes.position;
    if(r.flight){const f=r.flight;f.t+=dt/f.dur;const k=clamp(f.t,0,1),pnt=new T.Vector3().lerpVectors(f.a,f.b,k);pnt.y+=Math.sin(k*Math.PI)*(12+f.b.distanceTo(f.a)*.12);r.sinker.position.copy(pnt);}
    else if(r.dist>0){const fd=st.fight?.r===r?Math.max(0,st.fight.dist):r.dist,kk=fd/Math.max(1,-r.sz);r.sinker.position.set(lerp(r.x,r.sx,kk),.0,-fd);}
    const end=r.sinker.visible?r.sinker.position:tip;const tens=st.fight?.r===r?st.fight.ten:.2+r.bend*.4;
    for(let i=0;i<40;i++){const u=i/39,x=lerp(tip.x,end.x,u),z=lerp(tip.z,end.z,u),y=lerp(tip.y,end.y,u)-Math.sin(u*Math.PI)*(r.flight?0:(1-tens)*Math.min(3,tip.distanceTo(end)*.05));a.setXYZ(i,x,Math.max(y,end===tip?y:-.02),z);}
    a.needsUpdate=true;r.line.visible=r.sinker.visible;}
  updFight(dt);
  // pesce appeso che esce dall'acqua
  if(fishMesh.visible&&st.fight==null){const r=st.rods[st.sel],tip=new T.Vector3();r.obj.userData.tip.getWorldPosition(tip);const k=clamp((performance.now()-fishMesh.userData.show)/900,0,1);
    fishMesh.position.set(lerp(r.x,tip.x,k),lerp(.1,tip.y-.6,k),lerp(-2,tip.z+.2,k));fishMesh.rotation.set(0,0,Math.PI/2+Math.sin(t*14)*.4);}
  // schizzi
  const sp=splashP.userData;if(sp.t>0){sp.t-=dt*1.2;const a=splashP.geometry.attributes.position;for(let i=0;i<60;i++){const v=sp.v[i];v.y-=9.8*dt;a.setXYZ(i,a.getX(i)+v.x*dt,Math.max(0,a.getY(i)+v.y*dt),a.getZ(i)+v.z*dt);}a.needsUpdate=true;splashP.material.opacity=clamp(sp.t,0,1);}
  updEnv(w,t,dt);updCam(dt,t);
  if(!loop.h||t-loop.h>.5){loop.h=t;drawHud(w);if(st.phase==='wait'){const els=ui.querySelectorAll('.gr small:last-child');st.rods.forEach((r,i)=>{if(els[i])els[i].textContent=rodStatus(r);});}}
  renderer.setScissorTest(false);renderer.setViewport(0,0,root.clientWidth,root.clientHeight);renderer.render(scene,camera);
  if((st.phase==='fight'||(st.phase==='busy'&&AN.reelSpin))&&AN.holding>=0){const r=st.rods[AN.holding],rp=new T.Vector3();r.obj.userData.reel.getWorldPosition(rp);
    if(!G.rc)G.rc=new T.PerspectiveCamera(32,1,.02,200);const W=root.clientWidth,H=root.clientHeight,sz=Math.round(Math.min(W,H)*.38),x=10,y=H-sz-Math.round(H*.13);
    const side=new T.Vector3(Math.cos(AN.rotY),0,-Math.sin(AN.rotY));G.rc.position.copy(rp).addScaledVector(side,-.8).add(new T.Vector3(0,.3,.35));G.rc.lookAt(rp.x,rp.y+.04,rp.z);G.rc.aspect=1;G.rc.updateProjectionMatrix();
    renderer.setScissorTest(true);renderer.setScissor(x-3,y-3,sz+6,sz+6);renderer.setViewport(x-3,y-3,sz+6,sz+6);renderer.setClearColor(0xffffff,1);renderer.clear();
    renderer.setScissor(x,y,sz,sz);renderer.setViewport(x,y,sz,sz);renderer.render(scene,G.rc);renderer.setScissorTest(false);}}
const lerpAng=(a,b,f)=>{let d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+d*f;};
let NIGHT=0;const night=()=>NIGHT;
function updEnv(w,t,dt){const d=gameDate(),sun=sunPos(d,SPOT.lat,SPOT.lon),mo=moonPosG(d,SPOT.lat,SPOT.lon);
  const dir=(alt,az)=>{const a=(az-FACE)*R,e=alt*R;return new T.Vector3(Math.sin(a)*Math.cos(e),Math.sin(e),-Math.cos(a)*Math.cos(e));};
  const sd=dir(sun.alt,sun.az),md=dir(mo.alt,mo.az),cc=clamp(w.cc/100,0,1);NIGHT=clamp((-sun.alt+2)/10,0,1);
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
  moon.position.copy(md).multiplyScalar(8000);moon.visible=mo.alt>-3;moon.material.opacity=clamp(.25+NIGHT,0,1)*(1-cc*.6);if(moon.userData.ph==null||Math.abs(moon.userData.ph-mo.ph)>6){moon.material.map=moonTex(mo.ph);moon.material.needsUpdate=true;moon.userData.ph=mo.ph;}
  const n=Math.round(cc*clouds.length),tint=new T.Color().setHSL(.07,sun.alt<10&&sun.alt>-6?.5:.05,lerp(.12,.92,day));
  clouds.forEach((c,i)=>{c.visible=i<n;c.material.color.copy(tint);c.material.opacity=clamp(.55+cc*.4,0,1);c.position.x+=Math.sin((w.wd-FACE+90)*R)*w.ws*dt*.15;if(c.position.x>3000)c.position.x=-3000;if(c.position.x<-3000)c.position.x=3000;});
  const lampOn=NIGHT>.5&&st.lamp;headLamp.intensity=lampOn?1.6:0;AN.obj.userData.J.lamp.material.emissiveIntensity=lampOn?2:0;
  // frangenti e risacca: più numerosi e alti con mare grosso
  const per=Math.max(3,w.wper||5),wh=w.wave||.3,nb=wh<.2?1:wh<.6?2:wh<1.2?3:4;
  const nf=Math.min(foams.length,2+Math.round(wh*4));
  foams.forEach((f,i)=>{const u=f.userData,on=i<nf;f.visible=on;if(!on)return;u.cyc+=dt/(per*u.rate*(1.4+u.d0/30));if(u.cyc>=1){u.cyc=0;newWave(f);}
    const cyc=u.cyc,a=f.geometry.attributes.position,b=u.base,d=lerp(u.d0*(1+wh*.4),-.4,cyc);
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
  seaSound(clamp(.05+(w.wave||.3)*.12,.05,.35));}
// telecamera: dietro al pescatore quando si muove, larga sulle canne quando è seduto, vicina al mulinello nel combattimento
const CAM={p:null,l:null};
function updCam(dt,t){let p,l;const a=AN.pos;
  if(G.camOv){camera.position.set(...G.camOv.p);camera.lookAt(...G.camOv.l);return;}
  if(st.phase==='fight'||(AN.holding>=0&&st.phase!=='wait')){p=new T.Vector3(a.x+1.5,a.y+1.9,a.z+4.6);l=new T.Vector3(a.x-.2,a.y+1.7,a.z-6);}
  else if(st.busy||st.phase==='atrod'||st.phase==='bait'||st.phase==='cast'){const dx=Math.sin(AN.rotY),dz=Math.cos(AN.rotY);p=new T.Vector3(a.x+dx*4.6+.8,a.y+2.2,a.z+dz*4.6);l=new T.Vector3(a.x-dx*4,a.y+1.3,a.z-dz*4);}
  else{const por=camera.aspect<1;p=new T.Vector3(CHAIR.x+(por?.6:1),CHAIR.z*.035+(por?3.4:2.7),CHAIR.z+(por?9:6.5));l=new T.Vector3(0,.9,-14);}
  if(!CAM.p){CAM.p=p.clone();CAM.l=l.clone();}const f=1-Math.exp(-2.5*dt);CAM.p.lerp(p,f);CAM.l.lerp(l,f);camera.position.copy(CAM.p);camera.position.y+=Math.sin(t*.4)*.02;camera.lookAt(CAM.l);}
function drawHud(w){const d=gameDate(),mp=moonPosG(d,SPOT.lat,SPOT.lon);
  const wi=w.code>=95?'⛈️':w.code>=80?'🌦️':w.code>=51?'🌧️':w.code>=45?'🌫️':w.cc>75?'☁️':w.cc>35?'⛅':sunPos(d,SPOT.lat,SPOT.lon).alt>0?'☀️':'🌙';
  hud.innerHTML=`<div><b>${d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</b>${st.speed>1&&st.phase==='wait'&&!st.busy?' ⏩':''}</div><div>${wi} ${Math.round(w.temp)}°</div><div>🌬️ ${Math.round(w.ws)} ${windName(w.wd)}</div><div>🌊 ${(w.wave||0).toFixed(1).replace('.',',')} m · ${Math.round(w.sst)}°</div><div>${['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][Math.round(mp.ph/45)%8]}</div><div>🎣 ${w.idx}</div>${st.sim?'<div title="dati simulati">⚠️</div>':''}`;}
G._bite=i=>startBite(st.rods[i]);G._sp=n=>SP.find(x=>x.n===n);G._ui=()=>setUI();G._an=AN;
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
    let f=sp.ab*(sp.mo[m]||.05)*b*waveF(sp,w.wave||0)*(sp.time[per]||.5)*distF(sp,r.dist);
    if(sp.n==='Spigola'&&temp<15)f*=1.2;if(sp.n==='Orata'&&temp<13)f*=.4;if((sp.n==='Serra'||sp.n==='Leccia stella')&&temp<18)f*=.3;
    if(st.hook==='piccolo'&&sp.w[1]>1)f*=.7;if(st.hook==='grande'&&sp.w[1]<.4)f*=.35;
    return [sp,f];});}
function biteRate(r){// abboccate per minuto di gioco
  if(!r.bait||r.state!=='fishing'||r.baitLeft<=0)return 0;const w=wxAt(st.gt),idx=clamp(w.idx??50,0,100);
  const s=speciesWeights(r).reduce((a,[,f])=>a+f,0);return s*(.35+idx/100*1.3)*.045+.004; // + piccoli pesci e granchietti che rubano l'esca
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
#ghud{position:absolute;left:8px;right:146px;top:calc(env(safe-area-inset-top) + 8px);display:flex;flex-wrap:wrap;gap:6px;pointer-events:none}
#ghud div{background:rgba(4,14,26,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border-radius:12px;padding:5px 9px;font:600 13.5px Outfit,sans-serif}
#gx,#gau{position:absolute;top:calc(env(safe-area-inset-top) + 8px);width:40px;height:40px;border-radius:12px;border:0;background:rgba(4,14,26,.65);color:#fff;font-size:18px;cursor:pointer}
#gx{right:8px}#gau{right:54px}#glamp{position:absolute;top:calc(env(safe-area-inset-top) + 8px);right:100px;width:40px;height:40px;border-radius:12px;border:0;background:rgba(4,14,26,.65);color:#fff;font-size:18px;cursor:pointer}#glamp.off{opacity:.45;filter:grayscale(1)}
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
