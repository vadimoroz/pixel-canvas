// sdk-rev: 1
import { CanvasSize, Pixel, PlacePixelOptions } from './types';

const CONTRACT_ADDRESS = 'SPQA4V5SGDWREAAAEH8WJHT2841Y6ANESQFXN8JH';
const CONTRACT_NAME = 'pixel-canvas-v2';
const API_BASE = 'https://api.mainnet.hiro.so';

export class PixelCanvasClient {
  private baseUrl: string;

  constructor(apiBase = API_BASE) {
    this.baseUrl = apiBase;
  }

  private async callReadOnly(fn: string, args: unknown[] = []): Promise<unknown> {
    const url = `${this.baseUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${fn}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: CONTRACT_ADDRESS, arguments: args }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  async getPixel(x: number, y: number): Promise<Pixel | null> {
    const { cvToJSON, uintCV } = await import('@stacks/transactions');
    const { serializeCV } = await import('@stacks/transactions');

    const xArg = '0x' + Buffer.from(serializeCV(uintCV(x))).toString('hex');
    const yArg = '0x' + Buffer.from(serializeCV(uintCV(y))).toString('hex');

    const result = await this.callReadOnly('get-pixel', [xArg, yArg]) as { result: string };
    const cv = cvToJSON(result as any);

    if (!cv || cv.type === 'none') return null;

    const val = cv.value;
    return {
      x,
      y,
      color: val.color.value,
      owner: val.owner.value,
      placedAt: parseInt(val['placed-at'].value),
    };
  }

  async getPixelCount(address: string): Promise<number> {
    const { cvToJSON, standardPrincipalCV, serializeCV } = await import('@stacks/transactions');
    const addrArg = '0x' + Buffer.from(serializeCV(standardPrincipalCV(address))).toString('hex');
    const result = await this.callReadOnly('get-pixel-count', [addrArg]) as { result: string };
    const cv = cvToJSON(result as any);
    return parseInt(cv?.value ?? '0');
  }

  async getTotalPixels(): Promise<number> {
    const { cvToJSON } = await import('@stacks/transactions');
    const result = await this.callReadOnly('get-total-pixels') as { result: string };
    const cv = cvToJSON(result as any);
    return parseInt(cv?.value ?? '0');
  }

  async getCanvasSize(): Promise<CanvasSize> {
    const { cvToJSON } = await import('@stacks/transactions');
    const result = await this.callReadOnly('get-canvas-size') as { result: string };
    const cv = cvToJSON(result as any);
    return {
      width: parseInt(cv?.value?.width?.value ?? '200'),
      height: parseInt(cv?.value?.height?.value ?? '100'),
    };
  }

  getContractAddress(): string {
    return `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
  }

  getPlacePixelArgs(opts: PlacePixelOptions) {
    return {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'place-pixel',
      functionArgs: opts,
    };
  }
}
