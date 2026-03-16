import * as ex from 'excalibur'
import { TILE_SIZE } from '../config'
import { LevelScene } from './LevelScene'
import { drawGroundTile, drawPlatformTile } from '../graphics/sprites'
import { Coin } from '../actors/collectibles/Coin'
import { Spike } from '../actors/hazards/Spike'
import { PatrolEnemy } from '../actors/enemies/PatrolEnemy'
import { FlyingEnemy } from '../actors/enemies/FlyingEnemy'
import { BossMonster } from '../actors/Boss'
import { Princess } from '../actors/Princess'
import { VictoryOverlay } from '../ui/VictoryOverlay'

// Castle floor sits here
const GROUND = 22

export class Level10 extends LevelScene {
  levelName = 'Level 10: Nebbio\'s Keep'
  bgTheme = 'sunset' as const
  nextLevelKey = 'mainmenu'
  prevLevelKey = 'level9'
  startTileX = 2
  startTileY = GROUND - 2
  numCoins = 16
  mapWidth = 130
  mapHeight = 26

  private boss: BossMonster | null = null
  private princess: Princess | null = null
  private _victoryTriggered: boolean = false

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    // ── Castle floor ──────────────────────────────────────────────────────────
    this.fillGround(tileMap, GROUND, this.mapWidth, this.mapHeight, 'ground')

    // ── Outer castle roof (row 3, cols 18–128) ────────────────────────────────
    for (let col = 18; col <= 128; col++) {
      const tile = tileMap.getTile(col, 3)
      if (tile) { tile.solid = true; tile.addGraphic(drawGroundTile(0)) }
      const tile2 = tileMap.getTile(col, 2)
      if (tile2) { tile2.solid = true; tile2.addGraphic(drawGroundTile(1)) }
    }

    // ── Left castle wall (cols 18–20, rows 3–22) ─────────────────────────────
    // Entrance gap at rows 18-22 (player enters from left)
    for (let row = 3; row < 18; row++) {
      for (let col = 18; col <= 20; col++) {
        const tile = tileMap.getTile(col, row)
        if (tile) { tile.solid = true; tile.addGraphic(drawGroundTile(1)) }
      }
    }

    // ── Right castle wall (cols 126–128, rows 3–22) ───────────────────────────
    for (let row = 3; row <= GROUND; row++) {
      for (let col = 126; col <= 128; col++) {
        const tile = tileMap.getTile(col, row)
        if (tile) { tile.solid = true; tile.addGraphic(drawGroundTile(1)) }
      }
    }

    // ── Interior dividing wall (cols 62–64, rows 3–15) ───────────────────────
    // Gap at rows 16–22 so player can pass through
    for (let row = 3; row <= 15; row++) {
      for (let col = 62; col <= 64; col++) {
        const tile = tileMap.getTile(col, row)
        if (tile) { tile.solid = true; tile.addGraphic(drawGroundTile(1)) }
      }
    }

    // ── Room 1 platforms (entry hall, cols 21–62) ─────────────────────────────
    this.addPlatform(tileMap, 24, 36, GROUND - 5, 'platform')
    this.addPlatform(tileMap, 44, 56, GROUND - 9, 'platform')
    this.addPlatform(tileMap, 25, 35, GROUND - 13, 'platform')

    // ── Elevated passage above dividing wall ──────────────────────────────────
    this.addPlatform(tileMap, 58, 68, GROUND - 12, 'platform')

    // ── Boss chamber (cols 65–125) ────────────────────────────────────────────
    // Two high platforms the player can use to stomp boss
    this.addPlatform(tileMap, 70, 82, GROUND - 7)
    this.addPlatform(tileMap, 100, 112, GROUND - 7)

    // Low ledge near the back wall for the princess to stand on
    this.addPlatform(tileMap, 116, 124, GROUND - 3, 'platform')

    return tileMap
  }

  protected setupLevel(engine: ex.Engine, _tileMap: ex.TileMap): void {
    const groundY    = GROUND * TILE_SIZE
    const groundActY = (GROUND - 1) * TILE_SIZE

    // ── Castle guard enemies (entry hall) ─────────────────────────────────────
    this.add(new PatrolEnemy(
      ex.vec(28 * TILE_SIZE, (GROUND - 6) * TILE_SIZE),
      24 * TILE_SIZE, 36 * TILE_SIZE,
    ))
    this.add(new PatrolEnemy(
      ex.vec(50 * TILE_SIZE, (GROUND - 10) * TILE_SIZE),
      44 * TILE_SIZE, 56 * TILE_SIZE,
    ))
    this.add(new FlyingEnemy(
      ex.vec(40 * TILE_SIZE, (GROUND - 8) * TILE_SIZE),
      21 * TILE_SIZE, 62 * TILE_SIZE,
    ))

    // ── Spikes on the floor of entry hall ─────────────────────────────────────
    this.add(new Spike(ex.vec(32 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(50 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(58 * TILE_SIZE, groundY)))

    // ── Boss chamber guard ─────────────────────────────────────────────────────
    this.add(new FlyingEnemy(
      ex.vec(80 * TILE_SIZE, (GROUND - 10) * TILE_SIZE),
      65 * TILE_SIZE, 100 * TILE_SIZE,
    ))

    // ── The Boss: Nebbio ──────────────────────────────────────────────────────
    this.boss = new BossMonster(
      ex.vec(92 * TILE_SIZE, groundActY),
      66 * TILE_SIZE,
      122 * TILE_SIZE,
    )
    this.add(this.boss)

    // ── Princess (hidden behind ledge until boss defeated) ────────────────────
    this.princess = new Princess(ex.vec(120 * TILE_SIZE, (GROUND - 4) * TILE_SIZE))
    this.princess.graphics.opacity = 0
    this.add(this.princess)

    // ── Coins (16 total) scattered through the level ──────────────────────────
    const coinPositions: [number, number][] = [
      // Entry approach
      [5,   GROUND - 1], [8,   GROUND - 1], [12,  GROUND - 1], [15,  GROUND - 1],
      // Room 1 platforms
      [26,  GROUND - 6], [29,  GROUND - 6], [33,  GROUND - 6],
      [46,  GROUND - 10], [50, GROUND - 10], [54, GROUND - 10],
      [26,  GROUND - 14], [31, GROUND - 14], [34, GROUND - 14],
      // Boss chamber
      [72,  GROUND - 8], [82,  GROUND - 8],
      [101, GROUND - 8],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // ── Checkpoints ───────────────────────────────────────────────────────────
    this.addCheckpointAt(30, GROUND - 2)
    this.addCheckpointAt(65, GROUND - 2)

    // ── Listen for boss defeat ────────────────────────────────────────────────
    this.on('boss:defeated', (evt: unknown) => {
      const e = evt as { score: number }
      this.player.addScore(e.score)
      this.triggerVictory(engine)
    })
  }

  private triggerVictory(engine: ex.Engine): void {
    if (this._victoryTriggered) return
    this._victoryTriggered = true

    // Reveal the princess
    if (this.princess) {
      this.princess.actions.fade(1, 800)
    }

    // Show victory overlay after short delay
    engine.clock.schedule(() => {
      const overlay = new VictoryOverlay(this.player, () => {
        engine.goToScene('mainmenu')
      })
      this.add(overlay)
    }, 1200)
  }

  // Override: no exit gate in this level — boss defeat is the win condition
  onPreUpdate(engine: ex.Engine, delta: number): void {
    super.onPreUpdate(engine, delta)

    // Show boss health bar in HUD area (drawn via scene, not HUD)
    // (handled in onPostDraw below)
  }
}
