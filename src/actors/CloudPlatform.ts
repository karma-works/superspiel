import * as ex from 'excalibur'
import { drawSkyTile } from '../graphics/sprites'
import { Player } from './Player'

export class CloudPlatform extends ex.Actor {
  private fadeTimer: number = 0
  private state: 'solid' | 'fading' | 'gone' | 'reappearing' = 'solid'
  private readonly fadeDelay: number = 1500
  private readonly goneDelay: number = 4000

  constructor(pos: ex.Vector, width: number = 48) {
    super({
      pos,
      width,
      height: 16,
      collisionType: ex.CollisionType.Fixed,
      z: 1,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.body.useGravity = false
    this.graphics.use(drawSkyTile())

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (other instanceof Player && evt.side === ex.Side.Bottom) {
        if (this.state === 'solid') {
          this.startFading()
        }
      }
    })
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.fadeTimer += delta

    if (this.state === 'fading') {
      const pct = Math.min(1, this.fadeTimer / this.fadeDelay)
      this.graphics.opacity = 1 - pct
      if (this.fadeTimer >= this.fadeDelay) {
        this.state = 'gone'
        this.body.collisionType = ex.CollisionType.PreventCollision
        this.graphics.opacity = 0
        this.fadeTimer = 0
      }
    } else if (this.state === 'gone') {
      if (this.fadeTimer >= this.goneDelay) {
        this.state = 'reappearing'
        this.fadeTimer = 0
      }
    } else if (this.state === 'reappearing') {
      const pct = Math.min(1, this.fadeTimer / 500)
      this.graphics.opacity = pct
      if (this.fadeTimer >= 500) {
        this.state = 'solid'
        this.body.collisionType = ex.CollisionType.Fixed
        this.graphics.opacity = 1
        this.fadeTimer = 0
      }
    }
  }

  private startFading(): void {
    if (this.state !== 'solid') return
    this.state = 'fading'
    this.fadeTimer = 0
  }
}
