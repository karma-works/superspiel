import * as ex from 'excalibur'

export class SnowSystem extends ex.ScreenElement {
  private drops: Array<{ x: number, y: number, speed: number, wobbleTimer: number }> = []
  private readonly count: number
  private screenW: number
  private screenH: number

  constructor(count: number, screenW: number, screenH: number) {
    super()
    this.count = count
    this.screenW = screenW
    this.screenH = screenH
  }

  onInitialize(_engine: ex.Engine): void {
    this.body.useGravity = false
    for (let i = 0; i < this.count; i++) {
      this.drops.push({
        x: Math.random() * this.screenW,
        y: Math.random() * this.screenH,
        speed: 50 + Math.random() * 50,
        wobbleTimer: Math.random() * Math.PI * 2,
      })
    }
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    const dt = delta / 1000
    for (const drop of this.drops) {
      drop.wobbleTimer += dt * 2
      drop.y += drop.speed * dt
      drop.x += Math.sin(drop.wobbleTimer) * 15 * dt
      if (drop.y > this.screenH) {
        drop.y = -4
        drop.x = Math.random() * this.screenW
      }
    }
  }

  onPostDraw(ctx: ex.ExcaliburGraphicsContext, _delta: number): void {
    for (const drop of this.drops) {
      ctx.drawCircle(
        ex.vec(drop.x + 2, drop.y + 2),
        2,
        ex.Color.fromRGB(255, 255, 255, 217)
      )
    }
  }
}
