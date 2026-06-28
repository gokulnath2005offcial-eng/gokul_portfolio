/**
 * main.js — Core UI Orchestration
 * Gokul Universe Portfolio
 * - Custom cursor
 * - Page loader
 * - Typed.js effect
 * - GSAP ScrollTrigger reveals
 * - Nav scroll behavior
 * - Timeline interactions
 * - Magnetic hover
 * - 3D tilt cards
 * - Contact terminal typing
 */

(function () {
  'use strict';

  // ── Page Loader ─────────────────────────────────────────
  function initLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
      <div class="loader-logo">GN.</div>
      <div class="loader-bar"><div class="loader-fill"></div></div>
      <div class="loader-text mono">INITIALIZING UNIVERSE...</div>
    `;
    document.body.prepend(loader);

    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }, 1600);
  }

  // ── Custom Cursor ───────────────────────────────────────
  function initCursor() {
    if (window.innerWidth < 768) return;

    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let ux = 0, uy = 0; // ring position (lerped)
    let px = 0, py = 0; // dot position (instant)

    window.addEventListener('mousemove', (e) => {
      px = e.clientX; py = e.clientY;
      dot.style.left  = px + 'px';
      dot.style.top   = py + 'px';
    }, { passive: true });

    // Smooth ring follow
    function tickRing() {
      ux += (px - ux) * 0.14;
      uy += (py - uy) * 0.14;
      ring.style.left = ux + 'px';
      ring.style.top  = uy + 'px';
      requestAnimationFrame(tickRing);
    }
    tickRing();

    // Hover state on interactives
    const interactives = document.querySelectorAll('a, button, .timeline-item, .planet-card, .cert-badge, .work-panel, #skill-canvas');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  // ── Typed.js Effect (vanilla fallback) ──────────────────
  function initTyped() {
    const el = document.getElementById('typed-text');
    if (!el) return;

    const phrases = [
      'Aspiring Full Stack Developer',
      'IoT & Embedded Enthusiast',
      'Python Programmer',
      'Web Developer & Designer',
      'Researcher & Innovator',
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let delay = 120;

    function tick() {
      const current = phrases[phraseIdx];

      if (!deleting) {
        el.textContent = current.slice(0, charIdx + 1);
        charIdx++;
        delay = 90 + Math.random() * 40;
        if (charIdx === current.length) {
          delay = 2200;
          deleting = true;
        }
      } else {
        el.textContent = current.slice(0, charIdx - 1);
        charIdx--;
        delay = 45;
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          delay = 400;
        }
      }

      setTimeout(tick, delay);
    }

    tick();
  }

  // ── Contact terminal typing ──────────────────────────────
  function initContactTyped() {
    const el = document.getElementById('contact-typed');
    if (!el) return;

    const phrases = [
      'open_to_opportunities = True',
      'let\'s collaborate()',
      'ready_to_launch --new-project',
    ];

    let idx = 0;
    let ci = 0;
    let del = false;

    // Start after a delay
    setTimeout(function tick() {
      const cur = phrases[idx];
      if (!del) {
        el.textContent = cur.slice(0, ci + 1);
        ci++;
        if (ci === cur.length) { del = true; setTimeout(tick, 2500); return; }
      } else {
        el.textContent = cur.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          del = false;
          idx = (idx + 1) % phrases.length;
        }
      }
      setTimeout(tick, del ? 40 : 85);
    }, 3000);
  }

  // ── Nav scroll behavior ──────────────────────────────────
  function initNav() {
    const nav = document.getElementById('nav');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.scene');

    // Scrolled class
    const io = new IntersectionObserver(() => {}, {});
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);

      // Active link
      let current = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id;
      });
      links.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
      });
    }, { passive: true });

    // Mobile burger
    const burger = document.getElementById('nav-burger');
    const menu   = document.getElementById('nav-mobile-menu');
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open.toString());
      menu.setAttribute('aria-hidden', (!open).toString());
    });

    // Close on mobile link click
    document.querySelectorAll('.nav-mobile-link').forEach(l => {
      l.addEventListener('click', () => {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // ── Scroll Reveal (IntersectionObserver) ────────────────
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px',
    });

    revealEls.forEach(el => observer.observe(el));
  }

  // ── Timeline interactions ────────────────────────────────
  function initTimeline() {
    const items = document.querySelectorAll('.timeline-item[data-target]');
    const panels = document.querySelectorAll('.work-panel');

    function showPanel(targetId) {
      panels.forEach(p => p.classList.remove('active'));
      items.forEach(i => i.classList.remove('active'));

      const panel = document.getElementById(targetId);
      const item = document.querySelector(`[data-target="${targetId}"]`);

      if (panel) panel.classList.add('active');
      if (item) item.classList.add('active');
    }

    items.forEach(item => {
      item.addEventListener('click', () => showPanel(item.dataset.target));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showPanel(item.dataset.target);
        }
      });
    });
  }

  // ── Magnetic hover (desktop only) ───────────────────────────
  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return; // skip on touch
    const magnetics = document.querySelectorAll('.magnetic');

    magnetics.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ── 3D Tilt on cards (desktop only) ──────────────────────────────────────
  function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return; // skip on touch
    const cards = document.querySelectorAll('.planet-card, .achievement-card, .book-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        const rx = y * 8;
        const ry = -x * 8;
        card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ── GSAP ScrollTrigger (if GSAP available) ──────────────
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // About section: star parallax
    gsap.to('#star-canvas', {
      scrollTrigger: {
        trigger: '#about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
      y: -80,
      ease: 'none',
    });

    // Skill canvas fade in
    gsap.fromTo('#skill-canvas', {
      opacity: 0,
      scale: 0.92,
    }, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    });

    // Planet cards stagger
    gsap.fromTo('.planet-card', {
      opacity: 0,
      x: 50,
    }, {
      opacity: 1,
      x: 0,
      stagger: 0.18,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#about',
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });

    // Archive cols stagger
    gsap.fromTo('.archive-col', {
      opacity: 0,
      y: 40,
    }, {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#archives',
        start: 'top 65%',
        toggleActions: 'play none none reverse',
      },
    });

    // Contact: stars converge effect via camera zoom
    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 80%',
      onEnter: () => {
        // Stars convergence hint via nebula rings
        document.querySelectorAll('.nebula-ring').forEach(r => {
          r.style.animationPlayState = 'running';
        });
      },
    });

    // Work panel reveal
    gsap.fromTo('.work-layout', {
      opacity: 0,
      y: 30,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#work',
        start: 'top 65%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // ── Smooth scroll for anchor links ──────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ── Certificate badge hover sound (visual only) ─────────
  function initCertHover() {
    document.querySelectorAll('.cert-badge').forEach(badge => {
      badge.addEventListener('mouseenter', () => {
        badge.style.borderColor = 'rgba(0,212,255,0.4)';
      });
      badge.addEventListener('mouseleave', () => {
        badge.style.borderColor = '';
      });
    });
  }

  // ── Section background nebula pulses ─────────────────────
  function initNebulaPulses() {
    // Add subtle gradient nebula blobs per section
    const sections = ['about', 'skills', 'work', 'archives'];
    sections.forEach((id, i) => {
      const s = document.getElementById(id);
      if (!s) return;
      const blob = document.createElement('div');
      blob.setAttribute('aria-hidden', 'true');
      blob.style.cssText = `
        position: absolute;
        pointer-events: none;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.06;
        z-index: 0;
        animation: orb-float ${6 + i}s ease-in-out infinite;
      `;

      const colors = ['#00D4FF', '#7C3AED', '#00D4FF', '#F59E0B'];
      const sizes  = [400, 500, 400, 350];
      blob.style.width  = sizes[i] + 'px';
      blob.style.height = sizes[i] + 'px';
      blob.style.background = colors[i];
      blob.style.top  = (20 + Math.random() * 40) + '%';
      blob.style.left = (10 + Math.random() * 60) + '%';
      s.style.position = 'relative';
      s.appendChild(blob);
    });
  }

  // ── Init all ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCursor();
    initTyped();
    initContactTyped();
    initNav();
    initScrollReveal();
    initTimeline();
    initMagnetic();
    initTilt();
    initGSAP();
    initSmoothScroll();
    initCertHover();
    initNebulaPulses();

    // Keyboard accessibility: focus inside skill canvas
    const skillCanvas = document.getElementById('skill-canvas');
    if (skillCanvas) {
      skillCanvas.setAttribute('tabindex', '0');
    }
  });

})();
