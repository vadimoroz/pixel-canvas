# Pixel Canvas

A collaborative on-chain pixel canvas on the [Stacks](https://stacks.co) blockchain.

> Place pixels. Claim your spot. Paint history forever.

## Live

[pixel-canvas1.vercel.app](https://pixel-canvas1.vercel.app)

## Contract

`SPQA4V5SGDWREAAAEH8WJHT2841Y6ANESQFXN8JH.pixel-canvas-v2` on Stacks mainnet.

- Canvas: 200 × 100 pixels
- No cooldown — unlimited pixel placements
- Each pixel placement is an on-chain transaction

## Stack

- **Contract:** Clarity (Stacks)
- **Frontend:** Next.js 14, TailwindCSS, React
- **SDK:** `pixel-canvas-sdk` (npm)
- **Wallet:** Stacks Connect

## Structure

```
contracts/      — Clarity contract
sdk/            — pixel-canvas-sdk npm package
frontend/       — Next.js app (deployed on Vercel)
```

## SDK

```bash
npm install pixel-canvas-sdk
```

See [sdk/README.md](./sdk/README.md) for usage.
