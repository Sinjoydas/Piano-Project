// Function to play sound and handle BPM
function playSound(e) {
    const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
    const key = document.querySelector(`div[data-key="${e.keyCode}"]`);
    if (!audio) return;

    key.classList.add("playing");
    audio.currentTime = 0;
    audio.playbackRate = calculatePlaybackRate(audio);
    audio.play();
}

// Function to calculate playback rate based on BPM slider value
function calculatePlaybackRate(audioElement) {
    const key = audioElement.getAttribute("data-key");
    const bpmSlider = document.querySelector(`.key[data-key="${key}"] .bpm-slider`);
    const bpmValue = bpmSlider.value;
    return bpmValue / 128; // Adjust this based on your project's BPM logic
}

// Function to remove transition effect
function removeTransition(e) {
    if (e.propertyName !== "transform") return;
    e.target.classList.remove("playing");
}

// Event listener for transition end to remove playing class
const keys = Array.from(document.querySelectorAll(".key"));
keys.forEach(key => key.addEventListener("transitionend", removeTransition));

// Event listener for keydown to play sound
window.addEventListener("keydown", playSound);

// Event listener for click anywhere in key area to trigger sound
keys.forEach(key => {
    key.addEventListener("click", function() {
        const keyCode = this.getAttribute("data-key");
        const audio = document.querySelector(`audio[data-key="${keyCode}"]`);

        if (!audio) return;

        audio.currentTime = 0;
        audio.playbackRate = calculatePlaybackRate(audio);
        audio.play();
    });
});

// Event listener for loop button click
const loopBtns = document.querySelectorAll(".loop-btn");
loopBtns.forEach(btn => {
    btn.addEventListener("click", function(e) {
        const key = this.getAttribute("data-key");
        const audio = document.querySelector(`audio[data-key="${key}"]`);
        const bpmSlider = this.previousElementSibling; // Get the BPM slider previous to the button
        const bpmValue = bpmSlider.value;

        if (!audio) return;

        // Toggle loop playback
        if (audio.loop) {
            audio.loop = false;
            this.innerHTML = '<i class="fas fa-sync-alt"></i>';
        } else {
            audio.loop = true;
            this.textContent = "Stop Loop";
        }

        // Adjust playback rate based on BPM value
        audio.playbackRate = bpmValue / 128; // Adjust this based on your project's BPM logic

        // Start playing audio if not looping
        if (!audio.loop) {
            audio.currentTime = 0;
            audio.play();
        }
    });
});

// Recording functionality
let isRecording = false;
let recordedChunks = [];
let mediaRecorder;

const recordBtn = document.getElementById("recordBtn");

recordBtn.addEventListener("click", function() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

function startRecording() {
    recordedChunks = [];
    const key = document.querySelector(".key"); // Assuming all keys have the same audio context for simplicity
    const audio = document.querySelector(`audio[data-key="${key.dataset.key}"]`);

    if (!audio) return;

    const stream = audio.captureStream();
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        // Create a link element to download the recording
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.wav";
        a.textContent = "Download Recording";
        document.body.appendChild(a);
    };

    mediaRecorder.start();
    isRecording = true;
    recordBtn.textContent = "Stop Recording";
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        recordBtn.textContent = "Record";
    }
}

// Function to reset all loops and BPM sliders
function resetAll() {
    const audios = document.querySelectorAll("audio");
    const loopBtns = document.querySelectorAll(".loop-btn");
    const bpmSliders = document.querySelectorAll(".bpm-slider");

    // Stop all loops
    audios.forEach(audio => {
        audio.loop = false;
    });

    // Reset loop button text
    loopBtns.forEach(btn => {
        btn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    });

    // Reset BPM sliders to default value
    bpmSliders.forEach(slider => {
        slider.value = 128;
    });
}

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", resetAll);
