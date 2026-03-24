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
import { findSearchMatch, normalizeTerm } from "@/lib/search/district-search-mapping";

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

  const [cityData, setCityData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHighlightId, setSearchHighlightId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState("");

  useEffect(() => {
    fetch("/atlas_city_buildings.json")
      .then(r => r.json())
      .then(data => setCityData(data));
  }, []);

  const enterCity = () => setShowHero(false);

  const enterNeighborhood = useCallback((neighborhoodId: string) => {
    const cleanId = neighborhoodId.startsWith('macro_') ? neighborhoodId.replace('macro_', '') : neighborhoodId;
    const macro = MACRO_VIEW_BUILDINGS.find(m => 
      m.id.toLowerCase() === neighborhoodId.toLowerCase() || 
      m.bairro.toLowerCase() === cleanId.toLowerCase()
    );
    if (!macro) return;

    const isMob = typeof window !== "undefined" && window.innerWidth < 768;

    // Centróides REAIS de cada bairro (média das posições dos prédios no JSON).
    const BAIRRO_CENTERS: Record<string, { x: number; y: number }> = {
      'Tecnologia':  { x: 415,  y: 366  },
      'Engenharia':  { x: 1181, y: 420  },
      'Saúde':       { x: 393,  y: 1190 },
      'Direito':     { x: 1203, y: 1154 },
      'Educação':    { x: 792,  y: 794  },
      'Negócios':    { x: 1602, y: 796  },
      'Construção':  { x: 407,  y: 1813 },
      'Agro':        { x: 1182, y: 1802 },
      'Arte':        { x: 1790, y: 1392 },
      'Ciência':     { x: 1803, y: 432  },
    };

    const center = BAIRRO_CENTERS[macro.bairro] ?? { x: macro.posicao.x, y: macro.posicao.y };
    const zoom = isMob ? 0.55 : 0.65;

    // Fórmula correta: a câmera é aplicada ANTES do scale(zoom), então deve-se multiplicar pelo zoom.
    // ctx.translate(W/2 + cam.x*dpr) → ctx.scale(zoom*dpr) → ctx.translate(-1000,-800)
    // Para centralizar mundo ponto (cx, cy): cam.x = -(cx - 1000) * zoom, idem Y.
    const camX = -(center.x - 1000) * zoom;
    const camY = -(center.y - 800) * zoom + (isMob ? -150 : 0);

    setViewState({
      mode: 'NEIGHBORHOOD',
      activeNeighborhood: macro.bairro,
      selectedBuilding: null,
      camera: { x: camX, y: camY, zoom }
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
        // Centro do novo layout compacto (bairros entre x:700-1550, y:650-1550)
        // Centro worldX≈1125, worldY≈1100 → offset = -(worldX - 1000) = -125, -(worldY - 800) = -300
        x: isMob ? -80 : -100, 
        y: isMob ? -120 : -200, 
        zoom: isMob ? 0.28 : 0.42
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

  // ─── Phase 21G-SMARTSEARCH: Upgraded Search Handler ───────────────────────
  useEffect(() => {
    if (!searchTerm || !cityData) return;
    
    const handler = setTimeout(() => {
      const term = normalizeTerm(searchTerm);
      if (term.length < 3) return;

      // STEP 1 — Direct neighborhood name match (highest priority)
      const nMatch = MACRO_VIEW_BUILDINGS.find(m =>
        normalizeTerm(m.nome) === term ||
        normalizeTerm(m.bairro) === term ||
        normalizeTerm(m.id.replace('macro_', '')) === term
      );
      if (nMatch) {
        enterNeighborhood(nMatch.id);
        setSearchTerm("");
        setSearchHighlightId(null);
        return;
      }

      // STEP 2 — Smart mapping match (synonyms + priority)
      const mapping = findSearchMatch(searchTerm);
      if (mapping) {
        const buildings = Object.values(cityData.predios) as any[];
        let targetBuilding: any = null;

        // Try specific specialty match within target district first
        if (mapping.targetSpecialty) {
          const specNorm = normalizeTerm(mapping.targetSpecialty);
          targetBuilding = buildings.find(b =>
            normalizeTerm(b.bairro) === normalizeTerm(mapping.targetDistrict) &&
            b.especialidades.some((e: string) => normalizeTerm(e).includes(specNorm))
          );
        }

        // Try any building in the target district if no specialty match
        if (!targetBuilding) {
          targetBuilding = buildings.find(b =>
            normalizeTerm(b.bairro) === normalizeTerm(mapping.targetDistrict)
          );
        }

        // Navigate to target district
        const currentDistrict = normalizeTerm(viewState.activeNeighborhood ?? '');
        const targetDistrict = normalizeTerm(mapping.targetDistrict);
        if (currentDistrict !== targetDistrict) {
          enterNeighborhood(mapping.targetDistrict);
        }

        // After navigation delay, select the building to trigger glow + card
        if (targetBuilding) {
          const delay = currentDistrict !== targetDistrict ? 600 : 0;
          setTimeout(() => {
            setSearchHighlightId(targetBuilding.id);
            viewBuildingDetails(targetBuilding);
          }, delay);
        }
        return;
      }

      // STEP 3 — Fallback: direct building name / specialty scan
      const buildings = Object.values(cityData.predios) as any[];
      const bMatch = buildings.find(b =>
        normalizeTerm(b.nome).includes(term) ||
        b.especialidades.some((e: string) => normalizeTerm(e).includes(term))
      );
      if (bMatch) {
        if (normalizeTerm(viewState.activeNeighborhood ?? '') !== normalizeTerm(bMatch.bairro)) {
          enterNeighborhood(bMatch.bairro);
        }
        setTimeout(() => {
          setSearchHighlightId(bMatch.id);
          viewBuildingDetails(bMatch);
        }, 500);
      }
    }, 600);  // 600ms debounce (faster than before)

    return () => clearTimeout(handler);
  }, [searchTerm, cityData, viewState.activeNeighborhood, enterNeighborhood, viewBuildingDetails]);

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
        cityData={cityData}
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
