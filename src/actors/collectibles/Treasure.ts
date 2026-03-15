import * as ex from 'excalibur'
import { drawTreasure, drawStar } from '../../graphics/sprites'
import { PLAYER_TAG } from '../enemies/BaseEnemy'
import { TREASURE_VALUE } from '../../config'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
  addScore: (v: number) => void
}

export class Treasure extends ex.Actor {
  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 18,
      height: 14,
      collisionType: ex.CollisionType.Passive,
      z: 2,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.graphics.use(drawTreasure())
    this.body.useGravity = false
  }

  onPreUpdate(_engine: ex.Engine, _delta: number): void {
    if (!this.scene) return
    for (const actor of this.scene.actors) {
      if (actor.tags.has(PLAYER_TAG)) {
        const player = actor as PlayerLike
        if (!player.isRespawning) {
          const dist = this.pos.distance(actor.pos)
          if (dist < 22) {
            player.addScore(TREASURE_VALUE)
            this.scene.emit('treasure:collected', { value: TREASURE_VALUE })
            this.spawnSparkle()
            this.kill()
            return
          }
        }
      }
    }
  }

  private spawnSparkle(): void {
    if (!this.scene) return
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const star = new ex.Actor({
        pos: this.pos.clone(),
        width: 10,
        height: 10,
        collisionType: ex.CollisionType.PreventCollision,
        z: 10,
      })
      star.graphics.use(drawStar())
      star.body.useGravity = false
      star.vel = ex.vec(Math.cos(angle) * 60, Math.sin(angle) * 60)
      this.scene.add(star)
      star.actions.delay(600).die()
    }
  }
}
