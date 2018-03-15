import { Accelerometer } from "accelerometer";
import { Gyroscope } from "gyroscope";
import document from "document";
import { me } from "appbit";
import { peerSocket, MessageSocket } from "messaging";
import * as messaging from "messaging";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { display } from "display";

import { memory } from "system";
console.log("JS memory: " + memory.js.used + "/" + memory.js.total);

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9 ,10];

/* max nr of elements in array to be sent in a message */
var MAX_ARRAY_ELEMS = 60;
/* 3 numbers for acc, 3 numbers for gyro and timestamp. 8 is sizeof(number)
 * plus another 8 for array overhead
 */
var ELEM_SIZE = 7 * 8 * 2;

// display always on
display.autoOff = false;

let accelData = document.getElementById("accel-data");
let gyroData = document.getElementById("gyro-data");

let gyro = new Gyroscope();
let accel = new Accelerometer();

let data = [];

let msgsNr = 0;
let crtMsg = 0;
let doneHandle = -1;
let helloHandle = -1

var accx = 0;
var accy = 0;
var accz = 0;
var gyrox = 0;
var gyroy = 0;
var gyroz = 0;

accel.start();
gyro.start();

me.addEventListener("unload", function() {
  accel.stop();
  gyro.stop();

  unlinkSync("demofile");
});

let sendButton = document.getElementById("send-button");
sendButton.onactivate = function(evt) {
  //console.log("CLICKED! " + " collected " + data.length + "JS memory: " + memory.js.used + "/" + memory.js.total);
  sendButton.style.visibility = "hidden";

  clearInterval(refreshHandle);

  crtMsg = 0;
  msgsNr = parseInt(data.length / MAX_ARRAY_ELEMS) +
           (data.length % MAX_ARRAY_ELEMS  == 0 ? 0 : 1);

  console.log(data.length + " " + msgsNr);

  helloHandle = setInterval(sendHello, 1000);
}

function sendHello() {
  if (peerSocket.readyState === peerSocket.OPEN) {
    console.log("sent msg");

    /* send a number of MAX_ARRAY_ELEMS items in the array */
    if (crtMsg * MAX_ARRAY_ELEMS + MAX_ARRAY_ELEMS >= data.length)
      peerSocket.send(data.slice(crtMsg * MAX_ARRAY_ELEMS, data.length));
    else
      peerSocket.send(data.slice(crtMsg * MAX_ARRAY_ELEMS,
                      crtMsg * MAX_ARRAY_ELEMS + MAX_ARRAY_ELEMS));

    clearInterval(helloHandle);
  }
}

function sendDone() {
  if (peerSocket.readyState === peerSocket.OPEN) {
    console.log("sent msg");

    /* let companion know that the array has
     * been sent entirely
     */
    peerSocket.send("done");
    clearInterval(doneHandle);
  }
}


messaging.peerSocket.onmessage = (evt) => {
  console.log(evt.data);

  crtMsg += 1;
  if (crtMsg < msgsNr) {
    helloHandle = setInterval(sendHello, 200);
  } else if (crtMsg == msgsNr) {
    doneHandle = setInterval(sendDone, 200);

    // TODO: this should be called when the server received the data
    data = [];
    refreshHandle = setInterval(refreshData, 50);
  } else if (crtMsg == msgsNr + 1) {
    sendButton.style.visibility = "visible";
  }
}

function writeSimpleFile() {
  writeFileSync("demofile", "test text!!!", "ascii");

  let text = readFileSync("demofile", "ascii");

  console.log(text);
}

function refreshData() {
  // let elem = {
  //   accel: {
  //     x: accel.x ? accel.x.toFixed(1) : 0,
  //     y: accel.y ? accel.y.toFixed(1) : 0,
  //     z: accel.z ? accel.z.toFixed(1) : 0
  //   },
  //   gyro: {
  //     x: gyro.x ? gyro.x.toFixed(1) : 0,
  //     y: gyro.y ? gyro.y.toFixed(1) : 0,
  //     z: gyro.z ? gyro.z.toFixed(1) : 0
  //   }
  // };

  accx = accel.x ? accel.x : 0;
  accy = accel.y ? accel.y : 0;
  accz = accel.z ? accel.z : 0;
  gyrox = gyro.x ? gyro.x : 0;
  gyroy = gyro.y ? gyro.y : 0;
  gyroz = gyro.z ? gyro.z : 0;

  if (data.length == 0)
    console.log("start");

  data.push(Date.now());
  data.push(accx);
  data.push(accy);
  data.push(accz);
  data.push(gyrox);
  data.push(gyroy);
  data.push(gyroz);
  //console.log(typeof Date.now() + " " + typeof accx + " " + typeof gyrox);
  if (parseInt(data.length / 7) % 50 == 0)
    console.log("Arr size " + (data.length/7) + " JS memory: " + memory.js.used);
}

writeSimpleFile();
var refreshHandle = setInterval(refreshData, 50);