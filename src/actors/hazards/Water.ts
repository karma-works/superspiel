import * as ex from 'excalibur'
import { PLAYER_TAG } from '../enemies/BaseEnemy'

type PlayerLike = ex.Actor & {
  startDrowning: () => void
  stopDrowning: () => void
}

export class Water extends ex.Actor {
  private frameTimer: number = 0
  private animFrame: number = 0
  private readonly w: number
  private readonly h: number

  constructor(pos: ex.Vector, width: number = 16, height: number = 80) {
    super({
      pos,
      width,
      height,
      collisionType: ex.CollisionType.Passive,
      z: 1,
    })
    this.w = width
    this.h = height
  }

  onInitialize(_engine: ex.Engine): void {
    this.body.useGravity = false

    const self = this
    const W = this.w
    const H = this.h

    // Full-pit water canvas — redrawn each animation frame for waves
    const waterCanvas = new ex.Canvas({
      width:  Math.max(1, W),
      height: Math.max(1, H),
      cache: false,
      draw(ctx) {
        const frame = self.animFrame

        // Deep water body
        ctx.fillStyle = '#0d47a1'
        ctx.fillRect(0, 0, W, H)

        // Subtle depth shimmer bands
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fillRect(0, H * 0.30, W, 3)
        ctx.fillRect(0, H * 0.60, W, 2)

        // Surface layer (top 10 px)
        ctx.fillStyle = '#1e90ff'
        ctx.fillRect(0, 0, W, 10)

        // Animated wave bumps across full width
        const waveOffset = (frame * 2) % 8
        ctx.fillStyle = '#4daaff'
        for (let x = -waveOffset; x < W + 8; x += 8) {
          ctx.beginPath()
          ctx.arc(x + 4, 4, 3, Math.PI, 0)
          ctx.fill()
        }

        // Surface shimmer flecks
        ctx.fillStyle = 'rgba(255,255,255,0.20)'
        const shimmer = (frame * 4) % 16
        for (let x = shimmer; x < W; x += 20) {
          ctx.fillRect(x, 7, 5, 2)
        }
      },
    })

    this.graphics.use(waterCanvas)

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
    }
  }
}
