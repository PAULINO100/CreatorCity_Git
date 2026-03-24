"use client";
import { MACRO_VIEW_BUILDINGS } from "@/lib/constants";

type ViewMode = 'MACRO' | 'NEIGHBORHOOD' | 'BUILDING_DETAIL';

interface MacroNavigationHeaderProps {
  mode: ViewMode;
  activeNeighborhood: string | null;
  onBack: () => void;
}

export default function MacroNavigationHeader({
  mode, activeNeighborhood, onBack
}: MacroNavigationHeaderProps) {
  if (mode === 'MACRO') return null;
  
  const macro = MACRO_VIEW_BUILDINGS.find(m => m.bairro === activeNeighborhood);
  
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: 20,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: 'rgba(10, 22, 40, 0.95)',
      backdropFilter: 'blur(12px)',
      padding: '12px 20px',
      borderRadius: 12,
      border: `1px solid ${macro?.cor_hex || '#3B82F6'}40`
    }}>
      <button
        onClick={onBack}
        style={{
          background: '#1E3A5C',
          border: 'none',
          color: '#fff',
          width: 36,
          height: 36,
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ←
      </button>
      
      <div>
        <div style={{
          fontSize: 11,
          color: macro?.cor_hex || '#3B82F6',
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase'
        }}>
          {macro?.icone} {activeNeighborhood?.toUpperCase()}
        </div>
        <div style={{
          fontSize: 13,
          color: '#E2E8F0',
          marginTop: 2
        }}>
          {mode === 'NEIGHBORHOOD' 
            ? `${macro?.totalPredios} prédios · ${macro?.totalAgentes.toLocaleString()} agentes`
            : 'Selecione uma especialidade abaixo'
          }
        </div>
      </div>
    </div>
  );
}
