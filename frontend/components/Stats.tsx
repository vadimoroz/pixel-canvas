"use client";

import { PixelData } from "@/lib/canvas";
import { truncateAddress } from "@/lib/stacks";

function getTopPainters(pixels: PixelData[], limit = 5) {
  const counts = new Map<string, number>();
  for (const p of pixels) counts.set(p.owner, (counts.get(p.owner) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function getTopColors(pixels: PixelData[], limit = 8) {
  const counts = new Map<string, number>();
  for (const p of pixels) {
    const c = p.color.toLowerCase();
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

const medal = ["🥇", "🥈", "🥉"];

const card = {
  background: "rgba(13,13,26,0.9)",
  border: "1px solid rgba(139,92,246,0.18)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

export default function Stats({ pixels, totalPixels, userAddress }: {
  pixels: PixelData[];
  totalPixels: number;
  userAddress: string | null;
}) {
  const topPainters = getTopPainters(pixels);
  const topColors = getTopColors(pixels);
  const userCount = userAddress ? pixels.filter(p => p.owner === userAddress).length : 0;
  const filled = Math.round((pixels.length / (200 * 100)) * 100);

  return (
    <div className="flex flex-col gap-3">

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-3" style={card}>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: "#6366f1" }}>
            Total
          </p>
          <p className="text-2xl font-black text-white leading-none">{totalPixels.toLocaleString()}</p>
          <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>pixels placed</p>
        </div>
        <div className="rounded-2xl p-3" style={card}>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: "#ec4899" }}>
            Yours
          </p>
          <p className="text-2xl font-black leading-none" style={{ color: userAddress ? "#c4b5fd" : "#334155" }}>
            {userCount.toLocaleString()}
          </p>
          <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>pixels painted</p>
        </div>
      </div>

      {/* Canvas fill bar */}
      <div className="rounded-2xl p-3" style={card}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#6366f1" }}>
            Canvas filled
          </span>
          <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>{filled}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max(filled, 0.5)}%`,
              background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
            }}
          />
        </div>
      </div>

      {/* Top painters */}
      <div className="rounded-2xl p-4" style={card}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#6366f1" }}>
          Top Painters
        </p>
        {topPainters.length === 0 ? (
          <p className="text-xs" style={{ color: "#475569" }}>No pixels yet — be first!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topPainters.map(([addr, count], i) => (
              <div key={addr} className="flex items-center gap-2.5">
                <span className="text-sm w-5 text-center">{medal[i] ?? `${i + 1}.`}</span>
                <div
                  className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: addr === userAddress
                      ? "rgba(139,92,246,0.12)"
                      : "rgba(255,255,255,0.03)",
                    border: addr === userAddress
                      ? "1px solid rgba(139,92,246,0.3)"
                      : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    className="text-xs font-mono truncate"
                    style={{ color: addr === userAddress ? "#c4b5fd" : "#94a3b8", maxWidth: 100 }}
                  >
                    {truncateAddress(addr)}
                    {addr === userAddress && " ✦"}
                  </span>
                  <span className="text-xs font-semibold ml-2" style={{ color: "#e2e8f0" }}>
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top colors */}
      {topColors.length > 0 && (
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#6366f1" }}>
            Top Colors
          </p>
          <div className="flex flex-wrap gap-2">
            {topColors.map(([color, count]) => (
              <div
                key={color}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-4 h-4 rounded-md flex-shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
                />
                <span className="text-[10px]" style={{ color: "#64748b" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract link */}
      <div className="rounded-2xl p-3" style={card}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#6366f1" }}>
          Contract
        </p>
        <a
          href="https://explorer.hiro.so/txid/SPQA4V5SGDWREAAAEH8WJHT2841Y6ANESQFXN8JH.pixel-canvas-v2?chain=mainnet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono transition-colors"
          style={{ color: "#8b5cf6" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#c4b5fd")}
          onMouseLeave={e => (e.currentTarget.style.color = "#8b5cf6")}
        >
          pixel-canvas-v2 ↗
        </a>
      </div>
    </div>
  );
}
