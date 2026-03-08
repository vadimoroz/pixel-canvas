import { CONTRACT_ADDRESS, CONTRACT_NAME, CANVAS_WIDTH, CANVAS_HEIGHT } from "./stacks";

export interface PixelData {
  x: number;
  y: number;
  color: string;
  owner: string;
  placedAt: number;
}

// cache-bust: 1772969241742
const API = "https://api.mainnet.hiro.so";

async function callReadOnly(fn: string, args: string[] = []): Promise<unknown> {
  const res = await fetch(
    `${API}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${fn}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: CONTRACT_ADDRESS, arguments: args }),
    }
  );
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function encodeUint(n: number): string {
  // Clarity uint serialization: 0x01 + big-endian 16 bytes
  const buf = Buffer.alloc(17);
  buf[0] = 0x01;
  buf.writeBigUInt64BE(BigInt(0), 1);
  buf.writeBigUInt64BE(BigInt(n), 9);
  return "0x" + buf.toString("hex");
}

function encodePrincipal(addr: string): string {
  // Use @stacks/transactions for proper encoding is complex here;
  // We'll use a simpler approach via the API
  return addr;
}

export async function getTotalPixels(): Promise<number> {
  try {
    const res = await callReadOnly("get-total-pixels") as { result: string };
    // result is Clarity value hex: 0x010000...NNNN (uint)
    const hex = res.result.replace("0x", "");
    return parseInt(hex.slice(2), 16); // skip type byte
  } catch {
    return 0;
  }
}

export async function getPixel(x: number, y: number): Promise<PixelData | null> {
  try {
    const xArg = encodeUint(x);
    const yArg = encodeUint(y);
    const res = await callReadOnly("get-pixel", [xArg, yArg]) as { result: string };

    const hex = res.result;
    // 0x09 = some, 0x08 = none (optional)
    if (hex.startsWith("0x09")) {
      // Parse tuple from hex — rough extraction via string match
      // For full accuracy use cvToValue from @stacks/transactions
      return null; // placeholder, canvas loads via events/bulk
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch recent pixel placements via contract events
export async function fetchRecentPixels(limit = 500): Promise<PixelData[]> {
  try {
    const res = await fetch(
      `${API}/extended/v1/contract/${CONTRACT_ADDRESS}.${CONTRACT_NAME}/events?limit=${limit}&offset=0`
    );
    if (!res.ok) return [];
    const data = await res.json() as { results: Array<{
      event_type: string;
      contract_log?: { value: { repr: string } };
      tx_id: string;
    }> };

    // Parse from tx history instead
    return [];
  } catch {
    return [];
  }
}

// Fetch pixels from transaction history (place-pixel calls)
export async function fetchCanvasPixels(): Promise<PixelData[]> {
  try {
    const pixels: PixelData[] = [];
    let offset = 0;
    const limit = 50;

    while (offset < 500) {
      const res = await fetch(
        `${API}/extended/v1/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}/transactions?limit=${limit}&offset=${offset}`
      );
      if (!res.ok) break;
      const data = await res.json() as {
        results: Array<{
          tx_type: string;
          tx_status: string;
          sender_address: string;
          block_height: number;
          contract_call?: {
            function_name: string;
            function_args: Array<{ repr: string }>;
          };
        }>;
        total: number;
      };

      if (!data.results?.length) break;

      for (const tx of data.results) {
        if (
          tx.tx_status === "success" &&
          tx.contract_call?.function_name === "place-pixel" &&
          tx.contract_call.function_args.length === 3
        ) {
          const args = tx.contract_call.function_args;
          const x = parseInt(args[0].repr.replace("u", ""));
          const y = parseInt(args[1].repr.replace("u", ""));
          const color = args[2].repr.replace(/^"|"$/g, "");

          if (!isNaN(x) && !isNaN(y) && x < CANVAS_WIDTH && y < CANVAS_HEIGHT) {
            pixels.push({
              x, y,
              color: color.startsWith("#") ? color : `#${color}`,
              owner: tx.sender_address,
              placedAt: tx.block_height,
            });
          }
        }
      }

      if (data.results.length < limit || pixels.length >= 500) break;
      offset += limit;
    }

    return pixels;
  } catch {
    return [];
  }
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
