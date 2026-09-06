var audio = document.getElementById("myAudio");
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
  if (!isInitialized) {
    setupAudio();
    isInitialized = true;
  } else if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function setupAudio() {
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

  var gap = 2;
  var barWidth = (canvas.width / bufferLength) - gap;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {
    var barHeight = dataArray[i];
    
    // Scale height to match canvas height
    var scaledHeight = (barHeight / 255) * canvas.height;
    
    // green/cyan color scheme
    ctx.fillStyle = 'rgb(0, ' + Math.min(255, barHeight + 100) + ', 200)';
    
    // draw bar from bottom
    ctx.fillRect(x, canvas.height - scaledHeight, barWidth, scaledHeight);

    x += barWidth + gap; // fixed offset for next bar
  }
}
