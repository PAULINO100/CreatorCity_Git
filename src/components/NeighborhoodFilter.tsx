"use client";
import { useState, useEffect } from "react";
const BAIRROS_CONFIG: Record<string, { cor: string; emoji: string }> = {
  "Tecnologia": { cor: "#2563EB", emoji: "💻" },
  "Engenharia": { cor: "#DC2626", emoji: "⚙️" },
  "Saúde": { cor: "#059669", emoji: "🏥" },
  "Direito": { cor: "#7C3AED", emoji: "⚖️" },
  "Educação": { cor: "#D97706", emoji: "📚" },
  "Negócios": { cor: "#0891B2", emoji: "💼" },
  "Construção": { cor: "#92400E", emoji: "🏗️" },
  "Agro": { cor: "#4D7C0F", emoji: "🌾" },
  "Arte": { cor: "#BE185D", emoji: "🎨" },
  "Ciência": { cor: "#6D28D9", emoji: "🔬" },
};

interface NeighborhoodFilterProps {
  active: string | null;
  onChange: (bairro: string | null) => void;
  viewMode: 'CITY' | 'NEIGHBORHOOD';
  onViewModeChange: (mode: 'CITY' | 'NEIGHBORHOOD') => void;
}

export default function NeighborhoodFilter({ active, onChange, viewMode, onViewModeChange }: NeighborhoodFilterProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{
      position: "fixed", 
      left: isMobile ? 0 : 16, 
      top: isMobile ? "auto" : "50%",
      bottom: isMobile ? 0 : "auto",
      right: isMobile ? 0 : "auto",
      transform: isMobile ? "none" : "translateY(-50%)",
      zIndex: 50, 
      display: "flex",
      flexDirection: isMobile ? "row" : "column", 
      gap: 6,
      height: isMobile ? 56 : "auto",
      overflowX: isMobile ? "auto" : "visible",
      padding: isMobile ? "8px 12px" : 0,
      background: isMobile ? "rgba(10,22,40,0.95)" : "transparent",
      backdropFilter: isMobile ? "blur(12px)" : "none"
    }}>
      <button
        onClick={() => onChange(null)}
        style={{
          background: active === null ? "#FFFFFF22" : "rgba(10,22,40,0.8)",
          border: active === null ? "1px solid #fff" : "1px solid #1E3A5C",
          color: "#fff", borderRadius: 8, padding: "6px 10px",
          cursor: "pointer", fontSize: 11, fontWeight: 600
        }}
        data-neighborhood-filter="true"
      >
        Todos
      </button>
      {Object.entries(BAIRROS_CONFIG).map(([nome, config]) => (
        <button
          key={nome}
          onClick={() => {
            if (viewMode === 'CITY') {
              onChange(nome);
              onViewModeChange('NEIGHBORHOOD');
            } else {
              onChange(active === nome ? null : nome);
            }
          }}
          title={nome}
          style={{
            background: active === nome ? config.cor + "33" : "rgba(10,22,40,0.8)",
            border: `1px solid ${active === nome ? config.cor : "#1E3A5C"}`,
            color: active === nome ? config.cor : "#64748B",
            borderRadius: 8, padding: "6px 10px",
            cursor: "pointer", fontSize: 13,
            transition: "all 0.15s",
            backdropFilter: "blur(8px)",
            minWidth: isMobile ? 44 : "auto",
            height: isMobile ? 40 : "auto",
            flexShrink: 0
          }}
        >
          {config.emoji}
        </button>
      ))}
    </div>
  );
}
