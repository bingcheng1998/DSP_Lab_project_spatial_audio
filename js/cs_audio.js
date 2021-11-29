import {print} from './helper.js'

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let listener;
let n1, n2, n3, n4, n5, n6, n7, n8;
let analysers = [n1, n2, n3, n4, n5, n6, n7, n8];

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

  const rollOff = 0.9;

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

  // listen on the face angle change from cs_face_orientation.js
  window.addEventListener('build', function (event) {
    const info = document.querySelector('.info');

    let global_up = event.point_up;
    let global_forward = event.point_forward;

    // info.textContent = print(['u: x','y','z'],global_up);
    // info.textContent += print(['f: x','y','z'],global_forward);
    // Change the position of head and recalculate the volume on each ear

    listener.forwardX.value = global_forward[0];
    listener.forwardY.value = global_forward[1];
    listener.forwardZ.value = global_forward[2];
    listener.upX.value = global_up[0];
    listener.upY.value = global_up[1];
    listener.upZ.value = global_up[2];
    // console.log('up',global_up);
    // console.log('forward',global_forward);
    // indicator.style.left  = (-maxY*(y-90)/180 - 10) + "px";
    // indicator.style.top = (-maxX*(x-90)/180 - 10) + "px";
    // indicator.style.transform = "rotate("+z+"deg)";
  });

  const track = audioCtx.createMediaElementSource(channels7);
  const channelsCount = 8;
  const splitterNode = new ChannelSplitterNode(audioCtx, { numberOfOutputs: channelsCount });
  track.connect(splitterNode);

  // const mergerNode = new ChannelMergerNode(audioCtx, { numberOfInputs: channelsCount });

  for (let audioPack of audioElements) {
    // add each track to the IMU control
    let playElement = audioPack[0];
    let pos = audioPack[1];
    let gain = audioPack[2];
    let order = audioPack[3];
    analysers[order] = audioCtx.createAnalyser();
    // let analyser = analysers[order];
    console.log(pos);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = gain;
    playElement.addEventListener('click', function() {
      if (gainNode.gain.value === 0) {
        playElement.children[0].classList.remove("slash");
        gainNode.gain.value = gain;
      } else {
        playElement.children[0].classList.add("slash");
        gainNode.gain.value = 0;
      }
    }, false);
    // const pannerOptions = {pan: 0};
    // const stereoPanner = new StereoPannerNode(audioCtx, pannerOptions);
    splitterNode.connect(gainNode, order).connect(analysers[order]).connect(panner(pos)).connect(audioCtx.destination);
    }

  function updateWave() {
    let dataArray = new Uint8Array(analysers[0].frequencyBinCount);
    let maxValues = [null, null, null, null, null, null, null, null];
    for (let i = 0; i < analysers.length; i ++) {
      analysers[i].getByteTimeDomainData(dataArray);
      let maxValue = 128;
      for (let num of dataArray) {
        if (num > maxValue) {
          maxValue = num;
        }
      }
      maxValue = Math.max(0, maxValue - 128);
      maxValues[i] = maxValue;
      audioElements[i][0].style.backgroundColor = "rgb("+Math.min(255, -maxValue * 20+224)+", 225, "+
        Math.min(255, maxValue * 10+226)+")";
    }
    // console.log(maxValues);
  }
  setInterval(updateWave, 50);

}


function playAudio(thisButton, audioElement) {
  if(!audioCtx) {
    init(audioElements);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (thisButton.dataset.playing === 'false') {
    audioElement.play();
    thisButton.dataset.playing = 'true';
    // if track is playing pause it
  } else if (thisButton.dataset.playing === 'true') {
    audioElement.pause();
    thisButton.dataset.playing = 'false';
  }

  let state = thisButton.getAttribute('aria-checked') === "true";
  thisButton.setAttribute( 'aria-checked', state ? "false" : "true" );
}

const getEl = (id) => document.getElementById(id);
const a1 = [getEl('b1'), [-5, 0,-5], 1, 0]; // FL
const a2 = [getEl('b2'), [5, 0, -5], 1, 1]; // FR
const a3 = [getEl('b3'), [0, 0, -5], 1, 2]; // C
const a4 = [getEl('b4'), [0, 0,  0], 0, 3]; // LFE (mute by default)
const a5 = [getEl('b5'), [-5, 0, 5], 1, 4]; // BL
const a6 = [getEl('b6'), [5, 0,  5], 1, 5]; // BR
const a7 = [getEl('b7'), [-5, 0, 0], 1, 6]; // SL
const a8 = [getEl('b8'), [ 5, 0, 0], 1, 7]; // SR
const audioElements = [a1, a2, a3, a4, a5, a6, a7, a8];

const channels7 = getEl('channels7');

const playAll = getEl('all');
playAll.addEventListener('click', function () {
  playAudio(this, channels7);
}, false)

