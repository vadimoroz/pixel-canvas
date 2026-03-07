"use client";

import { useMemo, useEffect, useState, useRef, memo } from "react";
import { PixelData, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvas";
import { truncateAddress } from "@/lib/stacks";

interface SidebarProps {
  pixels: PixelData[];
  totalPixels: number;
  userAddress: string | null;
  heatmap: boolean;
  onHeatmapToggle: () => void;
  loading: boolean;
}

function timeAgo(blocks: number, currentBlock: number) {
  const diff = currentBlock - blocks;
  if (diff <= 0) return "just now";
  const mins = Math.round(diff * 10);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function getLeaderboard(pixels: PixelData[]) {
  const counts = new Map<string, number>();
  for (const p of pixels) counts.set(p.owner, (counts.get(p.owner) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

const rankColors = ["#f59e0b", "#94a3b8", "#cd7c2f"];
const rankLabels = ["🥇", "🥈", "🥉"];

function Sidebar({ pixels, totalPixels, userAddress, heatmap, onHeatmapToggle, loading }: SidebarProps) {
  const leaderboard = useMemo(() => getLeaderboard(pixels), [pixels]);
  const userCount = useMemo(() => pixels.filter(p => p.owner === userAddress).length, [pixels, userAddress]);
  const [currentBlock, setCurrentBlock] = useState(0);

  const recentActivity = useMemo(() =>
    [...pixels].sort((a, b) => b.placedAt - a.placedAt).slice(0, 30),
    [pixels]
  );

  useEffect(() => {
    fetch("https://api.mainnet.hiro.so/v2/info")
      .then(r => r.json())
      .then(d => setCurrentBlock(d.stacks_tip_height ?? 0))
      .catch(() => {});
  }, []);

  const filled = Math.min(100, Math.round((pixels.length / (CANVAS_WIDTH * CANVAS_HEIGHT)) * 100 * 100) / 100);
  const uniquePainters = useMemo(() => new Set(pixels.map(p => p.owner)).size, [pixels]);

  return (
    <div
      className="flex flex-col gap-4 h-full overflow-y-auto pb-6"
      style={{ scrollbarWidth: "thin" }}
    >
      {/* Stats */}
      <div>
        <p className="section-title mb-3">Canvas Stats</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="stat-card">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#6366f1" }}>Total Pixels</p>
            <p className="text-xl font-black" style={{ color: "#1e1b4b" }}>{totalPixels.toLocaleString()}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>placed on chain</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#8b5cf6" }}>Yours</p>
            <p className="text-xl font-black" style={{ color: userAddress ? "#8b5cf6" : "#cbd5e1" }}>
              {userCount.toLocaleString()}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>pixels painted</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#10b981" }}>Artists</p>
            <p className="text-xl font-black" style={{ color: "#1e1b4b" }}>{uniquePainters}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>unique wallets</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#f59e0b" }}>Filled</p>
            <p className="text-xl font-black" style={{ color: "#1e1b4b" }}>{filled}%</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>of canvas</p>
          </div>
        </div>

        {/* Fill bar */}
        <div
          className="mt-2 p-2.5 rounded-xl"
          style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "#94a3b8" }}>
            <span>Canvas coverage</span>
            <span className="font-bold" style={{ color: "#6366f1" }}>{filled}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "rgba(99,102,241,0.12)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(filled, 0.3)}%`,
                background: "linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Heatmap toggle */}
      <button
        onClick={onHeatmapToggle}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${heatmap ? "btn-primary" : "btn-ghost"}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="3" fill={heatmap ? "white" : "#6366f1"} fillOpacity={heatmap ? "0.9" : "0.6"}/>
          <circle cx="7" cy="7" r="6" stroke={heatmap ? "white" : "#6366f1"} strokeWidth="1" strokeOpacity="0.5"/>
        </svg>
        {heatmap ? "Heatmap ON" : "Heatmap mode"}
      </button>

      {/* Leaderboard */}
      <div>
        <p className="section-title mb-3">Leaderboard</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(99,102,241,0.12)", background: "rgba(255,255,255,0.5)" }}
        >
          {/* Table header */}
          <div
            className="grid text-[10px] font-bold uppercase tracking-wider px-3 py-2"
            style={{
              gridTemplateColumns: "28px 1fr 48px",
              background: "rgba(99,102,241,0.06)",
              color: "#94a3b8",
              borderBottom: "1px solid rgba(99,102,241,0.1)",
            }}
          >
            <span>#</span>
            <span>Artist</span>
            <span className="text-right">Pixels</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="px-3 py-6 text-center">
              {loading ? (
                <div className="shimmer h-4 rounded-lg" style={{ background: "rgba(99,102,241,0.1)" }} />
              ) : (
                <p className="text-xs" style={{ color: "#94a3b8" }}>No activity yet</p>
              )}
            </div>
          ) : (
            leaderboard.map(([addr, count], i) => (
              <div
                key={addr}
                className="lb-row"
                style={{
                  gridTemplateColumns: "28px 1fr 48px",
                  display: "grid",
                  borderBottom: i < leaderboard.length - 1 ? "1px solid rgba(99,102,241,0.06)" : "none",
                  background: addr === userAddress ? "rgba(99,102,241,0.05)" : "transparent",
                }}
              >
                <span
                  className="text-sm text-center"
                  style={{ color: i < 3 ? rankColors[i] : "#94a3b8", fontWeight: i < 3 ? 700 : 500 }}
                >
                  {i < 3 ? rankLabels[i] : i + 1}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${parseInt(addr.slice(2,6),16) % 360},70%,60%), hsl(${(parseInt(addr.slice(2,6),16) + 120) % 360},70%,60%))`,
                    }}
                  />
                  <span
                    className="text-xs font-mono truncate"
                    style={{ color: addr === userAddress ? "#6366f1" : "#1e1b4b", fontWeight: addr === userAddress ? 700 : 500 }}
                  >
                    {truncateAddress(addr)}{addr === userAddress ? " ✦" : ""}
                  </span>
                </div>
                <span className="text-xs font-bold text-right pr-1" style={{ color: i === 0 ? "#f59e0b" : "#64748b" }}>
                  {count.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title flex-1">Activity Feed</p>
          {loading && (
            <span className="text-[10px] font-medium blink ml-2" style={{ color: "#6366f1" }}>live</span>
          )}
        </div>

        <div
          className="rounded-xl overflow-hidden flex flex-col gap-0.5 p-1.5"
          style={{ border: "1px solid rgba(99,102,241,0.12)", background: "rgba(255,255,255,0.5)", maxHeight: 300, overflowY: "auto" }}
        >
          {recentActivity.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "#94a3b8" }}>
              {loading ? "Loading…" : "No activity yet — be the first!"}
            </p>
          ) : (
            recentActivity.map((p, i) => (
              <div key={`${p.x}-${p.y}-${i}`} className="activity-item">
                {/* Color dot */}
                <div
                  className="w-5 h-5 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: p.color,
                    boxShadow: `0 2px 8px ${p.color}66`,
                    border: "1.5px solid rgba(255,255,255,0.8)",
                  }}
                />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate" style={{ color: "#1e1b4b" }}>
                    <span style={{ color: "#6366f1" }}>{truncateAddress(p.owner)}</span>
                    {" painted "}
                    <span className="font-mono" style={{ color: "#64748b" }}>({p.x},{p.y})</span>
                  </p>
                </div>
                {/* Time */}
                {currentBlock > 0 && (
                  <span className="text-[10px] flex-shrink-0" style={{ color: "#94a3b8" }}>
                    {timeAgo(p.placedAt, currentBlock)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contract link */}
      <div
        className="rounded-xl p-3 flex items-center justify-between"
        style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)" }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6366f1" }}>Contract</p>
          <p className="text-[11px] font-mono mt-0.5" style={{ color: "#94a3b8" }}>pixel-canvas-v2</p>
        </div>
        <a
          href="https://explorer.hiro.so/txid/SPQA4V5SGDWREAAAEH8WJHT2841Y6ANESQFXN8JH.pixel-canvas-v2?chain=mainnet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.18)",
            color: "#6366f1",
          }}
        >
          Explorer ↗
        </a>
      </div>
    </div>
  );
}

export default memo(Sidebar);
