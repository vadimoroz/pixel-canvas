"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Canvas from "@/components/Canvas";
import ColorPanel from "@/components/ColorPanel";
import Sidebar from "@/components/Sidebar";
import { useStacks } from "@/hooks/useStacks";
import { fetchCanvasPixels, getTotalPixels, PixelData } from "@/lib/canvas";

export default function App() {
  const { address } = useStacks();
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [totalPixels, setTotalPixels] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [panel, setPanel] = useState<{ x: number; y: number; sx: number; sy: number } | null>(null);
  const [lastPlaced, setLastPlaced] = useState<{ x: number; y: number } | null>(null);
  const [heatmap, setHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCanvas = useCallback(async () => {
    setLoading(true);
    const [pxs, total] = await Promise.all([fetchCanvasPixels(), getTotalPixels()]);
    setPixels(pxs);
    setTotalPixels(total);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCanvas();
    // poll: 30s
    const id = setInterval(loadCanvas, 30_000);
    return () => clearInterval(id);
  }, [loadCanvas]);

  const handlePixelClick = (x: number, y: number, sx: number, sy: number) => {
    if (!address) return;
    setPanel({ x, y, sx, sy });
  };

  const handleSuccess = (x: number, y: number) => {
    setLastPlaced({ x, y });
    setTimeout(loadCanvas, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ minHeight: "100dvh" }}>
      <Navbar totalPixels={totalPixels} />

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <main className="flex-1 flex flex-col p-4 gap-3 min-w-0 overflow-hidden">
          {/* Top bar info */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="badge">
              <span className="text-[10px]">200 × 100 canvas</span>
            </div>
            <div className="badge" style={{ background: "rgba(168,85,247,0.07)", borderColor: "rgba(168,85,247,0.2)", color: "#8b5cf6" }}>
              <span>scroll to zoom · drag to pan</span>
            </div>
            {selectedColor && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  borderColor: "rgba(99,102,241,0.15)",
                  color: "#1e1b4b",
                }}
              >
                <div className="w-3.5 h-3.5 rounded-full border border-white/80" style={{ backgroundColor: selectedColor }} />
                <span>{selectedColor.toUpperCase()}</span>
              </div>
            )}
            {loading && (
              <div className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: "#94a3b8" }}>
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="rgba(99,102,241,0.2)" strokeWidth="2"/>
                  <path d="M11 6A5 5 0 001 6" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Syncing…
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 glass rounded-2xl p-3 overflow-hidden" style={{ minHeight: 0 }}>
            <Canvas
              pixels={pixels}
              selectedColor={selectedColor}
              onPixelClick={handlePixelClick}
              address={address}
              lastPlaced={lastPlaced}
              heatmap={heatmap}
            />
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-72 p-4 overflow-hidden"
          style={{ borderLeft: "1px solid rgba(99,102,241,0.1)" }}
        >
          <Sidebar
            pixels={pixels}
            totalPixels={totalPixels}
            userAddress={address}
            heatmap={heatmap}
            onHeatmapToggle={() => setHeatmap(h => !h)}
            loading={loading}
          />
        </aside>
      </div>

      {/* Floating color panel */}
      {panel && address && (
        <ColorPanel
          x={panel.x}
          y={panel.y}
          screenX={panel.sx}
          screenY={panel.sy}
          onClose={() => setPanel(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
