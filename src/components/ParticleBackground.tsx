
'use client';
import React, { useEffect, useRef, useCallback } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = performance.now() * 0.00005;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sun
    const sunX = canvas.width / 2;
    const sunY = canvas.height * 0.45;
    const sunRadius = Math.min(canvas.width, canvas.height) * 0.2;

    const sunGradient = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.1, sunX, sunY, sunRadius);
    sunGradient.addColorStop(0, 'hsla(0, 100%, 100%, 0.8)');
    sunGradient.addColorStop(0.1, 'hsla(30, 100%, 70%, 0.6)');
    sunGradient.addColorStop(0.4, 'hsla(330, 90%, 60%, 0.3)');
    sunGradient.addColorStop(1, 'hsla(330, 90%, 60%, 0)');
    
    ctx.fillStyle = sunGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'hsl(var(--primary) / 0.3)';
    const perspective = canvas.width * 0.8;
    const projectionCenterY = canvas.height * 0.45;
    
    const numLines = 50;
    for (let i = 0; i <= numLines; i++) {
        const ratio = i / numLines;
        const y = projectionCenterY + ratio * (canvas.height - projectionCenterY);

        // horizontal lines
        const p = (y - projectionCenterY) / (canvas.height - projectionCenterY);
        const rowY = projectionCenterY + (y - projectionCenterY) * Math.pow(p, 2);
        
        ctx.beginPath();
        ctx.moveTo(0, rowY);
        ctx.lineTo(canvas.width, rowY);
        ctx.stroke();

        // vertical lines
        if(i < numLines) {
            const x = canvas.width/2 + (i - numLines/2) * 30 * Math.pow(1.5, p*5);
            const topY = projectionCenterY + (y - projectionCenterY) * Math.pow((i)/(numLines), 2)
            const bottomY = projectionCenterY + (y - projectionCenterY) * Math.pow((i+1)/(numLines), 2)
            
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(canvas.width/2 + (x-canvas.width/2) * 1.5, bottomY);
            ctx.stroke();

            const x2 = canvas.width/2 - (i - numLines/2) * 30 * Math.pow(1.5, p*5);
            ctx.beginPath();
            ctx.moveTo(x2, topY);
            ctx.lineTo(canvas.width/2 + (x2-canvas.width/2) * 1.5, bottomY);
            ctx.stroke();
        }
    }


  }, []);


  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx, canvas);

    animationFrameId.current = requestAnimationFrame(animate);
  }, [drawGrid]);


  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

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
