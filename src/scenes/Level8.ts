import * as ex from 'excalibur'
import { TILE_SIZE } from '../config'
import { LevelScene } from './LevelScene'
import { Coin } from '../actors/collectibles/Coin'
import { Treasure } from '../actors/collectibles/Treasure'
import { Spike } from '../actors/hazards/Spike'
import { Lava } from '../actors/hazards/Lava'
import { FallingRock } from '../actors/hazards/FallingRock'
import { PatrolEnemy } from '../actors/enemies/PatrolEnemy'
import { FlyingEnemy } from '../actors/enemies/FlyingEnemy'

const GROUND = 24

export class Level8 extends LevelScene {
  levelName = 'Level 8: Blossom Garden'
  bgTheme = 'meadow' as const
  nextLevelKey = 'level9'
  prevLevelKey = 'level7'
  startTileX = 2
  startTileY = GROUND - 2
  numCoins = 22
  mapWidth = 190
  mapHeight = 30

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    // Flower ground
    this.fillGround(tileMap, GROUND, this.mapWidth, this.mapHeight, 'flower')

    // Raised flower beds / platforms
    this.addPlatform(tileMap, 8,   14,  GROUND - 3, 'flower')
    this.addPlatform(tileMap, 22,  28,  GROUND - 5, 'flower')
    this.addPlatform(tileMap, 38,  44,  GROUND - 2, 'flower')
    this.addPlatform(tileMap, 55,  62,  GROUND - 6, 'flower')
    this.addPlatform(tileMap, 75,  82,  GROUND - 3, 'flower')
    this.addPlatform(tileMap, 95,  102, GROUND - 5, 'flower')
    this.addPlatform(tileMap, 112, 118, GROUND - 4, 'flower')
    this.addPlatform(tileMap, 130, 138, GROUND - 2, 'flower')
    this.addPlatform(tileMap, 148, 155, GROUND - 6, 'flower')
    this.addPlatform(tileMap, 168, 175, GROUND - 3, 'flower')
    this.addPlatform(tileMap, 182, 188, GROUND - 2, 'flower')

    // Pits (garden ponds)
    this.addPit(tileMap, 45,  50,  GROUND, this.mapHeight)
    this.addPit(tileMap, 106, 110, GROUND, this.mapHeight)
    this.addPit(tileMap, 158, 163, GROUND, this.mapHeight)

    return tileMap
  }

  protected setupLevel(_engine: ex.Engine, _tileMap: ex.TileMap): void {
    const groundY    = GROUND * TILE_SIZE
    const groundActY = (GROUND - 1) * TILE_SIZE

    // ── Lava ponds (garden hazards) ───────────────────────────────────────────
    this.add(new Lava(ex.vec(47 * TILE_SIZE,  groundY), 3 * TILE_SIZE))
    this.add(new Lava(ex.vec(108 * TILE_SIZE, groundY), 3 * TILE_SIZE))
    this.add(new Lava(ex.vec(160 * TILE_SIZE, groundY), 3 * TILE_SIZE))

    // ── Thorny spikes ─────────────────────────────────────────────────────────
    this.add(new Spike(ex.vec(38 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(44 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(75 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(82 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(130 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(138 * TILE_SIZE, groundY)))

    // ── Falling seed pods ─────────────────────────────────────────────────────
    this.add(new FallingRock(ex.vec(25 * TILE_SIZE, (GROUND - 14) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(60 * TILE_SIZE, (GROUND - 16) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(100 * TILE_SIZE, (GROUND - 13) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(150 * TILE_SIZE, (GROUND - 15) * TILE_SIZE)))

    // ── Garden critters (patrol) ──────────────────────────────────────────────
    this.add(new PatrolEnemy(ex.vec(11 * TILE_SIZE,  groundActY), 8 * TILE_SIZE,  14 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(40 * TILE_SIZE,  groundActY), 38 * TILE_SIZE, 44 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(78 * TILE_SIZE,  groundActY), 75 * TILE_SIZE, 82 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(133 * TILE_SIZE, groundActY), 130 * TILE_SIZE, 138 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(170 * TILE_SIZE, groundActY), 168 * TILE_SIZE, 175 * TILE_SIZE))

    // ── Butterflies (flying enemies) ──────────────────────────────────────────
    this.add(new FlyingEnemy(ex.vec(33 * TILE_SIZE,  (GROUND - 6) * TILE_SIZE), 22 * TILE_SIZE, 44 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(68 * TILE_SIZE,  (GROUND - 7) * TILE_SIZE), 55 * TILE_SIZE, 75 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(118 * TILE_SIZE, (GROUND - 5) * TILE_SIZE), 112 * TILE_SIZE, 130 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(160 * TILE_SIZE, (GROUND - 6) * TILE_SIZE), 148 * TILE_SIZE, 168 * TILE_SIZE))

    // ── Coins (22 total) ─────────────────────────────────────────────────────
    const coinPositions: [number, number][] = [
      // Ground level trail
      [5,   GROUND - 1], [6,   GROUND - 1],
      // Platforms
      [9,   GROUND - 4], [11,  GROUND - 4], [13,  GROUND - 4],
      [23,  GROUND - 6], [25,  GROUND - 6], [27,  GROUND - 6],
      [56,  GROUND - 7], [58,  GROUND - 7], [60,  GROUND - 7], [62,  GROUND - 7],
      [76,  GROUND - 4], [79,  GROUND - 4], [82,  GROUND - 4],
      [96,  GROUND - 6], [99,  GROUND - 6], [102, GROUND - 6],
      [149, GROUND - 7], [152, GROUND - 7], [155, GROUND - 7],
      // Bonus: floating above final platform
      [185, GROUND - 6],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // ── Treasures ─────────────────────────────────────────────────────────────
    this.add(new Treasure(ex.vec(25 * TILE_SIZE,  (GROUND - 8) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(98 * TILE_SIZE,  (GROUND - 8) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(170 * TILE_SIZE, (GROUND - 6) * TILE_SIZE)))

    // ── Checkpoints ───────────────────────────────────────────────────────────
    this.addCheckpointAt(60,  GROUND - 3)
    this.addCheckpointAt(115, GROUND - 3)
    this.addCheckpointAt(160, GROUND - 3)

    // ── Exit Gate ─────────────────────────────────────────────────────────────
    this.addExitGate(185, GROUND - 4)
  }
}
