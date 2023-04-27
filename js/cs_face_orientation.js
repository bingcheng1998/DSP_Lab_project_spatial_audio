/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
// import "babel-polyfill";
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs-core';
// import Stats from 'stats.js';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import {TRIANGULATION} from '/js/triangulation';

const NUM_KEYPOINTS = 468;
const NUM_IRIS_KEYPOINTS = 5;
const GREEN = '#32EEDB';
const RED = '#FF2C35';
const BLUE = '#157AB3';
let stopRendering = false;

function isMobile() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function drawPath(ctx, points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  // ctx.stroke(region);
}

let model, ctx, videoWidth, videoHeight, video, canvas,
  scatterGLHasInitialized = false, scatterGL, rafID;

const VIDEO_SIZE = 500;
const mobile = isMobile();
const renderPointcloud = false;
// const stats = new Stats();
const state = {
  backend: 'webgl',
  maxFaces: 1,
  triangulateMesh: true,
  predictIrises: false
};

if (renderPointcloud) {
  state.renderPointcloud = true;
}

async function setupCamera() {
  video = document.getElementById('video');

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      // Only setting the video to a specified size in order to accommodate a
      // point cloud, so on mobile devices accept the default size.
      width: mobile ? undefined : VIDEO_SIZE,
      height: mobile ? undefined : VIDEO_SIZE
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

var my_own_event = new CustomEvent('build', { 'detail': '' });

async function renderPrediction() {
  if (stopRendering) {
    return;
  }

  // stats.begin();

  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: state.predictIrises
  });
  if (predictions.length > 0) {
    predictions.forEach(prediction => {
      const scaledMesh = prediction.scaledMesh;
      const up = scaledMesh[10],
        down = scaledMesh[152],
        left = scaledMesh[234],
        right = scaledMesh[454],
        front = scaledMesh[4];

      const run = (x, y, fun) => {
        return [fun(x[0], y[0]), fun(x[1], y[1]), fun(x[2], y[2])]
      }
      const norm = (x) => {
        const len = Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);
        return [x[0]/len, x[1]/len, x[2]/len];
      }
      const point_up = norm(run(up, down, (x, y)=>{return x - y}));
      const center = run(left, right, (x,y)=>{return (x+y)/2});
      const point_forward = norm(run(front, center, (x,y)=> {return x-y}));
      // console.log(up);
      my_own_event.point_up = [-point_up[0], -point_up[1], point_up[2]];
      my_own_event.point_forward = [-point_forward[0], -point_forward[1], point_forward[2]];
      // add a event for cs.js to listen on
      window.dispatchEvent(my_own_event);
    });
  }

  // stats.end();
  requestAnimationFrame(renderPrediction);
}

async function main() {
  await tf.setBackend(state.backend);
  // stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
  // document.getElementById('stats').appendChild(stats.dom);
  // stats.domElement.style.position = 'relative';

  await setupCamera();
  video.play();
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  // model = await faceLandmarksDetection.load(
  //   faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
  //   {maxFaces: state.maxFaces});

  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      {
        maxFaces: state.maxFaces,
        modelUrl: './facemesh_model.json',
        detectorModelUrl: './blazeface_model.json',
        irisModelUrl: './iris_model.json'
      }
    );

  renderPrediction();
}

main();
