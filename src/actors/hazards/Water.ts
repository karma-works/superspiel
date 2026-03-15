import * as ex from 'excalibur'
import { drawWater } from '../../graphics/sprites'
import { PLAYER_TAG } from '../enemies/BaseEnemy'

type PlayerLike = ex.Actor & {
  startDrowning: () => void
  stopDrowning: () => void
}

export class Water extends ex.Actor {
  private frameTimer: number = 0
  private animFrame: number = 0

  constructor(pos: ex.Vector, width: number = 16, height: number = 80) {
    super({
      pos,
      width,
      height,
      collisionType: ex.CollisionType.Passive,
      z: 1,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.body.useGravity = false
    this.graphics.use(drawWater(0))

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (other.tags.has(PLAYER_TAG)) {
        const player = other as PlayerLike
        player.startDrowning()
      }
    })

    this.on('collisionend', (evt) => {
      const other = evt.other as ex.Actor
      if (other.tags.has(PLAYER_TAG)) {
        const player = other as PlayerLike
        player.stopDrowning()
      }
    })
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.frameTimer += delta
    if (this.frameTimer > 250) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 4
      this.graphics.use(drawWater(this.animFrame))
    }
  }
}
