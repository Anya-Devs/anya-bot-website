// ui-interactions.js - Sleek UI interactions and animations

// Smooth scrolling with improved performance
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('[data-smooth-scroll]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const header = document.querySelector('.header');
                    const offset = header ? header.offsetHeight + 10 : 0;
                    const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
                    
                    // Use requestAnimationFrame for smoother animation
                    const startPos = window.scrollY;
                    const distance = targetPos - startPos;
                    const duration = 500;
                    let startTime = null;
                    
                    const animateScroll = (currentTime) => {
                        if (!startTime) startTime = currentTime;
                        const timeElapsed = currentTime - startTime;
                        const progress = Math.min(timeElapsed / duration, 1);
                        const ease = easeOutQuart(progress);
                        
                        window.scrollTo(0, startPos + (distance * ease));
                        
                        if (timeElapsed < duration) {
                            requestAnimationFrame(animateScroll);
                        }
                    };
                    
                    requestAnimationFrame(animateScroll);
                    
                    // Subtle click feedback
                    link.classList.add('active');
                    setTimeout(() => link.classList.remove('active'), 150);
                }
            }
        });
    });
    
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
}

// Modern header scroll effects with IntersectionObserver
function initHeaderEffects() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    // Use IntersectionObserver for better performance
    const observer = new IntersectionObserver(
        ([entry]) => {
            header.classList.toggle('scrolled', !entry.isIntersecting);
        },
        { threshold: 0.1 }
    );
    
    observer.observe(document.querySelector('.hero-section'));
    
    // Hide/show on scroll direction
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll <= 0) {
            header.classList.remove('hidden');
            return;
        }
        
        if (Math.abs(currentScroll - lastScroll) < 50) return;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// Sleek animation system with GSAP-like easing
function initAnimations() {
    const animateOnScroll = (elements) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        
        elements.forEach(el => observer.observe(el));
    };
    
    // Configure animations
    const fadeUpElements = document.querySelectorAll('[data-animate="fade-up"]');
    const fadeInElements = document.querySelectorAll('[data-animate="fade-in"]');
    const staggerElements = document.querySelectorAll('[data-animate="stagger"]');
    
    fadeUpElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)';
    });
    
    fadeInElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.8s var(--ease-in-out)';
    });
    
    staggerElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.style.transition = `opacity 0.5s var(--ease-out) ${i * 0.1}s, transform 0.5s var(--ease-out) ${i * 0.1}s`;
    });
    
    animateOnScroll([...fadeUpElements, ...fadeInElements, ...staggerElements]);
}

// Modern card interactions with CSS variables
function initCardInteractions() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.style.setProperty('--hover-scale', '1.02');
        card.style.setProperty('--active-scale', '0.98');
        card.style.setProperty('--hover-elevation', '25px');
        card.style.setProperty('--transition-speed', '0.4s');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            card.style.setProperty('--mouse-x', `${(x - centerX) / 20}px`);
            card.style.setProperty('--mouse-y', `${(y - centerY) / 20}px`);
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', '0px');
            card.style.setProperty('--mouse-y', '0px');
        });
        
        card.addEventListener('click', () => {
            card.classList.add('active');
            setTimeout(() => card.classList.remove('active'), 300);
        });
    });
}

// Minimalist tooltip system
function initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    
    tooltipTriggers.forEach(trigger => {
        let tooltip = null;
        let timeout = null;
        
        const showTooltip = () => {
            if (tooltip) return;
            
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = trigger.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            positionTooltip(trigger, tooltip);
            tooltip.classList.add('visible');
        };
        
        const hideTooltip = () => {
            if (!tooltip) return;
            
            tooltip.classList.remove('visible');
            setTimeout(() => {
                tooltip.remove();
                tooltip = null;
            }, 200);
        };
        
        trigger.addEventListener('mouseenter', () => {
            timeout = setTimeout(showTooltip, 300);
        });
        
        trigger.addEventListener('mouseleave', () => {
            clearTimeout(timeout);
            hideTooltip();
        });
        
        trigger.addEventListener('click', () => {
            if (tooltip) hideTooltip();
            else showTooltip();
        });
    });
    
    function positionTooltip(trigger, tooltip) {
        const rect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        
        // Adjust if going off screen
        if (top < 0) top = rect.bottom + 10;
        if (left < 0) left = 10;
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left}px`;
    }
}

// Enhanced mobile menu with touch gestures
function initMobileMenu() {
    const menu = document.querySelector('.nav');
    const toggle = document.querySelector('.menu-toggle');
    if (!menu || !toggle) return;
    
    let startY = 0;
    let isDragging = false;
    
    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });
    
    // Swipe to close
    menu.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    }, { passive: true });
    
    menu.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const y = e.touches[0].clientY;
        const diff = y - startY;
        
        if (diff > 50) {
            menu.classList.remove('open');
            document.body.style.overflow = '';
            isDragging = false;
        }
    }, { passive: true });
    
    menu.addEventListener('touchend', () => {
        isDragging = false;
    }, { passive: true });
}

// Clipboard with visual feedback
function initClipboard() {
    document.querySelectorAll('[data-clipboard]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.getAttribute('data-clipboard');
            
            try {
                await navigator.clipboard.writeText(text);
                
                // Visual feedback
                const feedback = document.createElement('div');
                feedback.className = 'clipboard-feedback';
                feedback.textContent = 'Copied!';
                document.body.appendChild(feedback);
                
                // Position near button
                const rect = btn.getBoundingClientRect();
                feedback.style.left = `${rect.left + (rect.width / 2)}px`;
                feedback.style.top = `${rect.top - 10}px`;
                
                // Animate
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    feedback.style.transform = 'translate(-50%, -15px)';
                }, 100);
                
                // Remove after animation
                setTimeout(() => feedback.remove(), 1000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

// Initialize all UI components
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScrolling();
    initHeaderEffects();
    initAnimations();
    initCardInteractions();
    initTooltips();
    initMobileMenu();
    initClipboard();
});

// Add CSS variables for consistent animations
document.documentElement.style.setProperty('--ease-out', 'cubic-bezier(0.16, 1, 0.3, 1)');
document.documentElement.style.setProperty('--ease-in-out', 'cubic-bezier(0.65, 0, 0.35, 1)');