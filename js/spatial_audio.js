// for cross browser way
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let listener;

function init() {

  audioCtx = new AudioContext();
  listener = audioCtx.listener;

  // Let's set the position of our listener based on where our boombox is.
  const posX = window.innerWidth/2;
  const posY = window.innerHeight/2;
  const posZ = 300;

  // set position of the listener
  if(listener.positionX) {
    listener.positionX.value = posX;
    listener.positionY.value = posY;
    listener.positionZ.value = posZ-5;
  } else {
    listener.setPosition(posX, posY, posZ-5);
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

  const rollOff = 0.5;

  const positionX = posX;
  const positionY = posY;
  const positionZ = posZ;

  const orientationX = 0.0;
  const orientationY = 0.0;
  const orientationZ = -1.0;

  // let's use the class method for creating our panner node and pass in all those parameters we've set.

  const panner = new PannerNode(audioCtx, {
    panningModel: pannerModel,
    distanceModel: distanceModel,
    positionX: positionX,
    positionY: positionY,
    positionZ: positionZ,
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

  const moveControls = document.querySelector('#move-controls').querySelectorAll('button');
  const boombox = document.querySelector('.boombox-body');

  // the transforms we can set
  let transform = {
    xAxis: 0,
    yAxis: 0,
    zAxis: 0.8,
    rotateX: 0,
    rotateY: 0
  }


  // set up our bounds
  const topBound = -posY;
  const bottomBound = posY;
  const rightBound = posX;
  const leftBound = -posX;
  const innerBound = 0.1;
  const outerBound = 1.5;

  // set up rotation constants
  const rotationRate = 60; // bigger number slower sound rotation

  const q = Math.PI/rotationRate; //rotation increment in radians

  // get degrees for css
  const degreesX = (q * 180)/Math.PI;
  const degreesY = (q * 180)/Math.PI;

  // function for setting the panner values and changing the styling
  function moveBoombox(direction, prevMove) {
    switch (direction) {
      case 'left':
        if (transform.xAxis > leftBound) {
          transform.xAxis -= 5; // change the css image position
          panner.positionX.value -= 0.1; // change the actual audio
        }
        break;
      case 'up':
        if (transform.yAxis > topBound) {
          transform.yAxis -= 5;
          panner.positionY.value -= 0.3;
        }
        break;
      case 'right':
        if (transform.xAxis < rightBound) {
          transform.xAxis += 5;
          panner.positionX.value += 0.1;
        }
        break;
      case 'down':
        if (transform.yAxis < bottomBound) {
          transform.yAxis += 5;
          panner.positionY.value += 0.3;
        }
        break;
      case 'back':
        if (transform.zAxis > innerBound) {
          transform.zAxis -= 0.01;
          panner.positionZ.value -= 20;
        }
        break;
      case 'forward':
        if (transform.zAxis < outerBound) {
          transform.zAxis += 0.01;
          panner.positionZ.value += 20;
        }
        break;
      case 'rotate-right':
        transform.rotateY += degreesY;
        console.log(transform.rotateY);
        // 'left' is rotation about y-axis with negative angle increment
        z = panner.orientationZ.value*Math.cos(-q) - panner.orientationX.value*Math.sin(-q);
        x = panner.orientationZ.value*Math.sin(-q) + panner.orientationX.value*Math.cos(-q);
        y = panner.orientationY.value;

        panner.orientationX.value = x;
        panner.orientationY.value = y;
        panner.orientationZ.value = z;
        break;
      case 'rotate-left':
        transform.rotateY -= degreesY;
        // 'right' is rotation about y-axis with positive angle increment
        z = panner.orientationZ.value*Math.cos(q) - panner.orientationX.value*Math.sin(q);
        x = panner.orientationZ.value*Math.sin(q) + panner.orientationX.value*Math.cos(q);
        y = panner.orientationY.value;
        panner.orientationX.value = x;
        panner.orientationY.value = y;
        panner.orientationZ.value = z;
        break;
      case 'rotate-up':
        transform.rotateX += degreesX;
        // 'up' is rotation about x-axis with negative angle increment
        z = panner.orientationZ.value*Math.cos(-q) - panner.orientationY.value*Math.sin(-q);
        y = panner.orientationZ.value*Math.sin(-q) + panner.orientationY.value*Math.cos(-q);
        x = panner.orientationX.value;
        panner.orientationX.value = x;
        panner.orientationY.value = y;
        panner.orientationZ.value = z;
        break;
      case 'rotate-down':
        transform.rotateX -= degreesX;
        // 'down' is rotation about x-axis with positive angle increment
        z = panner.orientationZ.value*Math.cos(q) - panner.orientationY.value*Math.sin(q);
        y = panner.orientationZ.value*Math.sin(q) + panner.orientationY.value*Math.cos(q);
        x = panner.orientationX.value;
        panner.orientationX.value = x;
        panner.orientationY.value = y;
        panner.orientationZ.value = z;
        break;
    }

    boombox.style.transform = 'translateX('+transform.xAxis+'px) translateY('+transform.yAxis+'px) scale('+transform.zAxis+') rotateY('+transform.rotateY+'deg) rotateX('+transform.rotateX+'deg)';

    const move = prevMove || {};
    move.frameId = requestAnimationFrame(() => moveBoombox(direction, move));
    return move;
  }


  moveControls.forEach(function(el) {

    let moving;
    el.addEventListener('mousedown', function() {

      let direction = this.dataset.control;
      if (moving && moving.frameId) {
        window.cancelAnimationFrame(moving.frameId);
      }
      moving = moveBoombox(direction);

    }, false);

    window.addEventListener('mouseup', function() {
      if (moving && moving.frameId) {
        window.cancelAnimationFrame(moving.frameId);
      }
    }, false)

  })
  let init_z_flag = 0;
  let init_z;
  let prev_z = 0;
  if (window.DeviceOrientationEvent) {
    console.log("success: DeviceOrientationEvent")
    window.addEventListener('deviceorientation', function (event) {
      const info = document.querySelector('.info');
      let x = -event.beta;  // In degree in the range [-180,180)
      let y = -event.gamma; // In degree in the range [-90,90)
      const z = event.alpha;

      if (init_z_flag === 0) {
        init_z_flag = 1;
        init_z = z;
      }
      let diff_z = z - init_z;
      if (diff_z > 360) {
        diff_z -= 360;
      } else if (diff_z<0) {
        diff_z += 360;
      }
      if (Math.abs(prev_z - diff_z) < 1){
        return;
      }
      prev_z = diff_z;

      zz = -Math.cos(diff_z/180 * Math.PI);
      xx = Math.sin(diff_z/180 * Math.PI);

      info.textContent = `alpha: ${z}\n`;
      info.textContent += `beta : ${x}\n`;
      info.textContent += `gamma: ${y}\n`;
      info.textContent += `diff z is ${diff_z}\n`;
      info.textContent += `x = ${xx}\n`;
      info.textContent += `z = ${zz}\n`;

      listener.forwardX.value = xx;
      listener.forwardZ.value = zz;
    });
  } else {
    console.log("error: DeviceOrientationEvent")
  }

  const track = audioCtx.createMediaElementSource(audioElement);

  // if track ends - an event is fired once the track ends via the audio api. We can listen for this and set the correct params on the html element
  audioElement.addEventListener('ended', () => {
    playButton.dataset.playing = 'false';
    playButton.setAttribute( "aria-checked", "false" );
  }, false);

  // volume ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 4
  const gainNode = audioCtx.createGain();

  const volumeControl = document.querySelector('[data-action="volume"]');
  volumeControl.addEventListener('input', function() {
    gainNode.gain.value = this.value;
  }, false);

  const pannerOptions = {pan: 0};
  const stereoPanner = new StereoPannerNode(audioCtx, pannerOptions);
  const pannerControl = document.querySelector('[data-action="panner"]');
  pannerControl.addEventListener('input', function() {
    stereoPanner.pan.value = this.value;
  }, false);

  track.connect(gainNode).connect(stereoPanner).connect(panner).connect(audioCtx.destination);

  const powerButton = document.querySelector('.control-power');

  powerButton.addEventListener('click', function() {
    if (this.dataset.power === 'on') {
      audioCtx.suspend();
      this.dataset.power = 'off';
    } else if (this.dataset.power === 'off') {
      audioCtx.resume();
      this.dataset.power = 'on';
    }
    this.setAttribute( "aria-checked", audioCtx.state ? "false" : "true" );
    console.log(audioCtx.state);
  }, false);

}


// BOOMBOX FUNCTIONALITY HERE ~~~~~~~~~~~~~~~~~~~~~~~~~~~ 2
const audioElement = document.querySelector('audio');

const playButton = document.querySelector('.controls-play');

// play pause audio
playButton.addEventListener('click', function() {
  if(!audioCtx) {
    init();
  }

  // check if context is in suspended state (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (this.dataset.playing === 'false') {
    // audioElement.play();
    audioElement.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    audioElement.play();
    this.dataset.playing = 'true';
    // if track is playing pause it
  } else if (this.dataset.playing === 'true') {
    audioElement.pause();
    this.dataset.playing = 'false';
  }

  let state = this.getAttribute('aria-checked') === "true";
  this.setAttribute( 'aria-checked', state ? "false" : "true" );

}, false);
