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
const paddockHorses=[{name:'Brezza',body:0x9a5a2a,dark:0x2a1a10,mane:0x2a1a10,points:true,face:'stella',socks:[0,0,1,0]},{name:'Neve',body:0xeeeae2,dark:0xbbb5aa,mane:0xf2efe8,face:null,socks:[0,0,0,0],muzzle:0x6a5f5a}].map(d=>{
  const H=EQ.buildHorse(d);yard.group.add(H.root);const pd=Y.paddock;H.x=rnd(pd.x0+4,pd.x1-4);H.z=rnd(pd.z0+4,pd.z1-4);H.h=rnd(0,TAU);H.tx=H.x;H.tz=H.z;H.wait=rnd(1,6);H.sp=0;return H;});

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
const AR=Y.arena, SX=.82, SZ=.76;
const tx=(x,z)=>[AR.cx+x*SX,AR.cz+z*SZ];
let obsGroup=null, obstacles=[], fallen=[];
function buildObstacles(L,practice){
  if(obsGroup){yard.group.remove(obsGroup);obsGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  obsGroup=new THREE.Group();yard.group.add(obsGroup);fallen=[];
  obstacles=L.obs.map((d,i)=>{const [x,z]=tx(d[0],d[1]);return EQ.buildObstacle(obsGroup,[x,z,d[2],d[3],d[4]],i);});
  obstacles.forEach(o=>o.practice=!!practice);
  obsGroup.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
}
buildObstacles(LEVELS[0],true);
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
function setTouchMode(m){const t=$('touch');t.classList.toggle('ride',m==='ride');$('actions').classList.toggle('ride',m==='ride');$('gait').classList.toggle('on',m==='ride');}
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
function attachRider(H){H.seat.add(P.root);P.root.position.set(0,-.9,0);P.root.rotation.set(0,0,0);}
function detachRider(){scene.add(P.root);P.root.rotation.set(0,0,0);}
function fullTack(H){H.setTack({halter:false,pad:true,saddle:true,girth:true,bridle:true});}
function ensureSafe(){if(P.outfit.helmet==null||P.outfit.protector==null){P.setOutfit({helmet:P.outfit.helmet!=null?P.outfit.helmet:0x1b1b22,protector:P.outfit.protector!=null?P.outfit.protector:0x23407f,gloves:P.outfit.gloves!=null?P.outfit.gloves:0x1a1a1a});persist();}}

/* ======================= MENU ======================= */
function renderMenu(){
  $('horses').innerHTML=EQ.HORSES.map((h,i)=>`<button class="hz${i===G.sel?' sel':''}" data-i="${i}"><i style="background:#${h.body.toString(16).padStart(6,'0')}${h.pinto?';background-image:radial-gradient(circle at 30% 40%,#fff 25%,transparent 26%),radial-gradient(circle at 70% 70%,#fff 20%,transparent 21%)':''}"></i>${h.name}</button>`).join('');
  const s=horses[G.sel].stats;
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
$('nameOk').addEventListener('click',()=>{const v=setName($('nameIn2').value);if(!v){$('nameIn2').focus();$('nameIn2').style.borderColor='#d62828';return;}EQ.audio();$('nameBox').classList.remove('on');$('menu').classList.add('on');});
function setGender(g){LS.set('pgender',g);P.setGender(g);
  if(g==='m'){const o=P.outfit,pk=[0xe86aa6,0xe25d9a,0xf08cb8,0x7b3fb0,0x5b2a86],ch={};
    if(/0xf08cb8|0x5b2a86/.test(String(o.top)))ch.top='polo:0x2c3e66';if(pk.includes(o.helmet))ch.helmet=0x1b1b22;if(pk.includes(o.protector))ch.protector=0x23407f;if(pk.includes(o.gloves))ch.gloves=0x1a1a1a;
    if(Object.keys(ch).length){P.setOutfit(ch);persist();}}document.querySelectorAll('.gbtn').forEach(b=>b.classList.toggle('sel',b.dataset.g===g));$('gTog').textContent=g==='m'?'👦':'👧';}
document.querySelectorAll('.gbtn').forEach(b=>b.addEventListener('click',()=>{EQ.audio();setGender(b.dataset.g);}));
$('gTog').addEventListener('click',()=>{EQ.audio();setGender(EQ.gender()==='m'?'f':'m');renderMenu();});
setGender(EQ.gender());
function toMenu(){
  if(G.fall){G.fall=null;P.root.rotation.set(0,0,0);}
  G.sit=null;G.ia=null;G.mission=null;G.swim=false;
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
document.querySelectorAll('[data-trip]').forEach(b=>b.addEventListener('click',()=>{EQ.audio();quickRide(()=>goTrip(b.dataset.trip,true),PLACE[b.dataset.trip][2]);}));
function lvlClick(e){const b=e.target.closest('.lvl');if(!b)return;EQ.audio();const l=+b.dataset.l;$('course').classList.remove('on');
  if(G.state==='menu')quickRide(()=>startCourse(l,true),'Gara · Livello '+(l+1));else startCourse(l);}
$('lvls').addEventListener('click',lvlClick);$('lvls2').addEventListener('click',lvlClick);
$('courseNo').onclick=()=>{$('course').classList.remove('on');G.state='ride';};
document.querySelectorAll('.sndB').forEach(b=>b.onclick=()=>{EQ.setSound(!EQ.soundOn);renderMenu();});
document.querySelectorAll('.qB').forEach(b=>b.onclick=()=>{EQ.hiQ=!EQ.hiQ;EQ.LS.set('hq',EQ.hiQ);EQ.resize();EQ.shadowSize();renderMenu();msg(EQ.hiQ?'Grafica alta':'Grafica veloce',1.2);});

function startYard(){
  $('menu').classList.remove('on');
  fade('Si va al maneggio!',()=>{
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
function footUpdate(dt){
  if(G.sit||G.ia){socialFoot(dt);return;}
  const inp=G.busy?{x:0,y:0}:EQ.readInput();const m=Math.min(1,Math.hypot(inp.x,inp.y));
  let tsp=0;
  if(m>.15){const want=F.camYaw-Math.atan2(inp.x,-inp.y);F.h+=U.wrapA(want-F.h)*Math.min(1,dt*9);tsp=m>.8?3.8:1.6;}
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
  if(F.sp>.3)F.camYaw+=U.wrapA(F.h-F.camYaw)*Math.min(1,dt*1.3);
  const por=EQ.portrait;
  if(G.leading){const H=G.cur;const mx=(F.x+H.x)/2,mz=(F.z+H.z)/2;followCam(mx,W().height(mx,mz),mz,F.camYaw,por?7.4:6,por?3.2:2.6,1.2,1.2,dt,5);}
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
  const v=U.clamp((d-1.6)*2.6,0,4.2);
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
    if(f.course!=null){endCourse(true);G.lastL=f.course;showResults('❌','Caduta!','Sei cadut'+EQ.A()+': percorso eliminato. Rimonta e riprova!',[['💥','Caduta'],['E','Eliminat'+EQ.A()],['💪','Coraggio!']],[['org','again','↻ Riprova'],['alt','stay','Resta al maneggio'],['alt','menu','Menu principale']]);}
    else msg('Tutto ok! 💪<small>tocca "Monta" per risalire su '+H.def.name+'</small>',3);}
}
/* ---- bisogni del cavallo e cure ovunque ---- */
const NEED_MSG={energy:['😴','è stanco: fallo riposare'],hunger:['🌾','ha fame: dagli da mangiare'],thirst:['💧','ha sete: dagli da bere'],clean:['🫧','è sporco: spazzolalo']};
G.needCd={};
function needsCheck(dt){const H=G.cur;if(!H||!H.stats)return;for(const k in NEED_MSG){G.needCd[k]=(G.needCd[k]||0)-dt;const v=H.stats[k]==null?80:H.stats[k];
  if(v<25&&G.needCd[k]<=0){G.needCd[k]=40;msg(NEED_MSG[k][0]+' '+H.def.name+' '+NEED_MSG[k][1].split(':')[0]+'!<small>'+(NEED_MSG[k][1].split(':')[1]||'')+(G.state==='ride'?' · scendi da cavallo':'')+'</small>',3.2);EQ.sfx.snort();}}}
function waitHere(){const H=G.cur;if(!H)return;G.leading=false;H.where='wait';H.sp=0;H.rope.visible=false;H.st={};}
function takeRope(){const H=G.cur;H.where='lead';G.leading=true;if(!H.tack.bridle)H.setTack({halter:true});msg('Andiamo!',1);}
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
  if(H.where==='wait'){A.push({id:'rope',icon:'🪢',label:'Prendi '+H.def.name,fn:takeRope});A.push({id:'mountw',icon:'🏇',label:'Monta',fn:startMount,dis:mountBlock()});}
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
function socialTargets(){const pp=G.state==='ride'?{x:R.x,z:R.z}:{x:F.x,z:F.z};let per=null,pd=G.state==='ride'?4.5:2.8,pet=null,ptd=2.2;
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
  const pp=G.state==='ride'?{x:R.x,z:R.z}:{x:F.x,z:F.z};
  if(G.state==='foot')G.ia={kind,t:a.talkT,tx:a.x,tz:a.z};
  if(kind==='wave'){a.talkPose='wave';msg('👋 '+nm+': <small>Ciao '+EQ.pname()+'!</small>',2.4);EQ.sfx.ok();}
  else if(kind==='talk'){a.talkPose='talk';const L=n.o.kid?TALK_KID:TALK;msg('💬 '+nm+'<small>“'+EQ.pick(L)+'”</small>',3.4);EQ.sfx.click();}
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
    followCam(st.x,st.y,st.z,F.camYaw,EQ.portrait?4.6:3.8,EQ.portrait?2.3:1.9,.8,.9,dt,4);
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
  for(const h of horses){if(h===G.cur||!['wait','posta','wash'].includes(h.where))continue;const p=h.root.position;if(Math.hypot(p.x-F.x,p.z-F.z)>3.6)continue;any=true;
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
  if(fh.col)fh.col.off=false;
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
  const st0=H.stats;const maxSp=MAXSP*(.38+.62*U.clamp(st0.energy/35,0,1))*(st0.hunger<15?.8:1)*((st0.thirst==null?80:st0.thirst)<15?.8:1);
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
    P.root.position.copy(G.mount.from).lerp(tv.set(0,-.9,0),e);P.root.position.y+=Math.sin(e*Math.PI)*.45;
    if(t>=1){G.mount=null;P.root.position.set(0,-.9,0);msg('In sella!<small>trascina in su per partire</small>',2);}}
  const gi=R.sp<2.6?0:R.sp<7.4?1:2;
  P.pose(dt,'ride',{lean:[.08,.2,.4][gi]+(R.grounded?0:.35),jump:R.grounded?0:1,bob:gi===1&&R.grounded?Math.max(0,Math.sin(H.anim.phase*2+.5))*.06:0,speed:R.sp,snap:false});
  // statistiche
  stat(H,'energy',R.sp<2.6?dt*.2:-dt*R.sp*.016);stat(H,'hunger',-dt*.05);if(H.stats.thirst!=null)stat(H,'thirst',-dt*(.06+R.sp*.008));stat(H,'happy',dt*.04);
  needsCheck(dt);
  if(G.world!==yard||surfType(R.x,R.z)==='sand')G.rideDirt=(G.rideDirt||0)+dt*R.sp*.004;
  // logica
  if(G.course&&G.course.state==='run'){G.course.time+=dt;courseLogic(G.course.obs,true);}
  else if(G.world===yard&&!G.course)courseLogic(obstacles,false);
  if(G.trip)tripLogic(dt);
  // HUD
  const gname=R.sp<.3?'Fermo':R.sp<2.6?'Passo':R.sp<7.4?'Trotto':R.sp<11.5?'Galoppo':'Galoppo veloce!';
  $('gaitTx').textContent=R.grounded?gname:'Salto! 🐴';$('spd').style.width=(R.sp/MAXSP*100)+'%';
  const por=EQ.portrait;
  followCam(R.x,gy+R.y*.5,R.z,R.h,(por?8.4:7)+R.sp*.08,por?3.8:3.1,4.5,1.5,dt,7);
  if(!G.busy){const A=[];
    if(G.world===yard&&!G.course){
      if(R.sp<2)A.push({id:'down',icon:'⬇️',label:'Scendi',fn:dismount});
      if(Math.abs(R.x-AR.cx)<AR.hx&&Math.abs(R.z-AR.cz)<AR.hz)A.push({id:'race',icon:'🏆',label:'Gara',fn:()=>{G.state='modal';renderMenu();$('course').classList.add('on');}});
    }
    else if(G.world!==yard&&R.sp<2)A.push({id:'down',icon:'⬇️',label:'Scendi',fn:dismount});
    if(R.sp<1&&!G.course&&R.grounded&&grazeAt(R.x,R.z)&&H.stats.hunger<97&&!(G.grazeT>0))A.push({id:'rgraze',icon:'🌿',label:'Mangia erba',fn:()=>{G.grazeT=4.5;setTimeout(()=>{EQ.sfx.munch();stat(H,'hunger',30);stat(H,'happy',3);persist();},1200);msg('🌿 '+H.def.name+' bruca l\'erba',2);}});
    socialActions(A,true);
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
          if(o.faulted)msg('Barriera giù! +4',1.4);else{msg(['Bravissim'+EQ.A()+'!','Perfetto!','Che salto!','Brav'+EQ.A()+' '+EQ.pname()+'!','Netto!'][Math.random()*5|0],1.1);EQ.sfx.clear();}
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
function startCourse(l,noFade){
  const L=LEVELS[l];
  (noFade?(t,cb)=>cb():fade)('Gara · Livello '+(l+1)+' · '+L.name,()=>{
    if(G.world!==yard)cleanupTrip();
    buildObstacles(L,false);
    yard.arenaGate.visible=true;yard.gateColl.off=false;
    const [sx,sz]=tx(L.start[0],L.start[1]);R.x=sx;R.z=sz;R.h=L.start[2]*EQ.D2R;R.sp=0;R.y=0;R.vy=0;R.grounded=true;
    G.cur.x=R.x;G.cur.z=R.z;G.cur.h=R.h;
    if(G.cur.where!=='ride'){G.cur.x=R.x;G.cur.z=R.z;G.cur.h=R.h;mountNow();}
    G.course={l,obs:obstacles,next:0,faults:0,time:0,state:'count'};
    G.state='ride';snapCam();setTouchMode('ride');hud(true);setActions([]);
    $('timer').classList.add('on');
    let c=3;const el=$('count');el.textContent=c;el.classList.add('on');EQ.sfx.beep(false);
    clearInterval(G.cdI);G.cdI=setInterval(()=>{c--;if(c>0){el.textContent=c;EQ.sfx.beep(false);}else if(c===0){el.textContent='VIA!';EQ.sfx.beep(true);if(G.course)G.course.state='run';}else{el.classList.remove('on');clearInterval(G.cdI);}},800);
  });
}
function endCourse(silent){
  if(!G.course&&!silent)return;
  clearInterval(G.cdI);$('count').classList.remove('on');
  G.course=null;yard.arenaGate.visible=false;yard.gateColl.off=true;$('timer').classList.remove('on');
  buildObstacles(LEVELS[0],true);marker.visible=chev.visible=false;
}
function finishCourse(){
  const C=G.course;C.state='done';EQ.sfx.applause();setTimeout(()=>EQ.sfx.neigh(),900);
  const L=LEVELS[C.l],t=C.time;let medal,title;
  if(C.faults===0&&t<=L.par){medal='🥇';title='Percorso netto!';}
  else if(C.faults<=4&&t<=L.par*1.35){medal='🥈';title=C.faults?'Ottimo giro!':'Netto, ma lent'+EQ.A()+'!';}
  else{medal='🥉';title='Arrivat'+EQ.A()+'!';}
  const k='c'+C.l,b=save.best[k];let rec=false;
  if(!b||C.faults<b.f||(C.faults===b.f&&t<b.t)){rec=true;save.best[k]={t,f:C.faults,m:medal};}
  stat(G.cur,'happy',10);persist();
  setTimeout(()=>showResults(medal,title,`Livello ${C.l+1} · ${L.name} · tempo ideale ${L.par} s`+(rec?'<br><b style="color:#d9730b">⭐ Nuovo record!</b>':''),
    [[fmt(t)+' s','Tempo'],[C.faults,'Penalità'],[medal,'Medaglia']],
    [C.l<LEVELS.length-1?['org','next','Livello successivo ➜']:null,['','again','↻ Riprova'],['alt','stay','Resta al maneggio'],['alt','menu','Menu principale']].filter(Boolean)),1500);
}

/* ======================= PASSEGGIATE ======================= */
const ITEM_INFO={shell:['🐚','Conchiglie'],apple:['🍎','Mele'],rosette:['🎀','Coccarde']};
const PLACE={yard:['🏠','Maneggio','Si torna al maneggio…'],beach:['🏖️','Spiaggia','In viaggio verso il mare…'],forest:['🌲','Bosco','Si parte per il bosco…'],city:['🏙️','Città','Si va in città…']};
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
function travel(to,from,noFade){
  $('trip').classList.remove('on');['pause','results'].forEach(k=>$(k).classList.remove('on'));
  const txt=to==='yard'?'Si torna al maneggio…':PLACE[to][2];
  (noFade?(t,cb)=>cb():fade)(txt,()=>{
    endCourse(true);
    const H=G.cur;
    horses.forEach(h=>{if(h!==H&&h.where==='wait')placeInBox(h);});
    if(G.world!==yard){G.standers=[];G.world.dispose();G.trip=null;EQ.stopLoops();}
    let w;
    if(to==='yard'){w=yard;yard.group.visible=true;horses.forEach(h=>h.root.visible=true);$('timer').classList.remove('on');}
    else{yard.group.visible=false;horses.forEach(h=>{if(h!==H)h.root.visible=false;});
      w=EQ['build'+{beach:'Beach',forest:'Forest',city:'City'}[to]]();try{EQ.populate[to](w);}catch(e){console.error(e);}}
    G.world=w;G.loc=to;EQ.setSky(w.sky);
    const pt=from&&w.portals?w.portals.find(p=>p.to===from):null;
    let s=pt?{x:pt.x+Math.sin(pt.inH)*16,z:pt.z+Math.cos(pt.inH)*16,h:pt.inH}:(to==='yard'?w.spawnRide:w.spawn);
    R.x=s.x;R.z=s.z;R.h=s.h;R.sp=pt?6:0;R.y=0;R.vy=0;R.grounded=true;H.x=R.x;H.z=R.z;H.h=R.h;
    G.portalCd=3;
    if(to!=='yard'){const ig=new THREE.Group();w.group.add(ig);
      G.trip={kind:to,items:w.items.map(it=>{const m=itemMesh(w.itemKind);m.position.set(it.x,it.y,it.z);ig.add(m);return{m,got:false,x:it.x,z:it.z};}),count:0,time:0,done:false};
      $('timer').classList.add('on');
      setTimeout(()=>msg(PLACE[to][0]+' '+PLACE[to][1]+'!<small>trova '+w.items.length+' '+ITEM_INFO[w.itemKind][1].toLowerCase()+'</small>',3),400);}
    else{applyRideDirt(H);persist();setTimeout(()=>msg('Bentornat'+EQ.A()+' al maneggio!<small>scendi e dai da mangiare a '+H.def.name+'</small>',3),400);}
    if(G.mission&&from==='city'&&G.mission.k===to){G.stars++;LS.set('stars',G.stars);setTimeout(()=>msg('⭐ Obiettivo completato!<small>'+G.mission.t+' · stelle: '+G.stars+'</small>',2.6),3600);}
    G.mission=null;if(to==='city')newMission();
    G.state='ride';setTouchMode('ride');hud(true);snapCam();
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
  if(r==='again'){startCourse(l);return;}
  if(r==='next'){startCourse(Math.min(LEVELS.length-1,l+1));return;}
  if(r==='stay'){fade('',()=>{endCourse(true);G.state=G.cur&&G.cur.where==='ride'?'ride':'foot';R.sp=0;});}
});
let prevState=null;
function pause(){if(G.busy||!['foot','ride','act'].includes(G.state))return;prevState=G.state;G.state='paused';
  $('homeBtn').style.display=G.world!==yard?'':'none';$('restartBtn').style.display=G.course?'':'none';renderMenu();$('pause').classList.add('on');
  if(G.course&&G.course.state==='count'){clearInterval(G.cdI);$('count').classList.remove('on');G.course.state='run';}}
function resume(){$('pause').classList.remove('on');G.state=prevState||'foot';last=performance.now();}
$('pauseBtn').addEventListener('pointerdown',e=>{e.stopPropagation();pause();});
$('resumeBtn').onclick=resume;
$('homeBtn').onclick=()=>{$('pause').classList.remove('on');G.state=prevState;goHome();};
$('restartBtn').onclick=()=>{$('pause').classList.remove('on');G.state=prevState;startCourse(G.course.l);};
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
  if(G.course){const C=G.course;$('infoT').textContent='🏆 Livello '+(C.l+1)+' · '+LEVELS[C.l].name;$('infoS').textContent=C.next<C.obs.length?`Ostacolo ${C.next+1} di ${C.obs.length}`:'Arrivo!';$('tasks').innerHTML='';
    $('timer').textContent='⏱ '+fmt(C.time)+(C.faults?'  ❌ '+C.faults:'');}
  else if(G.trip){const t=G.trip,inf=ITEM_INFO[W().itemKind];$('infoT').textContent=PLACE[t.kind][0]+' '+PLACE[t.kind][1]+' · '+G.cur.def.name;$('infoS').innerHTML=`${inf[0]} ${inf[1]}: ${t.count} di ${t.items.length}`+(G.mission?`<br>🎯 ${G.mission.t} · ⭐${G.stars}`:'')+needsLine();$('tasks').innerHTML='';$('timer').textContent='⏱ '+fmt(t.time);}
  else{const L=tasksList();const nx=L.find(t=>!t[2]);$('infoT').textContent='🏇 '+EQ.pname()+' · Maneggio';
    $('infoS').innerHTML=(nx?('Prossimo: '+nx[0]+' '+nx[1]):'Tutto fatto! Divertiti 🎉')+needsLine();
    $('tasks').innerHTML=L.map(t=>`<div class="${t[2]?'ok':''}">${t[2]?'✅':'⬜'} ${t[0]} ${t[1]}</div>`).join('')+(G.cur?`<div style="margin-top:4px;color:#ffe08a">${G.cur.def.name}: 🌾${G.cur.stats.hunger|0} 🫧${G.cur.stats.clean|0} ⚡${G.cur.stats.energy|0}</div>`:'');}
}
function needsLine(){const H=G.cur;if(!H||!H.stats||H.where==='box')return'';const s=H.stats,c=v=>v<25?'#ff8a8a':'#e8f5d0';const th=s.thirst==null?80:s.thirst;
  return `<br><span style="font-size:12.5px">${H.def.name}: <b style="color:${c(s.energy)}">⚡${s.energy|0}</b> <b style="color:${c(s.hunger)}">🌾${s.hunger|0}</b> <b style="color:${c(th)}">💧${th|0}</b> <b style="color:${c(s.clean)}">🫧${s.clean|0}</b></span>`;}
function dirTarget(){
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
  const el=$('dir');const t=(G.state==='foot'||G.state==='ride')?dirTarget():null;
  if(!t){el.classList.remove('on');return;}
  const px=G.state==='ride'?R.x:F.x,pz=G.state==='ride'?R.z:F.z;
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
  const tied=H&&H.where==='posta';
  tieLines.forEach((l,i)=>{l.visible=!!tied;if(tied){const pa=l.geometry.attributes.position;const p=Y.posta.posts[i];(H.tack.halter?H.chin:H.bitL).getWorldPosition(tv);pa.setXYZ(0,p.x,p.y,p.z);pa.setXYZ(1,tv.x,tv.y,tv.z);pa.needsUpdate=true;}});
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
    } else if(G.state==='foot'){footUpdate(dt);ppos=P.root.position;missionCheck(F.x,F.z);}
    else if(G.state==='ride'){rideUpdate(dt);ppos=G.cur.root.position;missionCheck(R.x,R.z);}
    else if(G.state==='act'){actUpdate(dt);ppos=P.root.position;}
    else if(G.state==='fall'){fallUpdate(dt);ppos=P.root.position;}
    else if(G.state==='results'||G.state==='modal'){if(G.cur&&G.cur.where==='ride'){const inpSave=G.lock;G.lock=1;rideUpdate(dt);G.lock=inpSave;}ppos=G.cur?G.cur.root.position:P.root.position;}
    else ppos=G.cur&&G.cur.where==='ride'?G.cur.root.position:P.root.position;
    if(G.state!=='paused'){
      idleHorses(dt);updateFallen(dt);
      G.standers.forEach(n=>{if(n.root.parent){const p=G.state==='ride'?{x:R.x,z:R.z}:{x:F.x,z:F.z};const q=n.root.position;n.root.rotation.y+=U.wrapA(Math.atan2(p.x-q.x,p.z-q.z)-n.root.rotation.y)*Math.min(1,dt*2);n.pose(dt,Math.sin(T*.6)>.8?'wave':'stand',{});}});
      W().update(dt,T,ppos?{x:ppos.x,z:ppos.z}:null);
      for(const k in FX)FX[k].update(dt,k==='dust'?.4:k==='heart'?1:-9);
      if(G.course&&G.course.next<G.course.obs.length){const o=G.course.obs[G.course.next];marker.visible=chev.visible=true;
        marker.position.set(o.pos.x,o.planes[o.planes.length-1].h+2.2+Math.sin(T*3)*.25,o.pos.z);marker.rotation.y=T*2;chev.position.copy(o.pos);chev.rotation.y=o.th;chev.userData.m.opacity=.45+Math.sin(T*5)*.25;}
      else marker.visible=chev.visible=false;
      updateHud(dt);updateDir();
    }
    if(ppos&&G.state!=='act')EQ.followSun(ppos);else if(G.act&&G.act.kind!=='dress'&&G.cur)EQ.followSun(G.cur.root.position);
    postUpdate();
    EQ.renderer.render(scene,camera);
  }catch(e){console.error(e);}
  requestAnimationFrame(frame);
}
/* avvio */
toMenu();
requestAnimationFrame(t=>{last=t;$('loading').style.display='none';frame(t);});
window.__EQG={G,R,F,horses,P,travel,startYard,goTrip,startCourse,quickRide,yardActions,openPosta,startDress,startFeed,goHome,toMenu,actList:()=>actList};
})();
