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
  ios_access.innerHTML += 'For <b>iOS</b> user, please grant access first:</p>' +
    '<button id="accelPermsButton">Allow access to gyroscope</button></p>' +
    '<div>Please use <b>Chrome/Firefox</b> in <b>iOS</b> devices, becasue <b>Safari</b> is not fully supported.</div>' +
    '</p></p>';
  var accessGrant = document.getElementById("accelPermsButton");
  accessGrant.addEventListener ("click", getAccel, false);
}
