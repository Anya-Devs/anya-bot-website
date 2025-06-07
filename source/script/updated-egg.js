document.addEventListener('DOMContentLoaded', () => {
    // [Previous CSS styles remain the same - truncated for brevity]
    const sparkleStyle = document.createElement('style');
    sparkleStyle.textContent = `
        @keyframes sparkle {
            0% { opacity: 1; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
            100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
        /* ... other existing styles ... */
    `;
    document.head.appendChild(sparkleStyle);

    // Audio and transcription variables
    let themeAudio = null;
    let isPlaying = false;
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationId = null;
    let audioInitialized = false;

    // Speech recognition variables
    let recognition = null;
    let isTranscribing = false;
    let transcriptWords = [];

    function initAudio() {
        try {
            themeAudio = new Audio('source/audio/theme.mp3');
            themeAudio.volume = 0.5;
            themeAudio.preload = 'auto';
            themeAudio.crossOrigin = 'anonymous';

            themeAudio.addEventListener('ended', () => {
                isPlaying = false;
                removeMusicIndicator();
                stopAudioAnalysis();
                stopTranscription();
            });

            themeAudio.addEventListener('error', (e) => {
                console.log('Audio file not found or failed to load:', e);
            });

            // Initialize Web Audio API for frequency analysis
            initAudioAnalysis();
        } catch (error) {
            console.log('Audio initialization failed:', error);
        }
    }

    function initAudioAnalysis() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        } catch (error) {
            console.log('Audio analysis initialization failed:', error);
        }
    }

    function connectAudioAnalysis() {
        if (audioContext && analyser && themeAudio) {
            try {
                const source = audioContext.createMediaElementSource(themeAudio);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
            } catch (error) {
                console.log('Audio analysis connection failed:', error);
            }
        }
    }

    function playThemeSong() {
        if (!audioInitialized) {
            showAudioPermissionPrompt();
            return;
        }

        if (themeAudio && !isPlaying) {
            try {
                // Resume audio context if suspended (required by some browsers)
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume();
                }

                themeAudio.currentTime = 0;
                themeAudio.play().then(() => {
                    isPlaying = true;
                    connectAudioAnalysis();
                    showMusicIndicator();
                    showSpyMessage();
                    startAudioAnalysis();
                    startTranscription(); // This should now work properly
                }).catch(error => {
                    console.log('Audio playback failed:', error);
                    showTranscriptionError('Audio playback failed - user interaction may be required');
                });
            } catch (error) {
                console.log('Failed to play theme song:', error);
            }
        }
    }

    // FIXED: Improved speech recognition initialization
    function initSpeechRecognition() {
        // Check for speech recognition support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.log('Speech recognition not supported in this browser');
            showTranscriptionError('Speech recognition not supported in this browser');
            return false;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();

            // FIXED: Better configuration for speech recognition
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                console.log('Speech recognition started');
                showTranscriptionStatus('🎤 Listening...');
            };

            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Process final transcript
                if (finalTranscript) {
                    console.log('Final transcript:', finalTranscript);
                    processTranscript(finalTranscript);
                }

                // Show interim results
                if (interimTranscript) {
                    showInterimTranscript(interimTranscript);
                }
            };

            recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
                showTranscriptionError(`Recognition error: ${event.error}`);
                
                // Handle specific errors
                if (event.error === 'not-allowed') {
                    showTranscriptionError('Microphone access denied. Please allow microphone access and try again.');
                } else if (event.error === 'no-speech') {
                    console.log('No speech detected, continuing...');
                } else if (event.error === 'network') {
                    showTranscriptionError('Network error occurred during speech recognition');
                }
            };

            recognition.onend = () => {
                console.log('Speech recognition ended');
                // Restart if still playing and transcribing
                if (isTranscribing && isPlaying) {
                    setTimeout(() => {
                        if (isTranscribing && isPlaying) {
                            try {
                                recognition.start();
                            } catch (error) {
                                console.log('Failed to restart recognition:', error);
                            }
                        }
                    }, 100);
                }
            };

            return true;
        } catch (error) {
            console.log('Failed to initialize speech recognition:', error);
            showTranscriptionError('Failed to initialize speech recognition');
            return false;
        }
    }

    // FIXED: Better transcription start function
    function startTranscription() {
        if (!recognition) {
            console.log('Speech recognition not initialized');
            return;
        }

        if (isTranscribing) {
            console.log('Transcription already running');
            return;
        }

        try {
            isTranscribing = true;
            transcriptWords = []; // Reset previous words
            recognition.start();
            createCaptionContainer();
            showTranscriptionStatus('🎤 Starting transcription...');
        } catch (error) {
            console.log('Failed to start transcription:', error);
            showTranscriptionError('Failed to start transcription: ' + error.message);
            isTranscribing = false;
        }
    }

    function stopTranscription() {
        if (recognition && isTranscribing) {
            isTranscribing = false;
            try {
                recognition.stop();
            } catch (error) {
                console.log('Error stopping recognition:', error);
            }
            removeCaptionContainer();
            hideTranscriptionStatus();
        }
    }

    // FIXED: Better transcript processing
    function processTranscript(transcript) {
        console.log('Processing transcript:', transcript);
        
        // Clean and split transcript
        const cleanTranscript = transcript.trim().toLowerCase();
        if (!cleanTranscript) return;

        const words = cleanTranscript.split(/\s+/).filter(word => word.length > 0);
        transcriptWords = [...transcriptWords, ...words];

        // Keep only recent words to prevent memory issues
        if (transcriptWords.length > 50) {
            transcriptWords = transcriptWords.slice(-30);
        }

        updateCaptions();
        highlightWordsOnPage(words);
    }

    function showInterimTranscript(transcript) {
        const container = document.getElementById('caption-container');
        if (!container) return;

        const cleanTranscript = transcript.trim();
        if (cleanTranscript) {
            container.innerHTML = `
                <div style="opacity: 0.7; font-style: italic;">
                    ${cleanTranscript}
                </div>
            `;
        }
    }

    function updateCaptions() {
        const container = document.getElementById('caption-container');
        if (!container) return;

        const recentWords = transcriptWords.slice(-10); // Show last 10 words
        if (recentWords.length === 0) return;

        const highlightedText = recentWords.map((word, index) => {
            if (index === recentWords.length - 1) {
                return `<span style="color: #ff6b9d; font-weight: bold;">${word}</span>`;
            }
            return word;
        }).join(' ');

        container.innerHTML = highlightedText;
    }

    // NEW: Helper functions for better user feedback
    function showTranscriptionStatus(message) {
        let statusDiv = document.getElementById('transcription-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'transcription-status';
            statusDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(107, 255, 157, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                z-index: 1001;
                font-size: 0.9rem;
                font-weight: 500;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(statusDiv);
        }
        statusDiv.textContent = message;
    }

    function hideTranscriptionStatus() {
        const statusDiv = document.getElementById('transcription-status');
        if (statusDiv) {
            statusDiv.remove();
        }
    }

    function showTranscriptionError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `⚠️ ${message}`;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 60, 60, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            z-index: 1002;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            max-width: 80%;
            text-align: center;
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    function createCaptionContainer() {
        // Remove existing container if any
        removeCaptionContainer();
        
        const container = document.createElement('div');
        container.id = 'caption-container';
        container.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            z-index: 1000;
            max-width: 80%;
            min-width: 300px;
            text-align: center;
            font-size: 1.1rem;
            font-weight: 500;
            line-height: 1.4;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        `;
        container.innerHTML = `
            <div style="opacity: 0.6; font-size: 0.9rem; margin-bottom: 5px;">
                🎵 Live Transcription
            </div>
            <div id="caption-text">Listening for audio...</div>
        `;
        document.body.appendChild(container);
    }

    function removeCaptionContainer() {
        const container = document.getElementById('caption-container');
        if (container) container.remove();
    }

    // FIXED: Audio permission prompt with transcription info
    function showAudioPermissionPrompt() {
        const prompt = document.createElement('div');
        prompt.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 15px;">🎵</div>
            <h3 style="margin: 0 0 10px 0;">Play Theme Song?</h3>
            <p style="margin: 0 0 10px 0; opacity: 0.8;">This will play music and attempt to transcribe it!</p>
            <p style="margin: 0 0 20px 0; opacity: 0.6; font-size: 0.9rem;">
                Note: Microphone access required for transcription
            </p>
            <button id="enable-audio-btn" style="
                background: linear-gradient(45deg, #ff6b9d, #c44569);
                border: none;
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                font-size: 1rem;
                margin-right: 10px;
                transition: all 0.3s ease;
            ">🎵 Play & Transcribe</button>
            <button id="cancel-audio-btn" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                font-size: 1rem;
                transition: all 0.3s ease;
            ">Cancel</button>
        </div>
    `;
        prompt.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(15px);
        color: white;
        padding: 30px;
        border-radius: 20px;
        z-index: 10000;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        animation: easterEggPop 0.5s ease;
        max-width: 90%;
    `;

        document.body.appendChild(prompt);

        document.getElementById('enable-audio-btn').addEventListener('click', () => {
            audioInitialized = true;
            prompt.remove();
            playThemeSong();
        });

        document.getElementById('cancel-audio-btn').addEventListener('click', () => {
            prompt.remove();
        });
    }

    // [Rest of your existing functions remain the same...]
    // Including: highlightWordsOnPage, getTextNodes, highlightWordInNode, etc.

    // Initialize everything
    initAudio();
    
    // FIXED: Initialize speech recognition with error handling
    const speechRecognitionAvailable = initSpeechRecognition();
    if (!speechRecognitionAvailable) {
        console.log('Speech recognition not available - transcription will be disabled');
    }
    
    initSpyTypingDetection();
    initEasterEggs();

    // [Rest of your existing initialization code...]
});