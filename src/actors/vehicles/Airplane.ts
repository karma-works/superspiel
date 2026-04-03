import * as ex from 'excalibur'
import { drawAirplane } from '../../graphics/sprites'
import { Player, VEHICLE_TAG } from '../Player'
import { TouchInputManager } from '../../input/TouchInputManager'

export const AIRPLANE_TAG = 'airplane'

export class Airplane extends ex.Actor {
  private boardedPlayer: Player | null = null
  private readonly speed: number = 140

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 56,
      height: 24,
      collisionType: ex.CollisionType.Fixed,
      z: 2,
    })
  }

  onInitialize(_engine: ex.Engine): void {
    this.addTag(VEHICLE_TAG)
    this.addTag(AIRPLANE_TAG)
    this.graphics.use(drawAirplane())
    this.body.useGravity = false

    this.on('player:boarded' as never, (evt: unknown) => {
      const e = evt as { player: Player }
      this.boardedPlayer = e.player
    })

    this.on('player:dismounted' as never, (_evt: unknown) => {
      this.boardedPlayer = null
      this.vel.x = 0
      this.vel.y = 0
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
      this.vel.x *= 0.9
      this.vel.y *= 0.9
      if (Math.abs(this.vel.x) < 2) this.vel.x = 0
      if (Math.abs(this.vel.y) < 2) this.vel.y = 0
      return
    }

    const kb = engine.input.keyboard
    const touch = TouchInputManager.instance

    // Horizontal
    if (kb.isHeld(ex.Keys.ArrowLeft) || kb.isHeld(ex.Keys.A) || touch.leftHeld) {
      this.vel.x = -this.speed
    } else if (kb.isHeld(ex.Keys.ArrowRight) || kb.isHeld(ex.Keys.D) || touch.rightHeld) {
      this.vel.x = this.speed
    } else {
      this.vel.x *= 0.88
      if (Math.abs(this.vel.x) < 3) this.vel.x = 0
    }

    // Vertical (Up = climb, Down = dive)
    if (kb.isHeld(ex.Keys.ArrowUp) || kb.isHeld(ex.Keys.W) || touch.upperHeld) {
      this.vel.y = -this.speed
    } else if (kb.isHeld(ex.Keys.ArrowDown) || kb.isHeld(ex.Keys.S)) {
      this.vel.y = this.speed
    } else {
      this.vel.y *= 0.88
      if (Math.abs(this.vel.y) < 3) this.vel.y = 0
    }

    // Sync player to cockpit position (on top of fuselage)
    this.boardedPlayer.pos.x = this.pos.x
    this.boardedPlayer.pos.y = this.pos.y - 22
    this.boardedPlayer.vel.x = this.vel.x
    this.boardedPlayer.vel.y = this.vel.y
  }
}
