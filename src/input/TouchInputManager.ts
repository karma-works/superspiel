const LOGICAL_W = 800
const LOGICAL_H = 450
const SWIPE_THRESHOLD = 30 // logical pixels

type Zone = 'upper' | 'lower-left' | 'lower-right'

interface TouchData {
  startX: number
  startY: number
  startTime: number
  zone: Zone
  lastY: number
}

export class TouchInputManager {
  private static _instance: TouchInputManager | null = null
  static get instance(): TouchInputManager {
    if (!this._instance) this._instance = new TouchInputManager()
    return this._instance
  }

  readonly isTouchDevice: boolean

  // Held states — true while finger remains in zone
  private _leftHeld = false
  private _rightHeld = false
  private _upperHeld = false

  // One-frame pulses — reset each frame via resetFrameState()
  private _jumpPressed = false      // tap in upper zone
  private _swipeUpPressed = false   // swipe up in upper zone → double-jump / flap
  private _swipeDownPressed = false // swipe down in upper zone → deflate
  private _shootPressed = false     // two-finger touch → fire
  private _anyPressed = false       // any touch → menu start

  private _touches: Map<number, TouchData> = new Map()

  constructor() {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (this.isTouchDevice) this._bindEvents()
  }

  private _bindEvents(): void {
    window.addEventListener('touchstart', this._onStart, { passive: false })
    window.addEventListener('touchmove', this._onMove, { passive: false })
    window.addEventListener('touchend', this._onEnd, { passive: false })
    window.addEventListener('touchcancel', this._onCancel, { passive: false })
  }

  private _logicalPos(touch: Touch): { x: number; y: number } | null {
    const canvas = document.querySelector('canvas')
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: (touch.clientX - rect.left) * (LOGICAL_W / rect.width),
      y: (touch.clientY - rect.top) * (LOGICAL_H / rect.height),
    }
  }

  private _zone(x: number, y: number): Zone {
    if (y < LOGICAL_H / 2) return 'upper'
    return x < LOGICAL_W / 2 ? 'lower-left' : 'lower-right'
  }

  private _countZone(zone: Zone): number {
    let n = 0
    for (const t of this._touches.values()) if (t.zone === zone) n++
    return n
  }

  private _onStart = (e: TouchEvent): void => {
    e.preventDefault()
    this._anyPressed = true
    if (e.touches.length === 2) this._shootPressed = true

    for (const touch of Array.from(e.changedTouches)) {
      const pos = this._logicalPos(touch)
      if (!pos) continue
      const zone = this._zone(pos.x, pos.y)
      this._touches.set(touch.identifier, {
        startX: pos.x, startY: pos.y,
        startTime: performance.now(),
        zone,
        lastY: pos.y,
      })
      if (zone === 'lower-left') this._leftHeld = true
      else if (zone === 'lower-right') this._rightHeld = true
      else this._upperHeld = true
    }
  }

  private _onMove = (e: TouchEvent): void => {
    e.preventDefault()
    for (const touch of Array.from(e.changedTouches)) {
      const data = this._touches.get(touch.identifier)
      if (!data || data.zone !== 'upper') continue
      const pos = this._logicalPos(touch)
      if (!pos) continue
      const dy = pos.y - data.lastY
      if (dy < -SWIPE_THRESHOLD) {
        this._swipeUpPressed = true
        data.lastY = pos.y
      } else if (dy > SWIPE_THRESHOLD) {
        this._swipeDownPressed = true
        data.lastY = pos.y
      }
    }
  }

  private _onEnd = (e: TouchEvent): void => {
    e.preventDefault()
    for (const touch of Array.from(e.changedTouches)) {
      const data = this._touches.get(touch.identifier)
      this._touches.delete(touch.identifier)
      if (!data) continue
      const pos = this._logicalPos(touch) ?? { x: data.startX, y: data.startY }
      const dx = Math.abs(pos.x - data.startX)
      const dy = Math.abs(pos.y - data.startY)
      const dt = performance.now() - data.startTime
      // Small movement + short duration = tap → jump
      if (data.zone === 'upper' && dx < SWIPE_THRESHOLD && dy < SWIPE_THRESHOLD && dt < 350) {
        this._jumpPressed = true
      }
      if (data.zone === 'lower-left') this._leftHeld = this._countZone('lower-left') > 0
      if (data.zone === 'lower-right') this._rightHeld = this._countZone('lower-right') > 0
      if (data.zone === 'upper') this._upperHeld = this._countZone('upper') > 0
    }
  }

  private _onCancel = (e: TouchEvent): void => {
    for (const touch of Array.from(e.changedTouches)) {
      const data = this._touches.get(touch.identifier)
      this._touches.delete(touch.identifier)
      if (!data) continue
      if (data.zone === 'lower-left') this._leftHeld = this._countZone('lower-left') > 0
      if (data.zone === 'lower-right') this._rightHeld = this._countZone('lower-right') > 0
      if (data.zone === 'upper') this._upperHeld = this._countZone('upper') > 0
    }
  }

  // Held (continuous)
  get leftHeld(): boolean { return this._leftHeld }
  get rightHeld(): boolean { return this._rightHeld }
  get upperHeld(): boolean { return this._upperHeld }

  // One-frame pulses
  get jumpJustPressed(): boolean { return this._jumpPressed }
  get swipeUpJustPressed(): boolean { return this._swipeUpPressed }
  get swipeDownJustPressed(): boolean { return this._swipeDownPressed }
  get shootJustPressed(): boolean { return this._shootPressed }
  get anyJustPressed(): boolean { return this._anyPressed }

  /** Call once per frame after all actors have processed input. */
  resetFrameState(): void {
    this._jumpPressed = false
    this._swipeUpPressed = false
    this._swipeDownPressed = false
    this._shootPressed = false
    this._anyPressed = false
  }
}
