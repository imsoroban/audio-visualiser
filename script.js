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

audio.onplay = function() {
  // web audio api needs to start on user interaction
  if (!isInitialized) {
    setupAudio();
    isInitialized = true;
  }
}

function setupAudio() {
  // chrome audio context fix
  AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
  
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128; // keeps it smooth on low end laptops

  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  render();
}

function render() {
  requestAnimationFrame(render);

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var barWidth = (canvas.width / bufferLength) - 1;
  var x = 0;
