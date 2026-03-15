import * as ex from 'excalibur'
import { FRIEND_OFFSET_X, FRIEND_OFFSET_Y } from '../config'
import { drawFox } from '../graphics/sprites'
import { Player } from './Player'
import { BaseEnemy } from './enemies/BaseEnemy'

export class Friend extends ex.Actor {
  private target: Player
  private attackCooldown: number = 0
  private stunTimer: number = 0
  private frameTimer: number = 0
  private animFrame: number = 0
  private blinkTimer: number = 0
  private facingRight: boolean = true

  constructor(target: Player) {
    super({
      width: 16,
      height: 20,
      // PreventCollision: Fox is purely visual — no physics interaction with
      // the player or tiles, so it can never push or block the player
      collisionType: ex.CollisionType.PreventCollision,
      z: 4,
    })
    this.target = target
  }

  onInitialize(_engine: ex.Engine): void {
    this.graphics.use(drawFox('right', 0))
    // No gravity — position is driven entirely by following the player
    this.body.useGravity = false
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.attackCooldown = Math.max(0, this.attackCooldown - delta)
    this.stunTimer = Math.max(0, this.stunTimer - delta)
    this.blinkTimer += delta

    if (this.stunTimer > 0) {
      this.graphics.opacity = 0.5 + Math.sin(this.stunTimer * 0.02) * 0.5
      return
    }

    this.graphics.opacity = 1

    // Follow player: smooth X lerp, exact Y match (floats alongside player)
    const playerFacingRight = this.target.facingRight
    const offsetX = FRIEND_OFFSET_X * (playerFacingRight ? 1 : -1)
    const desiredX = this.target.pos.x + offsetX

    // Lerp X — faster when far, smooth when close, never overshoots
    const dx = desiredX - this.pos.x
    const lerpSpeed = Math.min(Math.abs(dx) * 0.15, 12) * Math.sign(dx)
    this.pos.x += lerpSpeed * (delta / 16)

    // Match player Y exactly so Fox is always at the same height
    this.pos.y = this.target.pos.y + FRIEND_OFFSET_Y

    // Face direction of travel
    if (Math.abs(dx) > 4) {
      this.facingRight = dx > 0
    }

    // Animate
    this.frameTimer += delta
    if (this.frameTimer > 120) {
      this.frameTimer = 0
      let blinkFrame = this.animFrame
      if (this.blinkTimer > 3000 && this.blinkTimer < 3150) {
        blinkFrame = 2
      }
      if (this.blinkTimer > 3150) this.blinkTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
      const facing = this.facingRight ? 'right' : 'left'
      this.graphics.use(drawFox(facing, blinkFrame))
    }

    // Attack nearby enemies
    if (this.attackCooldown <= 0 && this.scene) {
      this.tryAttackNearbyEnemy()
    }
  }

  private tryAttackNearbyEnemy(): void {
    if (!this.scene) return
    for (const actor of this.scene.actors) {
      if (actor instanceof BaseEnemy) {
        const dist = this.pos.distance(actor.pos)
        if (dist < 60) {
          actor.onHit(1)
          this.attackCooldown = 1500
          break
        }
      }
    }
  }

  onHit(): void {
    this.stunTimer = 800
  }
}
