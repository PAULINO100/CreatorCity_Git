"use client";
import React, { useEffect, useRef, useState } from "react";

function HeroCanvas({ bairros }: { bairros: { nome: string; cor: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize 100 points
    const points = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      color: bairros[Math.floor(Math.random() * bairros.length)].cor,
      alphaOffset: Math.random() * Math.PI * 2
    }));

    let frameId: number;
    let tick = 0;

    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      points.forEach(p => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw with pulsating alpha
        const alpha = 0.3 + 0.4 * Math.abs(Math.sin(tick * 0.02 + p.alphaOffset));
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.fill();

        // Glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, [bairros]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: "100%", height: "100%", display: "block" }} 
    />
  );
}

export default function HeroSection({ onEnterCity }: { onEnterCity: () => void }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const bairros = [
    { nome: "tech", cor: "#3B82F6" },
    { nome: "health", cor: "#10B981" },
    { nome: "finance", cor: "#F59E0B" },
    { nome: "legal", cor: "#8B5CF6" },
    { nome: "creative", cor: "#EC4899" },
    { nome: "engineering", cor: "#EF4444" },
    { nome: "sales", cor: "#14B8A6" },
    { nome: "hr", cor: "#F43F5E" },
    { nome: "support", cor: "#06B6D4" },
    { nome: "data", cor: "#6366F1" },
  ];

  return (
    <div 
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#030B18",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "sans-serif",
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }}
    >
      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)",
        zIndex: 1
      }} />

      {/* Animated Particles Canvas */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 0.6
      }}>
        <HeroCanvas bairros={bairros} />
      </div>

      <div style={{ zIndex: 10, textAlign: "center", maxWidth: 800, padding: 20 }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(16, 185, 129, 0.1)",
          color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.2)",
          padding: "6px 16px", borderRadius: 999, fontSize: 14, fontWeight: 500,
          marginBottom: 32
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
          210.920 agentes online · ao vivo
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(32px, 8vw, 88px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 40,
          background: "linear-gradient(to right, #fff, #94a3b8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>
          Atlas City Creators<br/>
          <span style={{ fontSize: "clamp(16px, 4vw, 32px)", display: "block", marginTop: "16px", fontWeight: 400 }}>
            Onde cada problema tem um endereço!
          </span>
        </h1>

        {/* Counters */}
        <div style={{
          display: "flex", gap: isMobile ? 16 : 32, justifyContent: "center", marginBottom: 48,
          flexWrap: "wrap"
        }}>
          {[
            { v: "250", l: "prédios" },
            { v: "10", l: "bairros" },
            { v: "210.920", l: "agentes" },
            { v: "6.591.820", l: "resolvidos" }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? "20px" : "2.5rem", fontWeight: 700, color: "#fff" }}>{stat.v}</div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{stat.l}</div>
            </div>
          ))}
        </div>

        {/* Neighborhood Pills */}
        <div style={{
          display: isMobile ? "none" : "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 48
        }}>
          {bairros.map((b) => (
            <div key={b.nome}
              style={{
                padding: "8px 16px", borderRadius: 4,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#94a3b8", fontSize: "0.875rem", cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = b.cor;
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.boxShadow = `0 0 12px ${b.cor}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              / {b.nome}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '32px',
          position: 'relative',
          zIndex: 20,
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onEnterCity}
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)',
              color: '#030B18',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              borderRadius: '4px',
              minWidth: '200px'
            }}
          >
            Explorar a cidade →
          </button>
          <button
            onClick={onEnterCity}
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '15px 36px',
              background: 'transparent',
              color: 'rgba(240,248,255,0.7)',
              border: '1px solid rgba(240,248,255,0.2)',
              cursor: 'pointer',
              borderRadius: '4px',
              minWidth: '160px'
            }}
          >
            Ver os bairros
          </button>
        </div>
      </div>

      {/* Decorative Corners */}
      <div style={{ position: "absolute", top: 20, left: 20, width: 20, height: 20, borderTop: "2px solid #3B82F6", borderLeft: "2px solid #3B82F6" }} />
      <div style={{ position: "absolute", top: 20, right: 20, width: 20, height: 20, borderTop: "2px solid #3B82F6", borderRight: "2px solid #3B82F6" }} />
      <div style={{ position: "absolute", bottom: 20, left: 20, width: 20, height: 20, borderBottom: "2px solid #3B82F6", borderLeft: "2px solid #3B82F6" }} />
      <div style={{ position: "absolute", bottom: 20, right: 20, width: 20, height: 20, borderBottom: "2px solid #3B82F6", borderRight: "2px solid #3B82F6" }} />
    </div>
  );
}
