/* Giorgia a Cavallo – popolazione: persone, cavalieri, animali, traffico */
'use strict';
(function(){
const {U,G,mat,mesh,C,V3,TAU}=EQ;
const rnd=U.rnd,pick=EQ.pick;

/* ---------- percorsi ---------- */
function Path(pts,loop){
  pts=pts.map(p=>Array.isArray(p)?{x:p[0],z:p[1]}:{x:p.x,z:p.z});
  if(loop)pts.push({x:pts[0].x,z:pts[0].z});
  const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z));
  const L=cum[cum.length-1]||1;
  return {pts,cum,L,loop,at(s,o){if(loop)s=((s%L)+L)%L;else s=U.clamp(s,0,L);
    let i=o.i||1;if(i>=cum.length)i=cum.length-1;
    while(i<cum.length-1&&cum[i]<s)i++;while(i>1&&cum[i-1]>s)i--;o.i=i;
    const a=pts[i-1],b=pts[i],t=(s-cum[i-1])/((cum[i]-cum[i-1])||1);o.x=a.x+(b.x-a.x)*t;o.z=a.z+(b.z-a.z)*t;o.dx=b.x-a.x;o.dz=b.z-a.z;return o;}};
}
EQ.Path=Path;
const rect=(x,z,hx,hz)=>[[x-hx,z-hz],[x+hx,z-hz],[x+hx,z+hz],[x-hx,z+hz]];
const ellipse=(x,z,rx,rz,n)=>{const p=[];for(let i=0;i<(n||48);i++){const a=i/(n||48)*TAU;p.push([x+Math.cos(a)*rx,z+Math.sin(a)*rz]);}return p;};

/* ---------- gestione agenti ---------- */
/* ---------- urti: persone, bici, quad e cavalieri cadono ---------- */
EQ.knockAgent=function(W,a,dx,dz,sp){
  if(a.kn||a.disabled)return null;const e=a.ent;let mode=null,obj=e.root;
  if(e.horse&&e.npc){mode='rider';obj=e.npc.root;W.group.attach(obj);}
  else if(e.vehicle)mode='vehicle';else if(e.npc)mode='person';else return null;
  const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
  const k=a.kn={t:0,mode,obj,vx:dx*Math.min(sp,12)*.35,vz:dz*Math.min(sp,12)*.35,lie:2.6+Math.random(),side:Math.random()<.5?1:-1,
    h:mode==='vehicle'?a.h:Math.atan2(-dx,-dz),x:obj.position.x,z:obj.position.z,y0:obj.position.y};
  if(mode==='rider'){obj.getWorldPosition(tv);k.x=tv.x+dx*.8;k.z=tv.z+dz*.8;}
  else{k.x=a.x;k.z=a.z;}
  obj.rotation.order='YXZ';a.v=0;
  return mode;
};
function knockUpdate(W,a,dt,t){
  const k=a.kn,e=a.ent,o=k.obj;k.t+=dt;
  if(k.t<.45){k.x+=k.vx*dt;k.z+=k.vz*dt;}
  const up=k.lie+(k.hold?99:0);let f=k.t<.35?k.t/.35:k.t<up?1:Math.max(0,1-(k.t-up)/.6);
  f=f*f*(3-2*f);
  const gy=W.height?W.height(k.x,k.z):0;
  if(k.mode==='vehicle'){o.position.set(k.x,gy+(k.t<.35?Math.sin(f*Math.PI)*.3:0),k.z);o.rotation.set(0,k.h,k.side*1.35*f);if(e.vnpc)e.vnpc.pose(dt,f>.5?'stand':'pedal',{speed:0});}
  else{o.position.set(k.x,gy+.1*f+(k.t<.35?Math.sin(f*Math.PI)*.35:0),k.z);o.rotation.set(-1.45*f,k.h,0);const n=e.npc;if(n)n.pose(dt,f>.9?'stand':'wave',{});}
  if(k.mode==='rider'){e.horse.animate(dt,{speed:0,headX:-.2});}
  if(k.t>=up+.6){
    o.rotation.set(0,k.mode==='vehicle'?k.h:k.h,0);
    if(k.mode==='rider'){const n=e.npc;e.horse.seat.add(n.root);n.root.position.set(0,-.92*n.s,0);n.root.rotation.set(0,0,0);}
    else{a.x=k.x;a.z=k.z;a.h=k.h;if(a.tx!=null){a.tx=a.x;a.tz=a.z;}}
    a.kn=null;
  }
}
const tv=new V3(),tv2=new V3();
function agents(W){
  if(W.agents)return W.agents;
  const list=W.agents=[];
  W.updaters.push((dt,t,p)=>{
    for(const a of list){
      const d=p?Math.hypot(a.x-p.x,a.z-p.z):0;
      if(a.disabled)continue;
      if(a.kn){knockUpdate(W,a,dt,t);continue;}
      if(a.talkT>0){a.talkT-=dt;a.near=p?Math.hypot(a.x-p.x,a.z-p.z):0;const e=a.ent;
        if(p&&!e.horse){const ang=Math.atan2(p.x-a.x,p.z-a.z);a.h+=U.wrapA(ang-a.h)*Math.min(1,dt*6);if(e.place)e.place(a.x,e.root.position.y,a.z,a.h);else e.root.rotation.y=a.h;}
        if(e.npc&&!e.horse)e.npc.pose(dt,a.talkPose||'stand',{speed:0});else if(e.anim&&!e.npc)e.anim(dt,0,a,t);
        if(e.wag)e.wag(dt,t);if(a.label)a.label.visible=true;continue;}
      a.near=d;const vis=d<a.far;
      if(a.ent.root.visible!==vis)a.ent.root.visible=vis;
      if(a.extra)a.extra.forEach(o=>o.visible=vis);
      if(!vis&&!a.always){if(a.col)a.col.off=true;if(a.col2)a.col2.off=true;continue;}
      a.update(dt,t,p,d);
      if(a.label)a.label.visible=d<24;
      if(a.col){a.col.off=false;a.col.x=a.x+Math.sin(a.h)*(a.colOff||0);a.col.z=a.z+Math.cos(a.h)*(a.colOff||0);}
      if(a.col2){a.col2.off=false;a.col2.x=a.x-Math.sin(a.h)*(a.colOff||0);a.col2.z=a.z-Math.cos(a.h)*(a.colOff||0);}
    }
  });
  return list;
}
function place(W,a,yOff){const y=(W.height?W.height(a.x,a.z):0)+(yOff||0);if(a.ent.place)a.ent.place(a.x,y,a.z,a.h);else{a.ent.root.position.set(a.x,y,a.z);a.ent.root.rotation.y=a.h;}}
function addCol(W,a,r,off,two){a.col={x:a.x,z:a.z,r};W.colliders.push(a.col);if(two){a.col2={x:a.x,z:a.z,r};W.colliders.push(a.col2);}a.colOff=off||0;}

function pathAgent(W,ent,path,o){
  o=Object.assign({speed:1.3,stopR:0,stopW:2.2,yOff:0,pause:0,dir:1,lat:0,far:170,colR:0,colOff:0,two:false},o||{});
  const q={i:1};const a={ent,x:0,z:0,h:0,v:o.speed,s:o.s!=null?o.s:Math.random()*path.L,dir:o.dir,wait:0,far:o.far,o};
  a.update=(dt,t,p)=>{
    let tgt=o.speed;
    if(a.wait>0){a.wait-=dt;tgt=0;}
    if(p&&o.stopR){const fx=Math.sin(a.h),fz=Math.cos(a.h),dx=p.x-a.x,dz=p.z-a.z,ah=dx*fx+dz*fz,sd=Math.abs(dx*fz-dz*fx);if(ah>-1.5&&ah<o.stopR&&sd<o.stopW)tgt=0;}
    if(o.check)tgt=o.check(a,tgt,p,t);
    a.v=U.lerp(a.v,tgt,Math.min(1,dt*(tgt<a.v?4:1.2)));
    a.s+=a.dir*a.v*dt;
    if(!path.loop){if(a.s>path.L){a.s=path.L;a.dir=-1;a.wait=o.pause;}else if(a.s<0){a.s=0;a.dir=1;a.wait=o.pause;}}
    path.at(a.s,q);const l=Math.hypot(q.dx,q.dz)||1;
    a.x=q.x-q.dz/l*o.lat*a.dir;a.z=q.z+q.dx/l*o.lat*a.dir;
    const th=Math.atan2(q.dx*a.dir,q.dz*a.dir);a.h+=U.wrapA(th-a.h)*Math.min(1,dt*(a.v>.05?4:1.5));
    place(W,a,o.yOff);ent.anim(dt,a.v,a,t);
  };
  path.at(a.s,q);a.x=q.x;a.z=q.z;a.h=Math.atan2(q.dx*a.dir,q.dz*a.dir);place(W,a,o.yOff);
  if(o.colR)addCol(W,a,o.colR,o.colOff,o.two);
  agents(W).push(a);return a;
}
function wanderAgent(W,ent,area,o){
  o=Object.assign({speed:1,run:5,fleeR:0,idle:[2,7],far:160,yOff:0,step:18},o||{});
  const inArea=(x,z)=>area.r!=null?Math.hypot(x-area.x,z-area.z)<area.r:(Math.abs(x-area.x)<area.hx&&Math.abs(z-area.z)<area.hz);
  const rp=()=>{for(let i=0;i<20;i++){const x=area.r!=null?area.x+rnd(-area.r,area.r):area.x+rnd(-area.hx,area.hx),z=area.r!=null?area.z+rnd(-area.r,area.r):area.z+rnd(-area.hz,area.hz);if(inArea(x,z)&&(!o.ok||o.ok(x,z)))return[x,z];}return[area.x,area.z];};
  const st=o.start||rp();
  const a={ent,x:st[0],z:st[1],h:rnd(0,TAU),v:0,tx:st[0],tz:st[1],wait:rnd(0,4),flee:0,far:o.far,o};
  const newT=()=>{for(let i=0;i<10;i++){const x=a.x+rnd(-o.step,o.step),z=a.z+rnd(-o.step,o.step);if(inArea(x,z)&&(!o.ok||o.ok(x,z))){a.tx=x;a.tz=z;return;}}const r=rp();a.tx=r[0];a.tz=r[1];};
  a.update=(dt,t,p)=>{
    let tgt=0;
    if(p&&o.fleeR&&a.flee<=0&&Math.hypot(p.x-a.x,p.z-a.z)<o.fleeR){a.flee=rnd(3,5);const ang=Math.atan2(a.x-p.x,a.z-p.z)+rnd(-.4,.4);
      a.tx=a.x+Math.sin(ang)*40;a.tz=a.z+Math.cos(ang)*40;if(!inArea(a.tx,a.tz)){const r=rp();a.tx=r[0];a.tz=r[1];}a.wait=0;if(o.onFlee)o.onFlee(a);}
    const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz);
    if(a.flee>0){a.flee-=dt;tgt=o.run;if(d<1)a.flee=0;}
    else if(a.wait>0){a.wait-=dt;if(a.wait<=0)newT();}
    else if(d<.7){a.wait=rnd(o.idle[0],o.idle[1]);}
    else tgt=o.speed;
    if(tgt>0)a.h+=U.wrapA(Math.atan2(dx,dz)-a.h)*Math.min(1,dt*3);
    a.v=U.lerp(a.v,tgt,Math.min(1,dt*3));
    a.x+=Math.sin(a.h)*a.v*dt;a.z+=Math.cos(a.h)*a.v*dt;
    if(o.cols){const pp={x:a.x,z:a.z};if(EQ.collide(pp,o.cols,W.colliders.filter(c=>c!==a.col)))newT();a.x=pp.x;a.z=pp.z;}
    place(W,a,o.yOff);ent.anim(dt,a.v,a,t);
  };
  place(W,a,o.yOff);
  agents(W).push(a);return a;
}
function staticAgent(W,ent,x,z,h,anim,o){
  o=o||{};const a={ent,x,z,h,far:o.far||120,update:(dt,t,p,d)=>{anim(dt,t,a,p,d);}};
  place(W,a,o.yOff);if(o.y!=null)ent.root.position.y=o.y;
  agents(W).push(a);return a;
}

/* ---------- entità ---------- */
function person(o){const n=EQ.buildNPC(o);return {root:n.root,npc:n,anim(dt,sp,a,t,mode){n.pose(dt,mode||(sp>.12?(sp>2.6?'run':'walk'):'stand'),{speed:sp});}};}
function label(ent,name,y){ent.name=name;const s=EQ.nameSprite(name);s.position.y=y;ent.root.add(s);return s;}
const RIDE_TOPS=[0x1c2a55,0x5b2a86,0xffffff,0xf08cb8,0x3fae7a,0x111111,0xc0392b,0x2a58c8];
const HELMETS=[0x1b1b22,0x1f3b7a,0xe86aa6,0xf5f5f5,0x2f6b33,0x5b2a86];
function riderOpts(fem){return {fem,helmet:pick(HELMETS),top:pick(RIDE_TOPS),pants:pick([0xf4f4f2,0xd9c7a5,0x2a2a30,0x2c3e66]),boots:pick([0x141414,0x5a3418]),sleeves:pick(['short','long']),gloves:0x1a1a1a,glasses:false};}
function rider(W,fem,horseDef){
  const def=Object.assign({},horseDef||pick(EQ.OTHER_COATS),{socks:[0,0,0,0]});
  const h=EQ.buildHorse(def,{lite:true});
  h.setTack({pad:true,saddle:true,girth:true,bridle:true,padColor:pick([0x1d3f8a,0xc0392b,0xe86aa6,0x2f6b33,0xffffff,0x7b3fb0,0x111111]),wraps:Math.random()<.4,wrapColor:pick([0xffffff,0x1d3f8a,0xc0392b])});
  const n=EQ.buildNPC(riderOpts(fem));h.seat.add(n.root);n.root.position.y=-.92*n.s;
  W.group.add(h.root);
  const e={root:h.root,horse:h,npc:n,anim(dt,sp){h.animate(dt,{speed:sp});const gi=sp<2.6?0:sp<7.4?1:2;n.pose(dt,'ride',{lean:[.08,.2,.4][gi],bob:gi===1?Math.max(0,Math.sin(h.anim.phase*2+.5))*.06:0});}};
  return e;
}
function horseOnly(W,tack){const def=Object.assign({},pick(EQ.OTHER_COATS),{socks:[0,0,0,0]});const h=EQ.buildHorse(def,{lite:true});h.setTack(tack||{halter:true,halterColor:pick([0xe0487f,0x2a58c8,0x2f6b33,0xf1c40f])});W.group.add(h.root);return h;}
function addTo(W,ent){W.group.add(ent.root);return ent;}

/* ---------- folle "cotte" (istanze) ---------- */
function bakedVariants(k,pose,optsFn,post){const out=[];for(let i=0;i<k;i++){const n=EQ.buildNPC(optsFn(i));let g=EQ.bakeNPC(n,pose);if(post)g=post(g,n);out.push(g);}return out;}
function placeBaked(W,variants,list){const by=variants.map(()=>[]);list.forEach((p,i)=>by[i%variants.length].push(p));by.forEach((L,i)=>{if(L.length)W.group.add(EQ.inst(variants[i],EQ.NPCMAT,L));});}
const lying=(g)=>{g.rotateX(-Math.PI/2);g.translate(0,.14,.8);return g;};
const QN=()=>EQ.hiQ?1:.6;
const SWIM_COLS=[0xe74c3c,0x2a58c8,0xf1c40f,0x2ecc71,0xff6fa8,0x111111,0xffffff,0x8e44ad,0xe67e22];
const swimOpts=(i)=>({swim:true,fem:i%2===0,top:pick(SWIM_COLS),pants:pick(SWIM_COLS),hairStyle:i%2?pick(['short','curly','bald']):pick(['long','pony','bun']),sleeves:'none'});

/* ---------- utilità di scena ---------- */
function rope(W){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:C(0x3355cc)}));l.frustumCulled=false;W.group.add(l);
  return {l,set(a,b){const p=g.attributes.position;p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,b.x,b.y,b.z);p.needsUpdate=true;}};}

EQ.populate={};
/* ======================= MANEGGIO ======================= */
EQ.populate.yard=function(W){
  const S=W.spots,A=S.arena;
  // cavalieri nel campo
  const track=Path(ellipse(A.cx,A.cz,A.hx-3.2,A.hz-3.2,56),true);
  [[2,1],[3.5,1],[4.6,-1],[2.2,1],[3,1],[2,1],[4,-1],[2.6,1],[3.2,1],[2.4,1]].forEach(([sp,dir],i)=>{const fem=Math.random()<.65;const e=rider(W,fem);const a=pathAgent(W,e,track,{speed:sp,dir,s:i*track.L/10,lat:(i%3-1)*2.2,stopR:6,colR:.75,colOff:.7,two:true,far:200});
    a.lesson=true;a.label=label(e,'Allievo · '+EQ.randName(fem),3.15);e.name=e.name.replace('Allievo · ','');
    // durante la lezione del giocatore gli allievi si fermano in fila lungo la staccionata
    const u=a.update,sx=A.cx-A.hx+6+i*(A.hx*2-12)/9,sz=A.cz+A.hz-2.6;a.update=(dt,t,p,d)=>{if(W.busyArena===A){a.x+=(sx-a.x)*Math.min(1,dt*1.5);a.z+=(sz-a.z)*Math.min(1,dt*1.5);a.h+=U.wrapA(Math.PI-a.h)*Math.min(1,dt*2);
      e.root.position.set(a.x,0,a.z);e.root.rotation.y=a.h;e.anim(dt,Math.min(2,Math.hypot(sx-a.x,sz-a.z)),a,t);if(a.col)a.col.off=true;if(a.col2)a.col2.off=true;return;}u(dt,t,p,d);};});
  // Betta, istruttrice (45 anni, capelli lunghi raccolti in una coda) al centro del campo con gli allievi
  {const e=addTo(W,person({fem:true,s:1.0,skin:0xe8b896,hair:0x5a3418,hairStyle:'pony',top:0x2f6b33,pants:0xd9c7a5,boots:0x141414,sleeves:'long',glasses:false}));
   const a=staticAgent(W,e,A.cx+2,A.cz+1,0,(dt,t,a,p)=>{const r=W.agents.find(x=>x.ent.horse&&x.lesson);if(r){const h=Math.atan2(r.x-a.x,r.z-a.z);a.h+=U.wrapA(h-a.h)*Math.min(1,dt*2);e.root.rotation.y=a.h;}
     const m=Math.sin(t*.45);e.npc.pose(dt,m>.75?'wave':m>.2?'talk':'stand',{});});
   a.label=label(e,'Betta · istruttrice',2.15);e.name='Betta';
   e.lines=['Talloni giù e schiena dritta!','Brava, ora passate al trotto!','Guardate dove volete andare, non il cavallo.','Più gamba, accompagna con le mani!','Oggi lavoriamo sulle transizioni.','Ottimo! Il cavallo ti ascolta.','Vuoi fare lezione anche tu? Entra in campo!'];}
  // Carlo, addestratore (50 anni, brizzolato) che lavora un cavallo alla corda nel paddock
  {const A2=S.arena2,cx=A2.cx,cz=A2.cz,R0=6.5;const e=addTo(W,person({fem:false,s:1.04,skin:0xe0b090,hair:0x8a8580,hairStyle:'short',beard:true,top:0x6b5a45,pants:0x2c3e66,boots:0x5a3418,sleeves:'long'}));
   const h=horseOnly(W,{halter:true,halterColor:0x2a58c8});const rp=rope(W);let ang=0;
   const whip=new THREE.Group();e.npc.handL.add(whip);mesh(G.cyl(.012,.006,1.8,5),mat(0x222222,.5),0,0,.8,whip).rotation.x=Math.PI/2;whip.rotation.x=-.6;
   const a=staticAgent(W,e,cx,cz,0,(dt,t,a,p,d)=>{const sp=3.2+Math.sin(t*.12)*1.6;ang+=sp/R0*dt;
     const hx=cx+Math.cos(ang)*R0,hz=cz+Math.sin(ang)*R0;h.root.position.set(hx,0,hz);h.root.rotation.y=Math.atan2(-Math.sin(ang),Math.cos(ang));h.animate(dt,{speed:sp,turn:.25});
     e.root.rotation.y=Math.atan2(hx-cx,hz-cz);e.npc.pose(dt,'lead',{speed:0});
     if(d<70){h.root.updateMatrixWorld();e.root.updateMatrixWorld();e.npc.handR.getWorldPosition(tv);h.chin.getWorldPosition(tv2);rp.set(tv,tv2);}},{far:200});
   a.extra=[h.root,rp.l];a.label=label(e,'Carlo · addestratore',2.25);e.name='Carlo';
   (W.freeHorses=W.freeHorses||[]).push({h,agent:a,home:{x:cx,z:cz},name:'Puledro di Carlo',rope:rp.l,owner:'Carlo'});
   for(let i=0;i<2;i++){const hh=horseOnly(W,{halter:true});const ha=wanderAgent(W,{root:hh.root,anim:(dt,sp,a,t)=>hh.animate(dt,{speed:sp,eat:sp<.2?1:0,graze:1})},{x:A2.cx-A2.hx+4,z:A2.cz,hx:2.5,hz:A2.hz-4},{speed:1,idle:[4,12],step:6,far:170});W.freeHorses.push({h:hh,agent:ha,home:{x:A2.cx-A2.hx+4,z:A2.cz},name:EQ.pick(EQ.HORSE_NAMES)+' (di Carlo)',owner:'Carlo'});}
   e.lines=['Questo puledro sta imparando a girare alla corda.','Con i cavalli ci vuole pazienza e voce calma.','Guarda come allunga il trotto, bravo!','Prima la fiducia, poi la sella.','Se vuoi ti insegno a lavorare il cavallo da terra.','Ogni cavallo ha il suo carattere.'];
   W.colliders.push({x:cx,z:cz,r:.6});}
  // cavalieri sulle strade (vanno e tornano dalle altre località)
  if(W.paths){[[0,4],[1,5],[2,3.5]].forEach(([k,sp])=>{const P2=Path(W.paths[k].pts,false);const fem=Math.random()<.6;const e=rider(W,fem);
    const a=pathAgent(W,e,P2,{speed:sp,lat:1.4,pause:6,stopR:6,colR:.75,colOff:.7,two:true,far:220});a.label=label(e,EQ.randName(fem),3.15);});}
  // pulizia alla seconda posta
  {const sp=S.posta2.horse;const h=horseOnly(W);(W.petHorses=W.petHorses||[]).push({h,name:pick(EQ.HORSE_NAMES)});h.root.position.set(sp.x,0,sp.z);h.root.rotation.y=sp.h;h.addDirt(6);
   const e=addTo(W,person(Object.assign(riderOpts(true),{helmet:null,hairStyle:'pony'})));const lx=Math.cos(sp.h),lz=-Math.sin(sp.h);
   const brush=mesh(G.box(.07,.05,.14),mat(0x8a5a34,.7),0,0,.02,e.npc.handR);
   const a=staticAgent(W,e,sp.x+lx,sp.z+lz,sp.h-Math.PI/2,(dt,t,a)=>{const al=Math.sin(t*.25)*1.1;a.x=sp.x+lx*1.0+Math.sin(sp.h)*al;a.z=sp.z+lz*1.0+Math.cos(sp.h)*al;e.root.position.set(a.x,0,a.z);
     e.npc.pose(dt,'brush',{});h.animate(dt,{speed:0,lookY:Math.sin(t*.2)*.3});
     h.dirt.forEach(d=>{if(d.userData.v>0&&Math.random()<dt*.05){d.userData.v=0;d.visible=false;}});if(h.dirtLeft()<.1&&Math.random()<dt*.05)h.addDirt(6);});
   a.extra=[h.root];a.label=label(e,EQ.randName(true),2.1);
   const c={x:sp.x,z:sp.z,r:1.2};W.colliders.push(c);}
  // doccia alla seconda postazione
  {const sp=S.wash2.horse;const h=horseOnly(W);(W.petHorses=W.petHorses||[]).push({h,name:pick(EQ.HORSE_NAMES)});h.root.position.set(sp.x,0,sp.z);h.root.rotation.y=sp.h;
   const e=addTo(W,person({fem:false,top:0x2a58c8,pants:0x2c3e66,boots:0x2f6b33}));const lx=Math.cos(sp.h),lz=-Math.sin(sp.h);
   const hose=mesh(G.cyl(.02,.025,.22,8),mat(0x3cb043,.5),0,-.07,.06,e.npc.handR);hose.rotation.x=1.4;
   const drops=EQ.Particles(160,.08,0xcfeeff,{floor:.03});W.group.add(drops.obj);
   const a=staticAgent(W,e,sp.x+lx*1.6,sp.z+lz*1.6,sp.h-Math.PI/2,(dt,t,a,p,d)=>{e.npc.pose(dt,'spray',{});h.animate(dt,{speed:0});h.setWet(.6+Math.sin(t)*.2);
     if(d<45){e.npc.handR.getWorldPosition(tv);const tx=sp.x+Math.sin(sp.h)*Math.sin(t*.7)*.8+lx*.3,tz=sp.z+Math.cos(sp.h)*Math.sin(t*.7)*.8+lz*.3;
       for(let k=0;k<3;k++)drops.emit(tv.x,tv.y,tv.z,(tx-tv.x)*1.6+rnd(-.3,.3),1.2+rnd(-.3,.3),(tz-tv.z)*1.6+rnd(-.3,.3),.7);}
     drops.update(dt,-9);});
   a.extra=[h.root,drops.obj];a.label=label(e,EQ.randName(false),2.15);W.colliders.push({x:sp.x,z:sp.z,r:1.2});}
  // ragazza che porta un cavallo a mano dalla scuderia C al paddock
  {const pth=Path([[-14,-64],[-40,-64],[-40,-6],[-30,2],[-4,2],[20,2],[23,10]],false);const e=addTo(W,person(Object.assign(riderOpts(true),{helmet:null})));
   const h=horseOnly(W);const rp=rope(W);let hx=0,hz=0,hh=0,init=false;
   e.place=(x,y,z,hd)=>{e.root.position.set(x,y,z);e.root.rotation.y=hd;const rx=-Math.cos(hd),rz=Math.sin(hd);const tx=x+rx*.95-Math.sin(hd)*1.3,tz=z+rz*.95-Math.cos(hd)*1.3;
     if(!init){hx=tx;hz=tz;hh=hd;init=true;}const d=Math.hypot(tx-hx,tz-hz);hx=U.lerp(hx,tx,.08);hz=U.lerp(hz,tz,.08);hh+=U.wrapA(hd-hh)*.06;h.root.position.set(hx,0,hz);h.root.rotation.y=hh;h._sp=d*6;};
   const base=e.anim;e.anim=(dt,sp,a,t)=>{e.npc.pose(dt,sp>.1?'lead':'stand',{speed:sp});h.animate(dt,{speed:Math.min(sp,h._sp||0)});h.root.updateMatrixWorld();e.npc.handR.getWorldPosition(tv);h.chin.getWorldPosition(tv2);rp.set(tv,tv2);};
   const a=pathAgent(W,e,pth,{speed:1.3,pause:12,stopR:3,far:170});a.extra=[h.root,rp.l];a.label=label(e,EQ.randName(true),2.15);
   const c={x:0,z:0,r:.9};W.colliders.push(c);const u=a.update;a.update=(dt,t,p,d)=>{u(dt,t,p,d);c.x=h.root.position.x;c.z=h.root.position.z;};}
  // carriola del fieno lungo i box
  {const SB=S.SB;const pth=Path([[SB.x0+2,16.2],[SB.x1-1,16.2]],false);const e=addTo(W,person({fem:false,top:0x6b5a45,pants:0x2c3e66,cap:0xc0392b,boots:0x2f6b33}));
   const b=EQ.buildBarrow();b.position.set(0,0,.85);e.root.add(b);
   const a=pathAgent(W,e,pth,{speed:1,pause:3,stopR:3,far:120,check:(a,tg,p,t)=>Math.sin(t*.5+a.s)>.75?0:tg});e.anim=(dt,sp)=>e.npc.pose(dt,sp>.1?'push':'stand',{speed:sp});
   a.label=label(e,EQ.randName(false),2.2);addCol(W,a,.8);}
  // tribuna: pubblico seduto e tifosi
  if(S.stands){const st=S.stands;const vars=bakedVariants(10,'sit',()=>({}),(g)=>{g.rotateY(Math.PI);return g;});const L=[];
   for(let r=0;r<st.rows;r++)for(let x=-13.5;x<=13.5;x+=.85){if(Math.random()<.3)continue;L.push({x:x+rnd(-.1,.1),y:.5+r*st.step-.42,z:1.4*r+.55,ry:rnd(-.15,.15)});}
   const tmp=new THREE.Group();st.g.add(tmp);const fake={group:tmp};placeBaked(fake,vars,L);
   for(let i=0;i<8;i++){const e=person({});st.g.add(e.root);const r=i%st.rows,x=-12+i*3.3;e.root.position.set(x,.5+r*st.step-.42,1.4*r+.55);e.root.rotation.y=Math.PI;const ph=rnd(0,9);
     W.updaters.push((dt,t,p)=>{if(p&&Math.hypot(p.x-40,p.z+32)>120)return;const m=Math.sin(t*.35+ph);e.npc.pose(dt,m>.6?'cheer':m>-.2?'clap':'sit',{});});}}
  // club house: gente ai tavolini, bambini e cane
  {const vars=bakedVariants(6,'sit',()=>({}));const L=[];
   for(let i=-1;i<=1;i++){const tx=14+i*4,tz=18.5;for(const [dx,dz,ry] of [[0,-.8,0],[0,.8,Math.PI],[-.8,0,Math.PI/2]])if(Math.random()<.75)L.push({x:tx+dx,y:0,z:tz+dz,ry});}
   placeBaked(W,vars,L);
   for(let i=0;i<3;i++){const fem=Math.random()<.5;const e=addTo(W,person({kid:true,fem}));const a=wanderAgent(W,e,{x:8,z:12,hx:6,hz:3},{speed:2.6,idle:[1,3],step:5});e.anim=(dt,sp,a,t)=>e.npc.pose(dt,sp>.2?'run':'play',{speed:sp});a.label=label(e,EQ.randName(fem),1.55);}
   const d=EQ.buildDog({});W.group.add(d.root);wanderAgent(W,{root:d.root,anim:(dt,sp)=>d.animate(dt,sp)},{x:8,z:12,hx:7,hz:4},{speed:2.5,idle:[1,4],step:6});}
  // mucche e pecore nei campi
  if(S.cows){for(let i=0;i<9;i++){const an=EQ.buildAnimal('cow');W.group.add(an.root);wanderAgent(W,{root:an.root,anim:(dt,sp)=>an.animate(dt,sp)},{x:S.cows.x,z:S.cows.z,hx:S.cows.hx-3,hz:S.cows.hz-3},{speed:.6,idle:[5,15],step:10,far:260});}
   for(let i=0;i<14;i++){const an=EQ.buildAnimal('sheep');W.group.add(an.root);wanderAgent(W,{root:an.root,anim:(dt,sp)=>an.animate(dt,sp)},{x:S.sheep.x,z:S.sheep.z,hx:S.sheep.hx-3,hz:S.sheep.hz-3},{speed:.7,idle:[3,10],step:8,far:260});}}
  // cavalli liberi nei recinti in terra
  (S.dirtPads||[]).forEach(pd=>{for(let i=0;i<2;i++){const h=horseOnly(W,{});const e={root:h.root,anim:(dt,sp,a,t)=>h.animate(dt,{speed:sp,eat:sp<.2&&Math.sin(t*.2+a.tx)>-.3?1:0,graze:1})};
    const a=wanderAgent(W,e,{x:pd.x,z:pd.z,hx:pd.hx-2.5,hz:pd.hz-2.5},{speed:1.2,run:4,idle:[4,14],step:8,far:170});
    const c={x:0,z:0,r:.9};W.colliders.push(c);const u=a.update;a.update=(dt,t,p,d)=>{u(dt,t,p,d);c.x=a.x;c.z=a.z;};
    (W.freeHorses=W.freeHorses||[]).push({h,agent:a,col:c,home:{x:pd.x,z:pd.z},name:pick(EQ.HORSE_NAMES)});}});
  // gatti del maneggio
  for(let i=0;i<5;i++){const c=EQ.buildCat();W.group.add(c.root);wanderAgent(W,{root:c.root,anim:(dt,sp)=>c.animate(dt,sp)},i<3?{x:-35,z:15.6,hx:16,hz:1.2}:{x:8,z:12,hx:7,hz:4},{speed:.8,run:3,idle:[3,10],step:6,far:90});}
  // sedie del club house (una libera per tavolo)
  W.seats=W.seats||[];
  for(let i=-1;i<=1;i++){const tx=14+i*4,tz=18.5;for(const [dx,dz] of [[0,-.8],[0,.8],[-.8,0],[.8,0]]){mesh(G.box(.42,.06,.42),mat(0x6b4a2a,.7),tx+dx,.45,tz+dz,W.group);mesh(G.cyl(.03,.03,.45,6),mat(0x333333,.4,.6),tx+dx,.22,tz+dz,W.group);}
    W.seats.push({x:tx+.8,z:tz,h:-Math.PI/2,y:0});}
  // persone che passeggiano nel maneggio
  for(let i=0;i<3;i++){const fem=Math.random()<.5;const e=addTo(W,person({fem}));const a=wanderAgent(W,e,{x:-10,z:6,hx:30,hz:6},{speed:1.2,idle:[3,9],step:12,cols:.3});a.label=label(e,EQ.randName(fem),2.15);addCol(W,a,.35);}
};

/* ======================= SPIAGGIA ======================= */
/* ======================= CONCORSO ======================= */
/* spettatore seduto leggero (poche centinaia di vertici) per le folle */
function cheapSitter(){const X=EQ.xform,T=EQ.tint,P=EQ.PCOL;const top=pick(P.TOPS),pants=pick(P.PANTS),skin=pick(P.SKINS),hair=pick(P.HAIRS);
  const g=[T(X(G.box(.34,.5,.22),0,.75,0),top),T(X(new THREE.SphereGeometry(.11,8,6),0,1.13,0),skin),T(X(new THREE.SphereGeometry(.118,8,4,0,Math.PI*2,0,1.3),0,1.15,-.01),hair),
    T(X(G.box(.3,.14,.44),0,.5,.16),pants),T(X(G.box(.26,.42,.12),0,.26,.36),pants),T(X(G.box(.26,.06,.2),0,.04,.42),pick(P.SHOES))];
  for(const sd of [1,-1])g.push(T(X(G.box(.08,.42,.1),sd*.21,.68,.07,-.35,0,0),Math.random()<.5?top:skin));
  const m=EQ.merge(g);m.rotateY(Math.PI);return m;}
EQ.populate.show=function(W){
  const vars=[];for(let i=0;i<14;i++)vars.push(cheapSitter());
  (W.spots.standsList||[]).forEach(st=>{const L=[];const hl=st.len/2-1;
    for(let r=0;r<st.rows;r++)for(let x=-hl;x<=hl;x+=.95){if(Math.random()<.22)continue;L.push({x:x+rnd(-.1,.1),y:.5+r*st.step-.42,z:1.4*r+.55,ry:rnd(-.15,.15)});}
    const tmp=new THREE.Group();st.g.add(tmp);placeBaked({group:tmp},vars,L);tmp.traverse(o=>{if(o.isInstancedMesh)o.castShadow=false;});
    for(let i=0;i<3;i++){const e=person({});st.g.add(e.root);const r=1+i%(st.rows-1),x=-hl+4+i*(st.len-8)/3;e.root.position.set(x,.5+r*st.step-.42,1.4*r+.55);e.root.rotation.y=Math.PI;e.root.traverse(o=>{if(o.isMesh)o.castShadow=false;});const ph=rnd(0,9);let acc=0;
      W.updaters.push((dt,t,p)=>{acc+=dt;if(acc<.05)return;dt=acc;acc=0;const m=Math.sin(t*.4+ph);e.npc.pose(dt,(W.cheer>0)?(m>0?'cheer':'clap'):m>.7?'clap':'sit',{});});}});
  W.cheer=0;W.updaters.push((dt)=>{if(W.cheer>0)W.cheer-=dt;});
  // giudici nella torre
  const j=W.spots.judges;for(let i=0;i<2;i++){const e=person({fem:i===1,top:0x1f3b7a,pants:0x2a2a2e,sleeves:'long',glasses:true});W.group.add(e.root);e.npc.pose(1,'sit',{snap:true});e.root.position.set(j.x-.7+i*1.4,j.y-.05,j.z+.4);}
  // altri concorrenti nel campo prova
  const wm=W.spots.warm;const tr=Path(ellipse(wm.x,wm.z,wm.hx-3,wm.hz-3,40),true);
  for(let i=0;i<3;i++){const fem=Math.random()<.6;const e=rider(W,fem);const a=pathAgent(W,e,tr,{speed:[2,4.5,6][i],s:i*tr.L/3,stopR:6,colR:.75,colOff:.7,two:true,far:220});a.label=label(e,EQ.randName(fem),3.15);}
  // groom e pubblico a terra
  for(let i=0;i<8;i++){const fem=Math.random()<.5;const e=addTo(W,person({fem}));const a=wanderAgent(W,e,{x:0,z:-62,hx:24,hz:3},{speed:1.1,idle:[3,9],step:8,cols:.3});addCol(W,a,.35);}
  for(let i=0;i<2;i++){const d=EQ.buildDog({});W.group.add(d.root);wanderAgent(W,{root:d.root,anim:(dt,sp)=>d.animate(dt,sp)},{x:0,z:-62,hx:22,hz:3},{speed:2,idle:[1,4],step:6});}
};
/* ======================= CASA MIA ======================= */
EQ.populate.home=function(W){
  const g=W.spots.garden;
  const c=EQ.buildCat();W.group.add(c.root);wanderAgent(W,{root:c.root,anim:(dt,sp)=>c.animate(dt,sp)},{x:0,z:-8,hx:18,hz:3},{speed:.8,run:3,idle:[3,10],step:6,far:90});
  const d=EQ.buildDog({col:0xc8a060});W.group.add(d.root);wanderAgent(W,{root:d.root,anim:(dt,sp)=>d.animate(dt,sp)},{x:0,z:3,hx:18,hz:12},{speed:2.3,run:5,idle:[1,4],step:8,far:120});
  // cugini e cugine che giocano in giardino
  const cz=[['Cugina',true],['Cugino',false],['Cugina',true],['Cugino',false]];
  cz.forEach(([t,fem],k)=>{const nm=EQ.randName(fem);const kid=addTo(W,person({kid:true,fem,backpack:null}));
    const ka=wanderAgent(W,kid,{x:-6+k*3,z:4,hx:12,hz:9},{speed:2.6,idle:[.5,2.5],step:7});kid.anim=(dt,sp)=>kid.npc.pose(dt,sp>.2?'run':'play',{speed:sp});
    ka.label=label(kid,t+' '+nm,1.55);kid.name=t+' '+nm;
    kid.lines=['Giochiamo a nascondino?','Mi fai salire sul cavallo?','Il tuo cavallo è bellissimo!','Facciamo una gara di corsa!','Dopo guardiamo la TV insieme?','In cameretta ci sono i peluche!','Io da grande avrò un pony!'];});
};
EQ.populate.beach=function(W){
  const sh=W.shore,H=W.height,S=W.spots;
  // bagnanti stesi su asciugamani
  {const vars=bakedVariants(8,'stand',swimOpts,lying);const L=[],tw=[];const tc=[0xe74c3c,0x2a58c8,0xf1c40f,0x2ecc71,0xff6fa8,0xffffff,0x1abc9c,0xe67e22];
   S.umbrellas.forEach(u=>{if(Math.random()<.6){const x=u.x+rnd(1.2,2.2),z=u.z+rnd(-1,1),ry=Math.PI/2+rnd(-.3,.3);L.push({x,y:H(x,z),z,ry});tw.push({x,y:H(x,z)+.02,z,ry,col:pick(tc)});}});
   for(let i=0;i<70*QN();i++){const z=rnd(-600,600),x=sh(z)-rnd(7,26);if(S.umbrellas.some(u=>Math.hypot(u.x-x,u.z-z)<3))continue;const ry=Math.PI/2+rnd(-.5,.5);L.push({x,y:H(x,z),z,ry});tw.push({x,y:H(x,z)+.02,z,ry,col:pick(tc)});}
   W.group.add(EQ.inst(G.box(.9,.02,1.9),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95}),tw.map(t=>Object.assign({},t,{ry:t.ry+Math.PI/2}))));
   placeBaked(W,vars,L.map(l=>Object.assign({},l,{ry:l.ry+Math.PI/2})));
   const bL=S.beds.filter(()=>Math.random()<.4).map(b=>({x:b.x,y:b.y+.06,z:b.z,ry:Math.PI}));placeBaked(W,vars,bL);}
  // nuotatori
  for(let i=0;i<18*QN();i++){const z=rnd(-520,520);const e=addTo(W,person(swimOpts(i)));
    const a=wanderAgent(W,e,{x:sh(z)+16,z,hx:12,hz:40},{speed:.8,idle:[1,5],step:10,yOff:-1.22,far:200,ok:(x,z2)=>x-sh(z2)>5});
    e.place=(x,y,z,h)=>{e.root.position.set(x,-1.22,z);e.root.rotation.y=h;};e.anim=(dt,sp,a,t)=>{e.npc.pose(dt,sp>.1?'swim':'wave',{});e.root.position.y=-1.22+Math.sin(t*2+a.tx)*.05;};}
  // gente in piedi nell'acqua bassa e bambini che giocano
  for(let i=0;i<14*QN();i++){const z=rnd(-560,560),x=sh(z)+rnd(1.5,5);const e=addTo(W,person(Object.assign(swimOpts(i),{kid:i%3===0})));staticAgent(W,e,x,z,rnd(0,TAU),(dt,t,a)=>{e.npc.pose(dt,Math.sin(t*.5+a.z)>.5?'wave':'stand',{});e.root.position.y=H(a.x,a.z)+.02;},{});}
  for(let i=0;i<10;i++){const z=rnd(-500,500);const e=addTo(W,person(Object.assign(swimOpts(i),{kid:true})));const a=wanderAgent(W,e,{x:sh(z)-3,z,hx:4,hz:10},{speed:3,idle:[.5,2],step:6});e.anim=(dt,sp)=>e.npc.pose(dt,sp>.2?'run':'play',{speed:sp});}
  // castelli di sabbia
  for(let i=0;i<5;i++){const z=rnd(-450,450),x=sh(z)-4;const g=new THREE.Group();g.position.set(x,H(x,z),z);W.group.add(g);const sm=mat(0xd8be8a,.95);
    mesh(G.cyl(.6,.7,.35,10),sm,0,.17,0,g);for(const [dx,dz] of [[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]]){mesh(G.cyl(.14,.16,.55,8),sm,dx,.45,dz,g);mesh(G.cone(.16,.2,8),sm,dx,.82,dz,g);}mesh(G.cyl(.25,.3,.5,8),sm,0,.55,0,g);
    mesh(G.cyl(.12,.1,.2,10,true),mat(0x2a58c8,.5),.9,.1,.2,g);
    for(const s of [-1,1]){const e=addTo(W,person(Object.assign(swimOpts(i),{kid:true})));staticAgent(W,e,x+s*1.1,z+.3,s>0?-Math.PI/2:Math.PI/2,(dt)=>e.npc.pose(dt,'crouch',{}));}}
  // bagnini
  S.towers.forEach((tw,i)=>{const e=addTo(W,person({fem:i%2===0,top:0xd62828,pants:0xd62828,shorts:true,cap:0xd62828,shoes:0xf2f2f2}));
    const a=staticAgent(W,e,tw.x,tw.z,Math.PI/2,(dt,t)=>e.npc.pose(dt,Math.sin(t*.3+i)>.8?'wave':'sit',{}),{y:tw.y-.04});a.label=label(e,'Bagnino '+EQ.randName(i%2===0),1.9);
    const e2=addTo(W,person({fem:i%2===1,top:0xd62828,pants:0xd62828,shorts:true,cap:0xd62828,shoes:0xf2f2f2}));
    const pth=Path([[sh(tw.z-70)-3,tw.z-70],[sh(tw.z)-3.5,tw.z],[sh(tw.z+70)-3,tw.z+70]],false);
    const a2=pathAgent(W,e2,pth,{speed:1.2,pause:5,stopR:3,check:(a,tg,p,t)=>{if(Math.random()<.0008)EQ.sfx.whistle();return tg;}});a2.label=label(e2,'Bagnino '+EQ.randName(i%2===1),2.15);addCol(W,a2,.35);});
  // pescatori: sul molo e sulla riva
  const rod=(e)=>{const r=new THREE.Group();e.npc.handR.add(r);r.rotation.x=-1.0;mesh(G.cyl(.012,.006,2.8,5),mat(0x222222,.4),0,0,1.3,r).rotation.x=Math.PI/2;
    const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,2.7,0,-6,7],3));r.add(new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xdddddd})));return r;};
  if(S.pier){for(let i=0;i<3;i++){const e=addTo(W,person({fem:false,old:i===0,hat:i===1?0xd9c7a5:null,cap:i===2?0x2a58c8:null,top:pick([0x4a5a3a,0x6b5a45,0x2c3e66])}));rod(e);
      const x=S.pier.x1-3-i*6,z=S.pier.z+(i%2?1:-1)*.9;staticAgent(W,e,x,z,i%2?0:Math.PI,(dt,t)=>e.npc.pose(dt,'fish',{}),{y:S.pier.y});}}
  for(let i=0;i<6;i++){const z=rnd(-550,550),x=sh(z)-1.5;const e=addTo(W,person({fem:false,hat:0xd9c7a5,top:pick([0x4a5a3a,0x6b5a45]),pants:0x2c3e66,boots:0x2f6b33}));rod(e);
    staticAgent(W,e,x,z,Math.PI/2,(dt,t)=>e.npc.pose(dt,'fish',{}));
    const bk=mesh(G.cyl(.15,.12,.3,10),mat(0xf2f2f2,.5),x-.8,H(x-.8,z)+.15,z+.5,W.group);}
  // passeggiatori, alcuni col cane
  for(let i=0;i<16*QN();i++){const z0=rnd(-560,400),L=rnd(80,200);const pth=Path([[sh(z0)-2.5,z0],[sh(z0+L/2)-3,z0+L/2],[sh(z0+L)-2.5,z0+L]],false);
    const fem=Math.random()<.5;const e=addTo(W,person({fem,shorts:true,sleeves:'short',hat:Math.random()<.3?0xf2e2c0:null}));const a=pathAgent(W,e,pth,{speed:rnd(1,1.5),pause:rnd(2,8),stopR:3,lat:rnd(-1,1)});addCol(W,a,.35);
    if(i%3===0){const d=EQ.buildDog({});W.group.add(d.root);const rp=rope(W);a.extra=[d.root,rp.l];const u=a.update;
      a.update=(dt,t,p,dd)=>{u(dt,t,p,dd);const fx=Math.sin(a.h),fz=Math.cos(a.h);const tx=a.x+fx*1.6-fz*.6,tz=a.z+fz*1.6+fx*.6;d.root.position.set(tx,H(tx,tz),tz);d.root.rotation.y=a.h;d.animate(dt,a.v);
        e.root.updateMatrixWorld();e.npc.handR.getWorldPosition(tv);tv2.set(tx,H(tx,tz)+.25,tz+0);rp.set(tv,tv2);};}}
  // beach volley
  {const z=120,x=sh(z)-24,y=H(x,z);const g=new THREE.Group();g.position.set(x,y,z);W.group.add(g);
   for(const s of [-4,4])mesh(G.cyl(.05,.05,2.6,6),mat(0xdddddd,.4,.5),0,1.3,s,g);mesh(G.box(.02,.9,8),mat(0x111111,.8,0,{transparent:true,opacity:.6}),0,2.05,0,g);
   const ball=mesh(G.sph(.12,10,8),mat(0xffffff,.4),0,2,0,g);const pl=[];
   for(let i=0;i<4;i++){const e=person(Object.assign(swimOpts(i),{}));g.add(e.root);const sx=i<2?-3:3,sz=i%2?-2:2;e.root.position.set(sx,0,sz);e.root.rotation.y=i<2?Math.PI/2:-Math.PI/2;pl.push({e,sx,sz});}
   W.colliders.push({x,z,hx:6,hz:5});
   W.updaters.push((dt,t,p)=>{if(p&&Math.hypot(p.x-x,p.z-z)>140)return;const ph=(t*.5)%1,k=Math.floor(t*.5)%2;const a=pl[k*2+(Math.floor(t)%2)],b=pl[(1-k)*2+(Math.floor(t*.5+.5)%2)];
     ball.position.set(U.lerp(a.sx,b.sx,ph),2+Math.sin(ph*Math.PI)*4,U.lerp(a.sz,b.sz,ph));pl.forEach((q,i)=>q.e.npc.pose(dt,q===a&&ph<.15?'cheer':'play',{}));});}
  // altri cavalieri sulla battigia
  for(let i=0;i<3;i++){const z0=-500+i*300;const pth=Path([[sh(z0)+1.5,z0],[sh(z0+120)+1.5,z0+120],[sh(z0+240)+1.5,z0+240]],false);const fem=Math.random()<.6;const e=rider(W,fem);
    const a=pathAgent(W,e,pth,{speed:rnd(4,8),pause:4,stopR:7,colR:.75,colOff:.7,two:true,far:240,check:(a,tg)=>tg});a.label=label(e,EQ.randName(fem),3.15);
    const u=a.update;a.update=(dt,t,p,d)=>{u(dt,t,p,d);const dep=-H(a.x,a.z);if(dep>0&&a.v>2&&Math.random()<dt*8)EQ.sfx.splash(.05);};}
  // barche
  const boats=[];
  const boatPath=(x,z0,z1)=>Path([[x,z0],[x+30,(z0+z1)/2],[x,z1],[x-20,(z0+z1)/2]],true);
  for(let i=0;i<7;i++){const b=EQ.buildBoat('sail');W.group.add(b);const p=boatPath(sh(0)+rnd(90,260),rnd(-600,-100),rnd(100,600));const a=pathAgent(W,{root:b,place:(x,y,z,h)=>{b.position.x=x;b.position.z=z;b.rotation.y=h;},anim:(dt,sp,a,t)=>{b.position.y=Math.sin(t*.8+a.s)*.25;b.rotation.z=.12+Math.sin(t*.7+a.s)*.05;}},p,{speed:rnd(2,4),far:900});a.always=true;}
  for(let i=0;i<3;i++){const b=EQ.buildBoat('motor');W.group.add(b);const p=boatPath(sh(0)+rnd(60,140),rnd(-500,-200),rnd(200,500));
    const a=pathAgent(W,{root:b,place:(x,y,z,h)=>{b.position.x=x;b.position.z=z;b.rotation.y=h;},anim:(dt,sp,a,t)=>{b.position.y=Math.sin(t*1.6+a.s)*.15+.1;b.rotation.x=-.06;}},p,{speed:rnd(9,13),far:900});a.always=true;}
  for(let i=0;i<4;i++){const z=rnd(-400,400);const kind=i%2?'pedalo':'row';const b=EQ.buildBoat(kind);W.group.add(b);
    const n=kind==='pedalo'?2:1;for(let k=0;k<n;k++){const e=person(swimOpts(k+i));e.npc.pose(1,'sit',{snap:true});b.add(e.root);e.root.position.set(kind==='pedalo'?(k?.35:-.35):0,kind==='pedalo'?.05:-.35,kind==='pedalo'?0:-.3);}
    if(kind==='row'){const e=b.children[1];if(e)e.position.y=-.3;}
    wanderAgent(W,{root:b,place:(x,y,z,h)=>{b.position.x=x;b.position.z=z;b.rotation.y=h;},anim:(dt,sp,a,t)=>{b.position.y=Math.sin(t*1.2+a.tz)*.12;}},{x:sh(z)+28,z,hx:14,hz:40},{speed:.8,idle:[3,10],step:15,ok:(x,z2)=>x-sh(z2)>14,far:400});}
};

/* ======================= BOSCO ======================= */
EQ.populate.forest=function(W){
  const H=W.height,RB=W.boundR,TS=W.trail;
  const area={x:0,z:0,r:RB-10};const okLand=(x,z)=>Math.abs(z-W.rz(x))>8;
  const animal=(kind,n,o)=>{for(let i=0;i<n;i++){const an=EQ.buildAnimal(kind);W.group.add(an.root);
    wanderAgent(W,{root:an.root,anim:(dt,sp)=>an.animate(dt,sp)},area,Object.assign({ok:okLand,step:20,far:150},o));}};
  animal('deer',5,{speed:.8,run:9,fleeR:20,idle:[3,9]});animal('doe',6,{speed:.7,run:8.5,fleeR:18,idle:[3,9]});
  animal('fox',4,{speed:1.5,run:7,fleeR:12,idle:[2,6]});animal('boar',4,{speed:.9,run:6,fleeR:10,idle:[3,8]});
  animal('rabbit',Math.round(14*QN()),{speed:1.2,run:5,fleeR:7,idle:[1,4],step:8,far:70});animal('squirrel',Math.round(12*QN()),{speed:1,run:4,fleeR:6,idle:[1,3],step:6,far:60});
  // stormi di uccelli
  {const bm=mat(0x2a2a2a,.6);const fl=[];for(let i=0;i<4;i++){const g=new THREE.Group();W.group.add(g);const birds=[];
     for(let k=0;k<9;k++){const b=new THREE.Group();b.position.set(rnd(-4,4),rnd(-1,1),rnd(-4,4));g.add(b);mesh(G.sph(.08,6,5),bm,0,0,0,b).scale.set(.8,.8,1.6);
       const wl=[];for(const s of [1,-1]){const w=new THREE.Group();b.add(w);mesh(G.box(.3,.01,.1),bm,s*.15,0,0,w);wl.push(w);}birds.push({b,wl,ph:rnd(0,9)});}
     fl.push({g,birds,cx:rnd(-200,200),cz:rnd(-200,200),r:rnd(40,90),h:rnd(25,40),v:rnd(.1,.2),ph:rnd(0,9)});}
   W.updaters.push((dt,t)=>fl.forEach(f=>{const a=t*f.v+f.ph;f.g.position.set(f.cx+Math.cos(a)*f.r,f.h,f.cz+Math.sin(a)*f.r);f.g.rotation.y=-a;f.birds.forEach(b=>b.wl.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(t*12+b.ph)*.6));}));}
  const loop=Path(TS.filter((p,i)=>i%4===0),true);
  // altri cavalieri
  for(let i=0;i<4;i++){const fem=Math.random()<.6;const e=rider(W,fem);const a=pathAgent(W,e,loop,{speed:rnd(2,6),dir:i%2?1:-1,lat:1.1,stopR:7,colR:.75,colOff:.7,two:true,far:200});a.label=label(e,EQ.randName(fem),3.15);}
  // gente a piedi col cane
  for(let i=0;i<5;i++){const fem=Math.random()<.5;const e=addTo(W,person({fem,sleeves:'long',backpack:Math.random()<.5?pick([0xc0392b,0x2a58c8,0x2f6b33]):null,hat:Math.random()<.3?0x6b5a45:null}));
    const a=pathAgent(W,e,loop,{speed:rnd(1,1.4),dir:i%2?1:-1,lat:-1.2,stopR:3,far:150});addCol(W,a,.35);
    if(i<4){const d=EQ.buildDog({});W.group.add(d.root);const rp=rope(W);a.extra=[d.root,rp.l];const u=a.update;
      a.update=(dt,t,p,dd)=>{u(dt,t,p,dd);const fx=Math.sin(a.h),fz=Math.cos(a.h);const tx=a.x+fx*1.7+fz*.5,tz=a.z+fz*1.7-fx*.5;d.root.position.set(tx,H(tx,tz),tz);d.root.rotation.y=a.h;d.animate(dt,a.v);
        e.root.updateMatrixWorld();e.npc.handR.getWorldPosition(tv);tv2.set(tx,H(tx,tz)+.25,tz);rp.set(tv,tv2);if(p&&dd<10&&Math.random()<dt*.3)EQ.sfx.bark();};}}
  // ciclisti
  for(let i=0;i<4;i++){const b=EQ.buildBike();const e=person({fem:i%2===0,helmet:pick([0xf1c40f,0xc0392b,0x2a58c8,0xffffff]),top:pick(EQ.PCOL.TOPS),shorts:true,sleeves:'short'});b.add(e.root);e.root.position.set(0,.18,-.18);
    W.group.add(b);const ent={root:b,vnpc:e.npc,vehicle:'bike',anim:(dt,sp,a)=>{e.npc.pose(dt,'pedal',{speed:sp});}};
    const P2=i<2?loop:Path(W.roads[i-2],false);const a=pathAgent(W,ent,P2,{speed:rnd(4.5,6.5),dir:i%2?1:-1,lat:-1.3,stopR:8,pause:3,far:170,check:(a,tg,p)=>{if(p&&a.near<14&&Math.random()<.004)EQ.sfx.bikebell();return tg;}});addCol(W,a,.5);}
  // quad sugli sterrati
  for(let i=0;i<3;i++){const q=EQ.buildQuadBike();const e=person({fem:i===1,helmet:pick([0x111111,0xc0392b,0x2a58c8]),top:pick(EQ.PCOL.TOPS),pants:0x2a2a2e,sleeves:'long'});q.add(e.root);e.root.position.set(0,.05,-.2);
    W.group.add(q);const ent={root:q,vnpc:e.npc,vehicle:'quad',anim:(dt,sp,a,t)=>{e.npc.pose(dt,'quad',{bob:Math.sin(t*14)*.01*Math.min(1,sp)});if(a.near<45&&sp>1&&Math.random()<dt*10)EQ.sfx.engine(sp/8);}};
    const P2=Path(W.roads[i],false);const a=pathAgent(W,ent,P2,{speed:rnd(6,9),lat:-1.3,stopR:12,stopW:3,pause:8,far:200});addCol(W,a,.9);}
  // famiglia al picnic
  if(W.spots.picnic){const pc=W.spots.picnic;W.seats=W.seats||[];W.seats.push({x:pc.x-.5,z:pc.z+1.6,h:Math.PI,y:H(pc.x,pc.z+1.6)});const vars=bakedVariants(4,'sit',()=>({}));placeBaked(W,vars,[{x:pc.x,y:H(pc.x,pc.z-1.6),z:pc.z-1.6,ry:0},{x:pc.x+.7,y:H(pc.x,pc.z-1.6),z:pc.z-1.6,ry:0},{x:pc.x,y:H(pc.x,pc.z+.6),z:pc.z+.6,ry:Math.PI}]);
    for(let i=0;i<2;i++){const e=addTo(W,person({kid:true}));const a=wanderAgent(W,e,{x:pc.x+4,z:pc.z,hx:5,hz:5},{speed:2.5,idle:[.5,2],step:4});e.anim=(dt,sp)=>e.npc.pose(dt,sp>.2?'run':'play',{speed:sp});}}
};

/* ======================= CITTÀ ======================= */
EQ.populate.city=function(W){
  const {P,R,B,n,ext}=W.grid;
  // traffico sulla griglia di strade
  const lines=[];for(let k=-n-1;k<=n;k++)lines.push((k+.5)*P);
  const NL=lines.length;
  const cars=[];
  const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
  const makeCar=(type,col,speed)=>{const g=EQ.buildCar(type,col);W.group.add(g);
    const c={g,i:Math.random()*NL|0,j:Math.random()*NL|0,d:Math.random()*4|0,t:0,v:speed,vmax:speed,ox:0,oz:0,pox:0,poz:0,blocked:0,h:0,x:0,z:0,col:{x:0,z:0,r:1.3},col2:{x:0,z:0,r:1.3},L:g.userData.L};
    const ty=g.userData.type;c.col.car=c.col2.car=true;c.col.h=c.col2.h=(ty==='van'||ty==='bus')?99:ty==='suv'?1.6:1.4;W.colliders.push(c.col,c.col2);
    const valid=(i,j,d)=>{const ni=i+DIRS[d][0],nj=j+DIRS[d][1];return ni>=0&&ni<NL&&nj>=0&&nj<NL;};
    while(!valid(c.i,c.j,c.d))c.d=Math.random()*4|0;
    c.valid=valid;cars.push(c);return c;};
  for(let i=0;i<26*QN();i++)makeCar(null,null,rnd(7,10));
  for(let i=0;i<2;i++)makeCar('bus',[0xe67e22,0x2a58c8][i],6.5);
  const tvp=new V3();
  W.updaters.push((dt,t,p)=>{
    let eng=0,engF=0;
    cars.forEach(c=>{
      const dx=DIRS[c.d][0],dz=DIRS[c.d][1];
      const ax=lines[c.i],az=lines[c.j];
      // corsia di destra
      const rx=-dz,rz=dx;const lane=1.9;
      const off=U.clamp(c.t*P/7,0,1);const ox=U.lerp(c.pox,rx*lane,off),oz=U.lerp(c.poz,rz*lane,off);
      c.x=ax+dx*c.t*P+ox;c.z=az+dz*c.t*P+oz;
      let tgt=c.vmax;const fx=Math.sin(c.h),fz=Math.cos(c.h);
      let byP=false;if(p){const qx=p.x-c.x,qz=p.z-c.z,ah=qx*fx+qz*fz,sd=Math.abs(qx*fz-qz*fx);if(ah>0&&ah<13&&sd<3.2){tgt=0;byP=true;}}
      for(const o of cars){if(o===c)continue;const qx=o.x-c.x,qz=o.z-c.z,ah=qx*fx+qz*fz,sd=Math.abs(qx*fz-qz*fx);if(ah>0&&ah<(c.L+o.L)/2+3.5&&sd<2)tgt=0;}
      if(tgt===0){c.blocked+=dt;if(byP&&c.blocked>1.8&&Math.random()<dt*.6){(Math.random()<.5?EQ.sfx.honk2:EQ.sfx.horn)();c.blocked=-1.5;}else if(c.blocked>3&&p&&Math.hypot(p.x-c.x,p.z-c.z)<25&&Math.random()<dt*.3)EQ.sfx.horn();}else c.blocked=0;
      if(p){const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<45){const k=(1-d/45);eng=Math.max(eng,k*(.35+c.v/12));engF=Math.max(engF,70+c.v*9);}
        if(d<8&&c.v>5&&!c.passed){c.passed=true;EQ.sfx.carpass(.08+c.v*.008);if(Math.random()<.25)setTimeout(()=>EQ.sfx.horn(.2),200);}if(d>14)c.passed=false;}
      if(c.blocked>8){c.blocked=0;tgt=c.vmax*.3;}
      c.v=U.lerp(c.v,tgt,Math.min(1,dt*(tgt<c.v?3:.8)));
      c.t+=c.v*dt/P;
      if(c.t>=1){c.i+=dx;c.j+=dz;c.t=0;c.pox=rx*lane;c.poz=rz*lane;
        const opts=[0,1,2,3].filter(d=>c.valid(c.i,c.j,d)&&!(DIRS[d][0]===-dx&&DIRS[d][1]===-dz));c.d=opts.length?pick(opts):[0,1,2,3].find(d=>c.valid(c.i,c.j,d));}
      const th=Math.atan2(dx,dz);c.h+=U.wrapA(th-c.h)*Math.min(1,dt*3.5);
      c.g.position.set(c.x,0,c.z);c.g.rotation.y=c.h;
      const vis=!p||Math.hypot(p.x-c.x,p.z-c.z)<380;c.g.visible=vis;
      const k=c.L*.28;c.col.x=c.x+fx*k;c.col.z=c.z+fz*k;c.col2.x=c.x-fx*k;c.col2.z=c.z-fz*k;
    });
    if(p){EQ.loop('city',.07,250,.4,'lowpass');EQ.loop('engine',eng*.22,engF||90,1.2,'lowpass');}
  });
  // pedoni sui marciapiedi attorno agli isolati
  const blocks=W.blocks;
  for(let i=0;i<44*QN();i++){const b=pick(blocks);const off=B/2+1.6;const pth=Path(rect(b.x,b.z,off,off),true);
    const kind=Math.random();const fem=Math.random()<.5;
    const e=addTo(W,person({fem,old:Math.random()<.15,glasses:Math.random()<.2,dress:fem&&Math.random()<.3,backpack:Math.random()<.15?pick([0xc0392b,0x2a58c8]):null,hat:Math.random()<.1?0x6b5a45:null}));
    const a=pathAgent(W,e,pth,{speed:rnd(1,1.5),dir:Math.random()<.5?1:-1,stopR:2.5,lat:rnd(-.5,.5),far:140});addCol(W,a,.35);
    if(kind<.2){const d=EQ.buildDog({});W.group.add(d.root);const rp=rope(W);a.extra=[d.root,rp.l];const u=a.update;
      a.update=(dt,t,p,dd)=>{u(dt,t,p,dd);const fx=Math.sin(a.h),fz=Math.cos(a.h);const tx=a.x+fx*1.5+fz*.5,tz=a.z+fz*1.5-fx*.5;d.root.position.set(tx,.14,tz);d.root.rotation.y=a.h;d.animate(dt,a.v);
        e.root.updateMatrixWorld();e.npc.handR.getWorldPosition(tv);tv2.set(tx,.4,tz);rp.set(tv,tv2);if(p&&dd<8&&Math.random()<dt*.25)EQ.sfx.bark();};}
    else if(kind<.38){const k=person({kid:true,fem:Math.random()<.5,backpack:pick([0xe86aa6,0x2a58c8,0xf1c40f,0x2ecc71])});W.group.add(k.root);a.extra=[k.root];const u=a.update;
      a.update=(dt,t,p,dd)=>{u(dt,t,p,dd);const fx=Math.sin(a.h),fz=Math.cos(a.h);k.root.position.set(a.x+fz*.7,.14,a.z-fx*.7);k.root.rotation.y=a.h;k.npc.pose(dt,a.v>.1?'walk':'stand',{speed:a.v});};}
    e.root.position.y=.14;a.o.yOff=.14;}
  // bambini a scuola
  if(W.spots.school){const sc=W.spots.school;for(let i=0;i<16;i++){const fem=Math.random()<.5;const e=addTo(W,person({kid:true,fem,backpack:Math.random()<.5?pick([0xe86aa6,0x2a58c8,0xf1c40f]):null}));
      const a=wanderAgent(W,e,sc.yard,{speed:2.8,idle:[.5,3],step:8,yOff:.15,far:140});e.anim=(dt,sp)=>e.npc.pose(dt,sp>.2?'run':'play',{speed:sp});}
    const tch=addTo(W,person({fem:true,glasses:true,dress:true,top:0x7b3fb0}));staticAgent(W,tch,sc.x,sc.z,Math.PI,(dt,t)=>{tch.npc.pose(dt,Math.sin(t*.3)>.7?'wave':'stand',{});},{yOff:.15});
    let kt=0;W.updaters.push((dt,t,p)=>{kt-=dt;if(kt<0){kt=rnd(2,5);if(p&&Math.hypot(p.x-sc.x,p.z-sc.z)<60)EQ.sfx.kids();}});}
  // gente seduta ai tavolini e sulle panchine
  {const vars=bakedVariants(8,'sit',()=>({}));const L=[];
   for(let i=0;i<6;i++){const x=-15+(i%2)*3.2,z=-12+(i>>1)*5;for(const [dx,ry] of [[-.7,Math.PI/2]])if(Math.random()<.8)L.push({x:x+dx,y:.15,z,ry});}
   blocks.filter(b=>b.type==='park'||b.type==='park2').forEach(b=>{for(let i=0;i<4;i++){if(Math.random()<.4)continue;const a=i*Math.PI/2,x=b.x+Math.cos(a)*6,z=b.z+Math.sin(a)*6;L.push({x,y:.2,z,ry:-a-Math.PI/2});}});
   placeBaked(W,vars,L);}
  W.seats=W.seats||[];for(let i=0;i<6;i++){const x=-15+(i%2)*3.2,z=-12+(i>>1)*5;W.seats.push({x:x+.7,z,h:-Math.PI/2,y:.15});}
  W.blocks.filter(b=>b.type==='park'||b.type==='park2').forEach(b=>{for(let i=0;i<2;i++){const c=EQ.buildCat();W.group.add(c.root);wanderAgent(W,{root:c.root,anim:(dt,sp)=>c.animate(dt,sp)},{x:b.x,z:b.z,hx:16,hz:16},{speed:.8,run:3,idle:[3,10],step:6,yOff:.15,far:90});}});
  // ciclisti lungo le strade
  for(let i=0;i<5;i++){const b=EQ.buildBike();const e=person({fem:i%2===0,helmet:pick([0xf1c40f,0xc0392b,0x2a58c8,0xffffff])});b.add(e.root);e.root.position.set(0,.18,-.18);W.group.add(b);
    const c=pick(lines),vert=i%2===0;const pth=Path(vert?[[c,-ext],[c,ext]]:[[-ext,c],[ext,c]],false);
    const a=pathAgent(W,{root:b,vnpc:e.npc,vehicle:'bike',anim:(dt,sp)=>e.npc.pose(dt,'pedal',{speed:sp})},pth,{speed:rnd(4,6),lat:4.3,stopR:7,pause:2,far:160});addCol(W,a,.5);}
  // persone nei parchi coi cani
  W.blocks.filter(b=>b.type==='park'||b.type==='park2').forEach(b=>{for(let i=0;i<2;i++){const d=EQ.buildDog({});W.group.add(d.root);wanderAgent(W,{root:d.root,anim:(dt,sp)=>d.animate(dt,sp)},{x:b.x,z:b.z,hx:18,hz:18},{speed:2.4,run:5,idle:[1,4],step:8,yOff:.15,far:120});}
    const e=addTo(W,person({old:true}));const a=wanderAgent(W,e,{x:b.x,z:b.z,hx:16,hz:16},{speed:.9,idle:[4,10],step:8,yOff:.15});addCol(W,a,.35);});
};
})();
