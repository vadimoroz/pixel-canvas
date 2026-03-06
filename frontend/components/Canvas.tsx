"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { PixelData, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvas";

const PIXEL_SIZE = 6; // px per cell at 1x zoom

interface CanvasProps {
  pixels: PixelData[];
  selectedColor: string;
  onPixelClick: (x: number, y: number) => void;
  address: string | null;
  lastPlaced: { x: number; y: number } | null;
}

export default function Canvas({ pixels, selectedColor, onPixelClick, address, lastPlaced }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const pixelMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const map = new Map<string, string>();
    for (const p of pixels) {
      map.set(`${p.x},${p.y}`, p.color);
    }
    pixelMap.current = map;
  }, [pixels]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;
    const ps = PIXEL_SIZE * zoom;

    canvas.width = w * ps;
    canvas.height = h * ps;

    // Background (empty pixels)
    ctx.fillStyle = "#1a1a26";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (subtle)
    if (zoom >= 1.5) {
      ctx.strokeStyle = "rgba(42,42,62,0.5)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= w; x++) {
        ctx.beginPath(); ctx.moveTo(x * ps, 0); ctx.lineTo(x * ps, h * ps); ctx.stroke();
      }
      for (let y = 0; y <= h; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * ps); ctx.lineTo(w * ps, y * ps); ctx.stroke();
      }
    }

    // Painted pixels
    for (const [key, color] of pixelMap.current) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * ps, y * ps, ps, ps);
    }

    // Hover highlight
    if (hoveredPixel) {
      ctx.fillStyle = selectedColor + "88";
      ctx.fillRect(hoveredPixel.x * ps, hoveredPixel.y * ps, ps, ps);
      ctx.strokeStyle = "#ffffff44";
      ctx.lineWidth = 1;
      ctx.strokeRect(hoveredPixel.x * ps + 0.5, hoveredPixel.y * ps + 0.5, ps - 1, ps - 1);
    }

    // Last placed indicator
    if (lastPlaced) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(lastPlaced.x * ps + 1, lastPlaced.y * ps + 1, ps - 2, ps - 2);
    }
  }, [pixels, selectedColor, hoveredPixel, zoom, lastPlaced]);

  useEffect(() => { draw(); }, [draw]);

  const getPixelCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const ps = PIXEL_SIZE * zoom;
    const x = Math.floor((e.clientX - rect.left) / ps);
    const y = Math.floor((e.clientY - rect.top) / ps);
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return null;
    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      setPan({
        x: panStart.current.x + (e.clientX - dragStart.current.x),
        y: panStart.current.y + (e.clientY - dragStart.current.y),
      });
      return;
    }
    const coords = getPixelCoords(e);
    setHoveredPixel(coords);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.button === 2) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...pan };
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    if (e.button === 0) {
      const coords = getPixelCoords(e);
      if (coords) onPixelClick(coords.x, coords.y);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    setZoom((z) => Math.min(8, Math.max(0.5, z * delta)));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z * 0.8))}
          className="w-8 h-8 rounded-lg bg-[#12121a] border border-[#2a2a3e] text-white hover:border-violet-500 transition-colors text-sm font-bold"
        >
          -
        </button>
        <span className="text-xs text-[#64748b] w-14 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.min(8, z * 1.25))}
          className="w-8 h-8 rounded-lg bg-[#12121a] border border-[#2a2a3e] text-white hover:border-violet-500 transition-colors text-sm font-bold"
        >
          +
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="text-xs px-2 py-1.5 rounded-lg bg-[#12121a] border border-[#2a2a3e] text-[#64748b] hover:text-white hover:border-violet-500 transition-colors"
        >
          Reset
        </button>
        {hoveredPixel && (
          <span className="text-xs text-[#64748b] ml-auto font-mono">
            ({hoveredPixel.x}, {hoveredPixel.y})
          </span>
        )}
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-xl border border-[#2a2a3e] bg-[#0a0a0f]"
        style={{ maxHeight: "60vh", maxWidth: "100%" }}
        onWheel={handleWheel as unknown as React.WheelEventHandler}
      >
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, display: "inline-block" }}>
          <canvas
            ref={canvasRef}
            className="pixel-canvas block"
            style={{ cursor: address ? "crosshair" : "not-allowed" }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setHoveredPixel(null)}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>

      {!address && (
        <p className="text-center text-xs text-[#64748b]">
          Connect your wallet to place pixels
        </p>
      )}
    </div>
  );
}
