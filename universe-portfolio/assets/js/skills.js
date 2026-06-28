/**
 * skills.js — Skill Constellation Network
 * Pure Canvas 2D — reliable cross-browser rendering
 * Floating orbs · Connection lines · Hover effects · Ripple waves
 */

(function () {
  'use strict';

  // Polyfill roundRect for older browsers
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + w - radius, y);
      this.quadraticCurveTo(x + w, y, x + w, y + radius);
      this.lineTo(x + w, y + h - radius);
      this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      this.lineTo(x + radius, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
    };
  }

  const canvas = document.getElementById('skill-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // ── Skill Definitions ────────────────────────────────────
  const SKILLS = [
    { name: 'HTML/CSS',   color: '#00D4FF', glow: 'rgba(0,212,255,0.35)',   connects: [1, 2, 3], r: 18 },
    { name: 'JavaScript', color: '#00D4FF', glow: 'rgba(0,212,255,0.35)',   connects: [0, 2, 3, 4], r: 22 },
    { name: 'React',      color: '#38BDF8', glow: 'rgba(56,189,248,0.35)',  connects: [0, 1, 4], r: 18 },
    { name: 'Python',     color: '#A78BFA', glow: 'rgba(167,139,250,0.35)', connects: [0, 5, 6], r: 22 },
    { name: 'Node.js',    color: '#7C3AED', glow: 'rgba(124,58,237,0.35)',  connects: [1, 2, 5], r: 16 },
    { name: 'PHP',        color: '#7C3AED', glow: 'rgba(124,58,237,0.35)',  connects: [3, 4], r: 14 },
    { name: 'IoT',        color: '#F59E0B', glow: 'rgba(245,158,11,0.35)',  connects: [3, 7, 8], r: 20 },
    { name: 'Embedded C', color: '#F59E0B', glow: 'rgba(245,158,11,0.35)',  connects: [6, 8], r: 16 },
    { name: 'Figma',      color: '#10B981', glow: 'rgba(16,185,129,0.35)',  connects: [0, 9], r: 14 },
    { name: 'Canva',      color: '#10B981', glow: 'rgba(16,185,129,0.35)',  connects: [8], r: 14 },
  ];

  // ── State ─────────────────────────────────────────────────
  let W = 0, H = 0;
  let nodes = [];
  let mouse = { x: -9999, y: -9999 };
  let hoveredIdx = -1;
  let ripples = [];
  let lastTime = 0;
  let animFrameId = null;
  let initialized = false;

  // ── Resize + Init Positions ───────────────────────────────
  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(rect.width, canvas.parentElement.offsetWidth, 300);
    H = Math.max(rect.height, 500);

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    layoutNodes();
  }

  function layoutNodes() {
    const isMobileLayout = W < 600;

    // Desktop: wide spread across canvas
    // Mobile: 2-column stacked grid that fits the portrait canvas
    const desktopPositions = [
      [0.22, 0.30],  // 0 HTML/CSS
      [0.42, 0.22],  // 1 JavaScript
      [0.62, 0.28],  // 2 React
      [0.30, 0.55],  // 3 Python
      [0.55, 0.50],  // 4 Node.js
      [0.75, 0.42],  // 5 PHP
      [0.18, 0.72],  // 6 IoT
      [0.40, 0.75],  // 7 Embedded C
      [0.70, 0.68],  // 8 Figma
      [0.85, 0.58],  // 9 Canva
    ];

    // 2-column layout for mobile — 5 rows × 2 cols, centered
    const mobilePositions = [
      [0.25, 0.12],  // 0 HTML/CSS
      [0.72, 0.12],  // 1 JavaScript
      [0.25, 0.32],  // 2 React
      [0.72, 0.32],  // 3 Python
      [0.25, 0.52],  // 4 Node.js
      [0.72, 0.52],  // 5 PHP
      [0.25, 0.72],  // 6 IoT
      [0.72, 0.72],  // 7 Embedded C
      [0.25, 0.88],  // 8 Figma
      [0.72, 0.88],  // 9 Canva
    ];

    const positions = isMobileLayout ? mobilePositions : desktopPositions;

    // Scale node radii down on mobile
    const rScale = isMobileLayout ? 0.75 : 1;

    nodes = SKILLS.map((skill, i) => {
      const px = positions[i][0] * W;
      const py = positions[i][1] * H;
      return {
        ...skill,
        r: skill.r * rScale,
        x: px, y: py,
        baseX: px, baseY: py,
        floatT: Math.random() * Math.PI * 2,
        floatSpeed: 0.25 + Math.random() * 0.35,
        floatAmp: isMobileLayout ? 3 : 6 + Math.random() * 10,
        scale: 1,
        targetScale: 1,
        opacity: 0,
        targetOpacity: 1,
        labelOpacity: 0,
        targetLabelOpacity: 0,
      };
    });
  }

  // ── Mouse & Touch Interaction ──────────────────────────────
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
    hoveredIdx = -1;
  });

  // Touch tap — show label + ripple
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (hoveredIdx >= 0) {
      const n = nodes[hoveredIdx];
      ripples.push({ x: n.x, y: n.y, r: n.r, maxR: 80, life: 1, color: n.color });
    }
    setTimeout(() => { mouse.x = -9999; mouse.y = -9999; hoveredIdx = -1; }, 1200);
  }, { passive: false });

  canvas.addEventListener('click', (e) => {
    if (hoveredIdx >= 0) {
      const n = nodes[hoveredIdx];
      ripples.push({ x: n.x, y: n.y, r: n.r, maxR: 80, life: 1, color: n.color });
    }
  });

  // ── Tooltip (desktop only) ────────────────────────────────
  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed;
    pointer-events: none;
    background: rgba(5,5,8,0.92);
    border: 1px solid rgba(0,212,255,0.3);
    backdrop-filter: blur(12px);
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    padding: 0.45rem 0.85rem;
    border-radius: 8px;
    z-index: 200;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.15s;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    transform: translateY(-6px);
    display: ${isTouchDevice ? 'none' : 'block'};
  `;
  document.body.appendChild(tooltip);

  canvas.addEventListener('mousemove', (e) => {
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top  = (e.clientY - 32) + 'px';
  }, { passive: true });

  // ── Draw Helpers ──────────────────────────────────────────
  function drawGlowCircle(x, y, r, color, glow, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Outer glow
    const grad = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.5);
    grad.addColorStop(0, glow);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Core circle
    const coreGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, color);
    coreGrad.addColorStop(1, glow.replace('0.35', '0.6'));
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawLine(x1, y1, x2, y2, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawLabel(x, y, r, text, color, alpha) {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `500 12px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Background pill
    const tw = ctx.measureText(text).width + 16;
    const th = 22;
    const tx = x;
    const ty = y + r + 18;

    ctx.fillStyle = 'rgba(5,5,8,0.85)';
    ctx.beginPath();
    ctx.roundRect(tx - tw / 2, ty - th / 2, tw, th, 6);
    ctx.fill();

    ctx.strokeStyle = color + '60';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillText(text, tx, ty);
    ctx.restore();
  }

  // ── Main Render Loop ──────────────────────────────────────
  function render(ts) {
    animFrameId = requestAnimationFrame(render);
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    ctx.clearRect(0, 0, W, H);

    if (nodes.length === 0) return;

    // Detect hover
    let newHover = -1;
    nodes.forEach((n, i) => {
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      if (Math.sqrt(dx * dx + dy * dy) <= n.r + 10) newHover = i;
    });

    if (newHover !== hoveredIdx) {
      if (newHover >= 0) {
        const n = nodes[newHover];
        tooltip.textContent = n.name;
        tooltip.style.opacity = '1';
        tooltip.style.borderColor = n.color + '50';
        // Add ripple on enter
        ripples.push({ x: n.x, y: n.y, r: n.r, maxR: 60, life: 1, color: n.color });
      } else {
        tooltip.style.opacity = '0';
      }
      hoveredIdx = newHover;
    }

    // Update node animations
    const t = ts * 0.001;
    nodes.forEach((n, i) => {
      // Float
      n.x = n.baseX + Math.cos(t * n.floatSpeed + n.floatT) * n.floatAmp;
      n.y = n.baseY + Math.sin(t * n.floatSpeed * 0.7 + n.floatT) * n.floatAmp * 0.6;

      // Scale
      n.targetScale = (i === hoveredIdx) ? 1.45 : 1;
      n.scale += (n.targetScale - n.scale) * 0.12;

      // Fade in on load
      n.targetOpacity = 1;
      n.opacity = Math.min(1, n.opacity + dt * 1.2);

      // Label
      n.targetLabelOpacity = (i === hoveredIdx) ? 1 : 0;
      n.labelOpacity += (n.targetLabelOpacity - n.labelOpacity) * 0.14;
    });

    // Draw connection lines
    const drawnConnections = new Set();
    nodes.forEach((n, i) => {
      n.connects.forEach(j => {
        const key = [Math.min(i, j), Math.max(i, j)].join('-');
        if (drawnConnections.has(key)) return;
        drawnConnections.add(key);

        const isHighlighted = (i === hoveredIdx || j === hoveredIdx) && hoveredIdx >= 0;
        const alpha = isHighlighted ? 0.55 : 0.18;
        const color = isHighlighted
          ? (nodes[hoveredIdx].color)
          : '#00D4FF';

        drawLine(n.x, n.y, nodes[j].x, nodes[j].y, color, alpha);

        // Animated energy dot along connection line (when hovered)
        if (isHighlighted) {
          const progress = (Math.sin(t * 2 + i * 0.5) + 1) / 2;
          const ex = n.x + (nodes[j].x - n.x) * progress;
          const ey = n.y + (nodes[j].y - n.y) * progress;
          ctx.save();
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = color;
          ctx.beginPath();
          ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    });

    // Draw nodes
    nodes.forEach((n, i) => {
      const r = n.r * n.scale;
      const alpha = n.opacity * (i === hoveredIdx ? 1 : 0.88);
      drawGlowCircle(n.x, n.y, r, n.color, n.glow, alpha);
      drawLabel(n.x, n.y, r, n.name, n.color, n.labelOpacity);
    });

    // Draw ripples
    for (let ri = ripples.length - 1; ri >= 0; ri--) {
      const rp = ripples[ri];
      rp.life -= dt * 1.4;
      const scale = 1 - rp.life;
      const rr = rp.r + (rp.maxR - rp.r) * scale;

      ctx.save();
      ctx.globalAlpha = rp.life * 0.6;
      ctx.strokeStyle = rp.color;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = rp.color;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (rp.life <= 0) ripples.splice(ri, 1);
    }

    // Ambient subtle particle dots
    if (Math.random() < 0.02) {
      const px = Math.random() * W;
      const py = Math.random() * H;
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#00D4FF';
      ctx.beginPath();
      ctx.arc(px, py, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Init & Start ──────────────────────────────────────────
  function init() {
    if (initialized) return;
    initialized = true;

    resize();
    window.addEventListener('resize', () => {
      resize();
    }, { passive: true });

    lastTime = performance.now();
    render(lastTime);
  }

  // Start when canvas scrolls into view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        init();
        io.unobserve(canvas);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 300px 0px' });

  io.observe(canvas);

  // Fallback: start immediately if page loads with skills in view
  if (document.readyState === 'complete') {
    const rect = canvas.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200) init();
  } else {
    window.addEventListener('load', () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200) init();
    }, { once: true });
  }

})();
