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
var range = rangeMax - rangeMin;

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

let linesArrX = [];
let linesArrY = [];
let linesArrZ = [];

accel.start();
gyro.start();

me.addEventListener("unload", function(){
  accel.stop();
  gyro.stop();
});

function buildLinesDictionary() {
  for (var i = 0; i < pointsNr; i++) {
       var lineidy = "liney" + i;
       var lineidx = "linex" + i;
       var lineidz = "linez" + i;

      linesArrX[i] = document.getElementById(lineidy);
      linesArrY[i] = document.getElementById(lineidx);
      linesArrZ[i] = document.getElementById(lineidz);
  }
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
  for (var i = 0; i < yPoints.length - 1; i++) {
    let liney = linesArrY[i];
    let linex = linesArrX[i];
    let linez = linesArrZ[i];

    if (i == yPoints.length - 2) {
      liney.style.visibility = "visible";
      linex.style.visibility = "visible";
      linez.style.visibility = "visible";
    }

    //y line with y coordinate normalised to be between [yMin, YMax]
    //(same logic applies for all other lines)
    liney.x1 = xMin + xMax / pointsNr * i;
    liney.y1 = (yPoints[i] - rangeMin) / range * (yMax - yMin) + yMin;

    liney.x2 = xMin + xMax / pointsNr * (i + 1);
    liney.y2 = (yPoints[i + 1] - rangeMin) / range * (yMax - yMin) + yMin;

    //x
    linex.x1 = xMin + xMax / pointsNr * i;
    linex.y1 = (xPoints[i] - rangeMin) / range * (yMax - yMin) + yMin;

    linex.x2 = xMin + xMax / pointsNr * (i + 1);
    linex.y2 = (xPoints[i + 1] - rangeMin) / range * (yMax - yMin) + yMin;

    //z
    linez.x1 = xMin + xMax / pointsNr * i;
    linez.y1 = (zPoints[i] - rangeMin) / range * (yMax - yMin) + yMin;

    linez.x2 = xMin + xMax / pointsNr * (i + 1);
    linez.y2 = (zPoints[i + 1] - rangeMin) / range * (yMax - yMin) + yMin;
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
        let liney = linesArrY[i];
        let linex = linesArrX[i];
        let linez = linesArrZ[i];

        liney.style.visibility = "hidden";
        linex.style.visibility = "hidden";
        linez.style.visibility = "hidden";
      }
    }
  }
};

buildLinesDictionary();
refreshData();
setInterval(refreshData, 5);
