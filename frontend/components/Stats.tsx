"use client";

import { PixelData } from "@/lib/canvas";
import { truncateAddress } from "@/lib/stacks";

interface StatsProps {
  pixels: PixelData[];
  totalPixels: number;
  userAddress: string | null;
}

function getTopPainters(pixels: PixelData[], limit = 5) {
  const counts = new Map<string, number>();
  for (const p of pixels) {
    counts.set(p.owner, (counts.get(p.owner) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function getTopColors(pixels: PixelData[], limit = 6) {
  const counts = new Map<string, number>();
  for (const p of pixels) {
    const c = p.color.toLowerCase();
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default function Stats({ pixels, totalPixels, userAddress }: StatsProps) {
  const topPainters = getTopPainters(pixels);
  const topColors = getTopColors(pixels);
  const userCount = userAddress ? pixels.filter((p) => p.owner === userAddress).length : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#12121a] border border-[#2a2a3e] rounded-xl p-3">
          <p className="text-xs text-[#64748b]">Total Pixels</p>
          <p className="text-2xl font-bold text-white mt-1">{totalPixels.toLocaleString()}</p>
        </div>
        <div className="bg-[#12121a] border border-[#2a2a3e] rounded-xl p-3">
          <p className="text-xs text-[#64748b]">Your Pixels</p>
          <p className="text-2xl font-bold text-violet-400 mt-1">{userCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Top painters */}
      <div className="bg-[#12121a] border border-[#2a2a3e] rounded-xl p-4">
        <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-3">Top Painters</p>
        {topPainters.length === 0 ? (
          <p className="text-xs text-[#64748b]">No pixels yet — be the first!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topPainters.map(([addr, count], i) => (
              <div key={addr} className="flex items-center gap-2">
                <span className="text-xs text-[#64748b] w-4">{i + 1}</span>
                <span className={`text-xs font-mono flex-1 truncate ${addr === userAddress ? "text-violet-400" : "text-white"}`}>
                  {truncateAddress(addr)}
                  {addr === userAddress && " (you)"}
                </span>
                <span className="text-xs text-[#64748b]">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top colors */}
      {topColors.length > 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3e] rounded-xl p-4">
          <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-3">Top Colors</p>
          <div className="flex flex-wrap gap-2">
            {topColors.map(([color, count]) => (
              <div key={color} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded" style={{ backgroundColor: color }} />
                <span className="text-xs text-[#64748b]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract info */}
      <div className="bg-[#12121a] border border-[#2a2a3e] rounded-xl p-4">
        <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">Contract</p>
        <a
          href="https://explorer.hiro.so/txid/SPQA4V5SGDWREAAAEH8WJHT2841Y6ANESQFXN8JH.pixel-canvas-v2?chain=mainnet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-violet-400 hover:text-violet-300 break-all"
        >
          SPQA4V5S...pixel-canvas-v2
        </a>
      </div>
    </div>
  );
}
