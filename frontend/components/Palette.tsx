"use client";

import { useState } from "react";

const PALETTE = [
  // Row 1 - blacks/whites/grays
  "#000000", "#1a1a1a", "#333333", "#555555", "#777777", "#999999", "#bbbbbb", "#dddddd", "#ffffff",
  // Row 2 - reds/pinks
  "#ff0000", "#cc0000", "#880000", "#ff4444", "#ff88aa", "#ff0066", "#cc0044", "#880033", "#ff69b4",
  // Row 3 - oranges/yellows
  "#ff6600", "#ff8800", "#ffaa00", "#ffcc00", "#ffee00", "#ffff00", "#cccc00", "#888800", "#ffe066",
  // Row 4 - greens
  "#00ff00", "#00cc00", "#008800", "#004400", "#44ff44", "#00ff88", "#00cc66", "#006633", "#88ff88",
  // Row 5 - blues/cyans
  "#0000ff", "#0000cc", "#000088", "#4444ff", "#8888ff", "#00ffff", "#00cccc", "#006666", "#88eeff",
  // Row 6 - purples/magentas
  "#8800ff", "#6600cc", "#440088", "#aa44ff", "#cc88ff", "#ff00ff", "#cc00cc", "#880088", "#ff88ff",
  // Row 7 - browns/skin tones
  "#8b4513", "#a0522d", "#cd853f", "#d2691e", "#f4a460", "#deb887", "#ffe4b5", "#ffd700", "#b8860b",
  // Row 8 - special
  "#ff4500", "#ff6347", "#20b2aa", "#4169e1", "#9370db", "#3cb371", "#dc143c", "#1e90ff", "#ff1493",
];

interface PaletteProps {
  selected: string;
  onSelect: (color: string) => void;
}

export default function Palette({ selected, onSelect }: PaletteProps) {
  const [custom, setCustom] = useState("#7c3aed");

  return (
    <div className="bg-[#12121a] border border-[#2a2a3e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Color Palette</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748b]">Custom:</span>
          <input
            type="color"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); onSelect(e.target.value); }}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(9, 1fr)" }}>
        {PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`color-swatch w-7 h-7 rounded-md relative ${selected === color ? "selected" : ""}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border-2 border-[#2a2a3e] flex-shrink-0"
          style={{ backgroundColor: selected }}
        />
        <div>
          <p className="text-xs text-[#64748b]">Selected</p>
          <p className="text-sm font-mono text-white">{selected.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
