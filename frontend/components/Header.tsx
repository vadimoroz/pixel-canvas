"use client";

import { useStacks } from "@/hooks/useStacks";
import { truncateAddress } from "@/lib/stacks";

export default function Header({ totalPixels }: { totalPixels: number }) {
  const { address, connect, disconnect, mounted } = useStacks();

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
      style={{
        background: "rgba(5,5,15,0.75)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black select-none"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            boxShadow: "0 0 20px rgba(139,92,246,0.4)",
          }}
        >
          ⬛
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-none tracking-tight">Pixel Canvas</p>
          <p className="text-[10px] leading-none mt-0.5" style={{ color: "#6366f1" }}>
            on Stacks blockchain
          </p>
        </div>
      </div>

      {/* Center badge */}
      <div
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa" }} />
        <span className="text-xs" style={{ color: "#94a3b8" }}>
          <span className="font-semibold" style={{ color: "#e2e8f0" }}>
            {totalPixels.toLocaleString()}
          </span>{" "}
          pixels painted
        </span>
      </div>

      {/* Wallet */}
      {mounted && (
        <div className="flex items-center gap-2">
          {address ? (
            <>
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                style={{
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  color: "#a78bfa",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
                >
                  ✓
                </span>
                {truncateAddress(address)}
              </div>
              <button onClick={disconnect} className="btn-ghost text-xs px-3 py-1.5">
                Disconnect
              </button>
            </>
          ) : (
            <button onClick={connect} className="btn-primary text-xs px-4 py-2">
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </header>
  );
}
