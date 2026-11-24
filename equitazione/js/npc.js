/* Giorgia a Cavallo – persone, animali e veicoli (modelli leggeri a colori per vertice) */
'use strict';
(function(){
const {U,G,mat,mesh,loft,C,V3,TAU}=EQ;
const rnd=U.rnd, pick=a=>a[Math.random()*a.length|0];
EQ.pick=pick;
const X=EQ.xform, T=EQ.tint;

EQ.NAMES_F=['Sofia','Giulia','Aurora','Alice','Ginevra','Emma','Martina','Chiara','Sara','Beatrice','Anna','Matilde','Vittoria','Noemi','Greta','Elisa','Camilla','Francesca','Bianca','Viola','Ludovica','Rebecca','Marta','Elena','Irene','Carlotta','Asia','Nicole','Arianna','Caterina'];
EQ.NAMES_M=['Leonardo','Francesco','Alessandro','Lorenzo','Mattia','Tommaso','Gabriele','Andrea','Riccardo','Edoardo','Matteo','Giuseppe','Nicolò','Pietro','Diego','Samuele','Filippo','Davide','Marco','Luca','Federico','Simone','Giovanni','Paolo','Stefano','Emanuele','Giacomo','Michele','Elia','Alberto'];
EQ.HORSE_NAMES=['Furia','Saetta','Zeus','Bucefalo','Diamante','Margherita','Brillante','Polvere','Uragano','Cometa','Fiocco','Mirtillo','Cannella','Zenzero','Rubino','Smeraldo','Aria','Tornado','Gioia','Sole','Baffo','Pepe','Ambra','Dora','Ercole','Gemma','Lampo','Nebbia','Orione','Perla','Quercia','Rocco','Astro','Brezza','Chicco','Dama'];
const usedNames=new Set();
EQ.randName=function(fem){const L=fem?EQ.NAMES_F:EQ.NAMES_M;for(let i=0;i<20;i++){const n=pick(L);if(!usedNames.has(n)){usedNames.add(n);return n;}}return pick(L);};

const SKINS=[0xf1c7a5,0xe8b896,0xd9a47c,0xc68863,0x9a6340,0x6a412a,0xffdcc0];
const HAIRS=[0x2a1a10,0x3a2414,0x4a2a14,0x6b3e1f,0x9a6a32,0xd8b46a,0x1a1a1a,0xb5541f,0xe0cfa0];
const TOPS=[0xe74c3c,0x3498db,0xf1c40f,0x2ecc71,0x9b59b6,0xffffff,0xe67e22,0x1abc9c,0xff6fa8,0x34495e,0x2c3e50,0xc0392b,0x16a085,0xf39c12,0x8e44ad,0xecf0f1,0x7f8c8d,0xd35400];
const PANTS=[0x2c3e66,0x1f2a44,0x2a2a2e,0x6b5a45,0xd9c7a5,0x4a5a3a,0x7a7a80,0x3a4a6a];
const SHOES=[0x111111,0xf2f2f2,0x5a3418,0x2a58c8,0xc0392b,0x333333];
EQ.PCOL={SKINS,HAIRS,TOPS,PANTS,SHOES};
const NPCMAT=EQ.NPCMAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.72,metalness:0});

/* ============ PERSONA ============ */
EQ.buildNPC=function(o){
  o=Object.assign({kid:false,fem:Math.random()<.5,skin:pick(SKINS),hair:pick(HAIRS),top:pick(TOPS),pants:pick(PANTS),shoes:pick(SHOES),sleeves:Math.random()<.5?'short':'long',helmet:null,cap:null,hat:null,swim:false,dress:false,s:rnd(.94,1.06),glasses:Math.random()<.15,beard:false,old:false},o||{});
  if(!o.hairStyle)o.hairStyle=o.fem?pick(['pony','long','bun','long','short2']):pick(['short','short','curly','bald','short']);
  if(o.old)o.hair=pick([0x9a9a9a,0xc8c8c8,0xe8e8e8]);
  if(o.dress&&!o.fem)o.dress=false;
  const s=o.kid?.64*o.s:o.s, hs=o.kid?1.28:1;
  const root=new THREE.Group(), hips=new THREE.Group(), spine=new THREE.Group();
  const hipY=.92*s; hips.position.y=hipY; root.add(hips); hips.add(spine);
  const sk=o.skin, topC=o.swim?sk:o.top, legC=(o.swim||o.dress)?sk:o.pants;
  const P=[];
  const sc=(g)=>{g.scale(s,s,s);return g;};
  // bacino e busto
  P.push(T(X(G.sph(.15,12,8),0,0,0,0,0,0,1*s,.72*s,.8*s),o.swim?(o.fem?o.top:o.pants):(o.dress?o.top:o.pants)));
  const tor=loft([[0,0,0,.135,.1,.1],[0,.12,0,.124,.092,.095],[0,.26,.004,o.fem?.142:.152,.105,o.fem?.118:.11],[0,.38,0,o.fem?.15:.172,.1,.1],[0,.44,0,.12,.07,.07],[0,.475,0,.05,.04,.04]],12,2);
  sc(tor);tor.translate(0,.05*s,0);P.push(T(tor,topC));
  if(o.swim&&o.fem){const b=G.cyl(.15,.15,.09,12);b.scale(1,1,.78);P.push(T(X(sc(b),0,.33*s,.005),o.top));}
  if(o.dress){const sk2=G.cyl(.15,.27,.48,14,true);P.push(T(X(sc(sk2),0,-.18*s,0),o.top));}
  if(o.lifeguard){const t=EQ.labelTex?0:0;}
  P.push(T(X(sc(G.cyl(.048,.052,.1,8)),0,.53*s,0),sk));
  // testa
  const hy=(.66+(hs-1)*.12)*s, hr=.105*hs;
  P.push(T(X(G.sph(hr,14,10),0,hy,0,0,0,0,s,1.12*s,1.06*s),sk));
  P.push(T(X(G.sph(hr*.42,8,6),0,hy-.07*s*hs,.045*s*hs,0,0,0,1.2*s,.8*s,1*s),sk));
  for(const sd of [1,-1]){
    P.push(T(X(G.sph(.017*hs,6,5),sd*.037*s*hs,hy+.015*s*hs,.096*s*hs,0,0,0,s,s,.6*s),0x1a120c));
    P.push(T(X(G.box(.034*hs,.007,.01),sd*.04*s*hs,hy+.05*s*hs,.1*s*hs,0,0,sd*.12,s,s,s),o.hair));
    P.push(T(X(G.sph(.02*hs,6,5),sd*.105*s*hs,hy,0,0,0,0,.5*s,s,.8*s),sk));
  }
  P.push(T(X(G.sph(.016*hs,6,5),0,hy-.012*s*hs,.112*s*hs,0,0,0,s,s,s),sk));
  P.push(T(X(G.box(.045*hs,.01,.01),0,hy-.05*s*hs,.1*s*hs,0,0,0,s,s,s),o.fem?0xc0506a:0x9a5a4a));
  if(o.glasses){for(const sd of [1,-1])P.push(T(X(G.tor(.022*hs,.004,4,10),sd*.04*s*hs,hy+.015*s*hs,.105*s*hs,0,0,0,s,s,s),0x111111));P.push(T(X(G.box(.03,.005,.005),0,hy+.015*s*hs,.11*s*hs,0,0,0,s,s,s),0x111111));}
  if(o.beard)P.push(T(X(G.sph(hr*.7,10,8),0,hy-.06*s*hs,.04*s*hs,0,0,0,1.15*s,.75*s,.9*s),o.hair));
  // capelli
  const hc=o.hair, H=hr*1.04;
  const back=()=>P.push(T(X(new THREE.SphereGeometry(H,14,10,Math.PI,Math.PI),0,hy+.01*s,-.008*s,0,0,0,s*1.02,1.13*s,1.1*s),hc));
  const top=(th)=>P.push(T(X(new THREE.SphereGeometry(H,14,8,0,TAU,0,th||1.05),0,hy+.016*s,0,0,0,0,s*1.03,1.13*s,1.1*s),hc));
  if(o.hairStyle!=='bald'){back();top();}else{top(.55);}
  if(o.hairStyle==='pony'){const g=loft([[0,.01,0,.035],[0,-.08,-.04,.045],[0,-.2,-.05,.04],[0,-.32,-.03,.015]],8,2);g.scale(s*hs,s*hs,s*hs);g.translate(0,hy+.03*s*hs,-.11*s*hs);P.push(T(g,hc));}
  if(o.hairStyle==='long'){const g=G.box(.2*hs,.3*hs,.06);P.push(T(X(g,0,hy-.12*s*hs,-.07*s*hs,.15,0,0,s,s,s),hc));}
  if(o.hairStyle==='bun')P.push(T(X(G.sph(.055*hs,10,8),0,hy+.1*s*hs,-.07*s*hs,0,0,0,s,s,s),hc));
  if(o.hairStyle==='curly')for(let i=0;i<8;i++){const a=i/8*TAU;P.push(T(X(G.sph(.04*hs,6,5),Math.cos(a)*.08*s*hs,hy+.08*s*hs,Math.sin(a)*.07*s*hs-.01,0,0,0,s,s,s),hc));}
  if(o.hairStyle==='short2'){const g=G.box(.2*hs,.16*hs,.05);P.push(T(X(g,0,hy-.06*s*hs,-.08*s*hs,.1,0,0,s,s,s),hc));}
  // copricapo
  if(o.helmet!=null){P.push(T(X(new THREE.SphereGeometry(.128*hs,16,10,0,TAU,0,Math.PI*.54),0,hy+.03*s,-.008*s,0,0,0,s,1.02*s,1.1*s),o.helmet));
    const v=G.cyl(.13*hs,.13*hs,.012,16);P.push(T(X(v,0,hy+.04*s,.07*s*hs,.18,0,0,s,s,.55*s),o.helmet));}
  if(o.cap!=null){P.push(T(X(new THREE.SphereGeometry(.118*hs,14,8,0,TAU,0,1.25),0,hy+.03*s,0,0,0,0,s,1.05*s,1.08*s),o.cap));
    P.push(T(X(G.box(.16*hs,.012,.12*hs),0,hy+.045*s,.12*s*hs,-.12,0,0,s,s,s),o.cap));}
  if(o.hat!=null){P.push(T(X(G.cyl(.23*hs,.23*hs,.015,18),0,hy+.07*s,0,0,0,0,s,s,s),o.hat));P.push(T(X(G.cyl(.1*hs,.12*hs,.12,14),0,hy+.12*s,0,0,0,0,s,s,s),o.hat));}
  if(o.backpack!=null){P.push(T(X(G.box(.24,.3,.12),0,.28*s,-.16*s,0,0,0,s,s,s),o.backpack));}
  const body=new THREE.Mesh(EQ.merge(P),NPCMAT);body.castShadow=true;spine.add(body);
  // gambe
  const legs=[];
  for(const sd of [1,-1]){
    const th=new THREE.Group();th.position.set(sd*.088*s,0,0);hips.add(th);
    const gT=[];const tl=sc(loft([[0,.03,0,.076],[0,-.22,0,.064],[0,-.44,0,.05]],8,2));
    if(o.swim){const sh=G.cyl(.08,.075,.12,8);gT.push(T(X(sh.scale(s,s,s)&&sh,0,-.04*s,0),o.swim&&o.fem?o.top:o.pants));}
    gT.push(T(tl,(o.dress?sk:legC)));
    if(o.shorts&&!o.swim){gT.length=0;gT.push(T(X(sc(G.cyl(.08,.07,.26,8)),0,-.1*s,0),o.pants));gT.push(T(sc(loft([[0,-.2,0,.066],[0,-.44,0,.05]],8,2)),sk));}
    const tm=new THREE.Mesh(EQ.merge(gT),NPCMAT);tm.castShadow=true;th.add(tm);
    const kn=new THREE.Group();kn.position.y=-.44*s;th.add(kn);
    const gS=[T(sc(loft([[0,.02,0,.053],[0,-.14,0,.05],[0,-.4,0,.037]],8,2)),(o.boots!=null?o.boots:(o.shorts||o.swim||o.dress)?sk:legC))];
    gS.push(T(X(sc(G.box(.09,.07,.21)),0,-.43*s,.045*s),o.swim?sk:(o.boots!=null?o.boots:o.shoes)));
    const sm=new THREE.Mesh(EQ.merge(gS),NPCMAT);sm.castShadow=true;kn.add(sm);
    legs.push({th,kn});
  }
  // braccia (un solo segmento)
  const arms=[];
  for(const sd of [1,-1]){
    const sh=new THREE.Group();sh.position.set(sd*.178*s,.44*s,0);spine.add(sh);
    const up=(o.swim||o.sleeves==='none')?sk:topC, lo=(o.sleeves==='long'&&!o.swim)?topC:sk;
    const gA=[T(X(sc(G.sph(.05,8,6)),0,0,0),up),T(sc(loft([[0,.01,0,.048],[0,-.27,0,.04]],8,2)),up),T(sc(loft([[0,-.26,0,.04],[0,-.52,0,.031]],8,2)),lo),T(X(sc(G.sph(.036,8,6)),0,-.56*s,0,0,0,0,.8*s,1.25*s,.65*s),o.gloves!=null?o.gloves:sk)];
    const am=new THREE.Mesh(EQ.merge(gA),NPCMAT);am.castShadow=true;sh.add(am);
    const hand=new THREE.Object3D();hand.position.y=-.57*s;sh.add(hand);
    arms.push({sh,hand});
  }
  const N={root,hips,spine,legs,arms,o,s,phase:Math.random()*9,J:{hy:hipY,lean:0,th:[[0,0],[0,0]],kn:[0,0],sh:[[0,0],[0,0]]}};
  N.handR=arms[1].hand;N.handL=arms[0].hand;N.headY=hipY+hy+.2*s;
  N.pose=function(dt,name,p){
    p=p||{};const t=Math.min(1,dt*(p.snap?60:9)), time=performance.now()/1000+N.phase;
    const g={hy:hipY,lean:.02,th:[[0,0],[0,0]],kn:[0,0],sh:[[.04,.1],[.04,-.1]]};
    const sp=p.speed||0;
    if(name==='walk'||name==='run'||name==='lead'||name==='push'||name==='leash'){
      N.phase+=dt*(2.2+sp*1.9)*Math.min(1,sp/.3);const ph=N.phase,a=Math.min(1,sp/1.2)*(sp>2.5?.75:.5);
      g.th[0][0]=-Math.sin(ph)*a;g.th[1][0]=Math.sin(ph)*a;g.kn[0]=Math.max(0,Math.cos(ph))*a*1.9;g.kn[1]=Math.max(0,-Math.cos(ph))*a*1.9;
      g.sh[0][0]=Math.sin(ph)*a*.9;g.sh[1][0]=-Math.sin(ph)*a*.9;g.hy=hipY-Math.abs(Math.sin(ph))*.02*Math.min(1,sp);g.lean=sp>2.5?.15:.03;
      if(name==='lead'||name==='leash')g.sh[1]=[-.4,-.2];
      if(name==='push')g.sh=[[-.75,.15],[-.75,-.15]];
    } else if(name==='ride'){
      g.lean=p.lean||.12;for(let i=0;i<2;i++){const sd=i?-1:1;g.th[i]=[-1.2,sd*.58];g.kn[i]=1.55;}g.sh=[[-.75,.12],[-.75,-.12]];g.hy=hipY+(p.bob||0);
    } else if(name==='sit'||name==='clap'||name==='cheer'){
      g.hy=.48*s;g.th=[[-1.5,.08],[-1.5,-.08]];g.kn=[1.5,1.5];g.sh=[[.15,.15],[.15,-.15]];
      if(name==='clap'){const c=Math.sin(time*14);g.sh=[[-1.0,.35+c*.25],[-1.0,-.35-c*.25]];}
      if(name==='cheer'){g.sh=[[0,2.6+Math.sin(time*8)*.2],[0,-2.6-Math.sin(time*8)*.2]];}
    } else if(name==='pedal'){
      N.phase+=dt*sp*1.2;const ph=N.phase;g.hy=hipY+.05*s;g.lean=.45;
      g.th[0]=[-1.0+Math.sin(ph)*.45,.05];g.th[1]=[-1.0-Math.sin(ph)*.45,-.05];g.kn[0]=1.2+Math.cos(ph)*.4;g.kn[1]=1.2-Math.cos(ph)*.4;g.sh=[[-1.1,.1],[-1.1,-.1]];
    } else if(name==='quad'){g.lean=.25;g.th=[[-1.3,.35],[-1.3,-.35]];g.kn=[1.6,1.6];g.sh=[[-1.05,.12],[-1.05,-.12]];g.hy=hipY+(p.bob||0);}
    else if(name==='brush'){g.sh[1]=[-1.15+Math.sin(time*8)*.3,-.25+Math.cos(time*8)*.15];g.lean=.08;}
    else if(name==='spray'){g.sh[1]=[-1.0+Math.sin(time*2)*.15,-.2];g.sh[0]=[-.6,.2];}
    else if(name==='fish'){g.sh=[[-.95,.25],[-1.05,-.2]];const k=Math.sin(time*.7);g.sh[1][0]+=k*.05;}
    else if(name==='swim'){g.sh[0]=[time*4%TAU-Math.PI,.25];g.sh[1]=[(time*4+Math.PI)%TAU-Math.PI,-.25];g.th=[[Math.sin(time*6)*.3,.1],[-Math.sin(time*6)*.3,-.1]];}
    else if(name==='crouch'){g.hy=.42*s;g.th=[[-1.9,.25],[-1.9,-.25]];g.kn=[2.4,2.4];g.lean=.5;g.sh=[[-1.2+Math.sin(time*3)*.2,.2],[-1.2-Math.sin(time*3)*.2,-.2]];}
    else if(name==='wave'){g.sh[1]=[0,-2.6+Math.sin(time*9)*.35];}
    else if(name==='talk'){g.sh[1]=[-.6+Math.sin(time*4)*.25,-.25];g.sh[0]=[-.3+Math.cos(time*3)*.15,.2];}
    else if(name==='feed'){g.sh[1]=[-1.35,-.1];}
    else if(name==='play'){N.phase+=dt*8;g.sh=[[Math.sin(N.phase)*1.2,.4],[-Math.sin(N.phase)*1.2,-.4]];g.hy=hipY+Math.abs(Math.sin(N.phase))*.12*s;}
    const J=N.J,L=(a,b)=>U.lerp(a,b,t);
    J.hy=L(J.hy,g.hy);J.lean=L(J.lean,g.lean);
    for(let i=0;i<2;i++){J.th[i][0]=L(J.th[i][0],g.th[i][0]);J.th[i][1]=L(J.th[i][1],g.th[i][1]);J.kn[i]=L(J.kn[i],g.kn[i]);J.sh[i][0]=L(J.sh[i][0],g.sh[i][0]);J.sh[i][1]=L(J.sh[i][1],g.sh[i][1]);}
    hips.position.y=J.hy;spine.rotation.x=J.lean;
    legs.forEach((l,i)=>{l.th.rotation.set(J.th[i][0],0,J.th[i][1]);l.kn.rotation.x=J.kn[i];});
    arms.forEach((a,i)=>a.sh.rotation.set(J.sh[i][0],0,J.sh[i][1]));
  };
  N.pose(0,'stand',{snap:true});
  return N;
};
/* "cuoce" una persona in posa in un'unica geometria (folle statiche) */
EQ.bakeNPC=function(N,pose,p){
  N.pose(1,pose,Object.assign({snap:true},p||{}));N.root.position.set(0,0,0);N.root.rotation.set(0,0,0);N.root.updateMatrixWorld(true);
  const geos=[];N.root.traverse(o=>{if(o.isMesh){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);geos.push(g);}});
  return EQ.merge(geos);
};
EQ.nameSprite=function(name,col){
  const t=EQ.labelTex(name,{bg:col||'rgba(30,50,30,.82)',w:256,h:72,radius:30,font:'bold 40px Fredoka, Trebuchet MS, sans-serif'});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:true,transparent:true}));s.scale.set(.95,.27,1);s.renderOrder=5;return s;
};

/* ============ CANE ============ */
EQ.buildDog=function(o){
  o=Object.assign({col:pick([0x8a5a2a,0x2a2220,0xe8d8b0,0xc8a060,0x5a4030,0xf2f2f2,0x9a6a3a]),size:rnd(.6,1.1),spot:null},o||{});
  const s=o.size,root=new THREE.Group(),body=new THREE.Group();const lh=.32*s;body.position.y=lh;root.add(body);
  const P=[];const c=o.col;
  const b=loft([[0,.02,-.3,.06],[0,.03,-.24,.1,.11,.1],[0,.04,0,.11,.12,.11],[0,.06,.2,.11,.13,.12],[0,.08,.27,.07]],10,2);b.scale(s,s,s);P.push(T(b,c));
  P.push(T(X(G.sph(.09,10,8),0,.2*s,.36*s,0,0,0,s,s,1.05*s),c));
  P.push(T(X(G.box(.08,.07,.12),0,.17*s,.45*s,0,0,0,s,s,s),c));
  P.push(T(X(G.sph(.02,6,5),0,.19*s,.51*s,0,0,0,s,s,s),0x111111));
  for(const sd of [1,-1]){P.push(T(X(G.sph(.014,6,5),sd*.045*s,.23*s,.43*s,0,0,0,s,s,s),0x111111));
    const e=G.cone(.035,.09,6);P.push(T(X(e,sd*.05*s,.29*s,.33*s,-.2,0,sd*-.3,s,s*(o.floppy?.7:1),s),o.spot||c));}
  P.push(T(X(G.cyl(.018,.01,.2,6),0,.1*s,-.36*s,-.8,0,0,s,s,s),c));
  P.push(T(X(G.tor(.06,.012,5,12),0,.14*s,.28*s,Math.PI/2.4,0,0,s,s,s),0xd62828));
  const bm=new THREE.Mesh(EQ.merge(P),NPCMAT);bm.castShadow=true;body.add(bm);
  const legs=[];
  for(const [x,z] of [[.06,.2],[-.06,.2],[.06,-.22],[-.06,-.22]]){const l=new THREE.Group();l.position.set(x*s,0,z*s);body.add(l);
    const g=T(X(G.cyl(.028,.022,lh,6),0,-lh/2,0),c);const m=new THREE.Mesh(g,NPCMAT);l.add(m);legs.push(l);}
  root.userData.pet='cane';
  const D={root,body,legs,ph:Math.random()*9,s};
  D.animate=function(dt,sp){D.ph+=dt*(4+sp*3)*Math.min(1,sp/.2);const a=Math.min(.7,sp*.3);
    legs.forEach((l,i)=>l.rotation.x=Math.sin(D.ph+(i===0||i===3?0:Math.PI))*a);body.position.y=lh+Math.abs(Math.sin(D.ph))*.02*Math.min(1,sp);};
  return D;
};

/* ============ ANIMALI ============ */
const AN={
  deer:{len:.62,lh:.82,r:.2,col:0x8a5a32,belly:0xd9c2a0,neck:.45,head:.12,ears:.12,tail:'short',antlers:true},
  doe:{len:.55,lh:.75,r:.18,col:0x9a6a3e,belly:0xe0cba8,neck:.4,head:.11,ears:.12,tail:'short'},
  fox:{len:.3,lh:.26,r:.1,col:0xc8641e,belly:0xf2ece2,neck:.1,head:.09,ears:.07,tail:'bushy'},
  boar:{len:.45,lh:.32,r:.22,col:0x3a2e26,belly:0x2a221c,neck:.05,head:.15,ears:.06,tail:'thin',tusks:true},
  rabbit:{len:.13,lh:.06,r:.09,col:0x8a7a66,belly:0xe8e0d0,neck:.02,head:.07,ears:.13,tail:'puff',hop:true},
  squirrel:{len:.09,lh:.05,r:.055,col:0xa0522d,belly:0xf2e2c8,neck:.02,head:.05,ears:.03,tail:'curl',hop:true},
  cow:{len:.85,lh:.72,r:.33,col:0xf2f0ea,belly:0xf2f0ea,neck:.25,head:.2,ears:.08,tail:'thin',spots:0x1a1a1a,horns:true},
  cat:{len:.17,lh:.15,r:.075,col:0xd9782a,belly:0xf2ece2,neck:.05,head:.075,ears:.06,tail:'up'},
  sheep:{len:.45,lh:.42,r:.26,col:0xf2eee4,belly:0xe8e2d4,neck:.1,head:.11,ears:.06,tail:'puff',face:0x2a2420},
};
EQ.buildAnimal=function(kind,ov){
  const S=Object.assign({},AN[kind],ov||{}),root=new THREE.Group(),body=new THREE.Group();body.position.y=S.lh;root.add(body);
  const P=[],L=S.len,r=S.r,c=S.col;
  P.push(T(loft([[0,.02,-L-.02,r*.3],[0,.02,-L,r*.75,r*.8,r*.85],[0,0,-L*.4,r,r*.95,r],[0,.02,L*.4,r*.95,r,r],[0,.05,L,r*.75,r*.8,r*.85],[0,.06,L+.02,r*.3]],12,3),c));
  P.push(T(loft([[0,-r*.55,-L*.5,r*.6,r*.1,r*.25],[0,-r*.55,L*.5,r*.6,r*.1,r*.25]],8,2),S.belly));
  if(S.spots)for(let i=0;i<7;i++){const a=rnd(0,TAU),z=rnd(-L*.8,L*.8);P.push(T(X(G.sph(r*.45,8,6),Math.cos(a)*r*.75,Math.sin(a)*r*.75,z,0,0,0,.4,1,1.3),S.spots));}
  const hz=L+S.neck*.6+S.head*.6, hy=S.neck+.05;
  P.push(T(loft([[0,.03,L*.8,r*.5],[0,hy*.55,L+S.neck*.35,r*.38],[0,hy,hz-S.head*.3,S.head*.6]],8,2),c));
  P.push(T(X(G.sph(S.head,10,8),0,hy,hz,0,0,0,.85,.85,1.35),S.face||c));
  P.push(T(X(G.sph(S.head*.35,8,6),0,hy-S.head*.25,hz+S.head*1.1,0,0,0,1,.8,1),kind==='boar'||kind==='cow'?0xc89a8a:0x1a1a1a));
  for(const sd of [1,-1]){P.push(T(X(G.sph(S.head*.14,6,5),sd*S.head*.6,hy+S.head*.25,hz+S.head*.5),0x0a0a0a));
    const e=G.cone(S.ears*.35,S.ears,6);P.push(T(X(e,sd*S.head*.55,hy+S.head*.75,hz-S.head*.3,-.3,0,-sd*.35),c));
    if(S.antlers){P.push(T(X(G.cyl(.012,.018,.35,5),sd*.06,hy+.25,hz-.05,-.3,0,-sd*.4),0x5a4632));P.push(T(X(G.cyl(.01,.014,.18,5),sd*.13,hy+.38,hz,-.9,0,-sd*.3),0x5a4632));}
    if(S.horns)P.push(T(X(G.cone(.025,.12,6),sd*S.head*.7,hy+S.head*.6,hz-S.head*.2,0,0,-sd*1.1),0xe8e0c8));
    if(S.tusks)P.push(T(X(G.cone(.015,.08,5),sd*.05,hy-.08,hz+S.head*1.1,-.6,0,0),0xf2eee0));}
  if(S.tail==='short')P.push(T(X(G.sph(.06,6,5),0,.08,-L-.02,0,0,0,1,1.4,.7),0xf6f2ea));
  if(S.tail==='bushy'){P.push(T(loft([[0,.03,-L,.03],[0,-.05,-L-.18,.07],[0,-.08,-L-.38,.06],[0,-.08,-L-.46,.02]],8,2),c));P.push(T(X(G.sph(.04,6,5),0,-.08,-L-.44),0xf6f2ea));}
  if(S.tail==='thin')P.push(T(X(G.cyl(.015,.01,.45,5),0,-.15,-L-.06,.3,0,0),c));
  if(S.tail==='up')P.push(T(loft([[0,.02,-L,.022],[0,.12,-L-.08,.025],[0,.3,-L-.1,.022],[0,.38,-L-.04,.012]],8,2),c));
  if(S.tail==='puff')P.push(T(X(G.sph(r*.35,6,5),0,.05,-L-.02),0xf6f2ea));
  if(S.tail==='curl')P.push(T(loft([[0,0,-L,.02],[0,.12,-L-.08,.045],[0,.24,-L-.04,.05],[0,.28,-L+.04,.03]],8,2),c));
  const bm=new THREE.Mesh(EQ.merge(P),NPCMAT);bm.castShadow=true;body.add(bm);
  const legs=[];const lr=Math.max(.012,r*.18);
  for(const [x,z] of [[r*.55,L*.72],[-r*.55,L*.72],[r*.55,-L*.72],[-r*.55,-L*.72]]){const l=new THREE.Group();l.position.set(x,-r*.3,z);body.add(l);
    const g=EQ.merge([T(X(G.cyl(lr*1.2,lr*.8,S.lh-r*.3+.02,6),0,-(S.lh-r*.3)/2,0),c),T(X(G.cyl(lr*.9,lr,.04,6),0,-(S.lh-r*.3),0),0x2a2220)]);
    const m=new THREE.Mesh(g,NPCMAT);m.castShadow=true;l.add(m);legs.push(l);}
  if(kind==='cat')root.userData.pet='gatto';
  const A={root,body,legs,ph:Math.random()*9,S,kind};
  A.animate=function(dt,sp){
    if(S.hop){A.ph+=dt*sp*4;const k=Math.abs(Math.sin(A.ph));body.position.y=S.lh+(sp>.2?k*S.lh*2.5:0);legs.forEach((l,i)=>l.rotation.x=(i<2?-1:1)*k*.8*Math.min(1,sp));return;}
    A.ph+=dt*(2+sp*2.2)*Math.min(1,sp/.2);const a=Math.min(.8,sp*.25);
    legs.forEach((l,i)=>l.rotation.x=Math.sin(A.ph+(i===0||i===3?0:Math.PI))*a);body.position.y=S.lh+Math.abs(Math.sin(A.ph))*.03*Math.min(1,sp/2);};
  return A;
};

EQ.buildCat=function(){return EQ.buildAnimal('cat',{col:pick([0xd9782a,0x2a2a2a,0x8a8a8a,0xf2eee6,0x6b4a30,0xc8a070])});};
/* ============ VEICOLI ============ */
const PROF={
  hatch:{L:3.95,W:1.76,wr:.31,wh:[-1.27,1.3],
    low:[[-1.97,.28],[-2.0,.62],[-1.93,.93],[1.25,.97],[1.82,.86],[1.98,.66],[1.96,.28]],
    cab:[[-1.93,.92],[-1.78,1.47],[-.15,1.53],[.62,1.43],[1.25,.97]],
    glass:[[-1.83,1.0],[-1.71,1.42],[-.15,1.47],[.56,1.39],[1.12,1.0]]},
  sedan:{L:4.65,W:1.82,wr:.32,wh:[-1.45,1.5],
    low:[[-2.32,.3],[-2.36,.62],[-2.28,.96],[-1.62,1.0],[1.15,1.0],[2.2,.86],[2.33,.62],[2.3,.3]],
    cab:[[-1.75,.98],[-1.18,1.43],[.42,1.46],[1.18,.99]],
    glass:[[-1.62,1.03],[-1.12,1.38],[.4,1.41],[1.06,1.03]]},
  suv:{L:4.6,W:1.9,wr:.38,wh:[-1.45,1.48],
    low:[[-2.28,.4],[-2.3,.72],[-2.26,1.12],[1.2,1.14],[2.18,1.0],[2.3,.75],[2.26,.4]],
    cab:[[-2.24,1.1],[-2.12,1.78],[.6,1.8],[1.25,1.13]],
    glass:[[-2.14,1.18],[-2.04,1.72],[.56,1.74],[1.12,1.18]]},
  van:{L:5.0,W:1.95,wr:.36,wh:[-1.6,1.65],
    low:[[-2.5,.38],[-2.52,1.05],[2.2,1.05],[2.5,.95],[2.52,.38]],
    cab:[[-2.52,1.02],[-2.5,2.2],[1.3,2.2],[2.05,1.25],[2.2,1.03]],
    glass:[[1.05,1.15],[1.22,2.0],[1.94,1.25],[2.0,1.15]]},
  bus:{L:11,W:2.5,wr:.5,wh:[-3.6,3.6],
    low:[[-5.5,.45],[-5.52,1.25],[5.5,1.25],[5.52,.45]],
    cab:[[-5.52,1.22],[-5.5,3.0],[5.3,3.0],[5.5,2.6],[5.52,1.22]],
    glass:[[-5.3,1.4],[-5.3,2.65],[5.25,2.65],[5.42,1.35]]},
};
const geoCache={};
EQ.carGeo=function(type,col){
  const k=type+col;if(geoCache[k])return geoCache[k];
  const pf=PROF[type];const P=[];const W=pf.W,L=pf.L;
  const ext=(pts,depth,c,bev)=>{const sh=new THREE.Shape();pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
    const b=bev==null?.07:bev;const g=new THREE.ExtrudeGeometry(sh,{depth:depth-2*b,bevelEnabled:b>0,bevelSize:b,bevelThickness:b,bevelSegments:3,curveSegments:4});g.translate(0,0,-(depth-2*b)/2);g.rotateY(-Math.PI/2);P.push(T(g,c));};
  const big=type==='bus'||type==='van';
  ext(pf.low,W,col,.09);
  ext(pf.cab,W*(big?.99:.86),col,.06);
  ext(pf.glass,W*(big?1.0:.875),0x18222c,.02);
  if(!big){const c=pf.cab.reduce((a,p)=>[a[0]+p[0]/pf.cab.length,a[1]+p[1]/pf.cab.length],[0,0]);
    const gr=pf.cab.map(p=>{const dx=p[0]-c[0],dy=p[1]-c[1],l=Math.hypot(dx,dy)||1;return[p[0]+dx/l*.085,p[1]+dy/l*.085];});
    ext(gr,W*.78,0x18222c,.02);
    const my=Math.max(...pf.cab.map(p=>p[1])),top=pf.cab.filter(p=>p[1]>my-.09),x0=Math.min(...top.map(p=>p[0])),x1=Math.max(...top.map(p=>p[0]));
    P.push(T(X(G.box(W*.84,.07,x1-x0+.1),0,my+.035,(x0+x1)/2),col));}
  // montante centrale
  if(!big){const gx=(pf.glass[1][0]+pf.glass[pf.glass.length-2][0])/2;P.push(T(X(G.box(W*.885,(pf.glass[2][1]-pf.glass[0][1])*.95,.09),0,(pf.glass[0][1]+pf.glass[2][1])/2,gx),col));}
  if(type==='bus'){for(let i=0;i<8;i++)P.push(T(X(G.box(W+.04,1.3,.1),0,2.02,-4.6+i*1.3),col));P.push(T(X(G.box(W+.05,.22,L*.96),0,1.0,0),0xffffff));
    P.push(T(X(G.box(.9,1.9,.05),W/2+.01,1.4,3.8,0,Math.PI/2,0),0x222a33));}
  // passaruota, gomme, cerchi
  for(const sd of [1,-1])for(const z of pf.wh){
    P.push(T(X(new THREE.CylinderGeometry(pf.wr+.07,pf.wr+.07,.18,16,1,true,0,Math.PI),sd*(W/2-.05),pf.wr,z,0,0,Math.PI/2),0x0d0d0d));
    P.push(T(X(G.cyl(pf.wr,pf.wr,.24,18),sd*(W/2-.1),pf.wr,z,0,0,Math.PI/2),0x141414));
    P.push(T(X(G.cyl(pf.wr*.62,pf.wr*.62,.03,16),sd*(W/2+.02),pf.wr,z,0,0,Math.PI/2),0xc5cad0));
    for(let r=0;r<5;r++){const a=r/5*Math.PI*2;P.push(T(X(G.box(.035,pf.wr*.5,.06),sd*(W/2+.04),pf.wr+Math.cos(a)*pf.wr*.28,z+Math.sin(a)*pf.wr*.28,a,0,0),0x8a9096));}
    P.push(T(X(G.cyl(pf.wr*.16,pf.wr*.16,.04,10),sd*(W/2+.05),pf.wr,z,0,0,Math.PI/2),0x2a2a2a));}
  // fari, fanali, griglia, targhe, paraurti
  const fz=pf.low[pf.low.length-2][0],fy=pf.low[pf.low.length-2][1];
  for(const sd of [1,-1]){
    P.push(T(X(G.box(.36,.13,.1),sd*(W/2-.3),big?.95:fy-.06,L/2-.01,0,0,0),0xfff8e0));
    P.push(T(X(G.box(.38,.15,.07),sd*(W/2-.28),big?1.0:.86,-L/2+.0),0xb81010));
    P.push(T(X(G.box(.3,.04,.04),sd*(W/2-.3),big?.86:.74,-L/2-.01),0xff8c00));
    if(!big){P.push(T(X(G.box(.06,.1,.2),sd*(W*.43+.04),pf.cab[0][1]+.13,pf.glass[pf.glass.length-1][0]-.05),col));P.push(T(X(G.box(.025,.08,.15),sd*(W*.43+.06),pf.cab[0][1]+.13,pf.glass[pf.glass.length-1][0]-.08),0x111111));}
    for(const dz of (big?[]:[-.35,.55]))P.push(T(X(G.box(.03,.035,.16),sd*(W/2+.01),pf.low[3][1]-.12,dz),0xbfc4c8));
    P.push(T(X(G.box(.02,.12,L*.6),sd*(W/2+.005),.38,0),0x1a1a1a));}
  P.push(T(X(G.box(W*.42,.16,.06),0,big?.75:.62,L/2+.02),0x16181a));P.push(T(X(G.box(W*.42,.025,.07),0,big?.82:.69,L/2+.025),0xc5cad0));
  P.push(T(X(G.box(W-.12,.2,.14),0,.36,L/2+.04),0x1e1f22));P.push(T(X(G.box(W-.12,.2,.14),0,.36,-L/2-.04),0x1e1f22));
  for(const zz of [L/2+.12,-L/2-.12]){P.push(T(X(G.box(.52,.12,.02),0,.5,zz),0xf2f2f2));P.push(T(X(G.box(.06,.12,.025),-.24,.5,zz),0x1d4ed8));}
  return geoCache[k]=EQ.merge(P);
};
const CARMAT=EQ.CARMAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.24,metalness:.5,envMapIntensity:1.2});
EQ.CAR_COLS=[0xc0392b,0xf1c40f,0x2a58c8,0xecf0f1,0x2f6b33,0x111111,0x8e44ad,0xe67e22,0x95a5a6,0x7a1f1f,0x1f3b5a,0xd9d4c8,0x3a3a3a];
EQ.buildCar=function(type,col){
  type=type||pick(['hatch','hatch','sedan','suv','van','sedan']);col=col!=null?col:pick(EQ.CAR_COLS);
  const m=new THREE.Mesh(EQ.carGeo(type,col),CARMAT);m.castShadow=true;const g=new THREE.Group();g.add(m);g.userData.L=PROF[type].L;g.userData.type=type;return g;
};
EQ.buildBike=function(col){
  col=col!=null?col:pick(TOPS);const g=new THREE.Group();const P=[];
  for(const z of [-.52,.52]){P.push(T(X(G.tor(.34,.025,6,20),0,.36,z,0,Math.PI/2,0),0x151515));P.push(T(X(G.cyl(.04,.04,.06,8),0,.36,z,0,0,Math.PI/2),0x999999));}
  const tube=(a,b,r,c)=>{const d=new V3().subVectors(b,a),L=d.length();const m=G.cyl(r,r,L,6);const q=new THREE.Quaternion().setFromUnitVectors(new V3(0,1,0),d.normalize());const M=new THREE.Matrix4().compose(new V3().addVectors(a,b).multiplyScalar(.5),q,new V3(1,1,1));m.applyMatrix4(M);P.push(T(m,c));};
  const v=(x,y,z)=>new V3(x,y,z);
  tube(v(0,.36,-.52),v(0,.42,-.05),.02,col);tube(v(0,.42,-.05),v(0,.8,-.2),.022,col);tube(v(0,.42,-.05),v(0,.78,.4),.025,col);tube(v(0,.8,-.2),v(0,.78,.4),.022,col);tube(v(0,.36,.52),v(0,.82,.42),.02,0x888888);tube(v(0,.36,-.52),v(0,.8,-.2),.018,col);
  P.push(T(X(G.box(.12,.04,.22),0,.86,-.22),0x111111));P.push(T(X(G.box(.5,.025,.025),0,.98,.42),0x222222));tube(v(0,.82,.42),v(0,.98,.42),.018,0x888888);
  const m=new THREE.Mesh(EQ.merge(P),CARMAT);m.castShadow=true;g.add(m);return g;
};
EQ.buildScooter=function(col){col=col!=null?col:pick([0x111111,0x2a58c8,0xc0392b,0xf2f2f2,0x2ecc71]);const P=[];
  for(const z of [-.42,.42]){P.push(T(X(G.cyl(.1,.1,.05,12),0,.1,z,0,0,Math.PI/2),0x151515));}
  P.push(T(X(G.box(.16,.05,.82),0,.12,0),col));P.push(T(X(G.cyl(.02,.02,.95,6),0,.6,.42,-.12,0,0),0x777777));P.push(T(X(G.box(.45,.03,.03),0,1.06,.48),0x222222));
  const g=new THREE.Group();const m=new THREE.Mesh(EQ.merge(P),CARMAT);m.castShadow=true;g.add(m);return g;};
EQ.buildMoto=function(col){col=col!=null?col:pick([0xc0392b,0x111111,0x2a58c8,0xf1c40f,0x2f6b33]);const P=[];
  for(const z of [-.72,.72]){P.push(T(X(G.cyl(.32,.32,.13,16),0,.32,z,0,0,Math.PI/2),0x141414));P.push(T(X(G.cyl(.2,.2,.14,12),0,.32,z,0,0,Math.PI/2),0xb8bcc0));}
  P.push(T(X(G.box(.28,.3,.9),0,.55,0),0x333333));P.push(T(X(G.box(.34,.24,.5),0,.86,.18),col));P.push(T(X(G.box(.28,.1,.6),0,.8,-.3),0x151515));
  P.push(T(X(G.box(.08,.5,.08),0,.78,.66,-.35,0,0),0x999999));P.push(T(X(G.box(.62,.04,.04),0,1.05,.56),0x222222));P.push(T(X(G.cyl(.09,.09,.08,10),0,.9,.74,Math.PI/2,0,0),0xfff8e0));
  P.push(T(X(G.box(.26,.12,.5),0,.62,-.72,.2,0,0),col));P.push(T(X(G.cyl(.05,.05,.6,8),.16,.38,-.35,Math.PI/2,0,0),0xb8bcc0));
  const g=new THREE.Group();const m=new THREE.Mesh(EQ.merge(P),CARMAT);m.castShadow=true;g.add(m);return g;};
/* camion per il trasporto dei cavalli (muso verso +z, rampa dietro) */
EQ.buildHorseTruck=function(col,stripe){col=col||0xf4f4f2;stripe=stripe||0x2f6b33;const P=[];
  P.push(T(X(G.box(2.55,.5,8.6),0,.85,0),0x2a2a2a));
  P.push(T(X(G.box(2.6,3.1,6.4),0,2.55,-1.1),col));P.push(T(X(G.box(2.62,.35,6.42),0,1.35,-1.1),stripe));P.push(T(X(G.box(2.62,.12,6.42),0,3.6,-1.1),stripe));
  for(const sd of [1,-1])for(let i=0;i<3;i++){P.push(T(X(G.box(.04,.45,.9),sd*1.31,3.05,-3.3+i*1.5),0x1b232c));P.push(T(X(G.box(.05,.06,1),sd*1.32,2.82,-3.3+i*1.5),0x888888));}
  P.push(T(X(G.box(2.5,2.6,2.3),0,2.25,3.3),col));P.push(T(X(G.box(2.52,.35,2.32),0,1.25,3.3),stripe));
  P.push(T(X(G.box(2.3,1.05,.08),0,2.85,4.46,-.12,0,0),0x1b232c));for(const sd of [1,-1])P.push(T(X(G.box(.06,.8,1.3),sd*1.26,2.8,3.6),0x1b232c));
  P.push(T(X(G.box(2.3,.35,.15),0,1.15,4.5),0x222222));for(const sd of [1,-1]){P.push(T(X(G.box(.4,.2,.08),sd*.9,1.5,4.48),0xfff8e0));P.push(T(X(G.box(.08,.25,.3),sd*1.4,3.0,4.3),0x222222));}
  for(const sd of [1,-1])for(const z of [3.2,-1.6,-3.0]){P.push(T(X(G.cyl(.5,.5,.32,16),sd*1.12,.5,z,0,0,Math.PI/2),0x141414));P.push(T(X(G.cyl(.28,.28,.33,10),sd*1.12,.5,z,0,0,Math.PI/2),0xb8bcc0));}
  // rampa abbassata
  P.push(T(X(G.box(2.2,.1,2.6),0,.6,-5.4,-.38,0,0),0x6b4a2a));for(let i=0;i<6;i++)P.push(T(X(G.box(2.1,.04,.06),0,.66-i*.17,-4.5-i*.42,-.38,0,0),0x3a2a1a));
  P.push(T(X(G.box(2.6,3.1,.1),0,2.55,-4.3),0x333333));
  const g=new THREE.Group();const m=new THREE.Mesh(EQ.merge(P),CARMAT);m.castShadow=true;m.receiveShadow=true;g.add(m);
  const t=EQ.labelTex('🐴 TRASPORTO CAVALLI',{bg:'#2f6b33',w:1024,h:128,radius:10,font:'bold 70px Fredoka, Trebuchet MS, sans-serif'});
  for(const sd of [1,-1]){const l=new THREE.Mesh(new THREE.PlaneGeometry(5,.62),new THREE.MeshBasicMaterial({map:t}));l.position.set(sd*1.315,2.15,-1.1);l.rotation.y=sd*Math.PI/2;g.add(l);}
  return g;};
EQ.buildQuadBike=function(col){
  col=col!=null?col:pick([0xc0392b,0x2f6b33,0xf1c40f,0x2a58c8]);const P=[];
  for(const sd of [1,-1])for(const z of [-.55,.55]){P.push(T(X(G.cyl(.3,.3,.26,12),sd*.5,.3,z,0,0,Math.PI/2),0x151515));P.push(T(X(G.cyl(.15,.15,.27,8),sd*.5,.3,z,0,0,Math.PI/2),0x777777));}
  P.push(T(X(G.box(.7,.25,1.3),0,.5,0),0x333333));P.push(T(X(G.box(1.2,.12,.5),0,.68,.62),col));P.push(T(X(G.box(1.2,.12,.5),0,.68,-.62),col));
  P.push(T(X(G.box(.55,.35,.7),0,.72,.05),col));P.push(T(X(G.box(.4,.14,.6),0,.92,-.15),0x111111));P.push(T(X(G.box(.75,.04,.04),0,1.05,.45),0x222222));P.push(T(X(G.box(.1,.08,.04),0,.82,.95),0xfffbe8));
  const g=new THREE.Group();const m=new THREE.Mesh(EQ.merge(P),CARMAT);m.castShadow=true;g.add(m);return g;
};
const SAILMAT=new THREE.MeshStandardMaterial({color:0xfafafa,roughness:.8,side:THREE.DoubleSide});
EQ.buildBoat=function(kind){
  const g=new THREE.Group();const P=[];
  const hull=(L,W,H,c,deck)=>{P.push(T(loft([[0,0,-L/2,W*.45,.01,H*.8],[0,0,-L*.3,W*.5,.01,H],[0,0,L*.15,W*.48,.01,H],[0,.05,L*.4,W*.3,.01,H*.8],[0,.1,L/2,.04,.01,.2]],12,3,{caps:true}),c));if(deck!=null)P.push(T(X(G.box(W*.85,.04,L*.7),0,.02,-L*.05),deck));};
  if(kind==='sail'){hull(7,2.4,.9,0xffffff,0xc9a272);P.push(T(X(G.cyl(.06,.06,8,6),0,4,.6),0xdddddd));P.push(T(X(G.box(.5,.6,1.4),0,.32,-1.4),0xf2f2f2));
    const sh=new THREE.Shape();sh.moveTo(0,.8);sh.lineTo(0,7.6);sh.lineTo(-3,1);sh.closePath();const s1=new THREE.Mesh(new THREE.ShapeGeometry(sh),SAILMAT);s1.rotation.y=Math.PI/2;s1.position.z=.6;g.add(s1);
    const sh2=new THREE.Shape();sh2.moveTo(0,.6);sh2.lineTo(0,7);sh2.lineTo(2.5,.6);sh2.closePath();const s2=new THREE.Mesh(new THREE.ShapeGeometry(sh2),SAILMAT);s2.rotation.y=Math.PI/2;s2.position.z=.65;g.add(s2);}
  else if(kind==='motor'){hull(6,2.2,.8,0xffffff,0xd9d4c8);P.push(T(X(G.box(1.6,.7,1.6),0,.4,.4),0xf2f2f2));P.push(T(X(G.box(1.5,.4,.06),0,.95,1.2,-.4,0,0),0x2a3a48));P.push(T(X(G.box(2.25,.12,5),0,-.25,0),0x1f4e8a));}
  else if(kind==='row'){hull(4,1.4,.55,0x8a5a34,0x6b4226);P.push(T(X(G.box(1.3,.06,.3),0,.15,.3),0x6b4226));}
  else if(kind==='pedalo'){for(const sd of [1,-1])P.push(T(X(G.cyl(.32,.32,3,10),sd*.75,.1,0,Math.PI/2,0,0),0xffffff));P.push(T(X(G.box(1.6,.12,1.4),0,.4,0),0x2a7fd1));P.push(T(X(G.box(1.4,.5,.12),0,.65,-.55),0x2a7fd1));
    const sl=G.box(.5,.05,1.6);P.push(T(X(sl,0,.9,-.9,-.6,0,0),0xffd23f));}
  const m=new THREE.Mesh(EQ.merge(P),CARMAT);m.castShadow=true;g.add(m);return g;
};
EQ.buildBarrow=function(){const P=[T(X(G.box(.7,.35,.95),0,.55,.1),0x2f6b33),T(X(G.sph(.42,10,8),0,.78,.1,0,0,0,.85,.45,1.1),0xd6c070),T(X(G.cyl(.2,.2,.08,12),0,.2,.68,0,0,Math.PI/2),0x222222)];
  for(const sd of [1,-1])P.push(T(X(G.box(.04,.04,.9),sd*.3,.45,-.55),0x555555));const g=new THREE.Group();g.add(new THREE.Mesh(EQ.merge(P),NPCMAT));return g;};
})();
