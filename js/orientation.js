const indicator = document.querySelector('.indicator');
const garden = document.querySelector('.garden');
const output = document.querySelector('.output');
const info = document.querySelector('.info');
const arrow = document.querySelector('.arrow');
const doeSupported = document.getElementById("doeSupported");

const maxX = garden.clientWidth - indicator.clientWidth;
const maxY = garden.clientHeight - indicator.clientHeight;
const arrow_width = arrow.clientWidth;
// console.log("arrow"+arrow_width);
let z_flag = 3;
let z_prev = 0;
function handleOrientation(event) {
  let x = -event.beta;  // In degree in the range [-180,180)
  let y = -event.gamma; // In degree in the range [-90,90)
  let z = event.alpha;

  output.textContent  = `alpha: ${Number(z).toFixed(2)}\n`;
  output.textContent += `beta : ${Number(x).toFixed(2)}\n`;
  output.textContent += `gamma: ${Number(y).toFixed(2)}\n`;

  // Because we don't want to have the device upside down
  // We constrain the x value to the range [-90,90]
  if (x >  90) { x =  90}
  if (x < -90) { x = -90}

  // To make computation easier we shift the range of
  // x and y to [0,180]
  if (z_flag > 0) {
    z_flag --;
    z_prev = z;
  } else {
    z = z - z_prev;
  }
  x += 90;
  y += 90;

  // 10 is half the size of the ball
  // It center the positioning point to the center of the ball
  indicator.style.left  = (maxY*y/180 - 10) + "px";
  indicator.style.top = (maxX*x/180 - 10) + "px";
  indicator.style.transform = "rotate("+z+"deg)";
}

if (window.DeviceOrientationEvent) {
  doeSupported.innerText = "✅ gyroscopes is supported!";
  window.addEventListener('deviceorientation', handleOrientation, true);
} else {
  doeSupported.innerText = "❌ Browser Not Supported!\nPlease try Firefox Browser in Android phone.";
}


