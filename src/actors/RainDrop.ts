import * as ex from 'excalibur'

export class RainSystem extends ex.ScreenElement {
  private drops: Array<{ x: number, y: number, speed: number }> = []
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
        speed: 200 + Math.random() * 100,
      })
    }
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    const dt = delta / 1000
    for (const drop of this.drops) {
      drop.y += drop.speed * dt
      drop.x += 30 * dt
      if (drop.y > this.screenH) {
        drop.y = -8
        drop.x = Math.random() * this.screenW
      }
      if (drop.x > this.screenW) {
        drop.x = 0
      }
    }
  }

  onPostDraw(ctx: ex.ExcaliburGraphicsContext, _delta: number): void {
    for (const drop of this.drops) {
      ctx.drawRectangle(
        ex.vec(drop.x, drop.y),
        2,
        8,
        ex.Color.fromRGB(100, 150, 255, 178)
      )
    }
  }
}
