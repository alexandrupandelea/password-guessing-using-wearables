import { Accelerometer } from "accelerometer";
import { Gyroscope } from "gyroscope";
import document from "document";
import { display } from "display";
import { me } from "appbit";
import * as messaging from "messaging";
import * as util from "./util";

display.autoOff = false;

var useAccel = true;
var pointsNr = 20;
var xMin = 30;
var xMax = 318;
var yMin = 30;
var yMax = 220;

var rangeMin = -15;
var rangeMax = 15;

let accelData = document.getElementById("accel-data");
let hrmData = document.getElementById("hrm-data");
let axisHigh = document.getElementById("axisHigh");
let axisMiddle = document.getElementById("axisMiddle");
let axisLow = document.getElementById("axisLow");

axisLow.text = rangeMin;
axisHigh.text = rangeMax;

let gyro = new Gyroscope();
let accel = new Accelerometer();

let yPoints = [];
let xPoints = [];
let zPoints = [];

accel.start();
gyro.start();

me.addEventListener("unload", function(){
  accel.stop();
  gyro.stop();
});

function normaliseToAxis(y, limMin, limMax) {
  var range = rangeMax - rangeMin;
  var range2 = limMax - limMin;

  var normalisedY = (y - rangeMin) / range;
  normalisedY = normalisedY * range2 + limMin;

  return normalisedY;
}

function appendData(sensor) {
  if (yPoints.length < pointsNr) {
    yPoints.push(sensor.y);
    xPoints.push(sensor.x);
    zPoints.push(sensor.z);
  } else {
    for (var i = yPoints.length - 1; i > 0; i--) {
      yPoints[i] = yPoints[i - 1];
      xPoints[i] = xPoints[i - 1];
      zPoints[i] = zPoints[i - 1];
    }
    yPoints[0] = sensor.y;
    xPoints[0] = sensor.x;
    zPoints[0] = sensor.z;
  }
}

function updateLines() {
  let lineid = "";

  for (var i = 0; i < yPoints.length - 1; i++) {
    var lineidy = "liney" + i;
    var lineidx = "linex" + i;
    var lineidz = "linez" + i;

    let liney = document.getElementById(lineidy);
    let linex = document.getElementById(lineidx);
    let linez = document.getElementById(lineidz);

    liney.style.visibility = "visible";
    linex.style.visibility = "visible";
    linez.style.visibility = "visible";

    //y
    liney.x1 = xMin + xMax / pointsNr * i;
    liney.y1 = normaliseToAxis(yPoints[i], yMin, yMax);

    liney.x2 = xMin + xMax / pointsNr * (i + 1);
    liney.y2 = normaliseToAxis(yPoints[i + 1], yMin, yMax);

    //x
    linex.x1 = xMin + xMax / pointsNr * i;
    linex.y1 = normaliseToAxis(xPoints[i], yMin, yMax);

    linex.x2 = xMin + xMax / pointsNr * (i + 1);
    linex.y2 = normaliseToAxis(xPoints[i + 1], yMin, yMax);

    //z
    linez.x1 = xMin + xMax / pointsNr * i;
    linez.y1 = normaliseToAxis(zPoints[i], yMin, yMax);

    linez.x2 = xMin + xMax / pointsNr * (i + 1);
    linez.y2 = normaliseToAxis(zPoints[i + 1], yMin, yMax);
  }
}

function refreshData() {
  let data = {
    accel: {
      x: accel.x ? accel.x.toFixed(3) : 0,
      y: accel.y ? accel.y.toFixed(3) : 0,
      z: accel.z ? accel.z.toFixed(3) : 0
    },
    gyro: {
      x: gyro.x ? gyro.x.toFixed(3) : 0,
      y: gyro.y ? gyro.y.toFixed(3) : 0,
      z: gyro.z ? gyro.z.toFixed(3) : 0
    }
  };

  if (useAccel)
    appendData(data.accel);
  else
    appendData(data.gyro);

  updateLines();
}

messaging.peerSocket.onmessage = evt => {
  if (evt.data.key === "sensor" && evt.data.newValue) {
    let newSensor = util.stripQuotes(evt.data.newValue);

    let changed = false;
    let str = JSON.stringify(newSensor);
    if (str.indexOf("Gyroscope") !== -1) {
      rangeMin = -10;
      rangeMax = 10;
      axisLow.text = rangeMin;
      axisHigh.text = rangeMax;

      if (useAccel) {
        changed = true;
        useAccel = false;
      }
    } else {
      rangeMin = -15;
      rangeMax = 15;
      axisLow.text = rangeMin;
      axisHigh.text = rangeMax;

      if (!useAccel) {
        changed = true;
        useAccel = true;
      }
    }

    if (changed) {
      yPoints = [];
      xPoints = [];
      zPoints = [];

      for (var i = 0; i < pointsNr; i++) {
        var lineidy = "liney" + i;
        var lineidx = "linex" + i;
        var lineidz = "linez" + i;

        let liney = document.getElementById(lineidy);
        let linex = document.getElementById(lineidx);
        let linez = document.getElementById(lineidz);

        liney.style.visibility = "hidden";
        linex.style.visibility = "hidden";
        linez.style.visibility = "hidden";
      }
    }
  }
};

refreshData();
setInterval(refreshData, 30);
