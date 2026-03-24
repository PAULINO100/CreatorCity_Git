"use client";
import { useState, useEffect } from "react";
interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  totalPredios: number;
  totalAgentes: number;
}

export default function SearchBar({ value, onChange, totalPredios, totalAgentes }: SearchBarProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{
      position: "fixed", top: isMobile ? 12 : 20, left: "50%",
      transform: "translateX(-50%)", zIndex: 50,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      width: isMobile ? "calc(100vw - 80px)" : "auto"
    }}>
      <div style={{
        display: "flex", gap: 8,
        background: "rgba(10,22,40,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid #1E3A5C",
        borderRadius: 12, padding: "6px 6px 6px 14px",
        width: isMobile ? "100%" : "min(480px, 90vw)"
      }}>
        <span style={{ color: "#475569", fontSize: 16, alignSelf: "center" }}>🔍</span>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Buscar especialidade, bairro ou prédio..."
          style={{
            background: "none", border: "none", color: "#fff",
            fontSize: isMobile ? 14 : 14, flex: 1, outline: "none",
            padding: "6px 0"
          }}
        />
        {value && (
          <button onClick={() => onChange("")} style={{
            background: "#1E3A5C", border: "none", color: "#94A3B8",
            borderRadius: 8, padding: "4px 10px", cursor: "pointer",
            fontSize: 13
          }}>limpar</button>
        )}
      </div>
      <div style={{
        fontSize: 11, color: "#334155",
        background: "rgba(10,22,40,0.6)",
        padding: "3px 12px", borderRadius: 20
      }}>
        {totalPredios} prédios · {totalAgentes.toLocaleString()} agentes ativos
      </div>
    </div>
  );
}
