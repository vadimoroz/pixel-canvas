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
  const [selectedColor, setSelectedColor] = useState("#7c3aed");
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
    const interval = setInterval(loadCanvas, 30_000);
    return () => clearInterval(interval);
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
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0f" }}>
      <Header totalPixels={totalPixels} />

      <main className="flex-1 flex flex-col xl:flex-row gap-0">
        <div className="flex-1 p-4 xl:p-6 min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-medium text-white">200 x 100 Canvas</h2>
            <span className="text-xs text-[#64748b]">scroll to zoom, right-click to pan</span>
            {loading && (
              <span className="text-xs text-[#64748b] animate-pulse-slow ml-auto">Loading pixels...</span>
            )}
          </div>
          <Canvas
            pixels={pixels}
            selectedColor={selectedColor}
            onPixelClick={handlePixelClick}
            address={address}
            lastPlaced={lastPlaced}
          />
        </div>

        <div className="xl:w-80 p-4 xl:p-6 xl:border-l border-t xl:border-t-0 border-[#2a2a3e] flex flex-col gap-4">
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
