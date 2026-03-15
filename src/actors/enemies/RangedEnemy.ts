import * as ex from 'excalibur'
import { BaseEnemy, PLAYER_TAG } from './BaseEnemy'
import { drawEnemyProjectile } from '../../graphics/sprites'

type PlayerLike = ex.Actor & {
  isRespawning: boolean
  triggerRespawn: (engine: ex.Engine) => void
}

class EnemyProjectile extends ex.Actor {
  constructor(pos: ex.Vector, dirX: number) {
    super({
      pos,
      width: 8,
      height: 8,
      collisionType: ex.CollisionType.Passive,
      z: 3,
    })
    this.vel = ex.vec(dirX * 80, 0)
    this.body.useGravity = false
  }

  onInitialize(engine: ex.Engine): void {
    this.graphics.use(drawEnemyProjectile())
    this.actions.delay(3000).die()

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (other.tags.has(PLAYER_TAG)) {
        const player = other as PlayerLike
        if (!player.isRespawning) {
          player.triggerRespawn(engine)
        }
        this.kill()
      }
    })
  }
}

export class RangedEnemy extends BaseEnemy {
  private shootTimer: number = 0
  private readonly shootInterval: number = 3000
  private readonly detectionRange: number = 200

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Active,
      z: 3,
    })
    this.shootTimer = Math.random() * 3000
  }

  protected getType(): 'patrol' | 'ranged' { return 'ranged' }

  onInitialize(engine: ex.Engine): void {
    super.onInitialize(engine)
    this.vel.x = 0
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    super.onPreUpdate(engine, delta)
    this.shootTimer += delta

    if (!this.scene) return

    // Find player
    let playerActor: ex.Actor | null = null
    for (const actor of this.scene.actors) {
      if (actor.tags.has(PLAYER_TAG)) {
        playerActor = actor
        break
      }
    }

    if (!playerActor) return

    const dist = this.pos.distance(playerActor.pos)
    const dirX = playerActor.pos.x > this.pos.x ? 1 : -1
    this.facingRight = dirX > 0

    this.frameTimer += delta
    if (this.frameTimer > 200) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
      this.updateGraphic()
    }

    if (dist <= this.detectionRange && this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0
      const proj = new EnemyProjectile(this.pos.clone(), dirX)
      this.scene.add(proj)
    }
  }
}
