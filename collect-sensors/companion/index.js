import { peerSocket, MessageSocket } from "messaging";
import * as messaging from "messaging";

console.log("Companion running");

var RETRY_SEND_MS = 20;
var SYNC_RETRY_SEND_MS = 200;

let ackHandle = -1;
var syncHandle = -1;
var retryHandle = -1
let arr = [];
var timedif = null;
var timeDict;

function sendAck(isDone) {
  if (peerSocket.readyState === peerSocket.OPEN) {
    peerSocket.send("ack");

    if (ackHandle != -1)
        clearInterval(ackHandle);
  } else {
    console.log("no connection to watch");
  }
}

function sendTime() {
  if (peerSocket.readyState === peerSocket.OPEN) {
    console.log("sending final dic");
    timeDict.phoneFinal = Date.now() + timedif;
    peerSocket.send(timeDict);

    /* reset timedif */
    timedif = null;

    clearInterval(syncHandle);
  }
}

function retryTime() {
  if (peerSocket.readyState === peerSocket.OPEN) {
    peerSocket.send("retryTime");

    clearInterval(retryHandle);
  }
}

messaging.peerSocket.onerror = (evt) => {
  console.log("phone error");
  console.log(evt.BUFFER_FULL);
  console.log(evt.code);
  console.log(evt.message);
}

messaging.peerSocket.onmessage = (evt) => {
  var crtTime = Date.now() + timedif;
  console.log("Comp recv " + evt.data.length);

  /* time sync with watch and server */
  if(evt.data.hasOwnProperty('watchInit')) {
    if (!timedif) {
      console.log("server time null");
      fetch_time();
      retryHandle = setInterval(retryTime, SYNC_RETRY_SEND_MS);

      return;
    }
    timeDict = evt.data;
    timeDict.phoneInit = crtTime;

    syncHandle = setInterval(sendTime, SYNC_RETRY_SEND_MS);

    return;
  }

  /* sensor data handling */
  if (evt.data === "done") {
    console.log("Comp: " + arr.length);
    send_data(arr);
    arr = []
  } else {
    arr = arr.concat(evt.data);
  }

  if (peerSocket.readyState === peerSocket.OPEN)
    sendAck();
  else
    ackHandle = setInterval(sendAck, RETRY_SEND_MS);
}

function send_data(arr) {
  fetch('https://fitbit-sensors.cf', {
    method: 'POST',
    headers : {
      'Content-Type': 'application/json;',
    },
    body : JSON.stringify({'sensors' : arr}),
  })
  .then(
    function(response) {
      if (response.status == 200) {
        console.log("sensors data sent!");
      } else {
        console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      }
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :', err);
  });
}

function fetch_time() {
  fetch("https://fitbit-sensors.cf/clientTime=" + Date.now())
    .then(
      function(response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
            response.status);
            return;
          }

          response.text().then(function(data) {
            var crtTime = Date.now();

            data = JSON.parse(data);

            var initTime = data.clientTime;
            var serverTime0 = data.serverTime0;
            var serverTime1 = data.serverTime1;

            var delta = (crtTime - initTime) - (serverTime0 - serverTime1);

            timedif = serverTime0 - initTime - delta / 2;
            console.log("timedif " + timedif);
          });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :', err);
    });
}
