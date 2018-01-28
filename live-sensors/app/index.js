import { Accelerometer } from "accelerometer";
import document from "document";
import { display } from "display";
import { me } from "appbit";

display.autoOff = false;

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

let accel = new Accelerometer();

let yPoints = [];
let xPoints = [];
let zPoints = [];

accel.start();

me.addEventListener("unload", function(){
  accel.stop();
});

function normaliseToAxis(y, limMin, limMax) {
  var range = rangeMax - rangeMin;
  var range2 = limMax - limMin;

  var normalisedY = (y - rangeMin) / range;
  normalisedY = normalisedY * range2 + limMin;

  return normalisedY;
}

function appendData(accel) {
  if (yPoints.length < pointsNr) {
    yPoints.push(accel.y);
    xPoints.push(accel.x);
    zPoints.push(accel.z);
  } else {
    for (var i = yPoints.length - 1; i > 0; i--) {
      yPoints[i] = yPoints[i - 1];
      xPoints[i] = xPoints[i - 1];
      zPoints[i] = zPoints[i - 1];
    }
    yPoints[0] = accel.y;
    xPoints[0] = accel.x;
    zPoints[0] = accel.z;
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

    if (i + 1 > yPoints.length) {
      liney.style.visibility = "hidden";
      linex.style.visibility = "hidden";
      linez.style.visibility = "hidden";
      continue;
    } else {
      liney.style.visibility = "visible";
      linex.style.visibility = "visible";
      linez.style.visibility = "visible";
    }

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
    }
  };

  appendData(data.accel);
  updateLines();
}

refreshData();
setInterval(refreshData, 10);
