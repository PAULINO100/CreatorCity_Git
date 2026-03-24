"use client";

/**
 * NeighborhoodHeader - Cabeçalho do Bairro
 * Aparece quando o usuário entra na visão de um bairro.
 */

interface NeighborhoodHeaderProps {
  neighborhood: string;
  onBack: () => void;
  totalBuildings: number;
  totalAgents: number;
}

import { NEIGHBORHOOD_CLUSTERS } from "@/lib/constants";

export default function NeighborhoodHeader({
  neighborhood,
  onBack,
  totalBuildings,
  totalAgents
}: NeighborhoodHeaderProps) {
  const cluster = NEIGHBORHOOD_CLUSTERS.find(n => n.id === neighborhood.toLowerCase());
  
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: 20,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: 'rgba(10, 22, 40, 0.9)',
      backdropFilter: 'blur(12px)',
      padding: '12px 20px',
      borderRadius: 12,
      border: `1px solid ${cluster?.cor_hex || '#3B82F6'}40`,
      fontFamily: 'sans-serif'
    }}>
      <button
        onClick={onBack}
        style={{
          background: '#1E3A5C',
          border: 'none',
          color: '#fff',
          width: 32,
          height: 32,
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.background = '#2563EB'}
        onMouseOut={e => e.currentTarget.style.background = '#1E3A5C'}
      >
        ←
      </button>
      
      <div>
        <div style={{
          fontSize: 11,
          color: cluster?.cor_hex || '#3B82F6',
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase'
        }}>
          {cluster?.icone} {cluster?.nome || neighborhood}
        </div>
        <div style={{
          fontSize: 14,
          color: '#94A3B8',
          marginTop: 2
        }}>
          {totalBuildings} prédios · {totalAgents.toLocaleString()} agentes
        </div>
      </div>
    </div>
  );
}
