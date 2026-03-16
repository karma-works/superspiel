import * as ex from 'excalibur'
import { TILE_SIZE } from '../config'
import { LevelScene } from './LevelScene'
import { drawSpaceTile } from '../graphics/sprites'
import { Coin } from '../actors/collectibles/Coin'
import { Treasure } from '../actors/collectibles/Treasure'
import { Spike } from '../actors/hazards/Spike'
import { Lava } from '../actors/hazards/Lava'
import { FallingRock } from '../actors/hazards/FallingRock'
import { FlyingEnemy } from '../actors/enemies/FlyingEnemy'
import { Rocket } from '../actors/vehicles/Rocket'

// Asteroid platforms: columns filled from topRow down to bottom of map
const ASTEROIDS: Array<{ c0: number; c1: number; top: number }> = [
  { c0: 0,   c1: 20,  top: 21 },  // launch pad
  { c0: 28,  c1: 42,  top: 17 },  // mid asteroid
  { c0: 56,  c1: 70,  top: 22 },  // lower rock
  { c0: 82,  c1: 98,  top: 18 },  // beacon asteroid
  { c0: 114, c1: 130, top: 14 },  // high asteroid
  { c0: 146, c1: 162, top: 20 },  // penultimate
  { c0: 175, c1: 200, top: 17 },  // final station
]

export class Level7 extends LevelScene {
  levelName = 'Level 7: Deep Space'
  bgTheme = 'space' as const
  nextLevelKey = 'level8'
  prevLevelKey = 'level6'
  startTileX = 3
  startTileY = ASTEROIDS[0].top - 2
  numCoins = 24
  mapWidth = 205
  mapHeight = 30

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    for (const { c0, c1, top } of ASTEROIDS) {
      for (let col = c0; col <= c1; col++) {
        for (let row = top; row < this.mapHeight; row++) {
          const tile = tileMap.getTile(col, row)
          if (!tile) continue
          tile.solid = true
          tile.addGraphic(drawSpaceTile(row === top))
        }
      }
    }

    // Elevated ledges on some asteroids
    this.addPlatform(tileMap, 30, 40,  ASTEROIDS[1].top - 5, 'space')
    this.addPlatform(tileMap, 116, 128, ASTEROIDS[4].top - 6, 'space')
    this.addPlatform(tileMap, 177, 190, ASTEROIDS[6].top - 4, 'space')

    return tileMap
  }

  protected setupLevel(_engine: ex.Engine, _tileMap: ex.TileMap): void {
    const a = (i: number) => ASTEROIDS[i]
    const topY   = (i: number) => a(i).top * TILE_SIZE
    const actorY = (i: number) => (a(i).top - 1) * TILE_SIZE
    const midX   = (i: number) => Math.floor((a(i).c0 + a(i).c1) / 2) * TILE_SIZE

    // ── Rocket — parked on launch pad ────────────────────────────────────────
    this.add(new Rocket(ex.vec(10 * TILE_SIZE, actorY(0))))

    // ── Solar plasma vents (lava) ─────────────────────────────────────────────
    this.add(new Lava(ex.vec(midX(1), topY(1)), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(midX(3), topY(3)), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(midX(5), topY(5)), 2 * TILE_SIZE))

    // ── Spikes on rocky edges ─────────────────────────────────────────────────
    this.add(new Spike(ex.vec(a(2).c0 * TILE_SIZE,           topY(2))))
    this.add(new Spike(ex.vec((a(2).c1 - 1) * TILE_SIZE,     topY(2))))
    this.add(new Spike(ex.vec(a(4).c0 * TILE_SIZE,           topY(4))))
    this.add(new Spike(ex.vec((a(6).c0 + 2) * TILE_SIZE,     topY(6))))

    // ── Falling asteroids ─────────────────────────────────────────────────────
    this.add(new FallingRock(ex.vec(35 * TILE_SIZE,  (a(1).top - 14) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(90 * TILE_SIZE,  (a(3).top - 16) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(120 * TILE_SIZE, (a(4).top - 14) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(180 * TILE_SIZE, (a(6).top - 15) * TILE_SIZE)))

    // ── Space creatures ───────────────────────────────────────────────────────
    this.add(new FlyingEnemy(ex.vec(46 * TILE_SIZE,  (a(1).top - 5) * TILE_SIZE), 30 * TILE_SIZE, 56 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(74 * TILE_SIZE,  (a(2).top - 7) * TILE_SIZE), 56 * TILE_SIZE, 82 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(106 * TILE_SIZE, (a(3).top - 5) * TILE_SIZE), 82 * TILE_SIZE, 114 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(138 * TILE_SIZE, (a(4).top - 6) * TILE_SIZE), 114 * TILE_SIZE, 146 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(168 * TILE_SIZE, (a(5).top - 5) * TILE_SIZE), 146 * TILE_SIZE, 175 * TILE_SIZE))

    // ── Coins (24 total) ─────────────────────────────────────────────────────
    const coinPositions: [number, number][] = [
      [4,  a(0).top - 1], [9,  a(0).top - 1], [15, a(0).top - 1],
      [31, a(1).top - 6], [34, a(1).top - 6], [37, a(1).top - 6], [40, a(1).top - 6],
      [58, a(2).top - 1], [63, a(2).top - 1], [68, a(2).top - 1],
      [84, a(3).top - 1], [89, a(3).top - 1], [94, a(3).top - 1],
      [117, a(4).top - 7], [120, a(4).top - 7], [124, a(4).top - 7], [127, a(4).top - 7],
      [148, a(5).top - 1], [154, a(5).top - 1], [160, a(5).top - 1],
      [178, a(6).top - 5], [183, a(6).top - 5], [188, a(6).top - 5], [193, a(6).top - 5],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // ── Treasures ─────────────────────────────────────────────────────────────
    this.add(new Treasure(ex.vec(midX(2), (a(2).top - 4) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(midX(4), (a(4).top - 8) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(190 * TILE_SIZE, (a(6).top - 6) * TILE_SIZE)))

    // ── Checkpoints ───────────────────────────────────────────────────────────
    this.addCheckpointAt(Math.floor((a(1).c0 + a(1).c1) / 2), a(1).top - 2)
    this.addCheckpointAt(Math.floor((a(3).c0 + a(3).c1) / 2), a(3).top - 2)
    this.addCheckpointAt(Math.floor((a(5).c0 + a(5).c1) / 2), a(5).top - 2)

    // ── Exit Gate ─────────────────────────────────────────────────────────────
    this.addExitGate(193, a(6).top - 5)
  }
}
