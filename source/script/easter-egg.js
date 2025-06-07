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

    // Easter eggs and fun interactions
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

    // Start easter eggs
    initEasterEggs();
});
