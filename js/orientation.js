var indicator = document.querySelector('.indicator');
var garden = document.querySelector('.garden');
var output = document.querySelector('.output');
var info = document.querySelector('.info');
var doeSupported = document.getElementById("doeSupported");

var maxX = garden.clientWidth  - indicator.clientWidth;
var maxY = garden.clientHeight - indicator.clientHeight;

function handleOrientation(event) {
  var x = -event.beta;  // In degree in the range [-180,180)
  var y = -event.gamma; // In degree in the range [-90,90)
  var z = event.alpha;

  output.textContent  = `alpha: ${z}\n`;
  output.textContent += `beta : ${x}\n`;
  output.textContent += `gamma: ${y}\n`;

  // Because we don't want to have the device upside down
  // We constrain the x value to the range [-90,90]
  if (x >  90) { x =  90}
  if (x < -90) { x = -90}

  // To make computation easier we shift the range of
  // x and y to [0,180]
  x += 90;
  y += 90;

  // 10 is half the size of the ball
  // It center the positioning point to the center of the ball
  indicator.style.left  = (maxY*y/180 - 10) + "px";
  indicator.style.top = (maxX*x/180 - 10) + "px";
  indicator.style.transform = "rotate("+z+"deg)";
}



if (window.DeviceOrientationEvent) {
  doeSupported.innerText = "✅ Browser is supported!";
} else {
  doeSupported.innerText = "❌ Browser Not Supported!\nPlease try Firefox Browser in Android phone.";
}

window.addEventListener('deviceorientation', handleOrientation, true);
//
// const sensor = new AbsoluteOrientationSensor();
// Promise.all([navigator.permissions.query({ name: "accelerometer" }),
//   navigator.permissions.query({ name: "magnetometer" }),
//   navigator.permissions.query({ name: "gyroscope" })])
//   .then(results => {
//     if (results.every(result => result.state === "granted")) {
//       info.textContent = "Has permissions";
//       sensor.start();
//     } else {
//       console.log("No permissions to use AbsoluteOrientationSensor.");
//       info.textContent = "No permissions";
//     }
//   });
//
