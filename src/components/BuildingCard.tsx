"use client";
import { useState, useEffect } from "react";

interface Building {
  id: string;
  nome: string;
  bairro: string;
  cor: string;
  cor_claro: string;
  andares: number;
  nivel: number;
  especialidades: string[];
  agentes_ativos: number;
  problemas_resolvidos: number;
}

interface BuildingCardProps {
  building: Building;
  onClose: () => void;
  onChat: (especialidade: string, especialidades: string[]) => void;
  onBack: () => void;
}

export default function BuildingCard({ building, onClose, onChat, onBack }: BuildingCardProps) {
  const [selectedEsp, setSelectedEsp] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSelectedEsp(null);
  }, [building.id]);

  const nivelLabel = ["", "Iniciante", "Avançado", "Especialista"][building.nivel];
  const nivelColor = ["", "#D97706", "#2563EB", "#059669"][building.nivel];

  return (
    <div style={{
      position: "fixed",
      bottom: isMobile ? 0 : 24,
      left: isMobile ? 0 : "auto",
      right: isMobile ? 0 : 24,
      width: isMobile ? "100%" : 320,
      height: isMobile ? "55vh" : "auto",
      overflowY: isMobile ? "auto" : "visible",
      background: "#0F1F36",
      border: `1px solid ${building.cor}44`,
      borderRadius: isMobile ? "20px 20px 0 0" : 16,
      padding: "20px 22px",
      zIndex: 100,
      color: "#fff",
      fontFamily: "sans-serif",
      boxShadow: `0 0 40px ${building.cor}22`,
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 12,
          right: 50, // Beside close button
          background: 'rgba(30, 58, 92, 0.4)',
          border: 'none',
          color: '#94A3B8',
          width: 28,
          height: 28,
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 58, 92, 0.8)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 58, 92, 0.4)'}
      >
        ←
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{
            fontSize: 11, color: building.cor, fontWeight: 700,
            letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4
          }}>
            {building.bairro}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
            {building.nome}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#475569",
          cursor: "pointer", fontSize: 20, padding: 0,
          alignSelf: "flex-start"
        }}>×</button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, padding: "10px 0",
        borderTop: `1px solid #1E3A5C`, borderBottom: `1px solid #1E3A5C` }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 600 }}>{building.andares}</div>
          <div style={{ fontSize: 10, color: "#64748B" }}>andares</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 600 }}>
            {(building.agentes_ativos).toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "#64748B" }}>agentes</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 600 }}>
            {(building.problemas_resolvidos / 1000).toFixed(0)}k
          </div>
          <div style={{ fontSize: 10, color: "#64748B" }}>resolvidos</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: nivelColor,
            background: nivelColor + "22", padding: "3px 8px",
            borderRadius: 6, marginTop: 2
          }}>
            {nivelLabel}
          </div>
          <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>nível</div>
        </div>
      </div>

      {/* Especialidades */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8,
          textTransform: "uppercase", letterSpacing: 1 }}>
          Escolha uma especialidade
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {building.especialidades.map(esp => (
            <button
              key={esp}
              onClick={() => setSelectedEsp(esp)}
              style={{
                fontSize: isMobile ? 10 : 11, padding: isMobile ? "4px 8px" : "5px 10px",
                borderRadius: 20, cursor: "pointer",
                border: `1px solid ${selectedEsp === esp ? building.cor : "#1E3A5C"}`,
                background: selectedEsp === esp ? building.cor + "33" : "transparent",
                color: selectedEsp === esp ? building.cor : "#94A3B8",
                transition: "all 0.15s",
              }}
            >
              {esp}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => selectedEsp && onChat(selectedEsp, building.especialidades)}
        disabled={!selectedEsp}
        style={{
          width: "100%", padding: isMobile ? "14px 0" : "12px 0",
          background: selectedEsp ? building.cor : "#1E3A5C",
          color: "#fff", border: "none", borderRadius: 10,
          fontSize: isMobile ? 13 : 14, fontWeight: 600, cursor: selectedEsp ? "pointer" : "not-allowed",
          opacity: selectedEsp ? 1 : 0.5,
          transition: "all 0.2s",
        }}
      >
        {selectedEsp ? `Falar com especialista em ${selectedEsp}` : "Selecione uma especialidade"}
      </button>
    </div>
  );
}
