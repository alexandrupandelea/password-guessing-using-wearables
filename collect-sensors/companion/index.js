import { peerSocket, MessageSocket } from "messaging";
import * as messaging from "messaging";
import { outbox } from "file-transfer";

console.log("Companion running");

var RETRY_SEND_MS = 20;

let ackHandle = -1;
let arr = [];

function sendAck(isDone) {
  if (peerSocket.readyState === peerSocket.OPEN) {
      peerSocket.send("ack");

    if (ackHandle != -1)
      clearInterval(ackHandle);
  }
}

messaging.peerSocket.onmessage = (evt) => {
  console.log("Comp recv " + evt.data.length);

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
