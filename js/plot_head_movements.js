import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import Stats from 'stats.js';
import {print} from "./helper";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const loader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// camera.position.setX(0);
camera.position.setZ(30);

renderer.render(scene, camera);

// const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
// const material = new THREE.MeshStandardMaterial({color: 0xFF6347});
// const torus = new THREE.Mesh(geometry, material);

// scene.add(torus);

const addBall = (x, z, color) => {
  const geometry = new THREE.SphereGeometry( 2, 32, 16 );
  const material = new THREE.MeshStandardMaterial( { color: color } );
  const sphere = new THREE.Mesh( geometry, material );
  sphere.position.x = x;
  sphere.position.z = z;
  scene.add( sphere );
  return sphere;
}
let FL = addBall(-20, 23, "rgb(48,7,87)");
let FR = addBall(20, 23, "rgb(19,28,96)");
let FC = addBall(0, 33.5, "rgb(101,44,14)");
let LFE = addBall(0, 0, "rgb(152,234,52)");
let BL = addBall(-20, -20, "rgb(21,56,96)");
let BR = addBall(20, -20, "rgb(80,29,140)");
let SL = addBall(-30, 0, "rgb(13,37,96)");
let SR = addBall(30, 0, "rgb(71,21,103)");
let balls = [FL, FR, FC, LFE, BL, BR, SL, SR];
let getInitBallsColor = () =>{
  let colors = [];
  for (let ball of balls) {
    colors.push(new THREE.Color(ball.material.color));
  }
  return colors;
}
const initBallsColor = getInitBallsColor();

window.addEventListener('music', function (event) {
  let maxValues = event.maxValues;
  // console.log('maxValues', maxValues, initBallsColor[0]);
  for (let i = 0; i < 8; i ++) {
    let ball = balls[i];
    let value = Math.min(maxValues[i], 30)/10 + 1.0;
    let r = initBallsColor[i].r;
    let g = initBallsColor[i].g;
    let b = initBallsColor[i].b;
    ball.material.color.r = r * value;
    ball.material.color.g = g * value;
    ball.material.color.b = b * value;
  }
})


const pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.set(20,20,20);
const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(pointLight, ambientLight);

// add helper for development, remove these lines before upload
// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

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
    // console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
  },
  function (xhr) {
    console.log( 'An error happened' );
  }
);

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

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
let mirror_reverse = -1;

function moveCamera() {
  const p1 = document.getElementById('page1').getBoundingClientRect().top;
  const p2 = document.getElementById('page2').getBoundingClientRect().top;
  const p3 = document.getElementById('page3').getBoundingClientRect().top;
  const p4 = document.getElementById('page4').getBoundingClientRect().top;
  // console.log(p1,p3, Page_height);

  const setPosRot = (p, start, end, v1, v2) => {
    // when p < start && p > end, smoothly move from v1 to v2, and rotate from r1 to r2
    if (p>start || p<end) {return;}
    // finishRate will change in [0,1]
    const finishRate = (start - p)/(start - end);
    const run = (x, y, fun) => {
      return [fun(x[0], y[0]), fun(x[1], y[1]), fun(x[2], y[2])]
    }
    const v = run(v1, v2, (a, b)=>{return finishRate*b + (1-finishRate)*a});
    camera.position.x = v[0];
    camera.position.y = v[1];
    camera.position.z = v[2];
  }

  let start_pos = 1/3;
  if (p2 > Page_height * start_pos) {
    // Scroll on page 1
    setPosRot(p1, 0, -100,
      [0, 0, 30],[0, camera.position.y, 30]);
  }else if (p2 <= Page_height * start_pos && p2 >= 0) {
    // Scroll to faraway on page 2
    setPosRot(p2, Page_height * start_pos, 0,
      [0, 0, 30],[0, 60, 100]);
  } else if (p3 > 0 && p3 < Page_height * start_pos ) {
    // Scroll according to setting in (mirror) on page 3
    if (mirror_reverse === -1){
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        setPosRot(p3, Page_height * start_pos, 0,
          [0, 60, 100],[0, 35, 80]);
      } else {
        setPosRot(p3, Page_height * start_pos, 0,
          [0, 60, 100],[0, 15, 45]);
      }

    } else {
      // if no mirror setting, we need to transpose the camera to the back
      if (p3 > Page_height * start_pos/2){
        setPosRot(p3, Page_height * start_pos, Page_height * start_pos/2,
          [0, 60, 100],[-60, 40, 0]);
      } else {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
          setPosRot(p3, Page_height * start_pos/2, 0,
            [-60, 40, 0],[0, 35, -80]);
        } else {
          setPosRot(p3, Page_height * start_pos/2, 0,
            [-60, 40, 0],[0, 25, -45]);
        }

      }
    }
  } else if (p3 < 0) {
    if (mirror_reverse === -1){
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        setPosRot(p3, 0, -Page_height,
          [0, 35, 80],[0, 35, 80]);
      } else {
        setPosRot(p3, 0, -Page_height,
          [0, 15, 45],[0, 15, 45]);
      }
    } else {
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        setPosRot(p3, 0, -Page_height,
          [0, 35, -80],[0, 35, -80]);
      } else {
        setPosRot(p3, 0, -Page_height,
          [0, 25, -45],[0, 25, -45]);
      }
    }
  }
}
document.body.onscroll = moveCamera;

// const stats = new Stats();
// stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.getElementById('stats').appendChild(stats.dom);

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

window.addEventListener('build', function (event) {
  if (headModel) {
    const info = document.querySelector('.info');
    let global_up = event.point_up;
    let global_forward = event.point_forward;
    // info.textContent = print(['u: x','y','z'],global_up);
    // info.textContent += print(['f: x','y','z'],global_forward);

    let z = global_forward;
    z = [-z[0], z[1], -z[2]];
    let y = global_up;
    // cross multiply: Z = X x Y
    let x = [y[1]*z[2]-y[2]*z[1], y[2]*z[0]-y[0]*z[2], y[0]*z[1]-y[1]*z[0]];
    x = norm(x);
    // info.textContent += print(['x: x','y','z'],x);
    // then clculate Eular angle as described in https://en.wikipedia.org/wiki/Euler_angles:
    let alpha = Math.atan(-z[1]/z[2]);
    let beta = Math.atan(z[0]/Math.sqrt(1 - z[0]*z[0]));
    let gamma = Math.atan(-y[0]/x[0]);
    // info.textContent += print(['r: a','b','r'],[alpha, beta, gamma]);

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
    for (let ball of balls) {
      ball.position.x = -ball.position.x;
    }
  } else {
    mirror_reverse = 1;
    for (let ball of balls) {
      ball.position.x = -ball.position.x;
    }
  }
}
document.getElementById('mirror').addEventListener('click', function (){
  mirrorSet(this.checked);
});

function animate() {
  // stats.begin();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  // setTimeout( function() {
  //   requestAnimationFrame( animate );
  // }, 1000 / 24 );
  // stats.end();
}
requestAnimationFrame( animate );

animate();
