// audio script yay i hate js
var audio = document.getElementById("myAudio") 
var canvas = document.getElementById("visualizer");
var ctx = canvas.getContext("2d");

// global variables for audio context
let audioCtx;
let analyser;
let source;
var isInitialized = false;

// make sure canvas resolution isn't blurry
canvas.width = 600;
canvas.height = 250;