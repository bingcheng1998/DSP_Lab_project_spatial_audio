import * as THREE from 'three';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'stats.js';
import {print} from "./helper";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const loader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setX(0);
camera.position.setZ(30);

renderer.render(scene, camera);

// const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
// const material = new THREE.MeshStandardMaterial({color: 0xFF6347});
// const torus = new THREE.Mesh(geometry, material);

// scene.add(torus);

const pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.set(20,20,20);
const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(pointLight, ambientLight);

// add helper for development, remove these lines before upload
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(()=>THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  const emptySpace = 14;
  if (Math.abs(x) < emptySpace || Math.abs(y) < emptySpace || Math.abs(z) < emptySpace) {
    return;
  }
  scene.add(star);
}
Array(200).fill().forEach(addStar);

const space_img = require('../img/universe2.webp');
new THREE.TextureLoader().load(
  space_img,
  function (texture) {
    texture.needsUpdate = true;
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(renderer, texture);
    // scene.background.encoding = THREE.sRGBEncoding;
    scene.background = rt.texture;
  },
  function ( xhr ) {
    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
  },
  function (xhr) {
    console.log( 'An error happened' );
  }
);

// const cat = require('../img/cat.webp');
// const pic = new THREE.TextureLoader().load(cat);
//
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(3,3,3),
//   new THREE.MeshBasicMaterial({map: pic})
// )

// scene.add(cube);

const glb = require('../img/thefuture.glb');
let headModel;
loader.load( glb, function ( gltf ) {
  headModel = gltf.scene;
  scene.add(headModel);
}, function ( xhr ) {
  // console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
}, function ( error ) {
  console.error( error );
} );

const Page_height = screen.height;

function moveCamera() {
  // const t = document.body.getBoundingClientRect().top;
  // camera.position.z = 30+t * -0.1;
  // camera.position.y = t * - 0.02;
  // camera.rotation.x =- t * -0.001;

  const p1 = document.getElementById('page1').getBoundingClientRect().top;
  const p2 = document.getElementById('page2').getBoundingClientRect().top;
  // console.log(p1, p2, Page_height);

  const setPosRot = (p, start, end, v1, v2, r1, r2) => {
    // when p < start && p > end, smoothly move from v1 to v2, and rotate from r1 to r2
    if (p>start || p<end) {return;}
    // finishRate will change in [0,1]
    const finishRate = (start - p)/(start - end);
    const run = (x, y, fun) => {
      return [fun(x[0], y[0]), fun(x[1], y[1]), fun(x[2], y[2])]
    }
    const v = run(v1, v2, (a, b)=>{return finishRate*b + (1-finishRate)*a});
    const r = run(r1, r2, (a, b)=>{return finishRate*b + (1-finishRate)*a});
    camera.position.x = v[0];
    camera.position.y = v[1];
    camera.position.z = v[2];
    camera.rotation.x = r[0];
    camera.rotation.y = r[1];
    camera.rotation.z = r[2];
    // console.log('finishRate',finishRate,v, r, v1);
  }

  let start_pos = 1/3;
  if (p2 >= Page_height * start_pos) {
    setPosRot(p2, 0, -1000,
      [0, 0, 0],[0, 0, 0],
      [0, 0, 0],[0, 0, 0]);
  }else if (p2 < Page_height * start_pos && p2 > 0) {
    setPosRot(p2, Page_height * start_pos, 0,
      [0, 0, 30],[0, 0, 60],
      [0, 0, 0],[-Math.PI*1/5, 0, 0]);
  } else if (p2 < 0) {
    // const t = - Page_height*start_pos;
    // camera.position.z = 30+t * -0.1;
    // camera.position.y = t * - 0.02;
  }
}
document.body.onscroll = moveCamera;

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.getElementById('stats').appendChild(stats.dom);

function removeElementsByClass(className){
  const elements = document.getElementsByClassName(className);
  while(elements.length > 0){
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}
const norm = (x) => {
  const len = Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);
  return [x[0]/len, x[1]/len, x[2]/len];
}
const mean = (x) => {
  const len = x.length;
  let sum = 0;
  for(let xx of x){
    sum += xx;
  }
  return sum/len;
}

let alphas = [0,0,0,0,0];
let betas = [0,0,0,0,0];
let gammas = [0,0,0,0,0];
let k = 0;
const arrLen = alphas.length;

let loadingExist = true;
let mirror_reverse = -1;
window.addEventListener('build', function (event) {
  if (headModel) {
    const info = document.querySelector('.info');
    let global_up = event.point_up;
    let global_forward = event.point_forward;
    info.textContent = print(['u: x','y','z'],global_up);
    info.textContent += print(['f: x','y','z'],global_forward);

    let z = global_forward;
    z = [-z[0], z[1], -z[2]];
    let y = global_up;
    // cross multiply: Z = X x Y
    let x = [y[1]*z[2]-y[2]*z[1], y[2]*z[0]-y[0]*z[2], y[0]*z[1]-y[1]*z[0]];
    x = norm(x);
    info.textContent += print(['x: x','y','z'],x);
    // then clculate Eular angle as described in https://en.wikipedia.org/wiki/Euler_angles:
    let alpha = Math.atan(-z[1]/z[2]);
    let beta = Math.atan(z[0]/Math.sqrt(1 - z[0]*z[0]));
    let gamma = Math.atan(-y[0]/x[0]);
    info.textContent += print(['r: a','b','r'],[alpha, beta, gamma]);

    alphas[k] = alpha;
    gammas[k] = gamma;
    betas[k] = beta;

    k ++;
    if (k>arrLen) k = 0;

    // mirror_reverse = -1 表示开启镜像
    headModel.rotation.x = mean(alphas);
    headModel.rotation.y = mirror_reverse * mean(betas);
    headModel.rotation.z = -mirror_reverse * mean(gammas);

    if (loadingExist) {
      removeElementsByClass('loader');
    }
  }
});

function mirrorSet(value) {
  console.log('chacked?', value);
  if(value) {
    mirror_reverse = -1;
  } else {
    mirror_reverse = 1;
  }
}
document.getElementById('mirror').addEventListener('click', function (){
  mirrorSet(this.checked);
});

function animate() {
  stats.begin();
  // torus.rotation.x += 0.01;
  // torus.rotation.y += 0.005;
  // torus.rotation.z += 0.003;


  // controls.update();
  renderer.render(scene, camera);
  // stats.end();
  // requestAnimationFrame(animate);
  setTimeout( function() {
    requestAnimationFrame( animate );
  }, 1000 / 24 );
  stats.end();
}
requestAnimationFrame( animate );

animate();
