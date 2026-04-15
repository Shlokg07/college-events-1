// Animations.js - Dynamic animation triggers and handlers
// Include this file in your pages for enhanced animation control

/**
 * Animation Manager - Handles dynamic animation triggers
 */
const AnimationManager = {
  /**
   * Initialize animations on page load
   */
  init() {
    // Ensure animations are applied to all elements on page load
    this.triggerPageLoadAnimations();
    
    // Setup intersection observer for scroll animations
    this.setupScrollAnimations();
    
    // Setup button click animations
    this.setupClickAnimations();
    
    console.log('✨ AnimationManager initialized');
  },

  /**
   * Trigger page load animations
   */
  triggerPageLoadAnimations() {
    // Body already has fadeInPage animation from CSS
    document.body.style.animation = 'fadeInPage 0.8s ease-in-out';
    
    // Animate navbar
    const navbar = document.querySelector('nav, .navbar');
    if (navbar) {
      navbar.style.animation = 'slideDownHeader 0.6s ease-out';
    }
    
    // Animate headers
    const header = document.querySelector('header, .banner, .header-section');
    if (header) {
      header.style.animation = 'slideDownHeader 0.8s ease-out';
    }
    
    // Animate main content
    const main = document.querySelector('main, .container, .content');
    if (main) {
      main.style.animation = 'slideUpContent 0.8s ease-out 0.2s both';
    }
  },

  /**
   * Setup scroll animations - Animate elements when they come into view
   */
  setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) return; // Fallback for older browsers
    
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'slideUpContent 0.6s ease-out forwards';
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    // Observe all cards, sections, and list items
    const elements = document.querySelectorAll('.card, section, .event-card, .list-item, .form-group');
    elements.forEach(el => observer.observe(el));
  },

  /**
   * Setup click animations on buttons
   */
  setupClickAnimations() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button, .btn, .login-btn, .explore-btn');
      if (button) {
        button.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
          button.style.animation = 'none';
        }, 300);
      }
    });
  },

  /**
   * Manually trigger animation on element
   * @param {HTMLElement} element - The element to animate
   * @param {string} animationName - The CSS animation name (without @keyframes)
   * @param {number} duration - Duration in milliseconds
   */
  animate(element, animationName, duration = 600) {
    if (!element) return;
    element.style.animation = `${animationName} ${duration}ms ease-out`;
    setTimeout(() => {
      element.style.animation = 'none';
    }, duration);
  },

  /**
   * Fade in element
   * @param {HTMLElement} element - The element to fade in
   * @param {number} duration - Duration in milliseconds
   */
  fadeIn(element, duration = 600) {
    if (!element) return;
    element.style.opacity = '0';
    element.style.animation = `fadeInPage ${duration}ms ease-in-out forwards`;
  },

  /**
   * Fade out element
   * @param {HTMLElement} element - The element to fade out
   * @param {number} duration - Duration in milliseconds
   */
  fadeOut(element, duration = 600) {
    if (!element) return;
    element.style.animation = `fadeOut ${duration}ms ease-in-out forwards`;
  },

  /**
   * Slide up element
   * @param {HTMLElement} element - The element to slide up
   * @param {number} duration - Duration in milliseconds
   */
  slideUp(element, duration = 600) {
    if (!element) return;
    element.style.animation = `slideUpContent ${duration}ms ease-out forwards`;
  },

  /**
   * Slide down element
   * @param {HTMLElement} element - The element to slide down
   * @param {number} duration - Duration in milliseconds
   */
  slideDown(element, duration = 600) {
    if (!element) return;
    element.style.animation = `slideDownHeader ${duration}ms ease-out forwards`;
  },

  /**
   * Slide in from left
   * @param {HTMLElement} element - The element to slide in
   * @param {number} duration - Duration in milliseconds
   */
  slideInLeft(element, duration = 700) {
    if (!element) return;
    element.style.animation = `slideInLeft ${duration}ms ease-out forwards`;
  },

  /**
   * Slide in from right
   * @param {HTMLElement} element - The element to slide in
   * @param {number} duration - Duration in milliseconds
   */
  slideInRight(element, duration = 700) {
    if (!element) return;
    element.style.animation = `slideInRight ${duration}ms ease-out forwards`;
  },

  /**
   * Zoom in element
   * @param {HTMLElement} element - The element to zoom in
   * @param {number} duration - Duration in milliseconds
   */
  zoomIn(element, duration = 600) {
    if (!element) return;
    element.style.animation = `zoomIn ${duration}ms ease-out forwards`;
  },

  /**
   * Shake element (error animation)
   * @param {HTMLElement} element - The element to shake
   * @param {number} duration - Duration in milliseconds
   */
  shake(element, duration = 500) {
    if (!element) return;
    element.style.animation = `shake ${duration}ms ease`;
  },

  /**
   * Pulse element
   * @param {HTMLElement} element - The element to pulse
   * @param {number} duration - Duration in milliseconds
   */
  pulse(element, duration = 300) {
    if (!element) return;
    element.style.animation = `pulse ${duration}ms ease`;
  },

  /**
   * Bounce element
   * @param {HTMLElement} element - The element to bounce
   * @param {number} duration - Duration in milliseconds
   */
  bounce(element, duration = 600) {
    if (!element) return;
    element.style.animation = `bounce ${duration}ms ease`;
  },

  /**
   * Success animation
   * @param {HTMLElement} element - The element to animate
   */
  success(element) {
    if (!element) return;
    element.style.animation = 'successPulse 0.6s ease';
  },

  /**
   * Animate elements with stagger effect
   * @param {string} selector - CSS selector for elements to animate
   * @param {string} animationName - The CSS animation name
   * @param {number} delay - Delay between each element (in milliseconds)
   * @param {number} duration - Animation duration (in milliseconds)
   */
  stagger(selector, animationName, delay = 100, duration = 600) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.animation = `${animationName} ${duration}ms ease-out forwards`;
      }, index * delay);
    });
  },

  /**
   * Animate all cards with stagger effect
   */
  animateCards() {
    this.stagger('.card', 'cardSlideIn', 100, 600);
  },

  /**
   * Animate all event cards with stagger effect
   */
  animateEventCards() {
    this.stagger('.event-card', 'slideUpContent', 100, 600);
  },

  /**
   * Animate form fields with stagger effect
   */
  animateFormFields() {
    this.stagger('.form-group', 'slideUpContent', 100, 600);
  },

  /**
   * Disable animations (for performance on mobile)
   */
  disableAnimations() {
    const style = document.createElement('style');
    style.textContent = '* { animation: none !important; transition: none !important; }';
    document.head.appendChild(style);
    console.log('🚫 Animations disabled');
  },

  /**
   * Enable animations (if previously disabled)
   */
  enableAnimations() {
    location.reload(); // Reload to restore animations
  },

  /**
   * Check if animations are supported
   */
  isSupported() {
    const el = document.createElement('div');
    const style = el.style;
    return (
      style.animation !== undefined ||
      style.WebkitAnimation !== undefined ||
      style.MozAnimation !== undefined
    );
  }
};

/**
 * Page Transition Manager - Handle page transitions with animations
 */
const PageTransitionManager = {
  /**
   * Fade out current page and redirect
   * @param {string} url - The URL to navigate to
   * @param {number} duration - Animation duration
   */
  navigateWithFadeOut(url, duration = 400) {
    const body = document.body;
    body.style.animation = `fadeOut ${duration}ms ease-in-out forwards`;
    setTimeout(() => {
      window.location.href = url;
    }, duration);
  },

  /**
   * Slide out and navigate
   * @param {string} url - The URL to navigate to
   * @param {number} duration - Animation duration
   */
  navigateWithSlideOut(url, duration = 400) {
    const body = document.body;
    body.style.animation = `slideUpContent ${duration}ms ease-in-out reverse forwards`;
    setTimeout(() => {
      window.location.href = url;
    }, duration);
  }
};

/**
 * Automatic initialization on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (AnimationManager.isSupported()) {
      AnimationManager.init();
    }
  });
} else {
  // DOM already loaded
  if (AnimationManager.isSupported()) {
    AnimationManager.init();
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimationManager, PageTransitionManager };
}
