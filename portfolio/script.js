document.addEventListener('DOMContentLoaded', () => {
    // 1. Subtle Mouse Parallax for Profile Image
    const heroRight = document.querySelector('.hero-right');
    const portraitImg = document.querySelector('.portrait-img');
    
    if (heroRight && portraitImg) {
        heroRight.addEventListener('mousemove', (e) => {
            // Get bounding rect
            const rect = heroRight.getBoundingClientRect();
            // Calculate mouse position relative to center of container
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Maximum movement is 8px
            // We divide by a large number so the mouse movement translates to a very subtle shift
            const moveX = (x / rect.width) * 16; // ranges from -8 to +8
            const moveY = (y / rect.height) * 16;
            
            // Smooth interpolation via CSS transition is not needed if we track mousemove, 
            // but we can ensure it feels smooth by just applying transform
            portraitImg.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        heroRight.addEventListener('mouseleave', () => {
            // Reset position when mouse leaves
            portraitImg.style.transform = `translate(0px, 0px)`;
            portraitImg.style.transition = 'transform 0.5s ease-out';
        });
        
        heroRight.addEventListener('mouseenter', () => {
            // Remove transition for immediate mouse tracking
            portraitImg.style.transition = 'none';
        });
    }

    // 2. Scroll Reveal Animations
    // Elements to automatically add reveal class to
    const autoRevealElements = document.querySelectorAll('.boxed-title, .about-desc, .about-col, .skill-group-title, .skill-item, .gallery-item');
    
    // Add initial reveal class
    autoRevealElements.forEach((el, index) => {
        el.classList.add('reveal');
        // Add a slight stagger for items in grids
        if (el.classList.contains('about-col') || el.classList.contains('skill-item') || el.classList.contains('gallery-item')) {
            const delay = (index % 4) * 0.1;
            el.style.transitionDelay = `${delay}s`;
        }
    });

    // Now select ALL elements with the .reveal class (both auto-added and manually added in HTML)
    const allRevealElements = document.querySelectorAll('.reveal');

    // Intersection Observer to trigger reveal
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve after animating once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    allRevealElements.forEach(el => {
        revealObserver.observe(el);
    });
});
