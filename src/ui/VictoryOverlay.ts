import * as ex from 'excalibur'
import { Player } from '../actors/Player'

export class VictoryOverlay extends ex.ScreenElement {
  private timer: number = 0
  private readonly duration: number = 6000
  private onDone: () => void
  private player: Player
  private starTimer: number = 0

  constructor(player: Player, onDone: () => void) {
    super({ z: 100 })
    this.player = player
    this.onDone = onDone
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.timer += delta
    this.starTimer += delta
    if (this.timer >= this.duration) {
      this.onDone()
    }
  }

  onPostDraw(ctx: ex.ExcaliburGraphicsContext, _delta: number): void {
    const engine = this.scene?.engine
    if (!engine) return

    const W = engine.drawWidth
    const H = engine.drawHeight
    const t = this.timer / this.duration

    // Dark overlay (fades in)
    const alpha = Math.min(0.78, t * 3)
    ctx.drawRectangle(ex.vec(0, 0), W, H, ex.Color.fromRGB(10, 2, 30, Math.floor(alpha * 255)))

    // Animated sparkle band
    const bandY = H * 0.32
    ctx.drawRectangle(
      ex.vec(0, bandY - 4),
      W,
      8,
      ex.Color.fromRGB(251, 191, 36, Math.floor(60 + Math.sin(this.starTimer * 0.004) * 40)),
    )

    // Main title
    this.drawCenteredText(ctx, W, H * 0.22, 'Princess Rescued!', '#fbbf24', 26)

    // Sub lines
    this.drawCenteredText(ctx, W, H * 0.40, 'Miro & Fynn saved the day!', '#a5f3fc', 16)
    this.drawCenteredText(ctx, W, H * 0.53, `Final Score: ${this.player.totalScore}`, '#ffffff', 18)

    // Countdown
    const secsLeft = Math.max(0, Math.ceil((this.duration - this.timer) / 1000))
    this.drawCenteredText(ctx, W, H * 0.70, `Returning to menu in ${secsLeft}...`, '#94a3b8', 13)

    // Decorative stars at corners
    this.drawStarShape(ctx, 30, 30, 14, '#fbbf24')
    this.drawStarShape(ctx, W - 30, 30, 14, '#fbbf24')
    this.drawStarShape(ctx, 30, H - 30, 10, '#f472b6')
    this.drawStarShape(ctx, W - 30, H - 30, 10, '#f472b6')
  }

  private drawCenteredText(
    ctx: ex.ExcaliburGraphicsContext,
    W: number, y: number,
    text: string, color: string, size: number,
  ): void {
    const t = new ex.Text({
      text,
      color: ex.Color.fromHex(color),
      font: new ex.Font({ size, family: 'monospace', bold: true, color: ex.Color.fromHex(color) }),
    })
    t.draw(ctx, W / 2 - text.length * (size * 0.31), y)
  }

  private drawStarShape(ctx: ex.ExcaliburGraphicsContext, x: number, y: number, r: number, color: string): void {
    const pulse = r + Math.sin(this.starTimer * 0.005) * 3
    const c = ex.Color.fromHex(color)
    ctx.drawCircle(ex.vec(x, y), pulse, c)
    ctx.drawCircle(ex.vec(x, y), pulse * 0.4, ex.Color.White)
  }
}
