import * as ex from 'excalibur'

export type BgTheme = 'hills' | 'meadow' | 'winter' | 'city' | 'sky' | 'sunset' | 'space'

interface Cfg {
  skyTop: string; skyBot: string
  far: string;    near: string
  sun: string     // empty string = no sun
  cloud: string
  detail: string[]
}

const THEMES: Record<BgTheme, Cfg> = {
  hills:  { skyTop: '#29b6f6', skyBot: '#b3e5fc', far: '#c8e6c9', near: '#81c784', sun: '#ffd600', cloud: '#ffffff', detail: ['#f48fb1','#fff176','#ce93d8'] },
  meadow: { skyTop: '#fce4ec', skyBot: '#e8f5e9', far: '#dcedc8', near: '#aed581', sun: '#ffeb3b', cloud: '#ffffff', detail: ['#f48fb1','#ea80fc','#ffcc80'] },
  winter: { skyTop: '#9fa8da', skyBot: '#e8eaf6', far: '#e3f2fd', near: '#c5cae9', sun: '',        cloud: '#eeeeee', detail: ['#e3f2fd','#bbdefb','#90caf9'] },
  city:   { skyTop: '#ff8f00', skyBot: '#ffe082', far: '#455a64', near: '#263238', sun: '#ff6d00', cloud: '#ffe0b2', detail: ['#ffd740','#ff6d00','#ef9a9a'] },
  sky:    { skyTop: '#ffe082', skyBot: '#fff9c4', far: '#e1f5fe', near: '#b3e5fc', sun: '#ff8f00', cloud: '#ffffff', detail: ['#ffffff','#ffe0b2','#f8bbd0'] },
  sunset: { skyTop: '#c2185b', skyBot: '#ff7043', far: '#7b1fa2', near: '#4a148c', sun: '#ff1744', cloud: '#ffab40', detail: ['#ff80ab','#ff6d00','#ffd740'] },
  space:  { skyTop: '#020617', skyBot: '#0f0f23', far: '#1e1b4b', near: '#312e81', sun: '#fbbf24', cloud: '#4c1d95', detail: ['#818cf8','#f472b6','#fbbf24'] },
}

// Deterministic pseudo-random (no Math.random so sprite is stable each run)
function prng(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123
  return x - Math.floor(x)
}

export class DreamBackground extends ex.ScreenElement {
  private W = 800
  private H = 450
  private cfg: Cfg
  // Pre-generated cloud descriptors: { ox (world offset in 0..4W), y, r }
  private cloudData: Array<{ ox: number; y: number; r: number }> = []

  constructor(theme: BgTheme = 'hills') {
    super({ z: -100 })
    this.cfg = THEMES[theme]
  }

  onInitialize(engine: ex.Engine): void {
    this.W = engine.drawWidth
    this.H = engine.drawHeight

    // Generate clouds deterministically
    const period = this.W * 4
    for (let i = 0; i < 12; i++) {
      this.cloudData.push({
        ox: prng(i * 3 + 0) * period,
        y:  20 + prng(i * 3 + 1) * 90,
        r:  20 + prng(i * 3 + 2) * 32,
      })
    }

    const W = this.W, H = this.H
    const self = this

    // anchor (0,0) + pos (0,0) → canvas top-left at screen top-left = full viewport
    this.anchor = ex.vec(0, 0)
    this.pos    = ex.vec(0, 0)

    const canvas = new ex.Canvas({
      width: W, height: H,
      cache: false,
      draw(ctx) {
        const camX = self.scene?.camera.pos.x ?? W / 2
        const camY = self.scene?.camera.pos.y ?? H / 2
        self.render(ctx, W, H, camX, camY)
      },
    })
    this.graphics.use(canvas)
  }

  // ─────────────────────────────────────────────────────────────────────────
  private render(ctx: CanvasRenderingContext2D, W: number, H: number, camX: number, _camY: number): void {
    const c = this.cfg

    // ── 1. Sky gradient ──────────────────────────────────────────────────────
    const sg = ctx.createLinearGradient(0, 0, 0, H)
    sg.addColorStop(0, c.skyTop)
    sg.addColorStop(1, c.skyBot)
    ctx.fillStyle = sg
    ctx.fillRect(0, 0, W, H)

    // ── 2. Sun / moon (parallax 0.04 — nearly fixed) ─────────────────────────
    if (c.sun) {
      this.drawSun(ctx, W * 0.82 - camX * 0.04, H * 0.13, 26, c.sun)
    }

    // ── 3. Far hills (parallax 0.12) ─────────────────────────────────────────
    this.drawHillBand(ctx, camX * 0.12, H * 0.60, 90, 260, c.far, W, H)

    // ── 4. Clouds (parallax 0.26) ─────────────────────────────────────────────
    this.drawCloudLayer(ctx, camX * 0.26, c.cloud, W)

    // ── 5. Near hills / city skyline (parallax 0.44) ─────────────────────────
    if (this.cfg === THEMES.city) {
      this.drawCityLayer(ctx, camX * 0.44, W, H)
    } else {
      this.drawHillBand(ctx, camX * 0.44, H * 0.74, 60, 150, c.near, W, H)
    }

    // ── 6. Ground detail — flowers or snowflakes (parallax 0.62) ─────────────
    this.drawDetailLayer(ctx, camX * 0.62, H * 0.79, W)
  }

  // ── Sun with face ──────────────────────────────────────────────────────────
  private drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string): void {
    // Soft glow
    const grd = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.2)
    grd.addColorStop(0, col + 'bb')
    grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd
    ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill()

    // Rays
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round'
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5))
      ctx.lineTo(x + Math.cos(a) * (r + 15), y + Math.sin(a) * (r + 15))
      ctx.stroke()
    }

    // Disc
    ctx.fillStyle = col
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()

    // Face
    ctx.fillStyle = 'rgba(100,70,0,0.7)'
    ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.1, r * 0.13, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + r * 0.3, y - r * 0.1, r * 0.13, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x, y + r * 0.1, r * 0.28, 0.15, Math.PI - 0.15)
    ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(100,70,0,0.7)'; ctx.stroke()
  }

  // ── Rolling hill band ──────────────────────────────────────────────────────
  private drawHillBand(
    ctx: CanvasRenderingContext2D,
    offsetX: number, baseY: number,
    minR: number, maxR: number,
    color: string, W: number, H: number,
  ): void {
    // Tile period = 6 × maxR so hills don't look repetitive at scale
    const period = maxR * 6
    const shift  = offsetX % period

    // Bump positions within one period (0..1 fractions)
    const bumps = [
      { f: 0.08, s: 1.00 },
      { f: 0.30, s: 0.72 },
      { f: 0.54, s: 0.88 },
      { f: 0.76, s: 0.60 },
    ]

    ctx.fillStyle = color

    for (let copy = -1; copy <= 2; copy++) {
      for (const { f, s } of bumps) {
        const cx = copy * period + f * period - shift
        const r  = minR + (maxR - minR) * s

        if (cx + r < 0 || cx - r > W) continue

        ctx.beginPath()
        ctx.arc(cx, baseY, r, Math.PI, 0)
        ctx.lineTo(cx + r, H)
        ctx.lineTo(cx - r, H)
        ctx.closePath()
        ctx.fill()
      }
      // Fill gap between bumps solid
      ctx.fillRect(copy * period - shift, baseY, period, H - baseY)
    }
  }

  // ── Puffy clouds ───────────────────────────────────────────────────────────
  private drawCloudLayer(ctx: CanvasRenderingContext2D, offsetX: number, color: string, W: number): void {
    const period = W * 4
    const shift  = offsetX % period

    for (const cd of this.cloudData) {
      for (let copy = -1; copy <= 1; copy++) {
        const cx = cd.ox + copy * period - shift
        if (cx + cd.r * 3.5 < 0 || cx - cd.r * 3.5 > W) continue
        this.drawCloud(ctx, cx, cd.y, cd.r, color)
      }
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
    const puffs: [number, number, number][] = [
      [-r * 0.65, r * 0.25, r * 0.72],
      [0,          0,         r],
      [r * 0.65,  r * 0.25, r * 0.72],
      [-r * 0.32, r * 0.55, r * 0.55],
      [r * 0.32,  r * 0.55, r * 0.55],
    ]

    // Soft shadow
    ctx.fillStyle = 'rgba(80,100,140,0.10)'
    for (const [dx, dy, pr] of puffs) {
      ctx.beginPath(); ctx.arc(x + dx, y + dy + 5, pr, 0, Math.PI * 2); ctx.fill()
    }
    // White body
    ctx.fillStyle = color
    for (const [dx, dy, pr] of puffs) {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, pr, 0, Math.PI * 2); ctx.fill()
    }
    // Highlight shine
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.beginPath(); ctx.arc(x - r * 0.15, y - r * 0.2, r * 0.35, 0, Math.PI * 2); ctx.fill()
  }

  // ── City skyline (dark buildings + lit windows) ────────────────────────────
  private drawCityLayer(ctx: CanvasRenderingContext2D, offsetX: number, W: number, H: number): void {
    const period = W * 3
    const shift  = offsetX % period

    // Building templates: [relX(0..1), width, height]
    const blds: [number, number, number][] = [
      [0.03, 28, 130], [0.10, 50, 200], [0.19, 32, 110],
      [0.27, 18, 80 ], [0.33, 62, 220], [0.46, 40, 160],
      [0.55, 24, 90 ], [0.62, 55, 180], [0.74, 36, 140],
      [0.84, 48, 195], [0.93, 22, 100],
    ]

    for (let copy = -1; copy <= 1; copy++) {
      for (const [rx, bw, bh] of blds) {
        const bx = rx * period + copy * period - shift - bw / 2
        const by = H - bh
        if (bx + bw < 0 || bx > W) continue

        // Building body
        ctx.fillStyle = '#263238'
        ctx.fillRect(bx, by, bw, bh)

        // Lit windows (warm yellow)
        ctx.fillStyle = '#ffd740'
        for (let wy = by + 8; wy < H - 12; wy += 12) {
          for (let wx = bx + 5; wx < bx + bw - 8; wx += 8) {
            if (prng(wx * 0.1 + wy * 0.13) > 0.45) {
              ctx.fillRect(wx, wy, 4, 5)
            }
          }
        }
      }
    }
  }

  // ── Ground detail: flowers (default) or snowflakes (winter) ───────────────
  private drawDetailLayer(ctx: CanvasRenderingContext2D, offsetX: number, baseY: number, W: number): void {
    const period = W * 2
    const shift  = offsetX % period
    const isWinter = this.cfg === THEMES.winter
    const cols = this.cfg.detail

    for (let copy = -1; copy <= 2; copy++) {
      for (let i = 0; i < 14; i++) {
        const fx = copy * period + prng(i * 7) * period - shift
        if (fx < -12 || fx > W + 12) continue
        const fy  = baseY + prng(i * 7 + 1) * 18
        const col = cols[i % cols.length]

        if (isWinter) {
          this.drawSnowflake(ctx, fx, fy, 5, col)
        } else {
          // Stem
          ctx.strokeStyle = '#66bb6a'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
          ctx.beginPath(); ctx.moveTo(fx, fy + 9); ctx.lineTo(fx, fy); ctx.stroke()
          // Petals
          ctx.fillStyle = col
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2
            ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 3.5, fy + Math.sin(a) * 3.5, 2.5, 0, Math.PI * 2); ctx.fill()
          }
          // Centre
          ctx.fillStyle = '#fff9'
          ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill()
        }
      }
    }
  }

  private drawSnowflake(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string): void {
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
      ctx.lineTo(x - Math.cos(a) * r, y - Math.sin(a) * r)
      ctx.stroke()
    }
    // Small cross-ticks
    ctx.lineWidth = 1
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const mx = x + Math.cos(a) * r * 0.6
      const my = y + Math.sin(a) * r * 0.6
      const pa = a + Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(mx + Math.cos(pa) * 2, my + Math.sin(pa) * 2)
      ctx.lineTo(mx - Math.cos(pa) * 2, my - Math.sin(pa) * 2)
      ctx.stroke()
    }
  }
}
