import * as ex from 'excalibur'
import { drawCheckpoint } from '../graphics/sprites'
import { PLAYER_TAG } from './enemies/BaseEnemy'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
  setCheckpoint: (pos: ex.Vector) => void
}

export class Checkpoint extends ex.Actor {
  private activated: boolean = false

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 8,
      height: 24,
      collisionType: ex.CollisionType.Passive,
      z: 1,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.graphics.use(drawCheckpoint(false))
    this.body.useGravity = false
  }

  onPreUpdate(_engine: ex.Engine, _delta: number): void {
    if (this.activated) return
    if (!this.scene) return

    for (const actor of this.scene.actors) {
      if (actor.tags.has(PLAYER_TAG)) {
        const player = actor as PlayerLike
        if (!player.isRespawning) {
          const dist = this.pos.distance(actor.pos)
          if (dist < 24) {
            this.activate(player)
            return
          }
        }
      }
    }
  }

  private activate(player: PlayerLike): void {
    if (this.activated) return
    this.activated = true
    player.setCheckpoint(this.pos.clone())
    this.graphics.use(drawCheckpoint(true))
  }
}
