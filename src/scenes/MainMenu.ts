import * as ex from 'excalibur'
import { drawCoin } from '../graphics/sprites'

export class MainMenu extends ex.Scene {
  private bgTimer: number = 0
  private coinTimer: number = 0
  private coinBounce: number = 0
  private coinFrame: number = 0
  private titleLabel!: ex.Label
  private subtitleLabel!: ex.Label
  private coinGraphicActor!: ex.Actor

  onInitialize(engine: ex.Engine): void {
    this.backgroundColor = ex.Color.fromHex('#5bc8f5')

    // Title text
    this.titleLabel = new ex.Label({
      text: 'Superspiel',
      pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 2 - 60),
      font: new ex.Font({
        size: 48,
        family: 'monospace',
        bold: true,
        color: ex.Color.fromHex('#ffffff'),
        textAlign: ex.TextAlign.Center,
      }),
    })
    this.add(this.titleLabel)

    // Subtitle
    this.subtitleLabel = new ex.Label({
      text: 'Press SPACE or ENTER to play!',
      pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 2 + 20),
      font: new ex.Font({
        size: 18,
        family: 'monospace',
        bold: false,
        color: ex.Color.fromHex('#fde68a'),
        textAlign: ex.TextAlign.Center,
      }),
    })
    this.add(this.subtitleLabel)

    // Bouncing coin decoration
    this.coinGraphicActor = new ex.Actor({
      pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 2 - 120),
      collisionType: ex.CollisionType.PreventCollision,
      z: 5,
    })
    this.coinGraphicActor.graphics.use(drawCoin(0))
    this.coinGraphicActor.body.useGravity = false
    this.add(this.coinGraphicActor)
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    this.bgTimer += delta
    this.coinTimer += delta
    this.coinBounce += delta

    // Animate coin
    if (this.coinTimer > 150) {
      this.coinTimer = 0
      this.coinFrame = (this.coinFrame + 1) % 4
      this.coinGraphicActor.graphics.use(drawCoin(this.coinFrame % 2))
    }

    // Bounce coin
    if (this.coinGraphicActor) {
      this.coinGraphicActor.pos.y = (engine.drawHeight / 2 - 120) + Math.sin(this.coinBounce * 0.003) * 12
    }

    // Pulsing subtitle
    const pulse = 0.7 + Math.sin(this.bgTimer * 0.003) * 0.3
    this.subtitleLabel.graphics.opacity = pulse

    // Animated background color
    const hue = (this.bgTimer * 0.02) % 360
    const r = Math.floor(91 + Math.sin(hue * 0.017) * 40)
    const g = Math.floor(200 + Math.sin(hue * 0.017 + 2) * 30)
    const b = Math.floor(245 + Math.sin(hue * 0.017 + 4) * 10)
    this.backgroundColor = ex.Color.fromRGB(
      Math.min(255, Math.max(0, r)),
      Math.min(255, Math.max(0, g)),
      Math.min(255, Math.max(0, b))
    )

    // Start game
    const kb = engine.input.keyboard
    if (kb.wasPressed(ex.Keys.Space) || kb.wasPressed(ex.Keys.Enter)) {
      engine.goToScene('level1')
    }
  }
}
