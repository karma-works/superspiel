import * as ex from 'excalibur'
import { drawEnemy } from '../../graphics/sprites'

// Tag to identify Player without circular import
export const PLAYER_TAG = 'player'

export abstract class BaseEnemy extends ex.Actor {
  protected health: number = 2
  protected flashTimer: number = 0
  protected facingRight: boolean = true
  protected frameTimer: number = 0
  protected animFrame: number = 0

  onInitialize(engine: ex.Engine): void {
    this.addTag('enemy')
    this.body.useGravity = true
    this.updateGraphic()

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (other.tags.has(PLAYER_TAG)) {
        // Access player via type assertion after tag check
        const player = other as ex.Actor & {
          isRespawning: boolean
          triggerRespawn: (engine: ex.Engine) => void
        }
        if (!player.isRespawning) {
          player.triggerRespawn(engine)
        }
      }
    })
  }

  protected abstract getType(): 'patrol' | 'ranged'

  protected updateGraphic(): void {
    const facing = this.facingRight ? 'right' : 'left'
    this.graphics.use(drawEnemy(this.getType(), facing, this.animFrame))
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    this.flashTimer = Math.max(0, this.flashTimer - delta)
    if (this.flashTimer > 0) {
      this.graphics.opacity = Math.sin(this.flashTimer * 0.05) > 0 ? 1 : 0.3
    } else {
      this.graphics.opacity = 1
    }
  }

  onHit(damage: number): void {
    this.health -= damage
    this.flashTimer = 300

    if (this.health <= 0) {
      if (this.scene) {
        this.scene.emit('enemy:killed', { value: 50 })
      }
      this.kill()
    }
  }
}
