"use client";
import { useState, useCallback, useEffect } from "react";
import CityMap, { ViewState, ViewMode } from "@/components/CityMap";
import SearchBar from "@/components/SearchBar";
import NeighborhoodFilter from "@/components/NeighborhoodFilter";
import BuildingCard from "@/components/BuildingCard";
import AgentChat from "@/components/AgentChat";
import MacroNavigationHeader from "@/components/MacroNavigationHeader";
import HeroSection from "@/components/HeroSection";
import { MACRO_VIEW_BUILDINGS } from "@/lib/constants";

interface Building {
  id: string;
  nome: string;
  bairro: string;
  cor: string;
  cor_claro: string;
  posicao: { x: number; y: number };
  andares: number;
  nivel: number;
  especialidades: string[];
  agentes_ativos: number;
  problemas_resolvidos: number;
  status: string;
}

export default function Home() {
  const [showHero, setShowHero] = useState(true);
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'MACRO',
    activeNeighborhood: null,
    selectedBuilding: null,
    camera: { x: 0, y: 0, zoom: 0.5 }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState("");

  const enterCity = () => setShowHero(false);

  const enterNeighborhood = useCallback((neighborhoodId: string) => {
    // neighborhoodId pode vir como 'macro_saude' ou 'saude'
    const cleanId = neighborhoodId.startsWith('macro_') ? neighborhoodId.replace('macro_', '') : neighborhoodId;
    const macro = MACRO_VIEW_BUILDINGS.find(m => 
      m.id.toLowerCase() === neighborhoodId.toLowerCase() || 
      m.bairro.toLowerCase() === cleanId.toLowerCase()
    );
    if (!macro) return;
    
    setViewState({
      mode: 'NEIGHBORHOOD',
      activeNeighborhood: macro.bairro,
      selectedBuilding: null,
      camera: { 
        x: -(macro.posicao.x - 1000), 
        y: -(macro.posicao.y - 800), 
        zoom: 0.9 
      }
    });
  }, []);

  const viewBuildingDetails = useCallback((building: any) => {
    setViewState(prev => ({
      ...prev,
      mode: 'BUILDING_DETAIL',
      selectedBuilding: building
    }));
  }, []);

  const goBackToMacro = useCallback(() => {
    const isMob = typeof window !== "undefined" && window.innerWidth < 768;
    setViewState({
      mode: 'MACRO',
      activeNeighborhood: null,
      selectedBuilding: null,
      camera: { 
        x: 0, 
        y: isMob ? 60 : (window.innerHeight * 0.05) + 60, 
        zoom: isMob ? 0.4 : 0.5 
      }
    });
  }, []);

  const goBackToNeighborhood = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      mode: 'NEIGHBORHOOD',
      selectedBuilding: null
    }));
  }, []);

  const handleOpenChat = (query: string) => {
    setChatInitialQuery(query);
    setIsChatOpen(true);
  };

  if (showHero) {
    return <HeroSection onEnterCity={enterCity} />;
  }

  return (
    <main style={{ width: "100%", height: "100vh", position: "relative", backgroundColor: "#060E1A", overflow: "hidden" }}>
      {/* City Map */}
      <CityMap 
        viewState={viewState}
        onViewStateChange={setViewState}
        onEnterNeighborhood={enterNeighborhood}
        onViewBuildingDetails={viewBuildingDetails}
        onBackToMacro={goBackToMacro}
        onBackToNeighborhood={goBackToNeighborhood}
        onBuildingSelect={viewBuildingDetails}
        searchTerm={searchTerm}
        activeNeighborhood={viewState.activeNeighborhood}
      />

      {/* Header e Navegação */}
      <MacroNavigationHeader 
        mode={viewState.mode}
        activeNeighborhood={viewState.activeNeighborhood}
        onBack={viewState.mode === 'NEIGHBORHOOD' ? goBackToMacro : goBackToNeighborhood}
      />

      {/* Interface overlay */}
      <div style={{ pointerEvents: "none", position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column" }}>
        {/* Top Header */}
        {viewState.mode === 'MACRO' && (
          <header style={{ pointerEvents: "auto", padding: "20px 24px", background: "linear-gradient(to bottom, rgba(6,14,26,0.9), transparent)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
                ATLAS <span style={{ color: "#3B82F6" }}>CITY</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>
              cidade de agentes especialistas
            </div>
          </header>
        )}

        <div style={{ flex: 1 }} />
      </div>

      {viewState.mode !== 'MACRO' && (
        <>
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            totalPredios={250}
            totalAgentes={210920}
          />
          
          <NeighborhoodFilter 
            active={viewState.activeNeighborhood}
            onChange={(n) => {
              if (n) enterNeighborhood(n);
              else goBackToMacro();
            }}
            viewMode="NEIGHBORHOOD"
            onViewModeChange={() => goBackToMacro()}
          />
        </>
      )}

      {/* Detalhes do Prédio */}
      {viewState.selectedBuilding && viewState.mode === 'BUILDING_DETAIL' && (
        <BuildingCard 
          building={viewState.selectedBuilding} 
          onClose={goBackToNeighborhood}
          onChat={handleOpenChat}
          onBack={goBackToNeighborhood}
        />
      )}

      {/* Chat com Agente */}
      {isChatOpen && viewState.selectedBuilding && (
        <AgentChat 
          especialidade={chatInitialQuery}
          especialidades={viewState.selectedBuilding.especialidades}
          bairro={viewState.selectedBuilding.bairro}
          predio={viewState.selectedBuilding.nome}
          cor={viewState.selectedBuilding.cor}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Footer Info */}
      <div style={{
        position: "fixed",
        bottom: viewState.mode === 'BUILDING_DETAIL' ? -100 : 20, 
        right: 20,
        fontSize: 11, color: "rgba(30, 58, 92, 0.5)",
        fontFamily: "sans-serif",
        textAlign: "right",
        transition: "bottom 0.3s",
        zIndex: 5
      }}>
        <div>🖱 arrastar para mover · scroll para zoom · clique para abrir</div>
      </div>
    </main>
  );
}
