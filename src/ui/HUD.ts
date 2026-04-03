import * as ex from 'excalibur'
import { CoinTracker } from '../systems/CoinTracker'
import { Player } from '../actors/Player'
import { TouchInputManager } from '../input/TouchInputManager'

export class HUD extends ex.ScreenElement {
  private coinTracker: CoinTracker
  private player: Player
  private levelName: string
  private showGateMessage: boolean = false
  private gateFlash: number = 0
  private _zoneOverlayTimer: number = 0
  private static readonly ZONE_OVERLAY_SHOW_MS = 1500
  private static readonly ZONE_OVERLAY_FADE_MS = 500

  constructor(coinTracker: CoinTracker, player: Player, levelName: string) {
    super()
    this.coinTracker = coinTracker
    this.player = player
    this.levelName = levelName
    // will be set in onInitialize via body
  }

  onInitialize(_engine: ex.Engine): void {
    // Draw via canvas graphic that updates each frame
  }

  showReachGateMessage(): void {
    this.showGateMessage = true
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.gateFlash += delta
    this._zoneOverlayTimer += delta
  }

  onPostDraw(ctx: ex.ExcaliburGraphicsContext, _delta: number): void {
    const engine = this.scene?.engine
    if (!engine) return

    const W = engine.drawWidth
    const H = engine.drawHeight

    // Top-left: hearts
    this.drawHearts(ctx, 10, 10)

    // Top-left below hearts: coins
    this.drawLabel(ctx, `Coins: ${this.coinTracker.collected}/${this.coinTracker.total}`, 10, 44, '#ffd700')

    // Top-center: level name
    this.drawLabel(ctx, this.levelName, W / 2 - this.levelName.length * 4, 10, '#ffffff')

    // Top-right: score
    const scoreText = `Score: ${this.player.totalScore}`
    this.drawLabel(ctx, scoreText, W - scoreText.length * 8 - 10, 10, '#ffffff')

    // Gate message
    if (this.showGateMessage) {
      const alpha = 0.7 + Math.sin(this.gateFlash * 0.005) * 0.3
      const msg = 'All coins! Reach the gate!'
      const msgW = msg.length * 8 + 20
      ctx.drawRectangle(
        ex.vec(W / 2 - msgW / 2, H - 50),
        msgW,
        26,
        ex.Color.fromRGB(0, 0, 0, Math.floor(alpha * 180))
      )
      this.drawLabel(ctx, msg, W / 2 - msg.length * 4, H - 40, '#ffd700')
    }

    // Bottom controls bar
    this.drawControlsBar(ctx, W, H)

    // Touch zone overlay — shown briefly at level start on touch devices
    if (TouchInputManager.instance.isTouchDevice) {
      this.drawTouchZoneOverlay(ctx, W, H)
    }

    // Drowning indicator
    if (this.player.isDrowning) {
      const pct = Math.min(1, this.player.drowningTimer / 3000)
      ctx.drawRectangle(
        ex.vec(W / 2 - 60, H - 80),
        120 * pct,
        8,
        ex.Color.fromRGB(0, 100, 255, 200)
      )
      this.drawLabel(ctx, 'Drowning!', W / 2 - 36, H - 90, '#64b5f6')
    }
  }

  private drawHearts(ctx: ex.ExcaliburGraphicsContext, x: number, y: number): void {
    const size = 16
    const gap = 4
    for (let i = 0; i < this.player.maxHealth; i++) {
      const filled = i < this.player.health
      const hx = x + i * (size + gap)
      // Shadow
      ctx.drawRectangle(ex.vec(hx + 1, y + 1), size, size, ex.Color.fromRGB(0, 0, 0, 100))
      if (filled) {
        // Red filled heart (pixel-art approximation: cross shape)
        const c = ex.Color.fromRGB(255, 50, 80)
        // top row: two bumps
        ctx.drawRectangle(ex.vec(hx + 1, y + 2), 5, 4, c)
        ctx.drawRectangle(ex.vec(hx + 7, y + 2), 5, 4, c)
        // middle row: full width
        ctx.drawRectangle(ex.vec(hx + 0, y + 4), 13, 5, c)
        // lower body: tapering
        ctx.drawRectangle(ex.vec(hx + 1, y + 9), 11, 3, c)
        ctx.drawRectangle(ex.vec(hx + 3, y + 12), 7, 2, c)
        ctx.drawRectangle(ex.vec(hx + 5, y + 14), 3, 2, c)
      } else {
        // Dark empty heart outline
        const c = ex.Color.fromRGB(80, 40, 60)
        ctx.drawRectangle(ex.vec(hx + 1, y + 2), 5, 4, c)
        ctx.drawRectangle(ex.vec(hx + 7, y + 2), 5, 4, c)
        ctx.drawRectangle(ex.vec(hx + 0, y + 4), 13, 5, c)
        ctx.drawRectangle(ex.vec(hx + 1, y + 9), 11, 3, c)
        ctx.drawRectangle(ex.vec(hx + 3, y + 12), 7, 2, c)
        ctx.drawRectangle(ex.vec(hx + 5, y + 14), 3, 2, c)
        // Inner cutout to show empty
        ctx.drawRectangle(ex.vec(hx + 2, y + 5), 9, 6, ex.Color.fromRGB(30, 10, 25))
        ctx.drawRectangle(ex.vec(hx + 3, y + 11), 7, 2, ex.Color.fromRGB(30, 10, 25))
        ctx.drawRectangle(ex.vec(hx + 5, y + 13), 3, 2, ex.Color.fromRGB(30, 10, 25))
      }
    }
  }

  private drawControlsBar(ctx: ex.ExcaliburGraphicsContext, W: number, H: number): void {
    const isTouch = TouchInputManager.instance.isTouchDevice
    const controls = isTouch
      ? [
          { key: 'Tap ▲', desc: 'Jump' },
          { key: 'Swipe ↑', desc: 'Fly' },
          { key: 'Swipe ↓', desc: 'Deflate' },
          { key: '2-finger', desc: 'Fire' },
        ]
      : [
          { key: '← →', desc: 'Move' },
          { key: '↑ Space', desc: 'Jump/Fly' },
          { key: '↓', desc: 'Deflate' },
          { key: 'Z X', desc: 'Fire' },
        ]
    const padY = 5
    const barH = 22
    const barY = H - barH - 4
    ctx.drawRectangle(ex.vec(0, barY - padY), W, barH + padY * 2, ex.Color.fromRGB(0, 0, 0, 140))
    const slotW = W / controls.length
    for (let i = 0; i < controls.length; i++) {
      const cx = i * slotW + slotW / 2
      const label = `${controls[i].key}: ${controls[i].desc}`
      const lx = cx - label.length * 3.5
      this.drawLabel(ctx, label, lx, barY, '#cccccc', 11)
    }
  }

  private drawTouchZoneOverlay(ctx: ex.ExcaliburGraphicsContext, W: number, H: number): void {
    const total = HUD.ZONE_OVERLAY_SHOW_MS + HUD.ZONE_OVERLAY_FADE_MS
    if (this._zoneOverlayTimer >= total) return
    const baseAlpha = this._zoneOverlayTimer < HUD.ZONE_OVERLAY_SHOW_MS
      ? 1
      : 1 - (this._zoneOverlayTimer - HUD.ZONE_OVERLAY_SHOW_MS) / HUD.ZONE_OVERLAY_FADE_MS
    const a = Math.max(0, baseAlpha)

    const midX = W / 2
    const midY = H / 2

    const textCol = ex.Color.fromRGB(255, 255, 255, Math.round(a * 255))

    // Upper zone
    ctx.drawRectangle(ex.vec(0, 0), W, midY, ex.Color.fromRGB(100, 180, 255, Math.round(a * 40)))
    this.drawLabel(ctx, 'Tap: Jump', midX - 36, midY / 2 - 22, textCol, 13)
    this.drawLabel(ctx, 'Swipe \u2191: Fly', midX - 44, midY / 2 - 4, textCol, 13)
    this.drawLabel(ctx, 'Swipe \u2193: Deflate', midX - 58, midY / 2 + 14, textCol, 13)
    this.drawLabel(ctx, '2-finger: Fire', midX - 50, midY / 2 + 32, textCol, 13)

    // Lower-left zone
    ctx.drawRectangle(ex.vec(0, midY), midX, midY, ex.Color.fromRGB(80, 255, 120, Math.round(a * 35)))
    this.drawLabel(ctx, '\u25c4', midX / 2 - 8, midY + midY / 2 - 10, textCol, 22)

    // Lower-right zone
    ctx.drawRectangle(ex.vec(midX, midY), midX, midY, ex.Color.fromRGB(80, 255, 120, Math.round(a * 35)))
    this.drawLabel(ctx, '\u25ba', midX + midX / 2 - 8, midY + midY / 2 - 10, textCol, 22)

    // Dividers
    const lineColor = ex.Color.fromRGB(255, 255, 255, Math.round(a * 60))
    ctx.drawRectangle(ex.vec(0, midY - 1), W, 2, lineColor)
    ctx.drawRectangle(ex.vec(midX - 1, midY), 2, midY, lineColor)
  }

  private drawLabel(ctx: ex.ExcaliburGraphicsContext, text: string, x: number, y: number, color: string | ex.Color, size: number = 14): void {
    const col = typeof color === 'string' ? ex.Color.fromHex(color) : color
    const t = new ex.Text({
      text,
      color: col,
      font: new ex.Font({
        size,
        family: 'monospace',
        bold: true,
        color: col,
      }),
    })
    t.draw(ctx, x, y)
  }
}
