import * as ex from 'excalibur'
import { drawBossMonster, drawStar } from '../graphics/sprites'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
  triggerRespawn: (engine: ex.Engine) => void
  vel: ex.Vector
}

export class BossMonster extends ex.Actor {
  private hp: number = 5
  private flashTimer: number = 0
  private frameTimer: number = 0
  private animFrame: number = 0
  private readonly patrolSpeed: number = 50
  private leftBound: number
  private rightBound: number
  private facingRight: boolean = true
  private _defeated: boolean = false

  constructor(pos: ex.Vector, leftBound: number, rightBound: number) {
    super({
      pos,
      width: 64,
      height: 48,
      collisionType: ex.CollisionType.Active,
      z: 3,
    })
    this.leftBound = leftBound
    this.rightBound = rightBound
  }

  onInitialize(engine: ex.Engine): void {
    this.addTag('boss')
    this.addTag('enemy')
    this.body.useGravity = true
    this.graphics.use(drawBossMonster(0))
    this.vel.x = -this.patrolSpeed

    this.on('collisionstart', (evt) => {
      if (this._defeated) return
      const other = evt.other as ex.Actor
      if (!other.tags.has('player')) return

      const player = other as unknown as PlayerLike
      if (player.isRespawning) return

      if (evt.side === ex.Side.Top) {
        // Player stomped from above — boss takes a hit, player bounces up
        this.onHit(1)
        player.vel.y = -380
      } else {
        // Side / bottom hit — player takes damage
        player.triggerRespawn(engine)
      }
    })
  }

  onHit(damage: number): void {
    if (this._defeated) return
    this.hp -= damage
    this.flashTimer = 400

    if (this.hp <= 0) {
      this._defeated = true
      this.spawnStarBurst()
      this.scene?.emit('boss:defeated', { score: 1000 })
      this.kill()
    }
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    if (this._defeated) return

    // Flash on hit
    this.flashTimer = Math.max(0, this.flashTimer - delta)
    if (this.flashTimer > 0) {
      this.graphics.opacity = Math.sin(this.flashTimer * 0.04) > 0 ? 1 : 0.2
    } else {
      this.graphics.opacity = 1
    }

    // Patrol
    if (this.pos.x >= this.rightBound) {
      this.vel.x = -this.patrolSpeed
      this.facingRight = false
    } else if (this.pos.x <= this.leftBound) {
      this.vel.x = this.patrolSpeed
      this.facingRight = true
    }

    // Animate
    this.frameTimer += delta
    if (this.frameTimer > 400) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
      this.graphics.use(drawBossMonster(this.animFrame))
    }
  }

  /** Remaining HP 0–5, used for health bar. */
  get remainingHp(): number { return Math.max(0, this.hp) }
  readonly maxHp = 5

  private spawnStarBurst(): void {
    if (!this.scene) return
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const star = new ex.Actor({
        pos: this.pos.clone(),
        width: 10, height: 10,
        collisionType: ex.CollisionType.PreventCollision,
        z: 10,
      })
      star.graphics.use(drawStar())
      star.vel = ex.vec(Math.cos(angle) * 120, Math.sin(angle) * 120)
      star.body.useGravity = false
      this.scene.add(star)
      star.actions.delay(700).die()
    }
  }
}
