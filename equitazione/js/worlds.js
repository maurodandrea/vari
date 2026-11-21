/* Giorgia a Cavallo – mondi: maneggio, spiaggia, bosco, città */
'use strict';
(function(){
const {U,G,mat,mesh,C,V3,TAU,scene}=EQ;
const rnd=U.rnd;
const Q=()=>EQ.hiQ?1:.6;

/* ======================= TEXTURE ======================= */
const TXc={};
const TX=EQ.TX={
  grass(){return TXc.grass||(TXc.grass=EQ.canvasTex(512,512,(g,w,h)=>{
    g.fillStyle='#55823a';g.fillRect(0,0,w,h);
    for(let i=0;i<60;i++){const x=Math.random()*w,y=Math.random()*h,r=30+Math.random()*80;const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,Math.random()<.5?'rgba(120,150,60,.25)':'rgba(40,80,30,.25)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-r,y-r,2*r,2*r);}
    for(let i=0;i<26000;i++){const hue=80+Math.random()*35,l=22+Math.random()*26;g.strokeStyle=`hsla(${hue},${40+Math.random()*25}%,${l}%,.8)`;g.lineWidth=1;const x=Math.random()*w,y=Math.random()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+(Math.random()-.5)*3,y-2-Math.random()*5);g.stroke();}
    for(let i=0;i<300;i++){g.fillStyle=Math.random()<.5?'rgba(150,130,80,.35)':'rgba(255,255,255,.18)';g.fillRect(Math.random()*w,Math.random()*h,2,2);}
  },1,1));},
  gravel(){return TXc.gravel||(TXc.gravel=EQ.noiseTex('#a69a86',['#8b806e','#c4b9a5','#776c5c','#d6ccb8','#9a8f7c'],14000,512));},
  sand(base){base=base||'#d2b48a';return TXc['s'+base]||(TXc['s'+base]=EQ.noiseTex(base,['rgba(120,90,55,.6)','rgba(255,245,225,.6)','rgba(160,125,85,.5)'],16000,512,1,(g,w,h)=>{g.strokeStyle='rgba(120,90,60,.10)';g.lineWidth=3;for(let y=0;y<h;y+=11){g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=16)g.lineTo(x,y+Math.sin(x*.04+y)*2);g.stroke();}}));},
  wood(col,dark){const k='w'+col;return TXc[k]||(TXc[k]=EQ.canvasTex(256,256,(g,w,h)=>{
    g.fillStyle=col;g.fillRect(0,0,w,h);
    for(let x=0;x<w;x+=32){g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x,0,2,h);g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},0,.04)`;g.fillRect(x+2,0,30,h);}
    for(let i=0;i<500;i++){g.strokeStyle=`rgba(0,0,0,${.05+Math.random()*.1})`;g.lineWidth=1;const x=Math.random()*w;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+3,h*.3,x-3,h*.7,x+Math.random()*4,h);g.stroke();}
    for(let i=0;i<8;i++){g.fillStyle='rgba(60,30,10,.35)';g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,3,7,0,0,TAU);g.fill();}
  }));},
  plaster(col){const k='p'+col;return TXc[k]||(TXc[k]=EQ.noiseTex(col,['rgba(0,0,0,.08)','rgba(255,255,255,.12)','rgba(80,60,40,.08)'],6000,256,1,(g,w,h)=>{const gr=g.createLinearGradient(0,h,0,h*.75);gr.addColorStop(0,'rgba(60,50,40,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}));},
  tiles(){return TXc.tiles||(TXc.tiles=EQ.canvasTex(256,256,(g,w,h)=>{
    g.fillStyle='#9c4a2c';g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=21)for(let x=-(y/21%2)*16;x<w;x+=32){const gr=g.createLinearGradient(x,0,x+32,0);gr.addColorStop(0,'#6e2d18');gr.addColorStop(.5,['#c0603a','#b5583a','#c86d45','#a9502f'][Math.random()*4|0]);gr.addColorStop(1,'#6e2d18');g.fillStyle=gr;g.fillRect(x,y,32,19);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y+18,32,3);}
  }));},
  straw(){return TXc.straw||(TXc.straw=EQ.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#c9a85a';g.fillRect(0,0,w,h);
    for(let i=0;i<3000;i++){g.strokeStyle=`hsla(${40+Math.random()*12},${50+Math.random()*30}%,${40+Math.random()*35}%,.9)`;g.lineWidth=1+Math.random();const x=Math.random()*w,y=Math.random()*h,a=Math.random()*TAU,l=6+Math.random()*16;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}}));},
  concrete(){return TXc.conc||(TXc.conc=EQ.noiseTex('#a3a19b',['rgba(0,0,0,.12)','rgba(255,255,255,.15)'],9000,256,1,(g,w,h)=>{g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.strokeRect(0,0,w,h);}));},
  asphalt(){return TXc.asph||(TXc.asph=EQ.noiseTex('#4a4a4d',['#3c3c3f','#5a5a5e','#2f2f31','#68686b'],22000,512));},
  paving(){return TXc.pav||(TXc.pav=EQ.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#b9b2a6';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=64){g.fillStyle=`hsl(35,${8+Math.random()*6}%,${66+Math.random()*8}%)`;g.fillRect(x+1+((y/32)%2)*32,y+1,62,30);}g.fillStyle='rgba(0,0,0,.05)';for(let i=0;i<4000;i++)g.fillRect(Math.random()*w,Math.random()*h,1,1);}));},
  cobble(){return TXc.cob||(TXc.cob=EQ.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#4a4540';g.fillRect(0,0,w,h);const s=16;for(let y=0;y<h;y+=s)for(let x=0;x<w;x+=s){const l=34+Math.random()*16;g.fillStyle=`hsl(${25+Math.random()*15},${8+Math.random()*8}%,${l}%)`;g.beginPath();g.ellipse(x+s/2+(Math.random()-.5)*2,y+s/2,s/2-1.2,s/2-1.2,Math.random(),0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.ellipse(x+s/2-2,y+s/2-2,3,2,0,0,TAU);g.fill();}}));},
  leaves(){return TXc.leaves||(TXc.leaves=EQ.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const l=55+Math.random()*45;g.fillStyle=`hsl(0,0%,${l}%)`;g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,2+Math.random()*4,1+Math.random()*2,Math.random()*TAU,0,TAU);g.fill();}}));},
  bark(){return TXc.bark||(TXc.bark=EQ.canvasTex(128,256,(g,w,h)=>{g.fillStyle='#5b4634';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){g.strokeStyle=`rgba(${Math.random()<.5?20:120},${Math.random()<.5?15:100},10,.4)`;g.lineWidth=1+Math.random()*3;const x=Math.random()*w;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+6,h*.3,x-6,h*.6,x+Math.random()*8-4,h);g.stroke();}},1,2));},
  forestFloor(){return TXc.ff||(TXc.ff=EQ.noiseTex('#ffffff',['rgba(90,70,40,.35)','rgba(40,60,20,.35)','rgba(255,255,255,.3)','rgba(120,90,50,.3)'],22000,512));},
  sandWhite(){return TXc.sw||(TXc.sw=EQ.noiseTex('#ffffff',['rgba(0,0,0,.18)','rgba(255,255,255,.5)','rgba(120,90,50,.22)'],26000,512,1,(g,w,h)=>{g.strokeStyle='rgba(0,0,0,.05)';g.lineWidth=4;for(let y=0;y<h;y+=14){g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=20)g.lineTo(x,y+Math.sin(x*.03+y*.3)*3);g.stroke();}}));},
  fern(){return TXc.fern||(TXc.fern=EQ.canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let f=0;f<7;f++){const a=-Math.PI/2+(f-3)*.32;g.strokeStyle='#2f5a22';g.lineWidth=2;let x=64,y=128;const ex=64+Math.cos(a)*110,ey=128+Math.sin(a)*110;g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();for(let k=1;k<14;k++){const t=k/14,px=x+(ex-x)*t,py=y+(ey-y)*t,l=14*(1-t)+3;g.fillStyle=`hsl(${95+Math.random()*20},45%,${25+Math.random()*15}%)`;for(const s of[1,-1]){g.beginPath();g.ellipse(px+Math.cos(a+s*1.3)*l/2,py+Math.sin(a+s*1.3)*l/2,l/2,2.2,a+s*1.3,0,TAU);g.fill();}}}},1,1,true));},
  tuft(){return TXc.tuft||(TXc.tuft=EQ.canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<46;i++){const x=20+Math.random()*88,hh=50+Math.random()*75,c=(Math.random()-.5)*40;g.strokeStyle=`hsl(${75+Math.random()*30},${45+Math.random()*20}%,${25+Math.random()*25}%)`;g.lineWidth=2+Math.random()*2;g.beginPath();g.moveTo(x,128);g.quadraticCurveTo(x+c*.3,128-hh*.6,x+c,128-hh);g.stroke();}}));},
  window(wall,shut){const k='win'+wall+shut;return TXc[k]||(TXc[k]=EQ.canvasTex(128,128,(g,w,h)=>{
    g.fillStyle=wall;g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle=Math.random()<.5?'rgba(0,0,0,.06)':'rgba(255,255,255,.08)';g.fillRect(Math.random()*w,Math.random()*h,2,2);}
    g.fillStyle='rgba(255,255,255,.55)';g.fillRect(36,22,56,84);
    const gr=g.createLinearGradient(0,26,0,100);gr.addColorStop(0,'#5d7590');gr.addColorStop(.5,'#2b3644');gr.addColorStop(1,'#1c232c');g.fillStyle=gr;g.fillRect(40,26,48,76);
    g.fillStyle='rgba(255,255,255,.7)';g.fillRect(62,26,4,76);g.fillRect(40,60,48,3);
    g.fillStyle=shut;g.fillRect(18,24,20,80);g.fillRect(90,24,20,80);g.fillStyle='rgba(0,0,0,.25)';for(let y=28;y<102;y+=6){g.fillRect(18,y,20,2);g.fillRect(90,y,20,2);}
    g.fillStyle='#ddd6c8';g.fillRect(32,104,64,6);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(32,110,64,3);
    g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,0,w,3);
  }));},
  shop(wall,name,col){const k='shop'+wall+name;return TXc[k]||(TXc[k]=EQ.canvasTex(256,128,(g,w,h)=>{
    g.fillStyle=wall;g.fillRect(0,0,w,h);g.fillStyle='#3b3029';g.fillRect(14,30,228,98);
    const gr=g.createLinearGradient(0,34,0,128);gr.addColorStop(0,'#8aa3b8');gr.addColorStop(1,'#233040');g.fillStyle=gr;g.fillRect(20,36,150,92);g.fillStyle='#4a3a30';g.fillRect(180,36,56,92);
    g.fillStyle='rgba(255,230,160,.5)';g.fillRect(24,90,140,30);g.fillStyle='#c9a24a';g.fillRect(222,80,4,10);
    g.fillStyle=col;g.fillRect(10,4,236,24);g.fillStyle='#fff';g.font='bold 20px Fredoka, Trebuchet MS, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(name,128,17);
  }));},
  stripes(a,b){const k='str'+a+b;return TXc[k]||(TXc[k]=EQ.canvasTex(128,32,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?a:b;g.fillRect(i*16,0,16,h);}g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,h-4,w,4);}));},
};

/* ======================= HELPER ======================= */
const dummy=new THREE.Object3D(), tc=new THREE.Color();
function inst(geo,material,arr,cast){
  const m=new THREE.InstancedMesh(geo,material,Math.max(1,arr.length));
  const anyCol=arr.some(a=>a.col!=null);
  arr.forEach((a,i)=>{dummy.position.set(a.x,a.y||0,a.z);dummy.rotation.set(a.rx||0,a.ry||0,a.rz||0);
    const s=a.s||1;dummy.scale.set(a.sx||s,a.sy||s,a.sz||s);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
    if(anyCol){tc.copy(C(a.col!=null?a.col:0xffffff));if(a.cm)tc.multiplyScalar(a.cm);m.setColorAt(i,tc);}});
  m.count=arr.length; m.castShadow=cast!==false; m.receiveShadow=true; return m;
}
EQ.inst=inst;
function blob(r,det,seed,amt){
  let g=new THREE.IcosahedronGeometry(r,det||1); g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g=THREE.BufferGeometryUtils.mergeVertices(g);
  const p=g.attributes.position, v=new V3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=1+(U.noise(v.x*2.1+seed,v.y*2.1+v.z*1.7)-.5)*(amt||.45);p.setXYZ(i,v.x*n,v.y*n,v.z*n);}
  g.computeVertexNormals();
  // uv sferiche per texture foglie
  const uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();uv[i*2]=Math.atan2(v.z,v.x)/TAU+.5;uv[i*2+1]=v.y*.5+.5;}
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  return g;
}
let KIT=null;
function treeKit(){
  if(KIT)return KIT;
  const leaves=TX.leaves(); leaves.repeat.set(3,3);
  const fol=new THREE.MeshStandardMaterial({map:leaves,roughness:.95,color:0xffffff});
  const bark=new THREE.MeshStandardMaterial({map:TX.bark(),roughness:.95});
  const oakC=EQ.merge([[0,6.6,0,2.4],[1.6,6.1,.6,1.9],[-1.5,6.3,-.4,2],[.3,7.6,-1.2,1.9],[-.4,5.6,1.5,1.7],[.9,7.9,.9,1.5],[-1.1,7.5,.6,1.5]].map((b,i)=>EQ.xform(blob(b[3],1,i*3.1),b[0],b[1],b[2])));
  const oakT=EQ.merge([EQ.xform(G.cyl(.22,.38,5.6,9),0,2.8,0),EQ.xform(G.cyl(.08,.15,2.6,6),.7,5.2,0,0,0,-.7),EQ.xform(G.cyl(.08,.14,2.4,6),-.6,5.4,.2,.3,0,.6)]);
  const sprC=EQ.merge([0,1,2,3,4,5,6].map(i=>{const t=i/6,r=2.7*(1-t)+.5,h=2.6;return EQ.xform(blob(1,1,i*2.3,.35),0,2.2+i*1.45,0,0,i,0,r,h/1.6,r);}));
  const sprT=EQ.xform(G.cyl(.14,.3,11,8),0,5.5,0);
  const umbT=EQ.loft([[0,0,0,.32],[.3,3,.1,.26],[.9,6,.2,.22],[1.6,8.6,.3,.17],[1.9,9.6,.3,.14]],9,3);
  const umbC=EQ.merge([[1.9,10.2,.3,2.8],[3.6,9.8,.8,2.2],[.2,9.9,-.6,2.2],[2.4,10.4,-1.8,2],[1.4,10.1,2.2,2]].map((b,i)=>EQ.xform(blob(b[3],1,i*5.3,.3),b[0],b[1],b[2],0,0,0,1,.42,1)));
  const popC=EQ.merge([EQ.xform(blob(1,2,1.7,.3),0,8,0,0,0,0,1.6,5.2,1.6)]);
  const popT=EQ.xform(G.cyl(.15,.28,8,8),0,4,0);
  const palmT=EQ.loft([[0,0,0,.25],[.2,3,0,.2],[.6,6,0,.18],[1.1,8,0,.16]],8,3);
  KIT={fol,bark,oak:[oakT,oakC],spruce:[sprT,sprC],umbrella:[umbT,umbC],poplar:[popT,popC]};
  return KIT;
}
function addTrees(W,type,list,colors,collR){
  const K=treeKit();
  const t=inst(K[type][0],K.bark,list.map(a=>({x:a.x,y:a.y||0,z:a.z,ry:a.ry,s:a.s})));
  const c=inst(K[type][1],K.fol,list.map((a,i)=>({x:a.x,y:a.y||0,z:a.z,ry:a.ry,s:a.s,col:colors[i%colors.length],cm:.75+Math.random()*.4})));
  W.group.add(t,c);
  if(collR)list.forEach(a=>W.colliders.push({x:a.x,z:a.z,r:collR*(a.s||1)}));
}
function tufts(W,list,col){
  const tex=TX.tuft();
  const m=new THREE.MeshStandardMaterial({map:tex,alphaTest:.45,side:THREE.DoubleSide,roughness:1,color:C(col||0xffffff)});
  const g=EQ.merge([EQ.xform(new THREE.PlaneGeometry(.7,.5),0,.25,0),EQ.xform(new THREE.PlaneGeometry(.7,.5),0,.25,0,0,Math.PI/2,0)]);
  const mm=inst(g,m,list,false); W.group.add(mm); return mm;
}
function ground(W,size,tex,rep,y,col){
  const t=tex.clone(); t.needsUpdate=true; t.repeat.set(rep,rep); W.tex.push(t);
  const g=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshStandardMaterial({map:t,roughness:1,color:C(col||0xffffff)}));
  g.rotation.x=-Math.PI/2; g.position.y=y||0; g.receiveShadow=true; W.group.add(g); return g;
}
function patch(W,x,z,w,d,tex,rep,y,rough){
  const t=tex.clone(); t.needsUpdate=true; t.repeat.set(w/rep,d/rep); W.tex.push(t);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:t,roughness:rough==null?1:rough}));
  m.rotation.x=-Math.PI/2; m.position.set(x,y||.01,z); m.receiveShadow=true; W.group.add(m); return m;
}
function boxT(W,parent,w,h,d,x,y,z,tex,rep,col,rough){ // box con texture scalata
  const t=tex.clone(); t.needsUpdate=true; t.repeat.set(Math.max(w,d)/rep,h/rep); W.tex.push(t);
  return mesh(G.box(w,h,d),new THREE.MeshStandardMaterial({map:t,roughness:rough==null?.9:rough,color:C(col||0xffffff)}),x,y,z,parent);
}
/* terreno con altezza e colori per vertice */
function terrain(W,sx,sz,cx,cz,nx,nz,hf,cf,tex,rep){
  const g=new THREE.PlaneGeometry(sx,sz,nx,nz); g.rotateX(-Math.PI/2);
  const p=g.attributes.position, col=new Float32Array(p.count*3), c=new THREE.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=p.getZ(i)+cz;p.setY(i,hf(x,z));cf(x,z,c);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.computeVertexNormals();
  const t=tex.clone(); t.needsUpdate=true; t.repeat.set(sx/rep,sz/rep); W.tex.push(t);
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:t,vertexColors:true,roughness:1}));
  m.position.set(cx,0,cz); m.receiveShadow=true; W.group.add(m); return m;
}
function sign(W,text,x,y,z,ry,w,h,bg,fg){
  const t=EQ.labelTex(text,{bg:bg||'#2f4d2a',fg:fg||'#fff',w:512,h:128}); W.tex.push(t);
  const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.6}),x,y,z,W.group);m.rotation.y=ry||0;
  const b=mesh(G.box(w+.1,h+.1,.05),mat(0x4a3420,.8),0,0,-.03,m);
  return m;
}
/* staccionata in legno lungo una polilinea */
function woodFence(W,pts,opt){
  opt=Object.assign({h:1.2,rails:3,col:0x8a6a48,post:2.5,coll:true,white:false},opt||{});
  const geos=[];
  for(let k=0;k<pts.length-1;k++){
    const [ax,az]=pts[k],[bx,bz]=pts[k+1],L=Math.hypot(bx-ax,bz-az),a=Math.atan2(bz-az,bx-ax),n=Math.max(1,Math.round(L/opt.post));
    for(let i=0;i<=n;i++){const t=i/n;geos.push(EQ.xform(G.box(.14,opt.h+.1,.14),ax+(bx-ax)*t,(opt.h+.1)/2,az+(bz-az)*t,0,-a,0));}
    for(let r=0;r<opt.rails;r++){const y=opt.h*(r+1)/opt.rails-.05;geos.push(EQ.xform(G.box(L,.12,.05),(ax+bx)/2,y,(az+bz)/2,0,-a,0));}
    if(opt.coll){W.colliders.push({x:(ax+bx)/2,z:(az+bz)/2,hx:L/2,hz:.12,rot:a,fence:true});}
    if(opt.jump)W.jumps.push({ax,az,bx,bz,h:opt.h});
  }
  const m=mesh(EQ.merge(geos),opt.white?mat(0xf4f4f0,.6):new THREE.MeshStandardMaterial({map:TX.wood('#'+opt.col.toString(16).padStart(6,'0')),roughness:.85}),0,0,0,W.group);
  return m;
}
function roofGeo(w,d,h,alongZ){ // tetto a capanna: colmo lungo x (o z)
  const a=alongZ?w:d, L=alongZ?d:w;
  const sh=new THREE.Shape(); sh.moveTo(-a/2,0); sh.lineTo(a/2,0); sh.lineTo(0,h); sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:L,bevelEnabled:false}); g.translate(0,0,-L/2);
  const uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*.35,uv.getY(i)*.35);
  if(!alongZ)g.rotateY(Math.PI/2);
  return g;
}
EQ.roofGeo=roofGeo;
function newWorld(name){
  const W={name,group:new THREE.Group(),colliders:[],jumps:[],items:[],tex:[],updaters:[],spots:{},dyn:[]};
  scene.add(W.group);
  W.height=()=>0; W.surface=()=>'grass'; W.water=()=>-99;
  W.update=(dt,t,p)=>{for(const u of W.updaters)u(dt,t,p);};
  W.dispose=()=>{scene.remove(W.group);W.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});W.tex.forEach(t=>t.dispose());EQ.stopLoops();};
  return W;
}
EQ.addTrees=addTrees;

/* ======================= ACQUA (shader) ======================= */
EQ.shoreX=z=>30+4*Math.sin(z*.03)+2*Math.sin(z*.11);
function makeWater(geo,o){
  o=Object.assign({beach:0,amp:.1,alpha:.85,shallow:0x3aa7b4,deep:0x0b4566,sky:0xa8cbe6},o||{});
  const uniforms=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{time:{value:0},sunDir:{value:new V3()},shallow:{value:C(o.shallow)},deep:{value:C(o.deep)},skyC:{value:C(o.sky)},amp:{value:o.amp},beach:{value:o.beach},alpha:{value:o.alpha}}]);
  const common=`uniform float time; uniform float amp; uniform float beach;
    float shoreX(float z){return 30.0+4.0*sin(z*0.03)+2.0*sin(z*0.11);}
    float waveH(vec2 p){float d=beach>0.5?p.x-shoreX(p.y):12.0;float a=amp*smoothstep(-1.0,20.0,d);
      float h=sin(p.x*0.35-time*1.6+sin(p.y*0.1))*a+sin(p.y*0.42+p.x*0.2+time*1.1)*a*0.6+sin((p.x+p.y)*1.1-time*2.3)*a*0.25;
      if(beach>0.5){float ph=fract(d*0.07+time*0.12);h+=amp*1.4*smoothstep(0.82,1.0,ph)*smoothstep(0.0,5.0,d)*(1.0-smoothstep(12.0,40.0,d));}
      return h;}`;
  const m=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,fog:true,
    vertexShader:common+`varying vec3 vW; varying vec3 vN;
      #include <fog_pars_vertex>
      void main(){vec4 w=modelMatrix*vec4(position,1.0);float e=0.4;float h=waveH(w.xz);
        float hx=waveH(w.xz+vec2(e,0.0)),hz=waveH(w.xz+vec2(0.0,e));
        vN=normalize(vec3(-(hx-h)/e,1.0,-(hz-h)/e));w.y+=h;vW=w.xyz;
        vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader:common+`uniform vec3 shallow; uniform vec3 deep; uniform vec3 skyC; uniform vec3 sunDir; uniform float alpha;
      varying vec3 vW; varying vec3 vN;
      #include <fog_pars_fragment>
      void main(){
        vec3 n=normalize(vN+vec3(sin(vW.x*3.1+time*2.0)*0.05+sin(vW.z*2.3-time*1.7)*0.04+sin((vW.x-vW.z)*7.0+time*3.3)*0.02,0.0,cos(vW.z*2.7+time*1.3)*0.05+sin((vW.x+vW.z)*4.0-time*3.0)*0.03));
        vec3 V=normalize(cameraPosition-vW);
        float fres=pow(1.0-max(dot(n,V),0.0),4.0)*0.85+0.05;
        float d=beach>0.5?vW.x-shoreX(vW.z):6.0;
        vec3 base=mix(shallow,deep,smoothstep(1.0,45.0,d));
        vec3 col=mix(base,skyC,fres);
        vec3 R=reflect(-V,n);float spec=pow(max(dot(R,normalize(sunDir)),0.0),220.0)*4.0+pow(max(dot(R,normalize(sunDir)),0.0),30.0)*0.15;
        col+=vec3(1.0,0.95,0.85)*spec;
        float foam=0.0;
        if(beach>0.5){float ph=fract(d*0.07+time*0.12);
          foam=smoothstep(1.8,0.0,d)*(0.65+0.35*sin(vW.z*1.3+time*1.5+sin(vW.x*3.0)));
          foam+=smoothstep(0.9,1.0,ph)*smoothstep(1.0,4.0,d)*(1.0-smoothstep(12.0,30.0,d))*(0.55+0.45*sin(vW.z*0.8+time));
          foam*=0.75+0.25*sin(vW.z*5.0+vW.x*3.0+time*2.0);}
        foam=clamp(foam,0.0,1.0);
        col=mix(col,vec3(0.96,0.97,0.98),foam);
        float a=beach>0.5?clamp(smoothstep(-0.6,3.0,d)*0.9+0.1,0.0,1.0):alpha;
        a=max(a,foam*smoothstep(-0.8,0.0,d));
        if(beach>0.5)a*=smoothstep(-1.2,-0.2,d);
        gl_FragColor=vec4(col,a);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
      }`});
  const w=new THREE.Mesh(geo,m); w.renderOrder=1;
  w.onBeforeRender=()=>{uniforms.time.value=performance.now()/1000;uniforms.sunDir.value.copy(EQ.sunDir);};
  return w;
}

/* ======================= OSTACOLI (salto) ======================= */
const RAILCOL=[[0xd62828,0xffffff],[0x1d4ed8,0xffffff],[0x16a34a,0xffffff],[0xf59e0b,0x1e3a8a],[0x9333ea,0xffffff],[0xe11d48,0xfacc15],[0x0891b2,0xffffff],[0x111827,0xfacc15],[0xea580c,0xffffff]];
const railMats={};
function railMat(a,b){const k=a+'_'+b;if(!railMats[k]){const t=EQ.canvasTex(4,64,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle='#'+(i%2?b:a).toString(16).padStart(6,'0');g.fillRect(0,i*8,w,8);}});railMats[k]=new THREE.MeshStandardMaterial({map:t,roughness:.45});}return railMats[k];}
function numSprite(n){
  const t=EQ.canvasTex(128,128,(g)=>{g.fillStyle='#fff';g.beginPath();g.arc(64,64,58,0,TAU);g.fill();g.lineWidth=8;g.strokeStyle='#2f6b33';g.stroke();g.fillStyle='#2f6b33';g.font='bold 76px Fredoka, Trebuchet MS, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(n,64,70);});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t}));s.scale.set(.8,.8,1);return s;
}
EQ.buildObstacle=function(parent,d,idx){
  const [x,z,deg,type,h]=d, th=deg*EQ.D2R, W=4;
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=th; parent.add(g);
  const cols=RAILCOL[idx%RAILCOL.length], rm=railMat(cols[0],cols[1]);
  const planes=[], pdz=type==='o'?[-.6,.6]:[0], maxH=h+(type==='o'?.05:0);
  const white=mat(0xf6f6f2,.5);
  pdz.forEach((dz,pi)=>{
    const ph=h+(pi===1?.05:0);
    for(const s of [-1,1]){mesh(G.box(.13,ph+.45,.13),white,s*(W/2+.1),(ph+.45)/2,dz,g);mesh(G.box(.17,.08,.17),mat(cols[0],.5),s*(W/2+.1),ph+.49,dz,g);}
    let top=null;
    for(let y=ph,ri=0;y>.22;y-=.32,ri++){
      const r=mesh(G.cyl(.055,.055,W,12),rm,0,y,dz,g); r.rotation.z=Math.PI/2;
      if(ri===0){top=r;r.userData.base={p:r.position.clone(),r:r.rotation.clone()};}
      for(const s of [-1,1])mesh(G.box(.1,.06,.12),mat(0x999999,.4,.6),s*(W/2-.02),y-.06,dz,g);
    }
    planes.push({dz,h:ph,rail:top});
  });
  mesh(G.cyl(.06,.06,W,10),rm,0,.07,pdz[0]-.35,g).rotation.z=Math.PI/2;
  const dep=type==='o'?1.9:.6;
  for(const s of [-1,1]){
    const wx=s*(W/2+.65);
    mesh(G.box(.1,maxH+.7,.1),white,wx+s*.45,(maxH+.7)/2,0,g);
    mesh(G.box(.9,.09,dep),mat(cols[0],.5),wx,maxH+.35,0,g);
    mesh(G.box(.9,.09,dep),mat(cols[0],.5),wx,(maxH+.35)*.5,0,g);
    for(const dd of [dep/2,-dep/2]){const di=mesh(G.box(1.26,.07,.06),white,wx,(maxH+.35)*.72,dd,g);di.rotation.z=s*.6;}
    const fx=s*(W/2+1.1);
    mesh(G.cyl(.02,.02,.7,6),mat(0x444444,.5),fx,maxH+1.4,0,g);
    mesh(G.box(.02,.24,.34),mat(s<0?0xe11d48:0xffffff,.7),fx,maxH+1.6,-.17,g);
    mesh(G.box(.7,.35,.5),mat(0x8a5a2b,.8),wx,.17,-dep/2-.45,g);
    const fl=mesh(G.sph(.32,10,8),mat(idx%2?0xff6fa8:0xffd23f,.8),wx,.42,-dep/2-.45,g);fl.scale.y=.6;
  }
  const ns=numSprite(idx+1); ns.position.set(W/2+.65,maxH+1.25,0); g.add(ns);
  return {g,th,fwd:new V3(Math.sin(th),0,Math.cos(th)),right:new V3(-Math.cos(th),0,Math.sin(th)),pos:new V3(x,0,z),planes,done:false,faulted:false,num:idx+1,W,type,h};
};

/* ======================= MANEGGIO ======================= */
EQ.buildYard=function(){
  const W=newWorld('yard');
  W.sky={elev:38,azim:140,turb:3.5,ray:1.3,fog:0xb3c8d8,near:90,far:480};
  const grp=W.group;
  ground(W,700,TX.grass(),110);
  // zone
  patch(W,-14,14,76,34,TX.gravel(),5,.012);
  patch(W,0,-4,8,10,TX.gravel(),5,.012);
  const A={cx:0,cz:-32,hx:34,hz:22}; W.spots.arena=A;
  patch(W,A.cx,A.cz,A.hx*2,A.hz*2,TX.sand(),4,.02,1);
  W.surface=(x,z)=>{
    if(Math.abs(x-A.cx)<A.hx&&Math.abs(z-A.cz)<A.hz)return'sand';
    if(x>-52&&x<24&&z>-3&&z<31)return'hard';
    return'grass';
  };
  // recinto campo
  const fw=mat(0xf6f6f2,.55);
  {const geos=[];const ax=A.hx,az=A.hz;
   const seg=(x1,z1,x2,z2)=>{const L=Math.hypot(x2-x1,z2-z1),a=Math.atan2(z2-z1,x2-x1),n=Math.round(L/3);for(let i=0;i<=n;i++){const t=i/n;geos.push(EQ.xform(G.box(.15,1.3,.15),A.cx+x1+(x2-x1)*t,.65,A.cz+z1+(z2-z1)*t));}
     for(const y of [.5,.95])geos.push(EQ.xform(G.box(L,.13,.07),A.cx+(x1+x2)/2,y,A.cz+(z1+z2)/2,0,-a,0));
     W.colliders.push({x:A.cx+(x1+x2)/2,z:A.cz+(z1+z2)/2,hx:L/2,hz:.15,rot:a,fence:true});};
   seg(-ax,-az,ax,-az);seg(-ax,-az,-ax,az);seg(ax,-az,ax,az);seg(-ax,az,-3.5,az);seg(3.5,az,ax,az);
   mesh(EQ.merge(geos),fw,0,0,0,grp);
   // cancello del campo (chiuso solo in gara)
   const gate=new THREE.Group();grp.add(gate);for(const y of [.5,.95])mesh(G.box(7,.13,.07),mat(0xc0392b,.5),0,y,A.cz+az,gate);
   W.arenaGate=gate; gate.visible=false; W.gateColl={x:0,z:A.cz+az,hx:3.5,hz:.15,off:true}; W.colliders.push(W.gateColl);
   const words=['GIORGIA','CIRCOLO IPPICO','SCUDERIA','SALTO OSTACOLI','BRAVA!','GRAN PREMIO'];const bc=['#2f6b33','#c0392b','#1d4ed8','#7c3aed','#d97706','#0f766e'];
   let k=0;const board=(x,z,ry)=>{const t=EQ.labelTex(words[k%6],{bg:bc[k%6],w:512,h:96,radius:6,font:'bold 54px Fredoka, Trebuchet MS, sans-serif'});k++;W.tex.push(t);const m=mesh(new THREE.PlaneGeometry(4,.75),new THREE.MeshStandardMaterial({map:t,roughness:.6}),x,.45,z,grp);m.rotation.y=ry;};
   for(let x=-28;x<=28;x+=11)board(x,A.cz-az+.08,0);
   for(let z=-14;z<=14;z+=9){board(A.cx-ax+.08,A.cz+z,Math.PI/2);board(A.cx+ax-.08,A.cz+z,-Math.PI/2);}
  }
  W.spots.gateIn={x:0,z:A.cz+A.hz+3};
  // tribunetta con pubblico
  {const g=new THREE.Group();g.position.set(A.cx+A.hx+5,0,A.cz);g.rotation.y=-Math.PI/2;grp.add(g);
   for(let r=0;r<4;r++)mesh(G.box(26,.5+r*.55,1.5),mat(0x9aa3ad,.8),0,(.5+r*.55)/2,1.5*r+.75,g);
   mesh(G.box(28,.2,7.5),mat(0x2f6b33,.7),0,4.6,3,g);
   for(const x of [-13,13])for(const z of [0.2,5.8])mesh(G.box(.2,4.6,.2),mat(0x666666,.5,.5),x,2.3,z,g);
   const crowd=[];const sh=[0xe74c3c,0x3498db,0xf1c40f,0x2ecc71,0x9b59b6,0xffffff,0xe67e22,0x1abc9c,0xff6fa8,0x34495e];
   for(let r=0;r<4;r++)for(let x=-12;x<=12;x+=1.1){if(Math.random()<.35)continue;crowd.push({x:x+rnd(-.2,.2),y:.5+r*.55+.32,z:1.5*r+.7,col:sh[Math.random()*10|0]});}
   g.add(inst(G.box(.42,.6,.3),mat(0xffffff,.8),crowd));
   g.add(inst(G.sph(.15,8,6),mat(0xffffff,.6),crowd.map(c=>({x:c.x,y:c.y+.45,z:c.z,col:[0xf1c7a5,0xd9a67a,0x8d5a3b,0xffdcc0][Math.random()*4|0]}))));
   W.colliders.push({x:A.cx+A.hx+8.5,z:A.cz,hx:4,hz:14});
  }
  /* ---- scuderia con box ---- */
  const SB={x0:-42,x1:-20,z0:18,z1:23,n:5}; const bw=(SB.x1-SB.x0)/SB.n;
  const plaster=TX.plaster('#efe6d6'), woodT=TX.wood('#8a5a34'), woodD=TX.wood('#6b4226');
  patch(W,(SB.x0+SB.x1)/2,(SB.z0+SB.z1)/2,SB.x1-SB.x0,SB.z1-SB.z0,TX.straw(),2.5,.03);
  patch(W,(SB.x0+SB.x1)/2,16.2,SB.x1-SB.x0+2,3.6,TX.concrete(),3,.025,.9);
  boxT(W,grp,SB.x1-SB.x0+.3,3.2,.3,(SB.x0+SB.x1)/2,1.6,SB.z1+.15,plaster,3);
  for(const x of [SB.x0-.15,SB.x1+.15])boxT(W,grp,.3,3.2,SB.z1-SB.z0+.3,x,1.6,(SB.z0+SB.z1)/2,plaster,3);
  const bars=[], woodGeos=[], plGeos=[];
  W.spots.boxes=[];
  for(let i=0;i<SB.n;i++){
    const cx=SB.x0+bw*(i+.5);
    if(i>0){const x=SB.x0+bw*i;woodGeos.push(EQ.xform(G.box(.1,1.4,SB.z1-SB.z0),x,.7,(SB.z0+SB.z1)/2));
      for(let z=SB.z0+.15;z<SB.z1;z+=.14)bars.push(EQ.xform(G.cyl(.012,.012,1,5),x,1.9,z));
      woodGeos.push(EQ.xform(G.box(.12,.08,SB.z1-SB.z0),x,2.42,(SB.z0+SB.z1)/2));}
    // fronte: legno basso + sbarre, porta al centro
    const dw=1.5;
    for(const s of [-1,1]){const w=(bw-dw)/2,x=cx+s*(dw/2+w/2);woodGeos.push(EQ.xform(G.box(w,1.35,.12),x,.675,SB.z0));
      for(let xx=x-w/2+.08;xx<x+w/2;xx+=.13)bars.push(EQ.xform(G.cyl(.012,.012,1,5),xx,1.85,SB.z0));
      woodGeos.push(EQ.xform(G.box(w,.08,.14),x,2.38,SB.z0));}
    plGeos.push(EQ.xform(G.box(bw,.8,.2),cx,2.82,SB.z0));
    // porta (anta bassa) con cardine a sinistra
    const door=new THREE.Group(); door.position.set(cx-dw/2,0,SB.z0-.02); grp.add(door);
    const dp=boxT(W,door,dw-.04,1.3,.08,dw/2,.68,0,woodD,1.2);
    mesh(G.box(dw-.1,.06,.1),mat(0x2b2b2b,.4,.6),dw/2,1.2,-.01,door);
    mesh(G.box(.05,.05,.12),mat(0x999999,.3,.8),dw-.15,.9,-.06,door);
    // targhetta nome
    const hd=EQ.HORSES[i];
    const nt=EQ.labelTex(hd.name,{bg:'#f6efe0',fg:'#4a2a14',w:256,h:80,radius:10,font:'bold 44px Fredoka, Trebuchet MS, sans-serif',border:'#8a5a34'});W.tex.push(nt);
    const np=mesh(new THREE.PlaneGeometry(.9,.28),new THREE.MeshStandardMaterial({map:nt,roughness:.6}),cx,2.7,SB.z0-.11,grp);np.rotation.y=Math.PI;
    // mangiatoia, fieno, secchio
    mesh(G.box(.7,.4,.45),mat(0x9a9a95,.8),cx+bw/2-.5,1.0,SB.z0+.35,grp);
    const hay=mesh(G.sph(.3,10,8),new THREE.MeshStandardMaterial({map:TX.straw(),color:C(0xd6c070),roughness:1}),cx+bw/2-.5,1.18,SB.z0+.35,grp);hay.scale.set(1,.45,.7);hay.visible=false;
    const bucket=mesh(G.cyl(.17,.14,.32,14),mat(0x1d1d1d,.5),cx-bw/2+.4,.16,SB.z1-.4,grp);
    mesh(G.cyl(.155,.155,.01,14),new THREE.MeshStandardMaterial({color:C(0x5a7a8a),roughness:.1,metalness:.2}),cx-bw/2+.4,.29,SB.z1-.4,grp);
    W.spots.boxes.push({i,cx,door,hay,horse:{x:cx,z:SB.z0+1.9,h:Math.PI},front:{x:cx,z:SB.z0-1.3},out:{x:cx,z:SB.z0-2.8}});
  }
  mesh(EQ.merge(bars),mat(0x2c2c2c,.4,.7),0,0,0,grp);
  mesh(EQ.merge(woodGeos),new THREE.MeshStandardMaterial({map:woodT,roughness:.85}),0,0,0,grp);
  mesh(EQ.merge(plGeos),new THREE.MeshStandardMaterial({map:plaster,roughness:.9}),0,0,0,grp);
  // tetto a due falde con portico
  const tiles=TX.tiles();
  const roofW=SB.x1-SB.x0+1.6;
  {const z0=14.2,z1=SB.z1+.9,zr=(z0+z1)/2,yr=4.9,ye=3.05;
   for(const [za,zb] of [[z0,zr],[z1,zr]]){const L=Math.hypot(zb-za,yr-ye),a=Math.atan2(yr-ye,zb-za);
     const r=boxT(W,grp,roofW,.12,L,(SB.x0+SB.x1)/2,(ye+yr)/2,(za+zb)/2,tiles,2.2);r.rotation.x=-a;}
   for(const x of [SB.x0-.15,SB.x1+.15]){const sh=new THREE.Shape();sh.moveTo(SB.z0-1.2,3.05);sh.lineTo(zr,yr);sh.lineTo(SB.z1+.3,3.1);sh.lineTo(SB.z0-1.2,3.05);
     const gg=new THREE.ShapeGeometry(sh);const m=mesh(gg,new THREE.MeshStandardMaterial({map:plaster,side:THREE.DoubleSide,roughness:.9}),x,0,0,grp);m.rotation.y=-Math.PI/2;}
   for(let x=SB.x0;x<=SB.x1+.01;x+=bw){mesh(G.box(.2,3.05,.2),new THREE.MeshStandardMaterial({map:woodT,roughness:.8}),x,1.52,14.6,grp);W.colliders.push({x,z:14.6,r:.2});}
   mesh(G.box(roofW,.25,.2),new THREE.MeshStandardMaterial({map:woodT,roughness:.8}),(SB.x0+SB.x1)/2,3.0,14.6,grp);
   const lab=sign(W,'SCUDERIA',(SB.x0+SB.x1)/2,3.65,14.4,Math.PI,3.2,.8,'#5a2e14');lab.rotation.y=Math.PI;
  }
  W.colliders.push({x:(SB.x0+SB.x1)/2,z:(SB.z0+SB.z1)/2,hx:(SB.x1-SB.x0)/2+.3,hz:(SB.z1-SB.z0)/2+.15});
  W.spots.SB=SB;
  // carriola col fieno e secchio carote
  {const cx=-18.6,cz=15.8;const g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=-.4;grp.add(g);
   mesh(G.box(.9,.4,1.2),mat(0x2f6b33,.6,.3),0,.55,0,g);const hy=mesh(G.sph(.55,12,10),new THREE.MeshStandardMaterial({map:TX.straw(),roughness:1}),0,.8,0,g);hy.scale.set(.85,.5,1.1);
   const wh=mesh(G.cyl(.22,.22,.08,14),mat(0x222222,.7),0,.22,.7,g);wh.rotation.z=Math.PI/2;
   for(const s of [-1,1])mesh(G.box(.05,.05,1),mat(0x555555,.5,.5),s*.35,.45,-.8,g);
   const b=mesh(G.cyl(.2,.17,.35,14),mat(0x2a58c8,.5),1.0,.18,-.3,g);
   for(let i=0;i<7;i++){const c=mesh(G.cone(.03,.2,6),mat(0xf07b16,.6),1.0+rnd(-.1,.1),.4,-.3+rnd(-.1,.1),g);c.rotation.set(rnd(-1,1),0,rnd(-1,1)+Math.PI);}
   const crate=mesh(G.box(.5,.3,.4),new THREE.MeshStandardMaterial({map:woodT}),1.0,.15,.45,g);
   for(let i=0;i<6;i++)mesh(G.sph(.06,8,6),mat(0xc2262d,.4),1.0+rnd(-.17,.17),.33,.45+rnd(-.12,.12),g);
   W.colliders.push({x:cx,z:cz,r:.9});W.spots.feed={x:cx,z:cz};}
  // balle di fieno
  {const hm=new THREE.MeshStandardMaterial({map:TX.straw(),roughness:1});
   const pos=[[-48,19],[-48,21.6],[-48,24.2],[-45.4,20.3],[-45.4,22.9],[-48,20.3,1.6],[-48,22.9,1.6]];
   pos.forEach(p=>{const b=mesh(G.cyl(.8,.8,1.2,18),hm,p[0],(p[2]||0)+.8,p[1],grp);b.rotation.z=Math.PI/2;});
   W.colliders.push({x:-47,z:21.5,hx:2,hz:3.6});}
  /* ---- selleria / spogliatoio ---- */
  {const x0=-17,x1=-9,z0=18,z1=25;const cx=(x0+x1)/2,cz=(z0+z1)/2;
   boxT(W,grp,x1-x0,3.2,z1-z0,cx,1.6,cz,TX.plaster('#e8d9be'),3);
   mesh(roofGeo(x1-x0+.8,z1-z0+.8,1.9),new THREE.MeshStandardMaterial({map:tiles,roughness:.85}),cx,3.2,cz,grp);
   const dr=mesh(G.box(1.4,2.3,.08),mat(0x5a3418,.6),cx,1.15,z0-.03,grp);
   mesh(G.box(1.6,.12,.2),mat(0xf2f2f2,.6),cx,2.36,z0-.05,grp);
   for(const s of [-1,1]){mesh(G.box(1.2,1,.06),new THREE.MeshStandardMaterial({color:C(0x7fa0b8),roughness:.1,metalness:.3}),cx+s*2.6,1.6,z0-.03,grp);mesh(G.box(1.35,.08,.15),mat(0xf2f2f2,.6),cx+s*2.6,1.06,z0-.07,grp);}
   const sg=sign(W,'SELLERIA · SPOGLIATOIO',cx,2.75,z0-.12,Math.PI,3.6,.5,'#5a2e14');sg.rotation.y=Math.PI;
   W.colliders.push({x:cx,z:cz,hx:4.1,hz:3.6});
   W.spots.selleria={x:cx,z:z0-1.4};
  }
  /* ---- posta (pulizia e sellatura) ---- */
  {const hx=-12,hz=10.5;
   patch(W,hx,hz,4.6,3.6,TX.asphalt(),2,.03);
   const posts=[[hx+1.85,hz-1.1],[hx+1.85,hz+1.1]];
   posts.forEach(p=>{mesh(G.cyl(.09,.11,2,10),new THREE.MeshStandardMaterial({map:woodT}),p[0],1,p[1],grp);mesh(G.tor(.05,.012,6,12),metal(),p[0],1.6,p[1]+(p[1]<hz?.1:-.1),grp);W.colliders.push({x:p[0],z:p[1],r:.15});});
   // portasella con sella, sottosella e briglia
   const rk=new THREE.Group();rk.position.set(hx-3.2,0,hz-2.6);rk.rotation.y=.6;grp.add(rk);
   mesh(G.box(.1,1,.1),mat(0x5a3418),0,.5,0,rk);mesh(G.box(.5,.08,.7),mat(0x5a3418),0,1,0,rk);
   const sd=mesh(G.cyl(.3,.3,.55,14,true),mat(0x4a2614,.45,0,{side:THREE.DoubleSide}),0,1.1,0,rk);sd.rotation.x=Math.PI/2;sd.scale.set(1,.6,1);
   mesh(G.box(.55,.03,.75),mat(0x1d3f8a,.9),0,1.04,0,rk);
   W.colliders.push({x:hx-3.2,z:hz-2.6,r:.5});
   // cassetta attrezzi
   const tb=mesh(G.box(.5,.25,.3),mat(0x2a6bd1,.5),hx-1.2,.13,hz-2.3,grp);
   for(let i=0;i<3;i++)mesh(G.box(.1,.08,.18),mat([0x8a5a34,0x222,0xc0392b][i],.7),hx-1.38+i*.16,.3,hz-2.3,grp);
   W.spots.posta={horse:{x:hx,z:hz,h:Math.PI/2},stand:{x:hx,z:hz-1.5},posts:posts.map(p=>new V3(p[0],1.6,p[1])),look:{x:hx+.3,z:hz}};
  }
  /* ---- doccia / lavaggio ---- */
  {const hx=-3,hz=10.5;
   patch(W,hx,hz,6,5,TX.concrete(),1.2,.03,.5);
   boxT(W,grp,6.2,2.4,.2,hx,1.2,hz+2.6,TX.plaster('#cfe3ea'),1);
   const tl=EQ.canvasTex(128,128,(g,w,h)=>{g.fillStyle='#e8f3f6';g.fillRect(0,0,w,h);g.strokeStyle='#9fb8c2';g.lineWidth=3;for(let i=0;i<=w;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}},6,2.4);W.tex.push(tl);
   mesh(new THREE.PlaneGeometry(6.2,2.4),new THREE.MeshStandardMaterial({map:tl,roughness:.25}),hx,1.2,hz+2.49,grp).rotation.y=Math.PI;
   const reel=mesh(G.cyl(.35,.35,.15,18),mat(0x2a8a3a,.5),hx-2,1.3,hz+2.4,grp);reel.rotation.x=Math.PI/2;
   mesh(G.tor(.3,.04,8,20),mat(0x3cb043,.5),hx-2,1.3,hz+2.3,grp);
   mesh(G.box(.8,.04,.4),mat(0x333333,.3,.7),hx,.04,hz,grp);
   W.colliders.push({x:hx,z:hz+2.6,hx:3.1,hz:.2});
   const lab=sign(W,'DOCCIA CAVALLI',hx,2.65,hz+2.45,Math.PI,2.6,.45,'#1f6e8c');lab.rotation.y=Math.PI;
   W.spots.wash={horse:{x:hx,z:hz,h:Math.PI/2},stand:{x:hx,z:hz-1.6},hose:new V3(hx-2,1.3,hz+2.3)};
  }
  /* ---- club house ---- */
  {const cx=10,cz=24;
   boxT(W,grp,13,3.6,7,cx,1.8,cz,TX.plaster('#f1e2c6'),3);
   const r=mesh(G.box(14,.3,8),new THREE.MeshStandardMaterial({map:tiles}),cx,3.75,cz,grp);
   for(let i=-2;i<=2;i++){mesh(G.box(1.4,1.4,.06),new THREE.MeshStandardMaterial({color:C(0x88a8c0),roughness:.08,metalness:.3}),cx+i*2.4,1.9,cz-3.53,grp);}
   const sg=sign(W,'CIRCOLO IPPICO',cx,3.1,cz-3.56,Math.PI,4.4,.65,'#2f4d2a');sg.rotation.y=Math.PI;
   patch(W,cx,cz-5.5,13,4,TX.wood('#a27a52'),1.5,.06,.8);
   for(let i=-1;i<=1;i++){const tx=cx+i*4,tz=cz-5.5;mesh(G.cyl(.5,.5,.05,16),mat(0xffffff,.5),tx,.78,tz,grp);mesh(G.cyl(.05,.05,.75,8),mat(0x444444,.4,.6),tx,.4,tz,grp);mesh(G.cyl(.03,.03,2.4,6),mat(0xdddddd,.4),tx,1.2,tz,grp);
     const um=mesh(G.cone(1.5,.6,8,),new THREE.MeshStandardMaterial({map:TX.stripes('#2f6b33','#f4efe2'),side:THREE.DoubleSide}),tx,2.4,tz,grp);W.colliders.push({x:tx,z:tz,r:.7});}
   W.colliders.push({x:cx,z:cz,hx:6.6,hz:3.6});
  }
  /* ---- paddock con cavalli al pascolo ---- */
  W.spots.paddock={x0:24,x1:48,z0:6,z1:32};
  woodFence(W,[[24,6],[48,6],[48,32],[24,32],[24,6]],{h:1.3,rails:3});
  /* ---- uscita sentieri ---- */
  {const ex=21,ez=-1;
   for(const s of [-1,1]){mesh(G.box(.3,3.2,.3),new THREE.MeshStandardMaterial({map:woodT}),ex,1.6,ez+s*2.4,grp);W.colliders.push({x:ex,z:ez+s*2.4,r:.25});}
   mesh(G.box(.35,.35,5.4),new THREE.MeshStandardMaterial({map:woodT}),ex,3.2,ez,grp);
   const sg=sign(W,'SENTIERI ➜ spiaggia · bosco · città',ex-.25,2.6,ez,-Math.PI/2,4.2,.55,'#5a2e14');
   W.spots.exit={x:ex-3,z:ez};
   patch(W,ex+10,ez,20,5,TX.gravel(),5,.012);
  }
  // auto e van per cavalli
  {const g=new THREE.Group();g.position.set(36,0,-8);g.rotation.y=.3;grp.add(g);
   mesh(G.box(2.3,2.4,4.8),mat(0xf2f2f2,.3,.2),0,1.5,0,g);mesh(G.box(2.32,.4,4.82),mat(0x2f6b33,.4),0,.9,0,g);
   for(const s of [-1,1])for(const z of [-.8,.8]){const w=mesh(G.cyl(.38,.38,.25,16),mat(0x1a1a1a,.7),s*1.15,.38,z,g);w.rotation.z=Math.PI/2;}
   W.colliders.push({x:36,z:-8,hx:1.4,hz:2.6,rot:-.3});}
  // alberi e siepi
  const trees=[];
  for(let x=-64;x<=56;x+=9){trees.push({x:x+rnd(-1,1),z:46+rnd(-2,2),s:rnd(.8,1.1),ry:rnd(0,TAU)});trees.push({x:x+rnd(-1,1),z:-66+rnd(-2,2),s:rnd(.8,1.1),ry:rnd(0,TAU)});}
  for(let z=-58;z<=40;z+=9){trees.push({x:-68+rnd(-2,2),z,s:rnd(.8,1.1),ry:rnd(0,TAU)});trees.push({x:62+rnd(-2,2),z,s:rnd(.8,1.1),ry:rnd(0,TAU)});}
  for(let i=0;i<70*Q();i++){const a=rnd(0,TAU),r=rnd(85,200);trees.push({x:Math.cos(a)*r,z:Math.sin(a)*r,s:rnd(.8,1.3),ry:rnd(0,TAU)});}
  addTrees(W,'oak',trees,[0x7aa64a,0x6e9a3e,0x8ab456,0x5f8a34],.45);
  addTrees(W,'poplar',[[-30,32],[-22,32],[-14,32],[-6,32],[2,32]].map(p=>({x:p[0],z:p[1],s:1,ry:rnd(0,3)})),[0x6f9a40],.3);
  // ciuffi d'erba
  {const L=[];for(let i=0;i<2600*Q();i++){const x=rnd(-90,90),z=rnd(-90,70);if(W.surface(x,z)!=='grass')continue;if(x>24&&x<48&&z>6&&z<32&&Math.random()<.5)continue;L.push({x,z,ry:rnd(0,3),s:rnd(.6,1.3)});}tufts(W,L);}
  // fiori
  {const L=[];const fc=[0xffffff,0xffe14d,0xff6fa8,0xb38cff,0xff5a5a];for(let i=0;i<400*Q();i++){const x=rnd(-80,80),z=rnd(-80,60);if(W.surface(x,z)!=='grass')continue;L.push({x,y:.15,z,s:rnd(.7,1.2),col:fc[i%5]});}
   grp.add(inst(G.sph(.07,6,4),mat(0xffffff,.8),L,false));}
  // lampioni
  {const L=[];for(const p of [[-24,12],[-6,6],[6,6],[14,10],[-38,12]]){L.push({x:p[0],z:p[1]});W.colliders.push({x:p[0],z:p[1],r:.15});}
   grp.add(inst(G.cyl(.06,.09,3.6,8),mat(0x2a2a2a,.4,.6),L.map(a=>({x:a.x,y:1.8,z:a.z}))));
   grp.add(inst(G.sph(.22,10,8),new THREE.MeshStandardMaterial({color:0xfff6d0,emissive:C(0x554422),roughness:.2}),L.map(a=>({x:a.x,y:3.7,z:a.z}))));}
  // recinzione esterna
  woodFence(W,[[-72,-70],[66,-70],[66,50],[-72,50],[-72,-70]],{h:1.3,rails:2,post:3});
  W.bounds={x0:-71,x1:65,z0:-69,z1:49};
  W.spawn={x:-6,z:4,h:0};
  /* stanza spogliatoio (interno), lontana dal resto */
  {const R=new THREE.Group();R.position.set(300,0,300);grp.add(R);W.room=R;
   const fl=EQ.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#9c7048';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,y,w,2);for(let x=(y/32%2)*64;x<w;x+=128)g.fillRect(x,y,2,32);}for(let i=0;i<300;i++){g.fillStyle='rgba(0,0,0,.06)';g.fillRect(Math.random()*w,Math.random()*h,30,1);}},3,3);W.tex.push(fl);
   const f=mesh(new THREE.PlaneGeometry(7,6),new THREE.MeshStandardMaterial({map:fl,roughness:.6}),0,.01,0,R);f.rotation.x=-Math.PI/2;
   const wl=TX.plaster('#e9dcc6');
   const walls=[[0,1.6,-3,7,3.2,.2],[-3.5,1.6,0,.2,3.2,6],[3.5,1.6,0,.2,3.2,6]];
   walls.forEach(w=>{const m=boxT(W,R,w[3],w[4],w[5],w[0],w[1],w[2],wl,2.5);m.castShadow=false;});
   const ceil=mesh(G.box(7,.1,6),mat(0xf2ede4,.9),0,3.2,0,R);ceil.castShadow=false;
   // armadietti
   for(let i=0;i<5;i++){const m=mesh(G.box(.62,2,.5),mat([0x2f6b33,0x2a58c8,0x8a3b9a,0xc0392b,0x2f6b33][i],.4,.3),-2.4+i*.64,1,-2.7,R);m.castShadow=false;mesh(G.box(.04,.25,.04),mat(0xcccccc,.3,.8),-2.2+i*.64,1.1,-2.43,R);}
   // specchio
   const mir=mesh(G.box(1.1,1.7,.05),new THREE.MeshStandardMaterial({color:C(0xcfe2ea),roughness:.03,metalness:.95}),3.38,1.45,0,R);mir.rotation.y=-Math.PI/2;
   mesh(G.box(.06,1.82,1.22),mat(0x5a3418,.5),3.42,1.45,0,R);
   // portaselle e caschi
   for(let i=0;i<3;i++){mesh(G.box(.5,.06,.25),mat(0x5a3418,.6),-3.25,1.3+i*.55,1.2,R);const s=mesh(G.cyl(.25,.25,.45,12,true),mat(0x4a2614,.45,0,{side:THREE.DoubleSide}),-3.1,1.42+i*.55,1.2,R);s.rotation.x=Math.PI/2;s.scale.set(1,.55,1);}
   for(let i=0;i<4;i++){const h=mesh(new THREE.SphereGeometry(.13,14,8,0,TAU,0,1.7),mat([0x1b1b22,0x1f3b7a,0xe86aa6,0xf5f5f5][i],.35),-1.2+i*.4,2.25,-2.75,R);}
   mesh(G.box(1.8,.05,.3),mat(0x5a3418,.6),-.6,2.2,-2.8,R);
   mesh(G.box(2,.45,.5),new THREE.MeshStandardMaterial({map:woodT}),1.6,.25,-2.4,R);
   // poster
   const pt=EQ.labelTex('🐴 Brava Giorgia!',{bg:'#ffe08a',fg:'#5a2e14',w:512,h:256,font:'bold 60px Fredoka, Trebuchet MS, sans-serif'});W.tex.push(pt);
   mesh(new THREE.PlaneGeometry(1.2,.6),new THREE.MeshStandardMaterial({map:pt}),-3.38,2,-.8,R).rotation.y=Math.PI/2;
  }
  // suoni d'ambiente
  let bt=3;
  W.updaters.push((dt,t,p)=>{bt-=dt;if(bt<0){bt=3+Math.random()*6;EQ.sfx.bird();}});
  return W;
};

/* ======================= SPIAGGIA ======================= */
EQ.buildBeach=function(){
  const W=newWorld('beach');
  W.sky={elev:28,azim:110,turb:3,ray:1.4,mie:.005,fog:0xa8c3d8,near:120,far:620,exposure:.62};
  const shore=EQ.shoreX;
  const H=(x,z)=>{const d=x-shore(z);let h;
    if(d<0){h=Math.min(.55,-d*.045)+U.fbm(x*.08,z*.08,2)*.08;h+=U.fbm(x*.025,z*.025,3)*4.2*U.smooth(-34,-60,d)+U.smooth(-30,-70,d)*1.2;}
    else h=-d*.05-Math.max(0,d-18)*.03+U.fbm(x*.1,z*.1,2)*.05;
    return h;};
  W.height=H;
  W.water=(x,z)=>0; // livello del mare
  W.surface=(x,z)=>{const h=H(x,z);return h<0?'water':'sand';};
  const cDry=C(0xe6cfa2),cWet=C(0xa88a5e),cDeep=C(0x8c7a58),cGrass=C(0x8e9a52);
  terrain(W,300,460,-40,0,Math.round(150*Q()+40),Math.round(230*Q()+60),H,(x,z,c)=>{const d=x-shore(z);const n=U.fbm(x*.05,z*.05,2);
    c.copy(cDry).multiplyScalar(.92+n*.16);
    if(d>-6)c.lerp(cWet,U.smooth(-6,-.5,d));
    if(d>0)c.lerp(cDeep,U.smooth(0,12,d));
    if(d<-38)c.lerp(cGrass,U.smooth(-38,-55,d)*(.5+n*.6));
  },TX.sandWhite(),9);
  const wg=new THREE.PlaneGeometry(900,900,Math.round(110*Q()+40),Math.round(110*Q()+40));wg.rotateX(-Math.PI/2);wg.translate(shore(0)+420,.0,0);
  const water=makeWater(wg,{beach:1,amp:.14,shallow:0x47b3b8,deep:0x0e4f73,sky:0xb4d2ea});W.group.add(water);
  // pineta dietro le dune
  const pines=[];for(let i=0;i<220*Q();i++){const z=rnd(-220,220),x=shore(z)-rnd(68,150);pines.push({x,y:H(x,z)-.2,z,s:rnd(.8,1.2),ry:rnd(0,TAU)});}
  addTrees(W,'umbrella',pines,[0x4e6b2e,0x587a34,0x4a6a2a],.4);
  // erba delle dune
  {const L=[];for(let i=0;i<1800*Q();i++){const z=rnd(-200,200),x=shore(z)-rnd(30,80);L.push({x,y:H(x,z),z,ry:rnd(0,3),s:rnd(.8,1.6)});}tufts(W,L,0xd8d0a0);}
  // stabilimento: ombrelloni e lettini
  {const cols=[['#e74c3c','#ffffff'],['#2a7fd1','#ffffff'],['#f1c40f','#2a7fd1'],['#2f9e5e','#ffffff']];
   const poles=[],beds=[];
   for(let zz=40;zz<=130;zz+=7)for(let k=0;k<4;k++){const z=zz+(k%2)*3,x=shore(z)-11-k*5;
     poles.push({x,y:H(x,z)+1.2,z});W.colliders.push({x,z,r:.35});
     const c=cols[(zz/7+k)%4|0];const u=mesh(G.cone(1.25,.5,10,),new THREE.MeshStandardMaterial({map:TX.stripes(c[0],c[1]),side:THREE.DoubleSide,roughness:.8}),x,H(x,z)+2.35,z,W.group);u.scale.y=1;
     for(const s of [-1,1])beds.push({x:x+s*.9,y:H(x,z)+.28,z:z+.6,ry:0});}
   W.group.add(inst(G.cyl(.03,.03,2.4,6),mat(0xeeeeee,.4,.4),poles));
   W.group.add(inst(G.box(.6,.08,1.8),mat(0xf3f3f3,.5),beds));
   W.group.add(inst(G.box(.55,.06,1.6),mat(0x2a7fd1,.8),beds.map(b=>({x:b.x,y:b.y+.06,z:b.z}))));
   beds.forEach(b=>W.colliders.push({x:b.x,z:b.z,hx:.35,hz:.95}));
   // chiosco
   const kz=85,kx=shore(kz)-36;const k=boxT(W,W.group,8,3,5,kx,H(kx,kz)+1.5,kz,TX.wood('#c9a272'),2);
   mesh(G.box(9,.3,6.2),mat(0x2a7fd1,.6),kx,H(kx,kz)+3.15,kz,W.group);
   const sg=sign(W,'BAR SPIAGGIA',kx+4.1,H(kx,kz)+2.4,kz,Math.PI/2,3,.6,'#2a7fd1');
   W.colliders.push({x:kx,z:kz,hx:4.2,hz:2.7});
   // passerella in legno
   const pz=70;const pw=TX.wood('#b08a60');for(let i=0;i<14;i++){const x=shore(pz)-62+i*3;const p=boxT(W,W.group,3,.1,1.6,x,H(x,pz)+.1,pz,pw,1.5);}
  }
  // torretta del bagnino
  {const z=20,x=shore(z)-9,y=H(x,z);const g=new THREE.Group();g.position.set(x,y,z);W.group.add(g);
   for(const a of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]])mesh(G.box(.12,2.6,.12),mat(0xffffff,.6),a[0],1.3,a[1],g);
   mesh(G.box(2,.15,2),mat(0xffffff,.6),0,2.6,0,g);mesh(G.box(2,.9,.08),mat(0xd62828,.6),0,3.1,.96,g);
   mesh(G.box(.08,3,.08),mat(0xdddddd,.5),.9,4,.9,g);mesh(G.box(.7,.45,.02),mat(0xd62828,.7),1.25,5.2,.9,g);
   const sg=EQ.labelTex('SALVATAGGIO',{bg:'#d62828',w:512,h:96,font:'bold 54px Fredoka, sans-serif',radius:4});W.tex.push(sg);
   mesh(new THREE.PlaneGeometry(1.9,.35),new THREE.MeshStandardMaterial({map:sg}),0,3.15,1.01,g).rotation.y=0;
   W.colliders.push({x,z,hx:1.1,hz:1.1});}
  // scogli
  {const rocks=[];for(let i=0;i<40;i++){const z=-150+rnd(-25,25),x=shore(z)+rnd(-10,18);rocks.push({x,y:H(x,z),z,s:rnd(.6,2.6),ry:rnd(0,TAU),rx:rnd(0,1)});}
   const rg=blob(1,1,4.4,.7);W.group.add(inst(rg,mat(0x6b665f,.85),rocks));rocks.forEach(r=>{if(r.s>1)W.colliders.push({x:r.x,z:r.z,r:r.s*.9});});}
  // tronchi portati dal mare (da saltare)
  const lm=new THREE.MeshStandardMaterial({map:TX.bark(),color:C(0xc8b8a0),roughness:.9});
  for(const z of [-100,-60,-25,10,55,150,180]){
    const x=shore(z)-6+rnd(-2,2), ang=rnd(-.3,.3), L=4.5, y=H(x,z);
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ang;W.group.add(g);
    const lg=mesh(G.cyl(.25,.3,L,10),lm,0,.25,0,g);lg.rotation.x=Math.PI/2;
    const dz=Math.cos(ang)*L/2, dx=Math.sin(ang)*L/2;
    W.jumps.push({ax:x-dx,az:z-dz,bx:x+dx,bz:z+dz,h:.55});
  }
  // barche a vela in lontananza
  const boats=[];
  for(let i=0;i<5;i++){const g=new THREE.Group();const x=shore(0)+rnd(80,260),z=rnd(-250,250);g.position.set(x,0,z);W.group.add(g);
    mesh(G.box(1.4,.6,5),mat(0xffffff,.4),0,.2,0,g);const sail=new THREE.Shape();sail.moveTo(0,0);sail.lineTo(0,6);sail.lineTo(2.8,0);
    mesh(new THREE.ShapeGeometry(sail),mat(0xfafafa,.7,0,{side:THREE.DoubleSide}),0,.6,-.5,g).rotation.y=Math.PI/2;
    boats.push({g,ph:rnd(0,9),v:rnd(.5,1.5)});}
  // gabbiani
  const gulls=[];const gm=mat(0xf4f4f4,.6);
  for(let i=0;i<8;i++){const g=new THREE.Group();W.group.add(g);const b=mesh(G.sph(.12,8,6),gm,0,0,0,g);b.scale.set(.8,.8,2);
    const wl=[];for(const s of [1,-1]){const w=new THREE.Group();w.position.x=s*.08;g.add(w);mesh(G.box(.55,.02,.18),gm,s*.27,0,0,w);mesh(G.box(.15,.025,.16),mat(0x333333,.6),s*.6,0,0,w);wl.push(w);}
    gulls.push({g,wl,cx:shore(0)+rnd(-20,30),cz:rnd(-120,120),r:rnd(10,30),h:rnd(10,22),ph:rnd(0,TAU),v:rnd(.2,.45)});}
  W.updaters.push((dt,t,p)=>{
    boats.forEach(b=>{b.g.position.y=Math.sin(t*b.v+b.ph)*.25;b.g.rotation.z=Math.sin(t*.8+b.ph)*.06;b.g.position.z+=dt*b.v;});
    gulls.forEach(g=>{const a=t*g.v+g.ph;g.g.position.set(g.cx+Math.cos(a)*g.r,g.h+Math.sin(a*2)*1.5,g.cz+Math.sin(a)*g.r);g.g.rotation.y=-a;g.wl.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(t*6+g.ph)*.45);});
    if(p){const d=Math.max(0,p.x-shore(p.z)+30);EQ.loop('waves',.22*U.clamp(1-Math.abs(p.x-shore(p.z))/80,.15,1)*(.75+.25*Math.sin(t*.5)),420,.4,'lowpass');}
    if(Math.random()<dt*.15)EQ.sfx.gull();
  });
  // conchiglie
  for(let i=0;i<10;i++){const z=-170+i*36+rnd(-8,8);const x=shore(z)+rnd(-7,2.5);W.items.push({x,z,y:Math.max(H(x,z),0)});}
  W.bounds={x0:-150,x1:110,z0:-215,z1:215};
  W.spawn={x:shore(-30)-14,z:-30,h:Math.PI/2+.4};
  W.itemKind='shell';
  W.deep=-.8;
  return W;
};

/* ======================= BOSCO ======================= */
EQ.buildForest=function(){
  const W=newWorld('forest');
  W.sky={elev:34,azim:200,turb:5,ray:1.1,mie:.006,fog:0xa9bba3,near:30,far:260,exposure:.66,hemi:.65};
  // sentiero ad anello
  const cp=[];for(let i=0;i<14;i++){const a=i/14*TAU,r=78+Math.sin(i*1.7)*22+Math.cos(i*.9)*10;cp.push(new V3(Math.cos(a)*r,0,Math.sin(a)*r));}
  const trail=new THREE.CatmullRomCurve3(cp,true,'centripetal');
  const TS=trail.getSpacedPoints(700);
  const tDist=(x,z)=>{let b=1e9,bi=0;for(let i=0;i<TS.length;i+=2){const dx=TS[i].x-x,dz=TS[i].z-z,d=dx*dx+dz*dz;if(d<b){b=d;bi=i;}}
    for(let i=Math.max(0,bi-2);i<Math.min(TS.length,bi+3);i++){const dx=TS[i].x-x,dz=TS[i].z-z,d=dx*dx+dz*dz;if(d<b)b=d;}return Math.sqrt(b);};
  const rz=x=>-20+22*Math.sin(x*.013)+6*Math.sin(x*.05);
  const hN=(x,z)=>2+U.fbm(x*.008+3,z*.008-7,4)*18;
  const lvl=x=>hN(x,rz(x))-1.3;
  const H=(x,z)=>{let h=hN(x,z);const dr=Math.abs(z-rz(x));if(dr<14){h=U.lerp(lvl(x)-.75,h,U.smooth(3.5,13,dr));}return h;};
  W.height=H;
  W.water=(x,z)=>Math.abs(z-rz(x))<7?lvl(x):-99;
  W.surface=(x,z)=>{if(Math.abs(z-rz(x))<5.5&&H(x,z)<lvl(x))return'water';return tDist(x,z)<2.4?'dirt':'grass';};
  const cG=C(0x5d7a35),cM=C(0x6f6a3a),cD=C(0x8a6c48),cB=C(0x7a6a4a);
  const N=Math.round(170*Q()+60);
  terrain(W,380,380,0,0,N,N,H,(x,z,c)=>{const n=U.fbm(x*.04,z*.04,2);c.copy(cG).lerp(cM,n);const td=tDist(x,z);c.lerp(cD,U.smooth(3.2,1.2,td));const dr=Math.abs(z-rz(x));c.lerp(cB,U.smooth(9,4,dr));},TX.forestFloor(),7);
  // torrente
  {const pos=[],idx=[];const n=190;for(let i=0;i<=n;i++){const x=-190+i*2;for(const s of [-1,1]){pos.push(x,lvl(x),rz(x)+s*7.5);}}
   for(let i=0;i<n;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
   const w=makeWater(g,{amp:.03,alpha:.82,shallow:0x4e7f72,deep:0x2b4c48,sky:0x9fb7b0});W.group.add(w);}
  // alberi
  const oaks=[],spr=[];
  for(let i=0,tries=0;i<900*Q()&&tries<9000;tries++){const x=rnd(-180,180),z=rnd(-180,180);if(Math.hypot(x,z)>185)continue;
    if(tDist(x,z)<4.8)continue;if(Math.abs(z-rz(x))<9)continue;
    const o={x,y:H(x,z)-.2,z,s:rnd(.85,1.45),ry:rnd(0,TAU)};(Math.random()<.45?spr:oaks).push(o);i++;}
  addTrees(W,'oak',oaks,[0x5f8a34,0x6e9a3e,0x4f7a2c,0x7aa64a,0x8a9a40],.45);
  addTrees(W,'spruce',spr,[0x2f5a2c,0x355f30,0x284f26],.35);
  // felci e cespugli
  {const fm=new THREE.MeshStandardMaterial({map:TX.fern(),alphaTest:.4,side:THREE.DoubleSide,roughness:.9});
   const fg=EQ.merge([0,1,2].map(i=>EQ.xform(new THREE.PlaneGeometry(1.2,1.0),0,.45,0,-.5,i*1.05,0)));
   const L=[];for(let i=0;i<2200*Q();i++){const x=rnd(-175,175),z=rnd(-175,175);if(tDist(x,z)<2.8||Math.abs(z-rz(x))<6)continue;L.push({x,y:H(x,z),z,ry:rnd(0,TAU),s:rnd(.6,1.4),col:0xffffff,cm:rnd(.7,1.1)});}
   W.group.add(inst(fg,fm,L,false));
   const bushes=[];for(let i=0;i<300*Q();i++){const x=rnd(-175,175),z=rnd(-175,175);if(tDist(x,z)<4)continue;bushes.push({x,y:H(x,z)+.3,z,s:rnd(.6,1.3),sy:rnd(.5,.8),ry:rnd(0,3),col:[0x3f6a2a,0x4f7a32][i%2]});}
   W.group.add(inst(blob(1,1,2.2,.5),new THREE.MeshStandardMaterial({map:TX.leaves(),roughness:.9}),bushes));
   const L2=[];for(let i=0;i<1400*Q();i++){const x=rnd(-170,170),z=rnd(-170,170);if(tDist(x,z)<1.6)continue;L2.push({x,y:H(x,z),z,ry:rnd(0,3),s:rnd(.6,1.2)});}
   tufts(W,L2,0xc8d8a0);}
  // rocce
  {const rocks=[];for(let i=0;i<90;i++){const x=rnd(-170,170),z=rnd(-170,170);if(tDist(x,z)<3.5)continue;const s=rnd(.4,2.2);rocks.push({x,y:H(x,z),z,s,ry:rnd(0,TAU),col:0xffffff});if(s>.9)W.colliders.push({x,z,r:s*.85});}
   for(let i=0;i<30;i++){const x=rnd(-180,180),z=rz(x)+rnd(-6,6);rocks.push({x,y:H(x,z),z,s:rnd(.3,.8),ry:rnd(0,3)});}
   W.group.add(inst(blob(1,1,7.7,.6),mat(0x77746a,.9),rocks));}
  // funghi
  {const L=[];for(let i=0;i<120;i++){const k=Math.random()*TS.length|0,p=TS[k];const a=rnd(0,TAU),r=rnd(2.6,6);const x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;L.push({x,y:H(x,z),z,s:rnd(.6,1.3)});}
   W.group.add(inst(G.cyl(.03,.04,.14,6),mat(0xf2efe6,.8),L.map(a=>({x:a.x,y:a.y+.07*a.s,z:a.z,s:a.s}))));
   W.group.add(inst(new THREE.SphereGeometry(.09,10,6,0,TAU,0,1.6),mat(0xc81e1e,.5),L.map(a=>({x:a.x,y:a.y+.13*a.s,z:a.z,s:a.s}))));}
  // tronchi caduti sul sentiero
  const lm=new THREE.MeshStandardMaterial({map:TX.bark(),roughness:.95});
  for(let i=0;i<8;i++){const k=(40+i*86)%TS.length,p=TS[k],t=trail.getTangentAt(k/TS.length);const ang=Math.atan2(t.x,t.z)+Math.PI/2;
    const L=4.6,y=H(p.x,p.z);const g=new THREE.Group();g.position.set(p.x,y,p.z);g.rotation.y=ang;W.group.add(g);
    const lg=mesh(G.cyl(.27,.32,L,12),lm,0,.28,0,g);lg.rotation.x=Math.PI/2;
    mesh(new THREE.CircleGeometry(.27,12),mat(0xc9a77a,.8),0,.28,L/2+.001,g);
    const dx=Math.sin(ang)*L/2,dz=Math.cos(ang)*L/2;W.jumps.push({ax:p.x-dx,az:p.z-dz,bx:p.x+dx,bz:p.z+dz,h:.6});}
  // raggi di luce
  {const lt=EQ.canvasTex(64,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,240,200,0)');gr.addColorStop(.3,'rgba(255,240,200,.35)');gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);const g2=g.createLinearGradient(0,0,w,0);g2.addColorStop(0,'rgba(0,0,0,1)');g2.addColorStop(.5,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,1)');g.globalCompositeOperation='destination-out';g.fillStyle=g2;g.fillRect(0,0,w,h);});W.tex.push(lt);
   const lmat=new THREE.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,opacity:.6});
   for(let i=0;i<18;i++){const k=Math.random()*TS.length|0,p=TS[k];const m=new THREE.Mesh(new THREE.PlaneGeometry(rnd(2,4),18),lmat);m.position.set(p.x+rnd(-5,5),H(p.x,p.z)+8,p.z+rnd(-5,5));m.rotation.set(.35,rnd(0,TAU),.3);W.group.add(m);}}
  // cervo che scappa
  {const dg=new THREE.Group();W.group.add(dg);const dm=mat(0x8a5a32,.7);
   const b=mesh(G.sph(.4,14,10),dm,0,1.1,0,dg);b.scale.set(.7,.8,1.5);
   const n=mesh(G.cyl(.1,.15,.6,8),dm,0,1.5,.55,dg);n.rotation.x=.5;mesh(G.sph(.14,10,8),dm,0,1.8,.75,dg).scale.set(.8,.8,1.4);
   for(const s of [1,-1]){const a=mesh(G.cyl(.015,.02,.35,5),mat(0x5a4030,.8),s*.08,2.05,.72,dg);a.rotation.z=-s*.4;}
   const dl=[];for(const [x,z] of [[.15,.45],[-.15,.45],[.15,-.45],[-.15,-.45]]){const l=new THREE.Group();l.position.set(x,.95,z);dg.add(l);mesh(G.cyl(.04,.03,.95,6),dm,0,-.47,0,l);dl.push(l);}
   const deer={x:50,z:-60,h:0,run:0,ph:0};
   W.updaters.push((dt,t,p)=>{const y=H(deer.x,deer.z);
     if(p){const d=Math.hypot(p.x-deer.x,p.z-deer.z);if(d<16&&deer.run<=0){deer.run=5;deer.h=Math.atan2(deer.x-p.x,deer.z-p.z);}}
     if(deer.run>0){deer.run-=dt;deer.x+=Math.sin(deer.h)*9*dt;deer.z+=Math.cos(deer.h)*9*dt;deer.ph+=dt*14;
       if(Math.hypot(deer.x,deer.z)>160){deer.h+=Math.PI;}}
     else deer.ph=0;
     dg.position.set(deer.x,y+(deer.run>0?Math.abs(Math.sin(deer.ph))*.4:0),deer.z);dg.rotation.y=deer.h;dl.forEach((l,i)=>l.rotation.x=Math.sin(deer.ph+(i<2?0:1.5))*.7);});}
  let bt=1;
  W.updaters.push((dt,t,p)=>{bt-=dt;if(bt<0){bt=1+Math.random()*3;EQ.sfx.bird();}
    if(p){const dr=Math.abs(p.z-rz(p.x));EQ.loop('stream',.18*U.clamp(1-dr/40,0,1),1800,.5);EQ.loop('wind',.05,300,.5,'lowpass');}});
  for(let i=0;i<10;i++){const k=Math.floor((i+.5)/10*TS.length),p=TS[k];const a=rnd(0,TAU);const x=p.x+Math.cos(a)*1.2,z=p.z+Math.sin(a)*1.2;W.items.push({x,z,y:H(x,z)});}
  W.itemKind='apple';
  const t0=trail.getTangentAt(0);
  W.spawn={x:TS[0].x,z:TS[0].z,h:Math.atan2(t0.x,t0.z)};
  W.boundR=180;
  W.trail=TS;
  return W;
};

/* ======================= CITTÀ ======================= */
EQ.buildCity=function(){
  const W=newWorld('city');
  W.sky={elev:46,azim:230,turb:3,ray:1.2,fog:0xb8c8d6,near:70,far:420,exposure:.62};
  const B=44,R=12,P=B+R,n=2; // blocchi da -2..2
  const ext=(n+.5)*P;
  ground(W,700,TX.grass(),110,-.02);
  patch(W,0,0,ext*2+R,ext*2+R,TX.asphalt(),6,0,.9);
  W.surface=()=> 'hard';
  const blocks=[];
  for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){const type=(i===0&&j===0)?'piazza':(i===1&&j===0)?'park':(i===-1&&j===-1)?'park2':'build';blocks.push({i,j,x:i*P,z:j*P,type});}
  // marciapiedi
  {const geos=[];blocks.forEach(b=>{const s=B+5;geos.push(EQ.xform(G.box(s,.14,s),b.x,.07,b.z));});
   const t=TX.paving().clone();t.needsUpdate=true;t.repeat.set(1,1);W.tex.push(t);
   const g=EQ.merge(geos);const uv=g.attributes.uv,p=g.attributes.position;for(let i=0;i<uv.count;i++){uv.setXY(i,(p.getX(i)+p.getY(i)*0)/3.5,(p.getZ(i)+p.getY(i))/3.5);}
   mesh(g,new THREE.MeshStandardMaterial({map:t,roughness:.85}),0,0,0,W.group);}
  // segnaletica orizzontale
  {const dash=[],cross=[];
   for(let k=-n-1;k<=n;k++){const c=(k+.5)*P;
     for(let s=-ext;s<ext;s+=6){if(Math.abs(((s+ext)%P)-P/2)<R)continue;dash.push(EQ.xform(G.box(.15,.01,2.6),c,.015,s));dash.push(EQ.xform(G.box(2.6,.01,.15),s,.015,c));}
     for(let k2=-n-1;k2<=n;k2++){const c2=(k2+.5)*P;for(let q=-2.5;q<=2.5;q+=.9){cross.push(EQ.xform(G.box(.5,.01,3),c+q,.016,c2+R/2+2));cross.push(EQ.xform(G.box(.5,.01,3),c+q,.016,c2-R/2-2));}}}
   mesh(EQ.merge(dash.concat(cross)),mat(0xf2f2f2,.6),0,0,0,W.group).castShadow=false;}
  // edifici
  const walls=['#e8c48a','#d98e5f','#efd9b4','#c9765a','#f0e2c8','#d6a36a','#e2b8a0'];
  const shut=['#3f6b3a','#6b3f22','#3a5a6b','#5a6b3a'];
  const facGeos={},shopGeos={},roofGeos=[],cornGeos=[];
  const shops=[['BAR','#2f6b33'],['PIZZERIA','#c0392b'],['GELATERIA','#e86aa6'],['PANIFICIO','#a0612a'],['FARMACIA','#16a34a'],['FIORAIO','#7c3aed'],['EDICOLA','#1d4ed8'],['SELLERIA','#5a2e14']];
  const awn=[];
  let si=0;
  const uvScale=(g,w,h,d,rows)=>{const uv=g.attributes.uv;for(let f=0;f<6;f++){const ww=(f<2)?d:w;for(let k=0;k<4;k++){const i=f*4+k;if(f===2||f===3){uv.setXY(i,0,0);continue;}uv.setXY(i,uv.getX(i)*Math.round(Math.max(1,ww/3.4)),uv.getY(i)*rows);}}return g;};
  const building=(x,z,w,d,ry,fl,wc,sc,shop)=>{
    const gh=4, uh=fl*3.2;
    const k=wc+sc; if(!facGeos[k])facGeos[k]=[];
    const ug=uvScale(G.box(w,uh,d),w,uh,d,fl);EQ.xform(ug,0,gh+uh/2,0);ug.rotateY(ry);ug.translate(x,0,z);facGeos[k].push(ug);
    const sk=shop?shop[0]+wc:'plain'+wc;
    if(!shopGeos[sk])shopGeos[sk]={geos:[],wc,shop};
    const sg=uvScale(G.box(w,gh,d),w*.75,gh,d*.75,1);EQ.xform(sg,0,gh/2,0);sg.rotateY(ry);sg.translate(x,0,z);shopGeos[sk].geos.push(sg);
    const cg=G.box(w+.5,.35,d+.5);EQ.xform(cg,0,gh+uh+.17,0);cg.rotateY(ry);cg.translate(x,0,z);cornGeos.push(cg);
    const rg=roofGeo(w+.3,d+.3,2.2);rg.translate(0,gh+uh+.34,0);rg.rotateY(ry);rg.translate(x,0,z);roofGeos.push(rg);
    if(shop){const a={x,z,w,ry,gh,c:shop[1]};awn.push(a);}
  };
  blocks.filter(b=>b.type==='build').forEach(b=>{
    const dep=10,half=B/2;
    for(let side=0;side<4;side++){
      let pos=-half; const len=side<2?B:B-2*dep; if(side>=2)pos=-half+dep;
      while(pos<-half+len+(side>=2?dep:0)-1&&pos<half-(side>=2?dep:0)-1){
        const w=Math.min(rnd(8,14),half-(side>=2?dep:0)-pos); if(w<4)break;
        const c=pos+w/2, fl=2+(Math.random()*3|0);
        const wc=walls[Math.random()*walls.length|0], sc=shut[Math.random()*shut.length|0];
        const shop=Math.random()<.45?shops[si++%shops.length]:null;
        let x,z,ry;
        if(side===0){x=b.x+c;z=b.z+half-dep/2;ry=Math.PI;}
        else if(side===1){x=b.x-c;z=b.z-half+dep/2;ry=0;}
        else if(side===2){x=b.x+half-dep/2;z=b.z-c;ry=-Math.PI/2;}
        else {x=b.x-half+dep/2;z=b.z+c;ry=Math.PI/2;}
        // il fronte (+z locale) guarda verso la strada
        const fry=side===0?0:side===1?Math.PI:side===2?Math.PI/2:-Math.PI/2;
        building(x,z,w-.1,dep,fry,fl,wc,sc,shop);
        pos+=w;
      }
    }
    W.colliders.push({x:b.x,z:b.z,hx:B/2,hz:B/2});
  });
  for(const k in facGeos){const [wc,sc]=[k.slice(0,7),k.slice(7)];mesh(EQ.merge(facGeos[k]),new THREE.MeshStandardMaterial({map:TX.window(wc,sc),roughness:.85}),0,0,0,W.group);}
  for(const k in shopGeos){const s=shopGeos[k];const t=s.shop?TX.shop(s.wc,s.shop[0],s.shop[1]):TX.plaster(s.wc);mesh(EQ.merge(s.geos),new THREE.MeshStandardMaterial({map:t,roughness:.8}),0,0,0,W.group);}
  mesh(EQ.merge(cornGeos),mat(0xf2ead8,.8),0,0,0,W.group);
  mesh(EQ.merge(roofGeos),new THREE.MeshStandardMaterial({map:TX.tiles(),roughness:.85}),0,0,0,W.group);
  // tende dei negozi
  {const byC={};awn.forEach(a=>{(byC[a.c]=byC[a.c]||[]).push(a);});
   for(const c in byC){const geos=byC[c].map(a=>{const g=G.box(a.w*.8,.06,1.6);g.rotateX(.35);g.translate(0,a.gh-.35,5+.8);g.rotateY(a.ry);g.translate(a.x,0,a.z);return g;});
     mesh(EQ.merge(geos),new THREE.MeshStandardMaterial({map:TX.stripes(c,'#f4efe2'),roughness:.8}),0,0,0,W.group);}}
  // piazza
  {const pz=blocks.find(b=>b.type==='piazza');
   patch(W,pz.x,pz.z,B+4,B+4,TX.cobble(),2.2,.15,.8);
   // fontana
   const fg=new THREE.Group();fg.position.set(pz.x,0,pz.z);W.group.add(fg);
   const stone=new THREE.MeshStandardMaterial({map:TX.plaster('#d8d0c0'),roughness:.7});
   const ring=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.4,.7,40,1,true),stone);ring.position.y=.5;ring.castShadow=true;fg.add(ring);
   mesh(G.tor(4.3,.18,8,40),stone,0,.85,0,fg).rotation.x=Math.PI/2;
   const wd=new THREE.CircleGeometry(4.2,40);wd.rotateX(-Math.PI/2);const fw=makeWater(wd,{amp:.02,alpha:.85,shallow:0x4fa6b4,deep:0x2a6f80});fw.position.y=.7;fg.add(fw);
   mesh(G.cyl(.35,.5,2.4,14),stone,0,1.4,0,fg);mesh(G.cyl(1.2,.4,.4,20),stone,0,2.6,0,fg);mesh(G.cyl(.15,.2,1,10),stone,0,3.2,0,fg);mesh(G.sph(.3,12,10),stone,0,3.8,0,fg);
   W.colliders.push({x:pz.x,z:pz.z,r:4.6});
   const drops=EQ.Particles(260,.12,0xddf2ff,{floor:.75});W.group.add(drops.obj);
   W.updaters.push((dt)=>{for(let i=0;i<6;i++){const a=rnd(0,TAU),v=rnd(1.2,2);drops.emit(pz.x+Math.cos(a)*.3,3.9,pz.z+Math.sin(a)*.3,Math.cos(a)*v,rnd(1.5,2.5),Math.sin(a)*v,1.2);}drops.update(dt,-9);});
   // chiesa e campanile
   const ch=new THREE.Group();ch.position.set(pz.x,0,pz.z+15);W.group.add(ch);
   boxT(W,ch,14,12,10,0,6,4,TX.plaster('#efe6d2'),3);
   const tri=new THREE.Shape();tri.moveTo(-7.4,0);tri.lineTo(0,4.4);tri.lineTo(7.4,0);mesh(new THREE.ShapeGeometry(tri),mat(0xefe6d2,.8,0,{side:THREE.DoubleSide}),0,12,-1.02,ch);
   mesh(roofGeo(14.6,10.4,4.4,true),new THREE.MeshStandardMaterial({map:TX.tiles()}),0,12,4,ch);
   mesh(G.box(3,5,.3),mat(0x5a3418,.6),0,2.5,-1.05,ch);
   const ro=mesh(new THREE.CircleGeometry(1.4,24),new THREE.MeshStandardMaterial({color:C(0x4a6aa0),roughness:.1,metalness:.4,emissive:C(0x101830)}),0,8.4,-1.06,ch);ro.rotation.y=Math.PI;
   for(const s of [-1,1])mesh(G.box(.6,11,.6),mat(0xe4dac4,.8),s*6.6,5.5,-1.1,ch);
   const tw=boxT(W,ch,4,24,4,10,12,6,TX.plaster('#e3c79c'),3);
   mesh(G.box(4.6,.4,4.6),mat(0xf2ead8,.8),10,24.2,6,ch);
   const cone=mesh(G.cone(3,4,4),new THREE.MeshStandardMaterial({map:TX.tiles()}),10,26.4,6,ch);cone.rotation.y=Math.PI/4;
   const ck=EQ.canvasTex(128,128,(g)=>{g.fillStyle='#f6f2e6';g.beginPath();g.arc(64,64,60,0,TAU);g.fill();g.strokeStyle='#222';g.lineWidth=5;g.stroke();g.lineWidth=6;g.beginPath();g.moveTo(64,64);g.lineTo(64,22);g.moveTo(64,64);g.lineTo(92,70);g.stroke();for(let i=0;i<12;i++){const a=i/12*TAU;g.fillRect(64+Math.cos(a)*50-2,64+Math.sin(a)*50-2,4,4);}});W.tex.push(ck);
   mesh(new THREE.CircleGeometry(1.2,24),new THREE.MeshStandardMaterial({map:ck}),10,19,3.98,ch).rotation.y=Math.PI;
   for(let k=0;k<2;k++){const bell=mesh(G.box(2,2.4,4.1),mat(0x222222,.8),10,21.4,6,ch);bell.scale.set(k?1:.0001,1,k?.0001:1);}
   W.colliders.push({x:pz.x,z:pz.z+19,hx:7.2,hz:5.2},{x:pz.x+10,z:pz.z+21,hx:2.2,hz:2.2});
   // tavolini del bar
   for(let i=0;i<6;i++){const x=pz.x-15+(i%2)*3.2,z=pz.z-12+(i>>1)*5;mesh(G.cyl(.45,.45,.05,14),mat(0xfafafa,.5),x,.9,z,W.group);mesh(G.cyl(.04,.04,.8,6),mat(0x333333,.4,.6),x,.5,z,W.group);
     const u=mesh(G.cone(1.6,.5,8),new THREE.MeshStandardMaterial({map:TX.stripes('#c0392b','#f4efe2'),side:THREE.DoubleSide}),x,2.6,z,W.group);mesh(G.cyl(.03,.03,2.4,6),mat(0xdddddd,.5),x,1.3,z,W.group);
     for(const s of [-1,1])mesh(G.box(.4,.45,.4),mat(0x2f6b33,.5),x+s*.7,.37,z,W.group);W.colliders.push({x,z,r:1.1});}
   // piccioni
   const pg=[];const pm=mat(0x7a7d86,.7);
   for(let i=0;i<24;i++){const g=new THREE.Group();W.group.add(g);mesh(G.sph(.1,8,6),pm,0,.12,0,g).scale.set(.8,.8,1.3);mesh(G.sph(.06,8,6),mat(0x5f6b7a,.6),0,.22,.1,g);
     const hx=pz.x+rnd(-12,12),hz=pz.z+rnd(-12,-5);pg.push({g,hx,hz,x:hx,z:hz,y:.15,fly:0,vx:0,vz:0,ph:rnd(0,9)});}
   W.updaters.push((dt,t,p)=>{let scared=false;pg.forEach(b=>{
     if(p&&b.fly<=0&&Math.hypot(p.x-b.x,p.z-b.z)<7){b.fly=4+rnd(0,2);const a=Math.atan2(b.x-p.x,b.z-p.z)+rnd(-.5,.5);b.vx=Math.sin(a)*5;b.vz=Math.cos(a)*5;scared=true;}
     if(b.fly>0){b.fly-=dt;b.x+=b.vx*dt;b.z+=b.vz*dt;b.y=Math.min(8,b.y+dt*4);b.g.rotation.y=Math.atan2(b.vx,b.vz);if(b.fly<=0){b.x=b.hx+rnd(-3,3);b.z=b.hz+rnd(-3,3);b.y=6;}}
     else{b.y=Math.max(.15,b.y-dt*3);b.g.rotation.y+=Math.sin(t*2+b.ph)*dt*2;}
     b.g.position.set(b.x,b.y+(b.fly>0?0:Math.abs(Math.sin(t*6+b.ph))*.02),b.z);});if(scared)EQ.sfx.pigeons();});
   W.spots.piazza={x:pz.x,z:pz.z};
  }
  // parchi
  blocks.filter(b=>b.type==='park'||b.type==='park2').forEach((b,k)=>{
    patch(W,b.x,b.z,B+1,B+1,TX.grass(),6,.15);
    patch(W,b.x,b.z,B+1,3,TX.gravel(),4,.16);patch(W,b.x,b.z,3,B+1,TX.gravel(),4,.161);
    const tr=[];for(let i=0;i<18;i++){let x=b.x+rnd(-19,19),z=b.z+rnd(-19,19);if(Math.abs(x-b.x)<3||Math.abs(z-b.z)<3)continue;if(b.type==='park'&&Math.abs(x-b.x)<14&&Math.abs(z-b.z)<14)continue;tr.push({x,z,y:.15,s:rnd(.7,1),ry:rnd(0,3)});}
    addTrees(W,'oak',tr,[0x6e9a3e,0x7aa64a],.45);
    for(let i=0;i<4;i++){const a=i*Math.PI/2,x=b.x+Math.cos(a)*6,z=b.z+Math.sin(a)*6;const bn=new THREE.Group();bn.position.set(x,.15,z);bn.rotation.y=-a+Math.PI/2;W.group.add(bn);
      mesh(G.box(1.8,.08,.5),new THREE.MeshStandardMaterial({map:TX.wood('#8a5a34')}),0,.45,0,bn);mesh(G.box(1.8,.4,.06),new THREE.MeshStandardMaterial({map:TX.wood('#8a5a34')}),0,.75,-.24,bn);
      for(const s of [-1,1])mesh(G.box(.06,.45,.5),mat(0x222222,.4,.6),s*.8,.22,0,bn);W.colliders.push({x,z,r:1});}
    if(b.type==='park'){ // percorso con balle di fieno e siepi
      const hm=new THREE.MeshStandardMaterial({map:TX.straw(),roughness:1});
      const jp=[[b.x-10,b.z+9,0],[b.x+10,b.z+9,0],[b.x+10,b.z-9,Math.PI/2],[b.x-10,b.z-9,Math.PI/2]];
      jp.forEach(([x,z,a],i)=>{const g=new THREE.Group();g.position.set(x,.15,z);g.rotation.y=a;W.group.add(g);
        if(i%2===0){for(const s of [-1,1]){const hb=mesh(G.box(1.3,.55,.6),hm,s*.68,.28,0,g);}}
        else{mesh(blob(1,1,3.3,.25),new THREE.MeshStandardMaterial({map:TX.leaves(),color:C(0x3f7a2c)}),0,.4,0,g).scale.set(1.5,.45,.35);}
        const dx=Math.cos(a)*1.4,dz=-Math.sin(a)*1.4;W.jumps.push({ax:x-dx,az:z-dz,bx:x+dx,bz:z+dz,h:.6});});
    }
  });
  // lampioni e alberi stradali
  {const L=[],T=[];for(let k=-n-1;k<=n;k++){const c=(k+.5)*P;for(let s=-ext+8;s<ext;s+=16){if(Math.abs(((s+ext)%P)-P/2)<R)continue;
      for(const o of [-R/2-.6,R/2+.6]){L.push({x:c+o,z:s});L.push({x:s,z:c+o});}}}
   const lp=L.filter((a,i)=>i%2===0);
   W.group.add(inst(G.cyl(.07,.1,4.5,8),mat(0x2a2a2a,.4,.6),lp.map(a=>({x:a.x,y:2.25,z:a.z}))));
   W.group.add(inst(G.sph(.25,10,8),new THREE.MeshStandardMaterial({color:0xfff6d0,emissive:C(0x554422),roughness:.2}),lp.map(a=>({x:a.x,y:4.6,z:a.z}))));
   lp.forEach(a=>W.colliders.push({x:a.x,z:a.z,r:.2}));
   const tp=L.filter((a,i)=>i%2===1&&i%3!==0).map(a=>({x:a.x,z:a.z,y:.14,s:rnd(.55,.7),ry:rnd(0,3)}));
   addTrees(W,'oak',tp,[0x6e9a3e,0x7aa64a],.4);}
  // auto parcheggiate
  const carGeo=(()=>{const parts=[EQ.tint(EQ.xform(G.box(1.75,.7,3.9),0,.55,0),0xffffff),EQ.tint(EQ.xform(G.box(1.55,.55,2.1),0,1.15,-.2),0x223344)];
    for(const s of [-1,1])for(const z of [-1.25,1.3])parts.push(EQ.tint(EQ.xform(G.cyl(.32,.32,.22,14),s*.82,.32,z,0,0,Math.PI/2),0x111111));
    parts.push(EQ.tint(EQ.xform(G.box(1.6,.15,.05),0,.6,1.96),0xffffcc));return parts;})();
  {const geos=[];const cc=[0xc0392b,0xf1c40f,0x2a58c8,0xecf0f1,0x2f6b33,0x111111,0x8e44ad,0xe67e22,0x95a5a6];
   for(let k=-n-1;k<=n;k++){const c=(k+.5)*P;for(let s=-ext+10;s<ext-10;s+=7){if(Math.abs(((s+ext)%P)-P/2)<R+3)continue;if(Math.random()<.55)continue;
     const vertical=Math.random()<.5;const col=cc[Math.random()*cc.length|0];
     const x=vertical?c+R/2-1.3:s, z=vertical?s:c-R/2+1.3, ry=vertical?0:Math.PI/2;
     carGeo.forEach((g,i)=>{const gg=g.clone();if(i===0)EQ.tint(gg,col);gg.rotateY(ry);gg.translate(x,0,z);geos.push(gg);});
     W.colliders.push({x,z,hx:vertical?1:2.1,hz:vertical?2.1:1});}}
   mesh(EQ.merge(geos),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.3}),0,0,0,W.group);}
  // auto in movimento (anello attorno al centro)
  const loopR=P*1.5, lane=2;
  const path=[[-loopR+lane,-loopR+lane],[loopR-lane,-loopR+lane],[loopR-lane,loopR-lane],[-loopR+lane,loopR-lane]];
  const perim=(loopR-lane)*8;
  const cars=[];
  const cm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.3});
  for(let i=0;i<5;i++){const geos=carGeo.map((g,k)=>{const gg=g.clone();if(k===0)EQ.tint(gg,[0xc0392b,0x2a58c8,0xf1c40f,0xecf0f1,0x2f6b33][i]);return gg;});
    const m=mesh(EQ.merge(geos),cm,0,0,0,W.group);const col={x:0,z:0,r:2.2};W.colliders.push(col);cars.push({m,s:i*perim/5,v:8,col});}
  const posOn=s=>{s=((s%perim)+perim)%perim;const L=(loopR-lane)*2;const seg=Math.floor(s/L),t=(s-seg*L)/L;const a=path[seg],b=path[(seg+1)%4];return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,h:Math.atan2(b[0]-a[0],b[1]-a[1])};};
  W.updaters.push((dt,t,p)=>{cars.forEach(c=>{const q=posOn(c.s),fx=Math.sin(q.h),fz=Math.cos(q.h);let tgt=9;
    if(p){const dx=p.x-q.x,dz=p.z-q.z,ahead=dx*fx+dz*fz,side=Math.abs(dx*fz-dz*fx);if(ahead>0&&ahead<14&&side<3.5)tgt=0;}
    for(const o of cars){if(o===c)continue;const d=((o.s-c.s)%perim+perim)%perim;if(d<8)tgt=0;}
    c.v=U.lerp(c.v,tgt,Math.min(1,dt*(tgt?1:4)));c.s+=c.v*dt;const r=posOn(c.s);c.m.position.set(r.x,0,r.z);c.m.rotation.y=r.h;c.col.x=r.x;c.col.z=r.z;
    if(tgt===0&&c.v<1&&Math.random()<dt*.15)EQ.sfx.horn();});
    if(p)EQ.loop('city',.07,250,.4,'lowpass');});
  // pedoni
  {const pc=[0xe74c3c,0x3498db,0xf1c40f,0x2ecc71,0x9b59b6,0xffffff,0xe67e22,0x1abc9c];const peds=[];
   for(let i=0;i<18;i++){const g=new THREE.Group();W.group.add(g);const col=pc[i%8];
     mesh(G.cyl(.17,.2,.7,10),mat(col,.7),0,1.15,0,g);mesh(G.sph(.12,10,8),mat([0xf1c7a5,0xd9a67a,0x8d5a3b][i%3],.6),0,1.65,0,g);
     const legs=[];for(const s of [-1,1]){const l=new THREE.Group();l.position.set(s*.09,.8,0);g.add(l);mesh(G.cyl(.06,.05,.8,6),mat(0x2c3e66,.8),0,-.4,0,l);legs.push(l);}
     const k=(Math.random()*(2*n+2)|0)-n-1,c=(k+.5)*P,vert=Math.random()<.5,o=(Math.random()<.5?-1:1)*(R/2+1.2);
     const a=rnd(-ext+10,ext-30);const col2={x:0,z:0,r:.4};W.colliders.push(col2);
     peds.push({g,legs,vert,c:c+o,a,b:a+rnd(14,30),s:a,dir:1,ph:rnd(0,9),col:col2});}
   W.updaters.push((dt,t,p)=>{peds.forEach(q=>{const x=q.vert?q.c:q.s,z=q.vert?q.s:q.c;let v=1.3;
     if(p&&Math.hypot(p.x-x,p.z-z)<5)v=0;
     q.s+=q.dir*v*dt;if(q.s>q.b)q.dir=-1;if(q.s<q.a)q.dir=1;q.ph+=dt*v*5;
     q.g.position.set(x,.14,z);q.g.rotation.y=q.vert?(q.dir>0?0:Math.PI):(q.dir>0?Math.PI/2:-Math.PI/2);
     if(v===0&&p)q.g.rotation.y=Math.atan2(p.x-x,p.z-z);
     q.legs.forEach((l,i)=>l.rotation.x=Math.sin(q.ph+i*Math.PI)*.5*Math.min(1,v));q.col.x=x;q.col.z=z;});});}
  // semafori decorativi
  for(const [x,z] of [[P/2+R/2+1,P/2+R/2+1],[-P/2-R/2-1,-P/2-R/2-1],[P/2+R/2+1,-P/2-R/2-1],[-P/2-R/2-1,P/2+R/2+1]]){
    mesh(G.cyl(.07,.07,3.2,8),mat(0x333333,.4,.6),x,1.6,z,W.group);mesh(G.box(.35,.9,.3),mat(0x222222,.5),x,3.3,z,W.group);
    [0xff3030,0xffb000,0x30d050].forEach((c,i)=>mesh(G.sph(.09,8,6),new THREE.MeshStandardMaterial({color:C(c),emissive:C(i===2?c:0x000000),roughness:.3}),x,3.6-i*.28,z+.16,W.group));
    W.colliders.push({x,z,r:.2});}
  // coccarde da raccogliere
  const spots=[];for(let k=-n-1;k<=n;k++){const c=(k+.5)*P;spots.push([c,rnd(-ext+15,ext-15)],[rnd(-ext+15,ext-15),c]);}
  spots.sort(()=>Math.random()-.5);
  spots.slice(0,10).forEach(s=>W.items.push({x:s[0],z:s[1],y:0}));
  W.itemKind='rosette';
  W.bounds={x0:-ext+1,x1:ext-1,z0:-ext+1,z1:ext-1};
  W.spawn={x:0,z:-P/2,h:Math.PI/2};
  let bellT=1;W.updaters.push((dt)=>{if(bellT>0){bellT-=dt;if(bellT<=0)EQ.sfx.bell();}});
  return W;
};
function metal(){return mat(0xc0c4c8,.3,1);}
})();
