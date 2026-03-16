import * as ex from 'excalibur'
import { FIREBALL_SPEED } from '../config'
import { drawFireball } from '../graphics/sprites'
import { BaseEnemy } from './enemies/BaseEnemy'

export class Fireball extends ex.Actor {
  private lifetime: number = 0
  private readonly maxLifetime: number = 2500
  private frameTimer: number = 0
  private animFrame: number = 0
  private directionX: number
  private bounces: number = 0
  private readonly maxBounces: number = 4

  constructor(pos: ex.Vector, facingRight: boolean) {
    super({
      pos,
      width: 8,
      height: 8,
      collisionType: ex.CollisionType.Active,
      z: 5,
    })
    this.addTag('fireball')
    this.directionX = facingRight ? 1 : -1
  }

  onInitialize(_engine: ex.Engine): void {
    this.graphics.use(drawFireball(0))
    // Strong upward arc (original behaviour); gravity brings it back down and it bounces
    this.vel = ex.vec(this.directionX * FIREBALL_SPEED, -200)
    this.body.useGravity = true

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor

      // Damage enemies
      if (other instanceof BaseEnemy) {
        other.onHit(1)
        if (this.scene) this.scene.emit('enemy:killed', { value: 50 })
        this.kill()
        return
      }

      // Damage boss
      if (other.tags.has('boss')) {
        const boss = other as unknown as { onHit: (d: number) => void }
        boss.onHit(1)
        this.kill()
        return
      }

      // Pass through player and other fireballs — no interaction
      if (other.tags.has('player') || other.tags.has('fireball')) return

      // Bounce off floors; die on walls / ceiling
      if (evt.side === ex.Side.Bottom || this.vel.y > 0) {
        this.bounces++
        if (this.bounces >= this.maxBounces) {
          this.kill()
        } else {
          // Flip y and dampen; x is unchanged so direction never reverses
          this.vel.y = -Math.abs(this.vel.y) * 0.65
        }
      } else {
        // Wall or ceiling hit
        this.kill()
      }
    })
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.lifetime += delta
    if (this.lifetime >= this.maxLifetime) {
      this.kill()
      return
    }

    this.frameTimer += delta
    if (this.frameTimer > 80) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
      this.graphics.use(drawFireball(this.animFrame))
    }
  }
}
