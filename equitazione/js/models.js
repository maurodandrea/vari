/* Giorgia a Cavallo – modelli: cavalli realistici (loft), finimenti, Giorgia con abbigliamento */
'use strict';
(function(){
const {U,G,mat,mesh,loft,C,V3,TAU}=EQ;
const hex=c=>'#'+c.toString(16).padStart(6,'0');

EQ.HORSES=[
  {id:'stella',name:'Stella',race:'Sella Italiano, baio',body:0x7b3e1b,dark:0x1b120c,mane:0x17100b,points:true,face:'stella',socks:[0,0,0,1]},
  {id:'luna',name:'Luna',race:'Andaluso, grigio pomellato',body:0xd8d4cc,dark:0x8f8a82,mane:0xece8df,dapple:true,face:null,socks:[0,0,0,0],muzzle:0x5b5350},
  {id:'ombra',name:'Ombra',race:'Frisone, morello',body:0x1d1917,dark:0x110e0d,mane:0x0b0909,face:'lista',socks:[1,0,0,1],longMane:true},
  {id:'caramella',name:'Caramella',race:'Haflinger, palomino',body:0xc98f45,dark:0xa46f30,mane:0xf3e5c6,face:'lista',socks:[1,1,1,1]},
  {id:'tempesta',name:'Tempesta',race:'Paint Horse, pezzato',body:0x6a3618,dark:0x2a170c,mane:0x2a1b12,pinto:true,face:'lista',socks:[1,0,1,1]},
  {id:'fulmine',name:'Fulmine',race:'Purosangue, sauro',body:0x9a4a1c,dark:0x7a3812,mane:0xa4561f,face:'lista',socks:[0,1,0,1]},
  {id:'nuvola',name:'Nuvola',race:'Appaloosa, leopardato',body:0xe6e2da,dark:0x6a5f56,mane:0x4a4038,apalo:true,face:null,socks:[0,0,0,0],muzzle:0x5b5350},
  {id:'biscotto',name:'Biscotto',race:'Pony, isabella',body:0xc8a06a,dark:0x2a1e14,mane:0x2a1e14,points:true,face:'stella',socks:[0,0,0,0],longMane:true},
  {id:'pepe',name:'Pepe',race:'Pony Shetland, baio',body:0x6e3818,dark:0x1b120c,mane:0x17100b,points:true,face:'stella',socks:[0,0,0,0],longMane:true,pony:.68},
  {id:'fiocco',name:'Fiocco',race:'Pony, grigio',body:0xd8d4cc,dark:0x8f8a82,mane:0xece8df,dapple:true,face:null,socks:[0,0,0,0],muzzle:0x5b5350,longMane:true,pony:.7},
];
/* mantelli per i cavalli degli altri cavalieri */
EQ.OTHER_COATS=[
  {body:0x6e3818,dark:0x1b120c,mane:0x17100b,points:true,face:'stella'},{body:0x8a4520,dark:0x6a3010,mane:0x8a4520,face:'lista'},
  {body:0x2a221e,dark:0x140f0d,mane:0x0e0b0a},{body:0xbdb8b0,dark:0x7a756d,mane:0xdedad2,dapple:true,muzzle:0x5b5350},
  {body:0x5a2e16,dark:0x1a110b,mane:0x1a110b,points:true,face:'lista'},{body:0xd4a560,dark:0xa07438,mane:0xf2e4c4,face:'lista'},
  {body:0x7a4a2a,dark:0x2a1a10,mane:0x2a1a10,pinto:true,face:'lista'},{body:0x9c8a7a,dark:0x3a2e26,mane:0x2a211b,points:true}];

/* ---------- texture del mantello ---------- */
const _coatC={},_hairC={};
function coatTex(def){
  const key=[def.body,def.dapple,def.pinto,def.apalo].join('_');if(_coatC[key])return _coatC[key];
  return _coatC[key]=EQ.canvasTex(512,512,(g,w,h)=>{
    const base=new THREE.Color(def.body);
    g.fillStyle=hex(def.body);g.fillRect(0,0,w,h);
    // controombreggiatura: dorso (u≈.25) più scuro, ventre (u≈.75) più chiaro
    const gr=g.createLinearGradient(0,0,w,0);
    gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.25,'rgba(0,0,0,.18)');gr.addColorStop(.5,'rgba(0,0,0,0)');gr.addColorStop(.75,'rgba(255,240,220,.12)');gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    if(def.dapple){for(let i=0;i<260;i++){const x=Math.random()*w,y=Math.random()*h,r=6+Math.random()*12;const rg=g.createRadialGradient(x,y,r*.2,x,y,r);rg.addColorStop(0,'rgba(255,255,255,.35)');rg.addColorStop(.6,'rgba(255,255,255,.12)');rg.addColorStop(1,'rgba(90,85,80,.18)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}}
    if(def.apalo){for(let i=0;i<500;i++){g.fillStyle=hex(def.dark);g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,3+Math.random()*5,4+Math.random()*6,Math.random()*3,0,TAU);g.fill();}}
    if(def.pinto){g.fillStyle='#f4f1ea';for(let i=0;i<9;i++){g.beginPath();const x=Math.random()*w,y=Math.random()*h;for(let k=0;k<14;k++){const a=k/14*TAU,r=40+Math.random()*45;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r*1.3);}g.fill();}}
    // pelo: piccoli tratti
    for(let i=0;i<9000;i++){const l=Math.random()<.5;g.fillStyle=l?'rgba(255,255,255,.05)':'rgba(0,0,0,.07)';g.fillRect(Math.random()*w,Math.random()*h,1,3+Math.random()*4);}
  },1,1);
}
function hairTex(col){
  if(_hairC[col])return _hairC[col];
  return _hairC[col]=EQ.canvasTex(64,256,(g,w,h)=>{g.fillStyle=hex(col);g.fillRect(0,0,w,h);
    for(let i=0;i<220;i++){g.strokeStyle=Math.random()<.5?'rgba(255,255,255,.12)':'rgba(0,0,0,.25)';g.lineWidth=1+Math.random();g.beginPath();const x=Math.random()*w;g.moveTo(x,0);g.bezierCurveTo(x+4,h*.3,x-4,h*.6,x+Math.random()*6-3,h);g.stroke();}});
}
const mudTex=EQ.canvasTex(128,128,(g,w,h)=>{
  for(let i=0;i<26;i++){const x=64+(Math.random()-.5)*60,y=64+(Math.random()-.5)*60,r=8+Math.random()*22;const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,'rgba(92,66,40,.95)');rg.addColorStop(.7,'rgba(110,80,50,.6)');rg.addColorStop(1,'rgba(110,80,50,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
});
const mudMatBase=new THREE.MeshStandardMaterial({map:mudTex,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-4});
const metal=mat(0xc8ccd0,.25,1);

/* arco di cilindro sopra/sotto il dorso (sottosella, sella, sottopancia) */
function arcGeo(r,len,a,ys,bottom){
  const g=new THREE.CylinderGeometry(r,r,len,28,1,true,bottom?-a:Math.PI-a,2*a);
  g.rotateX(Math.PI/2); g.scale(1,ys,1); return g;
}

const GAITS=[
  {offs:[Math.PI/2,3*Math.PI/2,0,Math.PI],amp:.28,knee:.8},
  {offs:[0,Math.PI,Math.PI,0],amp:.42,knee:1.15},
  {offs:[2.0,1.4,.7,0],amp:.6,knee:1.35},
];

EQ.buildHorse=function(def,opt){
  opt=opt||{};
  const H={def,stats:null};
  const root=new THREE.Group(), pivot=new THREE.Group(), PY=1.25;
  pivot.position.y=PY; root.add(pivot);
  const coat=new THREE.MeshStandardMaterial({map:coatTex(def),roughness:.5,metalness:0,envMapIntensity:1});
  const legDark=def.points?new THREE.MeshStandardMaterial({color:C(def.dark),roughness:.5}):coat;
  const sock=mat(0xf1ede4,.6);
  const hairM=new THREE.MeshStandardMaterial({map:hairTex(def.mane),roughness:.65,side:THREE.DoubleSide});
  const hoofM=mat(0x2b2420,.45);
  const eyeM=mat(0x120a06,.08);
  const skinM=mat(def.muzzle||0x2a211d,.55);
  H.coat=coat; H.baseRough=.5;
  const Y=a=>a.map(s=>[s[0],s[1]-PY,s[2],s[3],s[4],s[5]]);

  /* ---- corpo ---- */
  const bodyS=Y([
    [0,1.42,-1.1,.02,.02,.02],[0,1.41,-1.05,.15,.14,.17],[0,1.38,-.96,.27,.21,.3],[0,1.36,-.8,.37,.25,.38],
    [0,1.34,-.6,.4,.26,.42],[0,1.3,-.38,.39,.26,.43],[0,1.26,-.12,.41,.29,.43],[0,1.25,.14,.42,.31,.42],
    [0,1.27,.38,.4,.33,.43],[0,1.3,.56,.34,.33,.42],[0,1.27,.72,.27,.3,.36],[0,1.2,.84,.2,.22,.27],[0,1.14,.9,.1,.1,.12],[0,1.12,.92,.02,.02,.02]]);
  const body=mesh(loft(bodyS,28,4),coat,0,0,0,pivot);
  H.body=body;

  /* ---- collo ---- */
  const neck=new THREE.Group(); neck.position.set(0,1.43-PY,.62); pivot.add(neck);
  const neckS=[[0,-.16,-.13,.24,.3,.36],[0,.1,.05,.2,.26,.3],[0,.36,.23,.155,.21,.23],[0,.6,.4,.12,.17,.16],[0,.78,.5,.1,.13,.135],[0,.9,.555,.08,.09,.1]];
  mesh(loft(neckS,22,4),coat,0,0,0,neck);
  // criniera
  const crest=new THREE.CatmullRomCurve3(neckS.map(s=>new V3(s[0],s[1],s[2])));
  const mlen=def.longMane?.42:.24;
  {
    const N=28, pos=[], uv=[], idx=[], X=new V3(1,0,0);
    for(let i=0;i<N;i++){
      const u=.05+i/(N-1)*.9, p=crest.getPoint(u), t=crest.getTangent(u);
      const up=new V3().crossVectors(t,X).normalize();
      const rx=U.lerp(.2,.085,u), ry=U.lerp(.265,.095,u);
      const L=mlen*(1-u*.3)*(.85+Math.random()*.3)*U.smooth(0,.25,u);
      const top=p.clone().addScaledVector(up,ry*1.02);
      const mid=p.clone().addScaledVector(up,ry*.62).addScaledVector(X,-rx*.92);
      const bot=mid.clone().add(new V3(-.035,-L,-.02+Math.random()*.03));
      for(const [v,k] of [[top,0],[mid,.3],[bot,1]]){pos.push(v.x,v.y,v.z);uv.push(i/(N-1)*3,k);}
    }
    for(let i=0;i<N-1;i++)for(let k=0;k<2;k++){const a=i*3+k,b=a+3;idx.push(a,b,a+1,b,b+1,a+1);}
    const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));mg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));mg.setIndex(idx);mg.computeVertexNormals();
    mesh(mg,hairM,0,0,0,neck);
  }
  mesh(loft(neckS.slice(1).map(s=>[0,s[1]+s[4]*.97*.6,s[2]-s[4]*.97*.8,.05,.06,.02]),10,4),hairM,0,0,0,neck);

  /* ---- testa ---- */
  const head=new THREE.Group(); head.position.set(0,.86,.54); head.rotation.x=1.05; neck.add(head);
  const headS=[[0,.01,-.1,.03,.03,.03],[0,.02,-.05,.1,.11,.13],[0,0,.07,.12,.12,.17],[0,-.005,.2,.105,.1,.12],[0,-.015,.34,.085,.085,.095],[0,-.025,.47,.075,.08,.085],[0,-.035,.56,.08,.075,.088],[0,-.045,.62,.062,.06,.065],[0,-.05,.648,.02,.02,.02]];
  mesh(loft(headS,22,4),coat,0,0,0,head);
  const muz=mesh(G.sph(.085,16,12),skinM,0,-.05,.585,head); muz.scale.set(.92,.78,.8);
  if(def.face){
    const fm=mat(0xf3efe7,.6);
    if(def.face==='stella'){const st=mesh(G.sph(.04,12,8),fm,0,.115,.06,head);st.scale.set(1,.25,1.3);}
    else{const bl=mesh(loft([[0,.122,.0,.035,.012,.0],[0,.112,.2,.03,.012,0],[0,.095,.4,.028,.012,0],[0,.08,.54,.04,.012,0]],8,3,{caps:true}),fm,0,0,0,head);}
  }
  const ears=[];
  for(const s of [1,-1]){
    const e=mesh(G.cone(.045,.17,10),coat,s*.065,.13,-.03,head); e.rotation.set(-.85,0,-s*.28); e.scale.z=.6; ears.push(e);
    const ey=mesh(G.sph(.027,12,10),eyeM,s*.102,.07,.1,head); ey.scale.set(.7,1,1.15);
    const lid=mesh(G.sph(.031,12,8,),coat,s*.1,.083,.1,head); lid.scale.set(.75,.45,1.2);
    const n=mesh(G.sph(.02,10,8),eyeM,s*.043,-.025,.632,head); n.scale.set(1,.6,.6);
  }
  mesh(G.box(.1,.006,.06),eyeM,0,-.092,.58,head);
  for(let i=0;i<4;i++){const f=mesh(G.box(.035,.012,.17),hairM,(i-1.5)*.02,.13,.035,head);f.rotation.x=-.12;}
  const mouth=new THREE.Object3D(); mouth.position.set(0,-.075,.55); head.add(mouth);
  const bitL=new THREE.Object3D(); bitL.position.set(.08,-.07,.535); head.add(bitL);
  const bitR=new THREE.Object3D(); bitR.position.set(-.08,-.07,.535); head.add(bitR);
  const chin=new THREE.Object3D(); chin.position.set(0,-.16,.34); head.add(chin);

  /* ---- coda ---- */
  const tail=new THREE.Group(); tail.position.set(0,1.41-PY,-1.06); tail.rotation.x=.3; pivot.add(tail);
  mesh(loft([[0,.04,.03,.07],[0,-.1,-.02,.065],[0,-.26,-.04,.045]],10,3),coat,0,0,0,tail);
  const strands=[];
  for(let i=0;i<(opt.lite?6:14);i++){
    const g=new THREE.Group(); g.position.set((Math.random()-.5)*.06,-.08-Math.random()*.16,-.03); tail.add(g);
    const L=.7+Math.random()*.28;
    mesh(loft([[0,0,0,.03,.03,.03],[0,-L*.35,-.015,.038,.038,.038],[0,-L*.75,0,.03,.03,.03],[0,-L,.01,.006,.006,.006]],7,3),hairM,0,0,0,g);
    g.rotation.z=(Math.random()-.5)*.14; g.rotation.x=(Math.random()-.5)*.1;
    strands.push({g,ph:Math.random()*TAU,rz:g.rotation.z,rx:g.rotation.x});
  }

  /* ---- zampe ---- */
  const legs=[];
  const LEGS=[[.19,1.0,.58,1],[-.19,1.0,.58,1],[.2,1.06,-.68,0],[-.2,1.06,-.68,0]];
  LEGS.forEach(([x,y,z,front],i)=>{
    const hip=new THREE.Group(); hip.position.set(x,y-PY,z); pivot.add(hip);
    const up=front?[[0,.14,0,.1,.11,.11],[0,.04,0,.115,.12,.14],[0,-.15,0,.085,.08,.1],[0,-.36,0,.055,.055,.06],[0,-.44,0,.06,.06,.065]]
                  :[[0,.2,0,.11,.14,.14],[0,.08,0,.12,.16,.17],[0,-.15,0,.085,.1,.13],[0,-.38,0,.055,.05,.08],[0,-.48,0,.06,.05,.09]];
    mesh(loft(up,14,3),coat,0,0,0,hip);
    const kneeY=front?-.44:-.48;
    const knee=new THREE.Group(); knee.position.y=kneeY; hip.add(knee);
    const lo=front?[[0,.03,0,.06,.06,.065],[0,-.06,0,.046,.042,.05],[0,-.26,0,.043,.04,.05],[0,-.32,0,.055,.05,.065],[0,-.4,.01,.046,.046,.046],[0,-.45,.02,.05,.05,.05]]
                  :[[0,.03,0,.06,.06,.08],[0,-.08,0,.048,.044,.055],[0,-.3,0,.044,.04,.05],[0,-.36,0,.056,.05,.065],[0,-.44,.01,.046,.046,.046],[0,-.49,.02,.05,.05,.05]];
    const white=def.socks&&def.socks[i];
    mesh(loft(lo,14,3),white?sock:legDark,0,0,0,knee);
    const hy=front?-.5:-.54;
    const hoof=mesh(G.cyl(.052,.068,.1,16),hoofM,0,hy,.025,knee);
    // ciuffi sul nodello
    const fe=mesh(G.sph(.06,10,8),white?sock:(def.points?legDark:hairM),0,hy+.08,-.03,knee);fe.scale.set(.9,1,1.1);
    const wrap=mesh(G.cyl(.064,.064,.22,16),mat(0x2255aa,.8),0,hy+.27,0,knee); wrap.visible=false;
    const bH=front?0:.2, bK=front?0:-.28;
    hip.rotation.x=bH; knee.rotation.x=bK;
    legs.push({hip,knee,hoof,wrap,front:!!front,bH,bK,lastS:0,pick:0});
  });

  /* ---- finimenti ---- */
  const T={};
  const leather=mat(0x4a2614,.45), leatherD=mat(0x2b170c,.5);
  T.padMat=new THREE.MeshStandardMaterial({color:C(0x1d3f8a),roughness:.9,side:THREE.DoubleSide});
  T.pad=new THREE.Group(); pivot.add(T.pad);
  mesh(arcGeo(.448,.8,1.22,.74),T.padMat,0,1.255-PY,.06,T.pad);
  T.saddle=new THREE.Group(); pivot.add(T.saddle);
  mesh(arcGeo(.462,.54,.9,.75),mat(0x4a2614,.42,0,{side:THREE.DoubleSide}),0,1.255-PY,.06,T.saddle);
  const sy=1.585-PY;
  mesh(loft([[0,sy+.06,-.24,.13,.05,.02],[0,sy+.02,-.17,.15,.03,.03],[0,sy-.005,-.02,.15,.025,.03],[0,sy+.0,.12,.12,.03,.03],[0,sy+.03,.22,.09,.05,.03],[0,sy+.02,.27,.06,.03,.03]],18,4),leather,0,0,.04,T.saddle);
  for(const s of [1,-1]){
    const f=mesh(G.box(.02,.42,.38),leather,s*.445,1.32-PY,.13,T.saddle); f.rotation.z=s*.18;
    const kr=mesh(G.cyl(.03,.03,.36,10),leatherD,s*.455,1.36-PY,.27,T.saddle); kr.rotation.z=s*.18; kr.rotation.x=.25;
    mesh(G.box(.012,.42,.03),leatherD,s*.49,1.25-PY,.14,T.saddle).rotation.z=s*.04;
    const st=mesh(G.tor(.055,.009,6,16),metal,s*.505,1.03-PY,.14,T.saddle); st.rotation.y=Math.PI/2;
    mesh(G.box(.02,.012,.1),metal,s*.505,.978-PY,.14,T.saddle);
  }
  T.girth=new THREE.Group(); pivot.add(T.girth);
  mesh(arcGeo(.445,.11,1.25,.98,true),mat(0x222222,.6,0,{side:THREE.DoubleSide}),0,1.27-PY,.3,T.girth);
  // briglia
  T.bridle=new THREE.Group(); head.add(T.bridle);
  const strap=(r,z,y,sy,sz)=>{const m=mesh(G.tor(r,.011,6,28),leatherD,0,y,z,T.bridle);m.scale.set(1,sy||1,1);return m;};
  strap(.097,.42,-.012,.98); strap(.13,-.06,.01,1.1);
  const brow=mesh(G.tor(.12,.01,6,20,Math.PI),mat(0xe8e8f0,.3,.6),0,.03,-.01,T.bridle); brow.rotation.x=-.4;
  for(const s of [1,-1]){
    const ch=mesh(G.box(.012,.014,.46),leatherD,s*.112,-.02,.22,T.bridle); ch.rotation.x=-.04; ch.rotation.y=-s*.05;
    const ring=mesh(G.tor(.03,.006,6,14),metal,s*.083,-.07,.535,T.bridle); ring.rotation.y=Math.PI/2;
  }
  // capezza
  T.halterMat=mat(0xe0487f,.7);
  T.halter=new THREE.Group(); head.add(T.halter);
  {const m=mesh(G.tor(.105,.016,6,28),T.halterMat,0,-.02,.36,T.halter);m.scale.set(1,1.02,1);
   mesh(G.tor(.135,.016,6,28),T.halterMat,0,.0,-.05,T.halter).scale.set(1,1.1,1);
   for(const s of [1,-1]){const c=mesh(G.box(.016,.016,.42),T.halterMat,s*.118,-.04,.16,T.halter);c.rotation.x=.05;}
   const ring=mesh(G.tor(.022,.006,6,14),metal,0,-.135,.33,T.halter);}
  // redini (linee)
  const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(12),3));
  H.reins=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:C(0x2a160a)})); H.reins.frustumCulled=false; H.reins.visible=false;
  // lunghina (corda)
  const lg=new THREE.BufferGeometry(); lg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(14*3),3));
  H.rope=new THREE.Line(lg,new THREE.LineBasicMaterial({color:C(0x3355cc)})); H.rope.frustumCulled=false; H.rope.visible=false;

  // ancoraggio sella per Giorgia
  const seat=new THREE.Object3D(); seat.position.set(0,1.61-PY,.03); pivot.add(seat);

  EQ.mergeStatic(head,ears);EQ.mergeStatic(neck);[T.pad,T.saddle,T.girth,T.bridle,T.halter].forEach(g=>EQ.mergeStatic(g));
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});

  if(def.pony)root.scale.setScalar(def.pony);
  Object.assign(H,{root,pivot,neck,head,tail,strands,legs,ears,mouth,bitL,bitR,chin,seat,T,
    anim:{phase:Math.random()*10,amp:0,knee:0,ja:0,offs:GAITS[0].offs.slice(),earT:0,neckX:0,headX:1.05,shake:0,eat:0,t:Math.random()*100},
    tack:{halter:false,pad:false,saddle:false,girth:false,bridle:false,wraps:false,padColor:0x1d3f8a,wrapColor:0x2255aa,halterColor:0xe0487f},
    dirt:[],wet:0});

  H.setTack=function(t){
    Object.assign(H.tack,t||{});const k=H.tack;
    T.halter.visible=!!k.halter; T.pad.visible=!!k.pad; T.saddle.visible=!!k.saddle; T.girth.visible=!!k.girth; T.bridle.visible=!!k.bridle;
    T.padMat.color.copy(C(k.padColor)); T.halterMat.color.copy(C(k.halterColor));
    legs.forEach(l=>{l.wrap.visible=!!k.wraps;l.wrap.material=mat(k.wrapColor,.85);});
  };
  H.setTack({});

  /* ---- sporco (fango) ---- */
  const dirtTargets=[{m:body,w:5,minY:-1},...legs.map(l=>({m:l.knee.children[0],w:1.6,minY:-1})),...legs.map(l=>({m:l.hip.children[0],w:.8,minY:-1}))];
  H.addDirt=function(n){
    for(let i=0;i<n;i++){
      let r=Math.random()*dirtTargets.reduce((a,b)=>a+b.w,0), tg=dirtTargets[0];
      for(const d of dirtTargets){r-=d.w;if(r<=0){tg=d;break;}}
      const g=tg.m.geometry, pa=g.attributes.position, na=g.attributes.normal;
      let vi=0,tries=0; do{vi=Math.random()*pa.count|0;tries++;}while(tries<20&&Math.abs(na.getY(vi))>.75);
      const p=new V3(pa.getX(vi),pa.getY(vi),pa.getZ(vi)), nn=new V3(na.getX(vi),na.getY(vi),na.getZ(vi)).normalize();
      const s=(tg.m===body?.18:.1)+Math.random()*.12;
      const d=new THREE.Mesh(new THREE.PlaneGeometry(s,s),mudMatBase.clone());
      d.position.copy(p).addScaledVector(nn,.006); d.quaternion.setFromUnitVectors(new V3(0,0,1),nn); d.rotateZ(Math.random()*TAU);
      d.userData.v=1; d.renderOrder=2; tg.m.add(d); H.dirt.push(d);
    }
  };
  H.clearDirt=function(){H.dirt.forEach(d=>{d.parent.remove(d);d.material.dispose();d.geometry.dispose();});H.dirt=[];};
  H.dirtLeft=function(){return H.dirt.reduce((a,d)=>a+d.userData.v,0);};
  const wp=new V3();
  H.scrub=function(sx,sy,rad,amt){
    let got=0;
    for(const d of H.dirt){if(d.userData.v<=0)continue;d.getWorldPosition(wp);const s=EQ.toScreen(wp);
      if(s.z<1&&Math.hypot(s.x-sx,s.y-sy)<rad){const before=d.userData.v;d.userData.v=Math.max(0,before-amt);d.material.opacity=d.userData.v;d.visible=d.userData.v>.02;got+=before-d.userData.v;}}
    return got;
  };
  H.setWet=function(w){H.wet=U.clamp(w,0,1);coat.color.setScalar(1-.38*H.wet);coat.roughness=.5-.2*H.wet;};

  /* ---- animazione ---- */
  const tv=new V3(),tv2=new V3(),tv3=new V3();
  H.animate=function(dt,st){
    st=st||{};
    const A=H.anim, sp=st.speed||0, air=!!st.air;
    A.t+=dt;
    const gi=sp<2.6?0:sp<7.4?1:2, Gt=GAITS[gi];
    for(let i=0;i<4;i++)A.offs[i]+=U.wrapA(Gt.offs[i]-A.offs[i])*Math.min(1,dt*6);
    const freq=.55+.28*Math.min(sp,6)+.035*Math.max(0,sp-6);
    if(!air)A.phase+=TAU*freq*dt*Math.min(1,sp/.5);
    const mov=U.clamp(sp/1,0,1);
    A.amp=U.lerp(A.amp,Gt.amp*mov,Math.min(1,dt*5)); A.knee=U.lerp(A.knee,Gt.knee*mov,Math.min(1,dt*5));
    A.ja=U.lerp(A.ja,air?1:0,Math.min(1,dt*(air?9:7)));
    const ja=A.ja,p=A.phase;
    legs.forEach((L,i)=>{
      const ph=p+A.offs[i], s=Math.sin(ph), c=Math.cos(ph);
      const a=s*A.amp, k=Math.max(0,-c)*A.knee;
      let hip,kn;
      if(L.front){hip=a-.02;kn=k;} else {hip=L.bH+a*.9;kn=L.bK-k*.85;}
      let jh,jk; if(L.front){jh=-1.0;jk=2.0;} else {jh=(st.vy||0)>0?.05:.75;jk=(st.vy||0)>0?-1.25:-.45;}
      hip=U.lerp(hip,jh,ja); kn=U.lerp(kn,jk,ja);
      L.pick=U.lerp(L.pick,st.pick===i?1:0,Math.min(1,dt*6));
      if(L.pick>.001){hip=U.lerp(hip,L.front?.25:-.05,L.pick);kn=U.lerp(kn,L.front?1.75:-1.6,L.pick);}
      L.hip.rotation.x=hip; L.knee.rotation.x=kn;
      if(!air&&sp>.35&&L.lastS>0&&s<=0&&H.onStep)H.onStep(i,sp);
      L.lastS=s;
    });
    // corpo
    let bob=0,pitch=0;
    if(gi===1)bob=Math.abs(Math.cos(p))*.055*mov;
    else if(gi===2){bob=Math.sin(p+.8)*.07*mov;pitch=Math.sin(p)*.055*mov;}
    else bob=Math.abs(Math.sin(p))*.014*mov;
    const jp=U.clamp(-(st.vy||0)*.05,-.38,.32)*ja;
    pivot.position.y=PY+bob-(st.sink||0);
    pivot.rotation.x=U.lerp(pivot.rotation.x,pitch+jp-(st.slope||0),Math.min(1,dt*10));
    A.shake=Math.max(0,A.shake-dt*.7);
    pivot.rotation.z=U.lerp(pivot.rotation.z,U.clamp(-(st.turn||0)*sp*.012,-.12,.12),Math.min(1,dt*5))+Math.sin(A.t*32)*.07*Math.min(1,A.shake*2);
    // collo e testa
    let nb=gi===2?.2+Math.sin(p+1)*.09:gi===1?.06+Math.sin(2*p)*.03:Math.sin(2*p)*.07*mov;
    const idle=sp<.3?Math.sin(A.t*.7)*.05+(Math.sin(A.t*.21)>.93?-.2:0):0;
    A.eat=U.lerp(A.eat,st.eat||0,Math.min(1,dt*2.5));
    nb=U.lerp(nb+idle,-.2,ja);
    nb=U.lerp(nb,st.graze?1.35:.95,A.eat);
    neck.rotation.x=U.lerp(neck.rotation.x,nb+(st.neckX||0),Math.min(1,dt*6));
    neck.rotation.y=U.lerp(neck.rotation.y,(st.turn||0)*.2+(st.lookY||0)+(sp<.3?Math.sin(A.t*.33)*.12:0),Math.min(1,dt*3));
    head.rotation.x=U.lerp(head.rotation.x,1.05+A.eat*.15+(st.headX||0)+(A.eat>.5?Math.sin(A.t*9)*.03:0),Math.min(1,dt*6));
    // orecchie
    A.earT-=dt; if(A.earT<0){A.earT=1+Math.random()*4;A.earF=Math.random()<.5?0:(Math.random()<.5?1:2);}
    ears.forEach((e,i)=>{const tgt=-.85+((A.earF===1||A.earF===2&&i===0)?.5:0)+(sp>8?.35:0);e.rotation.x=U.lerp(e.rotation.x,tgt,Math.min(1,dt*8));});
    // coda
    tail.rotation.x=U.lerp(tail.rotation.x,(gi===2?.85:gi===1?.5:.3)+ja*.4,Math.min(1,dt*4));
    tail.rotation.z=Math.sin(A.t*(sp<.3?1.3:3))*(sp<.3?.22:.07);
    strands.forEach(s=>{s.g.rotation.z=s.rz+Math.sin(A.t*2.3+s.ph)*.05;s.g.rotation.x=s.rx+(gi===2?.25:0)+Math.sin(A.t*3+s.ph)*.04*mov;});
  };
  /* redini e corda: da chiamare dopo aggiornamento matrici */
  H.updateReins=function(hL,hR){
    const pa=H.reins.geometry.attributes.position;
    H.bitL.getWorldPosition(tv); H.bitR.getWorldPosition(tv2);
    pa.setXYZ(0,tv.x,tv.y,tv.z); pa.setXYZ(1,hL.x,hL.y,hL.z); pa.setXYZ(2,tv2.x,tv2.y,tv2.z); pa.setXYZ(3,hR.x,hR.y,hR.z); pa.needsUpdate=true;
  };
  H.updateRope=function(hand){
    const pa=H.rope.geometry.attributes.position;
    (H.tack.bridle&&!H.tack.halter?H.bitL:H.chin).getWorldPosition(tv);
    const n=14, d=tv.distanceTo(hand), sag=Math.max(.05,1.6-d)*.35;
    for(let i=0;i<n;i++){const t=i/(n-1);tv3.lerpVectors(tv,hand,t);tv3.y-=Math.sin(t*Math.PI)*sag;pa.setXYZ(i,tv3.x,tv3.y,tv3.z);}
    pa.needsUpdate=true;
  };
  return H;
};

/* testa e collo che si affacciano dalla porta del box */
EQ.buildHorseHead=function(def){
  const H=EQ.buildHorse(def,{lite:true});
  const neck=H.neck;H.pivot.remove(neck);neck.position.set(0,0,0);neck.rotation.set(0,0,0);
  const root=new THREE.Group();root.add(neck);
  return {root,neck,head:H.head,ears:H.ears,t:Math.random()*20,bt:0,ly:0,lx:0};
};

/* ================= GIORGIA ================= */
EQ.OUTFIT_OPTS={
  helmet:{label:'Casco',icon:'⛑️',opts:[[null,'Nessuno'],[0x1b1b22,'Nero'],[0x1f3b7a,'Blu'],[0xe86aa6,'Rosa'],[0xf5f5f5,'Bianco']]},
  protector:{label:'Corpetto',icon:'🦺',opts:[[null,'Nessuno'],[0x222226,'Nero'],[0x23407f,'Blu'],[0x7b3fb0,'Viola'],[0xe25d9a,'Rosa']]},
  top:{label:'Maglia',icon:'👕',opts:[['polo:0x1c2a55','Maglia blu scuro'],['polo:0xffffff','Polo bianca'],['polo:0xf08cb8','Polo rosa'],['polo:0x3fae7a','Polo verde'],['giacca:0x1c2a55','Giacca blu'],['giacca:0x5b2a86','Giacca viola'],['giacca:0x111111','Giacca nera']]},
  pants:{label:'Pantaloni',icon:'👖',opts:[[0xf4f4f2,'Bianchi'],[0xd9c7a5,'Beige'],[0x2a2a30,'Neri'],[0x2c3e66,'Blu']]},
  boots:{label:'Stivali',icon:'👢',opts:[[0x141414,'Neri'],[0x5a3418,'Marroni']]},
  gloves:{label:'Guanti',icon:'🧤',opts:[[null,'Nessuno'],[0x1a1a1a,'Neri'],[0xf2f2f2,'Bianchi'],[0xe86aa6,'Rosa']]},
  whip:{label:'Frustino',icon:'🪄',opts:[[false,'No'],[true,'Sì']]},
};
EQ.buildGiorgia=function(){
  const cheeks=[];
  const P={};
  const root=new THREE.Group();
  const skin=mat(0xd9a07a,.7), hair=mat(0x6a3c1c,.55), eyeW=mat(0xf4f4f4,.25), iris=mat(0x4a2e1a,.1), lip=mat(0xc8566e,.5), brow=mat(0x4a2a14,.7);
  const M={pants:mat(0xf4f4f2,.8),boots:mat(0x141414,.35),top:mat(0xffffff,.75),sleeve:mat(0xffffff,.75),gloves:mat(0x1a1a1a,.6),helmet:mat(0x1b1b22,.35),prot:mat(0x23407f,.7)};
  // clona per poterli cambiare
  for(const k in M)M[k]=M[k].clone();
  const pelvis=new THREE.Group(); pelvis.position.y=.9; root.add(pelvis);
  const pm=mesh(G.sph(.14,18,12),M.pants,0,.0,0,pelvis); pm.scale.set(1,.72,.8);
  const legs=[];
  for(const s of [1,-1]){
    const th=new THREE.Group(); th.position.set(s*.085,-.02,0); pelvis.add(th);
    mesh(loft([[0,.04,0,.08,.085,.085],[0,-.2,0,.068,.07,.07],[0,-.42,0,.05,.05,.052]],14,3),M.pants,0,0,0,th);
    const kn=new THREE.Group(); kn.position.y=-.42; th.add(kn);
    mesh(loft([[0,.03,0,.056,.058,.056],[0,-.12,0,.054,.05,.06],[0,-.38,0,.04,.04,.04]],14,3),M.boots,0,0,0,kn);
    const an=new THREE.Group(); an.position.y=-.4; kn.add(an);
    mesh(loft([[0,-.01,-.05,.042,.04,.03],[0,-.035,.05,.042,.03,.035],[0,-.05,.13,.032,.015,.02]],12,3),M.boots,0,0,0,an);
    legs.push({th,kn,an,s});
  }
  const torso=new THREE.Group(); torso.position.y=.05; pelvis.add(torso);
  const tS=[[0,0,0,.135,.1,.1],[0,.12,0,.124,.092,.095],[0,.26,.004,.148,.105,.112],[0,.38,0,.165,.1,.1],[0,.44,0,.12,.07,.07],[0,.475,0,.05,.04,.04]];
  mesh(loft(tS,18,3),M.top,0,0,0,torso);
  const jacketTail=mesh(G.box(.27,.18,.08),M.top,0,-.04,-.085,torso);
  const collar=mesh(G.cyl(.06,.065,.05,14),mat(0xffffff,.7),0,.47,.0,torso);
  // corpetto (protezione) con segmenti
  const protTex=EQ.canvasTex(64,256,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.25)';for(let y=20;y<h;y+=34)g.fillRect(0,y,w,4);});
  M.prot.map=protTex; M.prot.needsUpdate=true;
  const prot=mesh(loft([[0,.03,0,.157,.122,.128],[0,.15,0,.148,.116,.122],[0,.27,.004,.17,.127,.134],[0,.38,0,.182,.12,.12],[0,.425,0,.16,.1,.1]],18,3,{caps:false}),M.prot,0,0,0,torso);
  prot.material.side=THREE.DoubleSide;
  mesh(G.cyl(.05,.045,.1,12),skin,0,.52,0,torso);
  const head=new THREE.Group(); head.position.y=.64; torso.add(head);
  const hm=mesh(G.sph(.1,22,16),skin,0,0,0,head); hm.scale.set(1,1.15,1.08);
  mesh(G.sph(.045,12,10),skin,0,-.07,.045,head).scale.set(1.25,.8,1);
  for(const s of [1,-1]){
    const e=mesh(G.sph(.021,12,10),eyeW,s*.037,.012,.088,head); e.scale.set(1,1,.6);
    mesh(G.sph(.0125,10,8),iris,s*.037,.012,.1,head);
    const b=mesh(G.box(.036,.007,.01),brow,s*.04,.048,.097,head); b.rotation.z=s*.12;
    mesh(G.sph(.02,10,8),skin,s*.1,-.005,0,head).scale.set(.5,1,.8);
    const ch=mesh(G.sph(.022,10,8),mat(0xf29a9a,.7),s*.06,-.03,.085,head); ch.scale.set(1,.7,.4);cheeks.push(ch);
  }
  mesh(G.sph(.016,10,8),skin,0,-.012,.11,head);
  const mo=mesh(G.tor(.018,.0045,6,12,Math.PI),lip,0,-.048,.094,head); mo.rotation.z=Math.PI;
  // capelli
  const hb=mesh(new THREE.SphereGeometry(.108,20,14,Math.PI,Math.PI),hair,0,.012,-.008,head); hb.scale.set(1.04,1.14,1.1);
  const ht=mesh(new THREE.SphereGeometry(.108,20,10,0,TAU,0,1.05),hair,0,.018,0,head); ht.scale.set(1.04,1.12,1.1);
  const fr=mesh(G.box(.15,.03,.03),hair,0,.078,.083,head); fr.rotation.x=.4;
  const pony=new THREE.Group(); pony.position.set(0,.03,-.11); head.add(pony);
  mesh(G.tor(.028,.012,6,12),mat(0xe25d9a,.5),0,0,0,pony).rotation.x=Math.PI/2;
  mesh(loft([[0,.01,0,.035],[0,-.08,-.04,.045],[0,-.2,-.05,.04],[0,-.32,-.03,.015]],12,3),hair,0,0,0,pony);
  // casco
  const helmet=new THREE.Group(); head.add(helmet);
  const dome=mesh(new THREE.SphereGeometry(.128,24,14,0,TAU,0,Math.PI*.54),M.helmet,0,.03,-.008,helmet); dome.scale.set(1,1.02,1.1);
  const peak=mesh(loft([[-.07,0,0,.002,.005,.005],[0,0,.0,.002,.006,.006],[.07,0,0,.002,.005,.005]].map(s=>[s[0],s[1],s[2],.002,.006,.006]),6,2),M.helmet,0,0,0,helmet);
  helmet.remove(peak);
  const vis=mesh(G.cyl(.13,.13,.012,20,false),M.helmet,0,.04,.07,helmet); vis.scale.set(1,1,.55); vis.rotation.x=.18;
  mesh(G.box(.02,.012,.26),mat(0xd9d9d9,.3,.6),0,.162,-.01,helmet);
  const harness=mesh(G.tor(.105,.005,6,24),mat(0x111111,.6),0,-.04,.0,helmet); harness.rotation.y=Math.PI/2; harness.scale.set(1,1.25,1);
  // braccia
  const arms=[];
  for(const s of [1,-1]){
    const sh=new THREE.Group(); sh.position.set(s*.172,.4,0); torso.add(sh);
    mesh(G.sph(.05,12,10),M.top,0,0,0,sh);
    mesh(loft([[0,.01,0,.048],[0,-.13,0,.042],[0,-.26,0,.037]],12,3),M.top,0,0,0,sh);
    const el=new THREE.Group(); el.position.y=-.26; sh.add(el);
    mesh(loft([[0,.01,0,.036],[0,-.12,0,.033],[0,-.22,0,.027]],12,3),M.sleeve,0,0,0,el);
    const hand=new THREE.Group(); hand.position.y=-.235; el.add(hand);
    const hmm=mesh(G.sph(.035,12,10),M.gloves,0,-.02,0,hand); hmm.scale.set(.8,1.3,.65);
    const th=mesh(G.sph(.014,8,6),M.gloves,-s*.0,-.01,.025,hand); th.scale.set(1,1.6,1);
    arms.push({sh,el,hand,s});
  }
  // frustino nella mano destra
  const whip=new THREE.Group(); arms[1].hand.add(whip);
  mesh(G.cyl(.007,.004,.68,6),mat(0x111111,.4),0,-.02,.0,whip).position.set(0,-.02,0);
  whip.children[0].geometry.translate(0,.3,0);
  mesh(G.box(.012,.04,.025),mat(0x111111,.4),0,.65,0,whip);
  whip.rotation.set(1.9,0,0);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});

  P.root=root; P.pelvis=pelvis; P.torso=torso; P.head=head; P.legs=legs; P.arms=arms; P.pony=pony; P.helmet=helmet; P.prot=prot; P.whip=whip;
  P.handL=arms[0].hand; P.handR=arms[1].hand;
  P.outfit={helmet:null,protector:null,top:'polo:0x1c2a55',pants:0x2a2a30,boots:0x141414,gloves:null,whip:false};
  P.setOutfit=function(o){
    Object.assign(P.outfit,o||{}); const f=P.outfit;
    helmet.visible=f.helmet!=null; if(f.helmet!=null)M.helmet.color.copy(C(f.helmet));
    ht.visible=f.helmet==null; fr.visible=true;
    prot.visible=f.protector!=null; if(f.protector!=null)M.prot.color.copy(C(f.protector));
    const [style,col]=String(f.top).split(':'); const c=parseInt(col);
    M.top.color.copy(C(c)); M.sleeve.color.copy(style==='giacca'?C(c):skin.color); M.sleeve.roughness=style==='giacca'?.75:.6;
    jacketTail.visible=style==='giacca'; collar.visible=true;
    M.pants.color.copy(C(f.pants)); M.boots.color.copy(C(f.boots));
    M.gloves.color.copy(f.gloves!=null?C(f.gloves):skin.color);
    whip.visible=!!f.whip;
  };
  P.setOutfit({});
  P.setGender=function(g){P.gender=g;const m=g==='m';pony.visible=!m;cheeks.forEach(c=>c.visible=!m);
    hb.scale.set(1.04,m?.92:1.14,m?1.02:1.1);hb.position.y=m?.03:.012;mo.material=mat(m?0xa86a60:0xc8566e,.5);};
  P.setGender('f');
  P.ready=function(){return P.outfit.helmet!=null&&P.outfit.protector!=null;};

  /* pose */
  const J={pelY:.9,torsoX:0,torsoZ:0,headX:0,headY:0,th:[[0,0,0],[0,0,0]],kn:[0,0],an:[0,0],sh:[[0,0,.08],[0,0,-.08]],el:[[-.15,0],[-.15,0]]};
  P.J=J; P.phase=0;
  const L=(o,k,v,t)=>{o[k]=U.lerp(o[k],v,t);};
  P.pose=function(dt,name,p){
    p=p||{}; const t=Math.min(1,dt*(p.snap?60:10));
    const tg={pelY:.9,torsoX:.02,torsoZ:0,headX:0,headY:0,th:[[0,0,0],[0,0,0]],kn:[0,0],an:[0,0],sh:[[.05,0,.1],[.05,0,-.1]],el:[[-.12,0],[-.12,0]]};
    const time=performance.now()/1000;
    if(name==='walk'||name==='lead'||name==='carry'){
      const sp=p.speed||0; P.phase+=dt*(2.2+sp*1.9)*Math.min(1,sp/.3);
      const ph=P.phase, a=Math.min(1,sp/1.2)*(sp>2.5?.75:.5);
      tg.th[0][0]=-Math.sin(ph)*a; tg.th[1][0]=Math.sin(ph)*a;
      tg.kn[0]=Math.max(0,Math.cos(ph))*a*1.9; tg.kn[1]=Math.max(0,-Math.cos(ph))*a*1.9;
      tg.sh[0][0]=Math.sin(ph)*a*.9; tg.sh[1][0]=-Math.sin(ph)*a*.9;
      tg.el[0][0]=-.3-(sp>2.5?.9:0); tg.el[1][0]=-.3-(sp>2.5?.9:0);
      tg.pelY=.9-Math.abs(Math.sin(ph))*.02*Math.min(1,sp)+(sp>2.5?Math.abs(Math.cos(ph))*.04:0)-(sp>2.5?.02:0);
      tg.torsoX=.03+(sp>2.5?.12:0);
      if(name==='lead'){tg.sh[1]=[-.35,0,-.25];tg.el[1]=[-.5,0];}
      if(name==='carry'){tg.sh[0]=[-.9,0,.2];tg.sh[1]=[-.9,0,-.2];tg.el[0]=[-.9,0];tg.el[1]=[-.9,0];}
    } else if(name==='pedal'||name==='moto'||name==='scooter'||name==='drive'){
      if(name==='pedal'){P.phase+=dt*(p.speed||0)*1.3;const ph=P.phase;tg.pelY=.93;tg.torsoX=.45;tg.th[0]=[-1.0+Math.sin(ph)*.45,0,.06];tg.th[1]=[-1.0-Math.sin(ph)*.45,0,-.06];tg.kn[0]=1.2+Math.cos(ph)*.4;tg.kn[1]=1.2-Math.cos(ph)*.4;tg.sh=[[-1.15,0,.12],[-1.15,0,-.12]];tg.el=[[-.2,0],[-.2,0]];}
      else if(name==='moto'){tg.pelY=.86;tg.torsoX=.5;tg.th=[[-1.35,0,.32],[-1.35,0,-.32]];tg.kn=[1.9,1.9];tg.sh=[[-1.2,0,.18],[-1.2,0,-.18]];tg.el=[[-.25,0],[-.25,0]];}
      else if(name==='scooter'){tg.pelY=.9;tg.torsoX=.12;tg.th=[[-.05,0,.04],[.15,0,-.04]];tg.kn=[.1,.15];tg.sh=[[-1.0,0,.15],[-1.0,0,-.15]];tg.el=[[-.35,0],[-.35,0]];}
      else {tg.pelY=.5;tg.torsoX=-.05;tg.th=[[-1.4,0,.08],[-1.4,0,-.08]];tg.kn=[1.25,1.25];tg.sh=[[-1.05,0,.2],[-1.05,0,-.2]];tg.el=[[-.55,0],[-.55,0]];}
      tg.sh[0][0]+=(p.steer||0)*.15;tg.sh[1][0]-=(p.steer||0)*.15;
    } else if(name==='ride'){
      const lean=p.lean||.1;
      tg.pelY=.9; tg.torsoX=lean; tg.headX=-lean*.7;
      for(let i=0;i<2;i++){const s=i?-1:1;tg.th[i]=[-1.18-(p.jump||0)*.25,0,s*.58];tg.kn[i]=1.55+(p.jump||0)*.3;tg.an[i]=-.35;}
      tg.sh[0]=[-.62,0,.12];tg.sh[1]=[-.62,0,-.12];tg.el[0]=[-1.05,-.2];tg.el[1]=[-1.05,.2];
      tg.pelY+=p.bob||0;
    } else if(name==='brush'){
      tg.sh[1]=[-1.15+Math.sin(time*9)*.25,0,-.25+Math.cos(time*9)*.15];tg.el[1]=[-.35,0];tg.torsoX=.1;
    } else if(name==='feed'){
      tg.sh[1]=[-1.35,0,-.1];tg.el[1]=[-.15,0];tg.torsoX=.05;
    } else if(name==='spray'){
      tg.sh[1]=[-1.0+Math.sin(time*2)*.1,0,-.2];tg.el[1]=[-.4,0];tg.sh[0]=[-.5,0,.2];tg.el[0]=[-.9,0];
    } else if(name==='pick'){
      tg.pelY=.62;tg.th[0]=[-1.2,0,.15];tg.th[1]=[-.6,0,-.15];tg.kn[0]=1.9;tg.kn[1]=1.3;tg.torsoX=.6;tg.sh[1]=[-1.1+Math.sin(time*10)*.2,0,-.1];tg.el[1]=[-.6,0];tg.sh[0]=[-1.0,0,.1];tg.el[0]=[-.4,0];
    } else if(name==='mirror'){
      tg.sh[0]=[0,0,.35+Math.sin(time*1.5)*.05];tg.sh[1]=[0,0,-.35];tg.el[0]=[-.2,0];tg.el[1]=[-.2,0];tg.headY=Math.sin(time*.8)*.25;
    } else if(name==='swim'){
      const k=Math.sin(time*4);tg.sh=[[-1.5+k*1.3,0,.35],[-1.5-k*1.3,0,-.35]];tg.el=[[-.3,0],[-.3,0]];tg.th=[[k*.35,0,.05],[-k*.35,0,-.05]];tg.torsoX=.3;tg.headX=-.3;
    } else if(name==='sit'){
      tg.pelY=.5;tg.th=[[-1.5,0,.08],[-1.5,0,-.08]];tg.kn=[1.5,1.5];tg.torsoX=.08;tg.sh=[[-.75,0,.18],[-.75,0,-.18]];tg.el=[[-.5,0],[-.5,0]];
      if(p.talk){tg.sh[1]=[-.9+Math.sin(time*5)*.2,0,-.3];}
    } else if(name==='pet'){
      tg.sh[1]=[-1.85+Math.sin(time*5)*.18,0,-.2+Math.cos(time*5)*.08];tg.el[1]=[-.25,0];tg.torsoX=.06;tg.headX=-.2;
    } else if(name==='petlow'){
      tg.pelY=.55;tg.th=[[-1.6,0,.2],[-1.0,0,-.2]];tg.kn=[2.0,1.6];tg.torsoX=.55;tg.sh[1]=[-1.0+Math.sin(time*5)*.2,0,-.15];tg.el[1]=[-.4,0];
    } else if(name==='talk'){
      tg.sh[1]=[-.6+Math.sin(time*4)*.25,0,-.25];tg.el[1]=[-.8,0];tg.sh[0]=[-.3+Math.cos(time*3)*.15,0,.2];tg.headY=Math.sin(time*2)*.1;
    } else if(name==='play'){
      const k=Math.abs(Math.sin(time*6));tg.pelY=.9+k*.12;tg.sh=[[-2.6+k*.4,0,.5],[-2.6+k*.4,0,-.5]];tg.el=[[-.2,0],[-.2,0]];
    } else if(name==='piano'){
      tg.pelY=.5;tg.th=[[-1.5,0,.1],[-1.5,0,-.1]];tg.kn=[1.5,1.5];tg.torsoX=.12;tg.headX=.15;
      tg.sh=[[-1.0+Math.sin(time*7)*.08,0,.25+Math.sin(time*3.1)*.2],[-1.0+Math.cos(time*8)*.08,0,-.25-Math.sin(time*2.7)*.2]];tg.el=[[-.7,0],[-.7,0]];
    } else if(name==='dance'){
      const k=Math.sin(time*7),k2=Math.sin(time*3.5);tg.pelY=.88+Math.abs(k)*.06;tg.torsoZ=k2*.15;tg.headY=k2*.3;
      tg.sh=[[-.3+k*.8,0,.6+k2*.5],[-.3-k*.8,0,-.6+k2*.5]];tg.el=[[-.8,0],[-.8,0]];tg.th=[[k*.3,0,.08],[-k*.3,0,-.08]];tg.kn=[Math.max(0,k)*.6,Math.max(0,-k)*.6];
    } else if(name==='gym'){
      const k=(Math.sin(time*6)+1)/2;tg.pelY=.9+Math.sin(time*12)*.03;tg.sh=[[0,0,.2+k*2.6],[0,0,-.2-k*2.6]];tg.el=[[-.1,0],[-.1,0]];tg.th=[[0,0,.05+k*.35],[0,0,-.05-k*.35]];
    } else if(name==='rope'){
      tg.pelY=.9;tg.sh=[[.1,0,.55],[.1,0,-.55]];tg.el=[[-.4,0],[-.4,0]];tg.kn=[.25,.25];tg.th=[[-.1,0,.04],[-.1,0,-.04]];
    } else if(name==='wave'){
      tg.sh[1]=[0,0,-2.6];tg.el[1]=[-.3+Math.sin(time*10)*.4,0];
    }
    L(J,'pelY',tg.pelY,t);L(J,'torsoX',tg.torsoX,t);L(J,'headX',tg.headX,t);L(J,'headY',tg.headY,t);
    for(let i=0;i<2;i++){for(let k=0;k<3;k++)L(J.th[i],k,tg.th[i][k],t);L(J.kn,i,tg.kn[i],t);L(J.an,i,tg.an[i],t);for(let k=0;k<3;k++)L(J.sh[i],k,tg.sh[i][k],t);for(let k=0;k<2;k++)L(J.el[i],k,tg.el[i][k],t);}
    pelvis.position.y=J.pelY; torso.rotation.x=J.torsoX; head.rotation.x=J.headX; head.rotation.y=J.headY;
    legs.forEach((l,i)=>{l.th.rotation.set(J.th[i][0],J.th[i][1],J.th[i][2]);l.kn.rotation.x=J.kn[i];l.an.rotation.x=J.an[i];});
    arms.forEach((a,i)=>{a.sh.rotation.set(J.sh[i][0],J.sh[i][1],J.sh[i][2]);a.el.rotation.set(J.el[i][0],J.el[i][1],0);});
    whip.rotation.x=U.lerp(whip.rotation.x,name==='ride'?2.6:1.9,t);
    pony.rotation.x=.25+(p.ponyX||0)+Math.sin(time*6)*.04*(p.speed||0)/4;
    pony.rotation.z=Math.sin(time*2.3)*.1;
  };
  return P;
};
})();
