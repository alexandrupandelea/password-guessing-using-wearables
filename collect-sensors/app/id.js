import document from "document";

export let value = "";

function append_number(nr) {
  if (value.length <= 5) {
    value += nr;
    document.getElementById("id-value").textContent = value;
  }
}

function delete_number() {
  value = value.slice(0, -1);
  document.getElementById("id-value").textContent = value;
}

export function showUI() {
  document.getElementById("zero-button").style.visibility = "visible";
  document.getElementById("one-button").style.visibility = "visible";
  document.getElementById("two-button").style.visibility = "visible";
  document.getElementById("three-button").style.visibility = "visible";
  document.getElementById("four-button").style.visibility = "visible";
  document.getElementById("five-button").style.visibility = "visible";
  document.getElementById("six-button").style.visibility = "visible";
  document.getElementById("seven-button").style.visibility = "visible";
  document.getElementById("eight-button").style.visibility = "visible";
  document.getElementById("nine-button").style.visibility = "visible";
  document.getElementById("delete-button").style.visibility = "visible";
  document.getElementById("done-button").style.visibility = "visible";
  document.getElementById("sep-line").style.visibility = "visible";
  document.getElementById("id-value").style.visibility = "visible";
  document.getElementById("id-value").textContent = ""
  value = ""
}

export function hideUI() {
  document.getElementById("zero-button").style.visibility = "hidden";
  document.getElementById("one-button").style.visibility = "hidden";
  document.getElementById("two-button").style.visibility = "hidden";
  document.getElementById("three-button").style.visibility = "hidden";
  document.getElementById("four-button").style.visibility = "hidden";
  document.getElementById("five-button").style.visibility = "hidden";
  document.getElementById("six-button").style.visibility = "hidden";
  document.getElementById("seven-button").style.visibility = "hidden";
  document.getElementById("eight-button").style.visibility = "hidden";
  document.getElementById("nine-button").style.visibility = "hidden";
  document.getElementById("delete-button").style.visibility = "hidden";
  document.getElementById("done-button").style.visibility = "hidden";
  document.getElementById("sep-line").style.visibility = "hidden";
  document.getElementById("id-value").style.visibility = "hidden";
}

let button = document.getElementById("zero-button");
button.onclick = function(evt) {
  append_number(0);
}

let button = document.getElementById("one-button");
button.onclick = function(evt) {
  append_number(1);
}

let button = document.getElementById("two-button");
button.onclick = function(evt) {
  append_number(2);
}

let button = document.getElementById("three-button");
button.onclick = function(evt) {
  append_number(3);
}

let button = document.getElementById("four-button");
button.onclick = function(evt) {
  append_number(4);
}

let button = document.getElementById("five-button");
button.onclick = function(evt) {
  append_number(5);
}

let button = document.getElementById("six-button");
button.onclick = function(evt) {
  append_number(6);
}

let button = document.getElementById("seven-button");
button.onclick = function(evt) {
  append_number(7);
}

let button = document.getElementById("eight-button");
button.onclick = function(evt) {
  append_number(8);
}

let button = document.getElementById("nine-button");
button.onclick = function(evt) {
  append_number(9);
}

let button = document.getElementById("delete-button");
button.onclick = function(evt) {
  delete_number()
}