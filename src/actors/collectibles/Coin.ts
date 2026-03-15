import * as ex from 'excalibur'
import { drawCoin } from '../../graphics/sprites'
import { PLAYER_TAG } from '../enemies/BaseEnemy'
import { COIN_VALUE } from '../../config'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
  addScore: (v: number) => void
}

export class Coin extends ex.Actor {
  private frameTimer: number = 0
  private animFrame: number = 0
  private floatTimer: number = 0
  private baseY: number = 0

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 12,
      height: 12,
      collisionType: ex.CollisionType.Passive,
      z: 2,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.graphics.use(drawCoin(0))
    this.body.useGravity = false
    this.baseY = this.pos.y
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    // Animate spin
    this.frameTimer += delta
    if (this.frameTimer > 150) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 4
      this.graphics.use(drawCoin(this.animFrame % 2))
    }

    // Gentle float
    this.floatTimer += delta
    this.pos.y = this.baseY + Math.sin(this.floatTimer * 0.003) * 3

    // Check overlap with player
    if (!this.scene) return
    for (const actor of this.scene.actors) {
      if (actor.tags.has(PLAYER_TAG)) {
        const player = actor as PlayerLike
        if (!player.isRespawning) {
          const dist = this.pos.distance(actor.pos)
          if (dist < 18) {
            player.addScore(COIN_VALUE)
            this.scene.emit('coin:collected', {})
            this.kill()
            return
          }
        }
      }
    }
  }
}
