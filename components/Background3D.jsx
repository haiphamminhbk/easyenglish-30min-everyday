'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    let scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.001);

    let camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.z = 1000;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'low-power',
        precision: 'mediump',
        stencil: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
    } catch (err) {
      console.warn('WebGL initialization fallback:', err);
      return;
    }

    // Adaptive particle count based on device capability
    const particleCount = isMobile ? 350 : 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3000;

      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isMobile ? 5 : 6,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.3;
      mouseY = (event.clientY - windowHalfY) * 0.3;
    };

    let resizeTimeout = null;
    const onWindowResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!renderer || !camera) return;
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 100);
    };

    window.addEventListener('resize', onWindowResize, { passive: true });
    if (!isMobile) {
      document.addEventListener('mousemove', onDocumentMouseMove, { passive: true });
    }

    let animationFrameId = null;
    let isPaused = false;
    let lastRenderTime = 0;
    const TARGET_FPS_INTERVAL = 1000 / 60; // 60 FPS cap

    const animate = (currentTime) => {
      if (isPaused) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = currentTime - lastRenderTime;
      if (delta < TARGET_FPS_INTERVAL) return;
      lastRenderTime = currentTime - (delta % TARGET_FPS_INTERVAL);

      const rotSpeedX = prefersReducedMotion ? 0.00005 : 0.00015;
      const rotSpeedY = prefersReducedMotion ? 0.0001 : 0.00035;

      particles.rotation.x += rotSpeedX;
      particles.rotation.y += rotSpeedY;

      if (!isMobile) {
        camera.position.x += (mouseX - camera.position.x) * 0.035;
        camera.position.y += (-mouseY - camera.position.y) * 0.035;
      }
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };

    // Pause rendering when tab is inactive to save 100% CPU/battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        if (isPaused) {
          isPaused = false;
          lastRenderTime = performance.now();
          animate(performance.now());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial start
    lastRenderTime = performance.now();
    animate(performance.now());

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', onWindowResize);
      if (!isMobile) {
        document.removeEventListener('mousemove', onDocumentMouseMove);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      id="bgCanvas"
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none"
      style={{ contain: 'strict', transform: 'translateZ(0)' }}
    />
  );
}

