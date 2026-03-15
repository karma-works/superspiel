import * as ex from 'excalibur'
import { drawExitGate } from '../graphics/sprites'
import { PLAYER_TAG } from './enemies/BaseEnemy'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
}

export class ExitGate extends ex.Actor {
  private onExit: () => void

  constructor(pos: ex.Vector, onExit: () => void) {
    super({
      pos,
      width: 32,
      height: 48,
      collisionType: ex.CollisionType.Passive,
      z: 2,
    })
    this.onExit = onExit
  }

  onInitialize(_engine: ex.Engine): void {
    // Gate is always open — player can exit at any time
    this.graphics.use(drawExitGate(false))
    this.body.useGravity = false
  }

  onPreUpdate(_engine: ex.Engine, _delta: number): void {
    if (!this.scene) return

    for (const actor of this.scene.actors) {
      if (actor.tags.has(PLAYER_TAG)) {
        const player = actor as PlayerLike
        if (!player.isRespawning) {
          const dist = this.pos.distance(actor.pos)
          if (dist < 36) {
            this.onExit()
            return
          }
        }
      }
    }
  }
}
