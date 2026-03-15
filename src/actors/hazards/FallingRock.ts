import * as ex from 'excalibur'
import { drawFallingRock } from '../../graphics/sprites'
import { PLAYER_TAG } from '../enemies/BaseEnemy'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
  triggerRespawn: (engine: ex.Engine) => void
}

export class FallingRock extends ex.Actor {
  private startPos: ex.Vector
  private isFalling: boolean = false
  private resetTimer: number = 0
  private readonly resetDelay: number = 3000

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Fixed,
      z: 3,
    })
    this.startPos = pos.clone()
  }

  onInitialize(engine: ex.Engine): void {
    this.graphics.use(drawFallingRock())
    this.body.useGravity = false

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (other.tags.has(PLAYER_TAG) && this.isFalling) {
        const player = other as PlayerLike
        if (!player.isRespawning) {
          player.triggerRespawn(engine)
        }
      }
    })
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    if (this.isFalling) {
      this.resetTimer += delta
      if (this.resetTimer >= this.resetDelay) {
        this.isFalling = false
        this.resetTimer = 0
        this.pos = this.startPos.clone()
        this.vel = ex.vec(0, 0)
        this.body.useGravity = false
        this.body.collisionType = ex.CollisionType.Fixed
      }
      return
    }

    if (!this.scene) return
    for (const actor of this.scene.actors) {
      if (actor.tags.has(PLAYER_TAG)) {
        const dx = Math.abs(actor.pos.x - this.pos.x)
        if (dx < 48 && actor.pos.y > this.pos.y) {
          this.isFalling = true
          this.body.useGravity = true
          this.body.collisionType = ex.CollisionType.Active
          break
        }
      }
    }
  }
}
