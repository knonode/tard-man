document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const distortionSlider = document.getElementById('distortion');
    const weirdnessSlider = document.getElementById('weirdness');
    
    // Web Audio API setup
    let audioContext;
    let isPlaying = false;
    let mainOscillator = null;
    let distortionNode = null;
    let filterNode = null;
    let gainNode = null;
    
    // Notes for Pacman theme (simplified)
    const pacmanTheme = [
        { note: 'B4', duration: 0.15 },
        { note: 'B5', duration: 0.15 },
        { note: 'F#5', duration: 0.15 },
        { note: 'D#5', duration: 0.15 },
        { note: 'B4', duration: 0.15 },
        { note: 'F#4', duration: 0.15 },
        { note: 'D#4', duration: 0.15 },
        { note: 'C4', duration: 0.3 },
        { note: 'C5', duration: 0.15 },
        { note: 'G4', duration: 0.15 },
        { note: 'E4', duration: 0.15 },
        { note: 'C4', duration: 0.15 },
        { note: 'G3', duration: 0.15 },
        { note: 'E3', duration: 0.15 },
    ];
    
    // Note frequency map
    const noteFrequencies = {
        'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
        'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
        'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
        'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
        'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
    };
    
    // Create distortion curve for the weird effect
    function createDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            // Different distortion algorithms combined
            curve[i] = (Math.random() * 0.1 * amount) + 
                      (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x)) +
                      Math.sin(x * amount * 10) * 0.1;
        }
        return curve;
    }
    
    // Initialize audio context
    function initAudio() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create nodes
        distortionNode = audioContext.createWaveShaper();
        filterNode = audioContext.createBiquadFilter();
        gainNode = audioContext.createGain();
        
        // Connect nodes
        distortionNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set initial values
        updateDistortion();
        updateWeirdness();
        gainNode.gain.value = 0.4; // Lower volume to avoid clipping
    }
    
    // Update distortion based on slider
    function updateDistortion() {
        if (distortionNode) {
            const amount = distortionSlider.value / 20;
            distortionNode.curve = createDistortionCurve(amount);
            distortionNode.oversample = '4x';
        }
    }
    
    // Update weirdness (filter and modulation) based on slider
    function updateWeirdness() {
        if (filterNode) {
            const weirdness = weirdnessSlider.value;
            filterNode.type = weirdness > 50 ? 'highpass' : 'lowpass';
            filterNode.frequency.value = 200 + (weirdness * 20);
            filterNode.Q.value = weirdness / 10;
        }
    }
    
    // Play a note with the given frequency and duration
    function playNote(frequency, duration, time, isRest = false) {
        if (!isPlaying) return;
        
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        
        // Randomly change wave type for extra weirdness
        const waveTypes = ['sawtooth', 'square', 'triangle'];
        osc.type = waveTypes[Math.floor(Math.random() * waveTypes.length)];
        
        // Connect this note's oscillator
        osc.connect(noteGain);
        noteGain.connect(distortionNode);
        
        // Add random detune for more weirdness
        osc.detune.value = (Math.random() * 50) - 25;
        
        // Set frequency with slight random variation
        osc.frequency.value = isRest ? 0 : frequency * (1 + (Math.random() * 0.03 - 0.015));
        
        // Apply slight volume envelope
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(isRest ? 0 : 0.8, time + 0.01);
        noteGain.gain.linearRampToValueAtTime(0, time + duration - 0.01);
        
        // Schedule note start and stop
        osc.start(time);
        osc.stop(time + duration);
        
        // Add some glitchy noise bursts randomly
        if (Math.random() > 0.8 && !isRest) {
            const noiseTime = time + Math.random() * duration;
            const noise = audioContext.createBufferSource();
            const noiseBuffer = createNoiseBuffer(0.05);
            noise.buffer = noiseBuffer;
            
            const noiseGain = audioContext.createGain();
            noiseGain.gain.value = 0.2;
            
            noise.connect(noiseGain);
            noiseGain.connect(distortionNode);
            
            noise.start(noiseTime);
            noise.stop(noiseTime + 0.05);
        }
    }
    
    // Create a buffer of noise for glitchy effects
    function createNoiseBuffer(duration) {
        const sampleRate = audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    // Play the whole pacman theme
    function playPacmanTheme() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        isPlaying = true;
        let currentTime = audioContext.currentTime;
        let noteTime = 0;
        
        // Play theme in a loop
        function scheduleTheme() {
            if (!isPlaying) return;
            
            pacmanTheme.forEach((note, index) => {
                // Add occasional random rests for scratchy effect
                const isRest = Math.random() > 0.9;
                
                playNote(
                    noteFrequencies[note.note],
                    note.duration,
                    currentTime + noteTime,
                    isRest
                );
                
                noteTime += note.duration;
            });
            
            // Schedule next loop with a slight delay
            const loopDelay = 0.5; // half second delay between loops
            setTimeout(() => {
                if (isPlaying) {
                    currentTime = audioContext.currentTime;
                    noteTime = 0;
                    scheduleTheme();
                }
            }, (noteTime + loopDelay) * 1000);
        }
        
        scheduleTheme();
    }
    
    // Stop the theme
    function stopPacmanTheme() {
        isPlaying = false;
    }
    
    // Event listeners
    playBtn.addEventListener('click', () => {
        if (!audioContext) {
            initAudio();
        }
        playPacmanTheme();
    });
    
    stopBtn.addEventListener('click', () => {
        stopPacmanTheme();
    });
    
    distortionSlider.addEventListener('input', updateDistortion);
    weirdnessSlider.addEventListener('input', updateWeirdness);
}); 