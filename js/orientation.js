const indicator = document.querySelector('.indicator');
const garden = document.querySelector('.garden');
const output = document.querySelector('.output');
const info = document.querySelector('.info');
const arrow = document.querySelector('.arrow');
const doeSupported = document.getElementById("doeSupported");

const maxX = garden.clientWidth - indicator.clientWidth;
const maxY = garden.clientHeight - indicator.clientHeight;
const arrow_width = arrow.clientWidth;
console.log("arrow"+arrow_width);
function handleOrientation(event) {
  let x = -event.beta;  // In degree in the range [-180,180)
  let y = -event.gamma; // In degree in the range [-90,90)
  const z = event.alpha;

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
  window.addEventListener('deviceorientation', handleOrientation, true);
} else {
  doeSupported.innerText = "❌ Browser Not Supported!\nPlease try Firefox Browser in Android phone.";
}


