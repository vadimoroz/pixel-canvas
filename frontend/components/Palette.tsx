"use client";

import { useState } from "react";

const PALETTE = [
  "#000000","#ffffff","#94a3b8","#475569","#1e293b","#0f172a",
  "#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6",
  "#8b5cf6","#ec4899","#f43f5e","#10b981","#0ea5e9","#6366f1",
  "#fca5a5","#fdba74","#fde68a","#86efac","#67e8f9","#93c5fd",
  "#c4b5fd","#f9a8d4","#fecdd3","#6ee7b7","#a5f3fc","#bfdbfe",
  "#7f1d1d","#7c2d12","#713f12","#14532d","#164e63","#1e3a8a",
  "#4c1d95","#831843","#881337","#064e3b","#0c4a6e","#312e81",
  "#dc2626","#ea580c","#ca8a04","#16a34a","#0891b2","#2563eb",
];

export default function Palette({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  const [custom, setCustom] = useState("#8b5cf6");

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: "rgba(13,13,26,0.9)",
        border: "1px solid rgba(139,92,246,0.18)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#6366f1" }}>
          Palette
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-[10px]" style={{ color: "#64748b" }}>Custom</span>
          <div className="relative">
            <input
              type="color"
              value={custom}
              onChange={e => { setCustom(e.target.value); onSelect(e.target.value); }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <div
              className="w-6 h-6 rounded-lg border-2"
              style={{
                backgroundColor: custom,
                borderColor: custom === selected ? "rgba(255,255,255,0.8)" : "transparent",
                boxShadow: custom === selected ? "0 0 0 1px rgba(139,92,246,0.8)" : "none",
              }}
            />
          </div>
        </label>
      </div>

      {/* Swatches */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(6,1fr)" }}>
        {PALETTE.map(color => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`swatch w-full aspect-square rounded-lg ${selected === color ? "active" : ""}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Selected preview */}
      <div
        className="flex items-center gap-3 p-2.5 rounded-xl"
        style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0"
          style={{
            backgroundColor: selected,
            boxShadow: `0 0 16px ${selected}66`,
            border: "2px solid rgba(255,255,255,0.1)",
          }}
        />
        <div>
          <p className="text-[10px]" style={{ color: "#64748b" }}>Selected color</p>
          <p className="text-sm font-mono font-semibold text-white">{selected.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
