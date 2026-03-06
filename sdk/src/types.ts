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
