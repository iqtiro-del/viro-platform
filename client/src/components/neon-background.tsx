import { useEffect, useRef } from "react";

export function NeonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // SVG paths for floating icons (shield, box, layers, dollar, spark)
    const icons = [
      "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", // layers
      "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", // box
      "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", // dollar
      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", // shield
      "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" // spark
    ];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      path: Path2D;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 20 + 15;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.08 + 0.02;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
        
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        this.path = new Path2D(randomIcon);
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 24, this.size / 24);
        ctx.translate(-12, -12);
        ctx.strokeStyle = `rgba(168, 85, 247, ${this.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke(this.path);
        ctx.restore();
      }
    }

    let particles: Particle[] = [];
    const init = () => {
      particles = [];
      const numberOfParticles = Math.floor((width * height) / 50000);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Dynamic Animated Gradient Mesh */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, hsl(280 80% 60% / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 0%, hsl(195 80% 60% / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, hsl(240 80% 60% / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, hsl(330 80% 60% / 0.15) 0%, transparent 50%)
          `,
          animation: 'background-drift 60s ease-in-out infinite alternate',
        }}
      />
      
      {/* Canvas for Floating Icons */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-60"
        style={{ filter: "blur(0.3px)" }}
      />

      {/* Very Soft Floating Orbs */}
      <div 
        className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 dark:opacity-10"
        style={{
          background: 'radial-gradient(circle, hsl(280 70% 65% / 0.2) 0%, transparent 70%)',
          animation: 'slow-float 45s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 dark:opacity-10"
        style={{
          background: 'radial-gradient(circle, hsl(195 75% 60% / 0.2) 0%, transparent 70%)',
          animation: 'slow-float 50s ease-in-out infinite reverse',
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes background-drift {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes slow-float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -50px); }
          66% { transform: translate(-20px, 40px); }
        }
      `}} />
    </div>
  );
}
