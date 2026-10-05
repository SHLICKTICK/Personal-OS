import React, { useEffect, useRef } from 'react';

interface WireframeSphereProps {
  className?: string;
  size?: number;
}

export const WireframeSphere: React.FC<WireframeSphereProps> = ({
  className = '',
  size = 280,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const radius = size * 0.42;
    const centerX = size / 2;
    const centerY = size / 2;

    const numLat = 10;
    const numLon = 14;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Radial background glow
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.1,
        centerX,
        centerY,
        radius * 1.2
      );
      bgGrad.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
      bgGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.05)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim subtle glow
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      angle += 0.005;

      // Draw Longitude rings (rotating)
      for (let i = 0; i < numLon; i++) {
        const phi = (i * Math.PI) / numLon + angle;
        const width = Math.cos(phi) * radius;
        const opacity = Math.max(0.1, Math.abs(Math.sin(phi)) * 0.45);

        ctx.strokeStyle = `rgba(245, 158, 11, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.abs(width), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Latitude rings
      for (let i = 1; i < numLat; i++) {
        const theta = (i * Math.PI) / numLat;
        const y = centerY - Math.cos(theta) * radius;
        const rLat = Math.sin(theta) * radius;
        const opacity = Math.sin(theta) * 0.35 + 0.1;

        ctx.strokeStyle = `rgba(245, 158, 11, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(centerX, y, rLat, rLat * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Glowing golden vertex nodes
      const points = [
        { lat: 0.3, lon: 0.4 },
        { lat: -0.2, lon: 0.8 },
        { lat: 0.5, lon: -0.6 },
        { lat: -0.4, lon: -0.3 },
        { lat: 0.1, lon: 1.2 },
        { lat: 0.7, lon: 0.1 },
        { lat: -0.6, lon: 0.5 },
      ];

      for (const p of points) {
        const curLon = p.lon + angle;
        const z = Math.cos(curLon) * Math.cos(p.lat);
        if (z > 0) {
          const px = centerX + Math.sin(curLon) * radius * Math.cos(p.lat);
          const py = centerY - Math.sin(p.lat) * radius;

          ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Particle halo
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={`pointer-events-none select-none opacity-90 ${className}`}
    />
  );
};
