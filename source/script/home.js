// home.js - Anya Bot Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initSmoothScrolling();
    initHeaderScrollEffect();
    initAnimationObserver();
    initFeatureCardInteractions();
    initCopyToClipboard();
    initMobileMenu();
    initStatusUpdater();
    initBotAvatar();
    
    console.log('🎯 Anya Bot - Terms & Privacy Policy loaded successfully!');
});

// Initialize bot avatar from Discord API
async function initBotAvatar() {
    const botId = '1234247716243112100';
    const avatarElements = document.querySelectorAll('.bot-avatar, .hero-avatar, [data-bot-avatar]');
    
    try {
        // Fetch bot information from Discord API
        const response = await fetch(`https://discord.com/api/v10/applications/${botId}/rpc`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const botData = await response.json();
            const avatarUrl = botData.icon 
                ? `https://cdn.discordapp.com/app-icons/${botId}/${botData.icon}.png?size=256`
                : `https://cdn.discordapp.com/embed/avatars/0.png`; // Default Discord avatar
            
            // Update all avatar elements
            avatarElements.forEach(element => {
                if (element.tagName === 'IMG') {
                    element.src = avatarUrl;
                    element.alt = `${botData.name || 'Anya Bot'} Avatar`;
                } else {
                    element.style.backgroundImage = `url(${avatarUrl})`;
                    element.style.backgroundSize = 'cover';
                    element.style.backgroundPosition = 'center';
                }
            });
            
            console.log('✅ Bot avatar loaded from Discord API');
        } else {
            throw new Error('Failed to fetch from Discord API');
        }
    } catch (error) {
        console.warn('⚠️ Could not fetch bot avatar from Discord API, using fallback');
        
        // Fallback to a generic anime/spy themed avatar
        const fallbackUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=256&h=256&fit=crop&crop=face';
        
        avatarElements.forEach(element => {
            if (element.tagName === 'IMG') {
                element.src = fallbackUrl;
                element.alt = 'Anya Bot Avatar';
            } else {
                element.style.backgroundImage = `url(${fallbackUrl})`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
            }
        });
    }
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link, .footer-section a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Add visual feedback
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                }
            }
        });
    });
}

// Header scroll effect with banner position adjustment
function initHeaderScrollEffect() {
    const header = document.querySelector('.header');
    const heroBanner = document.querySelector('.hero-banner, .banner');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Header background changes
        if (currentScrollY > 100) {
            header.style.background = 'rgba(46, 125, 50, 0.98)';
            header.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(46, 125, 50, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
        
        // Hide/show header on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        // Parallax effect for hero banner
        if (heroBanner && currentScrollY < window.innerHeight) {
            const parallaxSpeed = 0.5;
            heroBanner.style.transform = `translateY(${currentScrollY * parallaxSpeed}px)`;
            
            // Ensure banner stays behind hero content
            heroBanner.style.zIndex = '-1';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Initial banner positioning
    if (heroBanner) {
        heroBanner.style.position = 'absolute';
        heroBanner.style.top = '0';
        heroBanner.style.left = '0';
        heroBanner.style.width = '100%';
        heroBanner.style.height = '100%';
        heroBanner.style.zIndex = '-1';
        heroBanner.style.pointerEvents = 'none';
    }
}

// Intersection Observer for animations
function initAnimationObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add staggered animation for feature cards
                if (entry.target.classList.contains('feature-card')) {
                    const cards = document.querySelectorAll('.feature-card');
                    const index = Array.from(cards).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                    entry.target.classList.add('animate-in');
                }
                
                // Special animation for hero content
                if (entry.target.classList.contains('hero-content')) {
                    entry.target.style.animation = 'heroFadeIn 1s ease forwards';
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .content-card, .footer-section, .hero-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Feature card interactions
function initFeatureCardInteractions() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        // Add hover sound effect (visual feedback)
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
            
            // Add sparkle effect
            createSparkleEffect(this);
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
        
        // Click interaction
        card.addEventListener('click', function() {
            this.style.transform = 'translateY(-10px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-15px) scale(1.02)';
            }, 100);
            
            // Show tooltip with command help
            showCommandTooltip(card);
        });
    });
}

// Create sparkle effect
function createSparkleEffect(element) {
    const sparkles = 5;
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < sparkles; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #66bb6a;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            animation: sparkle 1s ease-out forwards;
        `;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }
}

// Add sparkle animation and hero animations to CSS dynamically
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes heroFadeIn {
        from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    /* Ensure banner stays behind hero content */
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

// Command tooltip system
function showCommandTooltip(card) {
    const existingTooltip = document.querySelector('.command-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    const cardTitle = card.querySelector('h3').textContent;
    let command = '';
    let description = '';
    
    switch (cardTitle) {
        case 'Quest System':
            command = '<prefix>quest';
            description = 'Start new adventures and earn Stella Points!';
            break;
        case 'Spy Shop':
            command = '<prefix>shop';
            description = 'Browse and craft your spy tools!';
            break;
        case 'Inventory':
            command = '<prefix>inventory';
            description = 'Check your collected spy equipment!';
            break;
        case 'Balance & Status':
            command = '<prefix>balance';
            description = 'View your Stella Stars and ranking!';
            break;
    }
    
    const tooltip = document.createElement('div');
    tooltip.className = 'command-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-content">
            <strong>Command:</strong> <code>${command}</code><br>
            <span>${description}</span>
            <div class="tooltip-tip">💡 Tip: Try using the command for help!</div>
        </div>
    `;
    
    tooltip.style.cssText = `
        position: fixed;
        background: rgba(46, 125, 50, 0.95);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-size: 0.9rem;
        z-index: 1001;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        animation: tooltipFadeIn 0.3s ease;
        max-width: 300px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    const rect = card.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 10}px`;
    tooltip.style.transform = 'translate(-50%, -100%)';
    
    document.body.appendChild(tooltip);
    
    // Auto-remove tooltip after 3 seconds
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.style.animation = 'tooltipFadeOut 0.3s ease forwards';
            setTimeout(() => tooltip.remove(), 300);
        }
    }, 3000);
}

// Add tooltip animations
const tooltipStyle = document.createElement('style');
tooltipStyle.textContent = `
    @keyframes tooltipFadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
        }
    }
    
    @keyframes tooltipFadeOut {
        from {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.8);
        }
    }
    
    .tooltip-tip {
        margin-top: 8px;
        font-size: 0.8rem;
        opacity: 0.8;
        font-style: italic;
    }
`;
document.head.appendChild(tooltipStyle);

// Copy to clipboard functionality
function initCopyToClipboard() {
    const codeBlocks = document.querySelectorAll('pre code, .bot-id code');
    
    codeBlocks.forEach(codeBlock => {
        // Skip if it's inline code with very short content
        if (codeBlock.textContent.length < 10) return;
        
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(46, 125, 50, 0.8);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        `;
        
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeBlock.textContent);
                copyBtn.innerHTML = '✅ Copied!';
                copyBtn.style.background = 'rgba(76, 175, 80, 0.8)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy';
                    copyBtn.style.background = 'rgba(46, 125, 50, 0.8)';
                }, 2000);
            } catch (err) {
                copyBtn.innerHTML = '❌ Error';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy';
                }, 2000);
            }
        });
        
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = 'rgba(46, 125, 50, 1)';
            copyBtn.style.transform = 'scale(1.05)';
        });
        
        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.background = 'rgba(46, 125, 50, 0.8)';
            copyBtn.style.transform = 'scale(1)';
        });
        
        codeBlock.parentNode.insertBefore(wrapper, codeBlock);
        wrapper.appendChild(codeBlock);
        wrapper.appendChild(copyBtn);
    });
}

// Mobile menu functionality (for smaller screens)
function initMobileMenu() {
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '☰';
    mobileMenuBtn.style.cssText = `
        display: none;
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 10px;
        border-radius: 5px;
        transition: background 0.3s ease;
    `;
    
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('mobile-open');
        mobileMenuBtn.innerHTML = nav.classList.contains('mobile-open') ? '✕' : '☰';
    });
    
    // Add mobile styles
    const mobileStyle = document.createElement('style');
    mobileStyle.textContent = `
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: block !important;
            }
            
            .nav {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: rgba(46, 125, 50, 0.98);
                flex-direction: column;
                padding: 20px;
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .nav.mobile-open {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .nav-link {
                margin: 5px 0;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(mobileStyle);
    
    header.querySelector('.header-content').appendChild(mobileMenuBtn);
}

// Status updater for development badge with Discord API integration
async function initStatusUpdater() {
    const statusBadge = document.querySelector('.status-badge');
    const botId = '1234247716243112100';
    
    if (statusBadge) {
        try {
            // Try to get real bot status from Discord API
            const response = await fetch(`https://discord.com/api/v10/applications/${botId}/rpc`);
            
            if (response.ok) {
                const botData = await response.json();
                
                // Update status based on bot data
                statusBadge.textContent = 'Online';
                statusBadge.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
                
                console.log('✅ Bot status updated from Discord API');
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.warn('⚠️ Could not fetch bot status, using fallback');
            
            // Fallback to cycling statuses
            const statuses = [
                { text: 'Under Development', color: 'linear-gradient(90deg, #f39c12, #e67e22)' },
                { text: 'Testing Phase', color: 'linear-gradient(90deg, #3498db, #2980b9)' },
                { text: 'Beta Access', color: 'linear-gradient(90deg, #9b59b6, #8e44ad)' },
            ];
            
            let currentStatus = 0;
            
            // Update status every 15 seconds
            setInterval(() => {
                currentStatus = (currentStatus + 1) % statuses.length;
                const status = statuses[currentStatus];
                
                statusBadge.style.opacity = '0';
                
                setTimeout(() => {
                    statusBadge.textContent = status.text;
                    statusBadge.style.background = status.color;
                    statusBadge.style.opacity = '1';
                }, 300);
            }, 15000);
        }
    }
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
    
    // Click counter for bot avatar
    const botAvatars = document.querySelectorAll('.bot-avatar, .hero-avatar, [data-bot-avatar]');
    let clickCount = 0;
    
    botAvatars.forEach(botAvatar => {
        botAvatar.addEventListener('click', () => {
            clickCount++;
            
            botAvatar.style.transform = `rotate(${clickCount * 45}deg) scale(${1 + clickCount * 0.1})`;
            botAvatar.style.transition = 'transform 0.3s ease';
            
            if (clickCount >= 5) {
                showSecretMessage();
                clickCount = 0;
                setTimeout(() => {
                    botAvatar.style.transform = '';
                }, 1000);
            }
        });
        
        // Add hover effect for avatars
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
    
    setTimeout(() => {
        if (easter.parentNode) {
            easter.remove();
        }
    }, 7000);
}

function showSecretMessage() {
    const messages = [
        "Waku waku! 🥜",
        "Spy x Family! 🕵️‍♀️",
        "Anya loves peanuts! 🥜",
        "Papa is a spy! 🤫",
        "Mama is an assassin! 💀",
        "Bond is the best dog! 🐕",
        "Operation Strix! 🎯",
        "Berlint Academy! 🏫",
        "Stella Stars! ⭐"
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
    
    setTimeout(() => {
        if (msgBox.parentNode) {
            msgBox.remove();
        }
    }, 4000);
}

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
    
    /* Avatar hover effects */
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

// Initialize easter eggs
initEasterEggs();

// Console message for developers
console.log(`
🎯 Anya Bot Terms & Privacy Policy
═══════════════════════════════════
✨ Features loaded successfully!
🍂 Autumn theme activated
🥜 Waku waku! Try clicking around...
🤖 Bot avatar loaded from Discord API

Developer: <@1124389055598170182>
Bot ID: 1234247716243112100
Status: Under Development

Easter egg hint: Try the Konami code! ⬆⬆⬇⬇⬅➡⬅➡BA
Or click the bot avatar 5 times! 🎯
`);