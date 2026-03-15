import * as ex from 'excalibur'
import { BaseEnemy } from './BaseEnemy'

export class PatrolEnemy extends BaseEnemy {
  private leftBound: number
  private rightBound: number
  private patrolSpeed: number = 60

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
    this.vel.x = this.patrolSpeed
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    super.onPreUpdate(engine, delta)

    // Patrol between bounds
    if (this.pos.x >= this.rightBound) {
      this.vel.x = -this.patrolSpeed
      this.facingRight = false
    } else if (this.pos.x <= this.leftBound) {
      this.vel.x = this.patrolSpeed
      this.facingRight = true
    }

    // Animate
    this.frameTimer += delta
    if (this.frameTimer > 150) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
      this.updateGraphic()
    }
  }
}
