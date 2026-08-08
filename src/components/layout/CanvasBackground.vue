<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

interface TargetRing {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
  pulseAmount: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

let animationFrameId: number | null = null;
let lastTime = 0;
const fpsInterval = 1000 / 30; // Max 30 FPS

let particles: Particle[] = [];
let targetRings: TargetRing[] = [];
let width = 0;
let height = 0;
let isReducedMotion = false;
let isMobile = false;
let resizeObserver: ResizeObserver | null = null;
let isPageVisible = true;

// Initialize components depending on screen size
const initScene = (w: number, h: number) => {
  width = w;
  height = h;
  isMobile = w < 768;
  isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Clear existing arrays
  particles = [];
  targetRings = [];

  if (isReducedMotion) {
    // Minimal static elements
    const count = isMobile ? 5 : 15;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        radius: Math.random() * 2 + 1,
      });
    }

    targetRings.push({
      x: w * 0.3,
      y: h * 0.4,
      vx: 0,
      vy: 0,
      baseRadius: isMobile ? 60 : 100,
      pulsePhase: 0,
      pulseSpeed: 0,
      pulseAmount: 0,
    });
    return;
  }

  // Generate dynamic particles
  const particleCount = isMobile ? 12 : 40;
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.15 + 0.05; // slow drift
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 2.5 + 1,
    });
  }

  // Generate moving target rings
  const ringCount = isMobile ? 1 : 3;
  for (let i = 0; i < ringCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.05 + 0.02; // very slow drift
    targetRings.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      baseRadius: Math.random() * 50 + 60,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.01 + 0.005,
      pulseAmount: Math.random() * 10 + 5,
    });
  }
};

const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.strokeStyle = 'rgba(22, 163, 74, 0.04)'; // subtle green coordinate lines
  ctx.lineWidth = 1;

  const gridSize = 100;

  // Draw vertical lines
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();

    // Technical coordinates or indicators
    if (x > 0 && x % 200 === 0 && !isMobile) {
      ctx.fillStyle = 'rgba(22, 163, 74, 0.08)';
      ctx.font = '9px monospace';
      ctx.fillText(`X:${x}`, x + 5, 15);
    }
  }

  // Draw horizontal lines
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();

    if (y > 0 && y % 200 === 0 && !isMobile) {
      ctx.fillStyle = 'rgba(22, 163, 74, 0.08)';
      ctx.font = '9px monospace';
      ctx.fillText(`Y:${y}`, 5, y - 5);
    }
  }

  // Draw technical target crosshair plus marks at intersections
  ctx.strokeStyle = 'rgba(22, 163, 74, 0.08)';
  const plusSize = 4;
  for (let x = gridSize; x < w; x += gridSize * 2) {
    for (let y = gridSize; y < h; y += gridSize * 2) {
      ctx.beginPath();
      // Horizontal bar
      ctx.moveTo(x - plusSize, y);
      ctx.lineTo(x + plusSize, y);
      // Vertical bar
      ctx.moveTo(x, y - plusSize);
      ctx.lineTo(x, y + plusSize);
      ctx.stroke();
    }
  }
};

const drawTargetRings = (ctx: CanvasRenderingContext2D) => {
  targetRings.forEach((ring) => {
    // Pulse calculation
    let currentRadius = ring.baseRadius;
    if (!isReducedMotion) {
      ring.pulsePhase += ring.pulseSpeed;
      currentRadius = ring.baseRadius + Math.sin(ring.pulsePhase) * ring.pulseAmount;
    }

    // Concentric circles
    ctx.strokeStyle = 'rgba(22, 163, 74, 0.05)';
    ctx.lineWidth = 1;

    // Outer circle
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Middle circle with dashed stroke
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.arc(ring.x, ring.y, currentRadius * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner circle
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, currentRadius * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair lines inside target ring
    const crossHairSize = currentRadius * 1.1;
    ctx.strokeStyle = 'rgba(22, 163, 74, 0.03)';
    ctx.beginPath();
    ctx.moveTo(ring.x - crossHairSize, ring.y);
    ctx.lineTo(ring.x + crossHairSize, ring.y);
    ctx.moveTo(ring.x, ring.y - crossHairSize);
    ctx.lineTo(ring.x, ring.y + crossHairSize);
    ctx.stroke();

    // Little center dot
    ctx.fillStyle = 'rgba(22, 163, 74, 0.15)';
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

const drawParticles = (ctx: CanvasRenderingContext2D) => {
  // Draw connecting lines first
  ctx.strokeStyle = 'rgba(22, 163, 74, 0.025)';
  ctx.lineWidth = 0.75;
  const connectionDistance = isMobile ? 100 : 150;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectionDistance) {
        // Opacity drops as distance increases
        const opacityRatio = 1 - dist / connectionDistance;
        ctx.strokeStyle = `rgba(22, 163, 74, ${0.05 * opacityRatio})`;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw technical dots
  particles.forEach((p) => {
    ctx.fillStyle = 'rgba(22, 163, 74, 0.09)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer subtle ring for some particles to make them look technical
    if (p.radius > 2 && !isMobile) {
      ctx.strokeStyle = 'rgba(22, 163, 74, 0.04)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
};

const updateEntities = () => {
  if (isReducedMotion) return;

  // Update particles position
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    // Bounce off edges
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    // Constrain within borders slightly
    p.x = Math.max(0, Math.min(width, p.x));
    p.y = Math.max(0, Math.min(height, p.y));
  });

  // Update target rings position
  targetRings.forEach((ring) => {
    ring.x += ring.vx;
    ring.y += ring.vy;

    if (ring.x < -50 || ring.x > width + 50) ring.vx *= -1;
    if (ring.y < -50 || ring.y > height + 50) ring.vy *= -1;
  });
};

const animate = (timestamp: number) => {
  if (!isPageVisible) {
    animationFrameId = requestAnimationFrame(animate);
    return;
  }

  animationFrameId = requestAnimationFrame(animate);

  const elapsed = timestamp - lastTime;

  // Throttle to 30 FPS
  if (elapsed >= fpsInterval) {
    lastTime = timestamp - (elapsed % fpsInterval);

    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with light gray/white color matching template bg-shell-bg
    ctx.fillStyle = '#f8faf9';
    ctx.fillRect(0, 0, width, height);

    // Update positions
    updateEntities();

    // Render layers
    drawGrid(ctx, width, height);
    drawTargetRings(ctx);
    drawParticles(ctx);
  }
};

const handleVisibilityChange = () => {
  isPageVisible = document.visibilityState === 'visible';
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Setup ResizeObserver for responsive canvas sizing and devicePixelRatio support
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width: boxWidth, height: boxHeight } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = boxWidth * dpr;
      canvas.height = boxHeight * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      initScene(boxWidth, boxHeight);
    }
  });

  // Observe parent/body element or window resize
  const parent = canvas.parentElement || document.body;
  resizeObserver.observe(parent);

  // Setup Page Visibility API to pause animation when tab is hidden
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Start the animation loop
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(animate);
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 w-screen h-screen pointer-events-none"
    style="z-index: 0; opacity: 0.85;"
  />
</template>

<style scoped>
canvas {
  background-color: #f8faf9;
}
</style>
