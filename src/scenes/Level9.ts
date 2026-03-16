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
import { Bus } from '../actors/vehicles/Bus'

const GROUND = 25

export class Level9 extends LevelScene {
  levelName = 'Level 9: Downtown Drive'
  bgTheme = 'city' as const
  nextLevelKey = 'mainmenu'
  prevLevelKey = 'level8'
  startTileX = 2
  startTileY = GROUND - 2
  numCoins = 24
  mapWidth = 210
  mapHeight = 30

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    // Road surface
    this.fillGround(tileMap, GROUND, this.mapWidth, this.mapHeight, 'road')

    // Elevated platforms (rooftops / highway overpasses)
    this.addPlatform(tileMap, 10,  18,  GROUND - 4, 'road')
    this.addPlatform(tileMap, 26,  36,  GROUND - 6, 'road')
    this.addPlatform(tileMap, 50,  58,  GROUND - 3, 'road')
    this.addPlatform(tileMap, 70,  80,  GROUND - 5, 'road')
    this.addPlatform(tileMap, 96,  106, GROUND - 4, 'road')
    this.addPlatform(tileMap, 118, 128, GROUND - 2, 'road')
    this.addPlatform(tileMap, 142, 152, GROUND - 6, 'road')
    this.addPlatform(tileMap, 165, 175, GROUND - 3, 'road')
    this.addPlatform(tileMap, 185, 195, GROUND - 4, 'road')
    this.addPlatform(tileMap, 200, 208, GROUND - 2, 'road')

    // Pits (underpasses / construction gaps)
    this.addPit(tileMap, 38,  42,  GROUND, this.mapHeight)
    this.addPit(tileMap, 82,  86,  GROUND, this.mapHeight)
    this.addPit(tileMap, 128, 132, GROUND, this.mapHeight)
    this.addPit(tileMap, 175, 180, GROUND, this.mapHeight)

    return tileMap
  }

  protected setupLevel(_engine: ex.Engine, _tileMap: ex.TileMap): void {
    const groundY    = GROUND * TILE_SIZE
    const groundActY = (GROUND - 1) * TILE_SIZE

    // ── Bus — parked at the start ─────────────────────────────────────────────
    this.add(new Bus(ex.vec(8 * TILE_SIZE, groundActY)))

    // ── Construction hazards ──────────────────────────────────────────────────
    this.add(new Lava(ex.vec(39 * TILE_SIZE,  groundY), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(83 * TILE_SIZE,  groundY), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(130 * TILE_SIZE, groundY), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(177 * TILE_SIZE, groundY), 2 * TILE_SIZE))

    this.add(new Spike(ex.vec(50 * TILE_SIZE,  groundY)))
    this.add(new Spike(ex.vec(58 * TILE_SIZE,  groundY)))
    this.add(new Spike(ex.vec(118 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(128 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(185 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(195 * TILE_SIZE, groundY)))

    // ── Falling debris ────────────────────────────────────────────────────────
    this.add(new FallingRock(ex.vec(30 * TILE_SIZE,  (GROUND - 15) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(75 * TILE_SIZE,  (GROUND - 14) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(120 * TILE_SIZE, (GROUND - 16) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(165 * TILE_SIZE, (GROUND - 13) * TILE_SIZE)))

    // ── Street gangs (patrol enemies) ─────────────────────────────────────────
    this.add(new PatrolEnemy(ex.vec(28 * TILE_SIZE,  (GROUND - 7) * TILE_SIZE), 26 * TILE_SIZE,  36 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(73 * TILE_SIZE,  (GROUND - 6) * TILE_SIZE), 70 * TILE_SIZE,  80 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(98 * TILE_SIZE,  (GROUND - 5) * TILE_SIZE), 96 * TILE_SIZE,  106 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(144 * TILE_SIZE, (GROUND - 7) * TILE_SIZE), 142 * TILE_SIZE, 152 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(190 * TILE_SIZE, (GROUND - 5) * TILE_SIZE), 185 * TILE_SIZE, 195 * TILE_SIZE))

    // ── Drones (flying enemies) ────────────────────────────────────────────────
    this.add(new FlyingEnemy(ex.vec(43 * TILE_SIZE,  (GROUND - 6) * TILE_SIZE), 38 * TILE_SIZE,  50 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(88 * TILE_SIZE,  (GROUND - 7) * TILE_SIZE), 82 * TILE_SIZE,  96 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(134 * TILE_SIZE, (GROUND - 5) * TILE_SIZE), 128 * TILE_SIZE, 142 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(182 * TILE_SIZE, (GROUND - 6) * TILE_SIZE), 175 * TILE_SIZE, 185 * TILE_SIZE))

    // ── Coins (24 total) ──────────────────────────────────────────────────────
    const coinPositions: [number, number][] = [
      [4,   GROUND - 1], [6,   GROUND - 1],
      [11,  GROUND - 5], [14,  GROUND - 5], [17,  GROUND - 5],
      [27,  GROUND - 7], [30,  GROUND - 7], [33,  GROUND - 7], [36,  GROUND - 7],
      [52,  GROUND - 4], [55,  GROUND - 4], [58,  GROUND - 4],
      [72,  GROUND - 6], [75,  GROUND - 6], [78,  GROUND - 6],
      [97,  GROUND - 5], [100, GROUND - 5], [105, GROUND - 5],
      [143, GROUND - 7], [146, GROUND - 7], [150, GROUND - 7],
      [186, GROUND - 5], [190, GROUND - 5], [194, GROUND - 5],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // ── Treasures ─────────────────────────────────────────────────────────────
    this.add(new Treasure(ex.vec(32 * TILE_SIZE,  (GROUND - 9) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(100 * TILE_SIZE, (GROUND - 7) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(190 * TILE_SIZE, (GROUND - 7) * TILE_SIZE)))

    // ── Checkpoints ───────────────────────────────────────────────────────────
    this.addCheckpointAt(70,  GROUND - 3)
    this.addCheckpointAt(130, GROUND - 3)
    this.addCheckpointAt(175, GROUND - 3)

    // ── Exit Gate ─────────────────────────────────────────────────────────────
    this.addExitGate(205, GROUND - 4)
  }
}
