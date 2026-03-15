import * as ex from 'excalibur'
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, RESPAWN_DELAY_MS, DROWNING_TIME_MS } from '../config'
import { drawPlayer, drawPlayerJump, drawPlayerFly, drawStar } from '../graphics/sprites'
import { Fireball } from './Fireball'

export const VEHICLE_TAG = 'vehicle'
export const PLAYER_TAG_CONST = 'player'

export class Player extends ex.Actor {
  facingRight: boolean = true
  isOnGround: boolean = false
  currentVehicle: ex.Actor | null = null
  get isOnVehicle(): boolean { return this.currentVehicle !== null }
  isDrowning: boolean = false
  drowningTimer: number = 0
  fireballCooldown: number = 0
  respawnPos: ex.Vector = ex.vec(50, 200)
  isRespawning: boolean = false

  // Health — 3 hearts, loses one per hit, respawns when all are lost
  health: number = 3
  readonly maxHealth: number = 3

  // Flying (Kirby-style) — double-jump to puff up, ↓ to deflate
  isFlying: boolean = false
  private _airJumpAvailable: boolean = false
  private _flyFlapTimer: number = 0
  private _flyFlapFrame: number = 0

  private walkFrame: number = 0
  private frameTimer: number = 0
  private _groundContacts: Set<number> = new Set()
  private _jumpBuffer: number = 0
  private static readonly JUMP_BUFFER_MS = 120
  // Invincibility window after a hit — prevents taking rapid repeated damage
  private _invincibleTimer: number = 0
  private static readonly INVINCIBLE_MS = 1500
  private score: number = 0

  get totalScore(): number { return this.score }
  addScore(v: number) { this.score += v }

  onInitialize(_engine: ex.Engine): void {
    this.addTag(PLAYER_TAG_CONST)
    this.graphics.use(drawPlayer('right', 0))
    this.body.useGravity = true

    this.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (evt.side === ex.Side.Bottom) {
        if (!other.tags.has('enemy') && !other.tags.has('fireball')) {
          this._groundContacts.add(other.id)
          this.isOnGround = true
          // Landing ends flight
          if (this.isFlying) this._endFlight()
          this._airJumpAvailable = false
        }
      }
      if (other.tags.has(VEHICLE_TAG) && !this.isOnVehicle && evt.side === ex.Side.Bottom) {
        this.boardVehicle(other)
      }
    })
    this.on('collisionend', (evt) => {
      const other = evt.other as ex.Actor
      this._groundContacts.delete(other.id)
      if (this._groundContacts.size === 0) {
        this.isOnGround = false
      }
    })
  }

  private _endFlight(): void {
    this.isFlying = false
    this.body.useGravity = true
  }

  boardVehicle(vehicle: ex.Actor): void {
    this.currentVehicle = vehicle
    vehicle.emit('player:boarded' as never, { player: this })
  }

  dismountVehicle(): void {
    if (this.currentVehicle) {
      this.currentVehicle.emit('player:dismounted' as never, { player: this })
      this.currentVehicle = null
    }
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    this._invincibleTimer = Math.max(0, this._invincibleTimer - delta)
    this.fireballCooldown = Math.max(0, this.fireballCooldown - delta)
    this._jumpBuffer = Math.max(0, this._jumpBuffer - delta)

    // Opacity: flash while invincible, solid otherwise, dim during respawn
    if (this.isRespawning) {
      this.graphics.opacity = 0.3
    } else if (this._invincibleTimer > 0) {
      this.graphics.opacity = Math.sin(this._invincibleTimer * 0.03) > 0 ? 1 : 0.35
    } else {
      this.graphics.opacity = 1
    }

    if (this.isRespawning) return

    const kb = engine.input.keyboard

    if (this.isDrowning) {
      this.drowningTimer += delta
      if (this.drowningTimer >= DROWNING_TIME_MS) {
        this.triggerRespawn(engine)
        return
      }
    }

    if (this.isOnVehicle) {
      if (kb.isHeld(ex.Keys.Up) || kb.isHeld(ex.Keys.Space)) {
        this.dismountVehicle()
      }
      return
    }

    // Horizontal movement
    let moving = false
    if (kb.isHeld(ex.Keys.ArrowLeft) || kb.isHeld(ex.Keys.A)) {
      this.vel.x = -PLAYER_SPEED
      this.facingRight = false
      moving = true
    } else if (kb.isHeld(ex.Keys.ArrowRight) || kb.isHeld(ex.Keys.D)) {
      this.vel.x = PLAYER_SPEED
      this.facingRight = true
      moving = true
    } else {
      this.vel.x *= 0.75
      if (Math.abs(this.vel.x) < 5) this.vel.x = 0
    }

    // ── Jump & Fly ────────────────────────────────────────────────────────────
    if (kb.wasPressed(ex.Keys.ArrowUp) || kb.wasPressed(ex.Keys.Space) || kb.wasPressed(ex.Keys.W)) {
      if (this.isFlying) {
        // Flap upward while flying
        this.vel.y = -130
      } else if (this.isOnGround) {
        // Normal jump — becomes eligible for air-jump
        this._jumpBuffer = Player.JUMP_BUFFER_MS
        this._airJumpAvailable = true
      } else if (this._airJumpAvailable) {
        // Air jump → enter fly mode (Kirby puff)
        this._airJumpAvailable = false
        this.isFlying = true
        this.body.useGravity = false
        this.vel.y = -90  // initial puff upward
        this._flyFlapTimer = 0
        this._flyFlapFrame = 0
      }
    }

    // Ground jump with buffer
    if (this._jumpBuffer > 0 && this.isOnGround && !this.isFlying) {
      this.vel.y = PLAYER_JUMP_VELOCITY
      this.isOnGround = false
      this._groundContacts.clear()
      this._jumpBuffer = 0
    }

    // Flying physics — gentle drift downward; ↓ to deflate
    if (this.isFlying) {
      // Slow downward drift when not flapping
      this.vel.y += 0.04 * delta   // gentle sink
      if (this.vel.y > 60) this.vel.y = 60   // cap sink speed
      if (this.vel.y < -200) this.vel.y = -200

      // ↓ or S to deflate
      if (kb.isHeld(ex.Keys.ArrowDown) || kb.isHeld(ex.Keys.S)) {
        this._endFlight()
      }

      // Flap animation
      this._flyFlapTimer += delta
      if (this._flyFlapTimer > 180) {
        this._flyFlapTimer = 0
        this._flyFlapFrame = (this._flyFlapFrame + 1) % 2
      }
    }

    // Fire
    if ((kb.wasPressed(ex.Keys.Z) || kb.wasPressed(ex.Keys.X)) && this.fireballCooldown <= 0) {
      this.fireballCooldown = 300
      const fireOffset = this.facingRight ? ex.vec(12, -4) : ex.vec(-12, -4)
      const fireball = new Fireball(this.pos.add(fireOffset), this.facingRight)
      if (this.scene) this.scene.add(fireball)
    }

    // Animations
    if (this.isFlying) {
      const dir = this.facingRight ? 'right' : 'left'
      this.graphics.use(drawPlayerFly(dir, this._flyFlapFrame))
    } else {
      this.frameTimer += delta
      if (this.isOnGround && moving) {
        if (this.frameTimer > 100) {
          this.frameTimer = 0
          this.walkFrame = (this.walkFrame + 1) % 2
        }
        this.graphics.use(drawPlayer(this.facingRight ? 'right' : 'left', this.walkFrame))
      } else if (!this.isOnGround) {
        this.graphics.use(drawPlayerJump(this.facingRight ? 'right' : 'left'))
      } else {
        this.graphics.use(drawPlayer(this.facingRight ? 'right' : 'left', 0))
      }
    }

    if (this.pos.x < 8) { this.pos.x = 8; this.vel.x = 0 }
  }

  onPostUpdate(_engine: ex.Engine, _delta: number): void {
    if (!this.isFlying && Math.abs(this.vel.y) > 8) this.isOnGround = false
  }

  /** Called by hazards and enemies when the player is damaged. */
  triggerRespawn(engine: ex.Engine): void {
    // Ignore if already respawning or still invincible from a recent hit
    if (this.isRespawning || this._invincibleTimer > 0) return

    this.health--
    this.isDrowning = false
    this.drowningTimer = 0
    if (this.isFlying) this._endFlight()

    if (this.health > 0) {
      // Hurt but still alive — knockback + invincibility window, no teleport
      this._invincibleTimer = Player.INVINCIBLE_MS
      const knockDir = this.facingRight ? -1 : 1
      this.vel = ex.vec(knockDir * 180, -280)
      this._groundContacts.clear()
      this.isOnGround = false
      this.spawnStarBurst()
    } else {
      // All hearts lost — full respawn, restore health
      this.health = this.maxHealth
      this.isRespawning = true
      this.vel = ex.vec(0, 0)
      this.spawnStarBurst()

      engine.clock.schedule(() => {
        if (!this.active) return
        this.pos = this.respawnPos.clone()
        this.vel = ex.vec(0, 0)
        this.isRespawning = false
        this._invincibleTimer = Player.INVINCIBLE_MS
        this._groundContacts.clear()
        this.isOnGround = false
        if (this.currentVehicle) this.dismountVehicle()
      }, RESPAWN_DELAY_MS)
    }
  }

  private spawnStarBurst(): void {
    if (!this.scene) return
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const star = new ex.Actor({
        pos: this.pos.clone(),
        width: 10, height: 10,
        collisionType: ex.CollisionType.PreventCollision,
        z: 10,
      })
      star.graphics.use(drawStar())
      star.vel = ex.vec(Math.cos(angle) * 80, Math.sin(angle) * 80)
      star.body.useGravity = false
      this.scene.add(star)
      star.actions.delay(500).die()
    }
  }

  setCheckpoint(pos: ex.Vector): void { this.respawnPos = pos.clone() }
  startDrowning(): void { if (!this.isDrowning) { this.isDrowning = true; this.drowningTimer = 0 } }
  stopDrowning(): void { this.isDrowning = false; this.drowningTimer = 0 }
}
