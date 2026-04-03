import * as ex from 'excalibur'
import { drawCar } from '../../graphics/sprites'
import { Player, VEHICLE_TAG } from '../Player'
import { TouchInputManager } from '../../input/TouchInputManager'

export class Car extends ex.Actor {
  private boardedPlayer: Player | null = null
  private carSpeed: number = 280

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 36,
      height: 20,
      collisionType: ex.CollisionType.Fixed,
      z: 2,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.addTag(VEHICLE_TAG)
    this.graphics.use(drawCar())
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

  onPreUpdate(engine: ex.Engine, _delta: number): void {
    if (!this.boardedPlayer) {
      this.vel.x = 0
      return
    }

    const kb = engine.input.keyboard
    const touch = TouchInputManager.instance

    if (kb.isHeld(ex.Keys.ArrowLeft) || kb.isHeld(ex.Keys.A) || touch.leftHeld) {
      this.vel.x = -this.carSpeed
    } else if (kb.isHeld(ex.Keys.ArrowRight) || kb.isHeld(ex.Keys.D) || touch.rightHeld) {
      this.vel.x = this.carSpeed
    } else {
      this.vel.x *= 0.8
      if (Math.abs(this.vel.x) < 5) this.vel.x = 0
    }

    // Move player with car
    if (this.boardedPlayer) {
      this.boardedPlayer.pos.x = this.pos.x
      this.boardedPlayer.pos.y = this.pos.y - 18
      this.boardedPlayer.vel.x = this.vel.x
      this.boardedPlayer.vel.y = 0
    }
  }
}
