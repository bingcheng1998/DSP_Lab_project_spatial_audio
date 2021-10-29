function iOS() {
  return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function getAccel() {
  DeviceMotionEvent.requestPermission()
    .then(response => {
        if (response == 'granted') {
          window.addEventListener('deviceorientation', (event) => {
              // Expose each orientation angle in a more readable way
              rotation_degrees = event.alpha;
              frontToBack_degrees = event.beta;
              leftToRight_degrees = event.gamma;
            }
          )
        }
      }
    )
}

if (iOS()) {
  var ios_access = document.querySelector('.ios_access');
  ios_access.innerHTML += '<button id="accelPermsButton">Click here to grant ios access</button>';
  var accessGrant = document.getElementById("accelPermsButton");
  accessGrant.addEventListener ("click", getAccel, false);
}
