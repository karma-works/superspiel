import * as ex from 'excalibur'
import { drawPenguin } from '../../graphics/sprites'
import { Player, VEHICLE_TAG } from '../Player'
import { TouchInputManager } from '../../input/TouchInputManager'

export class Penguin extends ex.Actor {
  private boardedPlayer: Player | null = null
  private readonly speed: number = 200
  private facingRight: boolean = true
  private frameTimer: number = 0
  private animFrame: number = 0

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 28,
      height: 28,
      collisionType: ex.CollisionType.Fixed,
      z: 2,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.addTag(VEHICLE_TAG)
    this.graphics.use(drawPenguin('right', 0))
    this.body.useGravity = true

    this.on('player:boarded' as never, (evt: unknown) => {
      const e = evt as { player: Player }
      this.boardedPlayer = e.player
    })

    this.on('player:dismounted' as never, (_evt: unknown) => {
      this.boardedPlayer = null
      this.vel.x = 0
    })

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (other instanceof Player && !other.isOnVehicle && evt.side === ex.Side.Bottom) {
        other.boardVehicle(this)
        this.boardedPlayer = other
      }
    })
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    if (!this.boardedPlayer) {
      // Idle: waddle in place slowly when unridden, then stop
      this.vel.x *= 0.9
      if (Math.abs(this.vel.x) < 2) this.vel.x = 0
      this.graphics.use(drawPenguin(this.facingRight ? 'right' : 'left', 0))
      return
    }

    const kb = engine.input.keyboard
    const touch = TouchInputManager.instance

    if (kb.isHeld(ex.Keys.ArrowLeft) || kb.isHeld(ex.Keys.A) || touch.leftHeld) {
      this.vel.x = -this.speed
      this.facingRight = false
    } else if (kb.isHeld(ex.Keys.ArrowRight) || kb.isHeld(ex.Keys.D) || touch.rightHeld) {
      this.vel.x = this.speed
      this.facingRight = true
    } else {
      // Ice: very low friction — penguin keeps gliding
      this.vel.x *= 0.97
      if (Math.abs(this.vel.x) < 3) this.vel.x = 0
    }

    // Sync player: rider sits on the penguin's head
    this.boardedPlayer.pos.x = this.pos.x
    this.boardedPlayer.pos.y = this.pos.y - 24
    this.boardedPlayer.vel.x = this.vel.x
    this.boardedPlayer.vel.y = 0

    // Waddle animation — faster when moving
    const isMoving = Math.abs(this.vel.x) > 10
    this.frameTimer += delta
    const frameInterval = isMoving ? 180 : 0
    if (isMoving && this.frameTimer > frameInterval) {
      this.frameTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
    }
    this.graphics.use(drawPenguin(this.facingRight ? 'right' : 'left', this.animFrame))
  }
}
