// main.js - Core initialization and Discord API integration

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

// Bot configuration
const BOT_CONFIG = {
    id: '1234247716243112100',
    name: 'Anya Bot',
    // If you have the avatar hash from Discord Developer Portal, add it here
    avatarHash: null, // Example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
    // Fallback images in order of preference
    fallbackImages: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=256&h=256&fit=crop&crop=face',
        'https://cdn.discordapp.com/embed/avatars/0.png',
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23FF6B9D"/%3E%3Ctext x="50" y="60" text-anchor="middle" fill="white" font-size="40" font-family="Arial"%3EA%3C/text%3E%3C/svg%3E'
    ]
};

/**
 * Initialize bot avatar with multiple fallback strategies
 */
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


/**
 * Attempt to load avatar from Discord API
 */
async function tryDiscordAPI(avatarElements) {
    const endpoints = [
        {
            url: `https://discord.com/api/v10/users/${BOT_CONFIG.id}`,
            name: 'Discord User API',
            processResponse: (data) => ({
                url: data.avatar 
                    ? `https://cdn.discordapp.com/avatars/${BOT_CONFIG.id}/${data.avatar}.png?size=256`
                    : `https://cdn.discordapp.com/embed/avatars/${(data.discriminator || 0) % 5}.png`,
                name: data.username || BOT_CONFIG.name
            })
        },
        {
            url: `https://discord.com/api/v10/applications/${BOT_CONFIG.id}`,
            name: 'Discord Application API',
            processResponse: (data) => ({
                url: data.icon 
                    ? `https://cdn.discordapp.com/app-icons/${BOT_CONFIG.id}/${data.icon}.png?size=256`
                    : `https://cdn.discordapp.com/embed/avatars/0.png`,
                name: data.name || BOT_CONFIG.name
            })
        }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`🌐 Trying ${endpoint.name}...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(endpoint.url, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'AnyaBot/1.0'
                },
                signal: controller.signal,
                mode: 'cors' // Explicitly set CORS mode
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const avatarData = endpoint.processResponse(data);
                
                const success = await tryLoadAvatar(avatarElements, avatarData.url, endpoint.name);
                if (success) {
                    BOT_CONFIG.name = avatarData.name; // Update name if successful
                    console.log(`✅ Bot avatar loaded from ${endpoint.name}`);
                    return true;
                }
            } else {
                console.warn(`⚠️ ${endpoint.name} returned status: ${response.status}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`⏱️ ${endpoint.name} request timed out`);
            } else {
                console.warn(`⚠️ ${endpoint.name} failed:`, error.message);
            }
        }
    }
    
    return false;
}

/**
 * Try to load avatar from a specific URL
 */
async function tryLoadAvatar(elements, avatarUrl, source) {
    try {
        // Test if image loads successfully
        await preloadImage(avatarUrl);
        
        // If successful, update all elements
        updateAvatarElements(elements, avatarUrl, BOT_CONFIG.name);
        console.log(`✅ Avatar loaded from: ${source}`);
        return true;
    } catch (error) {
        console.warn(`⚠️ Failed to load avatar from ${source}:`, error.message);
        return false;
    }
}

/**
 * Load fallback avatar with multiple options
 */
async function loadFallbackAvatar(elements) {
    for (let i = 0; i < BOT_CONFIG.fallbackImages.length; i++) {
        const fallbackUrl = BOT_CONFIG.fallbackImages[i];
        console.log(`🔄 Trying fallback ${i + 1}/${BOT_CONFIG.fallbackImages.length}...`);
        
        const success = await tryLoadAvatar(elements, fallbackUrl, `Fallback ${i + 1}`);
        if (success) {
            return;
        }
    }
    
    console.error('❌ All avatar loading methods failed');
}

/**
 * Preload image to test if it loads successfully
 */
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

/**
 * Update avatar elements with the loaded image
 */
function updateAvatarElements(elements, avatarUrl, botName) {
    elements.forEach((element, index) => {
        try {
            if (element.tagName === 'IMG') {
                element.src = avatarUrl;
                element.alt = `${botName} Avatar`;
                
                // Add error handling for future failures
                element.onerror = function() {
                    console.warn(`⚠️ Avatar image failed to load for element ${index + 1}`);
                    this.src = BOT_CONFIG.fallbackImages[BOT_CONFIG.fallbackImages.length - 1]; // Use last fallback
                };
            } else {
                // For div elements or other containers
                element.style.backgroundImage = `url("${avatarUrl}")`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
                element.style.backgroundRepeat = 'no-repeat';
            }
        } catch (error) {
            console.error(`❌ Failed to update avatar element ${index + 1}:`, error);
        }
    });
}

/**
 * Status updater with improved error handling
 */
async function initStatusUpdater() {
    const statusBadge = document.querySelector('.status-badge');
    
    if (!statusBadge) {
        console.warn('⚠️ Status badge element not found');
        return;
    }
    
    // Try to get bot status (will likely fail due to CORS)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`https://discord.com/api/v10/users/${BOT_CONFIG.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AnyaBot/1.0'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            statusBadge.textContent = 'Online';
            statusBadge.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
            console.log('✅ Bot status updated from Discord API');
            return;
        }
    } catch (error) {
        console.log('ℹ️ Using fallback status system (expected due to CORS)');
    }
    
    // Fallback: Cycling statuses
    const statuses = [
        { text: 'Under Development', color: 'linear-gradient(90deg, #f39c12, #e67e22)' },
        { text: 'Testing Phase', color: 'linear-gradient(90deg, #3498db, #2980b9)' },
        { text: 'Beta Access', color: 'linear-gradient(90deg, #9b59b6, #8e44ad)' },
        { text: 'Coming Soon', color: 'linear-gradient(90deg, #e74c3c, #c0392b)' }
    ];
    
    let currentStatus = 0;
    
    // Set initial status
    statusBadge.textContent = statuses[currentStatus].text;
    statusBadge.style.background = statuses[currentStatus].color;
    
    // Update status every 15 seconds
    const statusInterval = setInterval(() => {
        currentStatus = (currentStatus + 1) % statuses.length;
        const status = statuses[currentStatus];
        
        // Smooth transition
        statusBadge.style.opacity = '0';
        statusBadge.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            statusBadge.textContent = status.text;
            statusBadge.style.background = status.color;
            statusBadge.style.opacity = '1';
            statusBadge.style.transform = 'scale(1)';
        }, 200);
    }, 15000);
    
    // Store interval ID for cleanup
    window.statusInterval = statusInterval;
}

// Placeholder functions for other features (implement these based on your needs)
function initSmoothScrolling() {
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initHeaderScrollEffect() {
    // Add scroll effect to header
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScrollY = window.scrollY;
        }
    });
}

function initAnimationObserver() {
    // Placeholder for scroll animations
    console.log('🎭 Animation observer initialized');
}

function initFeatureCardInteractions() {
    // Add hover effects to feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

function initCopyToClipboard() {
    // Add copy functionality to code blocks
    document.querySelectorAll('code').forEach(codeBlock => {
        codeBlock.style.cursor = 'pointer';
        codeBlock.title = 'Click to copy';
        
        codeBlock.addEventListener('click', () => {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                const originalText = codeBlock.textContent;
                codeBlock.textContent = 'Copied!';
                setTimeout(() => {
                    codeBlock.textContent = originalText;
                }, 1000);
            });
        });
    });
}

function initMobileMenu() {
    // Placeholder for mobile menu functionality
    console.log('📱 Mobile menu initialized');
}

// Enhanced console message
console.log(`
🎯 Anya Bot Terms & Privacy Policy
═══════════════════════════════════════════════
✨ Features loaded successfully!
🍂 Autumn theme activated
🥜 Waku waku! Try clicking around...
🤖 Bot avatar system initialized

Bot Configuration:
├── ID: ${BOT_CONFIG.id}
├── Name: ${BOT_CONFIG.name}
├── Avatar Methods: API → Direct CDN → Fallbacks
└── Status: Dynamic cycling system

Developer Info:
├── Created by: <@1124389055598170182>
├── Status: Under Development
└── CORS Note: Discord API may be blocked by browser

🎮 Easter Eggs:
├── Try the Konami code! ⬆⬆⬇⬇⬅➡⬅➡BA
├── Click the bot avatar 5 times! 🎯
└── Check the browser console for updates!

🔧 Avatar Loading Priority:
1. Stored avatar hash (if available)
2. Discord User API (may fail due to CORS)
3. Discord Application API (may fail due to CORS)
4. Curated fallback images
5. Default SVG avatar
`);