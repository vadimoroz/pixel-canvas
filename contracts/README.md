# pixel-canvas-v2

Clarity smart contract deployed on Stacks mainnet.

**Address:** `SPQA4V5SGDWREAAAEH8WJHT2841Y6ANESQFXN8JH.pixel-canvas-v2`

## Canvas

- Size: 200 × 100 pixels (20,000 total)
- Colors: any 7-char hex string (e.g. `#FF0000`)
- No cooldown — place as many pixels as you want

## Public Functions

### `place-pixel (x uint) (y uint) (color string-ascii-7)`

Places a pixel at `(x, y)` with the given color.

Returns `(ok true)` on success.

**Errors:**
- `u100` — coordinates out of bounds
- `u101` — invalid color string (must be 7 chars)

## Read-only Functions

| Function | Args | Returns |
|---|---|---|
| `get-pixel` | x, y | Optional pixel data |
| `get-pixel-count` | address | uint |
| `get-total-pixels` | — | uint |
| `get-canvas-size` | — | {width, height} |
