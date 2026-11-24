/* Giorgia a Cavallo – motore di base: renderer, cielo, materiali, geometrie, audio, input */
'use strict';
window.EQ = (function(){
const EQ = {};
const V3 = THREE.Vector3, TAU = Math.PI*2;
EQ.V3 = V3; EQ.TAU = TAU; EQ.D2R = Math.PI/180;

/* ---------------- utilità ---------------- */
const U = EQ.U = {
  clamp:(v,a,b)=>v<a?a:v>b?b:v,
  lerp:(a,b,t)=>a+(b-a)*t,
  wrapA(a){while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;},
  rnd:(a,b)=>a+Math.random()*(b-a),
  smooth:(e0,e1,x)=>{const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t);},
  damp:(k,dt)=>1-Math.exp(-k*dt),
  rng(seed){let a=seed>>>0;return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};},
};
function hash(x,y){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
U.noise=vnoise;
U.fbm=(x,y,o)=>{o=o||4;let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*vnoise(x*f+i*17.3,y*f-i*9.1);n+=a;f*=2;a*=.5;}return s/n;};

EQ.LS={get(k,d){try{const v=localStorage.getItem('equi2_'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
       set(k,v){try{localStorage.setItem('equi2_'+k,JSON.stringify(v));}catch(e){}}};

/* ---------------- renderer ---------------- */
const coarse = matchMedia('(pointer:coarse)').matches;
EQ.mobile = coarse;
EQ.hiQ = EQ.LS.get('hq', !coarse);
const canvas = document.getElementById('c');
const renderer = EQ.renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.62;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = false;
const scene = EQ.scene = new THREE.Scene();
const camera = EQ.camera = new THREE.PerspectiveCamera(60,1,0.22,1500);
EQ.portrait = false;
function resize(){
  const w=innerWidth,h=innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, EQ.hiQ?2:1.3));
  renderer.setSize(w,h,false);
  camera.aspect=w/h; EQ.portrait=w<h;
  camera.fov=EQ.portrait?68:55; camera.updateProjectionMatrix();
}
EQ.resize=resize; addEventListener('resize',resize); resize();

/* ---------------- luci + cielo ---------------- */
const hemi = EQ.hemi = new THREE.HemisphereLight(0xdbeaff, 0x6b5a3a, 0.55); scene.add(hemi);
const sun = EQ.sun = new THREE.DirectionalLight(0xfff0dc, 2.4);
sun.castShadow = true;
function shadowSize(){const s=EQ.hiQ?2048:1024;sun.shadow.mapSize.set(s,s);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
shadowSize(); EQ.shadowSize=shadowSize;
const SC = sun.shadow.camera; SC.left=-26;SC.right=26;SC.top=26;SC.bottom=-26;SC.near=1;SC.far=220;
sun.shadow.bias=-0.0004; sun.shadow.normalBias=0.03;
scene.add(sun); scene.add(sun.target);
EQ.sunDir = new V3(0.5,0.8,0.3).normalize();

const sky = new THREE.Sky(); sky.scale.setScalar(10000); sky.frustumCulled=false; scene.add(sky); EQ.sky=sky;
const envSky = new THREE.Sky(); envSky.scale.setScalar(10000);
const envScene = new THREE.Scene(); envScene.add(envSky);
for(const s of [sky,envSky]){s.material.uniforms.skyGain={value:.5};s.material.fragmentShader=s.material.fragmentShader.replace('gl_FragColor = vec4( retColor, 1.0 );','gl_FragColor = vec4( retColor*skyGain, 1.0 );').replace('void main() {','uniform float skyGain;\nvoid main() {');s.material.needsUpdate=true;}
const pmrem = new THREE.PMREMGenerator(renderer);
let envRT=null;
EQ.setSky = function(o){
  o=Object.assign({gain:.5,envGain:.75,elev:42,azim:150,turb:4,ray:1.2,mie:.004,mieG:.8,fog:0xc9dcea,near:80,far:520,exposure:.62,sun:2.4,hemi:.55,sunCol:0xfff0dc,envI:1},o||{});
  const phi=(90-o.elev)*EQ.D2R, th=o.azim*EQ.D2R;
  EQ.sunDir.setFromSphericalCoords(1,phi,th);
  for(const s of [sky,envSky]){const u=s.material.uniforms;u.turbidity.value=o.turb;u.rayleigh.value=o.ray;u.mieCoefficient.value=o.mie;u.mieDirectionalG.value=o.mieG;u.sunPosition.value.copy(EQ.sunDir);}
  sky.material.uniforms.skyGain.value=o.gain; envSky.material.uniforms.skyGain.value=o.envGain;
  if(envRT)envRT.dispose();
  envRT=pmrem.fromScene(envScene,0,1,2000);
  scene.environment=envRT.texture;
  scene.fog=new THREE.Fog(new THREE.Color(o.fog).convertSRGBToLinear(),o.near,o.far);
  renderer.toneMappingExposure=o.exposure;
  sun.intensity=o.sun; sun.color.set(o.sunCol); hemi.intensity=o.hemi;
  EQ.envIntensity=o.envI;
  camera.far=Math.max(300,o.far*1.08);camera.updateProjectionMatrix();
};
EQ.followSun = function(p){
  sun.position.copy(p).addScaledVector(EQ.sunDir,90);
  sun.target.position.copy(p); sun.target.updateMatrixWorld();
};

/* ---------------- materiali & geometrie ---------------- */
const C = EQ.C = h=>new THREE.Color(h).convertSRGBToLinear();
const matCache={};
EQ.mat = function(col,rough,metal,extra){
  rough=rough==null?.85:rough; metal=metal||0;
  const key=col+'_'+rough+'_'+metal+(extra?JSON.stringify(Object.keys(extra)):'');
  if(!extra&&matCache[key])return matCache[key];
  const m=new THREE.MeshStandardMaterial(Object.assign({color:C(col),roughness:rough,metalness:metal},extra||{}));
  if(!extra)matCache[key]=m; return m;
};
EQ.canvasTex = function(w,h,draw,rx,ry,srgb){
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);
  t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  if(srgb!==false)t.encoding=THREE.sRGBEncoding; return t;
};
EQ.mesh = function(geo,mat,x,y,z,parent,noShadow){
  const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);
  if(!noShadow){m.castShadow=true;m.receiveShadow=true;}
  if(parent)parent.add(m);return m;
};
EQ.G={
  box:(a,b,c)=>new THREE.BoxGeometry(a,b,c),
  cyl:(a,b,h,s,open)=>new THREE.CylinderGeometry(a,b,h,s||14,1,!!open),
  sph:(r,a,b)=>new THREE.SphereGeometry(r,a||16,b||12),
  cone:(r,h,s)=>new THREE.ConeGeometry(r,h,s||12),
  tor:(r,t,a,b,arc)=>new THREE.TorusGeometry(r,t,a||8,b||20,arc||TAU),
};
EQ.merge = function(geos){
  const ok=geos.map(g=>{g=g.index?g.toNonIndexed():g;if(!g.attributes.uv){g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));}
    for(const k of Object.keys(g.attributes))if(!['position','normal','uv','color'].includes(k))g.deleteAttribute(k);return g;});
  const hasCol=ok.some(g=>g.attributes.color);
  if(hasCol)ok.forEach(g=>{if(!g.attributes.color){const a=new Float32Array(g.attributes.position.count*3).fill(1);g.setAttribute('color',new THREE.BufferAttribute(a,3));}});
  else ok.forEach(g=>{if(g.attributes.color)g.deleteAttribute('color');});
  return THREE.BufferGeometryUtils.mergeBufferGeometries(ok,false);
};
/* unisce i figli Mesh statici di un gruppo per materiale (meno draw call) */
EQ.mergeStatic = function(group,keep){
  const by=new Map();
  group.children.slice().forEach(o=>{if(!o.isMesh||o.children.length||(keep&&keep.includes(o))||o.isInstancedMesh)return;
    const k=o.material;if(!by.has(k))by.set(k,[]);by.get(k).push(o);});
  by.forEach((list,m)=>{if(list.length<2)return;
    const geos=list.map(o=>{o.updateMatrix();const g=o.geometry.clone();g.applyMatrix4(o.matrix);return g;});
    const mg=EQ.merge(geos);geos.forEach(g=>g.dispose());
    const mm=new THREE.Mesh(mg,m);mm.castShadow=true;mm.receiveShadow=true;
    list.forEach(o=>group.remove(o));group.add(mm);});
};
/* geometria trasformata (per merge) */
EQ.xform = function(geo,x,y,z,rx,ry,rz,sx,sy,sz){
  const m=new THREE.Matrix4(), q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0));
  m.compose(new V3(x||0,y||0,z||0),q,new V3(sx||1,sy==null?(sx||1):sy,sz==null?(sx||1):sz));
  return geo.applyMatrix4(m);
};
/* colore per-vertice su geometria (per merge con un solo materiale) */
EQ.tint = function(geo,hex){
  const c=C(hex), n=geo.attributes.position.count, a=new Float32Array(n*3);
  for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}
  geo.setAttribute('color',new THREE.BufferAttribute(a,3)); return geo;
};

/* LOFT: superficie liscia da sezioni ellittiche lungo un percorso (nel piano YZ, lato = asse X)
   sec: [x,y,z, rx, ryU, ryD]  */
EQ.loft = function(sec,radial,steps,opt){
  opt=opt||{}; radial=radial||16; steps=steps||4;
  sec=sec.map(s=>{const ry=s[4]==null?s[3]:s[4];return [s[0],s[1],s[2],s[3],ry,s[5]==null?ry:s[5]];});
  const pts=sec.map(s=>new V3(s[0],s[1],s[2]));
  const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal');
  const N=(sec.length-1)*steps+1;
  const P=[],R=[];
  // raggi: interpolazione catmull sui valori
  const cr=(a,b,c,d,t)=>{const t2=t*t,t3=t2*t;return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);};
  for(let i=0;i<N;i++){
    const u=i/(N-1); P.push(curve.getPoint(u));
    const f=u*(sec.length-1), k=Math.min(sec.length-2,Math.floor(f)), t=f-k;
    const g=(j,idx)=>sec[U.clamp(j,0,sec.length-1)][idx];
    const r=[];
    for(let idx=3;idx<6;idx++){r.push(Math.max(0,cr(g(k-1,idx),g(k,idx),g(k+1,idx),g(k+2,idx),t)));}
    R.push(r);
  }
  const side=opt.side||new V3(1,0,0);
  const pos=[],uv=[],idx=[];
  const T=new V3(),Uv=new V3(),S=new V3();
  for(let i=0;i<N;i++){
    if(i===0)T.subVectors(P[1],P[0]);else if(i===N-1)T.subVectors(P[N-1],P[N-2]);else T.subVectors(P[i+1],P[i-1]);
    T.normalize(); Uv.crossVectors(T,side).normalize(); S.crossVectors(Uv,T).normalize();
    for(let j=0;j<=radial;j++){
      const a=j/radial*TAU, c=Math.cos(a), s=Math.sin(a);
      const ry=s>=0?R[i][1]:R[i][2];
      let rx=R[i][0];
      if(opt.flat&&s<0)rx*=1-opt.flat*(-s); // appiattimento inferiore
      const p=P[i].clone().addScaledVector(S,c*rx).addScaledVector(Uv,s*ry);
      pos.push(p.x,p.y,p.z); uv.push(j/radial,i/(N-1));
    }
  }
  const W=radial+1;
  for(let i=0;i<N-1;i++)for(let j=0;j<radial;j++){const a=i*W+j,b=a+W;idx.push(a,a+1,b,b,a+1,b+1);}
  if(opt.caps!==false){
    for(const [ri,dir] of [[0,-1],[N-1,1]]){
      const ci=pos.length/3; pos.push(P[ri].x,P[ri].y,P[ri].z); uv.push(.5,ri?1:0);
      for(let j=0;j<radial;j++){const a=ri*W+j;if(dir<0)idx.push(ci,a+1,a);else idx.push(ci,a,a+1);}
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};

/* texture procedurali riutilizzabili */
EQ.tex={};
EQ.noiseTex = function(base,vars,n,size,rep,extra){
  return EQ.canvasTex(size||256,size||256,(g,w,h)=>{
    g.fillStyle=base;g.fillRect(0,0,w,h);
    for(let i=0;i<(n||3000);i++){g.fillStyle=vars[i%vars.length];const s=Math.random()*2.5+.6;g.globalAlpha=Math.random()*.5+.15;g.fillRect(Math.random()*w,Math.random()*h,s,s*(Math.random()*2+.5));}
    g.globalAlpha=1; if(extra)extra(g,w,h);
  },rep||1,rep||1);
};

/* ---------------- audio ---------------- */
let AC=null, master=null, noiseBuf=null;
EQ.soundOn = EQ.LS.get('sound',true);
EQ.audio = function(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=EQ.soundOn?.8:0;master.connect(AC.destination);
    noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}catch(e){AC=null;}}
  if(AC&&AC.state==='suspended')AC.resume();
};
EQ.setSound=function(on){EQ.soundOn=on;EQ.LS.set('sound',on);EQ.audio();if(master)master.gain.value=on?.8:0;};
function noise(dur,freq,q,vol,type,when,attack){
  if(!AC||!EQ.soundOn)return;const t=AC.currentTime+(when||0);
  const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q;
  const g=AC.createGain();
  if(attack){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+attack);}else g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*1.5);s.stop(t+dur+.05);
}
function tone(freq,dur,type,vol,to,when){
  if(!AC||!EQ.soundOn)return;const t=AC.currentTime+(when||0);
  const o=AC.createOscillator();o.type=type||'sine';o.frequency.setValueAtTime(freq,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);
  const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);
}
const loops={};
EQ.loop = function(name,vol,freq,q,type){
  if(!AC)return;
  let L=loops[name];
  if(!L){
    if(vol<=0)return;
    const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type=type||'bandpass';f.frequency.value=freq||800;f.Q.value=q||.7;
    const g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(master);s.start();
    L=loops[name]={s,f,g};
  }
  if(freq)L.f.frequency.setTargetAtTime(freq,AC.currentTime,.1);
  L.g.gain.setTargetAtTime(EQ.soundOn?Math.max(0,vol):0,AC.currentTime,.25);
};
EQ.stopLoops=function(){for(const k in loops)EQ.loop(k,0);};
let lastClop=0;
EQ.sfx={
  crash(){noise(.5,500,.4,.35,'lowpass',0,.005);noise(.25,2500,.8,.15,'bandpass',.02);tone(160,.3,'square',.06,70);for(let i=0;i<4;i++)tone(1800+Math.random()*1500,.12,'triangle',.03,null,.05+i*.07);},
  glass(){noise(.15,4000,.6,.3,'highpass',0,.003);for(let i=0;i<10;i++)tone(2500+Math.random()*3500,.15+Math.random()*.2,'sine',.04,null,.03+Math.random()*.5);},
  ouch(fem){tone(fem?620:300,.25,'sawtooth',.05,fem?420:200);},
  thud(){noise(.25,200,.6,.3,'lowpass',0,.005);tone(70,.2,'sine',.3,45);},
  alarm(){for(let i=0;i<6;i++){tone(900,.18,'square',.03,null,i*.4);tone(700,.18,'square',.03,null,i*.4+.2);}},
  clop(v,surface){
    if(!AC||!EQ.soundOn)return;const now=performance.now();if(now-lastClop<40)return;lastClop=now;
    v=Math.min(.4,v);
    if(surface==='hard'){noise(.05,1700+Math.random()*500,3,v*.9);tone(260+Math.random()*60,.05,'triangle',v*.5);}
    else if(surface==='water'){noise(.18,1200,.6,v*1.2,'bandpass');}
    else if(surface==='sand'){noise(.09,350+Math.random()*100,1,v,'lowpass');}
    else {noise(.07,600+Math.random()*250,2,v);tone(110,.05,'sine',v*.4);}
  },
  step(surface){if(!AC||!EQ.soundOn)return;noise(.06,surface==='hard'?2000:700,1.5,.06);},
  jump(){noise(.4,900,.6,.12,'lowpass');},
  land(){noise(.2,300,.8,.3,'lowpass');tone(70,.12,'sine',.25);},
  knock(){tone(220,.25,'triangle',.25,110);noise(.2,1500,3,.2);tone(180,.2,'triangle',.2,90,.12);},
  clear(){tone(660,.12,'triangle',.18);tone(990,.18,'triangle',.16,null,.08);},
  ding(){tone(988,.15,'triangle',.22);tone(1319,.3,'triangle',.2,null,.09);},
  ok(){tone(523,.12,'triangle',.18);tone(784,.2,'triangle',.18,null,.1);},
  wrong(){tone(300,.25,'square',.06,200);},
  bump(){tone(120,.2,'sine',.3,60);noise(.15,500,1,.15);},
  beep(hi){tone(hi?880:440,hi?.4:.15,'square',.07);},
  click(){tone(1200,.04,'square',.04);},
  brush(){noise(.16,3000,.8,.08,'bandpass',0,.03);},
  munch(){for(let i=0;i<5;i++)noise(.06,1400+Math.random()*800,1.5,.14,'bandpass',i*.16);},
  snort(){noise(.35,500,.7,.25,'lowpass',0,.02);},
  neigh(){tone(620,.65,'sawtooth',.05,420);tone(780,.45,'sawtooth',.04,560,.12);tone(520,.3,'sawtooth',.03,380,.5);noise(.5,900,2,.03);},
  zip(){noise(.25,2500,1,.08,'bandpass',0,.05);tone(500,.2,'triangle',.06,900);},
  buckle(){tone(1800,.05,'square',.05);tone(2400,.05,'square',.04,null,.06);},
  splash(v){noise(.35,1500,.5,v||.2,'bandpass',0,.01);},
  applause(){if(!AC||!EQ.soundOn)return;for(let i=0;i<120;i++)noise(.035,1800+Math.random()*1800,1.2,.04+Math.random()*.07,'bandpass',Math.random()*2.6*Math.pow(Math.random(),.4));},
  gull(){tone(1500,.25,'sine',.05,1100);tone(1600,.25,'sine',.05,1200,.3);},
  bird(){const f=2500+Math.random()*1500;for(let i=0;i<3;i++)tone(f,.08,'sine',.04,f*1.3,i*.12);},
  horn(dur){if(!AC||!EQ.soundOn)return;dur=dur||(.25+Math.random()*.35);const t=AC.currentTime;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=1800;const g=AC.createGain();
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.02);g.gain.setValueAtTime(.09,t+dur);g.gain.exponentialRampToValueAtTime(.0001,t+dur+.06);f.connect(g);g.connect(master);
    [410,515].forEach(fr=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.connect(f);o.start(t);o.stop(t+dur+.1);});},
  honk2(){EQ.sfx.horn(.18);setTimeout(()=>EQ.sfx.horn(.3),260);},
  pant(v){noise(.2,750,.7,v,'bandpass',0,.05);noise(.28,480,.7,v*.85,'bandpass',.26,.07);},
  blow(v){noise(.5,380,.5,v,'lowpass',0,.04);tone(90,.3,'sine',v*.4,60);},
  siren(){for(let i=0;i<4;i++){tone(700,.45,'sine',.025,950,i*.9);tone(950,.45,'sine',.025,700,i*.9+.45);}},
  woodpecker(){for(let i=0;i<9;i++)noise(.025,1800,4,.12,'bandpass',i*.07);},
  owl(){tone(420,.35,'sine',.04,380);tone(400,.5,'sine',.035,360,.5);},
  rooster(){tone(500,.25,'sawtooth',.025,800);tone(800,.6,'sawtooth',.025,600,.25);},
  moo(){tone(140,1.1,'sawtooth',.04,110);},
  whinnyFar(){tone(700,.5,'sawtooth',.015,480);tone(820,.35,'sawtooth',.012,600,.1);},
  carpass(v){noise(1.2,500,.6,v||.1,'lowpass',0,.5);},
  pigeons(){for(let i=0;i<10;i++)noise(.06,800,1,.1,'bandpass',i*.05);},
  engine(v){if(!AC||!EQ.soundOn)return;tone(70+v*40,.12,'sawtooth',.03);},
  meow(){tone(700,.35,'triangle',.05,520);tone(900,.2,'sine',.03,700,.05);},
  bark(){tone(520,.08,'square',.06,380);tone(480,.09,'square',.05,340,.15);},
  kids(){for(let i=0;i<4;i++)tone(700+Math.random()*500,.12,'sine',.03,900+Math.random()*400,i*.13);},
  bikebell(){tone(2200,.25,'sine',.06);tone(2200,.25,'sine',.05,null,.18);},
  whistle(){tone(2600,.35,'sine',.05,2400);},
  bell(){[0,0.9].forEach(w=>{tone(440,2.5,'sine',.08,null,w);tone(880,1.5,'sine',.03,null,w);});},
};

/* ---------------- input (joystick + azioni) ---------------- */
const IN = EQ.input = {x:0,y:0,active:false,jid:null,ox:0,oy:0,keys:{},jumpQ:0,enabled:false};
const $=id=>document.getElementById(id);
EQ.$=$;
const joy=$('joy'), knob=$('knob'), JR=58;
EQ.joyRest=function(){joy.style.left=Math.min(120,innerWidth*.22)+'px';joy.style.top=(innerHeight-Math.min(130,innerHeight*.24))+'px';knob.style.transform='translate(0,0)';joy.classList.add('idle');};
const tl=$('tl');
tl.addEventListener('pointerdown',e=>{
  e.preventDefault();EQ.audio();if(IN.jid!==null)return;
  IN.jid=e.pointerId;IN.ox=e.clientX;IN.oy=e.clientY;IN.active=true;IN.x=IN.y=0;
  joy.style.left=e.clientX+'px';joy.style.top=e.clientY+'px';joy.classList.remove('idle');
  try{tl.setPointerCapture(e.pointerId);}catch(_){}
});
tl.addEventListener('pointermove',e=>{
  if(e.pointerId!==IN.jid)return;
  let dx=e.clientX-IN.ox,dy=e.clientY-IN.oy;const d=Math.hypot(dx,dy);if(d>JR){dx*=JR/d;dy*=JR/d;}
  IN.x=dx/JR;IN.y=dy/JR;knob.style.transform=`translate(${dx}px,${dy}px)`;
});
const jend=e=>{if(e.pointerId!==IN.jid)return;IN.jid=null;IN.active=false;IN.x=IN.y=0;EQ.joyRest();};
tl.addEventListener('pointerup',jend);tl.addEventListener('pointercancel',jend);
$('tr').addEventListener('pointerdown',e=>{e.preventDefault();EQ.audio();if(EQ.onRightTap)EQ.onRightTap();});
addEventListener('keydown',e=>{IN.keys[e.code]=true;EQ.audio();if(e.code==='Space'){e.preventDefault();if(EQ.onRightTap)EQ.onRightTap();}if(EQ.onKey)EQ.onKey(e.code);});
addEventListener('keyup',e=>{IN.keys[e.code]=false;});
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>e.preventDefault());
EQ.readInput=function(){
  if(IN.active)return{x:IN.x,y:IN.y};
  const k=IN.keys;
  return{x:(k.ArrowRight||k.KeyD?1:0)-(k.ArrowLeft||k.KeyA?1:0),y:(k.ArrowDown||k.KeyS?1:0)-(k.ArrowUp||k.KeyW?1:0)};
};
/* superficie per attività (spazzolare, lavare...) */
const A = EQ.act = {down:false,x:0,y:0,px:0,py:0,moved:0,tap:null};
const actEl=$('act');
actEl.addEventListener('pointerdown',e=>{e.preventDefault();EQ.audio();A.down=true;A.x=A.px=e.clientX;A.y=A.py=e.clientY;A.moved=0;A.id=e.pointerId;try{actEl.setPointerCapture(e.pointerId);}catch(_){}});
actEl.addEventListener('pointermove',e=>{if(!A.down||e.pointerId!==A.id)return;A.moved+=Math.hypot(e.clientX-A.x,e.clientY-A.y);A.x=e.clientX;A.y=e.clientY;});
const aend=e=>{if(e.pointerId!==A.id)return;if(A.down&&A.moved<12)A.tap={x:A.x,y:A.y};A.down=false;};
actEl.addEventListener('pointerup',aend);actEl.addEventListener('pointercancel',aend);

/* proiezione su schermo */
const pv=new V3();
EQ.toScreen=function(v){pv.copy(v).project(camera);return{x:(pv.x*.5+.5)*innerWidth,y:(-pv.y*.5+.5)*innerHeight,z:pv.z};};

/* ---------------- particelle semplici ---------------- */
EQ.Particles = function(max,size,color,opts){
  opts=opts||{};
  const geo=new THREE.BufferGeometry(), pos=new Float32Array(max*3);
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const tex=EQ.canvasTex(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.5,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});
  const mat=new THREE.PointsMaterial({size,map:tex,color:C(color),transparent:true,depthWrite:false,opacity:opts.opacity||.9,sizeAttenuation:true});
  const pts=new THREE.Points(geo,mat); pts.frustumCulled=false;
  const P=[]; for(let i=0;i<max;i++)P.push({life:0,x:0,y:-999,z:0,vx:0,vy:0,vz:0});
  let k=0;
  return {obj:pts,
    emit(x,y,z,vx,vy,vz,life){const p=P[k];k=(k+1)%max;p.x=x;p.y=y;p.z=z;p.vx=vx;p.vy=vy;p.vz=vz;p.life=life||1;},
    update(dt,g){g=g==null?-9:g;for(let i=0;i<max;i++){const p=P[i];if(p.life>0){p.life-=dt;p.vy+=g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(opts.floor!=null&&p.y<opts.floor){p.y=opts.floor;p.vy*=-.2;p.vx*=.5;p.vz*=.5;}if(p.life<=0)p.y=-999;}pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;}geo.attributes.position.needsUpdate=true;},
    clear(){P.forEach(p=>{p.life=0;p.y=-999;});}};
};

/* ---------------- collisioni ---------------- */
// collider: {c:1,x,z,r} cerchio | {x,z,hx,hz,rot} rettangolo orientato
EQ.collide = function(pos,r,list,minY){
  let hit=false;
  for(const c of list){
    if(c.off)continue;
    if(minY!=null&&c.h!=null&&minY>c.h-.3)continue;
    if(c.r!=null){const dx=pos.x-c.x,dz=pos.z-c.z,rr=c.r+r,d2=dx*dx+dz*dz;if(d2<rr*rr){const d=Math.sqrt(d2)||1e-3;pos.x=c.x+dx/d*rr;pos.z=c.z+dz/d*rr;hit=true;}}
    else{
      const cs=Math.cos(c.rot||0), sn=Math.sin(c.rot||0);
      const dx=pos.x-c.x, dz=pos.z-c.z;
      const lx=dx*cs-dz*sn, lz=dx*sn+dz*cs;
      const ex=c.hx+r, ez=c.hz+r;
      if(Math.abs(lx)<ex&&Math.abs(lz)<ez){
        const px=ex-Math.abs(lx), pz=ez-Math.abs(lz);
        let nx=lx,nz=lz; if(px<pz)nx=Math.sign(lx)*ex; else nz=Math.sign(lz)*ez;
        pos.x=c.x+nx*cs+nz*sn; pos.z=c.z-nx*sn+nz*cs; hit=true;
      }
    }
  }
  return hit;
};
EQ.segX=function(p0x,p0z,p1x,p1z,ax,az,bx,bz){
  const d=(p1x-p0x)*(bz-az)-(p1z-p0z)*(bx-ax);if(Math.abs(d)<1e-9)return false;
  const t=((ax-p0x)*(bz-az)-(az-p0z)*(bx-ax))/d,u=((ax-p0x)*(p1z-p0z)-(az-p0z)*(p1x-p0x))/d;
  return t>=0&&t<=1&&u>=-.02&&u<=1.02;
};

/* testo su canvas (cartelli, sprite) */
EQ.labelTex=function(text,opt){
  opt=Object.assign({w:512,h:128,bg:'#2f6b33',fg:'#fff',font:'bold 64px Fredoka, Trebuchet MS, sans-serif',radius:24,border:null},opt||{});
  return EQ.canvasTex(opt.w,opt.h,(g,w,h)=>{
    g.fillStyle=opt.bg;const r=opt.radius;g.beginPath();g.moveTo(r,0);g.arcTo(w,0,w,h,r);g.arcTo(w,h,0,h,r);g.arcTo(0,h,0,0,r);g.arcTo(0,0,w,0,r);g.fill();
    if(opt.border){g.strokeStyle=opt.border;g.lineWidth=8;g.stroke();}
    g.fillStyle=opt.fg;g.font=opt.font;g.textAlign='center';g.textBaseline='middle';
    const m=/(\d+)px/.exec(opt.font);if(m){let px=Math.min(+m[1],Math.floor(h*.7));const mw=w-2*opt.radius-12;g.font=opt.font.replace(/\d+px/,px+'px');while(px>10&&g.measureText(text).width>mw){px-=2;g.font=opt.font.replace(/\d+px/,px+'px');}}
    g.fillText(text,w/2,h/2+3);
  });
};

return EQ;
})();
