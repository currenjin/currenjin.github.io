import * as THREE from './vendor/three.module.js';

const hero = document.querySelector('.cosmic-masthead');
const canvas = hero.querySelector('canvas');
const inspect = canvas;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const state = window.cosmicState = {webgl:false, frames:0, time:0, reducedMotion:reduced.matches, inspecting:false, particles:28000};
Object.defineProperty(state,'reducedMotion',{enumerable:true,get:()=>reduced.matches});
try {
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  state.webgl = renderer.getContext() instanceof WebGL2RenderingContext;
  state.renderer = renderer.getContext().getParameter(renderer.getContext().RENDERER);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36,1,.1,50);
  const world = new THREE.Group(); scene.add(world);
  const disk = new THREE.Group(); disk.rotation.x = 1.28; disk.rotation.z = -.15; world.add(disk);
  const construction = new THREE.Group(); world.add(construction);
  const uniforms = {uTime:{value:0},uColor:{value:new THREE.Color()},uPixelRatio:{value:renderer.getPixelRatio()}};
  const positions = new Float32Array(state.particles*3), seeds = new Float32Array(state.particles*3);
  let seed=139; const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<state.particles;i++) {
    const r=.76+Math.pow(rand(),1.6)*1.9;
    const a=rand()*Math.PI*2;
    positions.set([r,a,(rand()-.5)*.055*(r-.3)],i*3);
    seeds.set([rand(),rand(),rand()],i*3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,3));
  const material = new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
    vertexShader:`attribute vec3 aSeed;uniform float uTime;uniform float uPixelRatio;varying float vAlpha;void main(){float r=position.x;float a=position.y+uTime*.22/pow(r,1.45);float w=sin(a*4.0-r*5.0+uTime*.035);vec3 p=vec3(cos(a)*r,sin(a)*r,position.z+sin(a*3.0+r)*.018);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=(1.2+aSeed.x*1.4)*uPixelRatio*(5.0/-mv.z);vAlpha=(.18+.65*aSeed.y)*(.64+.36*w)*(1.0-smoothstep(2.2,2.66,r));}`,
    fragmentShader:`uniform vec3 uColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.0;float a=(1.0-smoothstep(.1,1.0,d))*vAlpha;if(a<.012)discard;gl_FragColor=vec4(uColor,a);}`
  });
  const particles = new THREE.Points(geometry,material);particles.frustumCulled=false;disk.add(particles);
  const flow = new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform float uTime;uniform vec3 uColor;varying vec2 vP;void main(){float r=length(vP);float a=atan(vP.y,vP.x);float edge=smoothstep(.73,.88,r)*(1.0-smoothstep(1.4,2.65,r));float bands=.5+.5*sin(r*89.0+sin(a*4.0-r*6.0-uTime*.12)*2.0);float stream=.65+.35*sin(a*3.0-r*7.0-uTime*.18/pow(r,1.4));gl_FragColor=vec4(uColor,edge*(.025+.065*bands)*stream);}`
  });
  disk.add(new THREE.Mesh(new THREE.RingGeometry(.73,2.66,192,8),flow));
  const ringMaterials=[];
  function orbit(radius, opacity, parent=disk, tilt=0) {
    const points=[];
    for(let i=0;i<=256;i++){const a=i/256*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*radius,0));}
    const m=new THREE.LineBasicMaterial({color:0x8b7d66,transparent:true,opacity,depthWrite:false});
    const line=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),m);line.rotation.x=tilt;parent.add(line);ringMaterials.push(m);return line;
  }
  const permanent=[];
  for(const [r,a] of [[.77,.55],[.80,.34],[.87,.18],[1.12,.12],[1.5,.10],[1.94,.07],[2.64,.12]])permanent.push(orbit(r,a));
  const guides=[];
  for(const r of [.66,1.34,2.15,2.84])guides.push(orbit(r,0,construction,1.28));
  guides.push(orbit(1.45,0,construction,.16));
  guides.push(orbit(1.45,0,construction,Math.PI/2));
  const axesGeom=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.05,0,0),new THREE.Vector3(3.05,0,0),new THREE.Vector3(0,-1.7,0),new THREE.Vector3(0,1.7,0)]);
  const axisMat=new THREE.LineBasicMaterial({transparent:true,opacity:0});
  construction.add(new THREE.LineSegments(axesGeom,axisMat));
  const coreMaterial=new THREE.ShaderMaterial({uniforms:{uEdge:{value:new THREE.Color('#d8c7a4')},uCore:{value:new THREE.Color('#292723')}},
    vertexShader:`varying vec3 vNormal;varying vec3 vView;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vNormal=normalize(normalMatrix*normal);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform vec3 uCore;uniform vec3 uEdge;varying vec3 vNormal;varying vec3 vView;void main(){float rim=pow(1.0-max(dot(normalize(vNormal),normalize(vView)),0.0),12.0);gl_FragColor=vec4(mix(uCore,uEdge,rim*.9),1.0);}`
  });
  world.add(new THREE.Mesh(new THREE.SphereGeometry(.62,72,48),coreMaterial));
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.635,.008,8,160),new THREE.MeshBasicMaterial({color:0xd8c7a4,transparent:true,opacity:.65}));
  rim.position.z=.015;world.add(rim);
  function theme() {
    const dark=document.documentElement.dataset.theme==='dark';
    uniforms.uColor.value.set(dark?'#e5dbc4':'#756344');
    coreMaterial.uniforms.uCore.value.set(dark?'#100e0c':'#292723');
    coreMaterial.uniforms.uEdge.value.set(dark?'#eadfc4':'#c9b68e');
    for(const m of ringMaterials)m.color.set(dark?'#d4c9af':'#89795e');
    axisMat.color.set(dark?'#b7ad9a':'#958773');
    render();
  }
  let targetX=0,targetY=0,hover=false,latched=false,focused=false,reveal=0,visible=true,last=0,frameId=0;
  function inspected(){return hover||latched||focused;}
  function render(){if(!state.webgl)return;renderer.render(scene,camera);state.frames++;state.time=uniforms.uTime.value;hero.dataset.cosmicReady='true';}
  function resize(){const {width,height}=canvas.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.set(0,.10,Math.max(8.1,3.65/(camera.aspect*Math.tan(Math.PI/10))));camera.lookAt(0,.10,0);camera.updateProjectionMatrix();world.position.y=.20;render();}
  function animate(timestamp){
    frameId=0;
    if(!state.webgl||reduced.matches||!visible||document.hidden){last=0;return;}
    const dt=last?Math.min((timestamp-last)/1000,.05):0;last=timestamp;
    uniforms.uTime.value+=dt;
    world.rotation.y+=(targetX-world.rotation.y)*.045;
    world.rotation.x+=(targetY-world.rotation.x)*.045;
    reveal+=((inspected()?1:0)-reveal)*.075;
    for(const g of guides)g.material.opacity=reveal*.36;
    axisMat.opacity=reveal*.20;state.inspecting=inspected();
    render();frameId=requestAnimationFrame(animate);
  }
  function resume(){if(state.webgl&&!reduced.matches&&visible&&!document.hidden&&!frameId)frameId=requestAnimationFrame(animate);}
  function updateInspection(){state.inspecting=inspected();inspect.setAttribute('aria-pressed',String(latched));if(reduced.matches){for(const g of guides)g.material.opacity=inspected()?.36:0;axisMat.opacity=inspected()?.20:0;render();}resume();}
  hero.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;updateInspection();}});
  hero.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType!=='mouse')return;const r=hero.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*.30;targetY=((e.clientY-r.top)/r.height-.5)*.15;});
  hero.addEventListener('pointerleave',()=>{hover=false;targetX=targetY=0;updateInspection();});
  inspect.addEventListener('focus',()=>{focused=true;updateInspection();});
  inspect.addEventListener('blur',()=>{focused=false;updateInspection();});
  inspect.addEventListener('click',()=>{latched=!latched;updateInspection();});
  hero.addEventListener('keydown',e=>{if(e.key==='Escape'){latched=false;focused=false;hover=false;updateInspection();}else if(e.target===canvas && (e.key==='Enter'||e.key===' ')){e.preventDefault();latched=!latched;updateInspection();}});
  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&frameId){cancelAnimationFrame(frameId);frameId=0;last=0;}resume();},{rootMargin:'40px'}).observe(hero);
  reduced.addEventListener('change',()=>{if(frameId){cancelAnimationFrame(frameId);frameId=0;}last=0;targetX=targetY=0;world.rotation.set(0,0,0);updateInspection();render();resume();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&frameId){cancelAnimationFrame(frameId);frameId=0;last=0;}resume();});
  canvas.addEventListener('webglcontextlost',e=>{
    e.preventDefault();state.webgl=false;delete hero.dataset.cosmicReady;
    if(frameId)cancelAnimationFrame(frameId);frameId=0;last=0;
  });
  canvas.addEventListener('webglcontextrestored',()=>{state.webgl=true;resize();theme();resume();});
  resize();theme();resume();
} catch (error) {
  state.error=String(error);state.webgl=false;
  delete hero.dataset.cosmicReady;
}