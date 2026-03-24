"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { NEIGHBORHOOD_CLUSTERS, NeighborhoodCluster, MACRO_VIEW_BUILDINGS, MacroBuilding } from "@/lib/constants";

export type ViewMode = 'MACRO' | 'NEIGHBORHOOD' | 'BUILDING_DETAIL';

export interface ViewState {
  mode: ViewMode;
  activeNeighborhood: string | null;
  selectedBuilding: Building | null;
  camera: { x: number; y: number; zoom: number };
}

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

interface CityData {
  meta: {
    total_predios: number;
    total_agentes: number;
    total_problemas_resolvidos: number;
  };
  bairros: Record<string, {
    cor: string;
    cor_claro: string;
    centro: { x: number; y: number };
    raio: number;
  }>;
  predios: Record<string, Building>;
}

interface CityMapProps {
  viewState: ViewState;
  onViewStateChange: (state: ViewState | ((prev: ViewState) => ViewState)) => void;
  onEnterNeighborhood: (id: string) => void;
  onViewBuildingDetails: (building: Building) => void;
  onBackToMacro: () => void;
  onBackToNeighborhood: () => void;
  onBuildingSelect: (building: Building | null) => void;
  searchTerm: string;
  activeNeighborhood: string | null;
}

export default function CityMap({
  viewState,
  onViewStateChange,
  onEnterNeighborhood,
  onViewBuildingDetails,
  onBackToMacro,
  onBackToNeighborhood,
  onBuildingSelect,
  searchTerm,
  activeNeighborhood
}: CityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number>(0);
  const tick = useRef(0);

  // Carregar dados
  useEffect(() => {
    fetch("/atlas_city_buildings.json")
      .then(r => r.json())
      .then(data => {
        setCityData(data);
        const isMob = typeof window !== "undefined" && window.innerWidth < 768;
        const autoZoom = isMob
          ? Math.min(window.innerWidth / 1000, window.innerHeight / 1200) * 1.5
          : Math.min(window.innerWidth / 2200, window.innerHeight / 1900) * 0.85;

        onViewStateChange(prev => ({
          ...prev,
          camera: { x: 0, y: isMob ? 60 : (window.innerHeight * 0.05) + 60, zoom: autoZoom }
        }));
      });
  }, [onViewStateChange]);

  const isBuildingVisible = useCallback((b: Building) => {
    if (activeNeighborhood && b.bairro !== activeNeighborhood) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return b.nome.toLowerCase().includes(term) || b.especialidades.some(e => e.toLowerCase().includes(term));
    }
    return true;
  }, [activeNeighborhood, searchTerm]);

  // Ajustar tamanho do canvas e resolução (DPR)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);
    updateSize();

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!cityData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!cityData || !ctx || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const dpr = window.devicePixelRatio || 1;

      tick.current++;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      
      // Fundo Noturno com Degradê Rico
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#060E1A");
      bg.addColorStop(0.5, "#0A1628");
      bg.addColorStop(1, "#0D1B2E");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grade de Fundo (Sync com HeroSection)
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(viewState.camera.x % 40, viewState.camera.y % 40);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = -40; x < canvas.clientWidth + 40; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.clientHeight);
      }
      for (let y = -40; y < canvas.clientHeight + 40; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.clientWidth, y);
      }
      ctx.stroke();
      ctx.restore();

      // Estrelas Cintilantes
      for (let i = 0; i < 20; i++) {
        const sx = (Math.sin(tick.current * 0.01 + i) * 0.5 + 0.5) * W;
        const sy = (Math.cos(tick.current * 0.01 + i * 2) * 0.5 + 0.5) * H * 0.5;
        const alpha = Math.sin(tick.current * 0.05 + i) * 0.3 + 0.4;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      // Centralizar e Aplicar Câmera
      ctx.translate(W / 2 + viewState.camera.x * dpr, H / 2 + viewState.camera.y * dpr);
      ctx.scale(viewState.camera.zoom * dpr, viewState.camera.zoom * dpr);
      
      if (viewState.mode === 'MACRO') {
        ctx.translate(-1000, -800);
        MACRO_VIEW_BUILDINGS.forEach(macro => {
          const cx = macro.posicao.x;
          const cy = macro.posicao.y;
          const size = 180;
          const isHovered = hovered === `macro_${macro.id}`;
          
          ctx.save();
          // Halo de brilho
          if (isHovered) {
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
            glow.addColorStop(0, macro.cor_hex + '33');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(cx, cy, size/2 + (isHovered ? 30 : 20), 0, Math.PI * 2);
          ctx.strokeStyle = macro.cor_hex + (isHovered ? '99' : '44');
          ctx.lineWidth = isHovered ? 6 : 4;
          ctx.stroke();

          // Prédio Macro (Bloco Premium)
          const grad = ctx.createLinearGradient(cx - size/4, cy - size/2, cx - size/4, cy + size/2);
          grad.addColorStop(0, macro.cor_hex);
          grad.addColorStop(1, "#0f172a");
          ctx.fillStyle = grad;
          ctx.fillRect(cx - size/4, cy - size/2, size/2, size);
          
          // Janelas no Macro
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          for(let row=0; row<8; row++) {
            for(let col=0; col<3; col++) {
              if ((row+col+tick.current/20)%5 > 1) {
                ctx.fillRect(cx - size/4 + 10 + col*12, cy - size/2 + 15 + row*18, 6, 4);
              }
            }
          }

          ctx.font = "60px sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(macro.icone, cx, cy - 20);
          
          ctx.fillStyle = '#fff';
          ctx.font = "bold 22px sans-serif";
          ctx.fillText(macro.nome, cx, cy + 50);
          
          ctx.fillStyle = '#94A3B8';
          ctx.font = "14px sans-serif";
          ctx.fillText(`${macro.totalPredios} prédios`, cx, cy + 75);
          ctx.restore();
        });
      } else {
        ctx.translate(-1000, -800);
        // Renderizar prédios do bairro
        const filtered = Object.values(cityData.predios).filter(p => {
          if (viewState.activeNeighborhood) {
            const b = viewState.activeNeighborhood.toLowerCase();
            return p.bairro.toLowerCase() === b;
          }
          return true;
        });

        filtered.forEach(b => {
          if (!isBuildingVisible(b)) return;
          const isHovered = hovered === b.id;
          const isSelected = viewState.selectedBuilding?.id === b.id;
          const bx = b.posicao.x;
          const by = b.posicao.y;
          const largura = 22 + b.nivel * 6;
          const alturaBase = b.andares * 12 + 40;

          // Desenho do Prédio Premium
          ctx.save();
          
          // Sombra/Brilho
          if (isHovered || isSelected) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = isSelected ? "#fff" : b.cor;
          }

          // Corpo Principal com Degradê
          const bGrad = ctx.createLinearGradient(bx, by - alturaBase, bx, by);
          bGrad.addColorStop(0, isSelected ? "#fff" : b.cor);
          bGrad.addColorStop(1, "#0f172a");
          ctx.fillStyle = bGrad;
          ctx.fillRect(bx - largura / 2, by - alturaBase, largura, alturaBase);
          
          // Textura/Hatching (Linhas diagonais sutis)
          ctx.strokeStyle = "rgba(255,255,255,0.05)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for(let i=0; i<alturaBase; i+=10) {
             ctx.moveTo(bx - largura/2, by - alturaBase + i);
             ctx.lineTo(bx + largura/2, by - alturaBase + i + 10);
          }
          ctx.stroke();

          // Janelas (Pontos brancos)
          const cols = Math.floor(largura / 8);
          const rows = Math.floor(alturaBase / 10);
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
              // Algumas janelas apagadas aleatoriamente baseadas no ID do prédio
              const seed = parseInt(b.id.replace(/\D/g, '') || "0") + r + c;
              if (seed % 7 > 1) {
                ctx.fillRect(bx - largura/2 + 4 + c*8, by - alturaBase + 5 + r*10, 3, 2);
              }
            }
          }

          // Antena
          if (b.nivel > 2) {
            ctx.strokeStyle = isSelected ? "#fff" : b.cor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx, by - alturaBase);
            ctx.lineTo(bx, by - alturaBase - 15);
            ctx.stroke();
            
            // Luz da Antena (pisca)
            if (tick.current % 60 < 30) {
              ctx.fillStyle = "#ff4444";
              ctx.beginPath();
              ctx.arc(bx, by - alturaBase - 15, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          ctx.restore();

          // Etiqueta
          if (viewState.camera.zoom > 0.7 || isHovered || isSelected) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(b.nome, bx, by - alturaBase - 10);
          }
        });

        // Nome do bairro (Fundo)
        if (viewState.activeNeighborhood) {
          const bairroData = cityData.bairros[viewState.activeNeighborhood];
          if (bairroData) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = bairroData.cor;
            ctx.font = "bold 120px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(viewState.activeNeighborhood.toUpperCase(), bairroData.centro.x, bairroData.centro.y);
            ctx.restore();
          }
        }
      }
      ctx.restore();

      // HUD de Zoom
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.font = "10px monospace";
      ctx.fillText(
        `${viewState.mode === 'MACRO' ? 'GLOBAL VIEW' : viewState.activeNeighborhood?.toUpperCase()} // ZOOM: ${Math.round(viewState.camera.zoom * 100)}%`,
        24, canvas.height / dpr - 24
      );

      animFrame.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrame.current);
  }, [cityData, hovered, isBuildingVisible, activeNeighborhood, viewState, viewState.camera, viewState.mode]);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const getBuildingAt = useCallback((cx: number, cy: number) => {
    if (!cityData || !canvasRef.current) return null;
    const W = canvasRef.current.offsetWidth;
    const H = canvasRef.current.offsetHeight;
    const zoom = viewState.camera.zoom;
    const worldX = (cx - W / 2 - viewState.camera.x) / zoom + 1000;
    const worldY = (cy - H / 2 - viewState.camera.y) / zoom + 800;

    const buildings = Object.values(cityData.predios).filter(p => p.bairro.toLowerCase() === activeNeighborhood?.toLowerCase());
    for (let i = buildings.length - 1; i >= 0; i--) {
      const b = buildings[i];
      const largura = 24 + b.nivel * 8;
      const alturaBase = b.andares * 14;
      const px = b.posicao.x - largura / 2;
      const py = b.posicao.y - alturaBase;
      if (worldX >= px - 10 && worldX <= px + largura + 10 && worldY >= py - 10 && worldY <= py + alturaBase + 10) return b;
    }
    return null;
  }, [cityData, viewState.camera, viewState.camera.x, viewState.camera.y, viewState.camera.zoom, activeNeighborhood]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x: cx, y: cy } = getCanvasCoords(e.clientX, e.clientY);
    if (isDragging.current) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      onViewStateChange(prev => ({
        ...prev,
        camera: { ...prev.camera, x: prev.camera.x + dx, y: prev.camera.y + dy }
      }));
      lastMouse.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (viewState.mode === 'MACRO') {
      const W = canvasRef.current!.offsetWidth;
      const H = canvasRef.current!.offsetHeight;
      const zoom = viewState.camera.zoom;
      const worldX = (cx - W / 2 - viewState.camera.x) / zoom + 1000;
      const worldY = (cy - H / 2 - viewState.camera.y) / zoom + 800;
      let f = null;
      MACRO_VIEW_BUILDINGS.forEach(m => {
        if (Math.hypot(worldX - m.posicao.x, worldY - m.posicao.y) < 90) f = `macro_${m.id}`;
      });
      setHovered(f);
      if (canvasRef.current) canvasRef.current.style.cursor = f ? "pointer" : "grab";
    } else {
      const b = getBuildingAt(cx, cy);
      setHovered(b?.id ?? null);
      if (canvasRef.current) canvasRef.current.style.cursor = b ? "pointer" : "grab";
    }
  }, [getCanvasCoords, viewState.camera, viewState.mode, onViewStateChange, getBuildingAt]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    if (viewState.mode === 'MACRO') {
      const W = canvasRef.current!.offsetWidth;
      const H = canvasRef.current!.offsetHeight;
      const zoom = viewState.camera.zoom;
      const worldX = (x - W / 2 - viewState.camera.x) / zoom + 1000;
      const worldY = (y - H / 2 - viewState.camera.y) / zoom + 800;
      MACRO_VIEW_BUILDINGS.forEach(m => {
        if (Math.hypot(worldX - m.posicao.x, worldY - m.posicao.y) < 90) onEnterNeighborhood(m.id);
      });
    } else {
      const b = getBuildingAt(x, y);
      if (b) onViewBuildingDetails(b);
      else onBuildingSelect(null);
    }
  }, [getCanvasCoords, viewState.camera, viewState.mode, onEnterNeighborhood, getBuildingAt, onViewBuildingDetails, onBuildingSelect]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    onViewStateChange(prev => ({
      ...prev,
      camera: { ...prev.camera, zoom: Math.max(0.25, Math.min(2.5, prev.camera.zoom - e.deltaY * 0.001)) }
    }));
  }, [onViewStateChange]);

  const lastTouch = useRef<{ x: number, y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging.current && lastTouch.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouch.current.x;
      const dy = touch.clientY - lastTouch.current.y;
      onViewStateChange(prev => ({
        ...prev,
        camera: { ...prev.camera, x: prev.camera.x + dx, y: prev.camera.y + dy }
      }));
      lastTouch.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [onViewStateChange]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    isDragging.current = false;
    if (e.changedTouches.length === 1 && lastTouch.current) {
      // Simplificação do clique via toque
      const touch = e.changedTouches[0];
      const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
      if (viewState.mode === 'MACRO') {
        const W = canvasRef.current!.offsetWidth;
        const H = canvasRef.current!.offsetHeight;
        const zoom = viewState.camera.zoom;
        const worldX = (x - W / 2 - viewState.camera.x) / zoom + 1000;
        const worldY = (y - H / 2 - viewState.camera.y) / zoom + 800;
        MACRO_VIEW_BUILDINGS.forEach(m => {
          if (Math.hypot(worldX - m.posicao.x, worldY - m.posicao.y) < 90) onEnterNeighborhood(m.id);
        });
      } else {
        const b = getBuildingAt(x, y);
        if (b) onViewBuildingDetails(b);
      }
    }
    lastTouch.current = null;
  }, [getCanvasCoords, viewState.camera, viewState.mode, onEnterNeighborhood, getBuildingAt, onViewBuildingDetails]);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onWheel={handleWheel}
      onMouseDown={(e) => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; }}
      onMouseUp={() => isDragging.current = false}
      onMouseLeave={() => isDragging.current = false}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ width: "100%", height: "100%", cursor: "grab", touchAction: "none" }}
    />
  );
}
