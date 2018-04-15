import { Accelerometer } from "accelerometer";
import { Gyroscope } from "gyroscope";
import document from "document";
import { me } from "appbit";
import { peerSocket, MessageSocket } from "messaging";
import * as messaging from "messaging";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { display } from "display";

import * as id from "./id";

import { memory } from "system";
console.log("JS memory: " + memory.js.used + "/" + memory.js.total);

/* max nr of elements in array to be sent in a message */
var MAX_ARRAY_ELEMS = 60;
/* 3 numbers for acc, 3 numbers for gyro and timestamp. 8 is sizeof(number)
 * plus another 8 for array overhead
 */
var ELEM_SIZE = 7 * 8 * 2;
var RETRY_SEND_MS = 20;
var SYNC_RETRY_SEND_MS = 200;
var COLLECT_DATA_MS = 50;

// display always on
display.autoOff = false;

let accelData = document.getElementById("accel-data");
let gyroData = document.getElementById("gyro-data");

let gyro = new Gyroscope();
let accel = new Accelerometer();

let data = [];

let msgsNr = 0;
let crtMsg = 0;
var timedif = 0;
let doneHandle = -1;
let sendDataHandle = -1
var syncHandle = -1;

var accx = 0;
var accy = 0;
var accz = 0;
var gyrox = 0;
var gyroy = 0;
var gyroz = 0;

accel.start();
gyro.start();

id.hideUI();

function hideMainUI() {
  document.getElementById("send-button").style.visibility = "hidden";
}

function showMainUI() {
  document.getElementById("send-button").style.visibility = "visible";
}

let button = document.getElementById("done-button");
button.onclick = function(evt) {
  //console.log("CLICKED! " + " collected " + data.length + "JS memory: " + memory.js.used + "/" + memory.js.total);
  crtMsg = 0;

  data.push(id.value);

  msgsNr = parseInt(data.length / MAX_ARRAY_ELEMS) +
           (data.length % MAX_ARRAY_ELEMS  == 0 ? 0 : 1);

  id.hideUI();
  var sentMessages = document.getElementById("sent-messages");
  sentMessages.textContent = parseInt(crtMsg / (msgsNr + 1) * 100) + "%";
  sentMessages.style.visibility = "visible";
  console.log(crtMsg + " / " + msgsNr);


  console.log(data.length + " " + msgsNr);

  sendDataHandle = setInterval(sendDataSlice, RETRY_SEND_MS);
}

let sendButton = document.getElementById("send-button");
sendButton.onclick = function(evt) {
  hideMainUI();
  id.showUI();

  /* update timestamps with the difference between the
   * watch and the server
   */
  for (var i = 0; i < data.length; i += 7) {
    data[i] += timedif;
  }

  clearInterval(refreshHandle);
}

function sendDataSlice() {
  if (peerSocket.readyState === peerSocket.OPEN) {
    console.log("sent msg");

    /* send a number of MAX_ARRAY_ELEMS items in the array */
    if (crtMsg * MAX_ARRAY_ELEMS + MAX_ARRAY_ELEMS >= data.length)
      peerSocket.send(data.slice(crtMsg * MAX_ARRAY_ELEMS, data.length));
    else
      peerSocket.send(data.slice(crtMsg * MAX_ARRAY_ELEMS,
                      crtMsg * MAX_ARRAY_ELEMS + MAX_ARRAY_ELEMS));

    clearInterval(sendDataHandle);
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

function syncTime() {
  if (peerSocket.readyState === peerSocket.OPEN) {
    console.log("watch sent init time")
    peerSocket.send({ watchInit : Date.now()});

    clearInterval(syncHandle);
  }
}

messaging.peerSocket.onerror = (evt) => {
  console.log("watch error");
  console.log(evt.BUFFER_FULL);
  console.log(evt.code);
  console.log(evt.message);
}

messaging.peerSocket.onmessage = (evt) => {
  var crtTime = Date.now();
  console.log(evt.data);

  /* time sync with the phone and the server */
  console.log("watch received" + evt.data);

  if (evt.data.hasOwnProperty('watchInit')) {
    var delta = (crtTime - evt.data.watchInit) -
        (evt.data.phoneFinal - evt.data.phoneInit);

    timedif = (evt.data.phoneInit - evt.data.watchInit) - delta / 2;

    console.log("WATCH timedif is " + timedif);

    return;
  } else if (evt.data.localeCompare("retryTime") == 0) {
    syncHandle = setInterval(syncTime, SYNC_RETRY_SEND_MS);

    return;
  }

  /* sensor data handling */
  crtMsg += 1;
  var sentMessages = document.getElementById("sent-messages");
  sentMessages.textContent = parseInt(crtMsg / (msgsNr + 1) * 100) + "%";
  console.log(parseInt(crtMsg / (msgsNr + 1) * 100) + "%")

  if (crtMsg < msgsNr) {
    sendDataHandle = setInterval(sendDataSlice, RETRY_SEND_MS);
  } else if (crtMsg == msgsNr) {
    doneHandle = setInterval(sendDone, RETRY_SEND_MS);

    /* Start a new session of collecting data */
    data = [];
    refreshHandle = setInterval(refreshData, COLLECT_DATA_MS);
    syncHandle = setInterval(syncTime, SYNC_RETRY_SEND_MS);
  } else if (crtMsg == msgsNr + 1) {
    showMainUI();
    sentMessages.style.visibility = "hidden";
  }
}

function refreshData() {
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

  if (parseInt(data.length / 7) % 50 == 0)
    console.log("Arr size " + (data.length/7) + " JS memory: " + memory.js.used);
}

var refreshHandle = setInterval(refreshData, COLLECT_DATA_MS);
syncHandle = setInterval(syncTime, SYNC_RETRY_SEND_MS);
