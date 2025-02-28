document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const distortionSlider = document.getElementById('distortion');
    const weirdnessSlider = document.getElementById('weirdness');
    const headClosed = document.getElementById('head-closed');
    const headOpen = document.getElementById('head-open');
    const canvas = document.getElementById('particle-canvas');
    
    // Slider auto-movement variables
    let distortionDirection = 1; // 1 for increasing, -1 for decreasing
    let weirdnessDirection = -1; // Start in opposite direction for variety
    let distortionAutoMove = true;
    let weirdnessAutoMove = true;
    let sliderAnimationInterval = null;
    let userInteractionTimeout = null;
    let distortionSpeed = Math.random() * 1.5 + 0.5; // Random speed between 0.5 and 2
    let weirdnessSpeed = Math.random() * 1.5 + 0.5; // Random speed between 0.5 and 2
    
    // Function to automatically move sliders
    function startSliderAnimation() {
        if (sliderAnimationInterval) {
            clearInterval(sliderAnimationInterval);
        }
        
        sliderAnimationInterval = setInterval(() => {
            // Only move sliders if auto-move is enabled
            if (distortionAutoMove) {
                // Get current value and calculate new value
                let distortionValue = parseInt(distortionSlider.value);
                distortionValue += distortionDirection * distortionSpeed; // Move by random speed
                
                // Occasionally change direction randomly (5% chance)
                if (Math.random() < 0.05) {
                    distortionDirection *= -1;
                }
                
                // Change direction if reaching limits
                if (distortionValue >= 100) {
                    distortionDirection = -1;
                    distortionValue = 100;
                    // Change speed when changing direction
                    distortionSpeed = Math.random() * 1.5 + 0.5;
                } else if (distortionValue <= 0) {
                    distortionDirection = 1;
                    distortionValue = 0;
                    // Change speed when changing direction
                    distortionSpeed = Math.random() * 1.5 + 0.5;
                }
                
                // Update slider value and trigger change
                distortionSlider.value = distortionValue;
                updateDistortion();
            }
            
            if (weirdnessAutoMove) {
                // Get current value and calculate new value
                let weirdnessValue = parseInt(weirdnessSlider.value);
                weirdnessValue += weirdnessDirection * weirdnessSpeed; // Move by random speed
                
                // Occasionally change direction randomly (5% chance)
                if (Math.random() < 0.05) {
                    weirdnessDirection *= -1;
                }
                
                // Change direction if reaching limits
                if (weirdnessValue >= 100) {
                    weirdnessDirection = -1;
                    weirdnessValue = 100;
                    // Change speed when changing direction
                    weirdnessSpeed = Math.random() * 1.5 + 0.5;
                } else if (weirdnessValue <= 0) {
                    weirdnessDirection = 1;
                    weirdnessValue = 0;
                    // Change speed when changing direction
                    weirdnessSpeed = Math.random() * 1.5 + 0.5;
                }
                
                // Update slider value and trigger change
                weirdnessSlider.value = weirdnessValue;
                updateWeirdness();
            }
            
            // Occasionally pause one slider briefly (1% chance)
            if (Math.random() < 0.01) {
                const pauseSlider = Math.random() < 0.5 ? 'distortion' : 'weirdness';
                const pauseDuration = Math.random() * 1000 + 500; // 500-1500ms pause
                
                if (pauseSlider === 'distortion') {
                    const currentDistortionAutoMove = distortionAutoMove;
                    distortionAutoMove = false;
                    setTimeout(() => {
                        distortionAutoMove = currentDistortionAutoMove;
                    }, pauseDuration);
                } else {
                    const currentWeirdnessAutoMove = weirdnessAutoMove;
                    weirdnessAutoMove = false;
                    setTimeout(() => {
                        weirdnessAutoMove = currentWeirdnessAutoMove;
                    }, pauseDuration);
                }
            }
        }, 100); // Update every 100ms for smooth movement
    }
    
    // Function to handle user interaction with sliders
    function handleSliderInteraction() {
        // Stop auto-movement when user interacts
        distortionAutoMove = false;
        weirdnessAutoMove = false;
        
        // Clear any existing timeout
        if (userInteractionTimeout) {
            clearTimeout(userInteractionTimeout);
        }
        
        // Resume auto-movement after 5 seconds of inactivity
        userInteractionTimeout = setTimeout(() => {
            distortionAutoMove = true;
            weirdnessAutoMove = true;
            // Reset speeds when resuming
            distortionSpeed = Math.random() * 1.5 + 0.5;
            weirdnessSpeed = Math.random() * 1.5 + 0.5;
        }, 5000);
    }
    
    // Add event listeners for user interaction
    distortionSlider.addEventListener('mousedown', handleSliderInteraction);
    distortionSlider.addEventListener('touchstart', handleSliderInteraction);
    weirdnessSlider.addEventListener('mousedown', handleSliderInteraction);
    weirdnessSlider.addEventListener('touchstart', handleSliderInteraction);
    
    // Set up canvas
    const ctx = canvas.getContext('2d');
    let canvasWidth = canvas.offsetWidth;
    let canvasHeight = canvas.offsetHeight;
    
    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
    }
    
    // Call resize initially
    resizeCanvas();
    
    // Resize canvas when window is resized
    window.addEventListener('resize', resizeCanvas);
    
    // Particle system
    const particles = [];
    const particleCount = 30;
    let particleAnimation;
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = canvasWidth + Math.random() * 20;
            this.y = Math.random() * canvasHeight;
            this.size = Math.random() * 3 + 1;
            this.speed = Math.random() * 3 + 1;
            this.color = `rgba(255, ${Math.floor(Math.random() * 100) + 155}, 0, ${Math.random() * 0.5 + 0.2})`;
        }
        
        update() {
            this.x -= this.speed;
            
            // Reset particle when it goes off screen
            if (this.x < -this.size) {
                this.reset();
            }
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Initialize particles
    function initParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
            // Distribute particles across the canvas initially
            particles[i].x = Math.random() * canvasWidth;
        }
    }
    
    // Animate particles
    function animateParticles() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        particleAnimation = requestAnimationFrame(animateParticles);
    }
    
    // Start particle animation
    function startParticles() {
        if (particleAnimation) {
            cancelAnimationFrame(particleAnimation);
        }
        
        if (particles.length === 0) {
            initParticles();
        }
        
        animateParticles();
    }
    
    // Stop particle animation
    function stopParticles() {
        if (particleAnimation) {
            cancelAnimationFrame(particleAnimation);
            particleAnimation = null;
        }
    }
    
    // Animation variables
    let animationInterval = null;
    let isOpenMouth = false;
    
    // Web Audio API setup
    let audioContext;
    let isPlaying = false;
    let distortionNode = null;
    let filterNode = null;
    let gainNode = null;
    
    // Simple function to toggle between head images
    function toggleHeadImages() {
        if (isOpenMouth) {
            // Show closed mouth
            headOpen.classList.remove('active');
            headClosed.classList.add('active');
        } else {
            // Show open mouth
            headClosed.classList.remove('active');
            headOpen.classList.add('active');
        }
        isOpenMouth = !isOpenMouth;
    }
    
    // Start the head animation
    function startHeadAnimation() {
        // Clear any existing interval
        stopHeadAnimation();
        
        // Make sure closed mouth is showing initially
        headOpen.classList.remove('active');
        headClosed.classList.add('active');
        isOpenMouth = false;
        
        // Toggle between images at a fixed interval
        animationInterval = setInterval(toggleHeadImages, 300);
        
        // Start particle animation
        startParticles();
        
        // Start slider animation
        startSliderAnimation();
    }
    
    // Stop the head animation
    function stopHeadAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        
        // Reset to closed mouth
        headOpen.classList.remove('active');
        headClosed.classList.add('active');
        isOpenMouth = false;
        
        // Stop particle animation
        stopParticles();
        
        // Stop slider animation
        if (sliderAnimationInterval) {
            clearInterval(sliderAnimationInterval);
            sliderAnimationInterval = null;
        }
    }
    
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
        
        // Start head animation
        startHeadAnimation();
        
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
        stopHeadAnimation();
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
    
    // Test animation directly - just to make sure it works on page load
    setTimeout(() => {
        startHeadAnimation();
        
        // Stop after 3 seconds if play button isn't clicked
        setTimeout(() => {
            if (!isPlaying) {
                stopHeadAnimation();
            }
        }, 3000);
    }, 500);
}); 