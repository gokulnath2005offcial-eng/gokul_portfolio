document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('blueprint-loader');
    if (!loader) return;
    
    const skipBtn = document.getElementById('skip-intro');

    // Get SVG paths for the logo
    const hexagon = document.querySelector('.hexagon');
    const letterG = document.querySelector('.letter-g');
    const letterN = document.querySelector('.letter-n');

    // Helper to setup SVG drawing
    const setupPath = (path) => {
        if(!path) return;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    };

    setupPath(hexagon);
    setupPath(letterG);
    setupPath(letterN);

    // Initial states
    gsap.set('.layer-grid', { opacity: 0 });
    gsap.set('.blueprint-line', { opacity: 1 });
    gsap.set('.blueprint-box', { opacity: 0 });
    gsap.set('.energy-pulse', { opacity: 0, width: 0, height: 0 });
    
    // Mask reveal initial state
    gsap.set('.mask-reveal', { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', y: 20, opacity: 0 });
    
    // Portrait image initial state
    gsap.set('.portrait-img', { filter: 'blur(10px) grayscale(100%)', scale: 1.05 });
    
    // Social icons initial state
    gsap.set('.social-icon', { y: 20, opacity: 0 });
    
    // Navbar initial state
    gsap.set('.navbar', { opacity: 0, y: -20, visibility: 'visible' });

    // The Master Timeline
    const tl = gsap.timeline({
        onComplete: () => {
            // Clean up loader
            setTimeout(() => loader.remove(), 500);
        }
    });

    // Phase 1: Logo Genesis
    tl.to([hexagon, letterG, letterN], {
        strokeDashoffset: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: 'power3.inOut'
    })

    // Phase 2: Energy Pulse
    .to('.energy-pulse', {
        opacity: 1,
        width: 300,
        height: 300,
        duration: 0.6,
        ease: 'expo.out'
    }, "-=0.2")
    .to('.energy-pulse', {
        opacity: 0,
        width: 600,
        height: 600,
        duration: 0.6,
        ease: 'power2.out'
    }, "-=0.4")

    // Phase 3: Blueprint Generation (Fast & Subtle)
    .to('.layer-grid', {
        opacity: 0.3, // Reduced grid visibility by 70%
        duration: 0.4
    }, "-=0.6")
    
    // Draw blueprint structural lines fast
    .to('.line-h1', { width: '100%', duration: 0.4, ease: 'power3.out' }, "-=0.4")
    .to('.line-h2', { width: '100%', duration: 0.4, ease: 'power3.out' }, "-=0.3")
    .to('.line-v1', { height: '100%', duration: 0.4, ease: 'power3.out' }, "-=0.3")
    .to('.line-diagonal', { width: '150%', duration: 0.4, ease: 'power3.out' }, "-=0.3")
    
    // Draw image frame box
    .to('.image-box', { opacity: 1, duration: 0.3 }, "-=0.2")
    
    // Phase 4: Climax Pause (0.2s)
    .to('#intro-logo', { scale: 1.05, duration: 0.1, ease: 'power1.inOut' })
    .to('#intro-logo', { scale: 1, duration: 0.1, ease: 'power1.inOut' })

    // Phase 5: The Seamless Morph to Navbar
    .add(() => {
        const targetImg = document.getElementById('hero-logo-img');
        const introLogo = document.getElementById('intro-logo');
        
        if (targetImg && introLogo) {
            const targetRect = targetImg.getBoundingClientRect();
            const introRect = introLogo.getBoundingClientRect();
            
            const dx = targetRect.left - introRect.left;
            const dy = targetRect.top - introRect.top;
            const scaleX = targetRect.width / introRect.width;
            const scaleY = targetRect.height / introRect.height;
            
            gsap.to(introLogo, {
                x: dx,
                y: dy,
                scaleX: scaleX,
                scaleY: scaleY,
                transformOrigin: "top left",
                duration: 0.8,
                ease: 'expo.inOut',
                onComplete: () => {
                    // Reveal permanent logo and hide intro logo perfectly
                    gsap.set('.logo-area', { opacity: 1, visibility: 'visible' });
                    gsap.set(introLogo, { opacity: 0 });
                }
            });
            
            // Simultaneously animate the logo stroke color to black so it contrasts against the light hero background
            gsap.to('.draw-path', {
                stroke: '#000000',
                duration: 0.8,
                ease: 'expo.inOut'
            });
        }
    })

    // Dissolve blueprint layer while logo flies
    .to(['.layer-grid', '.layer-blueprint'], {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut'
    }, "-=0.8")

    // Fade out loader background completely to reveal actual page underneath
    .to(loader, {
        backgroundColor: 'rgba(0,0,0,0)',
        duration: 0.6,
        ease: 'power2.inOut'
    }, "-=0.6")

    // Wait for the logo to lock in (approx 0.8s for the morph)
    .to({}, { duration: 0.2 })

    // Phase 6: Hero Cinematic Resolution (Unlocks AFTER logo lands)
    // Navbar appears
    .to('.navbar', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    
    // Portrait Image Resolves
    .to('.portrait-target', { opacity: 1, visibility: 'visible', duration: 0.1 }, "-=0.6")
    .to('.portrait-img', {
        filter: 'blur(0px) grayscale(0%)',
        scale: 1,
        duration: 1.2,
        ease: 'power3.out'
    }, "-=0.6")

    // Typography Mask Reveals
    .to('.mask-reveal', {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        y: 0,
        opacity: 1,
        visibility: 'visible',
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    }, "-=0.8")

    // Social Icons Stagger Up
    .to('.social-icon', {
        y: 0,
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.5)'
    }, "-=0.4");

    // Skip Intro Helper
    skipBtn.addEventListener('click', () => {
        tl.progress(1); // Force timeline to end instantly
        gsap.set('.logo-area', { opacity: 1, visibility: 'visible' });
        gsap.to(loader, { opacity: 0, duration: 0.3, onComplete: () => loader.remove() });
    });
});
