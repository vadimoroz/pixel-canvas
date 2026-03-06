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
        functionArgs: [
          uintCV(x),
          uintCV(y),
          stringAsciiCV(color),
        ],
        network: NETWORK,
        userSession,
        postConditions: [],
        onFinish: () => {
          onSuccess();
          onClose();
        },
        onCancel: () => {
          setLoading(false);
        },
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-slide-up">
      <div className="bg-[#12121a] border border-[#2a2a3e] rounded-2xl p-6 w-80 shadow-2xl">
        <h3 className="font-bold text-white text-lg mb-1">Place Pixel</h3>
        <p className="text-xs text-[#64748b] mb-5">This will submit a transaction on Stacks mainnet.</p>

        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-xl border-2 border-[#2a2a3e] flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <div>
            <p className="text-sm text-white font-mono">{color.toUpperCase()}</p>
            <p className="text-xs text-[#64748b] mt-1">
              Position: <span className="text-white font-mono">({x}, {y})</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#2a2a3e] text-sm text-[#64748b] hover:text-white hover:border-[#3a3a5e] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePlace}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {loading ? "Opening..." : "Place Pixel"}
          </button>
        </div>
      </div>
    </div>
  );
}
