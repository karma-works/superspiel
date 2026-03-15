import * as ex from 'excalibur'
import { CoinTracker } from '../systems/CoinTracker'
import { Player } from '../actors/Player'

export class HUD extends ex.ScreenElement {
  private coinTracker: CoinTracker
  private player: Player
  private levelName: string
  private showGateMessage: boolean = false
  private gateFlash: number = 0

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
    const controls = [
      { key: '← →', desc: 'Move' },
      { key: '↑ Space', desc: 'Jump/Fly' },
      { key: '↓', desc: 'Deflate' },
      { key: 'Z X', desc: 'Fire' },
    ]
    const padY = 5
    const barH = 22
    const barY = H - barH - 4
    // Background
    ctx.drawRectangle(ex.vec(0, barY - padY), W, barH + padY * 2, ex.Color.fromRGB(0, 0, 0, 140))
    // Controls text
    const totalItems = controls.length
    const slotW = W / totalItems
    for (let i = 0; i < controls.length; i++) {
      const cx = i * slotW + slotW / 2
      const label = `${controls[i].key}: ${controls[i].desc}`
      const lx = cx - label.length * 3.5
      this.drawLabel(ctx, label, lx, barY, '#cccccc', 11)
    }
  }

  private drawLabel(ctx: ex.ExcaliburGraphicsContext, text: string, x: number, y: number, color: string, size: number = 14): void {
    const t = new ex.Text({
      text,
      color: ex.Color.fromHex(color),
      font: new ex.Font({
        size,
        family: 'monospace',
        bold: true,
        color: ex.Color.fromHex(color),
      }),
    })
    t.draw(ctx, x, y)
  }
}
