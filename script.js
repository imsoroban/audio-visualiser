// DOM Element References
const audio = document.getElementById("myAudio");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

const audioFile = document.getElementById("audioFile");
const colorPicker = document.getElementById("colorPicker");
const sensitivityInput = document.getElementById("sensitivity");
const barDensityInput = document.getElementById("barDensity");

// Web Audio API Variables
let audioCtx;
let analyser;
let source;
let isInitialized = false;

// Object URL reference for browser memory management
let currentObjectURL = null;

// Lock Canvas Resolution
canvas.width = 600;
canvas.height = 250;

// Initialize Web Audio API on first user interaction (browser autoplay policy)
audio.onplay = function() {
  if (!isInitialized) {
    setupAudio();
    isInitialized = true;
  } else if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

function setupAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
  
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = parseInt(barDensityInput.value); // Set initial FFT size

  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  render();
}

// Temporary file upload with automatic object URL revocation (memory cleanup)
audioFile.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  // Revoke the previous Object URL from browser memory if one exists
  if (currentObjectURL) {
    URL.revokeObjectURL(currentObjectURL);
  }

  // Create temporary in-memory URL for selected file
  currentObjectURL = URL.createObjectURL(file);
  audio.src = currentObjectURL;

  // Auto-play new audio file
  audio.play();
});

// Update frequency resolution (bar count) on selector change
barDensityInput.addEventListener("change", function () {
  if (analyser) {
    analyser.fftSize = parseInt(this.value);
  }
});

// Helper function to extract R, G, B numbers from HEX color string
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

// Main Animation Loop
function render() {
  requestAnimationFrame(render);

  // Skip rendering until Audio Context / Analyser are initialized
  if (!analyser) return;

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var gap = 2;
  var barWidth = (canvas.width / bufferLength) - gap;
  var x = 0;

  // Retrieve current user control values
  const sensitivity = parseFloat(sensitivityInput.value);
  const baseColor = hexToRgb(colorPicker.value);

  for (var i = 0; i < bufferLength; i++) {
    // Apply user-defined sensitivity multiplier
    var rawHeight = dataArray[i] * sensitivity;
    var scaledHeight = Math.min(canvas.height, (rawHeight / 255) * canvas.height);

    // Dynamic color brightness modification based on frequency intensity
    var brightnessFactor = rawHeight / 255;
    var r = Math.min(255, Math.floor(baseColor[0] + brightnessFactor * 50));
    var g = Math.min(255, Math.floor(baseColor[1] + brightnessFactor * 50));
    var b = Math.min(255, Math.floor(baseColor[2] + brightnessFactor * 50));

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

    // Draw spectrum bar from the canvas bottom
    ctx.fillRect(x, canvas.height - scaledHeight, barWidth, scaledHeight);

    x += barWidth + gap;
  }
}
