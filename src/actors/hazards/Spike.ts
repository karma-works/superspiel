import * as ex from 'excalibur'
import { drawSpike } from '../../graphics/sprites'
import { PLAYER_TAG } from '../enemies/BaseEnemy'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
  triggerRespawn: (engine: ex.Engine) => void
}

export class Spike extends ex.Actor {
  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 16,
      height: 12,
      collisionType: ex.CollisionType.Fixed,
      z: 1,
    })
  }

  onInitialize(engine: ex.Engine): void {
    this.graphics.use(drawSpike())
    this.body.useGravity = false

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (other.tags.has(PLAYER_TAG)) {
        const player = other as PlayerLike
        if (!player.isRespawning) {
          player.triggerRespawn(engine)
        }
      }
    })
  }
}
