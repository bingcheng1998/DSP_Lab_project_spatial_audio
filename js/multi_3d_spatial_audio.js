import {print} from './helper.js'

// for cross browser way
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let listener;

function init(audioElements) {

  audioCtx = new AudioContext();
  listener = audioCtx.listener;

  // Let's set the position of our listener based on where our boombox is.
  const posX = 0;
  const posY = 0;
  const posZ = 0;

  // set position of the listener
  if(listener.positionX) {
    listener.positionX.value = posX;
    listener.positionY.value = posY;
    listener.positionZ.value = posZ;
  } else {
    listener.setPosition(posX, posY, posZ);
  }
  // set the orientation of the head of listener
  if(listener.forwardX) {
    listener.forwardX.value = 0;
    listener.forwardY.value = 0;
    listener.forwardZ.value = -1;
    listener.upX.value = 0;
    listener.upY.value = 1;
    listener.upZ.value = 0;
  } else {
    listener.setOrientation(0, 0, -1, 0, 1, 0);
  }

  const pannerModel = 'HRTF';

  const innerCone = 40;
  const outerCone = 50;
  const outerGain = 1; // omnisource
  const distanceModel = 'linear';
  const maxDistance = 20000;
  const refDistance = 1;

  const rollOff = 0.8;

  const positionX = posX;
  const positionY = posY;
  const positionZ = posZ;

  const orientationX = 0.0;
  const orientationY = 0.0;
  const orientationZ = 1.0;

  // let's use the class method for creating our panner node and pass in all those parameters we've set.

  function panner(pos) {
    return new PannerNode(audioCtx, {
      panningModel: pannerModel,
      distanceModel: distanceModel,
      positionX: positionX+pos[0],
      positionY: positionY+pos[1],
      positionZ: positionZ+pos[2],
      orientationX: orientationX,
      orientationY: orientationY,
      orientationZ: orientationZ,
      refDistance: refDistance,
      maxDistance: maxDistance,
      rolloffFactor: rollOff,
      coneInnerAngle: innerCone,
      coneOuterAngle: outerCone,
      coneOuterGain: outerGain
    })
  }
  //             [alpha, beta, gamma]
  //               [z, x, y] according to https://www.w3.org/TR/orientation-event/
  let init_flags = [0, 0, 0];
  let init_values = [0, 0, 0];
  let prev_values = [0, 0, 0];
  let diff_values = [0, 0, 0];
  if (window.DeviceOrientationEvent) {
    console.log("success: DeviceOrientationEvent")
    window.addEventListener('deviceorientation', function (event) {
      const info = document.querySelector('.info');
      let z = event.alpha,
        x = event.beta,
        y = event.gamma;
      // console.log(x+","+y+","+z);
      let values = [z, x, y];
      let exist_large_diff = 0;
      const drop_size_for_calibration = 2;
      for (let i = 0; i < 3; i ++) {
        if (init_flags[i] < drop_size_for_calibration) {
          init_flags[i] += 1;
          init_values[i] = values[i];
        }
        diff_values[i] = values[i] - init_values[i];
        if (Math.abs(prev_values[i] - diff_values[i]) > 1) {
          exist_large_diff = 1;
        }
      }
      if (exist_large_diff === 0) {
        return;
      }
      prev_values[0] = diff_values[0];
      prev_values[1] = diff_values[1];
      prev_values[2] = diff_values[2];

      z = diff_values[0];
      x = diff_values[1];
      y = diff_values[2];

      let Sx = Math.sin(x/180 * Math.PI),
        Sy = Math.sin(y/180 * Math.PI),
        Sz = Math.sin(z/180 * Math.PI),
        Cx = Math.cos(x/180 * Math.PI),
        Cy = Math.cos(y/180 * Math.PI),
        Cz = Math.cos(z/180 * Math.PI);
      let Xx=Cy*Cz-Sx*Sy*Sz,
        Yx=-Cx*Sz,
        Zx=Cz*Sy+Cy*Sx*Sz,
        Xy=Cz*Sx*Sy+Cy*Sz,
        Yy=Cx*Cz,
        Zy=-Cy*Cz*Sx+Sy*Sz,
        Xz=-Cx*Sy,
        Yz=Sx,
        Zz=Cx*Cy;

      info.textContent = print(['alpha','beta','gamma'],[z, x, y]);
      info.textContent += print(['X: x','y','z'],[Xx, Xy, Xz]);
      info.textContent += print(['Y: x','y','z'],[Yx, Yy, Yz]);
      info.textContent += print(['Z: x','y','z'],[Zx, Zy, Zz]);
      // Change the position of head and recalculate the volume on each ear
      listener.forwardX.value = Yx;
      listener.forwardY.value = Yz;
      listener.forwardZ.value = -Yy;
      listener.upX.value = Zx;
      listener.upY.value = Zz;
      listener.upZ.value = -Zy;

    });
  } else {
    console.log("error: DeviceOrientationEvent")
  }

  for (let audioPack of audioElements) {
    // add each track to the IMU control
    let audioElement =  audioPack[0];
    let pos = audioPack[1];
    let gain = audioPack[2];
    console.log(pos);
    const track = audioCtx.createMediaElementSource(audioElement);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = gain;
    const pannerOptions = {pan: 0};
    const stereoPanner = new StereoPannerNode(audioCtx, pannerOptions);
    track.connect(gainNode).connect(stereoPanner).connect(panner(pos)).connect(audioCtx.destination);
  }
}


// BOOMBOX FUNCTIONALITY HERE ~~~~~~~~~~~~~~~~~~~~~~~~~~~ 2
function playAudio(this_button, audioElement) {
  if(!audioCtx) {
    init(audioElements);
  }

  // check if context is in suspended state (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (this_button.dataset.playing === 'false') {
    // audioElement.play();
    // audioElement.addEventListener('ended', function() {
    //   // this_button.dataset.playing = 'false';
    //   // this_button.setAttribute( "aria-checked", "false" );
    //   // this_button.currentTime = 0;
    //   // this_button.play();
    // }, false);
    audioElement.play();
    this_button.dataset.playing = 'true';
    // if track is playing pause it
  } else if (this_button.dataset.playing === 'true') {
    audioElement.pause();
    this_button.dataset.playing = 'false';
  }

  let state = this_button.getAttribute('aria-checked') === "true";
  this_button.setAttribute( 'aria-checked', state ? "false" : "true" );

}

// const audioElement = document.querySelector('audio');
const getEl = (id) => document.getElementById(id);
const a1 = [getEl('a1'), [0,0,-5], 0.4]; // front
const a2 = [getEl('a2'), [5, 0, 0], 1]; // right
const a3 = [getEl('a3'), [-5, 0, 0], 0.5]; // left
const audioElements = [a1, a2, a3]
const playButton1 = getEl('b1');
playButton1.addEventListener('click', function () {playAudio(this, a1[0])}, false);

const playButton2 = getEl('b2');
playButton2.addEventListener('click', function () {playAudio(this, a2[0])}, false);

const playButton3 = getEl('b3');
playButton3.addEventListener('click', function () {playAudio(this, a3[0])}, false);

const playAll = getEl('all');
playAll.addEventListener('click', function () {
  playAudio(playButton1, a1[0]);
  playAudio(playButton2, a2[0]);
  playAudio(playButton3, a3[0]);
}, false)
