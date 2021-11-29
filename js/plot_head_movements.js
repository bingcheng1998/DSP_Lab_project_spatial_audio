import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'stats.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const loader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setX(-20);
camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({color: 0xFF6347});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

const pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.set(20,20,20);
const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(pointLight, ambientLight);

// add helper for development, remove these lines before upload
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);
// const controls = new OrbitControls(camera, renderer.domElement);

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

const cat = require('../img/cat.webp');
const pic = new THREE.TextureLoader().load(cat);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(3,3,3),
  new THREE.MeshBasicMaterial({map: pic})
)

scene.add(cube);

const glb = require('../img/nintendo_mario.glb');
let headModel;
loader.load( glb, function ( gltf ) {
  headModel = gltf.scene;
  scene.add(headModel);
}, function ( xhr ) {
  console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
}, function ( error ) {
  console.error( error );
} );

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;

  camera.position.z = 30+t * -0.1;
  camera.position.x = -20 + t * - 0.02;
  camera.position.y = t * - 0.02;

  camera.rotation.x =- t * -0.001;

  if (headModel) {
    headModel.rotation.y += 0.05;
  }
}
document.body.onscroll = moveCamera;


const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.getElementById('stats').appendChild(stats.dom);

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
// document.body.onscroll = animate;
