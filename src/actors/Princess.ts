import * as ex from 'excalibur'
import { drawPrincess } from '../graphics/sprites'

export class Princess extends ex.Actor {
  private frameTimer: number = 0
  private animFrame: number = 0

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 16,
      height: 28,
      collisionType: ex.CollisionType.PreventCollision,
      z: 4,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.body.useGravity = false
    this.graphics.use(drawPrincess(0))
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.frameTimer += delta
    if (this.frameTimer > 250) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 6
      this.graphics.use(drawPrincess(this.animFrame))
    }
  }
}
