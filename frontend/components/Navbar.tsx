"use client";

import { useEffect, useState } from "react";
import { useStacks } from "@/hooks/useStacks";
import { truncateAddress } from "@/lib/stacks";

function useBalance(address: string | null) {
  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    if (!address) { setBalance(null); return; }
    fetch(`https://api.mainnet.hiro.so/v2/accounts/${address}?proof=0`)
      .then(r => r.json())
      .then(d => {
        const stx = parseInt(d.balance ?? "0") / 1_000_000;
        setBalance(stx.toFixed(2));
      })
      .catch(() => setBalance("—"));
  }, [address]);
  return balance;
}

export default function Navbar({ totalPixels }: { totalPixels: number }) {
  const { address, connect, disconnect, mounted } = useStacks();
  const balance = useBalance(address);

  return (
    <nav className="glass-nav sticky top-0 z-50 h-16 flex items-center px-5 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.45)" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
            <rect x="7" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6"/>
            <rect x="13" y="1" width="4" height="5" rx="1" fill="white" fillOpacity="0.3"/>
            <rect x="1" y="7" width="5" height="5" rx="1" fill="white" fillOpacity="0.6"/>
            <rect x="7" y="7" width="5" height="5" rx="1" fill="white"/>
            <rect x="13" y="7" width="4" height="5" rx="1" fill="white" fillOpacity="0.6"/>
            <rect x="1" y="13" width="5" height="4" rx="1" fill="white" fillOpacity="0.3"/>
            <rect x="7" y="13" width="5" height="4" rx="1" fill="white" fillOpacity="0.6"/>
            <rect x="13" y="13" width="4" height="4" rx="1" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-[15px] leading-none" style={{ color: "#1e1b4b" }}>
            Pixel<span style={{ color: "#6366f1" }}>Canvas</span>
          </p>
          <p className="text-[10px] leading-none mt-0.5 font-medium" style={{ color: "#94a3b8" }}>
            on Stacks
          </p>
        </div>
      </div>

      {/* Center stats */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <div className="badge">
          <span className="blink w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
          <span>{totalPixels.toLocaleString()} pixels painted</span>
        </div>
        <div className="badge badge-green hidden sm:flex">
          <span className="blink w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Mainnet live</span>
        </div>
      </div>

      {/* Wallet */}
      {mounted && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {address ? (
            <>
              {balance !== null && (
                <div
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(99,102,241,0.07)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    color: "#4f46e5",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="#6366f1" strokeWidth="1"/>
                    <text x="6" y="8.5" textAnchor="middle" fontSize="6" fill="#6366f1" fontWeight="700">S</text>
                  </svg>
                  {balance} STX
                </div>
              )}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.14)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)" }}
                />
                <span className="text-xs font-medium" style={{ color: "#4f46e5" }}>
                  {truncateAddress(address)}
                </span>
              </div>
              <button onClick={disconnect} className="btn-ghost btn-sm text-xs">
                Disconnect
              </button>
            </>
          ) : (
            <button onClick={connect} className="btn-primary px-5 py-2 text-sm">
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
