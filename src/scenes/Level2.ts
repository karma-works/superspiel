import * as ex from 'excalibur'
import { TILE_SIZE } from '../config'
import { LevelScene } from './LevelScene'
import { Coin } from '../actors/collectibles/Coin'
import { Treasure } from '../actors/collectibles/Treasure'
import { Spike } from '../actors/hazards/Spike'
import { PatrolEnemy } from '../actors/enemies/PatrolEnemy'
import { RangedEnemy } from '../actors/enemies/RangedEnemy'
import { Checkpoint } from '../actors/Checkpoint'
import { drawGroundTile } from '../graphics/sprites'

const GROUND = 25

export class Level2 extends LevelScene {
  levelName = 'Level 2: Easter Meadow'
  nextLevelKey = 'level3'
  startTileX = 2
  startTileY = GROUND - 2
  numCoins = 18
  mapWidth = 180
  mapHeight = 30

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    this.fillGround(tileMap, GROUND, this.mapWidth, this.mapHeight, 'ground')

    this.addPlatform(tileMap, 8, 12, GROUND - 2)
    this.addPlatform(tileMap, 18, 22, GROUND - 4)
    this.addPlatform(tileMap, 28, 32, GROUND - 2)
    this.addPlatform(tileMap, 40, 46, GROUND - 5)
    this.addPlatform(tileMap, 55, 60, GROUND - 3)
    this.addPlatform(tileMap, 70, 75, GROUND - 4)
    this.addPlatform(tileMap, 85, 90, GROUND - 6)
    this.addPlatform(tileMap, 100, 106, GROUND - 3)
    this.addPlatform(tileMap, 115, 120, GROUND - 4)
    this.addPlatform(tileMap, 130, 135, GROUND - 2)
    this.addPlatform(tileMap, 145, 152, GROUND - 5)
    this.addPlatform(tileMap, 162, 167, GROUND - 3)

    // Underground tunnel ceiling at GROUND+1
    for (let col = 50; col < 90; col++) {
      const tile = tileMap.getTile(col, GROUND + 1)
      if (tile) { tile.solid = true; tile.addGraphic(drawGroundTile(1)) }
    }

    // Pits
    this.addPit(tileMap, 33, 36, GROUND, this.mapHeight)
    this.addPit(tileMap, 108, 111, GROUND, this.mapHeight)
    this.addPit(tileMap, 155, 158, GROUND, this.mapHeight)

    return tileMap
  }

  protected setupLevel(_engine: ex.Engine, _tileMap: ex.TileMap): void {
    const groundY = GROUND * TILE_SIZE
    const groundActorY = (GROUND - 1) * TILE_SIZE

    // Spikes (thorns)
    this.add(new Spike(ex.vec(29 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(30 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(86 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(87 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(130 * TILE_SIZE, groundY)))

    // Patrol enemies (rabbits)
    this.add(new PatrolEnemy(ex.vec(20 * TILE_SIZE, groundActorY), 15 * TILE_SIZE, 28 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(70 * TILE_SIZE, groundActorY), 65 * TILE_SIZE, 80 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(140 * TILE_SIZE, groundActorY), 135 * TILE_SIZE, 150 * TILE_SIZE))

    // Ranged enemies (egg-throwers)
    this.add(new RangedEnemy(ex.vec(55 * TILE_SIZE, (GROUND - 4) * TILE_SIZE)))
    this.add(new RangedEnemy(ex.vec(115 * TILE_SIZE, (GROUND - 5) * TILE_SIZE)))

    // Coins (18 total)
    const coinPositions: [number, number][] = [
      [5, GROUND - 1], [9, GROUND - 3], [10, GROUND - 3],
      [19, GROUND - 5], [20, GROUND - 5], [21, GROUND - 5],
      [41, GROUND - 6], [42, GROUND - 6],
      [56, GROUND - 4], [57, GROUND - 4],
      [72, GROUND - 5], [73, GROUND - 5],
      [86, GROUND - 7], [87, GROUND - 7],
      [101, GROUND - 4], [102, GROUND - 4],
      [146, GROUND - 6], [147, GROUND - 6],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // Treasures (Easter eggs)
    this.add(new Treasure(ex.vec(87 * TILE_SIZE, (GROUND - 8) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(148 * TILE_SIZE, (GROUND - 7) * TILE_SIZE)))

    // Checkpoints
    const cpY = (GROUND - 2) * TILE_SIZE
    this.add(new Checkpoint(ex.vec(50 * TILE_SIZE, cpY)))
    this.add(new Checkpoint(ex.vec(110 * TILE_SIZE, cpY)))
    this.respawnSystem.addCheckpoint(ex.vec(50 * TILE_SIZE, cpY))
    this.respawnSystem.addCheckpoint(ex.vec(110 * TILE_SIZE, cpY))

    this.addExitGate(174, GROUND - 4)

    this.backgroundColor = ex.Color.fromHex('#86efac')
  }
}
