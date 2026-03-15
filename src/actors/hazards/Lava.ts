import * as ex from 'excalibur'
import { drawLava } from '../../graphics/sprites'
import { PLAYER_TAG } from '../enemies/BaseEnemy'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
  triggerRespawn: (engine: ex.Engine) => void
}

export class Lava extends ex.Actor {
  private frameTimer: number = 0
  private animFrame: number = 0

  constructor(pos: ex.Vector, width: number = 16) {
    super({
      pos,
      width,
      height: 10,
      collisionType: ex.CollisionType.Fixed,
      z: 1,
    })
  }

  onInitialize(engine: ex.Engine): void {
    this.body.useGravity = false
    this.graphics.use(drawLava(0))

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

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.frameTimer += delta
    if (this.frameTimer > 200) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 4
      this.graphics.use(drawLava(this.animFrame))
    }
  }
}
