import * as ex from 'excalibur'
import { BaseEnemy } from './BaseEnemy'

export class FlyingEnemy extends BaseEnemy {
  private leftBound: number
  private rightBound: number
  private flySpeed: number = 80
  private floatTimer: number = 0

  constructor(pos: ex.Vector, leftBound: number, rightBound: number) {
    super({
      pos,
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Active,
      z: 3,
    })
    this.leftBound = leftBound
    this.rightBound = rightBound
    this.facingRight = true
  }

  protected getType(): 'patrol' | 'ranged' { return 'patrol' }

  onInitialize(engine: ex.Engine): void {
    super.onInitialize(engine)
    // Flying enemies don't use gravity
    this.body.useGravity = false
    this.vel.x = this.flySpeed
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    super.onPreUpdate(engine, delta)
    this.floatTimer += delta

    // Float up and down slightly
    this.vel.y = Math.sin(this.floatTimer * 0.003) * 30

    if (this.pos.x >= this.rightBound) {
      this.vel.x = -this.flySpeed
      this.facingRight = false
    } else if (this.pos.x <= this.leftBound) {
      this.vel.x = this.flySpeed
      this.facingRight = true
    }

    // Animate
    this.frameTimer += delta
    if (this.frameTimer > 120) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
      this.updateGraphic()
    }
  }
}
