import { STACKS_MAINNET } from "@stacks/network";

export const NETWORK = STACKS_MAINNET;

export const CONTRACT_ADDRESS = "SPQA4V5SGDWREAAAEH8WJHT2841Y6ANESQFXN8JH";
export const CONTRACT_NAME = "pixel-canvas-v2";
export const CANVAS_WIDTH = 200;
export const CANVAS_HEIGHT = 100;

export function truncateAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function hexToColor(hex: string): string {
  return hex.startsWith("#") ? hex : `#${hex}`;
}
