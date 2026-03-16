import * as ex from 'excalibur'
import { TILE_SIZE } from '../config'
import { LevelScene } from './LevelScene'
import { drawGroundTile } from '../graphics/sprites'
import { Coin } from '../actors/collectibles/Coin'
import { Treasure } from '../actors/collectibles/Treasure'
import { Spike } from '../actors/hazards/Spike'
import { Lava } from '../actors/hazards/Lava'
import { FallingRock } from '../actors/hazards/FallingRock'
import { PatrolEnemy } from '../actors/enemies/PatrolEnemy'
import { Ship } from '../actors/vehicles/Ship'
import { Checkpoint } from '../actors/Checkpoint'
import { CloudPlatform } from '../actors/CloudPlatform'

const GROUND = 25

export class Level5 extends LevelScene {
  levelName = 'Level 5: Sky Islands'
  bgTheme = 'sky' as const
  nextLevelKey = 'level6'
  prevLevelKey = 'level4'
  startTileX = 2
  startTileY = GROUND - 2
  numCoins = 25
  mapWidth = 220
  mapHeight = 30

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    const fillIsland = (colStart: number, colEnd: number) => {
      for (let col = colStart; col <= colEnd; col++) {
        for (let row = GROUND; row < this.mapHeight; row++) {
          const tile = tileMap.getTile(col, row)
          if (tile) {
            tile.solid = true
            tile.addGraphic(row === GROUND ? drawGroundTile(0) : drawGroundTile(1))
          }
        }
      }
    }

    fillIsland(0, 20)
    this.addPlatform(tileMap, 5, 18, GROUND - 3, 'ground')

    fillIsland(28, 45)
    this.addPlatform(tileMap, 30, 43, GROUND - 3, 'ground')

    fillIsland(55, 75)
    this.addPlatform(tileMap, 57, 73, GROUND - 5, 'ground')

    fillIsland(85, 95)

    fillIsland(145, 160)
    this.addPlatform(tileMap, 147, 158, GROUND - 3, 'ground')

    fillIsland(170, 205)
    this.addPlatform(tileMap, 172, 200, GROUND - 2, 'ground')
    this.addPlatform(tileMap, 180, 195, GROUND - 5, 'ground')

    return tileMap
  }

  protected setupLevel(_engine: ex.Engine, _tileMap: ex.TileMap): void {
    const gRow = GROUND
    const gY = gRow * TILE_SIZE
    const actorY = (gRow - 1) * TILE_SIZE

    // Cloud platforms (disappear when stepped on)
    this.add(new CloudPlatform(ex.vec(22 * TILE_SIZE, (GROUND - 3) * TILE_SIZE), 48))
    this.add(new CloudPlatform(ex.vec(52 * TILE_SIZE, (GROUND - 4) * TILE_SIZE), 32))
    this.add(new CloudPlatform(ex.vec(78 * TILE_SIZE, (GROUND - 3) * TILE_SIZE), 48))
    this.add(new CloudPlatform(ex.vec(97 * TILE_SIZE, (GROUND - 5) * TILE_SIZE), 32))
    this.add(new CloudPlatform(ex.vec(115 * TILE_SIZE, (GROUND - 3) * TILE_SIZE), 48))
    this.add(new CloudPlatform(ex.vec(162 * TILE_SIZE, (GROUND - 4) * TILE_SIZE), 48))

    // Airship over the gap (cols 100-140)
    this.add(new Ship(ex.vec(120 * TILE_SIZE, actorY)))

    // Lava geysers
    this.add(new Lava(ex.vec(35 * TILE_SIZE, gY), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(62 * TILE_SIZE, (GROUND - 5) * TILE_SIZE), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(150 * TILE_SIZE, gY), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(185 * TILE_SIZE, (GROUND - 5) * TILE_SIZE), 2 * TILE_SIZE))

    // Spikes on ruins
    this.add(new Spike(ex.vec(90 * TILE_SIZE, gY)))
    this.add(new Spike(ex.vec(91 * TILE_SIZE, gY)))
    this.add(new Spike(ex.vec(155 * TILE_SIZE, gY)))
    this.add(new Spike(ex.vec(173 * TILE_SIZE, (GROUND - 2) * TILE_SIZE)))

    // Falling rocks (crumbling pillars)
    this.add(new FallingRock(ex.vec(30 * TILE_SIZE, (GROUND - 16) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(58 * TILE_SIZE, (GROUND - 18) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(148 * TILE_SIZE, (GROUND - 16) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(190 * TILE_SIZE, (GROUND - 20) * TILE_SIZE)))

    // Stone guardians (extra health)
    const g1 = new PatrolEnemy(ex.vec(60 * TILE_SIZE, actorY), 56 * TILE_SIZE, 74 * TILE_SIZE)
    ;(g1 as any).health = 4
    this.add(g1)

    const g2 = new PatrolEnemy(ex.vec(180 * TILE_SIZE, actorY), 172 * TILE_SIZE, 200 * TILE_SIZE)
    ;(g2 as any).health = 4
    this.add(g2)

    this.add(new PatrolEnemy(ex.vec(32 * TILE_SIZE, actorY), 28 * TILE_SIZE, 44 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(148 * TILE_SIZE, actorY), 146 * TILE_SIZE, 160 * TILE_SIZE))

    // Coins (25 total)
    const coinPositions: [number, number][] = [
      [5, GROUND - 1], [8, GROUND - 1], [12, GROUND - 4], [15, GROUND - 4],
      [29, GROUND - 1], [32, GROUND - 4], [35, GROUND - 4], [40, GROUND - 1],
      [57, GROUND - 1], [60, GROUND - 6], [63, GROUND - 6], [67, GROUND - 1],
      [86, GROUND - 1], [88, GROUND - 1],
      [116, GROUND - 4], [118, GROUND - 4], [120, GROUND - 4],
      [147, GROUND - 4], [150, GROUND - 4], [155, GROUND - 1],
      [173, GROUND - 3], [177, GROUND - 3], [181, GROUND - 6], [185, GROUND - 6], [192, GROUND - 6],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // Treasures
    this.add(new Treasure(ex.vec(43 * TILE_SIZE, (GROUND - 4) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(93 * TILE_SIZE, (GROUND - 4) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(192 * TILE_SIZE, (GROUND - 7) * TILE_SIZE))) // grand final

    const cpY = (GROUND - 2) * TILE_SIZE
    this.add(new Checkpoint(ex.vec(50 * TILE_SIZE, cpY)))
    this.add(new Checkpoint(ex.vec(100 * TILE_SIZE, cpY)))
    this.add(new Checkpoint(ex.vec(160 * TILE_SIZE, cpY)))
    this.respawnSystem.addCheckpoint(ex.vec(50 * TILE_SIZE, cpY))
    this.respawnSystem.addCheckpoint(ex.vec(100 * TILE_SIZE, cpY))
    this.respawnSystem.addCheckpoint(ex.vec(160 * TILE_SIZE, cpY))

    this.addExitGate(208, GROUND - 4)

  }
}
