// ui-interactions.js - UI interactions, animations, and navigation

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