"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { PixelData, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvas";

const PIXEL_SIZE = 5;

interface CanvasProps {
  pixels: PixelData[];
  selectedColor: string;
  onPixelClick: (x: number, y: number) => void;
  address: string | null;
  lastPlaced: { x: number; y: number } | null;
}

export default function Canvas({ pixels, selectedColor, onPixelClick, address, lastPlaced }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const pixelMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const map = new Map<string, string>();
    for (const p of pixels) map.set(`${p.x},${p.y}`, p.color);
    pixelMap.current = map;
  }, [pixels]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ps = PIXEL_SIZE * zoom;
    canvas.width = CANVAS_WIDTH * ps;
    canvas.height = CANVAS_HEIGHT * ps;

    // Empty bg — checkerboard subtle pattern
    for (let x = 0; x < CANVAS_WIDTH; x++) {
      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        const even = (x + y) % 2 === 0;
        ctx.fillStyle = even ? "#0d0d1a" : "#0f0f1e";
        ctx.fillRect(x * ps, y * ps, ps, ps);
      }
    }

    // Grid lines at higher zoom
    if (zoom >= 2) {
      ctx.strokeStyle = "rgba(139,92,246,0.08)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= CANVAS_WIDTH; x++) {
        ctx.beginPath(); ctx.moveTo(x * ps, 0); ctx.lineTo(x * ps, CANVAS_HEIGHT * ps); ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * ps); ctx.lineTo(CANVAS_WIDTH * ps, y * ps); ctx.stroke();
      }
    }

    // Pixels
    for (const [key, color] of pixelMap.current) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * ps, y * ps, ps, ps);
    }

    // Hover
    if (hoveredPixel && address) {
      ctx.fillStyle = selectedColor + "66";
      ctx.fillRect(hoveredPixel.x * ps, hoveredPixel.y * ps, ps, ps);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(hoveredPixel.x * ps + 0.5, hoveredPixel.y * ps + 0.5, ps - 1, ps - 1);
    }

    // Last placed glow
    if (lastPlaced) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(lastPlaced.x * ps + 1, lastPlaced.y * ps + 1, ps - 2, ps - 2);
    }
  }, [pixels, selectedColor, hoveredPixel, zoom, lastPlaced, address]);

  useEffect(() => { draw(); }, [draw]);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const ps = PIXEL_SIZE * zoom;
    const x = Math.floor((e.clientX - rect.left) / ps);
    const y = Math.floor((e.clientY - rect.top) / ps);
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return null;
    return { x, y };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      setPan({ x: panStart.current.x + e.clientX - dragStart.current.x, y: panStart.current.y + e.clientY - dragStart.current.y });
      return;
    }
    setHoveredPixel(getCoords(e));
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...pan };
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) { isDragging.current = false; return; }
    if (e.button === 0) {
      const c = getCoords(e);
      if (c) onPixelClick(c.x, c.y);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(10, Math.max(0.4, z * (e.deltaY > 0 ? 0.88 : 1.14))));
  };

  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(139,92,246,0.2)", background: "rgba(13,13,26,0.8)" }}
        >
          <button
            onClick={() => setZoom(z => Math.max(0.4, z * 0.8))}
            className="px-3 py-1.5 text-sm font-bold transition-colors hover:text-white"
            style={{ color: "#94a3b8", borderRight: "1px solid rgba(139,92,246,0.15)" }}
          >
            −
          </button>
          <span className="px-3 text-xs font-mono" style={{ color: "#a78bfa", minWidth: 52, textAlign: "center" }}>
            {zoomPct}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(10, z * 1.25))}
            className="px-3 py-1.5 text-sm font-bold transition-colors hover:text-white"
            style={{ color: "#94a3b8", borderLeft: "1px solid rgba(139,92,246,0.15)" }}
          >
            +
          </button>
        </div>

        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="btn-ghost text-xs px-3 py-1.5 rounded-xl"
        >
          Reset
        </button>

        {hoveredPixel && (
          <span className="ml-auto text-xs font-mono" style={{ color: "#6366f1" }}>
            x:{hoveredPixel.x} y:{hoveredPixel.y}
          </span>
        )}
      </div>

      {/* Canvas frame */}
      <div
        className="relative rounded-2xl overflow-hidden flex-1"
        style={{
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 0 40px rgba(139,92,246,0.1), inset 0 0 40px rgba(0,0,0,0.4)",
          background: "#0a0a18",
          minHeight: 320,
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l rounded-tl" style={{ borderColor: "rgba(139,92,246,0.5)" }} />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r rounded-tr" style={{ borderColor: "rgba(139,92,246,0.5)" }} />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l rounded-bl" style={{ borderColor: "rgba(139,92,246,0.5)" }} />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r rounded-br" style={{ borderColor: "rgba(139,92,246,0.5)" }} />

        <div className="overflow-auto w-full h-full p-4" onWheel={onWheel as unknown as React.WheelEventHandler<HTMLDivElement>}>
          <div style={{ transform: `translate(${pan.x}px,${pan.y}px)`, display: "inline-block" }}>
            <canvas
              ref={canvasRef}
              className="pixel-canvas"
              style={{
                cursor: address ? "crosshair" : "default",
                borderRadius: 4,
                boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
              }}
              onMouseMove={onMouseMove}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseLeave={() => setHoveredPixel(null)}
              onContextMenu={e => e.preventDefault()}
            />
          </div>
        </div>

        {/* No wallet overlay */}
        {!address && (
          <div
            className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none"
          >
            <div
              className="text-xs px-4 py-2 rounded-full"
              style={{
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "#a78bfa",
              }}
            >
              Connect wallet to paint pixels
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
