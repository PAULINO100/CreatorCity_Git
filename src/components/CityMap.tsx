"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { MACRO_VIEW_BUILDINGS } from "@/lib/constants";

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

interface RenderedBuilding extends Building {
  renderPos: { x: number; y: number };
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
  cityData: CityData | null;
}

export default function CityMap({
  viewState,
  onViewStateChange,
  onEnterNeighborhood,
  onViewBuildingDetails,
  onBuildingSelect,
  searchTerm,
  activeNeighborhood,
  cityData
}: CityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number>(0);
  const tick = useRef(0);
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchZoom = useRef<number>(1);

  // 1. Zoom inicial Macro (apenas na primeira carga se não hover cityData ainda)
  useEffect(() => {
    if (!cityData) return;
    const isMob = typeof window !== "undefined" && window.innerWidth < 768;
    const autoZoom = isMob
      ? Math.min(window.innerWidth / 1000, window.innerHeight / 1200) * 1.5
      : Math.min(window.innerWidth / 2200, window.innerHeight / 1900) * 0.85;

    onViewStateChange(prev => ({
      ...prev,
      camera: { ...prev.camera, zoom: prev.camera.zoom || autoZoom }
    }));
  }, [cityData, onViewStateChange]);

  // 2. Processar prédios com ordenação e dispersão inteligente
  const processedBuildings = useMemo<RenderedBuilding[]>(() => {
    if (!cityData) return [];
    
    let filtered = Object.values(cityData.predios).filter(p => {
      if (activeNeighborhood) {
        return p.bairro.toLowerCase() === activeNeighborhood.toLowerCase();
      }
      return true;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.nome.toLowerCase().includes(term) || 
        b.especialidades.some(e => e.toLowerCase().includes(term))
      );
    }

    const sorted = [...filtered].sort((a, b) => a.posicao.y - b.posicao.y);

    return sorted.map((b: Building) => {
      const seed = parseInt(b.id.replace(/\D/g, '') || "0");
      const offsetX = ((seed % 11) - 5) * 2; 
      const offsetY = ((seed % 7) - 3) * 2;
      
      return {
        ...b,
        renderPos: {
          x: b.posicao.x + offsetX,
          y: b.posicao.y + offsetY
        }
      };
    });
  }, [cityData, activeNeighborhood, searchTerm]);

  // 3. Ajustar tamanho do canvas
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

  // 4. Loop de renderização
  useEffect(() => {
    if (!cityData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!ctx || !canvasRef.current || !cityData) return;
      const W = canvasRef.current.width;
      const H = canvasRef.current.height;
      const dpr = window.devicePixelRatio || 1;

      tick.current++;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#060E1A");
      bg.addColorStop(0.5, "#0A1628");
      bg.addColorStop(1, "#0D1B2E");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(viewState.camera.x % 40, viewState.camera.y % 40);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = -40; x < canvasRef.current.clientWidth + 40; x += 40) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvasRef.current.clientHeight);
      }
      for (let y = -40; y < canvasRef.current.clientHeight + 40; y += 40) {
        ctx.moveTo(0, y); ctx.lineTo(canvasRef.current.clientWidth, y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2 + viewState.camera.x * dpr, H / 2 + viewState.camera.y * dpr);
      ctx.scale(viewState.camera.zoom * dpr, viewState.camera.zoom * dpr);
      
      if (viewState.mode === 'MACRO') {
        ctx.translate(-1000, -800);
        MACRO_VIEW_BUILDINGS.forEach(macro => {
          const cx = macro.posicao.x;
          const cy = macro.posicao.y;
          const size = 320; // Aumentado (~78% acima do original 180)
          const isHovered = hovered === `macro_${macro.id}`;
          ctx.save();
          if (isHovered) {
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.2);
            glow.addColorStop(0, macro.cor_hex + '33');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(cx, cy, size * 1.2, 0, Math.PI * 2); ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(cx, cy, size/2 + (isHovered ? 40 : 28), 0, Math.PI * 2);
          ctx.strokeStyle = macro.cor_hex + (isHovered ? 'BB' : '55');
          ctx.lineWidth = isHovered ? 7 : 5;
          ctx.stroke();

          const grad = ctx.createLinearGradient(cx - size/4, cy - size/2, cx - size/4, cy + size/2);
          grad.addColorStop(0, macro.cor_hex);
          grad.addColorStop(1, "#0f172a");
          ctx.fillStyle = grad;
          ctx.fillRect(cx - size/4, cy - size/2, size/2, size);
          
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          for(let r=0; r<10; r++) {
            for(let c=0; c<3; c++) {
              if ((r+c+tick.current/20)%5 > 1) ctx.fillRect(cx - size/4 + 12 + c*14, cy - size/2 + 16 + r*22, 7, 5);
            }
          }
          ctx.font = "80px sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(macro.icone, cx, cy - 28);
          ctx.fillStyle = '#fff'; ctx.font = "bold 28px sans-serif"; ctx.fillText(macro.nome, cx, cy + 70);
          ctx.fillStyle = '#94A3B8'; ctx.font = "18px sans-serif"; ctx.fillText(`${macro.totalPredios} prédios`, cx, cy + 102);
          ctx.restore();
        });
      } else {
        ctx.translate(-1000, -800);
        processedBuildings.forEach((b: RenderedBuilding) => {
          const isHovered = hovered === b.id;
          const isSelected = viewState.selectedBuilding?.id === b.id;
          const bx = b.renderPos.x;
          const by = b.renderPos.y;
          const largura = 22 + b.nivel * 6;
          const alturaBase = b.andares * 12 + 40;

          ctx.save();
          if (isHovered || isSelected) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = isSelected ? "#fff" : b.cor;
          }
          const bGrad = ctx.createLinearGradient(bx, by - alturaBase, bx, by);
          bGrad.addColorStop(0, isSelected ? "#fff" : b.cor);
          bGrad.addColorStop(1, "#0f172a");
          ctx.fillStyle = bGrad;
          ctx.fillRect(bx - largura / 2, by - alturaBase, largura, alturaBase);
          
          ctx.strokeStyle = "rgba(255,255,255,0.05)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for(let i=0; i<alturaBase; i+=10) {
             ctx.moveTo(bx - largura/2, by - alturaBase + i);
             ctx.lineTo(bx + largura/2, by - alturaBase + i + 10);
          }
          ctx.stroke();

          const cols = Math.floor(largura / 8);
          const rows = Math.floor(alturaBase / 10);
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
              const seed = parseInt(b.id.replace(/\D/g, '') || "0") + r + c;
              if (seed % 7 > 1) ctx.fillRect(bx - largura/2 + 4 + c*8, by - alturaBase + 5 + r*10, 3, 2);
            }
          }
          if (b.nivel > 2) {
            ctx.strokeStyle = isSelected ? "#fff" : b.cor; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(bx, by - alturaBase); ctx.lineTo(bx, by - alturaBase - 15); ctx.stroke();
            if (tick.current % 60 < 30) {
              ctx.fillStyle = "#ff4444"; ctx.beginPath(); ctx.arc(bx, by - alturaBase - 15, 2, 0, Math.PI * 2); ctx.fill();
            }
          }
          ctx.restore();
          if (viewState.camera.zoom > 0.7 || isHovered || isSelected) {
            ctx.fillStyle = "#fff"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
            ctx.fillText(b.nome, bx, by - alturaBase - 10);
          }
        });

        if (viewState.activeNeighborhood) {
          const bd = cityData.bairros[viewState.activeNeighborhood];
          if (bd) {
            ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = bd.cor; ctx.font = "bold 120px sans-serif";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(viewState.activeNeighborhood.toUpperCase(), bd.centro.x, bd.centro.y);
            ctx.restore();
          }
        }
      }
      ctx.restore();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.font = "10px monospace";
      ctx.fillText(
        `${viewState.mode === 'MACRO' ? 'GLOBAL VIEW' : viewState.activeNeighborhood?.toUpperCase()} // ZOOM: ${Math.round(viewState.camera.zoom * 100)}%`,
        24, canvasRef.current!.height / dpr - 24
      );
      animFrame.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animFrame.current);
  }, [cityData, hovered, activeNeighborhood, viewState, viewState.camera, viewState.mode, processedBuildings]);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const getBuildingAt = useCallback((cx: number, cy: number) => {
    if (!canvasRef.current) return null;
    const W = canvasRef.current.offsetWidth;
    const H = canvasRef.current.offsetHeight;
    const zoom = viewState.camera.zoom;
    const worldX = (cx - W / 2 - viewState.camera.x) / zoom + 1000;
    const worldY = (cy - H / 2 - viewState.camera.y) / zoom + 800;

    for (let i = processedBuildings.length - 1; i >= 0; i--) {
      const b = processedBuildings[i];
      const largura = 24 + b.nivel * 8;
      const alturaBase = b.andares * 14 + 40;
      const px = b.renderPos.x - largura / 2;
      const py = b.renderPos.y - alturaBase;
      if (worldX >= px - 5 && worldX <= px + largura + 5 && worldY >= py - 15 && worldY <= b.renderPos.y + 5) return b;
    }
    return null;
  }, [viewState.camera, processedBuildings]);

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
      if (!canvasRef.current) return;
      const W = canvasRef.current.offsetWidth;
      const H = canvasRef.current.offsetHeight;
      const zoom = viewState.camera.zoom;
      const worldX = (cx - W / 2 - viewState.camera.x) / zoom + 1000;
      const worldY = (cy - H / 2 - viewState.camera.y) / zoom + 800;
      let f = null;
      MACRO_VIEW_BUILDINGS.forEach(m => {
        if (Math.hypot(worldX - m.posicao.x, worldY - m.posicao.y) < 117) f = `macro_${m.id}`;
      });
      setHovered(f);
      canvasRef.current.style.cursor = f ? "pointer" : "grab";
    } else {
      const b = getBuildingAt(cx, cy);
      setHovered(b?.id ?? null);
      if (canvasRef.current) canvasRef.current.style.cursor = b ? "pointer" : "grab";
    }
  }, [getCanvasCoords, viewState.camera, viewState.mode, onViewStateChange, getBuildingAt]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    if (viewState.mode === 'MACRO') {
      if (!canvasRef.current) return;
      const W = canvasRef.current.offsetWidth;
      const H = canvasRef.current.offsetHeight;
      const zoom = viewState.camera.zoom;
      const worldX = (x - W / 2 - viewState.camera.x) / zoom + 1000;
      const worldY = (y - H / 2 - viewState.camera.y) / zoom + 800;
      MACRO_VIEW_BUILDINGS.forEach(m => {
        if (Math.hypot(worldX - m.posicao.x, worldY - m.posicao.y) < 117) onEnterNeighborhood(m.id);
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
      camera: { ...prev.camera, zoom: Math.max(0.25, Math.min(4.0, prev.camera.zoom - e.deltaY * 0.001)) }
    }));
  }, [onViewStateChange]);

  const lastTouch = useRef<{ x: number, y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      initialPinchDistance.current = null;
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance.current = Math.hypot(dx, dy);
      initialPinchZoom.current = viewState.camera.zoom;
    }
  }, [viewState.camera.zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging.current && lastTouch.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouch.current.x;
      const dy = touch.clientY - lastTouch.current.y;
      onViewStateChange(prev => ({
        ...prev,
        camera: { ...prev.camera, x: prev.camera.x + dx, y: prev.camera.y + dy }
      }));
      lastTouch.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2 && initialPinchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      if (currentDistance > 10) {
        const factor = currentDistance / initialPinchDistance.current;
        const newZoom = Math.max(0.25, Math.min(4.0, initialPinchZoom.current * factor));
        onViewStateChange(prev => ({
          ...prev,
          camera: { ...prev.camera, zoom: newZoom }
        }));
      }
    }
  }, [onViewStateChange]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    isDragging.current = false;
    initialPinchDistance.current = null;
    if (e.changedTouches.length === 1 && lastTouch.current && !initialPinchDistance.current) {
      const touch = e.changedTouches[0];
      const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
      if (viewState.mode === 'MACRO') {
        if (!canvasRef.current) return;
        const W = canvasRef.current.offsetWidth;
        const H = canvasRef.current.offsetHeight;
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
