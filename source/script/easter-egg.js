// styles-easter-eggs.js - CSS styles injection and easter egg features

document.addEventListener('DOMContentLoaded', () => {

    // Add sparkle animation and hero animations to CSS dynamically
    const sparkleStyle = document.createElement('style');
    sparkleStyle.textContent = `
        @keyframes sparkle {
            0% { opacity: 1; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
            100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }

        .animate-in {
            animation: slideInUp 0.6s ease forwards;
        }

        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroFadeIn {
            from { opacity: 0; transform: translateY(50px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .hero-section {
            position: relative;
            z-index: 1;
        }

        .hero-content {
            position: relative;
            z-index: 2;
        }

        .hero-banner, .banner {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: -1 !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(sparkleStyle);

    // Add tooltip animations
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        @keyframes tooltipFadeIn {
            from { opacity: 0; transform: translate(-50%, -100%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }

        @keyframes tooltipFadeOut {
            from { opacity: 1; transform: translate(-50%, -100%) scale(1); }
            to { opacity: 0; transform: translate(-50%, -100%) scale(0.8); }
        }

        .tooltip-tip {
            margin-top: 8px;
            font-size: 0.8rem;
            opacity: 0.8;
            font-style: italic;
        }
    `;
    document.head.appendChild(tooltipStyle);

    // Add final animation keyframes
    const finalAnimations = document.createElement('style');
    finalAnimations.textContent = `
        @keyframes easterEggPop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        @keyframes musicPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .music-indicator {
            animation: musicPulse 0.6s ease infinite;
        }

        .music-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            z-index: 999;
            pointer-events: none;
            transition: opacity 0.5s ease;
        }

        .bass-react {
            transition: filter 0.1s ease, transform 0.1s ease !important;
        }

        @keyframes bassReact {
            0% { filter: brightness(1) contrast(1); transform: scale(1); }
            50% { filter: brightness(1.3) contrast(1.2); transform: scale(1.02); }
            100% { filter: brightness(1) contrast(1); transform: scale(1); }
        }

        .treble-react {
            transition: box-shadow 0.1s ease, filter 0.1s ease !important;
        }

        .bot-avatar, .hero-avatar, [data-bot-avatar] {
            cursor: pointer;
            border-radius: 50%;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .bot-avatar:hover, .hero-avatar:hover, [data-bot-avatar]:hover {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(finalAnimations);

    // Initialize audio for theme song
    let themeAudio = null;
    let isPlaying = false;
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationId = null;
    let audioInitialized = false;

    function initAudio() {
        try {
            themeAudio = new Audio('source/audio/theme.mp3');
            themeAudio.volume = 0.5; // Set reasonable volume
            themeAudio.preload = 'auto';
            themeAudio.crossOrigin = 'anonymous';

            themeAudio.addEventListener('ended', () => {
                isPlaying = false;
                removeMusicIndicator();
                stopAudioAnalysis();
            });

            themeAudio.addEventListener('error', (e) => {
                console.log('Audio file not found or failed to load');
            });

            // Initialize Web Audio API for frequency analysis
            initAudioAnalysis();
        } catch (error) {
            console.log('Audio initialization failed');
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
            console.log('Audio analysis initialization failed');
        }
    }

    function connectAudioAnalysis() {
        if (audioContext && analyser && themeAudio) {
            try {
                const source = audioContext.createMediaElementSource(themeAudio);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
            } catch (error) {
                console.log('Audio analysis connection failed');
            }
        }
    }

    function startAudioAnalysis() {
        if (!analyser || !dataArray) return;

        function analyze() {
            if (!isPlaying) return;

            analyser.getByteFrequencyData(dataArray);

            // Calculate frequency ranges
            const bass = getAverageVolume(dataArray, 0, 8);  // Low frequencies
            const mid = getAverageVolume(dataArray, 8, 32);   // Mid frequencies  
            const treble = getAverageVolume(dataArray, 32, 64); // High frequencies

            // Apply visual effects based on frequency data
            applyBassReaction(bass);
            applyMidReaction(mid);
            applyTrebleReaction(treble);

            animationId = requestAnimationFrame(analyze);
        }

        analyze();
    }

    function stopAudioAnalysis() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        removeAllMusicEffects();
    }

    function getAverageVolume(array, start, end) {
        let sum = 0;
        for (let i = start; i < end && i < array.length; i++) {
            sum += array[i];
        }
        return sum / (end - start);
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

                themeAudio.currentTime = 0; // Reset to beginning
                themeAudio.play().then(() => {
                    isPlaying = true;
                    connectAudioAnalysis();
                    showMusicIndicator();
                    showSpyMessage();
                    addMusicOverlay();
                    startAudioAnalysis();
                    //stopTranscription(); // Add this line

                }).catch(error => {
                    console.log('Audio playback failed - user interaction may be required');
                });
            } catch (error) {
                console.log('Failed to play theme song');
            }
        }
    }
    function showAudioPermissionPrompt() {
        const prompt = document.createElement('div');
        prompt.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 15px;">🎵</div>
            <h3 style="margin: 0 0 10px 0;">Play Theme Song?</h3>
            <p style="margin: 0 0 20px 0; opacity: 0.8;">Tap to enable audio and play the spy theme!</p>
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
            ">🎵 Play Theme</button>
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

    function addMusicOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'music-overlay';
        overlay.className = 'music-overlay';
        document.body.appendChild(overlay);

        // Add bass-react class to all major elements
        const elements = document.querySelectorAll('div, section, header, main, article, aside, nav, button, img, h1, h2, h3, h4, h5, h6, p');
        elements.forEach(el => {
            if (!el.id || el.id !== 'music-overlay') {
                el.classList.add('bass-react');
            }
        });

        // Add treble-react to smaller interactive elements
        const interactiveElements = document.querySelectorAll('button, a, input, textarea, select, .btn, .card, .avatar');
        interactiveElements.forEach(el => {
            el.classList.add('treble-react');
        });
    }

    function applyBassReaction(bassLevel) {
        const intensity = Math.min(bassLevel / 128, 1); // Normalize to 0-1
        const elements = document.querySelectorAll('.bass-react');

        if (intensity > 0.3) { // Only react to significant bass
            const brightness = 1 + (intensity * 0.4);
            const scale = 1 + (intensity * 0.03);

            elements.forEach(el => {
                el.style.filter = `brightness(${brightness}) contrast(${1 + intensity * 0.2})`;
                el.style.transform = `scale(${scale})`;
            });
        }
    }

    function applyMidReaction(midLevel) {
        const intensity = Math.min(midLevel / 128, 1);
        const overlay = document.getElementById('music-overlay');

        if (overlay && intensity > 0.2) {
            const opacity = 0.4 - (intensity * 0.2); // Lighten overlay with mid frequencies
            overlay.style.background = `rgba(0, 0, 0, ${Math.max(opacity, 0.1)})`;
        }
    }

    function applyTrebleReaction(trebleLevel) {
        const intensity = Math.min(trebleLevel / 128, 1);
        const elements = document.querySelectorAll('.treble-react');

        if (intensity > 0.25) {
            const glowIntensity = intensity * 15;
            const hue = 320 + (intensity * 40); // Pink to purple range

            elements.forEach(el => {
                el.style.boxShadow = `0 0 ${glowIntensity}px rgba(${255}, ${107 + intensity * 50}, ${157 + intensity * 50}, ${intensity * 0.8})`;
                el.style.filter = `hue-rotate(${hue - 320}deg) saturate(${1 + intensity * 0.5})`;
            });
        }
    }

    function removeAllMusicEffects() {
        // Remove overlay
        const overlay = document.getElementById('music-overlay');
        if (overlay) overlay.remove();

        // Remove all music-reactive classes and reset styles
        const bassElements = document.querySelectorAll('.bass-react');
        bassElements.forEach(el => {
            el.classList.remove('bass-react');
            el.style.filter = '';
            el.style.transform = '';
        });

        const trebleElements = document.querySelectorAll('.treble-react');
        trebleElements.forEach(el => {
            el.classList.remove('treble-react');
            el.style.boxShadow = '';
            el.style.filter = '';
        });
    }

    function showMusicIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'music-indicator';
        indicator.innerHTML = '🎵';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            font-size: 2rem;
            z-index: 1000;
            animation: musicPulse 0.6s ease infinite;
            background: rgba(255, 107, 157, 0.9);
            padding: 10px 15px;
            border-radius: 50%;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        `;
        document.body.appendChild(indicator);
    }

    function removeMusicIndicator() {
        const indicator = document.getElementById('music-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function showSpyMessage() {
        const msgBox = document.createElement('div');
        msgBox.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                🕵️‍♀️ <strong>SPY DETECTED!</strong> 🎵
            </div>
            <div style="font-size: 0.9rem; margin-top: 5px;">
                Theme song activated!
            </div>
        `;
        msgBox.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b9d, #c44569);
            color: white;
            padding: 15px 20px;
            border-radius: 25px;
            z-index: 1000;
            font-weight: 600;
            animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 4.5s forwards;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            max-width: 250px;
        `;
        document.body.appendChild(msgBox);
        setTimeout(() => { if (msgBox.parentNode) msgBox.remove(); }, 5000);
    }

    // NEW IMPROVED SPY DETECTION - Word-based instead of letter-by-letter
    let currentWord = '';
    let wordBuffer = '';
    let isActive = false;
    let bufferTimer = null;
    let lastHintTime = 0;
    const targetWord = 'spy';

    function initSpyTypingDetection() {
        // Listen for all text input events
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                const inputValue = e.target.value || e.target.textContent || '';
                checkForSpyInInput(inputValue);
            }
        });

        // Also listen for keypress events for general typing (not in input fields)
        document.addEventListener('keypress', (e) => {
            // Only process if not typing in an input field
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.contentEditable !== 'true') {
                if (e.key.match(/[a-zA-Z\s]/)) {
                    handleGeneralTyping(e.key.toLowerCase());
                }
            }
        });

        // Show initial subtle hint
        setTimeout(() => {
            showVerySubtleHint();
        }, 5000);
    }

    function handleGeneralTyping(key) {
        // Clear previous timer
        clearTimeout(bufferTimer);

        if (key === ' ' || key === 'Enter') {
            // Space or Enter - check the current word buffer
            checkWordBuffer();
            resetWordBuffer();
        } else if (key.match(/[a-zA-Z]/)) {
            // Letter key - add to buffer
            wordBuffer += key;

            // Check if we're building towards "spy"
            if (targetWord.startsWith(wordBuffer)) {
                if (!isActive && wordBuffer === 's') {
                    activateSequence();
                }
                showProgressHint();
            } else {
                // Wrong path - deactivate and reset
                if (isActive) {
                    deactivateSequence();
                    showBreakHint(`"${wordBuffer}" broke the sequence`);
                }
                resetWordBuffer();
            }

            // Auto-reset after 2 seconds of no typing
            bufferTimer = setTimeout(() => {
                if (isActive) {
                    deactivateSequence();
                    showBreakHint('Sequence timeout');
                }
                resetWordBuffer();
            }, 2000);
        }
    }

    function checkForSpyInInput(inputText) {
        // Check if "spy" appears as a complete word in input
        const words = inputText.toLowerCase().split(/\s+/);
        alert(words);
        if (words.includes('spy')) {
            playThemeSong();
        }
    }

    function checkWordBuffer() {
        if (wordBuffer.toLowerCase() === targetWord) {
            // Success! Play the theme song
            playThemeSong();
            deactivateSequence();
        } else if (isActive) {
            // Was building sequence but didn't complete
            deactivateSequence();
            showBreakHint(`"${wordBuffer}" is not the secret word`);
        }
    }

    function activateSequence() {
        isActive = true;
        showSequenceHint('🔍', 'Sequence activated... keep going!');
    }

    function deactivateSequence() {
        isActive = false;
    }

    function resetWordBuffer() {
        wordBuffer = '';
    }

    function showProgressHint() {
        if (!isActive) return;

        const progress = wordBuffer.length;
        const total = targetWord.length;

        if (progress === 1) {
            showSequenceHint('👀', 'Good start... 1/3');
        } else if (progress === 2) {
            showSequenceHint('🎯', 'Almost there... 2/3');
        } else if (progress == 3) {
            playThemeSong();
        }

    }

    function showSequenceHint(icon, message) {
        const hint = document.createElement('div');
        hint.innerHTML = `
            <span style="font-size: 1.2rem; margin-right: 8px;">${icon}</span>
            <span style="font-size: 0.85rem; opacity: 0.9;">${message}</span>
        `;
        hint.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(107, 255, 157, 0.15);
            backdrop-filter: blur(10px);
            color: rgba(107, 255, 157, 0.9);
            padding: 12px 18px;
            border-radius: 20px;
            font-size: 0.85rem;
            z-index: 500;
            border: 1px solid rgba(107, 255, 157, 0.3);
            animation: sequenceSlideIn 0.4s ease, sequenceFadeOut 0.4s ease 2.5s forwards;
            box-shadow: 0 4px 15px rgba(107, 255, 157, 0.15);
            display: flex;
            align-items: center;
            font-weight: 500;
        `;

        const sequenceStyle = document.createElement('style');
        sequenceStyle.textContent = `
            @keyframes sequenceSlideIn {
                from { opacity: 0; transform: translateX(100px) scale(0.9); }
                to { opacity: 1; transform: translateX(0) scale(1); }
            }
            @keyframes sequenceFadeOut {
                from { opacity: 1; transform: translateX(0) scale(1); }
                to { opacity: 0; transform: translateX(50px) scale(0.95); }
            }
        `;
        document.head.appendChild(sequenceStyle);

        document.body.appendChild(hint);
        setTimeout(() => {
            if (hint.parentNode) hint.remove();
            if (sequenceStyle.parentNode) sequenceStyle.remove();
        }, 3000);
    }

    function showBreakHint(message) {
        const hint = document.createElement('div');
        hint.innerHTML = `
            <span style="font-size: 1.2rem; margin-right: 8px;">💥</span>
            <span style="font-size: 0.85rem; opacity: 0.9;">${message}</span>
        `;
        hint.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(255, 60, 60, 0.15);
            backdrop-filter: blur(10px);
            color: rgba(255, 80, 80, 0.9);
            padding: 12px 18px;
            border-radius: 20px;
            font-size: 0.85rem;
            z-index: 500;
            border: 1px solid rgba(255, 60, 60, 0.3);
            animation: breakSlideIn 0.3s ease, breakFadeOut 0.4s ease 1.8s forwards;
            box-shadow: 0 4px 15px rgba(255, 60, 60, 0.15);
            display: flex;
            align-items: center;
            font-weight: 500;
        `;

        const breakStyle = document.createElement('style');
        breakStyle.textContent = `
            @keyframes breakSlideIn {
                from { opacity: 0; transform: translateX(100px) scale(0.8) rotate(3deg); }
                to { opacity: 1; transform: translateX(0) scale(1) rotate(0deg); }
            }
            @keyframes breakFadeOut {
                from { opacity: 1; transform: translateX(0) scale(1); }
                to { opacity: 0; transform: translateX(50px) scale(0.9); }
            }
        `;
        document.head.appendChild(breakStyle);

        document.body.appendChild(hint);
        setTimeout(() => {
            if (hint.parentNode) hint.remove();
            if (breakStyle.parentNode) breakStyle.remove();
        }, 2200);
    }

    function showVerySubtleHint() {
        const hints = [
            { icon: '🔤', message: 'Try typing a three-letter word...' },
            { icon: '🕵️', message: 'Think like a secret agent' },
            { icon: '👁️', message: 'Someone might be watching' },
            { icon: '🤫', message: 'What do secret agents do?' },
            { icon: '🔍', message: 'Search, observe, investigate...' },
            { icon: '💭', message: 'Three letters, starts with S' }
        ];

        const randomHint = hints[Math.floor(Math.random() * hints.length)];

        const hint = document.createElement('div');
        hint.innerHTML = `
            <span style="font-size: 1rem; margin-right: 6px; opacity: 0.7;">${randomHint.icon}</span>
            <span style="font-size: 0.75rem; opacity: 0.6;">${randomHint.message}</span>
        `;
        hint.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 30px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(5px);
            color: rgba(255, 255, 255, 0.4);
            padding: 8px 14px;
            border-radius: 15px;
            font-size: 0.75rem;
            z-index: 400;
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: verySubtleIn 0.8s ease, verySubtleOut 0.8s ease 4s forwards;
            display: flex;
            align-items: center;
            font-weight: 400;
        `;

        const verySubtleStyle = document.createElement('style');
        verySubtleStyle.textContent = `
            @keyframes verySubtleIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes verySubtleOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(verySubtleStyle);

        document.body.appendChild(hint);
        setTimeout(() => {
            if (hint.parentNode) hint.remove();
            if (verySubtleStyle.parentNode) verySubtleStyle.remove();
        }, 5000);

        // Show hints periodically
        const now = Date.now();
        lastHintTime = now;
        setTimeout(() => {
            if (Date.now() - lastHintTime > 25000) {
                showVerySubtleHint();
            }
        }, 30000);
    }

    // Easter eggs and fun interactions
    function initEasterEggs() {
        let konamiCode = [];
        const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.code);

            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }

            if (konamiCode.join(',') === konamiSequence.join(',')) {
                showEasterEgg();
                konamiCode = [];
            }
        });

        // Full rotation logic for bot avatar
        const botAvatars = document.querySelectorAll('.bot-avatar, .hero-avatar, [data-bot-avatar]');
        let clickCount = 0;
        let totalDegrees = 0;

        botAvatars.forEach(botAvatar => {
            botAvatar.addEventListener('click', () => {
                clickCount++;
                totalDegrees += 45;

                botAvatar.style.transform = `rotate(${totalDegrees}deg) scale(${1 + clickCount * 0.1})`;
                botAvatar.style.transition = 'transform 0.3s ease';

                // Trigger message only on full return to 0 mod 360 (i.e., full turn)
                if (totalDegrees % 360 === 0 && clickCount > 0) {
                    showSecretMessage();
                    clickCount = 0;
                    totalDegrees = 0;

                    setTimeout(() => {
                        botAvatar.style.transform = '';
                    }, 1000);
                }
            });

            // Hover effect for avatars
            botAvatar.addEventListener('mouseenter', () => {
                botAvatar.style.transform = 'scale(1.1) rotate(5deg)';
                botAvatar.style.transition = 'transform 0.3s ease';
            });

            botAvatar.addEventListener('mouseleave', () => {
                if (clickCount === 0) {
                    botAvatar.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    function showEasterEgg() {
        const easter = document.createElement('div');
        easter.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6b9d, #c44569);
            color: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            z-index: 10000;
            font-size: 1.2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: easterEggPop 0.5s ease;
            backdrop-filter: blur(10px);
        `;

        easter.innerHTML = `
            <h3>🎉 Waku Waku! 🎉</h3>
            <p>You found Anya's secret!</p>
            <p>✨ Spy mission complete! ✨</p>
            <p>🥜 Here's a peanut for you! 🥜</p>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 10px;
                margin-top: 15px;
                cursor: pointer;
                transition: background 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">Close</button>
        `;
        document.body.appendChild(easter);
        setTimeout(() => { if (easter.parentNode) easter.remove(); }, 7000);
    }


    function showSecretMessage() {
        const messages = [
            "Waku waku! 🥜", "Spy x Family! 🕵️‍♀️", "Anya loves peanuts! 🥜",
            "Papa is a spy! 🤫", "Mama is an assassin! 💀", "Bond is the best dog! 🐕",
            "Operation Strix! 🎯", "Berlint Academy! 🏫", "Stella Stars! ⭐"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        const msgBox = document.createElement('div');
        msgBox.textContent = randomMessage;
        msgBox.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 107, 157, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 25px;
            z-index: 1000;
            font-weight: 600;
            animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 3.5s forwards;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;
        document.body.appendChild(msgBox);
        setTimeout(() => { if (msgBox.parentNode) msgBox.remove(); }, 4000);
    }

    // Initialize everything
    initAudio();
    initSpyTypingDetection();
    initEasterEggs();
});