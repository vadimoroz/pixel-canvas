export interface Pixel {
  x: number;
  y: number;
  color: string; // hex, e.g. "#FF0000"
  owner: string;
  placedAt: number; // block height
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface PlacePixelOptions {
  x: number;
  y: number;
  color: string;
}

export interface PixelPlacement {
  x: number;
  y: number;
  color: string;
  owner: string;
  placedAt: number;
  txid?: string;
}

export interface CanvasStats {
  totalPixels: number;
  uniquePainters: number;
  filledPercent: number;
}
