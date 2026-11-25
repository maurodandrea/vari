/* Giorgia a Cavallo – logica di gioco */
'use strict';
(function(){
const {U,V3,TAU,scene,camera,$,LS}=EQ;
const rnd=U.rnd;
let T=0;

/* ======================= SALVATAGGIO ======================= */
const DEF_OUTFIT={helmet:null,protector:null,top:'polo:0xffffff',pants:0xf4f4f2,boots:0x141414,gloves:null,whip:false};
let save=LS.get('save',null);
if(save&&save.horses&&save.horses.length<EQ.HORSES.length){while(save.horses.length<EQ.HORSES.length)save.horses.push({hunger:50,clean:40,happy:70,energy:90});}
if(!save||!save.horses||save.horses.length!==EQ.HORSES.length)save={sel:0,outfit:Object.assign({},DEF_OUTFIT),horses:EQ.HORSES.map((h,i)=>({hunger:45+i*5,clean:30+i*6,happy:70,energy:90})),t:Date.now(),best:{}};
{const hrs=Math.min(72,Math.max(0,(Date.now()-(save.t||Date.now()))/3.6e6));
 save.horses.forEach(s=>{s.hunger=U.clamp(s.hunger-hrs*5,5,100);s.clean=U.clamp(s.clean-hrs*3,10,100);s.energy=U.clamp(s.energy+hrs*25,0,100);});}
save.horses.forEach(h=>{if(h.thirst==null)h.thirst=80;});
function persist(){save.t=Date.now();save.outfit=Object.assign({},P.outfit);LS.set('save',save);}

/* ======================= COSTRUZIONE ======================= */
/* personalizzazione dei cavalli (nome e mantello) */
const COATS=[
  {k:'baio',l:'Baio',body:0x7b3e1b,dark:0x1b120c,mane:0x17100b,points:true},
  {k:'sauro',l:'Sauro',body:0x9a4a1c,dark:0x7a3812,mane:0xa4561f},
  {k:'morello',l:'Morello',body:0x1d1917,dark:0x110e0d,mane:0x0b0909},
  {k:'grigio',l:'Grigio',body:0xd8d4cc,dark:0x8f8a82,mane:0xece8df,dapple:true,muzzle:0x5b5350},
  {k:'bianco',l:'Bianco',body:0xf2efe9,dark:0xd8d4cc,mane:0xf6f4ef,muzzle:0x8a7f7a},
  {k:'palomino',l:'Palomino',body:0xc98f45,dark:0xa46f30,mane:0xf3e5c6},
  {k:'isabella',l:'Isabella',body:0xc8a06a,dark:0x2a1e14,mane:0x2a1e14,points:true},
  {k:'pezzato',l:'Pezzato',body:0x6a3618,dark:0x2a170c,mane:0x2a1b12,pinto:true},
  {k:'leopardato',l:'Leopardato',body:0xe6e2da,dark:0x6a5f56,mane:0x4a4038,apalo:true,muzzle:0x5b5350}];
save.custom=save.custom||{};
EQ.HORSES.forEach(h=>{h.breed=h.breed||h.race.split(',')[0];});
function applyCustom(i){const c=save.custom[i];if(!c)return;const h=EQ.HORSES[i];
  if(c.name)h.name=c.name;
  if(c.coat){const co=COATS.find(x=>x.k===c.coat);if(co){['points','dapple','pinto','apalo','muzzle'].forEach(k=>delete h[k]);Object.assign(h,{body:co.body,dark:co.dark,mane:co.mane},co.points?{points:true}:{},co.dapple?{dapple:true}:{},co.pinto?{pinto:true}:{},co.apalo?{apalo:true}:{},co.muzzle?{muzzle:co.muzzle}:{});h.race=h.breed+', '+co.l.toLowerCase();}}}
EQ.HORSES.forEach((h,i)=>applyCustom(i));
const yard=EQ.buildYard();
try{EQ.populate.yard(yard);}catch(e){console.error(e);}
EQ.setSky(yard.sky);
const Y=yard.spots;
EQ.gender=()=>LS.get('pgender','f');EQ.A=()=>EQ.gender()==='m'?'o':'a';
EQ.pname=()=>(LS.get('pname','')||'').trim()||(EQ.gender()==='m'?'Amico':'Amica');
const P=EQ.buildGiorgia(); P.setOutfit(save.outfit); P.setGender(EQ.gender()); scene.add(P.root);
const horses=EQ.HORSES.map((d,i)=>{const H=EQ.buildHorse(d);H.i=i;H.stats=save.horses[i];scene.add(H.root,H.reins,H.rope);H.x=0;H.z=0;H.h=0;H.sp=0;H.st={};H.bt=rnd(1,4);
  H.addDirt(Math.round((100-H.stats.clean)/4));H.dirt0=H.dirtLeft();return H;});
const G={state:'boot',world:yard,loc:'yard',cur:null,leading:false,sel:U.clamp(save.sel|0,0,horses.length-1),act:null,course:null,trip:null,busy:false,lock:0,didRide:false};
window.__G=G;
// cavalli al pascolo nel paddock
const paddockHorses=[];

// particelle
const FX={dust:EQ.Particles(260,.35,0xd2bd98,{opacity:.4}),water:EQ.Particles(500,.09,0xcfeeff,{floor:.03}),spark:EQ.Particles(160,.16,0xfff0a0),splash:EQ.Particles(300,.22,0xf4fbff,{opacity:.85}),stone:EQ.Particles(60,.06,0x6b5a48,{floor:.03}),heart:EQ.Particles(40,.25,0xff6fa8)};
for(const k in FX)scene.add(FX[k].obj);

// corde della posta
const tieLines=[0,1].map(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:EQ.C(0xd94f30)}));l.frustumCulled=false;l.visible=false;scene.add(l);return l;});

// oggetto in mano (carota/mela)
const handItem=new THREE.Group();P.handR.add(handItem);handItem.visible=false;
const carrotM=EQ.mesh(EQ.G.cone(.025,.18,8),EQ.mat(0xf07b16,.6),0,-.06,.04,handItem);carrotM.rotation.x=1.6;
const appleM=EQ.mesh(EQ.G.sph(.045,12,10),EQ.mat(0xc2262d,.35),0,-.05,.03,handItem);
// spazzola / tubo in mano
const brushM=EQ.mesh(EQ.G.box(.07,.05,.14),EQ.mat(0x8a5a34,.7),0,-.06,.02,P.handR);brushM.visible=false;
const hoseM=EQ.mesh(EQ.G.cyl(.02,.025,.22,8),EQ.mat(0x3cb043,.5),0,-.07,.06,P.handR);hoseM.rotation.x=1.4;hoseM.visible=false;
const nozzle=new THREE.Object3D();nozzle.position.set(0,.12,0);hoseM.add(nozzle);

/* ======================= OSTACOLI / GARE ======================= */
const LEVELS=[
  {name:'Pony',sub:'5 ostacoli',par:40,start:[-25,-21,0],obs:[[-25,-4,0,'v',.6],[-6,18,90,'v',.7],[22,6,180,'v',.7],[22,-10,180,'o',.7],[0,-18,270,'v',.8]]},
  {name:'Junior',sub:'7 ostacoli',par:52,start:[-28,-24,0],obs:[[-28,-10,0,'v',.8],[-28,1,0,'o',.85],[-8,20,90,'v',.9],[12,20,90,'o',.9],[30,4,180,'v',1.0],[12,-12,242,'o',.95],[-10,-20,262,'v',1.0]]},
  {name:'Campionessa',sub:'9 ostacoli alti',par:66,start:[-30,-25,0],obs:[[-30,-13,0,'v',1.0],[-30,-4,0,'o',1.0],[-14,20,90,'v',1.1],[6,20,90,'o',1.1],[28,10,160,'v',1.1],[30,-8,180,'o',1.15],[12,-20,270,'v',1.1],[-6,-6,0,'v',1.15],[6,8,45,'o',1.2]]},
];
let AR=Y.arena;
const tx=(x,z,A)=>{A=A||AR;return[A.cx+x*A.hx*.0241,A.cz+z*A.hz*.0345];};
let obsGroup=null, obstacles=[], fallen=[], practice=[];
function makeObs(L,A,parent,prac){const g=new THREE.Group();parent.add(g);
  const list=L.obs.map((d,i)=>{const [x,z]=tx(d[0],d[1],A);return EQ.buildObstacle(g,[x,z,d[2],d[3],d[4]],i);});
  list.forEach(o=>o.practice=!!prac);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return {g,list,A};}
function buildPractice(w){
  practice.forEach(p=>{if(p.g.parent)p.g.parent.remove(p.g);p.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});});practice=[];
  const S=w.spots||{};
  if(S.arena)practice.push(makeObs(w===yard?LEVELS[2]:LEVELS[0],S.arena,w.group,true));
  if(S.arena2)practice.push(makeObs(LEVELS[1],S.arena2,w.group,true));
  if(S.free)practice.push(makeObs({obs:[[-30,-14,0,'v',.7],[30,14,180,'o',.8]]},S.free,w.group,true));
  obstacles=practice.reduce((a,p)=>a.concat(p.list),[]);
}
function buildObstacles(L,A){
  if(obsGroup){if(obsGroup.parent)obsGroup.parent.remove(obsGroup);obsGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();});obsGroup=null;}
  fallen=[];const o=makeObs(L,A,W().group,false);obsGroup=o.g;practice.forEach(p=>{if(p.A===A)p.g.visible=false;});return o.list;
}
buildPractice(yard);
const marker=new THREE.Group();scene.add(marker);
{const m=new THREE.MeshBasicMaterial({color:0xffd23f});const c=new THREE.Mesh(new THREE.ConeGeometry(.45,.9,12),m);c.rotation.x=Math.PI;marker.add(c);const r=new THREE.Mesh(new THREE.TorusGeometry(.5,.07,6,20),m);r.rotation.x=Math.PI/2;r.position.y=.55;marker.add(r);marker.visible=false;}
const chev=new THREE.Group();scene.add(chev);
{const sh=new THREE.Shape();sh.moveTo(-1.2,0);sh.lineTo(0,1.1);sh.lineTo(1.2,0);sh.lineTo(.8,0);sh.lineTo(0,.7);sh.lineTo(-.8,0);sh.closePath();
 const mm=new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false});chev.userData.m=mm;
 for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),mm);m.rotation.x=Math.PI/2;m.position.set(0,.06,-7+i*1.6);chev.add(m);}chev.visible=false;}

/* ======================= UI ======================= */
let msgT=0;
function msg(h,d){$('msg').innerHTML=h;$('msg').classList.add('on');msgT=d||1.6;}
function hint(h){const e=$('hint');if(h){e.innerHTML=h;e.classList.add('on');}else e.classList.remove('on');}
let actSig='',actList=[];
function setActions(list){
  actList=list;const sig=list.map(a=>a.id+(a.dis?'d':'')).join('|');if(sig===actSig)return;actSig=sig;
  const el=$('actions');el.innerHTML='';
  list.forEach((a,k)=>{const b=document.createElement('button');b.className='abtn'+(a.dis?' dis':'');b.innerHTML=`<i>${a.icon}</i>${a.label}`;
    b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();EQ.audio();EQ.sfx.click();const cur=actList.find(x=>x.id===a.id);if(!cur||G.busy)return;if(cur.dis){msg(cur.dis,2.4);return;}cur.fn();});
    el.appendChild(b);});
}
function fade(text,cb,hold){
  const f=$('fade');$('fadeTx').textContent=text||'';f.classList.add('on');G.busy=true;setActions([]);
  setTimeout(()=>{try{cb&&cb();}catch(e){console.error(e);}setTimeout(()=>{f.classList.remove('on');G.busy=false;last=performance.now();},hold||150);},400);
}
function panel(html){const p=$('panel');if(html==null){p.classList.remove('on');p.innerHTML='';return;}p.innerHTML=html;p.classList.add('on');}
function statsHtml(s){const row=(l,v,c)=>`<div>${l} <b>${v|0}</b><div class="b"><i style="width:${v}%;background:${c}"></i></div></div>`;
  return `<div class="stats">${row('🌾 Sazietà',s.hunger,'#f0a830')}${row('🫧 Pulizia',s.clean,'#3fa9d8')}${row('💛 Felicità',s.happy,'#ff6fa8')}${row('⚡ Energia',s.energy,'#6cc04a')}${row('💧 Acqua',s.thirst==null?80:s.thirst,'#2a8bd8')}</div>`;}
function stat(H,k,d){H.stats[k]=U.clamp(H.stats[k]+d,0,100);}
function hud(on){$('hud').classList.toggle('on',on);$('touch').classList.toggle('on',on);if(on)EQ.joyRest();}
function setRun(v){G.run=v;$('runBtn').classList.toggle('on',!!v);$('runBtn').lastChild.textContent=v?'CORRO':'CORRI';}
$('runBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();EQ.audio();EQ.sfx.click();setRun(!G.run);});
function setTouchMode(m){const t=$('touch');t.classList.toggle('ride',m==='ride');t.classList.toggle('nofoot',m!=='foot');if(m!=='foot')setRun(false);$('actions').classList.toggle('ride',m==='ride');$('gait').classList.toggle('on',m==='ride');}
$('info').addEventListener('pointerdown',e=>{e.stopPropagation();$('info').classList.toggle('open');});
function fmt(t){return t.toFixed(1).replace('.',',');}

/* ======================= STATO DI GIOCO ======================= */
const F={x:0,z:0,h:0,sp:0,camYaw:0,lastS:0};
const R={x:0,z:0,y:0,vy:0,h:0,sp:0,grounded:true,turn:0,landCd:0,bumpCd:0,px:0,pz:0};
const MAXSP=15;
const W=()=>G.world;

function placeInBox(H){const b=Y.boxes[H.i];H.where='box';H.x=b.horse.x;H.z=b.horse.z;H.h=b.horse.h;H.sp=0;
  H.root.position.set(H.x,0,H.z);H.root.rotation.y=H.h;H.root.visible=true;
  H.setTack({halter:false,pad:false,saddle:false,girth:false,bridle:false,wraps:false});H.rope.visible=false;H.reins.visible=false;}
function placeAt(H,s,where){H.where=where;H.x=s.x;H.z=s.z;H.h=s.h;H.sp=0;H.root.position.set(H.x,W().height(H.x,H.z),H.z);H.root.rotation.y=H.h;}
function attachRider(H){const s=H.root.scale.x||1;H.seat.add(P.root);P.root.scale.setScalar(1/s);P.root.position.set(0,-.9/s,0);P.root.rotation.set(0,0,0);}
function detachRider(){scene.add(P.root);P.root.scale.setScalar(1);P.root.rotation.set(0,0,0);}
function fullTack(H){H.setTack({halter:false,pad:true,saddle:true,girth:true,bridle:true});}
function ensureSafe(){if(P.outfit.helmet==null||P.outfit.protector==null){P.setOutfit({helmet:P.outfit.helmet!=null?P.outfit.helmet:0x1b1b22,protector:P.outfit.protector!=null?P.outfit.protector:0x23407f,gloves:P.outfit.gloves!=null?P.outfit.gloves:0x1a1a1a});persist();}}

/* ======================= MENU ======================= */
function renderMenu(){
  $('horses').innerHTML=EQ.HORSES.map((h,i)=>`<button class="hz${i===G.sel?' sel':''}" data-i="${i}"><i style="background:#${h.body.toString(16).padStart(6,'0')}${h.pinto?';background-image:radial-gradient(circle at 30% 40%,#fff 25%,transparent 26%),radial-gradient(circle at 70% 70%,#fff 20%,transparent 21%)':''}"></i>${h.name}</button>`).join('');
  const s=horses[G.sel].stats;
  {const cur=(save.custom[G.sel]&&save.custom[G.sel].coat)||null;const html=COATS.map(c=>`<button class="chip${cur===c.k?' sel':''}" data-coat="${c.k}"><s style="background:#${c.body.toString(16).padStart(6,'0')}${c.pinto?';background-image:radial-gradient(circle at 30% 40%,#fff 30%,transparent 31%)':c.apalo?';background-image:radial-gradient(circle at 40% 40%,#4a4038 18%,transparent 19%),radial-gradient(circle at 70% 70%,#4a4038 14%,transparent 15%)':''}"></s>${c.l}</button>`).join('');
   if(G.coatHtml!==html){G.coatHtml=html;$('coats').innerHTML=html;$('coats2').innerHTML=html;}if(document.activeElement!==$('hName'))$('hName').value=EQ.HORSES[G.sel].name;if(document.activeElement!==$('hName2'))$('hName2').value=EQ.HORSES[G.sel].name;}
  $('hdesc').textContent=EQ.HORSES[G.sel].race+` · 🌾${s.hunger|0} 🫧${s.clean|0} ⚡${s.energy|0}`;
  const lv=LEVELS.map((L,i)=>{const b=save.best['c'+i];return `<button class="lvl" data-l="${i}">${['🐎','🏅','🏆'][i]} ${L.name}<small>${b?b.m+' '+fmt(b.t)+'s':L.sub}</small></button>`;}).join('');
  $('lvls').innerHTML=lv;$('lvls2').innerHTML=lv;
  document.querySelectorAll('.sndB').forEach(b=>b.textContent=EQ.soundOn?'🔊 Suoni sì':'🔇 Suoni no');
  document.querySelectorAll('.qB').forEach(b=>b.textContent=EQ.hiQ?'✨ Grafica alta':'⚡ Grafica veloce');
}
function menuPose(){
  // cavallo scelto alla posta, sellato, Giorgia accanto
  horses.forEach(H=>{if(H.where!=='box'||H!==horses[G.sel])placeInBox(H);});
  const H=horses[G.sel];placeAt(H,Y.posta.horse,'menu');fullTack(H);
  detachRider();F.x=Y.posta.horse.x+1.4;F.z=Y.posta.horse.z-1.3;F.h=-.4;
  P.root.position.set(F.x,0,F.z);P.root.rotation.y=F.h;
}
function setName(v){v=String(v||'').replace(/[<>]/g,'').trim().slice(0,14);if(v)v=v.charAt(0).toUpperCase()+v.slice(1);LS.set('pname',v);$('nameIn').value=v;return v;}
$('nameIn').addEventListener('change',e=>setName(e.target.value));$('nameIn').addEventListener('blur',e=>setName(e.target.value));
$('nameIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')e.target.blur();});
$('nameIn2').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('nameOk').click();});
$('nameOk').addEventListener('click',()=>{setHorseName($('hName2').value);const v=setName($('nameIn2').value);if(!v){$('nameIn2').focus();$('nameIn2').style.borderColor='#d62828';return;}EQ.audio();$('nameBox').classList.remove('on');$('menu').classList.add('on');});
function setGender(g){LS.set('pgender',g);P.setGender(g);
  if(g==='m'){const o=P.outfit,pk=[0xe86aa6,0xe25d9a,0xf08cb8,0x7b3fb0,0x5b2a86],ch={};
    if(/0xf08cb8|0x5b2a86/.test(String(o.top)))ch.top='polo:0x2c3e66';if(pk.includes(o.helmet))ch.helmet=0x1b1b22;if(pk.includes(o.protector))ch.protector=0x23407f;if(pk.includes(o.gloves))ch.gloves=0x1a1a1a;
    if(Object.keys(ch).length){P.setOutfit(ch);persist();}}document.querySelectorAll('.gbtn').forEach(b=>b.classList.toggle('sel',b.dataset.g===g));$('gTog').textContent=g==='m'?'👦':'👧';}
document.querySelectorAll('.gbtn').forEach(b=>b.addEventListener('click',()=>{EQ.audio();setGender(b.dataset.g);}));
$('gTog').addEventListener('click',()=>{EQ.audio();setGender(EQ.gender()==='m'?'f':'m');renderMenu();});
setGender(EQ.gender());
function rebuildHorse(i){const old=horses[i];const H=EQ.buildHorse(EQ.HORSES[i]);H.i=i;H.stats=old.stats;
  scene.remove(old.root,old.reins,old.rope);scene.add(H.root,H.reins,H.rope);
  Object.assign(H,{x:old.x,z:old.z,h:old.h,sp:0,st:{},bt:2,where:old.where});H.setTack(Object.assign({},old.tack));
  H.root.position.copy(old.root.position);H.root.rotation.copy(old.root.rotation);H.addDirt(Math.round((100-H.stats.clean)/4));H.dirt0=H.dirtLeft();H.onStep=stepFor(H);
  horses[i]=H;if(G.cur===old)G.cur=H;}
function boxTag(i){const t=yard.boxTags&&yard.boxTags[i];if(!t)return;const nt=EQ.labelTex(EQ.HORSES[i].name,{bg:'#f6efe0',fg:'#4a2a14',w:256,h:80,radius:10,font:'bold 44px Fredoka, Trebuchet MS, sans-serif',border:'#8a5a34'});const old=t.material.map;t.material.map=nt;t.material.needsUpdate=true;if(old)old.dispose();}
function setHorseName(v){v=String(v||'').replace(/[<>]/g,'').trim().slice(0,14);if(!v)return;v=v.charAt(0).toUpperCase()+v.slice(1);const i=G.sel;
  save.custom[i]=Object.assign(save.custom[i]||{},{name:v});EQ.HORSES[i].name=v;horses[i].def=EQ.HORSES[i];boxTag(i);persist();renderMenu();}
function setCoat(k){const i=G.sel;save.custom[i]=Object.assign(save.custom[i]||{},{coat:k});applyCustom(i);rebuildHorse(i);persist();menuPose();renderMenu();EQ.sfx.neigh();}
['hName','hName2'].forEach(id=>{const el=$(id);el.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')el.blur();});el.addEventListener('change',e=>setHorseName(e.target.value));el.addEventListener('blur',e=>setHorseName(e.target.value));});
['coats','coats2'].forEach(id=>$(id).addEventListener('click',e=>{const b=e.target.closest('[data-coat]');if(!b)return;EQ.audio();setCoat(b.dataset.coat);}));
function toMenu(){
  G.climb=null;
  if(G.veh)leaveVeh(true);
  if(G.fall){G.fall=null;P.root.rotation.set(0,0,0);}
  G.sit=null;G.ia=null;G.mission=null;G.swim=false;G.em=[];G.slowT=0;G.dmg={shop:0,car:0,ppl:0};
  releaseGuest();
  cleanupTrip();endCourse(true);closeAct(true);
  G.state='menu';G.cur=null;G.leading=false;G.didRide=false;
  hud(false);setActions([]);panel(null);hint(null);
  ['pause','results','trip','course'].forEach(k=>$(k).classList.remove('on'));
  $('nameIn').value=LS.get('pname','')||'';
  if(!(LS.get('pname','')||'').trim()){$('nameBox').classList.add('on');}else $('menu').classList.add('on');
  menuPose();renderMenu();
}
$('horses').addEventListener('click',e=>{const b=e.target.closest('.hz');if(!b)return;EQ.audio();G.sel=+b.dataset.i;save.sel=G.sel;persist();menuPose();renderMenu();EQ.sfx.neigh();});
$('goYard').addEventListener('click',()=>{EQ.audio();startYard();});
$('goHome').addEventListener('click',()=>{EQ.audio();quickRide(()=>travel('home',null,true),'🏡 Si parte da casa…');});
document.querySelectorAll('[data-trip]').forEach(b=>b.addEventListener('click',()=>{EQ.audio();quickRide(()=>goTrip(b.dataset.trip,true),PLACE[b.dataset.trip][2]);}));
function lvlClick(e){const b=e.target.closest('.lvl');if(!b)return;EQ.audio();const l=+b.dataset.l;$('course').classList.remove('on');
  if(G.state==='menu'){quickRide(()=>goShowRace(l,true),'🚚 Si parte per il concorso…');return;}
  const ctx=G.courseCtx||{mode:'race',A:AR};
  if(ctx.mode==='truck'){goShowRace(l,false);return;}
  if(ctx.mode==='truckShow'){startCourse(l,false,{mode:'race',A:W().spots.arena});return;}
  startCourse(l,false,ctx);}
function goShowRace(l,noFade){const H=G.cur;if(H){H.setTack({pad:true,saddle:true,girth:true,bridle:true,halter:false});}
  G.afterTravel=()=>{const w=W();startCourse(l,true,{mode:'race',A:w.spots.arena});};travel('show','yard',noFade,'🚚 In viaggio verso il concorso ippico…');}
function truckHome(){G.afterTravel=()=>{};travel('yard','show',false,'🚚 Si torna al maneggio…');}
$('lvls').addEventListener('click',lvlClick);$('lvls2').addEventListener('click',lvlClick);
$('courseNo').onclick=()=>{$('course').classList.remove('on');const m=G.courseCtx&&G.courseCtx.mode;G.state=(m==='truck'||m==='truckShow')?'foot':'ride';};
$('courseHome').onclick=()=>{$('course').classList.remove('on');truckHome();};
document.querySelectorAll('.sndB').forEach(b=>b.onclick=()=>{EQ.setSound(!EQ.soundOn);renderMenu();});
document.querySelectorAll('.qB').forEach(b=>b.onclick=()=>{EQ.hiQ=!EQ.hiQ;EQ.LS.set('hq',EQ.hiQ);EQ.resize();EQ.shadowSize();renderMenu();msg(EQ.hiQ?'Grafica alta':'Grafica veloce',1.2);});

function startYard(){
  $('menu').classList.remove('on');
  fade('Si va al maneggio!',()=>{
    if(G.veh)leaveVeh(true);
    releaseGuest();
    horses.forEach(placeInBox);G.cur=null;G.leading=false;detachRider();
    P.setOutfit({helmet:null,protector:null,gloves:null,whip:false});persist();
    F.x=yard.spawn.x;F.z=yard.spawn.z;F.h=yard.spawn.h;F.camYaw=yard.spawn.h;F.sp=0;
    G.state='foot';hud(true);setTouchMode('foot');
    snapCam();
    setTimeout(()=>msg('Benvenut'+EQ.A()+' al maneggio!<small>prima vai allo spogliatoio a metterti casco e corpetto</small>',3.5),500);
  });
}
function quickRide(next,text){
  $('menu').classList.remove('on');
  fade(text||(EQ.pname()+' si prepara…'),()=>{
    horses.forEach(placeInBox);ensureSafe();
    const H=horses[G.sel];G.cur=H;fullTack(H);
    placeAt(H,yard.spawnRide,'ride');
    mountNow();hud(true);
    next&&next();
  },50);
}

/* ======================= CAMERA ======================= */
const camLook=new V3(), tv=new V3(), tv2=new V3();
function snapCam(){G.snap=true;}
function camGo(px,py,pz,lx,ly,lz,dt,k,shift){
  tv.set(px,py,pz);tv2.set(lx,ly,lz);
  if(shift){const dx=lx-px,dz=lz-pz,L=Math.hypot(dx,dz)||1,rx=-dz/L,rz=dx/L;tv.x+=rx*shift;tv.z+=rz*shift;tv2.x+=rx*shift;tv2.z+=rz*shift;}
  if(G.snap){camera.position.copy(tv);camLook.copy(tv2);G.snap=false;}
  else{camera.position.lerp(tv,U.damp(k||5,dt));camLook.lerp(tv2,U.damp((k||5)*1.5,dt));}
  camera.lookAt(camLook);
}
function blocked(x,z){for(const c of W().colliders){if(c.r!=null||c.fence||c.off)continue;const cs=Math.cos(c.rot||0),sn=Math.sin(c.rot||0),dx=x-c.x,dz=z-c.z,lx=dx*cs-dz*sn,lz=dx*sn+dz*cs;if(Math.abs(lx)<c.hx+.2&&Math.abs(lz)<c.hz+.2)return true;}return false;}
function followCam(x,y,z,yaw,dist,h,lookAhead,lookY,dt,k){
  let d=dist;
  if(W()===yard){for(let i=1;i<=12;i++){const t=i/12*dist;if(blocked(x-Math.sin(yaw)*t,z-Math.cos(yaw)*t)){d=Math.max(.6,t-.5);break;}}}
  const cx=x-Math.sin(yaw)*d, cz=z-Math.cos(yaw)*d;
  let cy=y+h*(d/dist)+(dist-d)*.7; const gh=W().height(cx,cz)+.8; if(cy<gh)cy=gh;
  camGo(cx,cy,cz,x+Math.sin(yaw)*lookAhead,y+lookY,z+Math.cos(yaw)*lookAhead,dt,k);
}

/* ======================= A PIEDI ======================= */
function nearFence(){let best=null,bd=1.3;
  for(const c of W().colliders){if(!c.fence||c.off)continue;if(Math.abs(c.x-F.x)>c.hx+3&&Math.abs(c.z-F.z)>c.hx+3)continue;
    const cs=Math.cos(c.rot||0),sn=Math.sin(c.rot||0),dx=F.x-c.x,dz=F.z-c.z,lx=dx*cs-dz*sn,lz=dx*sn+dz*cs;
    if(Math.abs(lx)>c.hx-.15)continue;const d=Math.abs(lz)-c.hz;if(d<bd){bd=d;best={c,lx,lz,cs,sn};}}
  return best;}
/* camion, casa e giardino */
/* ---- dentro casa ---- */
function enterHouse(){fade('🏠 Entri in casa…',()=>{const w=W();G.inside=true;w.outB=w.bounds;w.bounds=w.interior.b;F.x=w.interior.ox;F.z=w.interior.oz+6.4;F.h=Math.PI;F.camYaw=Math.PI;F.sp=0;snapCam();
  setTimeout(()=>msg('🏠 Benvenut'+EQ.A()+' a casa!<small>soggiorno, cucina, camere, bagno e studio</small>',2.8),300);});}
function exitHouse(){fade('',()=>{const w=W();G.inside=false;G.hact=null;if(w.outB)w.bounds=w.outB;F.x=0;F.z=-11.2;F.h=0;F.camYaw=0;F.sp=0;snapCam();});}
function insideCam(dt){camGo(F.x,EQ.portrait?9.5:7.5,F.z+(EQ.portrait?5:5.5),F.x,.5,F.z-1.4,dt,5);}
function homeActions(A){const w=W();if(!G.inside||!w.homeSpots)return;
  for(const sp of w.homeSpots){if(Math.hypot(sp.p.x-F.x,sp.p.z-F.z)>1.7)continue;
    if(sp.exit){A.push({id:'hexit',icon:sp.icon,label:sp.label,fn:exitHouse});continue;}
    A.push({id:'h'+sp.id,icon:sp.icon,label:sp.label,fn:()=>{G.hact={sp,t:0};if(sp.sleep)EQ.sfx.click();}});}}
let tvT=0;
function drawScreen(scr,kind,t){const g=scr.g,W2=scr.c.width,H2=scr.c.height;
  if(kind==='off'){g.fillStyle='#0a0a0e';g.fillRect(0,0,W2,H2);scr.t.needsUpdate=true;return;}
  if(kind==='tv'){const gr=g.createLinearGradient(0,0,0,H2);gr.addColorStop(0,'#5fb4f0');gr.addColorStop(1,'#cfe9ff');g.fillStyle=gr;g.fillRect(0,0,W2,H2);
    g.fillStyle='#5d9b3b';g.fillRect(0,H2*.68,W2,H2);g.fillStyle='#f6f2e0';for(let i=0;i<6;i++)g.fillRect(((i*60-t*40)%300+300)%300-30,H2*.62,6,22);
    g.font='48px serif';g.fillText('🐎',((t*70)%(W2+80))-60,H2*.8);g.font='30px serif';g.fillText('☀️',W2-48,36);
    g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,W2,24);g.fillStyle='#fff';g.font='bold 16px sans-serif';g.fillText('EquitApp TV · Gran Premio',8,17);}
  else{g.fillStyle='#e8edf2';g.fillRect(0,0,W2,H2);g.fillStyle='#2f6b33';g.fillRect(0,0,W2,26);g.fillStyle='#fff';g.font='bold 16px sans-serif';g.fillText('🐴 EquitApp · Il mio cavallo',8,18);
    g.fillStyle='#333';g.font='13px sans-serif';const L=['Diario di '+EQ.pname()+':','- lezione con Betta: ok','- doccia al cavallo','- prossima gara: Junior'];const n=Math.min(L.length,Math.floor(t/1.2)+1);for(let i=0;i<n;i++)g.fillText(L[i].slice(0,i===n-1?Math.floor((t%1.2)/1.2*30)+4:99),10,48+i*22);
    g.font='40px serif';g.fillText('🏆',W2-60,H2-20);}
  scr.t.needsUpdate=true;}
function hactUpdate(dt){const a=G.hact,sp=a.sp,w=W();a.t+=dt;
  const dx=sp.p.x-F.x,dz=sp.p.z-F.z;F.x+=dx*Math.min(1,dt*6);F.z+=dz*Math.min(1,dt*6);F.h+=U.wrapA(sp.h-F.h)*Math.min(1,dt*8);
  if(sp.lie){P.root.position.set(F.x,sp.ly||.86,F.z);P.root.rotation.set(-Math.PI/2,0,0,'YXZ');P.root.rotation.y=sp.h;P.pose(dt,'stand',{});}
  else{P.root.position.set(F.x,0,F.z);P.root.rotation.set(0,F.h,0);P.pose(dt,sp.pose,{speed:0,steer:sp.pc?Math.sin(a.t*12)*.3:0});}
  tvT+=dt;if(sp.tv&&w.tv&&tvT>.08){tvT=0;drawScreen(w.tv,'tv',a.t);}
  if(sp.pc&&w.pc&&tvT>.08){tvT=0;drawScreen(w.pc,'pc',a.t);if(Math.random()<.6)EQ.sfx.click();}
  a.sndT=(a.sndT||0)-dt;if(a.sndT<=0){a.sndT=sp.snd==='water'?.35:1.2;if(sp.snd==='water')EQ.sfx.splash(.06);else if(sp.snd==='cook')EQ.sfx.brush();else if(sp.snd==='kids')EQ.sfx.kids();}
  if(sp.shower&&Math.random()<dt*30)FX.water.emit(F.x+rnd(-.3,.3),2.1,F.z+rnd(-.3,.3),rnd(-.2,.2),-1,rnd(-.2,.2),.8);
  insideCam(dt);
  setActions([{id:'hstop',icon:'⬆️',label:sp.lie?'Alzati':'Basta',fn:()=>{a.t=sp.dur;}}]);
  if(a.t>=sp.dur){G.hact=null;P.root.rotation.set(0,F.h,0);P.root.rotation.order='XYZ';if(sp.tv&&w.tv)drawScreen(w.tv,'off');if(sp.msg)msg(sp.msg,2.4);
    if(sp.sleep&&G.cur&&G.cur.stats)stat(G.cur,'happy',5);F.x=sp.p.x+(sp.lie?1.4:0);}}
function placeActions(A){if(G.state!=='foot'||G.swim||G.sit)return;const w=W(),S=w.spots||{},H=G.cur;
  if(w.name==='home'){if(G.inside){homeActions(A);return;}
    if(near({x:0,z:-12.2},2.8))A.push({id:'enterh',icon:'🏠',label:'Entra in casa',fn:enterHouse,dis:G.leading?'Prima lega il cavallo<small>al palo o lascialo libero in giardino</small>':null});}
  if(w===yard&&S.truck&&near(S.truck.ramp,4.2)){
    if(G.leading&&H)A.push({id:'truck',icon:'🚚',label:'Carica '+H.def.name+' sul camion',fn:()=>{G.courseCtx={mode:'truck'};$('courseHome').style.display='none';G.state='modal';renderMenu();$('courseT').textContent='🚚 Si va al concorso! Scegli la gara';$('course').classList.add('on');},dis:!P.ready()?'Per gareggiare servono casco e corpetto!<small>vai allo spogliatoio</small>':null});
    else A.push({id:'truckinfo',icon:'🚚',label:'Camion per le gare',fn:()=>msg('🚚 Porta qui il tuo cavallo con la corda<small>e caricalo sul camion per andare al concorso</small>',3)});}
  if(w.name==='show'&&S.truck&&near(S.truck.ramp,6)){
    if(G.leading&&H)A.push({id:'truck2',icon:'🚚',label:'Carica '+H.def.name+' sul camion',fn:()=>{G.courseCtx={mode:'truckShow'};G.state='modal';renderMenu();$('courseT').textContent='🚚 '+H.def.name+' è sul camion';$('courseHome').style.display='';$('course').classList.add('on');EQ.sfx.neigh();}});
    else A.push({id:'truckinfo2',icon:'🚚',label:'Camion',fn:()=>msg(H?'🪢 Prendi '+H.def.name+' con la corda<small>e portalo alla rampa del camion</small>':'Prima prendi il tuo cavallo',2.6)});}
  if(w.name==='home'&&H){
    if(G.leading&&S.tie&&near(S.tie,4))A.push({id:'tieh',icon:'🪢',label:'Lega '+H.def.name+' al palo',fn:()=>{const t=S.tie;G.leading=false;H.where='wait';H.tiedHome=true;H.x=t.x;H.z=t.z;H.h=t.h;H.sp=0;H.rope.visible=false;H.st={};msg('🪢 '+H.def.name+' è legato al palo',1.8);EQ.sfx.buckle();}});
    const g=S.garden;if(G.leading&&g&&F.x>g.x0&&F.x<g.x1&&F.z>g.z0&&F.z<g.z1)A.push({id:'garden',icon:'🌿',label:'Lascialo libero in giardino',fn:()=>{G.leading=false;H.where='garden';H.rope.visible=false;H.st={};H.gw=1;msg('🌿 '+H.def.name+' passeggia in giardino',1.8);}});}
}
function climbActions(A){if(G.state!=='foot'||G.swim||G.sit||G.ia||G.climb)return;const f=nearFence();if(!f)return;
  A.push({id:'climb',icon:'🧗',label:'Scavalca',fn:()=>{if(G.leading){msg('Prima lascia il cavallo<small>"Lascialo qui" o legalo</small>',2);return;}
    const c=f.c,s=Math.sign(f.lz)||1,to=-s*(c.hz+.75),fr=s*(c.hz+.35);
    const W2=(lx,lz)=>({x:c.x+lx*f.cs+lz*f.sn,z:c.z-lx*f.sn+lz*f.cs});
    const a=W2(f.lx,fr),b=W2(f.lx,to);G.climb={t:0,a,b,h:Math.atan2(b.x-a.x,b.z-a.z),top:(c.h||1.2)+.05};EQ.sfx.step('soft');}});}
function climbUpdate(dt){const c=G.climb;c.t+=dt/1.3;const t=Math.min(1,c.t),e=t*t*(3-2*t);
  F.x=U.lerp(c.a.x,c.b.x,e);F.z=U.lerp(c.a.z,c.b.z,e);F.h+=U.wrapA(c.h-F.h)*Math.min(1,dt*10);
  const gy=W().height(F.x,F.z);const lift=Math.sin(Math.min(1,t*1.15)*Math.PI)*c.top*.85;
  P.root.position.set(F.x,gy+lift,F.z);P.root.rotation.y=F.h;P.pose(dt,t<.5?'pick':'stand',{});
  if(Math.random()<dt*4)EQ.sfx.step('soft');
  followCam(F.x,gy,F.z,F.camYaw,EQ.portrait?5.6:4.6,EQ.portrait?2.6:2.1,1.2,1.15,dt,5);setActions([]);
  if(t>=1){G.climb=null;F.camYaw=F.h;}}
function footUpdate(dt){
  if(G.hact){hactUpdate(dt);return;}
  if(G.climb){climbUpdate(dt);return;}
  if(G.sit||G.ia){socialFoot(dt);return;}
  const inp=G.busy?{x:0,y:0}:EQ.readInput();const m=Math.min(1,Math.hypot(inp.x,inp.y));
  let tsp=0;
  if(m>.15){const want=F.camYaw-Math.atan2(inp.x,-inp.y);F.h+=U.wrapA(want-F.h)*Math.min(1,dt*9);tsp=G.run?(m>.4?6.2:3.8):(m>.8?3.8:1.6);}
  F.sp=U.lerp(F.sp,tsp,Math.min(1,dt*6));
  const px=F.x,pz=F.z;
  F.x+=Math.sin(F.h)*F.sp*dt;F.z+=Math.cos(F.h)*F.sp*dt;
  const p={x:F.x,z:F.z};EQ.collide(p,.32,W().colliders);
  const H=G.cur;
  if(H&&!G.leading&&H.where!=='box'){const fx=Math.sin(H.h),fz=Math.cos(H.h);EQ.collide(p,.3,[{x:H.x,z:H.z,r:.55},{x:H.x+fx*.7,z:H.z+fz*.7,r:.45},{x:H.x-fx*.7,z:H.z-fz*.7,r:.45},{x:H.x+fx*1.5,z:H.z+fz*1.5,r:.25}]);}
  const b=W().bounds;if(b){p.x=U.clamp(p.x,b.x0,b.x1);p.z=U.clamp(p.z,b.z0,b.z1);}
  if(W().boundR){const d=Math.hypot(p.x,p.z);if(d>W().boundR){p.x*=W().boundR/d;p.z*=W().boundR/d;}}
  if(W().shore&&p.x-W().shore(p.z)>75){p.x=px;p.z=pz;}
  F.x=p.x;F.z=p.z;
  const realSp=Math.hypot(F.x-px,F.z-pz)/Math.max(dt,1e-4);
  const gy=W().height(F.x,F.z),wl=W().water(F.x,F.z),dep=wl-gy;const swim=dep>.95;
  if(swim&&G.leading){waitHere();msg(G.cur.def.name+' ti aspetta sulla riva',2.2);}
  if(swim){F.sp=Math.min(F.sp,1.4);if(Math.random()<dt*3&&F.sp>.3){for(let k=0;k<4;k++)FX.splash.emit(F.x+rnd(-.3,.3),wl,F.z+rnd(-.3,.3),rnd(-.5,.5),rnd(.5,1.2),rnd(-.5,.5),.5);EQ.sfx.splash(.04);}}
  else if(dep>.2)F.sp=Math.min(F.sp,2.2);
  if(swim!==G.swim){G.swim=swim;if(swim)msg('🏊 Stai nuotando!',1.4);}
  P.root.position.set(F.x,swim?wl-1.2+Math.sin(T*2)*.04:gy,F.z);P.root.rotation.y=F.h;
  P.pose(dt,swim?'swim':G.leading?'lead':'walk',{speed:Math.min(F.sp,realSp+.2)});
  const s=Math.sin(P.phase);if(F.sp>.4&&((F.lastS>0)!==(s>0)))EQ.sfx.step(W().surface(F.x,F.z));F.lastS=s;
  if(G.leading)leadUpdate(dt);
  if(G.inside)F.camYaw=Math.PI;else if(F.sp>.3)F.camYaw+=U.wrapA(F.h-F.camYaw)*Math.min(1,dt*1.3);
  const por=EQ.portrait;
  if(G.leading){const H=G.cur;const mx=(F.x+H.x)/2,mz=(F.z+H.z)/2;followCam(mx,W().height(mx,mz),mz,F.camYaw,por?7.4:6,por?3.2:2.6,1.2,1.2,dt,5);}
  else if(G.inside)insideCam(dt);
  else followCam(F.x,W().height(F.x,F.z),F.z,F.camYaw,por?5.6:4.6,por?2.6:2.1,1.2,1.15,dt,5);
  if(!G.busy)setActions(yardActions());
}
function leadUpdate(dt){
  const H=G.cur;
  const rx=-Math.cos(F.h),rz=Math.sin(F.h);
  const sx=F.x+rx*.95+Math.sin(F.h)*.2, sz=F.z+rz*.95+Math.cos(F.h)*.2;
  let dx=sx-H.x,dz=sz-H.z,d=Math.hypot(dx,dz);
  if(d>7){H.x=sx-Math.sin(F.h)*1.5;H.z=sz-Math.cos(F.h)*1.5;H.h=F.h;dx=sx-H.x;dz=sz-H.z;d=Math.hypot(dx,dz);}
  if(d>1.65)H.h+=U.wrapA(Math.atan2(dx,dz)-H.h)*Math.min(1,dt*3.2);
  const v=U.clamp((d-1.6)*2.6,0,G.run?6.5:4.2);
  H.sp=U.lerp(H.sp,v,Math.min(1,dt*5));
  const ox=H.x,oz=H.z;
  H.x+=Math.sin(H.h)*H.sp*dt;H.z+=Math.cos(H.h)*H.sp*dt;
  const p={x:H.x,z:H.z};EQ.collide(p,.6,W().colliders);H.x=p.x;H.z=p.z;
  if(W().deep!=null&&W().height(H.x,H.z)<-.6){H.x=ox;H.z=oz;H.sp=0;}
  const rs=Math.hypot(H.x-ox,H.z-oz)/Math.max(dt,1e-4);
  H.root.position.set(H.x,W().height(H.x,H.z),H.z);H.root.rotation.y=H.h;
  H.animate(dt,Object.assign({speed:Math.min(H.sp,rs+.1),turn:0},H.st||{}));
  H.rope.visible=true;
}
function near(s,r){return Math.hypot(F.x-s.x,F.z-s.z)<r;}
function mountBlock(){const H=G.cur;
  if(!P.ready())return'Per sicurezza servono casco e corpetto!<small>vai allo spogliatoio</small>';
  if(!(H.tack.pad&&H.tack.saddle&&H.tack.girth))return'Prima sella il cavallo<small>legalo alla posta: sottosella, sella e sottopancia</small>';
  if(!H.tack.bridle)return'Manca la briglia!<small>mettila alla posta</small>';
  if(H.stats.energy<8)return H.def.name+' è stanco<small>fallo riposare nel box</small>';
  return null;}
function yardActions(){
  const A=[], H=G.cur;
  vehActions(A);climbActions(A);placeActions(A);
  if(G.world!==yard){if(G.leading)A.push({id:'mount',icon:'🏇',label:'Monta',fn:startMount,dis:mountBlock()});if(!G.leading)otherHorseActions(A);careActions(A);socialActions(A,false);return A;}
  if(near(Y.selleria,2.6))A.push({id:'dress',icon:'👕',label:'Spogliatoio',fn:startDress,dis:G.leading?'Prima lega il cavallo<small>alla posta o rimettilo nel box</small>':null});
  Y.boxes.forEach((b,i)=>{if(!near(b.front,2.3))return;const h=horses[i];
    if(h.where==='box'){
      A.push({id:'feed'+i,icon:'🥕',label:'Dai da mangiare',fn:()=>startFeed(i)});
      A.push({id:'pet'+i,icon:'💛',label:'Accarezza '+h.def.name,fn:()=>startPet({head:h.head,H:h,name:h.def.name})});
      if(!H)A.push({id:'out'+i,icon:'🐴',label:'Porta fuori '+h.def.name,fn:()=>takeOut(i)});
    } else if(G.leading&&H===h)A.push({id:'in'+i,icon:'🏠',label:'Rimetti nel box',fn:putBack});
  });
  if(G.leading){
    if(near(Y.posta.horse,3.6))A.push({id:'tie',icon:'🪢',label:'Lega alla posta',fn:()=>tieAt('posta')});
    if(near(Y.wash.horse,3.6))A.push({id:'wash',icon:'🚿',label:'Doccia',fn:()=>tieAt('wash')});
    if(H.where==='lead'&&!H.guest){const b=Y.boxes[H.i];if(near(b.front,3.5)&&!A.find(a=>a.id==='in'+H.i))A.push({id:'in'+H.i,icon:'🏠',label:'Rimetti nel box',fn:putBack});}
    A.push({id:'mount',icon:'🏇',label:'Monta',fn:startMount,dis:mountBlock()});
  }
  if(H&&H.where==='posta'&&near(Y.posta.horse,3.6))A.push({id:'care',icon:'🪮',label:'Cura '+H.def.name,fn:openPosta});
  if(H&&H.where==='wash'&&near(Y.wash.horse,3.6))A.push({id:'wash2',icon:'🚿',label:'Doccia',fn:startWash});
  if(H&&(H.where==='posta'||H.where==='wash')&&near({x:H.x,z:H.z},3.6))A.push({id:'untie',icon:'🔓',label:'Slega',fn:untie});
  if(!G.leading&&!otherHorseActions(A)){
    if(!A.some(a=>a.id.startsWith('pet'))){const ph=nearPet(3.4);if(ph)A.push({id:'peth',icon:'💛',label:'Accarezza '+ph.def.name,fn:()=>{startPet({head:ph.head,name:ph.def.name});if(ph.hh){ph.hh.ly=0;ph.hh.lx=.45;ph.hh.bt=3;}}});}}
  careActions(A);socialActions(A,false);
  return A;
}
/* ---- voce del cavallo: nitriti, sbuffi, fiatone ---- */
G.voiceT=8;G.breathT=0;G.exert=0;
function horseVoice(dt,H,sp,riding){
  if(!H||!H.stats)return;
  G.exert=U.clamp(G.exert+(sp>8?dt*.08:-dt*.05),0,1);
  const tired=U.clamp((40-H.stats.energy)/40,0,1);
  const pantLvl=Math.max(tired,G.exert*(sp<3?1:.6));
  G.breathT-=dt;
  if(pantLvl>.15&&G.breathT<=0){G.breathT=sp>7?.55:sp>2.5?.75:1.0-.3*pantLvl;EQ.sfx.pant(.05+pantLvl*.16);}
  G.voiceT-=dt;
  if(G.voiceT<=0){G.voiceT=12+Math.random()*18;const r=Math.random();
    if(tired>.5){EQ.sfx.blow(.2);msg('😮‍💨 '+H.def.name+' ha il fiatone…',1.6);}
    else if(r<.35)EQ.sfx.neigh();else if(r<.75)EQ.sfx.snort();else EQ.sfx.blow(.15);}
}
/* ---- rumori d'ambiente ---- */
G.ambT=5;
function ambient(dt){G.ambT-=dt;if(G.ambT>0)return;G.ambT=4+Math.random()*9;const n=W().name,r=Math.random();
  if(n==='yard'){if(r<.35)EQ.sfx.whinnyFar();else if(r<.5)EQ.sfx.rooster();else if(r<.65)EQ.sfx.moo();else if(r<.8)EQ.sfx.bark();else EQ.sfx.bird();}
  else if(n==='city'){if(r<.3)EQ.sfx.horn(.2+Math.random()*.3);else if(r<.4)EQ.sfx.siren();else if(r<.6)EQ.sfx.bikebell();else if(r<.8)EQ.sfx.pigeons();else EQ.sfx.bark();}
  else if(n==='forest'){if(r<.3)EQ.sfx.woodpecker();else if(r<.45)EQ.sfx.owl();else if(r<.6)EQ.sfx.whinnyFar();else EQ.sfx.bird();}
  else if(n==='show'){if(r<.5)EQ.sfx.whinnyFar();else if(r<.7)EQ.sfx.whistle();}
  else if(n==='home'){if(r<.4)EQ.sfx.bird();else if(r<.6)EQ.sfx.bark();else if(r<.75)EQ.sfx.meow();else EQ.sfx.rooster();}
  else if(n==='beach'){if(r<.5)EQ.sfx.gull();else if(r<.7)EQ.sfx.kids();else if(r<.8)EQ.sfx.whistle();else EQ.sfx.whinnyFar();}}
/* ---- erba e cadute ---- */
function grazeAt(x,z){const w=W();if(w.grazeAt)return w.grazeAt(x,z);const s=w.surface(x,z);return s==='grass';}
const jt={x:0,z:0};
function jumpFail(cols,fx,fz){for(const c of cols){if(c.off||c.h==null||c.h>50||R.y>c.h-.3)continue;if(Math.abs(R.x-c.x)>9||Math.abs(R.z-c.z)>9)continue;
  jt.x=R.x+fx*1.1;jt.z=R.z+fz*1.1;if(EQ.collide(jt,.4,[c]))return true;}return false;}
function fallOff(){
  if(G.state!=='ride'||G.fall)return;const H=G.cur;
  scene.updateMatrixWorld();P.root.getWorldPosition(tv);scene.attach(P.root);P.root.rotation.order='YXZ';
  const sd=Math.random()<.5?1:-1,lx=Math.cos(R.h)*sd,lz=-Math.sin(R.h)*sd,fx=Math.sin(R.h),fz=Math.cos(R.h);
  let tx=R.x+lx*1.7+fx*1.2,tz=R.z+lz*1.7+fz*1.2;const q={x:tx,z:tz};EQ.collide(q,.4,W().colliders);tx=q.x;tz=q.z;
  if(G.course)G.fallCtx={mode:G.course.mode,A:G.course.A};
  G.fall={t:0,sx:tv.x,sy:tv.y,sz:tv.z,tx,tz,h:R.h,course:G.course?G.course.l:null};
  H.reins.visible=false;H.where='wait';H.x=R.x;H.z=R.z;H.h=R.h;H.sp=0;
  R.sp=0;R.vy=0;R.y=0;R.grounded=true;G.grazeT=0;
  if(G.course){G.course.state='done';}
  G.state='fall';setActions([]);setTouchMode('foot');stat(H,'happy',-5);
  EQ.sfx.land();EQ.sfx.bump();setTimeout(()=>EQ.sfx.neigh(),350);
  msg('💥 Sei cadut'+EQ.A()+' da cavallo!',2.4);
}
function fallUpdate(dt){
  const f=G.fall,H=G.cur;f.t+=dt;
  const gy=W().height(f.tx,f.tz);let px=f.tx,pz=f.tz,py=gy,rx=-1.45;
  if(f.t<.7){const k=f.t/.7;px=U.lerp(f.sx,f.tx,k);pz=U.lerp(f.sz,f.tz,k);py=U.lerp(f.sy-.9,gy,k)+Math.sin(k*Math.PI)*.7;rx=-1.45*k;}
  else if(f.t>2.6){rx=-1.45*Math.max(0,1-(f.t-2.6)/.8);}
  P.root.position.set(px,py+(rx<-.6?.12:0),pz);P.root.rotation.set(rx,f.h+Math.PI,0);
  P.pose(dt,f.t>2.6?'stand':'wave',{});
  followCam(px,py,pz,f.h,EQ.portrait?6:5,EQ.portrait?3:2.5,.5,.6,dt,4);
  if(f.t>=3.4){P.root.rotation.set(0,f.h+Math.PI,0);F.x=px;F.z=pz;F.h=f.h+Math.PI;F.camYaw=f.h;F.sp=0;G.fall=null;G.state='foot';hud(true);setTouchMode('foot');
    if(f.course!=null){G.lastCtx=G.fallCtx||G.lastCtx;endCourse(true);G.lastL=f.course;showResults('❌','Caduta!','Sei cadut'+EQ.A()+': percorso eliminato. Rimonta e riprova!',[['💥','Caduta'],['E','Eliminat'+EQ.A()],['💪','Coraggio!']],[['org','again','↻ Riprova'],['alt','stay','Resta al maneggio'],['alt','menu','Menu principale']]);}
    else if(f.veh)msg('Tutto ok! 💪<small>rialza '+VEH[f.veh.kind].name+' per ripartire</small>',3);
    else msg('Tutto ok! 💪<small>tocca "Monta" per risalire su '+H.def.name+'</small>',3);}
}
/* ---- bisogni del cavallo e cure ovunque ---- */
const NEED_MSG={energy:['😴','è stanco: fallo riposare'],hunger:['🌾','ha fame: dagli da mangiare'],thirst:['💧','ha sete: dagli da bere'],clean:['🫧','è sporco: spazzolalo']};
G.needCd={};
function needsCheck(dt){const H=G.cur;if(!H||!H.stats)return;for(const k in NEED_MSG){G.needCd[k]=(G.needCd[k]||0)-dt;const v=H.stats[k]==null?80:H.stats[k];
  if(v<25&&G.needCd[k]<=0){G.needCd[k]=40;msg(NEED_MSG[k][0]+' '+H.def.name+' '+NEED_MSG[k][1].split(':')[0]+'!<small>'+(NEED_MSG[k][1].split(':')[1]||'')+((G.state==='ride'||G.state==='drive')?' · scendi da cavallo':'')+'</small>',3.2);EQ.sfx.snort();}}}
function waitHere(){const H=G.cur;if(!H)return;G.leading=false;H.where='wait';H.sp=0;H.rope.visible=false;H.st={};}
function takeRope(){const H=G.cur;H.tiedHome=false;H.where='lead';G.leading=true;if(!H.tack.bridle)H.setTack({halter:true});msg('Andiamo!',1);}
const bucket=EQ.mesh(EQ.G.cyl(.2,.16,.3,14),EQ.mat(0x2a58c8,.5),0,0,0,scene);bucket.visible=false;
function care(kind){const H=G.cur;H.head.getWorldPosition(tv);
  const t=kind==='brush'?3.4:kind==='graze'?4.5:3;G.ia={kind:kind==='feed'?'feed':kind==='drink'?'feed':kind==='brush'?'brush':'stand',t,tx:kind==='brush'?H.x:tv.x,tz:kind==='brush'?H.z:tv.z,care:kind};
  if(G.leading){waitHere();G.relead=true;}
  H.st={eat:kind==='brush'?0:1,graze:kind==='graze'?1:0};
  if(kind==='drink'){const fx=Math.sin(H.h),fz=Math.cos(H.h);bucket.position.set(H.x+fx*1.6,W().height(H.x+fx*1.6,H.z+fz*1.6)+.15,H.z+fz*1.6);bucket.visible=true;}
  if(kind==='feed'){handItem.visible=true;carrotM.visible=true;appleM.visible=false;}
  setTimeout(()=>{if(kind==='graze'){stat(H,'hunger',30);EQ.sfx.munch();setTimeout(()=>EQ.sfx.munch(),1500);}if(kind==='feed'){stat(H,'hunger',45);EQ.sfx.munch();}if(kind==='drink'){stat(H,'thirst',60);EQ.sfx.splash(.12);}
    if(kind==='rest'){stat(H,'energy',45);}if(kind==='brush'){stat(H,'clean',45);if(H.stats.clean>85)H.clearDirt();else H.dirt.slice(0,Math.ceil(H.dirt.length/2)).forEach(d=>{d.userData.v=0;d.visible=false;});}
    stat(H,'happy',4);persist();},1200);
  setTimeout(()=>{H.st={};bucket.visible=false;handItem.visible=false;if(G.relead&&G.cur===H&&H.where==='wait'){G.relead=false;takeRope();}},t*1000);
  msg({graze:'🌿 '+H.def.name+' bruca l\'erba',feed:'🥕 Gnam gnam!',drink:'💧 Che sete aveva!',rest:'😴 '+H.def.name+' si riposa…',brush:'🪮 Una bella spazzolata'}[kind],2);}
function careActions(A){const H=G.cur;if(!H||G.state!=='foot'||H.where==='box'||H.where==='ride'||G.swim)return;
  if(Math.hypot(H.x-F.x,H.z-F.z)>4)return;const s=H.stats;
  if(H.where==='wait'||H.where==='garden'){A.push({id:'rope',icon:'🪢',label:'Prendi '+H.def.name,fn:takeRope});A.push({id:'mountw',icon:'🏇',label:'Monta',fn:startMount,dis:mountBlock()});}
  if(H.guest)A.push({id:'letgo',icon:'🌿',label:(H.guest.rider?'Restituisci a '+H.guest.owner:'Lascia libero '+H.def.name),fn:letGo});
  if(G.leading)A.push({id:'wait',icon:'🌿',label:'Lascialo qui',fn:()=>{waitHere();msg(H.def.name+' ti aspetta qui',1.6);}});
  if(s.hunger<97&&grazeAt(H.x,H.z))A.push({id:'cgraze',icon:'🌿',label:'Mangia erba',fn:()=>care('graze')});
  if(s.hunger<90)A.push({id:'cfeed',icon:'🥕',label:'Dai da mangiare',fn:()=>care('feed')});
  if((s.thirst==null?80:s.thirst)<90)A.push({id:'cdrink',icon:'💧',label:'Dai da bere',fn:()=>care('drink')});
  if(s.energy<80)A.push({id:'crest',icon:'😴',label:'Fallo riposare',fn:()=>care('rest')});
  if(s.clean<80&&H.where!=='posta'&&H.where!=='wash')A.push({id:'cbrush',icon:'🪮',label:'Spazzola',fn:()=>care('brush')});}
/* ---- obiettivi in città ---- */
const MISSIONS=[['school','Vai a scuola'],['home','Vai a casa'],['piazza','Vai in piazza alla fontana'],['park','Vai al parco'],['yard','Vai al maneggio'],['beach','Vai in spiaggia'],['forest','Vai nel bosco']];
G.stars=LS.get('stars',0);
function newMission(){const w=W();if(w.name!=='city'){G.mission=null;return;}const prev=G.mission&&G.mission.k;
  const L=MISSIONS.filter(m=>m[0]!==prev);const m=L[Math.random()*L.length|0];let pt=w.spots[m[0]];
  if(!pt){const po=(w.portals||[]).find(p=>p.to===m[0]);pt=po?{x:po.x,z:po.z,portal:true}:null;}
  G.mission=pt?{k:m[0],t:m[1],x:pt.x,z:pt.z,portal:!!pt.portal}:null;if(G.mission)setTimeout(()=>msg('🎯 '+G.mission.t+'<small>segui la freccia gialla</small>',3),1800);}
function missionCheck(px,pz){const m=G.mission;if(!m||m.portal||W().name!=='city')return;if(Math.hypot(px-m.x,pz-m.z)<9){G.stars++;LS.set('stars',G.stars);EQ.sfx.ding();msg('⭐ Obiettivo completato!<small>'+m.t+' · stelle: '+G.stars+'</small>',2.6);G.mission=null;setTimeout(newMission,2600);}}
/* ---- persone, animali, sedie ---- */
const TALK=['Che bel cavallo!','Oggi è una giornata perfetta per cavalcare.','Hai visto i cervi nel bosco?','Al mare si galoppa sulla riva, è stupendo!','In città le auto si fermano per i cavalli.','Domani faccio la gara di salto!','Ricordati di pulire gli zoccoli!','Il mio cavallo adora le carote.','Ci vediamo al club house per una merenda?','Dalla strada a nord si arriva in città.','Il sentiero a est porta alla spiaggia.','Nel bosco ci sono anche i cinghiali!','Hai già fatto la doccia al tuo cavallo?','Che caldo oggi, ci vorrebbe un gelato!','In campo stanno saltando gli ostacoli.'];
const TALK_KID=['Giochiamo a rincorrerci!','Mi fai accarezzare il cavallo?','Da grande voglio fare le gare di salto!','Hai visto il gatto? È velocissimo!','Io ho un pony che si chiama Biscotto!'];
function socialTargets(){const pp=(G.state==='ride'||G.state==='drive')?{x:R.x,z:R.z}:{x:F.x,z:F.z};let per=null,pd=(G.state==='ride'||G.state==='drive')?4.5:2.8,pet=null,ptd=2.2;
  for(const a of (W().agents||[])){if(a.disabled||!a.ent.root.visible)continue;const e=a.ent;
    if(e.npc&&!e.horse){const d=Math.hypot(a.x-pp.x,a.z-pp.z);if(d<pd){pd=d;per=a;}}
    const cands=[];if(e.root.userData.pet)cands.push(e.root);if(a.extra)a.extra.forEach(o=>{if(o.userData&&o.userData.pet)cands.push(o);});
    cands.forEach(o=>{const d=Math.hypot(o.position.x-pp.x,o.position.z-pp.z);if(d<ptd){ptd=d;pet={o,a};}});}
  return {per,pet};}
function socialActions(A,riding){
  if(G.busy)return;const {per,pet}=socialTargets();
  if(per){const nm=per.ent.name||(per.ent.name=EQ.randName(per.ent.npc.o.fem));
    A.push({id:'hi'+nm,icon:'👋',label:'Saluta '+nm,fn:()=>interact(per,'wave')});
    A.push({id:'talk'+nm,icon:'💬',label:'Parla',fn:()=>interact(per,'talk')});
    if(!riding)A.push({id:'play'+nm,icon:'⚽',label:'Gioca',fn:()=>interact(per,'play')});}
  if(pet&&!riding){const k=pet.o.userData.pet;A.push({id:'petan',icon:'🐾',label:'Accarezza il '+k,fn:()=>{const o=pet.o;startPet({root:o,low:true,name:'il '+k,agent:pet.a,sound:k==='cane'?EQ.sfx.bark:EQ.sfx.meow});}});}
  if(!riding&&!G.leading&&W().seats){for(const st of W().seats){if(Math.hypot(st.x-F.x,st.z-F.z)<1.8){A.push({id:'sit',icon:'🪑',label:'Siediti',fn:()=>{G.sit=st;msg('Che bello riposarsi un po\'!',1.6);}});break;}}}
}
function interact(a,kind){
  const e=a.ent,n=e.npc,nm=e.name;a.talkT=kind==='play'?4:3.2;
  const pp=(G.state==='ride'||G.state==='drive')?{x:R.x,z:R.z}:{x:F.x,z:F.z};
  if(G.state==='foot')G.ia={kind,t:a.talkT,tx:a.x,tz:a.z};
  if(kind==='wave'){a.talkPose='wave';msg('👋 '+nm+': <small>Ciao '+EQ.pname()+'!</small>',2.4);EQ.sfx.ok();}
  else if(kind==='talk'){a.talkPose='talk';const L=e.lines||(n.o.kid?TALK_KID:TALK);msg('💬 '+nm+'<small>“'+EQ.pick(L)+'”</small>',3.4);EQ.sfx.click();}
  else{a.talkPose='play';msg('🎉 Giochi con '+nm+'!',2.4);EQ.sfx.kids();}
}
function startPet(o){
  const p=new V3();(o.head||o.root).getWorldPosition(p);
  G.ia={kind:o.low?'petlow':'pet',t:2.6,tx:p.x,tz:p.z,o};
  if(o.agent)o.agent.talkT=2.8;
  if(o.H&&o.H.wait!=null)o.H.wait=Math.max(o.H.wait,3);
  if(o.H){o.H.st=Object.assign(o.H.st||{},{neckX:.3,headX:.15});setTimeout(()=>{if(o.H.st){o.H.st.neckX=0;o.H.st.headX=0;}},2600);if(o.H.stats)stat(o.H,'happy',6);}
  setTimeout(()=>{for(let i=0;i<8;i++)FX.heart.emit(p.x,p.y+.35,p.z,rnd(-.4,.4),rnd(.8,1.5),rnd(-.4,.4),1.2);(o.sound||EQ.sfx.snort)();},700);
  msg('💛 '+(o.name||'')+' è contento!',2);if(o.H&&o.H.stats)persist();
}
function socialFoot(dt){
  if(G.sit){const st=G.sit;F.x=st.x;F.z=st.z;F.h=st.h;F.sp=0;
    P.root.position.set(st.x,st.y,st.z);P.root.rotation.y=st.h;P.pose(dt,'sit',{talk:Math.sin(T*.7)>.6});
    F.camYaw+=U.wrapA(st.h-F.camYaw)*Math.min(1,dt*1.5);
    if(G.inside)insideCam(dt);else followCam(st.x,st.y,st.z,F.camYaw,EQ.portrait?4.6:3.8,EQ.portrait?2.3:1.9,.8,.9,dt,4);
    const inp=EQ.readInput();
    if(!G.busy)setActions([{id:'up',icon:'⬆️',label:'Alzati',fn:()=>{G.sit=null;F.x=st.x-Math.sin(st.h)*.9;F.z=st.z-Math.cos(st.h)*.9;}}]);return;}
  const ia=G.ia;ia.t-=dt;
  const dx=ia.tx-F.x,dz=ia.tz-F.z,d=Math.hypot(dx,dz);const want=Math.atan2(dx,dz);F.h+=U.wrapA(want-F.h)*Math.min(1,dt*8);
  const stop=ia.care==='brush'?1.05:ia.care?.95:ia.kind==='pet'?.85:ia.kind==='petlow'?.55:1.3;
  if(d>stop+.05){const k=Math.min(1,dt*3);F.x+=dx/d*(d-stop)*k;F.z+=dz/d*(d-stop)*k;const p={x:F.x,z:F.z};EQ.collide(p,.25,W().colliders.filter(c=>!c.fence));F.x=p.x;F.z=p.z;}
  P.root.position.set(F.x,W().height(F.x,F.z),F.z);P.root.rotation.y=F.h;
  P.pose(dt,ia.kind==='wave'?'wave':ia.kind==='talk'?'talk':ia.kind==='play'?'play':ia.kind,{});
  if(G.leading)leadUpdate(dt);
  followCam(F.x,W().height(F.x,F.z),F.z,F.camYaw,EQ.portrait?5.6:4.6,EQ.portrait?2.6:2.1,1.2,1.15,dt,5);
  if(ia.t<=0)G.ia=null;
  if(!G.busy)setActions([]);
}
/* ---- cavalli degli altri: accarezzare e montare ---- */
const paddockFree=paddockHorses.map(h=>({h,pad:true,home:{x:h.x,z:h.z},name:EQ.pick(EQ.HORSE_NAMES)}));
function riderList(){return (W().agents||[]).filter(a=>a.ent.horse&&a.ent.npc&&!a.disabled).map(a=>a._fh||(a._fh={h:a.ent.horse,agent:a,rider:true,owner:a.ent.name||'il cavaliere',name:EQ.pick(EQ.HORSE_NAMES)}));}
function freeList(){return (W()===yard?(yard.freeHorses||[]).concat(paddockFree):[]).concat(riderList()).filter(f=>!f.taken);}
const helmetMsg='Per sicurezza servono casco e corpetto!<small>vai allo spogliatoio</small>';
function otherHorseActions(A){
  let any=false;const fh=nearFree(3.8);
  if(fh){any=true;A.push({id:'petf',icon:'💛',label:'Accarezza '+fh.name,fn:()=>startPet({head:fh.h.head,H:fh.h,name:fh.name,agent:fh.agent})});
    A.push({id:'ridef',icon:'🏇',label:fh.rider?'Chiedi '+fh.name+' a '+fh.owner:'Monta '+fh.name,fn:()=>adopt(fh),dis:!P.ready()?helmetMsg:null});}
  for(const h of horses){if(h===G.cur||!['wait','posta','wash','garden'].includes(h.where))continue;const p=h.root.position;if(Math.hypot(p.x-F.x,p.z-F.z)>3.6)continue;any=true;
    A.push({id:'take'+h.i,icon:'🪢',label:'Prendi '+h.def.name,fn:()=>switchTo(h,false)});
    A.push({id:'mnt'+h.i,icon:'🏇',label:'Monta '+h.def.name,fn:()=>switchTo(h,true),dis:!P.ready()?helmetMsg:(!(h.tack.saddle&&h.tack.bridle)?'Prima sellalo alla posta':null)});break;}
  return any;
}
function parkCurrent(){const H=G.cur;if(!H)return;if(H.guest){releaseGuest();return;}if(G.leading||H.where==='lead')waitHere();G.cur=null;G.leading=false;}
function switchTo(h,mount){parkCurrent();G.cur=h;h.x=h.root.position.x;h.z=h.root.position.z;h.h=h.root.rotation.y;if(mount)startMount();else takeRope();}
G.standers=[];
function nearFree(r){let b=null,bd=r;for(const f of freeList()){if(f.h===G.cur)continue;const p=f.h.root.position;const d=Math.hypot(p.x-F.x,p.z-F.z);if(d<bd){bd=d;b=f;}}return b;}
function nearPet(r){let b=null,bd=r;
  for(const f of (yard.petHorses||[])){const p=f.h.root.position;const d=Math.hypot(p.x-F.x,p.z-F.z);if(d<bd){bd=d;b={head:f.h.head,def:{name:f.name}};}}
  for(const h of (yard.heads||[])){if(!h.wp){h.wp=new V3();h.head.getWorldPosition(h.wp);}const d=Math.hypot(h.wp.x-F.x,h.wp.z-F.z);if(d<bd){bd=d;b={head:h.head,def:{name:h.name||'Cavallo'},hh:h};}}
  return b;}
function adopt(fh){
  parkCurrent();
  fh.world=W();
  if(fh.rope)fh.rope.visible=false;if(fh.owner&&!fh.rider)setTimeout(()=>msg('👨 '+fh.owner+': <small>Vai pure, ma con calma: sta ancora imparando!</small>',2.6),900);
  if(fh.rider){const a=fh.agent,e=a.ent,n=e.npc;fh.owner=e.name||fh.owner;scene.updateMatrixWorld();
    W().group.attach(n.root);const lx=Math.cos(a.h),lz=-Math.sin(a.h);n.root.position.set(a.x+lx*1.3,W().height(a.x+lx*1.3,a.z+lz*1.3),a.z+lz*1.3);n.root.rotation.set(0,a.h-Math.PI/2,0);n.pose(1,'stand',{snap:true});
    if(a.label){n.root.add(a.label);a.label.position.set(0,2.15,0);}if(a.col)a.col.off=true;if(a.col2)a.col2.off=true;G.standers.push(n);
    setTimeout(()=>msg('👋 '+fh.owner+': <small>Te lo presto volentieri!</small>',2.4),900);}
  const H=fh.h;fh.taken=true;if(fh.agent)fh.agent.disabled=true;if(fh.col)fh.col.off=true;H.adopted=true;
  scene.attach(H.root);H.i=-1;H.guest=fh;H.def=Object.assign({},H.def,{name:fh.name});
  H.stats=H.stats||{hunger:70,clean:80,happy:70,energy:90,thirst:75};H.st={};
  H.x=H.root.position.x;H.z=H.root.position.z;H.h=H.root.rotation.y;H.sp=0;
  H.setTack({pad:true,saddle:true,girth:true,bridle:true,halter:false});H.root.visible=true;
  if(!H.reins.parent)scene.add(H.reins,H.rope);H.onStep=stepFor(H);
  G.cur=H;startMount();msg('In sella su '+fh.name+'!<small>abbiamo messo sella e briglia</small>',2.5);
}
function releaseGuest(){
  const H=G.cur;if(!H||!H.guest)return;const fh=H.guest;
  if(H.where==='ride'){detachRider();}
  H.rope.visible=false;H.reins.visible=false;H.adopted=false;H.guest=null;fh.taken=false;
  if(fh.rider){const a=fh.agent,e=a.ent,n=e.npc;(fh.world||yard).group.attach(H.root);H.seat.add(n.root);n.root.position.set(0,-.92*n.s,0);n.root.rotation.set(0,0,0);
    if(a.label){e.root.add(a.label);a.label.position.set(0,3.15,0);}G.standers=G.standers.filter(x=>x!==n);a.disabled=false;H.setTack({halter:false});G.cur=null;G.leading=false;return;}
  H.setTack({pad:false,saddle:false,girth:false,bridle:false,halter:false,wraps:false});
  H.root.position.set(fh.home.x,0,fh.home.z);(fh.world||yard).group.attach(H.root);
  if(fh.agent){const a=fh.agent;a.disabled=false;a.x=a.tx=fh.home.x;a.z=a.tz=fh.home.z;}
  if(fh.col)fh.col.off=false;if(fh.rope)fh.rope.visible=true;
  if(fh.pad){H.x=H.tx=fh.home.x;H.z=H.tz=fh.home.z;H.wait=2;}
  G.cur=null;G.leading=false;
}
function letGo(){const H=G.cur;fade('',()=>{const n=H.def.name,fh=H.guest;releaseGuest();snapCam();msg(fh&&fh.rider?'Grazie '+fh.owner+'! 👋':n+' è di nuovo libero 🐴',2);});}
function doorAnim(i,open){Y.boxes[i].doorT=open?1.8:0;}
function takeOut(i){
  fade('',()=>{const H=horses[i],b=Y.boxes[i];G.cur=H;H.where='lead';G.leading=true;H.setTack({halter:true});
    H.x=b.out.x;H.z=b.out.z;H.h=Math.PI;H.sp=0;F.x=b.out.x-.95;F.z=b.out.z-1.5;F.h=Math.PI;F.camYaw=Math.PI;snapCam();
    doorAnim(i,true);setTimeout(()=>doorAnim(i,false),1500);EQ.sfx.neigh();
    msg(`${H.def.name} è pronto!<small>portalo alla posta per pulirlo e sellarlo</small>`,3);});
}
function putBack(){
  const H=G.cur;
  fade('',()=>{const had=H.tack.saddle||H.tack.bridle;placeInBox(H);G.cur=null;G.leading=false;
    const b=Y.boxes[H.i];F.x=b.front.x;F.z=b.front.z-.4;F.h=Math.PI;F.camYaw=Math.PI;snapCam();doorAnim(H.i,true);setTimeout(()=>doorAnim(H.i,false),1200);
    stat(H,'happy',5);persist();
    msg(had?'Hai tolto sella e briglia<small>'+H.def.name+' riposa nel box</small>':H.def.name+' è nel box',2.5);});
}
function pet(H){P.pose(0,'feed',{});G.petT=1.6;G.petH=H;if(H.stats)stat(H,'happy',6);EQ.sfx.snort();
  H.root.updateMatrixWorld();H.head.getWorldPosition(tv);for(let i=0;i<8;i++)FX.heart.emit(tv.x,tv.y+.3,tv.z,rnd(-.4,.4),rnd(.8,1.5),rnd(-.4,.4),1.2);
  msg('💛 '+H.def.name+' è contento!',1.4);if(H.stats)persist();}
function tieAt(kind){
  const H=G.cur;
  fade('',()=>{const s=kind==='posta'?Y.posta:Y.wash;placeAt(H,s.horse,kind);G.leading=false;H.rope.visible=false;
    F.x=s.stand.x;F.z=s.stand.z;F.h=0;F.camYaw=0;P.root.position.set(F.x,0,F.z);P.root.rotation.y=0;
    if(kind==='posta')openPosta();else startWash();},50);
}
function untie(){
  const H=G.cur;closeAct(true);H.where='lead';G.leading=true;G.state='foot';hud(true);setTouchMode('foot');
  if(!H.tack.bridle)H.setTack({halter:true});
  msg('Andiamo!',1);
}

/* ======================= MONTARE ======================= */
function startMount(){
  const H=G.cur;G.leading=false;H.rope.visible=false;H.where='ride';G.state='ride';
  detachRider();P.root.position.set(F.x,0,F.z);
  // posizione di partenza (locale alla sella) → arco fino alla sella
  H.root.updateMatrixWorld(true);
  const lx=Math.cos(H.h),lz=-Math.sin(H.h);
  P.root.position.set(H.x+lx*.75,W().height(H.x,H.z),H.z+lz*.75);
  attachRider(H);
  H.seat.updateMatrixWorld(true);
  const wp=new V3(H.x+lx*.75,W().height(H.x,H.z)+.0,H.z+lz*.75+0);
  G.mount={t:0,from:H.seat.worldToLocal(wp.clone()).add(new V3(0,0,0)),dur:.75};
  R.x=H.x;R.z=H.z;R.h=H.h;R.sp=0;R.y=0;R.vy=0;R.grounded=true;
  G.didRide=true;
  hud(true);setTouchMode('ride');EQ.sfx.buckle();
}
function mountNow(){const H=G.cur;H.where='ride';G.state='ride';G.leading=false;attachRider(H);R.x=H.x;R.z=H.z;R.h=H.h;R.sp=0;R.y=0;R.vy=0;R.grounded=true;G.didRide=true;setTouchMode('ride');snapCam();}
function applyRideDirt(H){const dirt=Math.round(G.rideDirt||0);if(dirt>0){H.addDirt(Math.min(20,dirt));stat(H,'clean',-Math.min(80,dirt*4));}G.rideDirt=0;}
function dismount(){
  const H=G.cur;
  detachRider();H.where='lead';G.leading=true;H.reins.visible=false;applyRideDirt(H);H.setTack({halter:!H.tack.bridle});
  const lx=Math.cos(R.h),lz=-Math.sin(R.h);
  F.x=R.x+lx*1.1+Math.sin(R.h)*.6;F.z=R.z+lz*1.1+Math.cos(R.h)*.6;F.h=R.h;F.camYaw=R.h;F.sp=0;
  H.x=R.x;H.z=R.z;H.h=R.h;H.sp=0;
  G.state='foot';setTouchMode('foot');
  stat(H,'happy',4);persist();
  msg('Brav'+EQ.A()+'!<small>riporta '+H.def.name+' alla posta o nel box</small>',2.5);
}

/* ======================= CAVALCARE ======================= */
function surfType(x,z){const s=W().surface(x,z);return s==='hard'?'hard':s==='sand'?'sand':s==='water'?'water':'soft';}
function stepFor(H){return (i,sp)=>{if(H!==G.cur)return;const st=surfType(H.x,H.z);EQ.sfx.clop(.05+sp*.013,st);
  if((st==='sand'||W().surface(H.x,H.z)==='dirt')&&sp>5){H.legs[i].hoof.getWorldPosition(tv);for(let k=0;k<3;k++)FX.dust.emit(tv.x,tv.y+.05,tv.z,rnd(-.6,.6),rnd(.4,1.2),rnd(-.6,.6),1.2);}
  if(st==='water'){H.legs[i].hoof.getWorldPosition(tv);const wl=W().water(H.x,H.z);for(let k=0;k<8;k++)FX.splash.emit(tv.x,wl+.05,tv.z,rnd(-1.5,1.5),rnd(1.5,3.5)*Math.min(1,sp/6+.3),rnd(-1.5,1.5),.7);}
};}
horses.forEach(H=>H.onStep=stepFor(H));
function rideUpdate(dt){
  const H=G.cur, w=W();
  if(G.grazeT>0)G.grazeT-=dt;
  let inp=(G.busy||G.mount||G.lock>0||G.grazeT>0||G.state!=='ride')?{x:0,y:0}:EQ.readInput();
  if(G.lock>0)G.lock-=dt;
  if(G.course&&G.course.state==='count')inp={x:0,y:0};
  const st0=H.stats;const maxSp=(H.def.pony?.8:1)*(G.slowT>0?.18:1)*MAXSP*(.38+.62*U.clamp(st0.energy/35,0,1))*(st0.hunger<15?.8:1)*((st0.thirst==null?80:st0.thirst)<15?.8:1);
  let target=Math.max(0,-inp.y)*maxSp;
  if(Math.abs(inp.x)>.25&&target<2.2&&inp.y<.3)target=2.2;
  if(inp.y>.35)target=0;
  const acc=target>R.sp?(R.grounded?5.5:0):(inp.y>.35?12:5);
  if(R.grounded)R.sp+=U.clamp(target-R.sp,-acc*dt,acc*dt);
  const turnRate=(2.1-R.sp*.055)*(R.grounded?1:.35);
  R.turn=U.lerp(R.turn,inp.x,Math.min(1,dt*8));
  R.h-=R.turn*turnRate*dt;
  if(EQ.input.jumpQ>0){EQ.input.jumpQ-=dt;if(R.grounded&&R.landCd<=0&&!G.mount){if(R.sp>1.5){R.vy=4.6+R.sp*.2;R.grounded=false;EQ.input.jumpQ=0;EQ.sfx.jump();}else if(EQ.input.jumpQ<=0)msg('Più veloce per saltare!',1);}}
  if(R.landCd>0)R.landCd-=dt;
  R.px=R.x;R.pz=R.z;
  const fx=Math.sin(R.h),fz=Math.cos(R.h);
  R.x+=fx*R.sp*dt;R.z+=fz*R.sp*dt;
  if(!R.grounded){R.vy-=18*dt;R.y+=R.vy*dt;if(R.y<=0){R.y=0;R.vy=0;R.grounded=true;R.sp*=.93;R.landCd=.12;EQ.sfx.land();
    H.root.getWorldPosition(tv);if(surfType(R.x,R.z)!=='hard')for(let k=0;k<14;k++)FX.dust.emit(tv.x+rnd(-.5,.5),tv.y+.1,tv.z+rnd(-.8,.8),rnd(-1.2,1.2),rnd(.5,1.5),rnd(-1.2,1.2),1.4);}}
  // collisioni
  if(R.bumpCd>0)R.bumpCd-=dt;
  const NOSE=1.15;
  const c={x:R.x,z:R.z};const n={x:R.x+fx*NOSE,z:R.z+fz*NOSE};
  const cols=w.colliders;
  if(!R.grounded&&jumpFail(cols,fx,fz)){fallOff();return;}
  if(impacts(fx,fz,cols))return;
  let hit=EQ.collide(c,.75,cols,R.y);R.x=c.x;R.z=c.z;n.x=R.x+fx*NOSE;n.z=R.z+fz*NOSE;
  if(EQ.collide(n,.4,cols,R.y)){R.x+=n.x-(R.x+fx*NOSE);R.z+=n.z-(R.z+fz*NOSE);hit=true;}
  if(hit&&R.sp>6&&R.bumpCd<=0){R.sp*=.55;R.bumpCd=1;EQ.sfx.bump();}
  else if(hit)R.sp*=Math.pow(.2,dt);
  const n0x=R.px+fx*NOSE,n0z=R.pz+fz*NOSE,n1x=R.x+fx*NOSE,n1z=R.z+fz*NOSE;
  let block=false;
  for(const j of w.jumps){if(EQ.segX(n0x,n0z,n1x,n1z,j.ax,j.az,j.bx,j.bz)&&R.y<j.h-.2){if(!R.grounded){fallOff();return;}block=true;break;}}
  if(w.deep!=null&&w.height(n1x,n1z)<w.deep){block=true;if(R.bumpCd<=0){msg('Troppo profondo!',1.2);R.bumpCd=1.2;}}
  if(block){R.x=R.px;R.z=R.pz;R.sp*=.25;if(R.bumpCd<=0){R.bumpCd=1.2;EQ.sfx.bump();msg('Salta! ⤴<small>tocca SALTA prima dell\'ostacolo</small>',1.4);}}
  const b=w.bounds;if(b){R.x=U.clamp(R.x,b.x0,b.x1);R.z=U.clamp(R.z,b.z0,b.z1);}
  if(w.boundR){const d=Math.hypot(R.x,R.z);if(d>w.boundR){R.x*=w.boundR/d;R.z*=w.boundR/d;}}
  if(G.portalCd>0)G.portalCd-=dt;
  else if(w.portals&&!G.course&&G.state==='ride'&&!G.busy){for(const pt of w.portals){if(Math.hypot(R.x-pt.x,R.z-pt.z)<7){G.portalCd=5;travel(pt.to,G.loc);break;}}}
  // terreno e acqua
  const gy=w.height(R.x,R.z);
  const hf=w.height(R.x+fx*1.1,R.z+fz*1.1),hb=w.height(R.x-fx*1.1,R.z-fz*1.1);
  const slope=Math.atan2(hf-hb,2.2);
  const wl=w.water(R.x,R.z), depth=wl-gy;
  let sink=0;
  if(depth>0&&R.y<.3){sink=Math.min(.12,depth*.15);if(R.sp>9)R.sp-=dt*4;EQ.loop('wade',Math.min(.25,R.sp*.03),1100,.6);}else EQ.loop('wade',0);
  H.x=R.x;H.z=R.z;H.h=R.h;
  H.root.position.set(R.x,gy+R.y,R.z);H.root.rotation.y=R.h;
  H.animate(dt,{speed:R.sp,air:!R.grounded,vy:R.vy,turn:R.turn,slope,sink,eat:G.grazeT>0?1:0,graze:1});
  // Giorgia in sella
  if(G.mount){G.mount.t+=dt/G.mount.dur;const t=Math.min(1,G.mount.t),e=t*t*(3-2*t);
    P.root.position.copy(G.mount.from).lerp(tv.set(0,-.9/(H.root.scale.x||1),0),e);P.root.position.y+=Math.sin(e*Math.PI)*.45;
    if(t>=1){G.mount=null;P.root.position.set(0,-.9/(H.root.scale.x||1),0);msg('In sella!<small>trascina in su per partire</small>',2);}}
  const gi=R.sp<2.6?0:R.sp<7.4?1:2;
  P.pose(dt,'ride',{lean:[.08,.2,.4][gi]+(R.grounded?0:.35),jump:R.grounded?0:1,bob:gi===1&&R.grounded?Math.max(0,Math.sin(H.anim.phase*2+.5))*.06:0,speed:R.sp,snap:false});
  // statistiche
  stat(H,'energy',R.sp<2.6?dt*.2:-dt*R.sp*.016);stat(H,'hunger',-dt*.05);if(H.stats.thirst!=null)stat(H,'thirst',-dt*(.06+R.sp*.008));stat(H,'happy',dt*.04);
  needsCheck(dt);
  horseVoice(dt,H,R.sp,true);
  if(G.world!==yard||surfType(R.x,R.z)==='sand')G.rideDirt=(G.rideDirt||0)+dt*R.sp*.004;
  // logica
  if(G.course&&G.course.state==='run'){G.course.time+=dt;if(G.course.flat)flatLogic();else courseLogic(G.course.obs,true);}
  else if(!G.course&&practice.length)courseLogic(practice.filter(p=>p.g.visible).reduce((a,p)=>a.concat(p.list),[]),false);
  if(G.trip)tripLogic(dt);
  // HUD
  const gname=R.sp<.3?'Fermo':R.sp<2.6?'Passo':R.sp<7.4?'Trotto':R.sp<11.5?'Galoppo':'Galoppo veloce!';
  $('gaitTx').textContent=R.grounded?gname:'Salto! 🐴';$('spd').style.width=(R.sp/MAXSP*100)+'%';
  const por=EQ.portrait;
  followCam(R.x,gy+R.y*.5,R.z,R.h,(por?8.4:7)+R.sp*.08,por?3.8:3.1,4.5,1.5,dt,7);
  if(!G.busy){const A=[];
    if(G.course&&R.sp<1&&R.grounded)A.push({id:'quitc',icon:'⬇️',label:'Scendi (esci dal percorso)',fn:()=>{endCourse(true);msg('Percorso interrotto',1.4);dismount();}});
    if(!G.course){
      if(R.sp<2)A.push({id:'down',icon:'⬇️',label:'Scendi',fn:dismount});
      const S=W().spots||{},inA=a=>a&&Math.abs(R.x-a.cx)<a.hx&&Math.abs(R.z-a.cz)<a.hz;
      if(W()===yard&&inA(S.arena))A.push({id:'train',icon:'🎓',label:'Lezione con Betta',fn:()=>openCourse('train',S.arena)});
      if(W()===yard&&inA(S.arena2))A.push({id:'train2',icon:'🐎',label:'Addestramento',fn:()=>openCourse('train2',S.arena2)});
      if(W().name==='show'&&inA(S.arena))A.push({id:'race',icon:'🏆',label:'Gara',fn:()=>openCourse('race',S.arena)});
      if(W().name==='show')A.push({id:'gohome',icon:'🚚',label:'Torna al maneggio',fn:truckHome});
    }
    if(R.sp<1&&!G.course&&R.grounded&&grazeAt(R.x,R.z)&&H.stats.hunger<97&&!(G.grazeT>0))A.push({id:'rgraze',icon:'🌿',label:'Mangia erba',fn:()=>{G.grazeT=4.5;setTimeout(()=>{EQ.sfx.munch();stat(H,'hunger',30);stat(H,'happy',3);persist();},1200);msg('🌿 '+H.def.name+' bruca l\'erba',2);}});
    navAction(A);socialActions(A,true);
    setActions(A);}
}
EQ.onRightTap=()=>{if(G.state==='ride'){EQ.input.jumpQ=.18;const j=$('jumpBtn');j.classList.add('press');setTimeout(()=>j.classList.remove('press'),120);}};

/* ---------- ostacoli: attraversamento ---------- */
function courseLogic(list,scoring){
  const C=G.course;
  for(const o of list){
    for(let pi=0;pi<o.planes.length;pi++){
      const pl=o.planes[pi];const cx=o.pos.x+o.fwd.x*pl.dz,cz=o.pos.z+o.fwd.z*pl.dz;
      const a=(R.px-cx)*o.fwd.x+(R.pz-cz)*o.fwd.z,b=(R.x-cx)*o.fwd.x+(R.z-cz)*o.fwd.z;
      const F_=a<0&&b>=0,B_=a>0&&b<=0;if(!F_&&!B_)continue;
      const lx=(R.x-cx)*o.right.x+(R.z-cz)*o.right.z;if(Math.abs(lx)>o.W/2+.25)continue;
      const clear=R.y>=pl.h-.28;
      if(!clear&&F_&&R.grounded&&R.sp>.5){R.x=R.px-Math.sin(R.h)*1.2;R.z=R.pz-Math.cos(R.h)*1.2;R.sp=0;G.lock=.9;EQ.sfx.snort();
        msg('🚫 Rifiuto!<small>tocca SALTA prima dell\'ostacolo</small>',1.8);if(scoring&&C.obs[C.next]===o&&!o.refused){o.refused=true;C.faults+=4;}return;}
      if(!clear&&!R.grounded&&R.y<pl.h-.55){if(!pl.rail.userData.fall){pl.rail.userData.fall={vy:0,vz:1.2+R.sp*.08,spin:rnd(-1,1),t:0};fallen.push(pl.rail);EQ.sfx.knock();}fallOff();return;}
      if(!clear&&!pl.rail.userData.fall){pl.rail.userData.fall={vy:0,vz:1.2+R.sp*.08,spin:rnd(-1,1),t:0};fallen.push(pl.rail);EQ.sfx.knock();}
      if(!scoring){if(pi===o.planes.length-1&&F_){if(clear){msg(['Bel salto!','Brav'+EQ.A()+'!','Perfetto!'][Math.random()*3|0],1);EQ.sfx.clear();stat(G.cur,'happy',2);}else msg('Barriera giù!',1);}continue;}
      const isNext=C.obs[C.next]===o&&F_;
      if(isNext){
        if(!clear&&!o.faulted){o.faulted=true;C.faults+=4;}
        if(pi===o.planes.length-1){o.done=true;C.next++;
          if(o.faulted)msg('Barriera giù! +4',1.4);else{if(W().cheer!=null&&Math.random()<.45){W().cheer=2.5;EQ.sfx.applause();}
          msg(['Bravissim'+EQ.A()+'!','Perfetto!','Che salto!','Brav'+EQ.A()+' '+EQ.pname()+'!','Netto!'][Math.random()*5|0],1.1);EQ.sfx.clear();}
          if(C.next>=C.obs.length){setTimeout(()=>msg('🏁 Arrivo!',2),250);finishCourse();}}
      } else if(F_&&!o.done&&pi===o.planes.length-1){msg(`Ostacolo sbagliato!<small>salta prima il numero ${C.next+1}</small>`,1.6);EQ.sfx.wrong();}
      else if(B_&&!o.done&&C.obs[C.next]===o&&pi===0){msg('Dall\'altra parte!<small>segui le frecce gialle</small>',1.6);EQ.sfx.wrong();}
    }
  }
}
function updateFallen(dt){
  fallen.forEach(r=>{const f=r.userData.fall;if(!f)return;f.t+=dt;if(!f.done){f.vy-=18*dt;r.position.y+=f.vy*dt;r.position.z+=f.vz*dt;f.vz*=.97;r.rotation.y+=f.spin*dt;
    if(r.position.y<=.06){r.position.y=.06;f.vy*=-.25;if(Math.abs(f.vy)<.6)f.done=true;}}
    if(f.done&&!G.course&&f.t>6){r.position.copy(r.userData.base.p);r.rotation.copy(r.userData.base.r);r.userData.fall=null;}});
  fallen=fallen.filter(r=>r.userData.fall);
}
const CMODE={train:{t:'🎓 Lezione con Betta',v:'Lezione',done:'Lezione completata!',who:'Betta'},train2:{t:'🐎 Addestramento con Carlo',v:'Addestramento',done:'Addestramento completato!',who:'Carlo'},race:{t:'🏆 Gara di salto',v:'Gara',done:null}};
function openCourse(mode,A){$('courseHome').style.display='none';G.courseCtx={mode,A};G.state='modal';renderMenu();$('courseT').textContent=CMODE[mode].t;
  if(mode==='train'){const sub=['passo e trotto','passo, trotto e galoppo','salti'];document.querySelectorAll('#lvls2 .lvl small').forEach((el,i)=>el.textContent=sub[i]);}
  $('course').classList.add('on');}
/* ---- lezioni in piano (Pony: passo e trotto, Junior: passo, trotto e galoppo) ---- */
const GAITN={passo:['🚶','Al passo'],trotto:['🐎','Al trotto'],galoppo:['💨','Al galoppo']};
const FLAT=[['passo','passo','trotto','trotto','trotto','passo','trotto','trotto','trotto','passo','passo'],
            ['passo','trotto','trotto','galoppo','galoppo','galoppo','trotto','galoppo','galoppo','galoppo','trotto','passo','passo']];
function gaitOf(sp){return sp<.3?'fermo':sp<2.6?'passo':sp<7.4?'trotto':'galoppo';}
const coneTex={};function coneSprite(g){if(!coneTex[g])coneTex[g]=EQ.labelTex(GAITN[g][0]+' '+g.toUpperCase(),{bg:g==='passo'?'#2f6b33':g==='trotto'?'#d97706':'#c0392b',w:512,h:128,font:'bold 64px Fredoka, Trebuchet MS, sans-serif'});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:coneTex[g]}));s.scale.set(2.2,.55,1);return s;}
function buildFlat(l,A){
  if(obsGroup){if(obsGroup.parent)obsGroup.parent.remove(obsGroup);obsGroup=null;}fallen=[];practice.forEach(p=>{if(p.A===A)p.g.visible=false;});
  const g=new THREE.Group();W().group.add(g);obsGroup=g;const plan=FLAT[l],n=plan.length;const rx=A.hx-9,rz=A.hz-9;
  const cm=EQ.mat(0xff7a1a,.5),wm=EQ.mat(0xffffff,.5);
  return plan.map((gait,i)=>{const a=-Math.PI/2+(i+1)/(n+1)*Math.PI*2*1.0;const x=A.cx+Math.cos(a)*rx,z=A.cz+Math.sin(a)*rz;
    const tx2=-Math.sin(a)*rx,tz2=Math.cos(a)*rz,th=Math.atan2(tx2,tz2);const fwd=new V3(Math.sin(th),0,Math.cos(th)),right=new V3(-Math.cos(th),0,Math.sin(th));
    for(const sd of [-1,1]){const px=x+right.x*sd*2.2,pz=z+right.z*sd*2.2;EQ.mesh(EQ.G.cone(.25,.6,12),cm,px,.3,pz,g);EQ.mesh(EQ.G.cyl(.18,.2,.08,12),wm,px,.42,pz,g);}
    const sp=coneSprite(gait);sp.position.set(x,2.4,z);g.add(sp);
    return {pos:new V3(x,0,z),th,fwd,right,planes:[{h:.2}],gait,flat:true,W:4.4,done:false};});
}
function flatLogic(){const C=G.course,o=C.obs[C.next];if(!o)return;
  const a=(R.px-o.pos.x)*o.fwd.x+(R.pz-o.pos.z)*o.fwd.z,b=(R.x-o.pos.x)*o.fwd.x+(R.z-o.pos.z)*o.fwd.z;
  const lx=(R.x-o.pos.x)*o.right.x+(R.z-o.pos.z)*o.right.z;
  if(!(a<0&&b>=0)||Math.abs(lx)>3.4)return;
  const g=gaitOf(R.sp);o.done=true;C.next++;
  if(g===o.gait){EQ.sfx.click();msg('✓ '+GAITN[o.gait][1].replace('Al','al'),.8);}else{C.faults++;EQ.sfx.wrong();msg('🗣️ Betta: <small>'+GAITN[o.gait][1]+'! Eri '+(g==='fermo'?'fermo':'al '+g)+'</small>',1.8);}
  const nx=C.obs[C.next];
  if(!nx){setTimeout(()=>msg('🏁 Fine lezione!',2),300);finishCourse();return;}
  if(nx.gait!==o.gait)setTimeout(()=>{msg('🗣️ Betta: '+GAITN[nx.gait][1]+'!',1.8);EQ.sfx.whistle();},g===o.gait?700:1900);
}
function startCourse(l,noFade,ctx){
  const L=LEVELS[l];ctx=ctx||G.courseCtx||{mode:'race',A:AR};const mode=ctx.mode;
  (noFade?(t,cb)=>cb():fade)(CMODE[mode].v+' · Livello '+(l+1)+' · '+L.name,()=>{
    AR=ctx.A;const flat=mode==='train'&&l<2;const list=flat?buildFlat(l,AR):buildObstacles(L,AR);
    if(mode==='race'&&W().arenaGate){W().arenaGate.visible=true;W().gateColl.off=false;}
    if(flat){const o=list[0];R.x=o.pos.x-o.fwd.x*14;R.z=o.pos.z-o.fwd.z*14;R.h=o.th;}
    else{const [sx,sz]=tx(L.start[0],L.start[1]);R.x=sx;R.z=sz;R.h=L.start[2]*EQ.D2R;}R.sp=0;R.y=0;R.vy=0;R.grounded=true;
    G.cur.x=R.x;G.cur.z=R.z;G.cur.h=R.h;
    if(G.cur.where!=='ride'){G.cur.x=R.x;G.cur.z=R.z;G.cur.h=R.h;mountNow();}
    G.course={l,obs:list,next:0,faults:0,time:0,state:'count',mode,A:AR,flat};if(flat)setTimeout(()=>msg('🗣️ Betta: '+GAITN[list[0].gait][1]+'!<small>passa tra i coni con l\'andatura giusta</small>',3),2600);W().busyArena=AR;
    G.state='ride';snapCam();setTouchMode('ride');hud(true);setActions([]);
    $('timer').classList.add('on');
    let c=3;const el=$('count');el.textContent=c;el.classList.add('on');EQ.sfx.beep(false);
    clearInterval(G.cdI);G.cdI=setInterval(()=>{c--;if(c>0){el.textContent=c;EQ.sfx.beep(false);}else if(c===0){el.textContent='VIA!';EQ.sfx.beep(true);if(G.course)G.course.state='run';}else{el.classList.remove('on');clearInterval(G.cdI);}},800);
  });
}
function endCourse(silent){
  if(!G.course&&!silent)return;
  clearInterval(G.cdI);$('count').classList.remove('on');
  G.course=null;W().busyArena=null;if(W().arenaGate){W().arenaGate.visible=false;W().gateColl.off=true;}$('timer').classList.remove('on');
  if(obsGroup){if(obsGroup.parent)obsGroup.parent.remove(obsGroup);obsGroup=null;}practice.forEach(p=>p.g.visible=true);marker.visible=chev.visible=false;
}
function finishCourse(){
  const C=G.course;G.lastCtx={mode:C.mode,A:C.A};C.state='done';
  if(C.flat){const n=C.obs.length,ok=n-C.faults,medal=C.faults===0?'🥇':C.faults<=2?'🥈':'🥉';stat(G.cur,'happy',8);persist();
    setTimeout(()=>msg('💬 Betta<small>'+(C.faults===0?'Perfett'+EQ.A()+'! Andature tutte giuste.':'Brav'+EQ.A()+'! Attenzione a cambiare andatura al cono giusto.')+'</small>',3),400);
    setTimeout(()=>showResults(medal,'Lezione completata!',`Lezione · Livello ${C.l+1} · ${LEVELS[C.l].name} · ${C.l?'passo, trotto e galoppo':'passo e trotto'}`,
      [[ok+'/'+n,'Andature giuste'],[fmt(C.time)+' s','Tempo'],[medal,'Voto']],
      [C.l<LEVELS.length-1?['org','next','Livello successivo ➜']:null,['','again','↻ Riprova'],['alt','stay','Continua al maneggio'],['alt','menu','Menu principale']].filter(Boolean)),1300);return;}
  EQ.sfx.applause();setTimeout(()=>EQ.sfx.neigh(),900);
  const L=LEVELS[C.l],t=C.time;let medal,title;
  if(C.faults===0&&t<=L.par){medal='🥇';title='Percorso netto!';}
  else if(C.faults<=4&&t<=L.par*1.35){medal='🥈';title=C.faults?'Ottimo giro!':'Netto, ma lent'+EQ.A()+'!';}
  else{medal='🥉';title='Arrivat'+EQ.A()+'!';}
  const k='c'+C.l,b=save.best[k];let rec=false;const race=C.mode==='race';
  if(!race){title=CMODE[C.mode].done;setTimeout(()=>msg('💬 '+CMODE[C.mode].who+'<small>'+(C.faults?'Brav'+EQ.A()+', ma attenzione alle barriere!':'Perfetto, sei pront'+EQ.A()+' per le gare!')+'</small>',3),400);}
  else{if(W().cheer!=null)W().cheer=7;if(!b||C.faults<b.f||(C.faults===b.f&&t<b.t)){rec=true;save.best[k]={t,f:C.faults,m:medal};}}
  stat(G.cur,'happy',10);persist();
  setTimeout(()=>showResults(medal,title,`${CMODE[C.mode].v} · Livello ${C.l+1} · ${L.name} · tempo ideale ${L.par} s`+(rec?'<br><b style="color:#d9730b">⭐ Nuovo record!</b>':''),
    [[fmt(t)+' s','Tempo'],[C.faults,'Penalità'],[medal,'Medaglia']],
    [C.l<LEVELS.length-1?['org','next','Livello successivo ➜']:null,['','again','↻ Riprova'],['alt','stay',W().name==='show'?'Resta al concorso':'Continua al maneggio'],W().name==='show'?['','home','🚚 Torna al maneggio']:null,['alt','menu','Menu principale']].filter(Boolean)),1500);
}

/* ======================= PASSEGGIATE ======================= */
const ITEM_INFO={shell:['🐚','Conchiglie'],apple:['🍎','Mele'],rosette:['🎀','Coccarde']};
const PLACE={show:['🏆','Concorso ippico','🚚 In viaggio verso il concorso…'],home:['🏡','Casa mia','Si va a casa…'],yard:['🏠','Maneggio','Si torna al maneggio…'],beach:['🏖️','Spiaggia','In viaggio verso il mare…'],forest:['🌲','Bosco','Si parte per il bosco…'],city:['🏙️','Città','Si va in città…']};
function itemMesh(kind){
  const g=new THREE.Group();
  if(kind==='shell'){const s=EQ.mesh(new THREE.ConeGeometry(.18,.32,14,1,false),EQ.mat(0xf6c7b0,.4),0,.15,0,g);s.rotation.x=-1.3;const s2=EQ.mesh(EQ.G.sph(.16,14,10),EQ.mat(0xffe2d0,.35),0,.12,.05,g);s2.scale.set(1,.5,.9);}
  else if(kind==='apple'){EQ.mesh(EQ.G.sph(.2,14,12),EQ.mat(0xc2262d,.3),0,.22,0,g);EQ.mesh(EQ.G.cyl(.012,.012,.1,5),EQ.mat(0x5a3418),0,.45,0,g);const l=EQ.mesh(EQ.G.sph(.06,8,6),EQ.mat(0x3f8a2c,.6),.05,.45,0,g);l.scale.set(1.4,.3,.7);}
  else{EQ.mesh(EQ.G.cyl(.22,.22,.04,20),EQ.mat(0x1d4ed8,.5),0,.6,0,g).rotation.x=Math.PI/2;EQ.mesh(EQ.G.cyl(.12,.12,.05,20),EQ.mat(0xffd23f,.4,.3),0,.6,.01,g).rotation.x=Math.PI/2;
    for(const s of [-1,1]){const t=EQ.mesh(EQ.G.box(.08,.4,.01),EQ.mat(0x1d4ed8,.5),s*.07,.32,0,g);t.rotation.z=s*.2;}}
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,12,12,1,true),new THREE.MeshBasicMaterial({color:0xfff2a8,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  beam.position.y=6;g.add(beam);g.userData.spin=g.children[0];
  return g;
}
/* ======================= URTI, DANNI, POLIZIA E AMBULANZA ======================= */
G.dmg={shop:0,car:0,ppl:0};G.shake=0;G.slowT=0;G.em=[];
const ip={x:0,z:0};
const glassFX=EQ.Particles(220,.12,0xd8f0ff,{floor:.02,opacity:.95});scene.add(glassFX.obj);
const crackTex=EQ.canvasTex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2;
  for(let k=0;k<3;k++){const cx=60+Math.random()*136,cy=60+Math.random()*136;for(let i=0;i<14;i++){let x=cx,y=cy,a=Math.random()*Math.PI*2;g.beginPath();g.moveTo(x,y);for(let j=0;j<6;j++){a+=(Math.random()-.5)*.6;x+=Math.cos(a)*18;y+=Math.sin(a)*18;g.lineTo(x,y);}g.stroke();}
    for(let r=12;r<60;r+=16){g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke();}g.fillStyle='rgba(20,20,25,.85)';g.beginPath();g.arc(cx,cy,10,0,Math.PI*2);g.fill();}});
function burst(x,y,z,n,sp){for(let i=0;i<n;i++)glassFX.emit(x,y,z,rnd(-sp,sp),rnd(.5,sp*1.2),rnd(-sp,sp),1.4);}
function impactShake(v){G.shake=Math.max(G.shake,v);}
function hitName(a){const e=a.ent;if(e.vehicle)return e.vehicle==='bike'?'il ciclista':'il quad';return e.name||(e.npc&&e.npc.o&&e.npc.o.kid?'un bambino':'una persona');}
function impacts(fx,fz,cols){
  const sp0=R.sp,w=W(),city=w.name==='city';if(sp0<3.2)return false;
  // persone, bici, quad, altri cavalieri
  for(const a of (w.agents||[])){if(a.disabled||a.kn||!a.ent.root.visible)continue;const e=a.ent;
    const r=e.horse?(e.npc?1.0:null):e.vehicle==='quad'?1.2:e.vehicle==='bike'?.8:e.npc?.45:null;if(r==null)continue;
    const nx=R.x+fx*.9,nz=R.z+fz*.9,dx=a.x-nx,dz=a.z-nz;if(Math.abs(dx)>3||Math.abs(dz)>3)continue;
    const d=Math.hypot(dx,dz);if(d>r+.55)continue;
    const mode=EQ.knockAgent(w,a,a.x-R.x+fx*.5,a.z-R.z+fz*.5,sp0);if(!mode)continue;
    const nm=hitName(a);R.sp=sp0*.4;impactShake(.35);EQ.sfx.thud();setTimeout(()=>EQ.sfx.ouch(e.npc?e.npc.o.fem:(e.vnpc&&e.vnpc.o.fem)),120);
    if(mode==='vehicle')EQ.sfx.crash();
    msg('💥 '+(mode==='rider'?'Il cavaliere è caduto!':'Hai travolto '+nm+'!')+'<small>vai piano tra la gente!</small>',2.2);
    if(city&&(mode==='person'||mode==='vehicle')){G.dmg.ppl++;callEmergency('amb',a);}
    if(sp0>10&&Math.random()<.5){setTimeout(()=>fallOff(),50);return true;}
    return false;}
  // auto
  for(const c of cols){if(!c.car||c.off||(c.hitT||0)>T)continue;if(Math.abs(c.x-R.x)>6||Math.abs(c.z-R.z)>6)continue;
    if(c.h!=null&&R.y>c.h-.3)continue;
    ip.x=R.x+fx*1.0;ip.z=R.z+fz*1.0;if(!EQ.collide(ip,.55,[c])){ip.x=R.x;ip.z=R.z;if(!EQ.collide(ip,.8,[c]))continue;}
    c.hitT=T+3;R.sp=sp0*.15;impactShake(.5);EQ.sfx.crash();setTimeout(()=>EQ.sfx.alarm(),300);EQ.sfx.neigh();
    burst(R.x+fx*1.4,1,R.z+fz*1.4,30,2.5);
    msg('💥 Hai sbattuto contro un\'auto!',2);if(city){G.dmg.car++;checkPolice();}
    if(sp0>9){setTimeout(()=>fallOff(),50);return true;}return false;}
  // vetrine dei negozi
  if(city&&sp0>4&&w.shops){const nx=R.x+fx*1.3,nz=R.z+fz*1.3;
    for(const c of cols){if(!c.block)continue;if(Math.abs(nx-c.x)>c.hx+.6||Math.abs(nz-c.z)>c.hz+.6)continue;
      let best=null,bd=4;for(const sh of w.shops){const sx=sh.x+Math.sin(sh.ry)*sh.d/2,sz=sh.z+Math.cos(sh.ry)*sh.d/2;const d=Math.hypot(sx-nx,sz-nz);if(d<bd&&d<sh.w/2+1.2){bd=d;best=sh;}}
      if(best&&!best.broken){best.broken=true;const fx2=Math.sin(best.ry),fz2=Math.cos(best.ry);const sx=best.x+fx2*(best.d/2+.07),sz=best.z+fz2*(best.d/2+.07);
        const cm=new THREE.Mesh(new THREE.PlaneGeometry(best.w*.62,best.gh*.68),new THREE.MeshBasicMaterial({map:crackTex,transparent:true,depthWrite:false}));cm.position.set(sx,best.gh*.5,sz);cm.rotation.y=best.ry;w.group.add(cm);
        burst(sx,1.4,sz,70,3);EQ.sfx.glass();EQ.sfx.thud();impactShake(.45);R.sp=sp0*.1;R.x-=fx*.8;R.z-=fz*.8;
        msg('💥 Hai rotto la vetrina: '+best.name+'!',2.2);G.dmg.shop++;checkPolice();
        if(sp0>10){setTimeout(()=>fallOff(),50);return true;}return false;}
      break;}}
  return false;
}
function checkPolice(){if(G.dmg.shop+G.dmg.car>=3&&!G.em.some(v=>v.kind==='pol'))callEmergency('pol',null);}
function roadRoute(tx,tz){const g=W().grid;if(!g)return null;const lines=[];for(let k=-g.n-1;k<=g.n;k++)lines.push((k+.5)*g.P);
  let best=null;for(const c of lines){const dv=Math.abs(tx-c),dh=Math.abs(tz-c);if(!best||dv<best.d)best={d:dv,vert:true,c};if(dh<best.d)best={d:dh,vert:false,c};}
  const along=best.vert?tz:tx,ext=g.ext-4;let start=along-110;if(start<-ext)start=along+110;if(start>ext)start=-ext;
  const dir=Math.sign(along-start)||1,lane=-1.9*dir;
  const P=(s)=>best.vert?{x:best.c+lane,z:s}:{x:s,z:best.c-lane};
  return {from:P(start),to:P(along-dir*7),out:P(dir>0?ext+20:-ext-20),h:best.vert?(dir>0?0:Math.PI):(dir>0?Math.PI/2:-Math.PI/2),dir};}
function lightBar(g,y,cols){const L=[];cols.forEach((c,i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.4,.14,.25),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:0}));m.position.set((i-.5)*.45,y,0);g.add(m);L.push(m);});return L;}
function sideLabel(g,text,bg,y,W2,L){const t=EQ.labelTex(text,{bg,w:512,h:96,radius:6,font:'bold 64px Fredoka, Trebuchet MS, sans-serif'});for(const sd of [1,-1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(L,L*96/512),new THREE.MeshBasicMaterial({map:t}));m.position.set(sd*(W2/2+.03),y,0);m.rotation.y=sd*Math.PI/2;g.add(m);}}
function callEmergency(kind,victim){
  const w=W();if(w.name!=='city'||G.em.some(v=>v.kind===kind))return;
  const pp=victim?{x:victim.kn.x,z:victim.kn.z}:{x:(G.state==='ride'||G.state==='drive')?R.x:F.x,z:(G.state==='ride'||G.state==='drive')?R.z:F.z};
  const rt=roadRoute(pp.x,pp.z);if(!rt)return;
  const g=new THREE.Group();let lights,crew=[];
  if(kind==='pol'){g.add(new THREE.Mesh(EQ.carGeo('sedan',0x1f3b7a),EQ.CARMAT));lights=lightBar(g,1.58,[0x2a6bff,0x2a6bff]);sideLabel(g,'POLIZIA','#1f3b7a',.75,1.82,1.8);
    crew.push(EQ.buildNPC({fem:Math.random()<.4,top:0x1f3b7a,pants:0x1f3b7a,cap:0x1f3b7a,sleeves:'long',shoes:0x111111}));}
  else{g.add(new THREE.Mesh(EQ.carGeo('van',0xf6f6f6),EQ.CARMAT));lights=lightBar(g,2.32,[0x2a6bff,0xff2a2a]);sideLabel(g,'AMBULANZA','#d62828',1.05,1.95,2.6);
    for(let i=0;i<2;i++)crew.push(EQ.buildNPC({fem:i===1,top:0xe8590c,pants:0xe8590c,sleeves:'short',shoes:0x111111}));
    victim.kn.hold=true;}
  g.children[0].castShadow=true;w.group.add(g);
  crew.forEach(n=>{n.root.visible=false;w.group.add(n.root);});
  const v={kind,g,lights,crew,rt,s:0,state:'drive',t:0,victim,sirT:0,cols:[{x:0,z:0,r:1.3,car:true,h:99},{x:0,z:0,r:1.3,car:true,h:99}]};w.colliders.push(...v.cols);
  g.position.set(rt.from.x,0,rt.from.z);g.rotation.y=rt.h;G.em.push(v);
  setTimeout(()=>msg(kind==='pol'?'🚓 Arriva la polizia!<small>hai fatto troppi danni</small>':'🚑 Arriva l\'ambulanza!<small>per '+hitName(victim)+'</small>',2.6),600);
}
function emUpdate(dt){
  if(!G.em.length)return;const w=W();
  G.em=G.em.filter(v=>{
    v.t+=dt;const blink=Math.floor(v.t*6)%2;v.lights.forEach((m,i)=>m.material.emissiveIntensity=(i%2===blink)?3:0);
    v.sirT-=dt;if(v.sirT<=0&&v.state!=='done'){v.sirT=3.6;EQ.sfx.siren();}
    const pp=(G.state==='ride'||G.state==='drive')?{x:R.x,z:R.z}:{x:F.x,z:F.z};
    if(v.state==='drive'||v.state==='leave'){const tgt=v.state==='drive'?v.rt.to:v.rt.out;const g=v.g;const dx=tgt.x-g.position.x,dz=tgt.z-g.position.z,d=Math.hypot(dx,dz);
      let sp=Math.min(14,d*1.2+2);const fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y),qx=pp.x-g.position.x,qz=pp.z-g.position.z,ah=qx*fx+qz*fz;if(ah>0&&ah<7&&Math.abs(qx*fz-qz*fx)<2.6)sp=0;
      g.position.x+=dx/d*sp*dt;g.position.z+=dz/d*sp*dt;v.cols[0].x=g.position.x+fx*1.2;v.cols[0].z=g.position.z+fz*1.2;v.cols[1].x=g.position.x-fx*1.2;v.cols[1].z=g.position.z-fz*1.2;
      if(d<.5){if(v.state==='leave'){w.group.remove(g);v.crew.forEach(n=>w.group.remove(n.root));v.cols.forEach(c=>c.off=true);return false;}v.state='park';v.t=0;
        v.crew.forEach((n,i)=>{n.root.visible=true;const sd=i?-1:1;n.root.position.set(g.position.x+Math.cos(v.rt.h)*1.4*sd,.14,g.position.z-Math.sin(v.rt.h)*1.4*sd);n.home=n.root.position.clone();});}}
    else if(v.state==='park'){
      const goal=v.kind==='pol'?pp:{x:v.victim.kn.x,z:v.victim.kn.z};
      v.crew.forEach((n,i)=>{const tx=goal.x+(i?.9:-.9)*(v.kind==='amb'?1:0)+(v.kind==='pol'?-1.6:0),tz=goal.z+(v.kind==='amb'?.4:0);const q=n.root.position,dx=tx-q.x,dz=tz-q.z,d=Math.hypot(dx,dz);
        if(d>.4&&v.t<14){const s2=Math.min(2.4,d*2);q.x+=dx/d*s2*dt;q.z+=dz/d*s2*dt;n.root.rotation.y=Math.atan2(dx,dz);n.pose(dt,'walk',{speed:s2});}
        else{n.root.rotation.y=Math.atan2(goal.x-q.x,goal.z-q.z);n.pose(dt,v.kind==='amb'?'crouch':'talk',{});if(!v.arrived){v.arrived=T;onArrive(v);}}});
      if(v.arrived&&T-v.arrived>(v.kind==='amb'?5:6)){v.state='back';if(v.kind==='amb'){v.victim.kn.hold=false;v.victim.kn.t=v.victim.kn.lie;msg('🚑 '+hitName(v.victim)+' sta bene!<small>attent'+EQ.A()+' con il cavallo</small>',2.6);}}}
    else if(v.state==='back'){let all=true;v.crew.forEach(n=>{const q=n.root.position,dx=n.home.x-q.x,dz=n.home.z-q.z,d=Math.hypot(dx,dz);if(d>.4){all=false;q.x+=dx/d*2.4*dt;q.z+=dz/d*2.4*dt;n.root.rotation.y=Math.atan2(dx,dz);n.pose(dt,'walk',{speed:2.4});}});
      if(all){v.crew.forEach(n=>n.root.visible=false);v.state='leave';v.sirT=99;}}
    return true;});
}
function onArrive(v){
  if(v.kind==='pol'){const fine=(G.dmg.shop*80+G.dmg.car*50);EQ.sfx.whistle();
    msg('👮 Polizia: Alt!<small>multa di '+fine+' € per i danni. Il cavallo va al passo per un po\'</small>',4.5);
    G.slowT=30;G.dmg.shop=0;G.dmg.car=0;if(G.stars>0){G.stars--;LS.set('stars',G.stars);}
    if(G.state==='ride'){R.sp=0;}}
  else EQ.sfx.whistle();
}
/* ======================= VEICOLI: auto, bici, monopattini, moto ======================= */
const VEH={car:{name:'l\'auto',verb:'🚗 Guida l\'auto',max:22,acc:6,r:1.0,pose:'drive',seat:[.38,.05,-.25]},
  bike:{name:'la bici',verb:'🚲 Prendi la bici',max:8.5,acc:3.2,r:.5,pose:'pedal',seat:[0,-.02,-.2]},
  scooter:{name:'il monopattino',verb:'🛴 Prendi il monopattino',max:7,acc:2.8,r:.45,pose:'scooter',seat:[0,.14,-.05]},
  moto:{name:'la moto',verb:'🏍️ Guida la moto',max:20,acc:7,r:.6,pose:'moto',seat:[0,-.05,-.28]}};
function makeVeh(w,kind,x,z,h,col,tp){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const m=kind==='car'?EQ.buildCar(tp||EQ.pick(['hatch','sedan','suv','hatch']),col):kind==='bike'?EQ.buildBike(col):kind==='scooter'?EQ.buildScooter(col):EQ.buildMoto(col);
  inner.add(m);g.position.set(x,w.height(x,z),z);g.rotation.y=h;w.group.add(g);
  const V={kind,g,inner,x,z,h,sp:0,tip:0,lean:0,cols:kind==='car'?[{x:0,z:0,r:1.05,h:1.4,car:true},{x:0,z:0,r:1.05,h:1.4,car:true}]:[{x:0,z:0,r:.45,h:.9}]};
  w.colliders.push(...V.cols);parkCols(V);(w.vehicles=w.vehicles||[]).push(V);return V;}
function parkCols(V){const fx=Math.sin(V.h),fz=Math.cos(V.h);V.cols.forEach((c,i)=>{const k=V.cols.length>1?(i?-1.2:1.2):0;c.x=V.x+fx*k;c.z=V.z+fz*k;c.off=false;});}
function spawnVehicles(w){if(w.vehSpawned)return;w.vehSpawned=true;const n=w.name,mk=(k,x,z,h,c)=>makeVeh(w,k,x,z,h,c);
  if(n==='yard'){mk('car',30,45,-Math.PI/2);mk('car',36.5,45,-Math.PI/2);mk('car',-1.9,64,0);mk('bike',5,30,0);mk('bike',5,31.6,0);mk('scooter',5,33.2,0);mk('moto',5.2,35.4,0);}
  else if(n==='city'){
    mk('bike',-8,-24.2,Math.PI/2);mk('bike',-6.5,-24.2,Math.PI/2);mk('scooter',-5,-24.2,Math.PI/2);mk('scooter',-3.8,-24.2,Math.PI/2);mk('moto',4,-24.2,Math.PI/2);mk('moto',6,-24.2,Math.PI/2);}
  else if(n==='beach'){const sh=w.shore;mk('bike',-40,5,Math.PI/2);mk('scooter',-40,7,Math.PI/2);mk('moto',-44,5.5,Math.PI/2);mk('car',sh(260)-49.6,260,Math.PI);mk('bike',sh(-30)-18,-26,Math.PI/2);}
  else if(n==='forest'){const s=w.spawn,rx=-Math.cos(s.h),rz=Math.sin(s.h);mk('bike',s.x+rx*3,s.z+rz*3,s.h);mk('bike',s.x+rx*3.4-Math.sin(s.h)*2,s.z+rz*3.4-Math.cos(s.h)*2,s.h);mk('moto',s.x-rx*3.4,s.z-rz*3.4,s.h);}
}
spawnVehicles(yard);
function nearVeh(){let b=null,bd=9;for(const V of (W().vehicles||[])){if(V===G.veh)continue;const d=Math.hypot(V.x-F.x,V.z-F.z)-(V.kind==='car'?1.4:0);if(d<2.2&&d<bd){bd=d;b=V;}}
  for(const p of (W().parked||[])){if(p.taken)continue;if(Math.abs(p.x-F.x)>5||Math.abs(p.z-F.z)>5)continue;const d=Math.hypot(p.x-F.x,p.z-F.z)-1.4;if(d<2.2&&d<bd){bd=d;b={parked:p,kind:'car'};}}
  return b;}
function unpark(p){const w=W();p.taken=true;const pa=p.mesh.geometry.attributes.position;for(let i=p.start;i<p.start+p.count;i++)pa.setXYZ(i,0,-50,0);pa.needsUpdate=true;
  p.coll.off=true;w.colliders=w.colliders.filter(c=>c!==p.coll);return makeVeh(w,'car',p.x,p.z,p.ry,p.col,p.tp);}
function vehActions(A){if(G.state!=='foot'||G.swim||G.sit)return;const V=nearVeh();if(!V)return;
  A.push({id:'veh',icon:V.tip?'🔧':VEH[V.kind].verb.split(' ')[0],label:V.tip?'Rialza '+VEH[V.kind].name:VEH[V.kind].verb.slice(VEH[V.kind].verb.indexOf(' ')+1),fn:()=>enterVeh(V.parked?unpark(V.parked):V)});}
function enterVeh(V){
  if(G.leading){waitHere();msg((G.cur?G.cur.def.name:'Il cavallo')+' ti aspetta qui',1.6);}
  const w=W();w.colliders=w.colliders.filter(c=>!V.cols.includes(c));w.vehicles=w.vehicles.filter(x=>x!==V);
  scene.attach(V.g);V.tip=0;V.inner.rotation.z=0;V.sp=0;V.lean=0;
  const D=VEH[V.kind];V.g.add(P.root);P.root.position.set(D.seat[0],D.seat[1],D.seat[2]);P.root.rotation.set(0,0,0);P.pose(1,D.pose,{snap:true});
  G.veh=V;G.state='drive';setTouchMode('foot');$('gait').classList.add('on');snapCam();
  if(V.kind==='car'){EQ.sfx.buckle();setTimeout(()=>EQ.sfx.engine(.5),300);}else EQ.sfx.click();
  setTimeout(()=>{if(!G.navTo&&G.veh&&W().portals)msg('🧭 Scegli dove andare<small>tocca il pulsante 🧭</small>',2.6);},2400);
  msg({car:'🚗 Si parte!',bike:'🚲 Pedala!',scooter:'🛴 Via!',moto:'🏍️ Brum brum!'}[V.kind]+'<small>trascina in su per andare, in giù per frenare</small>',2.2);
}
function leaveVeh(quiet){const V=G.veh;if(!V)return;G.veh=null;EQ.loop('myengine',0);
  scene.attach(P.root);P.root.rotation.set(0,0,0);
  const w=W();w.group.attach(V.g);V.sp=0;parkCols(V);w.colliders.push(...V.cols);(w.vehicles=w.vehicles||[]).push(V);
  const lx=Math.cos(V.h),lz=-Math.sin(V.h),off=V.kind==='car'?1.6:.9;F.x=V.x+lx*off;F.z=V.z+lz*off;F.h=V.h;F.camYaw=V.h;F.sp=0;
  const q={x:F.x,z:F.z};EQ.collide(q,.3,w.colliders);F.x=q.x;F.z=q.z;
  if(!quiet){G.state='foot';setTouchMode('foot');snapCam();}}
function vehFall(V,sp0){
  const w=W();scene.updateMatrixWorld();P.root.getWorldPosition(tv);scene.attach(P.root);P.root.rotation.order='YXZ';
  const fx=Math.sin(V.h),fz=Math.cos(V.h);let tx=V.x+fx*Math.min(3,sp0*.25)+Math.cos(V.h)*.8,tz=V.z+fz*Math.min(3,sp0*.25)-Math.sin(V.h)*.8;const q={x:tx,z:tz};EQ.collide(q,.4,w.colliders);
  G.veh=null;EQ.loop('myengine',0);w.group.attach(V.g);V.tip=1;V.sp=0;V.inner.rotation.z=1.35;parkCols(V);w.colliders.push(...V.cols);(w.vehicles=w.vehicles||[]).push(V);
  G.fall={t:0,sx:tv.x,sy:tv.y+.9,sz:tv.z,tx:q.x,tz:q.z,h:V.h,course:null,veh:V};
  G.state='fall';setActions([]);setTouchMode('foot');impactShake(.5);EQ.sfx.crash();EQ.sfx.thud();
  msg('💥 Sei cadut'+EQ.A()+' da '+VEH[V.kind].name.replace(/^(la |il |l')/,m=>({"la ":'lla ',"il ":'l ',"l'":"ll'"}[m]))+'!',2.4);
}
const NAVN={home:'🏡 Casa mia',show:'🏆 Concorso',yard:'🏠 Maneggio',city:'🏙️ Città',beach:'🏖️ Spiaggia',forest:'🌲 Bosco'};
function navAction(A){const ps=(W().portals||[]).map(p=>p.to);if(!ps.length)return;
  A.push({id:'nav',icon:'🧭',label:G.navTo?'Vai a: '+NAVN[G.navTo]:'Dove vuoi andare?',fn:()=>{const i=ps.indexOf(G.navTo);G.navTo=i<ps.length-1?ps[i+1]:null;
    msg(G.navTo?'🧭 '+NAVN[G.navTo]+'<small>segui la freccia gialla in alto</small>':'🧭 Navigatore spento',1.8);EQ.sfx.click();actSig='';}});}
function driveUpdate(dt){
  const V=G.veh,D=VEH[V.kind],w=W();
  const inp=G.busy?{x:0,y:0}:EQ.readInput();
  const thr=-inp.y;let tgt=thr>.1?thr*D.max:thr<-.35?-D.max*.25:0;
  if(G.slowT>0)tgt=Math.min(tgt,4);
  const acc=(tgt>V.sp?D.acc:(thr<-.35&&V.sp>0?D.acc*2.2:D.acc*.6));V.sp+=U.clamp(tgt-V.sp,-acc*dt,acc*dt);
  const steer=U.clamp(inp.x,-1,1);const tr=(V.kind==='car'?.11:.16)*U.clamp(Math.abs(V.sp)/3,0,1)*(1-Math.min(.6,Math.abs(V.sp)/40));
  V.h-=steer*tr*V.sp*dt*(V.kind==='car'?1:1.2)*(V.sp<0?1:1);
  const px=V.x,pz=V.z,fx=Math.sin(V.h),fz=Math.cos(V.h);
  V.x+=fx*V.sp*dt;V.z+=fz*V.sp*dt;
  // urti con persone, auto, vetrine (stessa logica del cavallo)
  const sg=V.sp<0?-1:1;R.x=V.x;R.z=V.z;R.h=V.h;R.y=0;R.sp=Math.abs(V.sp);R.px=px;R.pz=pz;const sp0=R.sp;
  if(sp0>3.2){impacts(fx*sg,fz*sg,w.colliders);if(R.sp<sp0-.2){V.sp=sg*R.sp;V.x=R.x;V.z=R.z;
    if(V.kind!=='car'&&sp0>4.5){vehFall(V,sp0);return;}}}
  // collisioni
  const pos={x:V.x,z:V.z};let hit=EQ.collide(pos,D.r,w.colliders);
  if(V.kind==='car'){const a={x:V.x+fx*1.2,z:V.z+fz*1.2},b={x:V.x-fx*1.2,z:V.z-fz*1.2};
    if(EQ.collide(a,1.0,w.colliders)){pos.x+=a.x-(V.x+fx*1.2);pos.z+=a.z-(V.z+fz*1.2);hit=true;}
    if(EQ.collide(b,1.0,w.colliders)){pos.x+=b.x-(V.x-fx*1.2);pos.z+=b.z-(V.z-fz*1.2);hit=true;}}
  for(const j of (w.jumps||[])){if(EQ.segX(px+fx*D.r*2,pz+fz*D.r*2,pos.x+fx*D.r*2,pos.z+fz*D.r*2,j.ax,j.az,j.bx,j.bz)){pos.x=px;pos.z=pz;hit=true;break;}}
  if(w.water(pos.x,pos.z)-w.height(pos.x,pos.z)>.45){pos.x=px;pos.z=pz;hit=true;if(!G.wetMsg){G.wetMsg=1;msg('🌊 Non si può guidare in acqua!',1.6);setTimeout(()=>G.wetMsg=0,3000);}}
  const b=w.bounds;if(b){pos.x=U.clamp(pos.x,b.x0,b.x1);pos.z=U.clamp(pos.z,b.z0,b.z1);}
  if(w.boundR){const d=Math.hypot(pos.x,pos.z);if(d>w.boundR){pos.x*=w.boundR/d;pos.z*=w.boundR/d;}}
  V.x=pos.x;V.z=pos.z;
  if(hit){const sp=Math.abs(V.sp);
    if(sp>6){impactShake(Math.min(.8,sp*.04));if(V.kind==='car'){EQ.sfx.crash();if(sp>12)msg('💥 Che botta!',1.4);}else if(sp>5){vehFall(V,sp);return;}else EQ.sfx.bump();}
    V.sp*=V.kind==='car'?-.15:0;}
  // portali
  if(G.portalCd>0)G.portalCd-=dt;
  else if(w.portals&&!G.busy){for(const pt of w.portals){if(Math.hypot(V.x-pt.x,V.z-pt.z)<7){G.portalCd=5;travel(pt.to,G.loc);break;}}}
  const gy=w.height(V.x,V.z);
  V.lean=U.lerp(V.lean,V.kind==='car'?0:U.clamp(steer*Math.abs(V.sp)*.05,-.45,.45),Math.min(1,dt*5));
  V.g.position.set(V.x,gy,V.z);V.g.rotation.y=V.h;V.inner.rotation.z=V.lean;
  if(V.kind==='car'){V.inner.rotation.x=U.lerp(V.inner.rotation.x,-U.clamp((tgt-V.sp)*.004,-.03,.03),Math.min(1,dt*4));}
  P.pose(dt,D.pose,{speed:Math.abs(V.sp),steer});
  if(V.kind==='car'||V.kind==='moto')EQ.loop('myengine',.12+Math.abs(V.sp)*.008,70+Math.abs(V.sp)*(V.kind==='moto'?14:8),1.4,'lowpass');
  R.x=V.x;R.z=V.z;R.h=V.h;R.sp=Math.abs(V.sp);
  const kmh=Math.round(Math.abs(V.sp)*3.6);$('gaitTx').textContent={car:'🚗',bike:'🚲',scooter:'🛴',moto:'🏍️'}[V.kind]+' '+kmh+' km/h'+(V.sp<-.3?' (retro)':'');$('spd').style.width=Math.min(100,Math.abs(V.sp)/D.max*100)+'%';
  const por=EQ.portrait,cd=V.kind==='car'?(por?9:7.5):(por?6.5:5.2);
  followCam(V.x,gy,V.z,V.h,cd+Math.abs(V.sp)*.06,V.kind==='car'?(por?3.8:3.1):(por?3:2.5),3,1.2,dt,6);
  if(!G.busy){const A=[];if(Math.abs(V.sp)<1.5)A.push({id:'vout',icon:'⬇️',label:'Scendi',fn:()=>leaveVeh()});
    navAction(A);
    A.push({id:'horn',icon:V.kind==='car'||V.kind==='moto'?'📯':'🔔',label:V.kind==='car'||V.kind==='moto'?'Clacson':'Campanello',fn:()=>{(V.kind==='car'||V.kind==='moto'?EQ.sfx.honk2:EQ.sfx.bikebell)();}});
    setActions(A);}
}
function travel(to,from,noFade,text){
  G.inside=false;G.hact=null;
  $('trip').classList.remove('on');['pause','results'].forEach(k=>$(k).classList.remove('on'));
  const txt=text||(to==='yard'?'Si torna al maneggio…':PLACE[to][2]);
  (noFade?(t,cb)=>cb():fade)(txt,()=>{
    endCourse(true);
    if(G.veh&&G.cur){if(G.cur.guest)releaseGuest();else{placeInBox(G.cur);G.cur=null;}}
    const H=G.cur;
    horses.forEach(h=>{if(h!==H&&(h.where==='wait'||h.where==='garden'))placeInBox(h);h.tiedHome=false;});
    G.em=[];G.dmg={shop:0,car:0,ppl:0};
    if(G.world!==yard){G.standers=[];G.world.dispose();G.trip=null;EQ.stopLoops();}
    let w;
    if(to==='yard'){w=yard;yard.group.visible=true;horses.forEach(h=>h.root.visible=true);$('timer').classList.remove('on');}
    else{yard.group.visible=false;horses.forEach(h=>{if(h!==H)h.root.visible=false;});
      w=EQ['build'+{beach:'Beach',forest:'Forest',city:'City',show:'Show',home:'Home'}[to]]();try{EQ.populate[to](w);}catch(e){console.error(e);}}
    G.world=w;G.loc=to;EQ.setSky(w.sky);AR=(w.spots&&w.spots.arena)||Y.arena;buildPractice(w);
    const pt=from&&w.portals?w.portals.find(p=>p.to===from):null;
    let s=pt?{x:pt.x+Math.sin(pt.inH)*16,z:pt.z+Math.cos(pt.inH)*16,h:pt.inH}:(to==='yard'?w.spawnRide:w.spawn);
    R.x=s.x;R.z=s.z;R.h=s.h;R.sp=pt?6:0;R.y=0;R.vy=0;R.grounded=true;if(H){H.x=R.x;H.z=R.z;H.h=R.h;}
    if(G.veh){const V=G.veh;V.x=s.x;V.z=s.z;V.h=s.h;V.sp=pt?5:0;}
    spawnVehicles(w);
    G.portalCd=3;
    if(to!=='yard'&&w.items&&w.items.length){const ig=new THREE.Group();w.group.add(ig);
      G.trip={kind:to,items:w.items.map(it=>{const m=itemMesh(w.itemKind);m.position.set(it.x,it.y,it.z);ig.add(m);return{m,got:false,x:it.x,z:it.z};}),count:0,time:0,done:false};
      $('timer').classList.add('on');
      setTimeout(()=>msg(PLACE[to][0]+' '+PLACE[to][1]+'!<small>trova '+w.items.length+' '+ITEM_INFO[w.itemKind][1].toLowerCase()+'</small>',3),400);}
    else if(to!=='yard'){$('timer').classList.remove('on');setTimeout(()=>msg(PLACE[to][0]+' '+PLACE[to][1]+'!<small>'+(to==='show'?'si gareggia davanti al pubblico':'lega il cavallo al palo o lascialo in giardino')+'</small>',3),400);}
    else if(H){applyRideDirt(H);persist();setTimeout(()=>msg('Bentornat'+EQ.A()+' al maneggio!<small>scendi e dai da mangiare a '+H.def.name+'</small>',3),400);}
    if(G.mission&&from==='city'&&G.mission.k===to){G.stars++;LS.set('stars',G.stars);setTimeout(()=>msg('⭐ Obiettivo completato!<small>'+G.mission.t+' · stelle: '+G.stars+'</small>',2.6),3600);}
    G.navTo=null;G.mission=null;if(to==='city')newMission();
    if(G.veh){G.state='drive';setTouchMode('foot');$('gait').classList.add('on');}else if(H&&H.where!=='ride'){mountNow();}else{G.state='ride';setTouchMode('ride');}hud(true);snapCam();
    if(G.afterTravel){const f=G.afterTravel;G.afterTravel=null;f();}
  },250);
}
function goTrip(kind,noFade){travel(kind,null,noFade);}
function tripLogic(dt){
  const t=G.trip;if(!t.done)t.time+=dt;
  t.items.forEach((it,i)=>{if(it.got)return;it.m.children[0].rotation.y=T*2+i;it.m.position.y=W().height(it.x,it.z)+Math.max(0,W().water(it.x,it.z)-W().height(it.x,it.z))+.4+Math.sin(T*2.5+i)*.15;
    if(Math.hypot(R.x-it.x,R.z-it.z)<2.6){it.got=true;it.m.visible=false;t.count++;EQ.sfx.ding();
      for(let k=0;k<20;k++)FX.spark.emit(it.x,it.m.position.y+.5,it.z,rnd(-1.5,1.5),rnd(1,3),rnd(-1.5,1.5),1);
      if(W().itemKind==='apple'){EQ.sfx.munch();stat(G.cur,'hunger',4);stat(G.cur,'happy',3);}
      const inf=ITEM_INFO[W().itemKind];msg(`${inf[0]} ${t.count}/${t.items.length}`,1.1);
      if(t.count>=t.items.length&&!t.done){t.done=true;stat(G.cur,'happy',15);persist();
        const k='t'+t.kind,b=save.best[k];let rec=false;const medal=t.time<=150?'🥇':t.time<=260?'🥈':'🥉';if(!b||t.time<b.t){rec=true;save.best[k]={t:t.time,m:medal};persist();}
        setTimeout(()=>{EQ.sfx.applause();showResults(medal,'Tutte trovate!',PLACE[t.kind][1]+' · '+t.items.length+' '+inf[1].toLowerCase()+(rec?'<br><b style="color:#d9730b">⭐ Nuovo record!</b>':''),
          [[fmt(t.time)+' s','Tempo'],[t.items.length+'/'+t.items.length,inf[1]],[medal,'Medaglia']],
          [['org','cont','Continua la passeggiata'],['','home','🏠 Torna al maneggio'],['alt','menu','Menu principale']]);},700);}}});
}
function cleanupTrip(){
  if(G.world===yard)return;
  G.world.dispose();G.world=yard;G.loc='yard';G.trip=null;EQ.setSky(yard.sky);yard.group.visible=true;
  horses.forEach(h=>h.root.visible=true);$('timer').classList.remove('on');EQ.stopLoops();
}
function goHome(){travel('yard',G.loc);}

/* ======================= ATTIVITÀ ======================= */
const ACT=$('act');
function openAct(kind,opts){G.act=Object.assign({kind,t:0,tool:null},opts||{});G.state='act';setActions([]);setTouchMode('act');$('touch').classList.remove('on');$('gait').classList.remove('on');renderAct();}
function closeAct(silent){
  if(!G.act)return;const a=G.act;G.act=null;ACT.classList.remove('on');panel(null);hint(null);handItem.visible=false;brushM.visible=false;hoseM.visible=false;
  if(G.cur){G.cur.st={};}
  if(silent)return;
  G.state='foot';
  if(a.kind==='dress'){G.state='fade';fade('',()=>{F.x=Y.selleria.x;F.z=Y.selleria.z-.3;F.h=Math.PI;F.camYaw=Math.PI;G.state='foot';hud(true);setTouchMode('foot');snapCam();persist();
    if(P.ready())msg('Pront'+EQ.A()+' per montare!',2);});return;}
  G.state='foot';hud(true);setTouchMode('foot');
}
$('panel').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||G.busy)return;EQ.audio();EQ.sfx.click();onPanel(b.dataset.a,b.dataset.v);});
function horseSideCam(dt,H,far){
  const por=EQ.portrait;const d=(por?6.2:5.4)*(far||1);
  const lx=Math.cos(H.h),lz=-Math.sin(H.h);
  const ox=H.x+lx*d+Math.sin(H.h)*.2,oz=H.z+lz*d+Math.cos(H.h)*.2;
  camGo(ox,por?2.0:1.7,oz,H.x+Math.sin(H.h)*.15,por?.35:.95,H.z+Math.cos(H.h)*.15,dt,4,pshift(d));
}
function renderAct(){
  const a=G.act;if(!a)return;const H=G.cur;
  if(a.kind==='posta'){
    const tk=H.tack;
    const tools=[['brush','🪮','Spazzola','strofina col dito'],['hoof','🦶','Zoccoli','tocca gli zoccoli'],['carrot','🥕','Carota','un premio'],['tack','🐎','Sella e briglia',tk.saddle?'già sellato':'prepara'],['untie','🔓','Slega','portalo via'],['done','✔️','Fatto','lascialo legato']];
    panel(`<h3>🪮 <span>${H.def.name} alla posta</span><button class="x" data-a="done">Chiudi</button></h3>${statsHtml(H.stats)}
      <div class="tools">${tools.map(t=>`<button class="tool${a.tool===t[0]?' sel':''}${(t[0]==='hoof'&&a.picked&&a.picked.every(Boolean))||(t[0]==='brush'&&H.dirtLeft()<.05)?' done':''}" data-a="${t[0]}"><i>${t[1]}</i>${t[2]}<small>${t[3]}</small></button>`).join('')}</div>`);
  } else if(a.kind==='tack'){
    const k=H.tack;
    const steps=[['pad','🟦','Sottosella'],['saddle','🪑','Sella'],['girth','➰','Sottopancia'],['bridle','🐴','Briglia'],['wraps','🧦','Fasce']];
    const pads=[0x1d3f8a,0xc0392b,0xe86aa6,0x2f6b33,0xffffff,0x7b3fb0,0x111111];
    panel(`<h3>🐎 <span>Sella ${H.def.name}</span><button class="x" data-a="back">◀ Indietro</button></h3>
      <div class="tools">${steps.map(s=>`<button class="tool${k[s[0]]?' done':''}" data-a="t_${s[0]}"><i>${s[1]}</i>${s[2]}<small>${k[s[0]]?'✓ messo · togli':'metti'}</small></button>`).join('')}<button class="tool" data-a="t_all"><i>✨</i>Tutto<small>${k.saddle?'togli tutto':'metti tutto'}</small></button></div>
      <div class="cat">Colore sottosella</div><div class="chips">${pads.map(c=>`<button class="chip${k.padColor===c?' sel':''}" data-a="padc" data-v="${c}"><s style="background:#${c.toString(16).padStart(6,'0')}"></s></button>`).join('')}</div>
      <div class="cat">Colore fasce</div><div class="chips">${pads.map(c=>`<button class="chip${k.wrapColor===c?' sel':''}" data-a="wrapc" data-v="${c}"><s style="background:#${c.toString(16).padStart(6,'0')}"></s></button>`).join('')}</div>
      <div class="note">Ordine: sottosella → sella → sottopancia → briglia</div>`);
  } else if(a.kind==='wash'){
    const tools=[['water','🚿','Acqua','tieni premuto sul cavallo'],['scrape','🧽','Raschietto','asciuga strofinando'],['carrot','🥕','Carota','un premio'],['untie','🔓','Slega','portalo via'],['done','✔️','Fatto','']];
    panel(`<h3>🚿 <span>Doccia per ${H.def.name}</span><button class="x" data-a="done">Chiudi</button></h3>${statsHtml(H.stats)}
      <div class="tools">${tools.map(t=>`<button class="tool${a.tool===t[0]?' sel':''}" data-a="${t[0]}"><i>${t[1]}</i>${t[2]}<small>${t[3]}</small></button>`).join('')}</div>`);
  } else if(a.kind==='feed'){
    const h=horses[a.i];
    const foods=[['hay','🌾','Fieno','+35 sazietà'],['oats','🥣','Avena','+20 sazietà, +energia'],['carrot','🥕','Carota','+felicità'],['apple','🍎','Mela','+felicità'],['water','💧','Acqua fresca','+felicità'],['brushh','💛','Coccole','']];
    panel(`<h3>🥕 <span>Pappa per ${h.def.name}</span><button class="x" data-a="close">Chiudi</button></h3>${statsHtml(h.stats)}
      <div class="tools">${foods.map(f=>`<button class="tool" data-a="f_${f[0]}"><i>${f[1]}</i>${f[2]}<small>${f[3]}</small></button>`).join('')}</div>
      <div class="note">${h.stats.hunger<40?h.def.name+' ha fame!':h.stats.hunger>95?h.def.name+' è sazio 😊':''}</div>`);
  } else if(a.kind==='dress'){
    const O=EQ.OUTFIT_OPTS, o=P.outfit;
    let h=`<h3>👕 <span>Spogliatoio</span><button class="x" data-a="close">Fatto ✓</button></h3>`;
    for(const k in O){const c=O[k];h+=`<div class="cat">${c.icon} ${c.label}${(k==='helmet'||k==='protector')?' · obbligatorio':''}</div><div class="chips">`+
      c.opts.map(([v,l])=>{const sel=String(o[k])===String(v);const col=typeof v==='number'?'#'+v.toString(16).padStart(6,'0'):typeof v==='string'?'#'+parseInt(v.split(':')[1]).toString(16).padStart(6,'0'):null;
        return `<button class="chip${sel?' sel':''}" data-a="o_${k}" data-v="${v}">${col?`<s style="background:${col}"></s>`:''}${l}</button>`;}).join('')+`</div>`;}
    h+=`<div class="note">${P.ready()?'✅ Casco e corpetto: sei pront'+EQ.A()+' per montare!':'⚠️ Per montare a cavallo servono casco e corpetto'}</div>`;
    panel(h);
  }
}
function onPanel(a,v){
  const A=G.act,H=G.cur;if(!A)return;
  if(A.kind==='posta'){
    if(a==='done'){closeAct();return;}
    if(a==='untie'){untie();return;}
    if(a==='tack'){A.kind='tack';A.tool=null;ACT.classList.remove('on');hint(null);renderAct();return;}
    if(a==='carrot'){giveTreat(H,'carrot');return;}
    if(a==='brush'||a==='hoof'){A.tool=A.tool===a?null:a;ACT.classList.toggle('on',!!A.tool);
      hint(A.tool==='brush'?(H.dirtLeft()>.05?'Strofina il dito sulle macchie di fango':'È già pulitissimo! ✨'):A.tool==='hoof'?'Tocca uno zoccolo per pulirlo':null);
      if(A.tool==='hoof'&&!A.picked)A.picked=[0,0,0,0];brushM.visible=A.tool==='brush';renderAct();return;}
  }
  if(A.kind==='tack'){
    if(a==='back'){A.kind='posta';renderAct();return;}
    const k=H.tack;
    const order=['pad','saddle','girth','bridle'];
    if(a.startsWith('t_')){const s=a.slice(2);
      if(s==='all'){if(k.saddle){H.setTack({pad:false,saddle:false,girth:false,bridle:false,wraps:false,halter:true});msg('Tolto tutto',1.2);}
        else{if(H.stats.clean<60){msg('Prima puliscilo!<small>lo sporco sotto la sella fa male</small>',2.4);return;}H.setTack({pad:true,saddle:true,girth:true,bridle:true,halter:false});msg('Pronto per partire! 🏇',1.6);EQ.sfx.buckle();}
        renderAct();persist();return;}
      if(s==='wraps'){H.setTack({wraps:!k.wraps});EQ.sfx.zip();renderAct();return;}
      const idx=order.indexOf(s);
      if(k[s]){ // togliere: solo dall'ultimo
        for(let j=order.length-1;j>idx;j--)if(k[order[j]]){msg('Prima togli: '+{pad:'sottosella',saddle:'sella',girth:'sottopancia',bridle:'briglia'}[order[j]],1.6);return;}
        const t={};t[s]=false;if(s==='bridle')t.halter=true;H.setTack(t);EQ.sfx.zip();renderAct();return;}
      for(let j=0;j<idx;j++)if(!k[order[j]]){msg('Prima metti: '+{pad:'sottosella',saddle:'sella',girth:'sottopancia'}[order[j]],1.6);return;}
      if(s==='pad'&&H.stats.clean<60){msg('Prima puliscilo!<small>lo sporco sotto la sella fa male</small>',2.4);return;}
      const t={};t[s]=true;if(s==='bridle')t.halter=false;H.setTack(t);
      ({pad:EQ.sfx.zip,saddle:EQ.sfx.land,girth:EQ.sfx.buckle,bridle:EQ.sfx.buckle})[s]();
      H.root.updateMatrixWorld();H.seat.getWorldPosition(tv);for(let i=0;i<10;i++)FX.spark.emit(tv.x+rnd(-.4,.4),tv.y+rnd(-.2,.3),tv.z+rnd(-.3,.3),0,rnd(.3,.9),0,.8);
      G.poseT=1;renderAct();persist();
      if(s==='bridle')msg('Pronto! Ora slegalo e monta 🏇',2.2);return;}
    if(a==='padc'){H.setTack({padColor:+v});renderAct();return;}
    if(a==='wrapc'){H.setTack({wrapColor:+v});renderAct();return;}
  }
  if(A.kind==='wash'){
    if(a==='done'){if(H.wet>.3){H.anim.shake=1.2;EQ.sfx.splash(.3);H.root.updateMatrixWorld();H.root.getWorldPosition(tv);for(let i=0;i<60;i++)FX.water.emit(tv.x+rnd(-1,1),tv.y+1.3,tv.z+rnd(-.4,.4),rnd(-2,2),rnd(0,2),rnd(-2,2),1);}closeAct();return;}
    if(a==='untie'){untie();return;}
    if(a==='carrot'){giveTreat(H,'carrot');return;}
    if(a==='water'||a==='scrape'){A.tool=A.tool===a?null:a;ACT.classList.toggle('on',!!A.tool);hoseM.visible=A.tool==='water';
      hint(A.tool==='water'?'Tieni premuto il dito sul cavallo per bagnarlo':A.tool==='scrape'?'Strofina per asciugarlo':null);renderAct();return;}
  }
  if(A.kind==='feed'){
    const h=horses[A.i];
    if(a==='close'){closeAct();return;}
    if(G.feedBusy>0)return;
    const f=a.slice(2);
    if(f==='brushh'){pet(h);renderAct();return;}
    if((f==='hay'||f==='oats')&&h.stats.hunger>95){msg(h.def.name+' è già sazio!',1.6);return;}
    if(f==='hay'||f==='oats'){Y.boxes[A.i].hay.visible=true;h.st={eat:1,lookY:-.55};G.feedBusy=4;G.feedHorse=h;EQ.sfx.click();
      setTimeout(()=>{EQ.sfx.munch();},600);setTimeout(()=>EQ.sfx.munch(),1800);setTimeout(()=>EQ.sfx.munch(),3000);
      stat(h,'hunger',f==='hay'?35:20);if(f==='oats')stat(h,'energy',15);stat(h,'happy',4);msg(f==='hay'?'🌾 Gnam gnam!':'🥣 Che buona l\'avena!',1.5);}
    else if(f==='water'){stat(h,'happy',5);stat(h,'thirst',60);msg('💧 Secchio pieno di acqua fresca',1.5);EQ.sfx.splash(.15);}
    else giveTreat(h,f);
    persist();setTimeout(renderAct,300);
  }
  if(A.kind==='dress'&&a.startsWith('o_')){
    const k=a.slice(2);let val=v;
    if(v==='null')val=null;else if(v==='true')val=true;else if(v==='false')val=false;else if(/^\d+$/.test(v))val=+v;
    P.setOutfit({[k]:val});EQ.sfx.zip();persist();renderAct();
    if(k==='helmet'&&val!=null)msg('⛑️ Casco allacciato!',1.2);if(k==='protector'&&val!=null)msg('🦺 Corpetto chiuso!',1.2);
    return;
  }
  if(A.kind==='dress'&&a==='close'){closeAct();return;}
}
function giveTreat(h,kind){
  handItem.visible=true;carrotM.visible=kind==='carrot';appleM.visible=kind==='apple';G.feedBusy=2.4;G.treatT=2.4;G.feedHorse=h;
  h.st=Object.assign(h.st||{},{neckX:-.25,headX:-.25,lookY:0});
  setTimeout(()=>{EQ.sfx.munch();handItem.visible=false;},1300);
  setTimeout(()=>{if(h.st){h.st.neckX=0;h.st.headX=0;}},2400);
  stat(h,'happy',10);stat(h,'hunger',4);msg(kind==='carrot'?'🥕 Che buona!':'🍎 Gnam!',1.4);persist();
}
function openPosta(){const H=G.cur;F.x=Y.posta.stand.x;F.z=Y.posta.stand.z;F.h=0;openAct('posta',{picked:null});snapCam();}
function startWash(){const H=G.cur;F.x=Y.wash.stand.x;F.z=Y.wash.stand.z;F.h=0;openAct('wash');snapCam();}
function startFeed(i){const b=Y.boxes[i];F.x=b.front.x+.3;F.z=b.front.z+.25;F.h=0;openAct('feed',{i});snapCam();}
function startDress(){fade('Spogliatoio',()=>{openAct('dress');F.x=300;F.z=299.6;F.h=0;snapCam();});}

function pshift(d){return (!EQ.portrait&&$('panel').classList.contains('on'))?d*.3:0;}
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), plane=new THREE.Plane();
function pointOnHorseSide(sx,sy,H){
  ndc.set(sx/innerWidth*2-1,-(sy/innerHeight)*2+1);ray.setFromCamera(ndc,camera);
  const lx=Math.cos(H.h),lz=-Math.sin(H.h);
  plane.setFromNormalAndCoplanarPoint(new V3(lx,0,lz),new V3(H.x+lx*.35,0,H.z+lz*.35));
  const p=new V3();return ray.ray.intersectPlane(plane,p)?p:null;
}
let brushSnd=0;
function actUpdate(dt){
  const A=G.act;if(!A){G.state='foot';return;}A.t+=dt;const H=G.cur;const E=EQ.act;
  if(A.kind==='dress'){
    P.root.position.set(300,0,299.6);P.root.rotation.y=0;P.pose(dt,'mirror',{});
    const por=EQ.portrait;camGo(300,por?1.0:1.2,por?303.6:302.6,300,por?.3:.95,299.6,dt,4,pshift(2.4));
    EQ.followSun(P.root.position);return;
  }
  if(A.kind==='feed'){
    const h=horses[A.i];const b=Y.boxes[A.i];
    P.root.position.set(F.x,0,F.z);P.root.rotation.y=0;
    P.pose(dt,(G.treatT>0||G.petT>0)?'feed':'stand',{});
    const por=EQ.portrait;camGo(b.front.x-(por?2.6:2.3),por?2.2:2.0,b.front.z-(por?3.8:2.9),b.front.x+.2,por?.85:1.35,b.front.z+1.6,dt,4,pshift(3.5));
    if(G.feedBusy>0){G.feedBusy-=dt;if(G.feedBusy<=0&&G.feedHorse){G.feedHorse.st={};}}
    return;
  }
  // posta / tack / wash: Giorgia accanto al cavallo
  horseSideCam(dt,H,A.kind==='tack'?1.1:1);
  const lx=Math.cos(H.h),lz=-Math.sin(H.h);
  let gx=H.x+lx*1.05+Math.sin(H.h)*.9, gz=H.z+lz*1.05+Math.cos(H.h)*.9, gh=H.h-Math.PI/2-.0;
  let pose='stand';
  if(A.kind==='posta'&&A.tool==='brush'){
    brushM.visible=true;pose='brush';
    if(E.down){const p=pointOnHorseSide(E.x,E.y,H);
      if(p){const along=(p.x-H.x)*Math.sin(H.h)+(p.z-H.z)*Math.cos(H.h);A.along=U.clamp(along,-.9,1.1);}
      const mv=Math.hypot(E.x-(A.lx||E.x),E.y-(A.ly||E.y));
      const got=H.scrub(E.x,E.y,75,mv*.012);
      if(got>0){brushSnd-=dt;if(brushSnd<=0){EQ.sfx.brush();brushSnd=.18;}if(p)for(let k=0;k<2;k++)FX.dust.emit(p.x,p.y,p.z,rnd(-.3,.3),rnd(-.2,.4),rnd(-.3,.3),.8);}
      A.lx=E.x;A.ly=E.y;
    } else {A.lx=A.ly=null;}
    if(A.along!=null){gx=H.x+lx*1.0+Math.sin(H.h)*A.along;gz=H.z+lz*1.0+Math.cos(H.h)*A.along;}
    const left=H.dirtLeft();H.stats.clean=Math.max(H.stats.clean,U.clamp(100-left*4,0,100));
    if(left<.05&&!A.cleanDone){A.cleanDone=true;H.clearDirt();H.stats.clean=100;stat(H,'happy',6);persist();msg('✨ Pulitissimo!',2);EQ.sfx.ok();hint('Ora puoi sellarlo 🐎');
      H.root.updateMatrixWorld();H.root.getWorldPosition(tv);for(let i=0;i<40;i++)FX.spark.emit(tv.x+rnd(-1,1),tv.y+rnd(.8,1.7),tv.z+rnd(-.5,.5),0,rnd(.2,.8),0,1.2);renderAct();}
    if(Math.random()<.1)renderStatsOnly();
  }
  if(A.kind==='posta'&&A.tool==='hoof'){
    if(E.tap){const tp=E.tap;E.tap=null;let best=-1,bd=95;
      H.legs.forEach((L,i)=>{L.hoof.getWorldPosition(tv);const s=EQ.toScreen(tv);const d=Math.hypot(s.x-tp.x,s.y-tp.y);if(d<bd){bd=d;best=i;}});
      if(best>=0&&!A.pickT){A.pickI=best;A.pickT=1.6;H.st.pick=best;EQ.sfx.click();}}
    if(A.pickT>0){A.pickT-=dt;pose='pick';H.legs[A.pickI].hoof.getWorldPosition(tv);gx=tv.x+lx*.55;gz=tv.z+lz*.55;
      if(Math.random()<dt*10)FX.stone.emit(tv.x,tv.y,tv.z,rnd(-.3,.3),rnd(0,.5),rnd(-.3,.3),1.5);
      if(Math.random()<dt*6)EQ.sfx.brush();
      if(A.pickT<=0){A.pickT=0;H.st.pick=-1;A.picked[A.pickI]=1;msg('Zoccolo pulito! '+A.picked.filter(Boolean).length+'/4',1);
        if(A.picked.every(Boolean)){stat(H,'happy',6);msg('🦶 Tutti gli zoccoli puliti!',2);EQ.sfx.ok();persist();renderAct();}}}
  }
  if(A.kind==='wash'){
    if(A.tool==='water'&&E.down){pose='spray';hoseM.visible=true;const p=pointOnHorseSide(E.x,E.y,H);
      nozzle.getWorldPosition(tv);
      if(p){for(let k=0;k<7;k++){const dx=p.x-tv.x,dy=p.y-tv.y,dz=p.z-tv.z,L=Math.hypot(dx,dy,dz)||1,v=6;FX.water.emit(tv.x,tv.y,tv.z,dx/L*v+rnd(-.4,.4),dy/L*v+2+rnd(-.4,.4),dz/L*v+rnd(-.4,.4),.5);}
        H.scrub(E.x,E.y,90,dt*2.2);H.setWet(H.wet+dt*.3);
        for(let k=0;k<2;k++)FX.water.emit(p.x+rnd(-.2,.2),p.y,p.z+rnd(-.1,.1),rnd(-.3,.3),-.5,rnd(-.3,.3),.8);}
      EQ.loop('hose',.22,2600,.4);
    } else EQ.loop('hose',0);
    if(A.tool==='scrape'&&E.down){pose='brush';const mv=Math.hypot(E.x-(A.lx||E.x),E.y-(A.ly||E.y));A.lx=E.x;A.ly=E.y;H.setWet(H.wet-mv*.0018);
      if(mv>2){const p=pointOnHorseSide(E.x,E.y,H);if(p)FX.water.emit(p.x,p.y,p.z,rnd(-.2,.2),-.2,rnd(-.2,.2),.6);brushSnd-=dt;if(brushSnd<=0){EQ.sfx.brush();brushSnd=.2;}}}
    else if(!E.down){A.lx=A.ly=null;}
    const left=H.dirtLeft();H.stats.clean=Math.max(H.stats.clean,U.clamp(100-left*4,0,100));
    if(left<.05&&!A.cleanDone){A.cleanDone=true;H.clearDirt();H.stats.clean=100;stat(H,'happy',5);persist();msg('🫧 Pulito e profumato!',2);EQ.sfx.ok();}
    if(Math.random()<.1)renderStatsOnly();
  }
  if(G.treatT>0){G.treatT-=dt;pose='feed';gx=H.x+lx*.6+Math.sin(H.h)*2.0;gz=H.z+lz*.6+Math.cos(H.h)*2.0;gh=H.h+Math.PI-.4;}
  if(G.poseT>0){G.poseT-=dt;pose='brush';}
  // muovi Giorgia dolcemente
  F.x=U.lerp(F.x,gx,Math.min(1,dt*4));F.z=U.lerp(F.z,gz,Math.min(1,dt*4));F.h+=U.wrapA(gh-F.h)*Math.min(1,dt*5);
  P.root.position.set(F.x,0,F.z);P.root.rotation.y=F.h;P.pose(dt,pose,{});
}
function renderStatsOnly(){const p=$('panel').querySelector('.stats');if(p&&G.cur){const t=document.createElement('div');t.innerHTML=statsHtml(G.cur.stats);p.replaceWith(t.firstChild);}}

/* ======================= RISULTATI / PAUSA ======================= */
function showResults(medal,title,sub,stats,btns){
  G.state='results';setActions([]);
  $('rMedal').textContent=medal;$('rTitle').textContent=title;$('rSub').innerHTML=sub;
  $('rStats').innerHTML=stats.map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
  $('rBtns').innerHTML=btns.map(b=>`<button class="btn ${b[0]}" data-r="${b[1]}">${b[2]}</button>`).join('');
  $('results').classList.add('on');
}
$('rBtns').addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(!b)return;EQ.audio();const r=b.dataset.r;$('results').classList.remove('on');
  if(r==='menu'){toMenu();return;}
  if(r==='home'){goHome();return;}
  if(r==='cont'){G.state='ride';return;}
  const l=G.course?G.course.l:(G.lastL||0);
  if(r==='again'){startCourse(l,false,G.lastCtx);return;}
  if(r==='next'){startCourse(Math.min(LEVELS.length-1,l+1),false,G.lastCtx);return;}
  if(r==='stay'){fade('',()=>{endCourse(true);G.state=G.cur&&G.cur.where==='ride'?'ride':'foot';R.sp=0;});}
});
let prevState=null;
function pause(){if(G.busy||!['foot','ride','act','drive'].includes(G.state))return;prevState=G.state;G.state='paused';
  $('homeBtn').style.display=G.world!==yard?'':'none';$('restartBtn').style.display=G.course?'':'none';renderMenu();$('pause').classList.add('on');
  if(G.course&&G.course.state==='count'){clearInterval(G.cdI);$('count').classList.remove('on');G.course.state='run';}}
function resume(){$('pause').classList.remove('on');G.state=prevState||'foot';last=performance.now();}
$('pauseBtn').addEventListener('pointerdown',e=>{e.stopPropagation();pause();});
$('resumeBtn').onclick=resume;
$('homeBtn').onclick=()=>{$('pause').classList.remove('on');G.state=prevState;goHome();};
$('restartBtn').onclick=()=>{$('pause').classList.remove('on');G.state=prevState;startCourse(G.course.l,false,{mode:G.course.mode,A:G.course.A});};
$('menuBtn').onclick=()=>{$('pause').classList.remove('on');fade('',toMenu);};
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{EQ.audio();goTrip(b.dataset.go);}));
$('tripNo').onclick=()=>{$('trip').classList.remove('on');G.state='ride';};
EQ.onKey=c=>{if(c==='Escape'||c==='KeyP'){if(G.state==='paused')resume();else pause();}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});

/* ======================= HUD ======================= */
function tasksList(){const H=G.cur;return[
  ['👕','Mettiti casco e corpetto',P.ready()],
  ['🐴','Prendi un cavallo dal box',!!H||G.didRide],
  ['🪮','Puliscilo alla posta',(!!H&&H.stats.clean>=90)||G.didRide],
  ['🐎','Sellalo e metti la briglia',(!!H&&H.tack.saddle&&H.tack.bridle)||G.didRide],
  ['🏇','Monta: pista o passeggiata!',G.didRide]];}
let hudT=0;
function updateHud(dt){
  hudT-=dt;if(hudT>0)return;hudT=.25;
  {const show=G.state==='foot'&&!G.sit&&!G.hact&&!G.ia&&!G.climb;$('runBtn').style.display=show?'':'none';if(!show&&G.run&&G.state!=='foot')setRun(false);}
  if(G.course){const C=G.course;$('infoT').textContent=(C.mode==='race'?'🏆 ':C.mode==='train'?'🎓 ':'🐎 ')+CMODE[C.mode].v+' · '+LEVELS[C.l].name;const nx=C.obs[C.next];$('infoS').textContent=!nx?'Arrivo!':C.flat?`${GAITN[nx.gait][0]} ${GAITN[nx.gait][1]} · cono ${C.next+1} di ${C.obs.length} · ora: ${gaitOf(R.sp)}`:`Ostacolo ${C.next+1} di ${C.obs.length}`;$('tasks').innerHTML='';
    $('timer').textContent='⏱ '+fmt(C.time)+(C.faults?'  ❌ '+C.faults:'');}
  else if(G.trip){const t=G.trip,inf=ITEM_INFO[W().itemKind];$('infoT').textContent=PLACE[t.kind][0]+' '+PLACE[t.kind][1]+(G.cur?' · '+G.cur.def.name:'');$('infoS').innerHTML=`${inf[0]} ${inf[1]}: ${t.count} di ${t.items.length}`+(G.mission?`<br>🎯 ${G.mission.t} · ⭐${G.stars}`:'')+needsLine();$('tasks').innerHTML='';$('timer').textContent='⏱ '+fmt(t.time);}
  else{const L=tasksList();const nx=L.find(t=>!t[2]);$('infoT').textContent='🏇 '+EQ.pname()+' · '+(PLACE[G.loc]||PLACE.yard)[1];
    $('infoS').innerHTML=(nx?('Prossimo: '+nx[0]+' '+nx[1]):'Tutto fatto! Divertiti 🎉')+needsLine();
    $('tasks').innerHTML=L.map(t=>`<div class="${t[2]?'ok':''}">${t[2]?'✅':'⬜'} ${t[0]} ${t[1]}</div>`).join('')+(G.cur?`<div style="margin-top:4px;color:#ffe08a">${G.cur.def.name}: 🌾${G.cur.stats.hunger|0} 🫧${G.cur.stats.clean|0} ⚡${G.cur.stats.energy|0}</div>`:'');}
}
function needsLine(){const H=G.cur;if(!H||!H.stats||H.where==='box')return'';const s=H.stats,c=v=>v<25?'#ff8a8a':'#e8f5d0';const th=s.thirst==null?80:s.thirst;
  return `<br><span style="font-size:12.5px">${H.def.name}: <b style="color:${c(s.energy)}">⚡${s.energy|0}</b> <b style="color:${c(s.hunger)}">🌾${s.hunger|0}</b> <b style="color:${c(th)}">💧${th|0}</b> <b style="color:${c(s.clean)}">🫧${s.clean|0}</b></span>`;}
function dirTarget(){
  if(G.navTo&&(G.state==='drive'||G.state==='ride')){const p=(W().portals||[]).find(p=>p.to===G.navTo);if(p)return p;}
  if(G.mission&&W().name==='city')return G.mission;
  if(G.course&&G.course.next<G.course.obs.length){const o=G.course.obs[G.course.next];const lz=(R.x-o.pos.x)*o.fwd.x+(R.z-o.pos.z)*o.fwd.z,lx=(R.x-o.pos.x)*o.right.x+(R.z-o.pos.z)*o.right.z;
    return (lz>-1||Math.abs(lx)>Math.max(4,-lz*.8))?{x:o.pos.x-o.fwd.x*10,z:o.pos.z-o.fwd.z*10}:o.pos;}
  if(G.trip){let b=1e9,r=null;G.trip.items.forEach(it=>{if(it.got)return;const d=(it.x-R.x)**2+(it.z-R.z)**2;if(d<b){b=d;r=it;}});return r;}
  if(G.world===yard&&G.state==='foot'){const L=tasksList();const H=G.cur;
    if(!L[0][2]&&!G.leading)return Y.selleria;
    if(!H)return Y.boxes[G.sel].front;
    if(G.leading&&(!L[2][2]||!L[3][2]))return Y.posta.horse;
    if(H.where==='posta'||H.where==='wash')return {x:H.x,z:H.z};
    return null;}
  if(G.world===yard&&G.state==='ride'&&!G.didTrip){return null;}
  return null;
}
function updateDir(){
  const el=$('dir');const t=(G.state==='foot'||G.state==='ride'||G.state==='drive')?dirTarget():null;
  if(!t){el.classList.remove('on');return;}
  const px=(G.state==='ride'||G.state==='drive')?R.x:F.x,pz=(G.state==='ride'||G.state==='drive')?R.z:F.z;
  if(Math.hypot(t.x-px,t.z-pz)<3.5){el.classList.remove('on');return;}
  el.classList.add('on');
  camera.getWorldDirection(tv);const yaw=Math.atan2(tv.x,tv.z);
  const rel=U.wrapA(Math.atan2(t.x-px,t.z-pz)-yaw);
  el.firstElementChild.style.transform=`rotate(${-rel}rad)`;
}

/* ======================= LOOP ======================= */
function idleHorses(dt){
  (G.cur&&G.cur.guest?horses.concat([G.cur]):horses).forEach(H=>{
    if(H===G.cur&&(H.where==='ride'||H.where==='lead'))return;
    if(H.where==='box'&&G.world===yard){H.bt-=dt;if(H.bt<0&&!(G.act&&G.act.kind==='feed'&&G.act.i===H.i&&G.feedBusy>0)&&!(G.treatT>0&&G.feedHorse===H)){H.bt=rnd(3,8);const r=Math.random();
      H.st=r<.3?{lookY:rnd(-.5,.5)}:r<.5&&Y.boxes[H.i].hay.visible?{eat:1,lookY:-.55}:r<.6?{eat:.7,graze:1}:{};}}
    if(H.where==='garden'&&W().spots&&W().spots.garden){const g=W().spots.garden;H.gw=(H.gw||0)-dt;
      if(H.gw<=0||H.gtx==null){H.gw=rnd(6,14);H.gtx=rnd(g.x0+3,g.x1-3);H.gtz=rnd(g.z0+4,g.z1-3);}
      const dx=H.gtx-H.x,dz=H.gtz-H.z,d=Math.hypot(dx,dz);let sp=0;if(d>.6&&H.gw<10){H.h+=U.wrapA(Math.atan2(dx,dz)-H.h)*Math.min(1,dt*1.5);sp=Math.min(1.2,d);}
      H.sp=U.lerp(H.sp||0,sp,Math.min(1,dt*2));const q={x:H.x+Math.sin(H.h)*H.sp*dt,z:H.z+Math.cos(H.h)*H.sp*dt};EQ.collide(q,.6,W().colliders);H.x=q.x;H.z=q.z;
      H.root.position.set(H.x,W().height(H.x,H.z),H.z);H.root.rotation.y=H.h;H.animate(dt,Object.assign({speed:H.sp,eat:H.sp<.2?1:0,graze:1},H.st||{}));return;}
    if(H.where==='posta'||H.where==='wash'||H.where==='menu'||H.where==='wait'){H.root.position.set(H.x,H.where==='wait'?W().height(H.x,H.z):0,H.z);H.root.rotation.y=H.h;}
    H.animate(dt,Object.assign({speed:0},H.st||{}));
  });
  // porte dei box
  Y.boxes.forEach(b=>{const tgt=-(b.doorT>0?1.9:0);if(b.doorT>0)b.doorT-=dt;b.door.rotation.y=U.lerp(b.door.rotation.y,tgt,Math.min(1,dt*4));});
  // paddock
  if(G.world===yard)paddockHorses.forEach(H=>{if(H.adopted)return;const pd=Y.paddock;H.wait-=dt;
    const dx=H.tx-H.x,dz=H.tz-H.z,d=Math.hypot(dx,dz);
    if(H.wait<=0&&d<.5){H.tx=rnd(pd.x0+3,pd.x1-3);H.tz=rnd(pd.z0+3,pd.z1-3);H.wait=rnd(6,16);}
    let sp=0;if(H.wait<=0&&d>.5){H.h+=U.wrapA(Math.atan2(dx,dz)-H.h)*Math.min(1,dt*1.5);sp=Math.min(1.3,d);}
    H.sp=U.lerp(H.sp,sp,Math.min(1,dt*2));H.x+=Math.sin(H.h)*H.sp*dt;H.z+=Math.cos(H.h)*H.sp*dt;
    H.root.position.set(H.x,0,H.z);H.root.rotation.y=H.h;H.animate(dt,{speed:H.sp,eat:H.sp<.2?1:0,graze:1});});
}
function postUpdate(){
  scene.updateMatrixWorld();
  const H=G.cur;
  (H&&H.guest?horses.concat([H]):horses).forEach(h=>{h.reins.visible=false;if(h!==H||!G.leading)h.rope.visible=false;});
  if(H&&H.where==='ride'){P.handL.getWorldPosition(tv);P.handR.getWorldPosition(tv2);H.updateReins(tv,tv2);H.reins.visible=true;}
  if(H&&G.leading){P.handR.getWorldPosition(tv);H.updateRope(tv);H.rope.visible=true;}
  const tiedH=H&&H.tiedHome&&H.where==='wait'&&W().spots&&W().spots.tie;
  if(tiedH){const l=tieLines[0];l.visible=true;const pa=l.geometry.attributes.position;const p=W().spots.tie.post;H.root.updateMatrixWorld();(H.tack.halter?H.chin:H.bitL).getWorldPosition(tv);pa.setXYZ(0,p.x,p.y,p.z);pa.setXYZ(1,tv.x,tv.y,tv.z);pa.needsUpdate=true;tieLines[1].visible=false;}
  const tied=!tiedH&&H&&H.where==='posta';
  if(!tiedH)tieLines.forEach((l,i)=>{l.visible=!!tied;if(tied){const pa=l.geometry.attributes.position;const p=Y.posta.posts[i];(H.tack.halter?H.chin:H.bitL).getWorldPosition(tv);pa.setXYZ(0,p.x,p.y,p.z);pa.setXYZ(1,tv.x,tv.y,tv.z);pa.needsUpdate=true;}});
}
let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  try{
    if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').classList.remove('on');}
    if(G.petT>0)G.petT-=dt;
    horses.forEach(h=>{if(h.wet>0&&!(G.act&&G.act.kind==='wash'&&EQ.act.down))h.setWet(h.wet-dt*.012);});
    G.saveT=(G.saveT||0)+dt;if(G.saveT>10){G.saveT=0;persist();}
    let ppos=null;
    if(G.state==='menu'){
      const H=horses[G.sel];P.root.position.set(F.x,0,F.z);P.root.rotation.y=F.h;P.pose(dt,Math.sin(T*.5)>.6?'wave':'stand',{});
      const por=EQ.portrait,a=T*.1+3.6,r=por?8.2:6.4;
      const cx=Y.posta.horse.x+.6,cz=Y.posta.horse.z;
      camGo(cx+Math.cos(a)*r,por?2.6:2.0,cz+Math.sin(a)*r,cx,por?-.6:1.2,cz,dt,3,por?0:r*.34);
      ppos=P.root.position;
    } else if(G.state==='foot'){footUpdate(dt);ppos=P.root.position;missionCheck(F.x,F.z);if(G.cur&&G.cur.where!=='box'&&Math.hypot(G.cur.x-F.x,G.cur.z-F.z)<12)horseVoice(dt,G.cur,G.cur.sp||0,false);}
    else if(G.state==='ride'){rideUpdate(dt);ppos=G.cur.root.position;missionCheck(R.x,R.z);}
    else if(G.state==='act'){actUpdate(dt);ppos=P.root.position;}
    else if(G.state==='fall'){fallUpdate(dt);ppos=P.root.position;}
    else if(G.state==='drive'){driveUpdate(dt);ppos=G.veh?G.veh.g.position:P.root.position;missionCheck(R.x,R.z);}
    else if(G.state==='results'||G.state==='modal'){if(G.cur&&G.cur.where==='ride'){const inpSave=G.lock;G.lock=1;rideUpdate(dt);G.lock=inpSave;}ppos=G.cur?G.cur.root.position:P.root.position;}
    else ppos=G.cur&&G.cur.where==='ride'?G.cur.root.position:P.root.position;
    if(G.state!=='paused'){
      idleHorses(dt);updateFallen(dt);emUpdate(dt);glassFX.update(dt,-9);if(G.slowT>0){G.slowT-=dt;if(G.slowT<=0)msg('Ora puoi tornare a galoppare 🐎',1.8);}if(G.state!=='menu')ambient(dt);
      G.standers.forEach(n=>{if(n.root.parent){const p=(G.state==='ride'||G.state==='drive')?{x:R.x,z:R.z}:{x:F.x,z:F.z};const q=n.root.position;n.root.rotation.y+=U.wrapA(Math.atan2(p.x-q.x,p.z-q.z)-n.root.rotation.y)*Math.min(1,dt*2);n.pose(dt,Math.sin(T*.6)>.8?'wave':'stand',{});}});
      W().update(dt,T,ppos?{x:ppos.x,z:ppos.z}:null);
      for(const k in FX)FX[k].update(dt,k==='dust'?.4:k==='heart'?1:-9);
      if(G.course&&G.course.next<G.course.obs.length){const o=G.course.obs[G.course.next];marker.visible=chev.visible=true;
        marker.position.set(o.pos.x,o.planes[o.planes.length-1].h+2.2+Math.sin(T*3)*.25,o.pos.z);marker.rotation.y=T*2;chev.position.copy(o.pos);chev.rotation.y=o.th;chev.userData.m.opacity=.45+Math.sin(T*5)*.25;}
      else marker.visible=chev.visible=false;
      updateHud(dt);updateDir();
    }
    if(ppos&&G.state!=='act')EQ.followSun(ppos);else if(G.act&&G.act.kind!=='dress'&&G.cur)EQ.followSun(G.cur.root.position);
    postUpdate();
    if(G.shake>0){G.shake=Math.max(0,G.shake-dt);const k=G.shake*.5;camera.position.x+=(Math.random()-.5)*k;camera.position.y+=(Math.random()-.5)*k;}
    EQ.renderer.render(scene,camera);
  }catch(e){console.error(e);}
  requestAnimationFrame(frame);
}
/* schermo intero: al primo tocco (i browser lo permettono solo dopo un gesto) e ogni volta che si torna a giocare */
function isFull(){return !!(document.fullscreenElement||document.webkitFullscreenElement);}
let fsOff=false;
function goFull(force){if(isFull()||(fsOff&&!force))return;const el=document.documentElement,rq=el.requestFullscreen||el.webkitRequestFullscreen;if(!rq)return;
  try{const r=rq.call(el,{navigationUI:'hide'});if(r&&r.catch)r.catch(()=>{});}catch(e){}
  try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock();}catch(e){}}
['pointerup','touchend','click'].forEach(ev=>document.addEventListener(ev,e=>{const t=e.target;if(t&&(t.tagName==='INPUT'||t.closest&&t.closest('#nameBox')&&t.id!=='nameOk'))return;goFull();},{passive:true,capture:true}));
document.querySelectorAll('.fsB').forEach(b=>b.addEventListener('click',()=>{if(isFull()){fsOff=true;(document.exitFullscreen||document.webkitExitFullscreen).call(document);}else{fsOff=false;goFull(true);}}));
document.addEventListener('fullscreenchange',()=>{document.querySelectorAll('.fsB').forEach(b=>b.textContent=isFull()?'⛶ Esci da schermo intero':'⛶ Schermo intero');setTimeout(EQ.resize,200);});
/* avvio */
toMenu();
requestAnimationFrame(t=>{last=t;$('loading').style.display='none';frame(t);});
window.__EQG={G,R,F,horses,P,travel,startYard,goTrip,startCourse,quickRide,yardActions,openPosta,startDress,startFeed,goHome,toMenu,actList:()=>actList};
})();
