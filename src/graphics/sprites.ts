import * as ex from 'excalibur'

function makeCanvas(width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): ex.Canvas {
  return new ex.Canvas({
    width,
    height,
    cache: true,
    draw: drawFn,
  })
}

// ─── Shared dragon flip helper ───────────────────────────────────────────────
function flipH(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imgData = ctx.getImageData(0, 0, w, h)
  const flipped = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const src = (y * w + x) * 4
      const dst = (y * w + (w - 1 - x)) * 4
      flipped.data[dst]     = imgData.data[src]
      flipped.data[dst + 1] = imgData.data[src + 1]
      flipped.data[dst + 2] = imgData.data[src + 2]
      flipped.data[dst + 3] = imgData.data[src + 3]
    }
  }
  ctx.putImageData(flipped, 0, 0)
}

// Dragon colour palette
const DR  = '#7c3aed'  // body (violet)
const DRD = '#5b21b6'  // dark scale / shadow
const DRW = '#a78bfa'  // wing membrane
const DRP = '#ede9fe'  // belly plate
const DRH = '#f59e0b'  // horns & claws (gold)

// ─── Walk sprite ─────────────────────────────────────────────────────────────
export function drawPlayer(facing: 'left' | 'right', frame: number): ex.Canvas {
  return makeCanvas(16, 24, (ctx) => {
    // Always draw right-facing; flip at end for left.

    // Horns
    ctx.fillStyle = DRH
    ctx.fillRect(5, 0, 2, 4)
    ctx.fillRect(10, 0, 2, 4)

    // Head
    ctx.fillStyle = DR
    ctx.fillRect(4, 3, 9, 7)
    ctx.fillRect(3, 4, 11, 5)

    // Snout (right side, facing right)
    ctx.fillRect(13, 5, 3, 4)
    ctx.fillStyle = DRP
    ctx.fillRect(13, 7, 3, 2)  // snout underside

    // Nostril
    ctx.fillStyle = DRD
    ctx.fillRect(14, 6, 1, 1)

    // Eye (on right/front half of head)
    ctx.fillStyle = '#fff'
    ctx.fillRect(9, 4, 4, 4)
    ctx.fillStyle = '#111'
    ctx.fillRect(10, 5, 2, 2)
    ctx.fillStyle = '#fff'
    ctx.fillRect(10, 5, 1, 1)  // shine

    // Wing stub (back = left side)
    ctx.fillStyle = DRW
    ctx.fillRect(1, 8, 2, 2)   // top nub
    ctx.fillRect(0, 10, 3, 6)  // wing body

    // Body
    ctx.fillStyle = DR
    ctx.fillRect(3, 10, 10, 10)
    ctx.fillRect(2, 11, 12, 7)

    // Belly plate
    ctx.fillStyle = DRP
    ctx.fillRect(5, 12, 6, 7)

    // Tail (back = left, curves down)
    ctx.fillStyle = DRD
    ctx.fillRect(0, 15, 4, 3)
    ctx.fillRect(0, 18, 3, 2)
    ctx.fillRect(0, 20, 2, 2)

    // Legs (alternating for walk)
    ctx.fillStyle = DR
    if (frame === 0) {
      ctx.fillRect(4, 19, 4, 5)
      ctx.fillRect(9, 17, 4, 7)
    } else {
      ctx.fillRect(4, 17, 4, 7)
      ctx.fillRect(9, 19, 4, 5)
    }

    // Claws
    ctx.fillStyle = DRH
    ctx.fillRect(3, 23, 2, 1)
    ctx.fillRect(6, 23, 2, 1)
    ctx.fillRect(8, 23, 2, 1)
    ctx.fillRect(11, 23, 2, 1)

    if (facing === 'left') flipH(ctx, 16, 24)
  })
}

// ─── Jump sprite ─────────────────────────────────────────────────────────────
export function drawPlayerJump(facing: 'left' | 'right'): ex.Canvas {
  return makeCanvas(16, 24, (ctx) => {
    // Horns
    ctx.fillStyle = DRH
    ctx.fillRect(5, 0, 2, 4)
    ctx.fillRect(10, 0, 2, 4)

    // Head
    ctx.fillStyle = DR
    ctx.fillRect(4, 3, 9, 7)
    ctx.fillRect(3, 4, 11, 5)
    ctx.fillRect(13, 5, 3, 4)  // snout
    ctx.fillStyle = DRP
    ctx.fillRect(13, 7, 3, 2)

    // Eyes — wide open with excitement
    ctx.fillStyle = '#fff'
    ctx.fillRect(8, 3, 5, 5)
    ctx.fillStyle = '#111'
    ctx.fillRect(9, 4, 2, 2)
    ctx.fillStyle = '#fff'
    ctx.fillRect(9, 4, 1, 1)

    // Wings spread outward (both sides, angled up)
    ctx.fillStyle = DRW
    ctx.fillRect(0, 6, 3, 8)   // back wing spread out
    ctx.fillRect(13, 7, 3, 6)  // front wing spread out
    ctx.fillRect(1, 5, 2, 3)

    // Body
    ctx.fillStyle = DR
    ctx.fillRect(3, 10, 10, 9)
    ctx.fillRect(2, 11, 12, 7)

    // Belly
    ctx.fillStyle = DRP
    ctx.fillRect(5, 12, 6, 6)

    // Tail
    ctx.fillStyle = DRD
    ctx.fillRect(0, 14, 4, 3)
    ctx.fillRect(0, 17, 3, 2)

    // Legs pulled up together
    ctx.fillStyle = DR
    ctx.fillRect(4, 19, 4, 5)
    ctx.fillRect(9, 19, 4, 5)

    // Claws
    ctx.fillStyle = DRH
    ctx.fillRect(3, 23, 2, 1)
    ctx.fillRect(6, 23, 2, 1)
    ctx.fillRect(8, 23, 2, 1)
    ctx.fillRect(11, 23, 2, 1)

    if (facing === 'left') flipH(ctx, 16, 24)
  })
}

// ─── Fly sprite (wings fully spread — dragon soaring!) ───────────────────────
export function drawPlayerFly(facing: 'left' | 'right', frame: number): ex.Canvas {
  return makeCanvas(22, 20, (ctx) => {
    // Always draw right-facing; flip at end for left.
    // Dragon body is centred at x=10..11; wings spread to the edges.

    // Horns
    ctx.fillStyle = DRH
    ctx.fillRect(9, 0, 2, 4)
    ctx.fillRect(13, 0, 2, 4)

    // Head
    ctx.fillStyle = DR
    ctx.fillRect(8, 3, 9, 7)
    ctx.fillRect(7, 4, 10, 5)
    ctx.fillRect(17, 5, 4, 4)  // snout
    ctx.fillStyle = DRP
    ctx.fillRect(17, 7, 4, 2)
    ctx.fillStyle = DRD
    ctx.fillRect(19, 6, 1, 1)  // nostril

    // Eye (wide & happy while flying)
    ctx.fillStyle = '#fff'
    ctx.fillRect(12, 4, 4, 4)
    ctx.fillStyle = '#111'
    ctx.fillRect(13, 5, 2, 2)
    ctx.fillStyle = '#fff'
    ctx.fillRect(13, 5, 1, 1)

    // ── Wings (the star of the show) ──
    // frame 0 = wings up (flap up), frame 1 = wings level (glide)
    ctx.fillStyle = DRW
    if (frame === 0) {
      // Back wing (left side) sweeping up
      ctx.fillRect(0, 2, 8, 3)
      ctx.fillRect(1, 5, 7, 2)
      ctx.fillRect(2, 7, 6, 2)
      // Front wing (right side) sweeping up
      ctx.fillRect(14, 2, 8, 3)
      ctx.fillRect(15, 5, 7, 2)
      ctx.fillRect(16, 7, 6, 2)
    } else {
      // Glide — wings level and extended
      ctx.fillRect(0, 7, 8, 3)
      ctx.fillRect(1, 10, 7, 2)
      ctx.fillRect(14, 7, 8, 3)
      ctx.fillRect(15, 10, 7, 2)
    }
    // Wing membrane darker veins
    ctx.fillStyle = DRD
    if (frame === 0) {
      ctx.fillRect(2, 4, 1, 4)
      ctx.fillRect(16, 4, 1, 4)
    } else {
      ctx.fillRect(2, 8, 1, 3)
      ctx.fillRect(16, 8, 1, 3)
    }

    // Body
    ctx.fillStyle = DR
    ctx.fillRect(7, 10, 8, 8)
    ctx.fillRect(6, 11, 10, 6)

    // Belly
    ctx.fillStyle = DRP
    ctx.fillRect(9, 11, 5, 6)

    // Rosy cheeks
    ctx.fillStyle = 'rgba(255, 140, 100, 0.5)'
    ctx.beginPath(); ctx.arc(8, 8, 2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(14, 8, 2, 0, Math.PI * 2); ctx.fill()

    // Tail trailing behind (left side)
    ctx.fillStyle = DRD
    ctx.fillRect(4, 14, 4, 2)
    ctx.fillRect(3, 16, 3, 2)
    ctx.fillRect(2, 18, 2, 2)

    // Legs tucked up
    ctx.fillStyle = DR
    ctx.fillRect(8, 17, 3, 3)
    ctx.fillRect(13, 17, 3, 3)

    // Claws
    ctx.fillStyle = DRH
    ctx.fillRect(7, 19, 2, 1)
    ctx.fillRect(10, 19, 2, 1)
    ctx.fillRect(12, 19, 2, 1)
    ctx.fillRect(15, 19, 2, 1)

    if (facing === 'left') flipH(ctx, 22, 20)
  })
}

export function drawFox(facing: 'left' | 'right', frame: number): ex.Canvas {
  return makeCanvas(16, 20, (ctx) => {
    // Body
    ctx.fillStyle = '#ff8c00'
    ctx.fillRect(2, 6, 12, 12)

    // Head
    ctx.fillStyle = '#ff8c00'
    ctx.fillRect(3, 0, 10, 9)

    // Ears
    ctx.fillStyle = '#ff8c00'
    ctx.fillRect(3, 0, 3, 4)
    ctx.fillRect(10, 0, 3, 4)
    // Ear tips
    ctx.fillStyle = '#ff5500'
    ctx.fillRect(4, 0, 1, 2)
    ctx.fillRect(11, 0, 1, 2)

    // White belly
    ctx.fillStyle = '#fff8f0'
    ctx.fillRect(5, 10, 6, 8)

    // Eyes
    const blink = frame === 2
    if (!blink) {
      ctx.fillStyle = '#222'
      ctx.fillRect(5, 2, 2, 3)
      ctx.fillRect(9, 2, 2, 3)
      // Shine
      ctx.fillStyle = '#fff'
      ctx.fillRect(6, 2, 1, 1)
      ctx.fillRect(10, 2, 1, 1)
    } else {
      // Blink - just a line
      ctx.fillStyle = '#222'
      ctx.fillRect(5, 4, 2, 1)
      ctx.fillRect(9, 4, 2, 1)
    }

    // Nose
    ctx.fillStyle = '#ff3300'
    ctx.fillRect(7, 6, 2, 2)

    // Tail
    ctx.fillStyle = '#ff8c00'
    if (facing === 'right') {
      ctx.fillRect(0, 8, 3, 8)
      ctx.fillStyle = '#fff8f0'
      ctx.fillRect(0, 14, 3, 2)
    } else {
      ctx.fillRect(13, 8, 3, 8)
      ctx.fillStyle = '#fff8f0'
      ctx.fillRect(13, 14, 3, 2)
    }

    // Legs
    ctx.fillStyle = '#cc6600'
    if (frame % 2 === 0) {
      ctx.fillRect(3, 16, 3, 4)
      ctx.fillRect(10, 17, 3, 3)
    } else {
      ctx.fillRect(3, 17, 3, 3)
      ctx.fillRect(10, 16, 3, 4)
    }

    if (facing === 'left') {
      const imgData = ctx.getImageData(0, 0, 16, 20)
      const flipped = ctx.createImageData(16, 20)
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 16; x++) {
          const src = (y * 16 + x) * 4
          const dst = (y * 16 + (15 - x)) * 4
          flipped.data[dst] = imgData.data[src]
          flipped.data[dst + 1] = imgData.data[src + 1]
          flipped.data[dst + 2] = imgData.data[src + 2]
          flipped.data[dst + 3] = imgData.data[src + 3]
        }
      }
      ctx.putImageData(flipped, 0, 0)
    }
  })
}

export function drawCoin(frame: number): ex.Canvas {
  return makeCanvas(12, 12, (ctx) => {
    // Gold circle
    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.arc(6, 6, 5, 0, Math.PI * 2)
    ctx.fill()

    // Shine
    ctx.fillStyle = '#ffec80'
    const shineX = 3 + (frame % 2) * 2
    ctx.beginPath()
    ctx.arc(shineX, 4, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Outline
    ctx.strokeStyle = '#cc9900'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(6, 6, 5, 0, Math.PI * 2)
    ctx.stroke()
  })
}

export function drawTreasure(): ex.Canvas {
  return makeCanvas(18, 14, (ctx) => {
    // Chest body
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(0, 5, 18, 9)

    // Chest lid
    ctx.fillStyle = '#a0522d'
    ctx.fillRect(0, 0, 18, 6)
    // Lid arc top
    ctx.fillStyle = '#a0522d'
    ctx.beginPath()
    ctx.arc(9, 5, 5, Math.PI, 0)
    ctx.fill()

    // Gold trim
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, 16, 12)

    // Lock
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(7, 6, 4, 3)
    ctx.beginPath()
    ctx.arc(9, 6, 2, Math.PI, 0)
    ctx.fill()

    // Horizontal band
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(0, 5, 18, 1)
  })
}

export function drawSpike(): ex.Canvas {
  return makeCanvas(16, 12, (ctx) => {
    ctx.fillStyle = '#888888'
    // 3 spikes
    for (let i = 0; i < 3; i++) {
      const x = i * 5 + 1
      ctx.beginPath()
      ctx.moveTo(x, 12)
      ctx.lineTo(x + 2.5, 0)
      ctx.lineTo(x + 5, 12)
      ctx.closePath()
      ctx.fill()
    }
    // Highlight
    ctx.fillStyle = '#aaaaaa'
    for (let i = 0; i < 3; i++) {
      const x = i * 5 + 1
      ctx.beginPath()
      ctx.moveTo(x + 2.5, 2)
      ctx.lineTo(x + 1.5, 10)
      ctx.lineTo(x + 2.5, 10)
      ctx.closePath()
      ctx.fill()
    }
  })
}

export function drawLava(frame: number): ex.Canvas {
  return makeCanvas(16, 10, (ctx) => {
    // Base lava
    ctx.fillStyle = '#ff4500'
    ctx.fillRect(0, 3, 16, 7)

    // Animated surface waves
    const offset = (frame * 2) % 8
    ctx.fillStyle = '#ff8c00'
    for (let x = -offset; x < 16; x += 8) {
      ctx.beginPath()
      ctx.arc(x + 4, 3, 3, Math.PI, 0)
      ctx.fill()
    }

    // Bright center
    ctx.fillStyle = '#ffcc00'
    ctx.fillRect(2, 5, 3, 2)
    ctx.fillRect(9, 6, 4, 2)
  })
}

export function drawWater(frame: number): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    // Water body
    ctx.fillStyle = '#1e90ff'
    ctx.fillRect(0, 4, 16, 12)

    // Animated surface
    const offset = (frame * 2) % 8
    ctx.fillStyle = '#4daaff'
    for (let x = -offset; x < 16; x += 8) {
      ctx.beginPath()
      ctx.arc(x + 4, 4, 3, Math.PI, 0)
      ctx.fill()
    }

    // Transparency shimmer
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillRect(2, 7, 4, 2)
    ctx.fillRect(10, 10, 3, 2)
  })
}

export function drawFireball(frame: number): ex.Canvas {
  return makeCanvas(10, 10, (ctx) => {
    // Orange outer
    ctx.fillStyle = '#ff6600'
    ctx.beginPath()
    ctx.arc(5, 5, 5, 0, Math.PI * 2)
    ctx.fill()

    // Yellow core (animated)
    const coreSize = 2 + (frame % 2)
    ctx.fillStyle = '#ffff00'
    ctx.beginPath()
    ctx.arc(5, 5, coreSize, 0, Math.PI * 2)
    ctx.fill()

    // Bright center
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(4, 4, 1, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawShip(): ex.Canvas {
  return makeCanvas(48, 24, (ctx) => {
    // Hull
    ctx.fillStyle = '#2563eb'
    ctx.beginPath()
    ctx.moveTo(0, 12)
    ctx.lineTo(4, 24)
    ctx.lineTo(44, 24)
    ctx.lineTo(48, 12)
    ctx.closePath()
    ctx.fill()

    // Deck
    ctx.fillStyle = '#92400e'
    ctx.fillRect(2, 6, 44, 7)

    // Cabin
    ctx.fillStyle = '#b45309'
    ctx.fillRect(16, 0, 16, 7)

    // Windows
    ctx.fillStyle = '#fde68a'
    ctx.fillRect(19, 2, 4, 3)
    ctx.fillRect(25, 2, 4, 3)

    // Mast
    ctx.fillStyle = '#78350f'
    ctx.fillRect(22, 0, 2, 8)

    // Outline
    ctx.strokeStyle = '#1d4ed8'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, 12)
    ctx.lineTo(4, 24)
    ctx.lineTo(44, 24)
    ctx.lineTo(48, 12)
    ctx.closePath()
    ctx.stroke()
  })
}

export function drawCar(): ex.Canvas {
  return makeCanvas(36, 20, (ctx) => {
    // Body
    ctx.fillStyle = '#dc2626'
    ctx.fillRect(2, 8, 32, 10)

    // Roof
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(8, 2, 20, 8)

    // Windows
    ctx.fillStyle = '#bfdbfe'
    ctx.fillRect(10, 3, 8, 6)
    ctx.fillRect(20, 3, 6, 6)

    // Wheels
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(8, 18, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(28, 18, 5, 0, Math.PI * 2)
    ctx.fill()

    // Hubcaps
    ctx.fillStyle = '#888'
    ctx.beginPath()
    ctx.arc(8, 18, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(28, 18, 2, 0, Math.PI * 2)
    ctx.fill()

    // Headlights
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(30, 10, 4, 4)

    // Tail lights
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(2, 10, 3, 4)

    // Outline
    ctx.strokeStyle = '#991b1b'
    ctx.lineWidth = 1
    ctx.strokeRect(2, 8, 32, 10)
  })
}

export function drawEnemy(type: 'patrol' | 'ranged', facing: 'left' | 'right', frame: number): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    const color = type === 'patrol' ? '#f472b6' : '#a855f7'
    const darkColor = type === 'patrol' ? '#db2777' : '#7c3aed'

    // Round body
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(8, 9, 7, 0, Math.PI * 2)
    ctx.fill()

    // Big derpy eyes
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(5, 7, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(11, 7, 3, 0, Math.PI * 2)
    ctx.fill()

    // Pupils (looking slightly different directions for derpy look)
    ctx.fillStyle = '#111'
    const pupilOffset = frame % 2 === 0 ? 0 : 1
    ctx.beginPath()
    ctx.arc(5 + (facing === 'right' ? 1 : -1), 7 + pupilOffset, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(11 + (facing === 'right' ? 1 : -1), 8 - pupilOffset, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Silly mouth
    ctx.fillStyle = darkColor
    ctx.beginPath()
    ctx.arc(8, 12, 2, 0, Math.PI)
    ctx.fill()

    // Cheek blush
    ctx.fillStyle = 'rgba(255, 150, 150, 0.6)'
    ctx.beginPath()
    ctx.arc(3, 11, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(13, 11, 2, 0, Math.PI * 2)
    ctx.fill()

    // Feet
    ctx.fillStyle = darkColor
    if (frame === 0) {
      ctx.fillRect(3, 14, 3, 3)
      ctx.fillRect(10, 13, 3, 4)
    } else {
      ctx.fillRect(3, 13, 3, 4)
      ctx.fillRect(10, 14, 3, 3)
    }

    // Ranged enemy has a little wand
    if (type === 'ranged') {
      ctx.fillStyle = '#7c3aed'
      if (facing === 'right') {
        ctx.fillRect(13, 4, 2, 8)
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.arc(14, 4, 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(1, 4, 2, 8)
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.arc(2, 4, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  })
}

export function drawFallingRock(): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    ctx.fillStyle = '#555555'
    // Main rock shape (slightly irregular)
    ctx.beginPath()
    ctx.moveTo(3, 2)
    ctx.lineTo(13, 1)
    ctx.lineTo(15, 5)
    ctx.lineTo(14, 13)
    ctx.lineTo(9, 15)
    ctx.lineTo(2, 14)
    ctx.lineTo(1, 8)
    ctx.lineTo(2, 3)
    ctx.closePath()
    ctx.fill()

    // Highlight
    ctx.fillStyle = '#777777'
    ctx.beginPath()
    ctx.moveTo(4, 3)
    ctx.lineTo(10, 3)
    ctx.lineTo(11, 7)
    ctx.lineTo(7, 6)
    ctx.closePath()
    ctx.fill()

    // Dark shadow
    ctx.fillStyle = '#333333'
    ctx.beginPath()
    ctx.moveTo(10, 10)
    ctx.lineTo(13, 12)
    ctx.lineTo(11, 14)
    ctx.lineTo(8, 13)
    ctx.closePath()
    ctx.fill()
  })
}

export function drawCheckpoint(activated: boolean): ex.Canvas {
  return makeCanvas(8, 24, (ctx) => {
    // Pole
    ctx.fillStyle = '#888888'
    ctx.fillRect(3, 0, 2, 24)

    // Flag
    ctx.fillStyle = activated ? '#ffd700' : '#ffffff'
    ctx.beginPath()
    ctx.moveTo(5, 2)
    ctx.lineTo(8, 5)
    ctx.lineTo(5, 8)
    ctx.closePath()
    ctx.fill()

    if (activated) {
      // Glow effect
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'
      ctx.beginPath()
      ctx.arc(4, 5, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

export function drawExitGate(locked: boolean): ex.Canvas {
  return makeCanvas(32, 48, (ctx) => {
    // Gate frame
    ctx.fillStyle = locked ? '#888888' : '#b8860b'
    ctx.fillRect(0, 0, 32, 48)

    // Gate arch
    ctx.fillStyle = locked ? '#aaaaaa' : '#daa520'
    ctx.fillRect(2, 2, 28, 44)

    // Door opening
    ctx.fillStyle = locked ? '#555555' : '#1a0a00'
    ctx.fillRect(6, 16, 20, 30)

    // Arch top
    ctx.fillStyle = locked ? '#555555' : '#1a0a00'
    ctx.beginPath()
    ctx.arc(16, 16, 10, Math.PI, 0)
    ctx.fill()

    // Battlements (top)
    ctx.fillStyle = locked ? '#888888' : '#b8860b'
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(i * 8 + 1, 0, 5, 6)
    }

    // Lock/keyhole
    if (locked) {
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(16, 28, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(14, 29, 4, 5)
    }

    // Glow when unlocked
    if (!locked) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)'
      ctx.fillRect(6, 16, 20, 30)

      ctx.fillStyle = '#ffd700'
      ctx.fillRect(14, 26, 4, 4)

      // Star sparkles
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(8, 20, 2, 2)
      ctx.fillRect(22, 24, 2, 2)
      ctx.fillRect(12, 35, 2, 2)
    }
  })
}

export function drawGroundTile(variant: number): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    if (variant === 0) {
      // Green top + brown base
      ctx.fillStyle = '#795548'
      ctx.fillRect(0, 0, 16, 16)

      // Green top layer
      ctx.fillStyle = '#4caf50'
      ctx.fillRect(0, 0, 16, 5)

      // Grass highlights
      ctx.fillStyle = '#66bb6a'
      ctx.fillRect(1, 1, 2, 2)
      ctx.fillRect(5, 0, 2, 3)
      ctx.fillRect(11, 1, 2, 2)

      // Soil texture
      ctx.fillStyle = '#6d4c41'
      ctx.fillRect(3, 7, 2, 2)
      ctx.fillRect(10, 10, 2, 2)
    } else {
      // Full brown underground
      ctx.fillStyle = '#795548'
      ctx.fillRect(0, 0, 16, 16)

      // Texture dots
      ctx.fillStyle = '#6d4c41'
      ctx.fillRect(2, 3, 2, 2)
      ctx.fillRect(8, 1, 2, 2)
      ctx.fillRect(12, 7, 2, 2)
      ctx.fillRect(4, 11, 2, 2)
    }
  })
}

export function drawPlatformTile(): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    // Wood plank
    ctx.fillStyle = '#92400e'
    ctx.fillRect(0, 0, 16, 16)

    // Wood grain
    ctx.fillStyle = '#a16207'
    ctx.fillRect(0, 4, 16, 2)
    ctx.fillRect(0, 10, 16, 2)

    // Knot
    ctx.fillStyle = '#78350f'
    ctx.beginPath()
    ctx.arc(8, 8, 2, 0, Math.PI * 2)
    ctx.fill()

    // Top highlight
    ctx.fillStyle = '#b45309'
    ctx.fillRect(0, 0, 16, 2)
  })
}

export function drawSkyTile(): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    // Cloud white
    ctx.fillStyle = '#f0f9ff'
    ctx.fillRect(0, 0, 16, 16)

    // Cloud puffs
    ctx.fillStyle = '#e0f2fe'
    ctx.beginPath()
    ctx.arc(6, 8, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(12, 9, 4, 0, Math.PI * 2)
    ctx.fill()

    // Bright top
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(2, 4, 6, 3)
  })
}

export function drawRainParticle(): ex.Canvas {
  return makeCanvas(2, 8, (ctx) => {
    ctx.fillStyle = 'rgba(100, 150, 255, 0.7)'
    ctx.fillRect(0, 0, 2, 8)

    // Slightly lighter top
    ctx.fillStyle = 'rgba(150, 200, 255, 0.5)'
    ctx.fillRect(0, 0, 2, 2)
  })
}

export function drawSnowParticle(): ex.Canvas {
  return makeCanvas(4, 4, (ctx) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.beginPath()
    ctx.arc(2, 2, 2, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawStar(): ex.Canvas {
  return makeCanvas(10, 10, (ctx) => {
    ctx.fillStyle = '#ffd700'
    // 5-pointed star
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
      const x = 5 + 5 * Math.cos(angle)
      const y = 5 + 5 * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()

    // White center shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.arc(5, 5, 2, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawIceTile(): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    ctx.fillStyle = '#bfdbfe'
    ctx.fillRect(0, 0, 16, 16)

    ctx.fillStyle = '#93c5fd'
    ctx.fillRect(0, 0, 16, 3)

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillRect(2, 5, 4, 2)
    ctx.fillRect(10, 9, 3, 2)
  })
}

export function drawRoadTile(): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    ctx.fillStyle = '#374151'
    ctx.fillRect(0, 0, 16, 16)

    // Lane marks
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(6, 6, 4, 2)
  })
}

export function drawEnemyProjectile(): ex.Canvas {
  return makeCanvas(8, 8, (ctx) => {
    ctx.fillStyle = '#a855f7'
    ctx.beginPath()
    ctx.arc(4, 4, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#c084fc'
    ctx.beginPath()
    ctx.arc(3, 3, 2, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawPlayerSkate(facing: 'left' | 'right'): ex.Canvas {
  return makeCanvas(16, 24, (ctx) => {
    // Horns
    ctx.fillStyle = DRH
    ctx.fillRect(5, 0, 2, 4)
    ctx.fillRect(10, 0, 2, 4)

    // Head (same as walk)
    ctx.fillStyle = DR
    ctx.fillRect(4, 3, 9, 7)
    ctx.fillRect(3, 4, 11, 5)
    ctx.fillRect(13, 5, 3, 4)
    ctx.fillStyle = DRP
    ctx.fillRect(13, 7, 3, 2)
    ctx.fillStyle = DRD
    ctx.fillRect(14, 6, 1, 1)

    // Eye
    ctx.fillStyle = '#fff'
    ctx.fillRect(9, 4, 4, 4)
    ctx.fillStyle = '#111'
    ctx.fillRect(10, 5, 2, 2)
    ctx.fillStyle = '#fff'
    ctx.fillRect(10, 5, 1, 1)

    // Wing stub
    ctx.fillStyle = DRW
    ctx.fillRect(1, 8, 2, 2)
    ctx.fillRect(0, 10, 3, 6)

    // Body
    ctx.fillStyle = DR
    ctx.fillRect(3, 10, 10, 10)
    ctx.fillRect(2, 11, 12, 7)

    // Belly
    ctx.fillStyle = DRP
    ctx.fillRect(5, 12, 6, 7)

    // Tail
    ctx.fillStyle = DRD
    ctx.fillRect(0, 15, 4, 3)
    ctx.fillRect(0, 18, 3, 2)
    ctx.fillRect(0, 20, 2, 2)

    // Legs — wide skating stance (both extended, one forward one back)
    ctx.fillStyle = DR
    ctx.fillRect(2, 18, 4, 4)   // back leg
    ctx.fillRect(10, 18, 4, 4)  // front leg

    // Skate blades (silver, extend past feet)
    ctx.fillStyle = '#d1d5db'
    ctx.fillRect(1, 22, 6, 1)
    ctx.fillRect(9, 22, 6, 1)
    ctx.fillStyle = '#f0f9ff'  // blade shine
    ctx.fillRect(2, 22, 3, 1)
    ctx.fillRect(10, 22, 3, 1)

    // Claws still visible above blade
    ctx.fillStyle = DRH
    ctx.fillRect(3, 21, 2, 1)
    ctx.fillRect(6, 21, 2, 1)
    ctx.fillRect(9, 21, 2, 1)
    ctx.fillRect(12, 21, 2, 1)

    if (facing === 'left') flipH(ctx, 16, 24)
  })
}

export function drawFoxSkate(facing: 'left' | 'right'): ex.Canvas {
  return makeCanvas(16, 20, (ctx) => {
    // Body
    ctx.fillStyle = '#ff8c00'
    ctx.fillRect(2, 6, 12, 12)

    // Head
    ctx.fillStyle = '#ff8c00'
    ctx.fillRect(3, 0, 10, 9)

    // Ears
    ctx.fillRect(3, 0, 3, 4)
    ctx.fillRect(10, 0, 3, 4)
    ctx.fillStyle = '#ff5500'
    ctx.fillRect(4, 0, 1, 2)
    ctx.fillRect(11, 0, 1, 2)

    // White belly
    ctx.fillStyle = '#fff8f0'
    ctx.fillRect(5, 10, 6, 6)

    // Eyes
    ctx.fillStyle = '#222'
    ctx.fillRect(5, 2, 2, 3)
    ctx.fillRect(9, 2, 2, 3)
    ctx.fillStyle = '#fff'
    ctx.fillRect(6, 2, 1, 1)
    ctx.fillRect(10, 2, 1, 1)

    // Nose
    ctx.fillStyle = '#ff3300'
    ctx.fillRect(7, 6, 2, 2)

    // Tail
    ctx.fillStyle = '#ff8c00'
    if (facing === 'right') {
      ctx.fillRect(0, 8, 3, 8)
      ctx.fillStyle = '#fff8f0'
      ctx.fillRect(0, 14, 3, 2)
    } else {
      ctx.fillRect(13, 8, 3, 8)
      ctx.fillStyle = '#fff8f0'
      ctx.fillRect(13, 14, 3, 2)
    }

    // Legs — wide skating stance
    ctx.fillStyle = '#cc6600'
    ctx.fillRect(2, 15, 3, 3)
    ctx.fillRect(11, 15, 3, 3)

    // Skate blades
    ctx.fillStyle = '#d1d5db'
    ctx.fillRect(1, 18, 5, 1)
    ctx.fillRect(10, 18, 5, 1)
    ctx.fillStyle = '#f0f9ff'
    ctx.fillRect(2, 18, 2, 1)
    ctx.fillRect(11, 18, 2, 1)

    if (facing === 'left') {
      const imgData = ctx.getImageData(0, 0, 16, 20)
      const flipped = ctx.createImageData(16, 20)
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 16; x++) {
          const src = (y * 16 + x) * 4
          const dst = (y * 16 + (15 - x)) * 4
          flipped.data[dst]     = imgData.data[src]
          flipped.data[dst + 1] = imgData.data[src + 1]
          flipped.data[dst + 2] = imgData.data[src + 2]
          flipped.data[dst + 3] = imgData.data[src + 3]
        }
      }
      ctx.putImageData(flipped, 0, 0)
    }
  })
}

export function drawAirplane(): ex.Canvas {
  return makeCanvas(56, 24, (ctx) => {
    // Right-facing: nose at right, tail at left
    const BODY  = '#f59e0b'
    const DARK  = '#b45309'
    const WING  = '#fbbf24'
    const WIN   = '#bae6fd'

    // Tail fin (vertical stabilizer at left end)
    ctx.fillStyle = BODY
    ctx.fillRect(2, 2, 5, 8)
    ctx.fillRect(0, 6, 8, 5)

    // Fuselage body
    ctx.fillStyle = BODY
    ctx.fillRect(4, 7, 44, 10)

    // Nose taper
    ctx.fillRect(46, 8, 6, 8)
    ctx.fillRect(50, 9, 5, 6)
    ctx.fillRect(53, 10, 3, 4)

    // Top edge stripe
    ctx.fillStyle = DARK
    ctx.fillRect(4, 7, 50, 1)
    ctx.fillRect(4, 16, 50, 1)

    // Main wing (sweeps over top of fuselage)
    ctx.fillStyle = WING
    ctx.fillRect(12, 1, 26, 6)    // wing span
    ctx.fillRect(10, 2, 30, 5)    // wider mid section

    // Wing tip shading
    ctx.fillStyle = DARK
    ctx.fillRect(10, 1, 32, 1)    // top edge of wing

    // Cockpit window
    ctx.fillStyle = WIN
    ctx.fillRect(22, 3, 13, 6)
    ctx.fillRect(21, 4, 15, 5)

    // Cockpit frame
    ctx.fillStyle = DARK
    ctx.fillRect(21, 3, 15, 1)    // top
    ctx.fillRect(21, 8, 15, 1)    // bottom
    ctx.fillRect(21, 3, 1, 6)     // left post
    ctx.fillRect(35, 3, 1, 6)     // right post

    // Window shine
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillRect(23, 4, 5, 3)

    // Propeller (right end, spinning blades shown as cross)
    ctx.fillStyle = '#9ca3af'
    ctx.fillRect(53, 5, 2, 14)    // vertical blade
    ctx.fillRect(49, 11, 8, 2)    // horizontal blade (offset)

    // Propeller hub
    ctx.fillStyle = '#6b7280'
    ctx.fillRect(52, 10, 4, 4)

    // Belly fin (small)
    ctx.fillStyle = BODY
    ctx.fillRect(16, 17, 12, 5)
    ctx.fillRect(18, 20, 8, 4)

    // Rivet detail
    ctx.fillStyle = DARK
    ctx.fillRect(8, 11, 2, 2)
    ctx.fillRect(44, 11, 2, 2)
  })
}

export function drawPenguin(facing: 'left' | 'right', frame: number): ex.Canvas {
  return makeCanvas(28, 28, (ctx) => {
    // Always draw right-facing; flip at end for left.

    // ── Body (dark navy-black) ────────────────────────────────────────────────
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(5, 9, 18, 17)    // main torso
    ctx.fillRect(3, 11, 22, 13)   // wider middle
    ctx.fillRect(6, 7, 16, 4)     // lower neck

    // ── Head ─────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(6, 0, 16, 9)
    ctx.fillRect(5, 1, 18, 7)

    // ── White face patch ─────────────────────────────────────────────────────
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(9, 2, 9, 6)
    ctx.fillRect(8, 3, 11, 4)

    // ── Eye (right side of head for right-facing) ────────────────────────────
    ctx.fillStyle = '#111'
    ctx.fillRect(14, 2, 4, 4)
    ctx.fillStyle = '#fff'
    ctx.fillRect(15, 2, 2, 2)     // shine

    // ── Beak (orange, points right) ──────────────────────────────────────────
    ctx.fillStyle = '#f97316'
    ctx.fillRect(20, 4, 6, 2)     // upper beak
    ctx.fillRect(20, 6, 5, 2)     // lower beak (slightly shorter)
    ctx.fillStyle = '#ea580c'
    ctx.fillRect(20, 6, 5, 1)     // beak midline shadow

    // ── White belly ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(8, 12, 12, 13)
    ctx.fillRect(7, 14, 14, 9)

    // ── Flippers ─────────────────────────────────────────────────────────────
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 11, 5, 11)    // back flipper
    ctx.fillRect(23, 11, 5, 11)   // front flipper

    // ── Feet (orange, alternating for waddle) ────────────────────────────────
    ctx.fillStyle = '#f97316'
    if (frame === 0) {
      ctx.fillRect(7, 25, 6, 3)   // left foot forward
      ctx.fillRect(16, 24, 6, 3)  // right foot back
    } else {
      ctx.fillRect(7, 24, 6, 3)   // left foot back
      ctx.fillRect(16, 25, 6, 3)  // right foot forward
    }
    // Toe detail
    ctx.fillStyle = '#ea580c'
    ctx.fillRect(7, 27, 2, 1)
    ctx.fillRect(10, 27, 2, 1)
    ctx.fillRect(16, 27, 2, 1)
    ctx.fillRect(19, 27, 2, 1)

    if (facing === 'left') flipH(ctx, 28, 28)
  })
}

export function drawRocket(): ex.Canvas {
  return makeCanvas(48, 24, (ctx) => {
    // Right-facing: nose at right, exhaust at left

    // ── Top fin ───────────────────────────────────────────────────────────────
    ctx.fillStyle = '#dc2626'
    ctx.fillRect(2, 0, 14, 5)
    ctx.fillRect(4, 0, 10, 3)

    // ── Bottom fin ────────────────────────────────────────────────────────────
    ctx.fillStyle = '#dc2626'
    ctx.fillRect(2, 19, 14, 5)
    ctx.fillRect(4, 21, 10, 3)

    // ── Engine exhaust flame ──────────────────────────────────────────────────
    ctx.fillStyle = '#f97316'
    ctx.fillRect(0, 9, 6, 6)
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(0, 10, 4, 4)
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillRect(0, 11, 2, 2)

    // ── Engine nozzle ─────────────────────────────────────────────────────────
    ctx.fillStyle = '#374151'
    ctx.fillRect(5, 7, 5, 10)
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(5, 7, 2, 10)

    // ── Main body ─────────────────────────────────────────────────────────────
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(9, 5, 32, 14)

    // Body highlight (top)
    ctx.fillStyle = '#f87171'
    ctx.fillRect(9, 5, 32, 3)

    // Body shadow (bottom)
    ctx.fillStyle = '#b91c1c'
    ctx.fillRect(9, 16, 32, 3)

    // ── Gold accent stripes ───────────────────────────────────────────────────
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(15, 5, 3, 14)
    ctx.fillRect(24, 5, 3, 14)

    // ── Cockpit window ────────────────────────────────────────────────────────
    ctx.fillStyle = '#bae6fd'
    ctx.fillRect(30, 7, 10, 10)
    ctx.fillRect(29, 8, 12, 8)

    // Window frame
    ctx.fillStyle = '#7f1d1d'
    ctx.fillRect(29, 7, 12, 1)
    ctx.fillRect(29, 16, 12, 1)
    ctx.fillRect(29, 7, 1, 10)
    ctx.fillRect(40, 7, 1, 10)

    // Window shine
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillRect(31, 8, 4, 3)

    // ── Nose cone ─────────────────────────────────────────────────────────────
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(41, 6, 4, 12)
    ctx.fillRect(43, 7, 3, 10)
    ctx.fillRect(45, 8, 2, 8)

    // Silver nose tip
    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(46, 10, 2, 4)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(46, 11, 1, 2)
  })
}

export function drawFlowerTile(topRow: boolean): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    // Earthy base
    ctx.fillStyle = '#795548'
    ctx.fillRect(0, 0, 16, 16)

    if (topRow) {
      // Soft green top layer
      ctx.fillStyle = '#66bb6a'
      ctx.fillRect(0, 0, 16, 5)
      ctx.fillStyle = '#81c784'
      ctx.fillRect(0, 0, 16, 2)

      // Tiny flower at left
      ctx.fillStyle = '#f48fb1'
      ctx.fillRect(2, 0, 2, 2)
      ctx.fillRect(1, 1, 1, 1)
      ctx.fillRect(3, 1, 1, 1)
      ctx.fillStyle = '#fff176'
      ctx.fillRect(2, 1, 2, 1)

      // Tiny flower at right
      ctx.fillStyle = '#ce93d8'
      ctx.fillRect(11, 0, 2, 2)
      ctx.fillRect(10, 1, 1, 1)
      ctx.fillRect(12, 1, 1, 1)
      ctx.fillStyle = '#fff176'
      ctx.fillRect(11, 1, 2, 1)
    } else {
      // Underground soil texture
      ctx.fillStyle = '#6d4c41'
      ctx.fillRect(2, 4, 2, 2)
      ctx.fillRect(9, 9, 2, 2)
      ctx.fillRect(13, 2, 2, 2)
    }
  })
}

export function drawBus(): ex.Canvas {
  return makeCanvas(64, 28, (ctx) => {
    // Right-facing: front at right, rear at left

    // ── Main body ─────────────────────────────────────────────────────────────
    ctx.fillStyle = '#f59e0b'  // amber yellow
    ctx.fillRect(2, 4, 60, 20)

    // Top highlight
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(2, 4, 60, 3)

    // Bottom shadow
    ctx.fillStyle = '#d97706'
    ctx.fillRect(2, 20, 60, 4)

    // ── Roof ──────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(4, 1, 56, 4)
    ctx.fillRect(6, 0, 52, 2)

    // ── Windows (side row) ────────────────────────────────────────────────────
    ctx.fillStyle = '#bae6fd'
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(6 + i * 12, 6, 9, 8)
    }

    // Window frames
    ctx.fillStyle = '#d97706'
    for (let i = 0; i < 4; i++) {
      const wx = 6 + i * 12
      ctx.fillRect(wx, 6, 9, 1)     // top
      ctx.fillRect(wx, 13, 9, 1)    // bottom
      ctx.fillRect(wx, 6, 1, 8)     // left
      ctx.fillRect(wx + 8, 6, 1, 8) // right
    }

    // Window shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(7 + i * 12, 7, 3, 3)
    }

    // ── Destination sign (front top-right) ────────────────────────────────────
    ctx.fillStyle = '#1e3a8a'
    ctx.fillRect(54, 5, 8, 5)
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(55, 6, 6, 3)

    // ── Headlights (front = right) ────────────────────────────────────────────
    ctx.fillStyle = '#fef08a'
    ctx.fillRect(60, 8, 4, 4)
    ctx.fillStyle = '#fff'
    ctx.fillRect(61, 9, 2, 2)

    // ── Tail lights (rear = left) ─────────────────────────────────────────────
    ctx.fillStyle = '#dc2626'
    ctx.fillRect(0, 8, 3, 5)

    // ── Door (left side, toward rear) ─────────────────────────────────────────
    ctx.fillStyle = '#d97706'
    ctx.fillRect(50, 9, 1, 11)   // door post

    // ── Wheels ────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#1f2937'
    ctx.beginPath(); ctx.arc(13, 25, 6, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(51, 25, 6, 0, Math.PI * 2); ctx.fill()

    // Wheel highlights
    ctx.fillStyle = '#4b5563'
    ctx.beginPath(); ctx.arc(13, 25, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(51, 25, 3, 0, Math.PI * 2); ctx.fill()

    // Hubcaps
    ctx.fillStyle = '#9ca3af'
    ctx.beginPath(); ctx.arc(13, 25, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(51, 25, 1.5, 0, Math.PI * 2); ctx.fill()

    // ── Black bumpers ─────────────────────────────────────────────────────────
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 22, 4, 2)
    ctx.fillRect(60, 22, 4, 2)
  })
}

export function drawSpaceTile(topRow: boolean): ex.Canvas {
  return makeCanvas(16, 16, (ctx) => {
    // Deep space rock / asteroid surface
    ctx.fillStyle = '#1e1b4b'
    ctx.fillRect(0, 0, 16, 16)

    if (topRow) {
      // Bright top surface
      ctx.fillStyle = '#3730a3'
      ctx.fillRect(0, 0, 16, 3)
      ctx.fillStyle = '#4338ca'
      ctx.fillRect(0, 0, 16, 1)
      // Crater detail
      ctx.fillStyle = '#312e81'
      ctx.fillRect(4, 4, 3, 3)
      ctx.fillRect(11, 2, 2, 2)
    } else {
      // Underground rock texture
      ctx.fillStyle = '#172554'
      ctx.fillRect(0, 0, 16, 16)
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(2, 3, 3, 3)
      ctx.fillRect(9, 8, 4, 3)
    }

    // Embedded star flecks
    ctx.fillStyle = '#818cf8'
    ctx.fillRect(1, 1, 1, 1)
    ctx.fillRect(14, 5, 1, 1)
    ctx.fillRect(7, 13, 1, 1)
  })
}
