'use client';
import React, { useEffect, useRef, useCallback } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const animationFrameId = useRef<number>();

  const createParticles = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const particlesArray = [];
    const numberOfParticles = 50;
    const canvasArea = canvas.width * canvas.height;
    const particleDensity = numberOfParticles / (1920 * 1080); // baseline density
    const adjustedParticles = Math.floor(canvasArea * particleDensity);


    for (let i = 0; i < adjustedParticles; i++) {
      particlesArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: Math.random() * 0.6 - 0.3,
        speedY: Math.random() * 0.6 - 0.3,
      });
    }
    particlesRef.current = particlesArray;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const particles = particlesRef.current;
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x > canvas.width || p.x < 0) p.speedX *= -1;
      if (p.y > canvas.height || p.y < 0) p.speedY *= -1;

      ctx.fillStyle = 'hsla(var(--primary) / 0.5)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    animationFrameId.current = requestAnimationFrame(animate);
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles(canvas);
    }
  }, [createParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      handleResize();
      animate();
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleResize, animate]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};
