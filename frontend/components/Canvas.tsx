"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { PixelData, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvas";

const BASE_PS = 5;

interface CanvasProps {
  pixels: PixelData[];
  selectedColor: string;
  onPixelClick: (x: number, y: number, screenX: number, screenY: number) => void;
  address: string | null;
  lastPlaced: { x: number; y: number } | null;
  heatmap: boolean;
}

export default function Canvas({ pixels, selectedColor, onPixelClick, address, lastPlaced, heatmap }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1.4);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<{ x: number; y: number } | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const pixelMap = useRef<Map<string, { color: string; time: number }>>(new Map());
  const maxTime = useRef(0);
  const minTime = useRef(Infinity);

  useEffect(() => {
    const map = new Map<string, { color: string; time: number }>();
    let mx = 0, mn = Infinity;
    for (const p of pixels) {
      map.set(`${p.x},${p.y}`, { color: p.color, time: p.placedAt });
      if (p.placedAt > mx) mx = p.placedAt;
      if (p.placedAt < mn) mn = p.placedAt;
    }
    pixelMap.current = map;
    maxTime.current = mx;
    minTime.current = mn;
  }, [pixels]);

  const drawMinimap = useCallback(() => {
    const mc = minimapRef.current;
    if (!mc) return;
    const ctx = mc.getContext("2d");
    if (!ctx) return;
    mc.width = CANVAS_WIDTH;
    mc.height = CANVAS_HEIGHT;
    ctx.fillStyle = "#e0e7ff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (const [key, { color }] of pixelMap.current) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
    // viewport rect
    const container = containerRef.current;
    if (container) {
      const ps = BASE_PS * zoom;
      const vx = (-pan.x / ps) * (mc.width / CANVAS_WIDTH);
      const vy = (-pan.y / ps) * (mc.height / CANVAS_HEIGHT);
      const vw = (container.clientWidth / ps) * (mc.width / CANVAS_WIDTH);
      const vh = (container.clientHeight / ps) * (mc.height / CANVAS_HEIGHT);
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.strokeRect(Math.max(0, vx), Math.max(0, vy), Math.min(vw, CANVAS_WIDTH), Math.min(vh, CANVAS_HEIGHT));
    }
  }, [pixels, zoom, pan]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ps = BASE_PS * zoom;
    canvas.width = CANVAS_WIDTH * ps;
    canvas.height = CANVAS_HEIGHT * ps;

    // Background
    ctx.fillStyle = "#eef2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle checker
    for (let x = 0; x < CANVAS_WIDTH; x++) {
      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = "rgba(99,102,241,0.04)";
          ctx.fillRect(x * ps, y * ps, ps, ps);
        }
      }
    }

    // Grid
    if (showGrid) {
      ctx.strokeStyle = zoom >= 2 ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.06)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= CANVAS_WIDTH; x++) {
        ctx.beginPath(); ctx.moveTo(x * ps, 0); ctx.lineTo(x * ps, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * ps); ctx.lineTo(canvas.width, y * ps); ctx.stroke();
      }
    }

    // Pixels
    const range = maxTime.current - minTime.current || 1;
    for (const [key, { color, time }] of pixelMap.current) {
      const [x, y] = key.split(",").map(Number);
      if (heatmap) {
        const t = (time - minTime.current) / range;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.25 + t * 0.75;
      } else {
        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
      }
      ctx.fillRect(x * ps, y * ps, ps, ps);
    }
    ctx.globalAlpha = 1;

    // Hover
    if (hovered && address) {
      ctx.fillStyle = selectedColor + "55";
      ctx.fillRect(hovered.x * ps, hovered.y * ps, ps, ps);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hovered.x * ps + 0.75, hovered.y * ps + 0.75, ps - 1.5, ps - 1.5);
    }

    // Last placed pulse
    if (lastPlaced) {
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.strokeRect(lastPlaced.x * ps + 1, lastPlaced.y * ps + 1, ps - 2, ps - 2);
    }

    drawMinimap();
  }, [pixels, selectedColor, hovered, zoom, lastPlaced, heatmap, showGrid, drawMinimap, address]);

  useEffect(() => { draw(); }, [draw]);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    const ps = BASE_PS * zoom;
    const x = Math.floor((e.clientX - rect.left) / ps);
    const y = Math.floor((e.clientY - rect.top) / ps);
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return null;
    return { x, y };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
        setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
      }
      return;
    }
    setHovered(getCoords(e));
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const wasDragging = isDragging.current && hasMoved.current;
    isDragging.current = false;
    if (!wasDragging && e.button === 0) {
      const c = getCoords(e);
      if (c) onPixelClick(c.x, c.y, e.clientX, e.clientY);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(12, Math.max(0.4, z * (e.deltaY > 0 ? 0.9 : 1.12))));
  };

  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mc = minimapRef.current;
    if (!mc) return;
    const rect = mc.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const ps = BASE_PS * zoom;
    setPan({
      x: -(fx * CANVAS_WIDTH * ps - (containerRef.current?.clientWidth ?? 600) / 2),
      y: -(fy * CANVAS_HEIGHT * ps - (containerRef.current?.clientHeight ?? 400) / 2),
    });
  };

  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Zoom */}
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(99,102,241,0.16)" }}
        >
          <button
            onClick={() => setZoom(z => Math.max(0.4, z * 0.82))}
            className="px-3 py-1.5 text-sm font-bold transition-colors hover:bg-indigo-50"
            style={{ color: "#6366f1", borderRight: "1px solid rgba(99,102,241,0.12)" }}
          >
            −
          </button>
          <span className="px-3 text-xs font-bold font-mono" style={{ color: "#6366f1", minWidth: 50, textAlign: "center" }}>
            {zoomPct}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(12, z * 1.22))}
            className="px-3 py-1.5 text-sm font-bold transition-colors hover:bg-indigo-50"
            style={{ color: "#6366f1", borderLeft: "1px solid rgba(99,102,241,0.12)" }}
          >
            +
          </button>
        </div>

        <button
          onClick={() => { setZoom(1.4); setPan({ x: 0, y: 0 }); }}
          className="btn-ghost btn-sm"
        >
          Reset
        </button>

        {/* Grid toggle */}
        <button
          onClick={() => setShowGrid(g => !g)}
          className="btn-ghost btn-sm flex items-center gap-1.5"
          style={{ color: showGrid ? "#6366f1" : "#94a3b8" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="0.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor"/>
            <rect x="7.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor"/>
            <rect x="0.5" y="7.5" width="4" height="4" rx="0.5" stroke="currentColor"/>
            <rect x="7.5" y="7.5" width="4" height="4" rx="0.5" stroke="currentColor"/>
          </svg>
          Grid
        </button>

        {/* Coordinates */}
        {hovered && (
          <div
            className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold"
            style={{
              background: "rgba(99,102,241,0.07)",
              border: "1px solid rgba(99,102,241,0.15)",
              color: "#6366f1",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="#6366f1" strokeWidth="1"/>
              <circle cx="5" cy="5" r="1.5" fill="#6366f1"/>
            </svg>
            ({hovered.x}, {hovered.y})
          </div>
        )}
      </div>

      {/* Canvas container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ minHeight: 340 }}>
        {/* Glass frame */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2), inset 0 0 60px rgba(99,102,241,0.04)",
          }}
        />

        {/* Canvas scroll area */}
        <div
          ref={containerRef}
          className="w-full h-full overflow-auto"
          style={{ background: "rgba(238,242,255,0.6)" }}
          onWheel={onWheel as unknown as React.WheelEventHandler<HTMLDivElement>}
        >
          <div style={{ transform: `translate(${pan.x}px,${pan.y}px)`, display: "inline-block" }}>
            <canvas
              ref={canvasRef}
              className="pixel-canvas"
              style={{ cursor: address ? "crosshair" : "default" }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={() => { setHovered(null); isDragging.current = false; }}
              onContextMenu={e => e.preventDefault()}
            />
          </div>
        </div>

        {/* Minimap */}
        <div
          className="absolute bottom-3 right-3 z-20 rounded-xl overflow-hidden shadow-lg"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(99,102,241,0.25)",
            padding: 3,
          }}
        >
          <p className="text-[8px] font-bold uppercase tracking-widest text-center mb-1" style={{ color: "#6366f1" }}>
            Map
          </p>
          <canvas
            ref={minimapRef}
            style={{ width: 120, height: 60, display: "block", imageRendering: "pixelated", cursor: "pointer", borderRadius: 6 }}
            onClick={handleMinimapClick}
          />
        </div>

        {/* No wallet overlay */}
        {!address && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div
              className="px-5 py-3 rounded-2xl text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#6366f1",
                boxShadow: "0 4px 20px rgba(99,102,241,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              Connect wallet to paint pixels ✦
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
