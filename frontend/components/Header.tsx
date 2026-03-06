"use client";

import { useStacks } from "@/hooks/useStacks";
import { truncateAddress } from "@/lib/stacks";

export default function Header({ totalPixels }: { totalPixels: number }) {
  const { address, connect, disconnect, mounted } = useStacks();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3e] bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-sm font-bold">
          P
        </div>
        <div>
          <h1 className="font-bold text-white leading-none">Pixel Canvas</h1>
          <p className="text-xs text-[#64748b] leading-none mt-0.5">on Stacks blockchain</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-[#12121a] border border-[#2a2a3e] rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse-slow" />
          <span className="text-xs text-[#64748b]">
            <span className="text-white font-medium">{totalPixels.toLocaleString()}</span> pixels placed
          </span>
        </div>

        {mounted && (
          address ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748b] hidden sm:block">{truncateAddress(address)}</span>
              <button
                onClick={disconnect}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a3e] text-[#64748b] hover:text-white hover:border-[#7c3aed] transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-medium transition-all shadow-lg shadow-violet-900/30"
            >
              Connect Wallet
            </button>
          )
        )}
      </div>
    </header>
  );
}
