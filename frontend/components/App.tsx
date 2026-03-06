"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Canvas from "@/components/Canvas";
import Palette from "@/components/Palette";
import Stats from "@/components/Stats";
import PlacePixelModal from "@/components/PlacePixelModal";
import { useStacks } from "@/hooks/useStacks";
import { fetchCanvasPixels, getTotalPixels, PixelData } from "@/lib/canvas";

export default function App() {
  const { address } = useStacks();
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [totalPixels, setTotalPixels] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#8b5cf6");
  const [modal, setModal] = useState<{ x: number; y: number } | null>(null);
  const [lastPlaced, setLastPlaced] = useState<{ x: number; y: number } | null>(null);
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
    const id = setInterval(loadCanvas, 30_000);
    return () => clearInterval(id);
  }, [loadCanvas]);

  const handlePixelClick = (x: number, y: number) => {
    if (!address) return;
    setModal({ x, y });
  };

  const handleSuccess = () => {
    if (modal) setLastPlaced({ x: modal.x, y: modal.y });
    setTimeout(loadCanvas, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#05050f" }}>
      {/* Ambient orbs */}
      <div
        className="bg-orb"
        style={{ width: 500, height: 500, top: -150, left: -100, background: "rgba(139,92,246,0.06)" }}
      />
      <div
        className="bg-orb"
        style={{ width: 400, height: 400, bottom: -100, right: -80, background: "rgba(236,72,153,0.04)" }}
      />

      <Header totalPixels={totalPixels} />

      <main className="relative z-10 flex-1 flex flex-col xl:flex-row" style={{ minHeight: 0 }}>
        {/* Canvas area */}
        <div className="flex-1 flex flex-col p-4 xl:p-6 min-w-0 gap-3">
          {/* Canvas label */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  color: "#a78bfa",
                }}
              >
                200 × 100
              </span>
              <span className="text-xs" style={{ color: "#334155" }}>
                scroll to zoom · right-drag to pan
              </span>
            </div>
            {loading && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: "#6366f1" }} />
                <span className="text-xs" style={{ color: "#475569" }}>Loading…</span>
              </div>
            )}
          </div>

          {/* Canvas fills remaining height */}
          <div className="flex-1" style={{ minHeight: 360 }}>
            <Canvas
              pixels={pixels}
              selectedColor={selectedColor}
              onPixelClick={handlePixelClick}
              address={address}
              lastPlaced={lastPlaced}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div
          className="xl:w-72 p-4 xl:p-5 flex flex-col gap-3 xl:overflow-y-auto"
          style={{ borderLeft: "1px solid rgba(139,92,246,0.1)" }}
        >
          <Palette selected={selectedColor} onSelect={setSelectedColor} />
          <Stats pixels={pixels} totalPixels={totalPixels} userAddress={address} />
        </div>
      </main>

      {modal && address && (
        <PlacePixelModal
          x={modal.x}
          y={modal.y}
          color={selectedColor}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
