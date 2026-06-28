/**
 * stars.js — Three.js persistent star field background
 * Gokul Universe Portfolio
 */

(function () {
  'use strict';

  const canvas = document.getElementById('star-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ── Setup ──────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.z = 800;

  // ── Particle count based on device ─────────────────────
  const isMobile = window.innerWidth < 768;
  const STAR_COUNT = isMobile ? 300 : 800;
  const NEBULA_COUNT = isMobile ? 40 : 120;

  // ── Star Geometry ───────────────────────────────────────
  function createStarField(count, spread, color, size) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.8;
      speeds[i] = 0.05 + Math.random() * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData.speeds = speeds;

    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });

    return new THREE.Points(geometry, material);
  }

  // Three layers of stars
  const stars1 = createStarField(Math.floor(STAR_COUNT * 0.6), 2400, 0xffffff, 1.2);
  const stars2 = createStarField(Math.floor(STAR_COUNT * 0.25), 1800, 0xaaddff, 1.5);
  const stars3 = createStarField(Math.floor(STAR_COUNT * 0.15), 1200, 0x00D4FF, 2.2);

  scene.add(stars1, stars2, stars3);

  // ── Nebula Dust ─────────────────────────────────────────
  function createNebulaDust(count, color, spread) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = spread * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3]     = r * Math.cos(theta) + (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = r * Math.sin(theta) + (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color,
      size: isMobile ? 3.5 : 5,
      transparent: true,
      opacity: 0.12,
      sizeAttenuation: true,
      depthWrite: false,
    });

    return new THREE.Points(geometry, material);
  }

  const nebula1 = createNebulaDust(NEBULA_COUNT, 0x7C3AED, 700);
  const nebula2 = createNebulaDust(NEBULA_COUNT, 0x00D4FF, 500);
  scene.add(nebula1, nebula2);

  // ── Shooting stars ──────────────────────────────────────
  const shootingStars = [];
  const SHOOTING_INTERVAL = 3500;

  function createShootingStar() {
    const geometry = new THREE.BufferGeometry();
    const len = 60 + Math.random() * 80;
    const positions = new Float32Array(6);

    const x = (Math.random() - 0.5) * 1600;
    const y = 200 + Math.random() * 400;
    const z = -200 + Math.random() * 200;

    positions[0] = x;         positions[1] = y;          positions[2] = z;
    positions[3] = x + len;   positions[4] = y - len * 0.4; positions[5] = z;

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });

    const line = new THREE.Line(geometry, material);
    line.userData.life = 0;
    line.userData.vx = -(3 + Math.random() * 3);
    line.userData.vy = -(1.5 + Math.random() * 2);
    scene.add(line);
    shootingStars.push(line);
  }

  // Trigger shooting stars
  setInterval(() => {
    if (Math.random() > 0.35) createShootingStar();
  }, SHOOTING_INTERVAL);

  // ── Mouse parallax ──────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── Scroll parallax ─────────────────────────────────────
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // ── Resize ──────────────────────────────────────────────
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onResize, { passive: true });
  onResize();

  // ── Animate ─────────────────────────────────────────────
  const clock = new THREE.Clock();
  let frameId;

  function animate() {
    frameId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // Smooth mouse parallax
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    // Camera sway
    camera.position.x = targetX * 30;
    camera.position.y = -targetY * 20;

    // Scroll-based z parallax
    const scrollFactor = scrollY * 0.08;
    stars1.position.z = scrollFactor * 0.3;
    stars2.position.z = scrollFactor * 0.15;
    nebula1.position.y = -scrollFactor * 0.05;

    // Slow rotation of star layers
    stars1.rotation.y = elapsed * 0.006;
    stars2.rotation.y = -elapsed * 0.004;
    stars3.rotation.z = elapsed * 0.003;
    nebula1.rotation.y = elapsed * 0.008;
    nebula2.rotation.y = -elapsed * 0.006;

    // Pulsing nebula opacity
    nebula1.material.opacity = 0.08 + Math.sin(elapsed * 0.5) * 0.04;
    nebula2.material.opacity = 0.10 + Math.cos(elapsed * 0.4) * 0.05;

    // Shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.userData.life += delta;

      s.position.x += s.userData.vx;
      s.position.y += s.userData.vy;
      s.material.opacity = Math.max(0, 0.9 - s.userData.life * 1.5);

      if (s.userData.life > 0.6) {
        scene.remove(s);
        s.geometry.dispose();
        s.material.dispose();
        shootingStars.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  // Pause when not visible (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else {
      animate();
    }
  });

})();
