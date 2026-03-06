"use client";

import { useState, useEffect, useRef } from "react";
import { openContractCall } from "@stacks/connect";
import { uintCV, stringAsciiCV } from "@stacks/transactions";
import { userSession } from "@/hooks/useStacks";
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "@/lib/stacks";

const COLORS = [
  "#000000","#ffffff","#f8fafc","#1e293b","#334155","#64748b","#94a3b8","#cbd5e1","#e2e8f0",
  "#ef4444","#f97316","#f59e0b","#84cc16","#22c55e","#10b981","#06b6d4","#3b82f6","#8b5cf6",
  "#ec4899","#f43f5e","#fb923c","#fbbf24","#a3e635","#4ade80","#34d399","#22d3ee","#60a5fa",
  "#a78bfa","#f472b6","#fecaca","#fed7aa","#fef08a","#d9f99d","#bbf7d0","#a5f3fc","#bfdbfe",
  "#ddd6fe","#fbcfe8","#7f1d1d","#7c2d12","#78350f","#365314","#14532d","#164e63","#1e3a8a",
  "#3730a3","#581c87","#831843","#be185d","#b45309","#4d7c0f","#047857","#0e7490","#1d4ed8",
];

interface Props {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  onClose: () => void;
  onSuccess: (x: number, y: number) => void;
}

export default function ColorPanel({ x, y, screenX, screenY, onClose, onSuccess }: Props) {
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [custom, setCustom] = useState("#6366f1");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Position smartly inside viewport
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!panelRef.current) return;
    const pw = 300, ph = 440;
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = screenX + 16;
    let top = screenY - 20;
    if (left + pw > vw - 16) left = screenX - pw - 16;
    if (top + ph > vh - 16) top = vh - ph - 16;
    if (top < 16) top = 16;
    setPos({ top, left });
  }, [screenX, screenY]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handlePlace = async () => {
    setLoading(true);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "place-pixel",
        functionArgs: [uintCV(x), uintCV(y), stringAsciiCV(selectedColor)],
        network: NETWORK,
        userSession,
        postConditions: [],
        onFinish: () => { onSuccess(x, y); onClose(); },
        onCancel: () => setLoading(false),
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div
      ref={panelRef}
      className="glass-panel fixed z-50 fade-scale rounded-2xl p-4 flex flex-col gap-3"
      style={{ width: 300, top: pos.top, left: pos.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 11L6 3.5L10 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5 8.5H8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#1e1b4b" }}>Place Pixel</p>
            <p className="text-[10px] font-mono" style={{ color: "#94a3b8" }}>
              x: {x} &nbsp;·&nbsp; y: {y}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-indigo-50"
          style={{ color: "#94a3b8" }}
        >
          ✕
        </button>
      </div>

      {/* Selected color preview */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0"
          style={{
            backgroundColor: selectedColor,
            boxShadow: `0 4px 16px ${selectedColor}66`,
            border: "2px solid rgba(255,255,255,0.8)",
          }}
        />
        <div className="flex-1">
          <p className="text-xs font-semibold text-white" style={{ color: "#1e1b4b" }}>
            {selectedColor.toUpperCase()}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>Selected color</p>
        </div>
        {/* Custom picker */}
        <label className="relative cursor-pointer tooltip" data-tip="Custom color">
          <input
            type="color"
            value={custom}
            onChange={e => { setCustom(e.target.value); setSelectedColor(e.target.value); }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <div
            className="w-8 h-8 rounded-xl border-2 border-dashed"
            style={{ backgroundColor: custom, borderColor: "rgba(99,102,241,0.4)" }}
          />
        </label>
      </div>

      {/* Palette grid */}
      <div>
        <p className="section-title mb-2">Color Palette</p>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(9, 1fr)" }}>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`swatch aspect-square w-full ${selectedColor === c ? "active" : ""}`}
              style={{ backgroundColor: c, minWidth: 0 }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Transaction info */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
        style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}
      >
        <div className="flex items-center gap-1.5" style={{ color: "#64748b" }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <circle cx="5.5" cy="5.5" r="5" stroke="#64748b" strokeWidth="1"/>
            <path d="M5.5 3v3l2 1.2" stroke="#64748b" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Tx cost
        </div>
        <span className="font-semibold" style={{ color: "#6366f1" }}>~0.001 STX</span>
      </div>

      {/* Action */}
      <button
        onClick={handlePlace}
        disabled={loading}
        className="btn-primary w-full py-3 text-sm rounded-xl"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
              <path d="M13 7A6 6 0 001 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Opening wallet…
          </span>
        ) : (
          "🎨 Paint Pixel"
        )}
      </button>
    </div>
  );
}
