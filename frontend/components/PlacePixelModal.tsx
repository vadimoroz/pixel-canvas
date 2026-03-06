"use client";

import { useState } from "react";
import { openContractCall } from "@stacks/connect";
import { uintCV, stringAsciiCV } from "@stacks/transactions";
import { userSession } from "@/hooks/useStacks";
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "@/lib/stacks";

interface Props {
  x: number;
  y: number;
  color: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlacePixelModal({ x, y, color, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePlace = async () => {
    setLoading(true);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "place-pixel",
        functionArgs: [uintCV(x), uintCV(y), stringAsciiCV(color)],
        network: NETWORK,
        userSession,
        postConditions: [],
        onFinish: () => { onSuccess(); onClose(); },
        onCancel: () => setLoading(false),
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center fade-up"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-[340px] rounded-3xl p-6 shadow-2xl"
        style={{
          background: "rgba(13,13,26,0.98)",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 0 60px rgba(139,92,246,0.15), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)", boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
          >
            🎨
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-none">Place Pixel</h3>
            <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>Transaction on Stacks mainnet</p>
          </div>
        </div>

        {/* Preview */}
        <div
          className="flex items-center gap-4 p-3.5 rounded-2xl mb-5"
          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex-shrink-0"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 24px ${color}88, 0 0 8px ${color}44`,
              border: "2px solid rgba(255,255,255,0.1)",
            }}
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "#6366f1" }}>Color</span>
              <span className="text-sm font-mono font-bold text-white">{color.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "#6366f1" }}>Position</span>
              <span className="text-sm font-mono font-bold text-white">({x}, {y})</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button onClick={onClose} className="btn-ghost flex-1 py-3 text-sm rounded-xl">
            Cancel
          </button>
          <button
            onClick={handlePlace}
            disabled={loading}
            className="btn-primary flex-1 py-3 text-sm rounded-xl"
          >
            {loading ? "Opening wallet…" : "Paint it!"}
          </button>
        </div>
      </div>
    </div>
  );
}
