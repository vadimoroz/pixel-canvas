;; pixel-canvas.clar
;; On-chain pixel canvas - place any pixel, any time, no limits

;; --- Storage ---

;; Each pixel: color (hex string), owner, block height when placed
(define-map pixels
  { x: uint, y: uint }
  { color: (string-ascii 7), owner: principal, placed-at: uint }
)

;; How many pixels each address has placed
(define-map pixel-counts
  principal
  uint
)

;; Total pixels ever placed (overwrites count, not unique coords)
(define-data-var total-pixels uint u0)

;; Canvas dimensions
(define-constant CANVAS-WIDTH u200)
(define-constant CANVAS-HEIGHT u100)

;; --- Errors ---

(define-constant ERR-OUT-OF-BOUNDS (err u100))
(define-constant ERR-INVALID-COLOR (err u101))

;; --- Helpers ---

(define-private (valid-color (color (string-ascii 7)))
  (is-eq (len color) u7)
)

;; --- Public functions ---

(define-public (place-pixel (x uint) (y uint) (color (string-ascii 7)))
  (begin
    ;; bounds check
    (asserts! (and (< x CANVAS-WIDTH) (< y CANVAS-HEIGHT)) ERR-OUT-OF-BOUNDS)
    ;; color must be 7 chars e.g. "#FF0000"
    (asserts! (valid-color color) ERR-INVALID-COLOR)

    ;; write pixel
    (map-set pixels { x: x, y: y }
      { color: color, owner: tx-sender, placed-at: block-height }
    )

    ;; increment caller's count
    (map-set pixel-counts tx-sender
      (+ (default-to u0 (map-get? pixel-counts tx-sender)) u1)
    )

    ;; increment global counter
    (var-set total-pixels (+ (var-get total-pixels) u1))

    (ok true)
  )
)

;; --- Read-only functions ---

(define-read-only (get-pixel (x uint) (y uint))
  (map-get? pixels { x: x, y: y })
)

(define-read-only (get-pixel-count (addr principal))
  (default-to u0 (map-get? pixel-counts addr))
)

(define-read-only (get-total-pixels)
  (var-get total-pixels)
)

(define-read-only (get-canvas-size)
  { width: CANVAS-WIDTH, height: CANVAS-HEIGHT }
)
