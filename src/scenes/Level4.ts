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
import { Car } from '../actors/vehicles/Car'
import { Checkpoint } from '../actors/Checkpoint'

const GROUND = 25

export class Level4 extends LevelScene {
  levelName = 'Level 4: City Roads'
  bgTheme = 'city' as const
  nextLevelKey = 'level5'
  startTileX = 2
  startTileY = GROUND - 2
  numCoins = 22
  mapWidth = 210
  mapHeight = 30

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    this.fillGround(tileMap, GROUND, this.mapWidth, this.mapHeight, 'road')

    this.addPlatform(tileMap, 10, 18, GROUND - 2, 'road')
    this.addPlatform(tileMap, 25, 30, GROUND - 4, 'road')
    this.addPlatform(tileMap, 40, 48, GROUND - 2, 'road')
    this.addPlatform(tileMap, 60, 68, GROUND - 5, 'road')
    this.addPlatform(tileMap, 80, 90, GROUND - 3, 'road')
    this.addPlatform(tileMap, 100, 110, GROUND - 4, 'road')
    this.addPlatform(tileMap, 125, 132, GROUND - 6, 'road')
    this.addPlatform(tileMap, 145, 152, GROUND - 3, 'road')
    this.addPlatform(tileMap, 165, 172, GROUND - 5, 'road')
    this.addPlatform(tileMap, 185, 195, GROUND - 2, 'road')

    // Manholes (open pits)
    this.addPit(tileMap, 45, 55, GROUND, this.mapHeight)
    this.addPit(tileMap, 120, 130, GROUND, this.mapHeight)

    // Regular pits
    this.addPit(tileMap, 33, 36, GROUND, this.mapHeight)
    this.addPit(tileMap, 95, 97, GROUND, this.mapHeight)
    this.addPit(tileMap, 155, 158, GROUND, this.mapHeight)

    return tileMap
  }

  protected setupLevel(_engine: ex.Engine, _tileMap: ex.TileMap): void {
    const groundY = GROUND * TILE_SIZE
    const groundActorY = (GROUND - 1) * TILE_SIZE

    // Car on road section
    this.add(new Car(ex.vec(15 * TILE_SIZE, groundActorY - 10)))

    // Lava from broken pipes
    this.add(new Lava(ex.vec(72 * TILE_SIZE, groundY), 3 * TILE_SIZE))
    this.add(new Lava(ex.vec(138 * TILE_SIZE, groundY), 3 * TILE_SIZE))
    this.add(new Lava(ex.vec(175 * TILE_SIZE, groundY), 2 * TILE_SIZE))

    // Spikes (fence spikes)
    this.add(new Spike(ex.vec(30 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(31 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(108 * TILE_SIZE, (GROUND - 4) * TILE_SIZE)))
    this.add(new Spike(ex.vec(109 * TILE_SIZE, (GROUND - 4) * TILE_SIZE)))

    // Falling girders
    this.add(new FallingRock(ex.vec(62 * TILE_SIZE, (GROUND - 18) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(102 * TILE_SIZE, (GROUND - 17) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(168 * TILE_SIZE, (GROUND - 18) * TILE_SIZE)))

    // Construction worker patrols
    this.add(new PatrolEnemy(ex.vec(25 * TILE_SIZE, groundActorY), 18 * TILE_SIZE, 32 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(80 * TILE_SIZE, (GROUND - 3) * TILE_SIZE), 80 * TILE_SIZE, 90 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(185 * TILE_SIZE, (GROUND - 2) * TILE_SIZE), 185 * TILE_SIZE, 195 * TILE_SIZE))

    // Flying security drones
    this.add(new FlyingEnemy(ex.vec(60 * TILE_SIZE, (GROUND - 17) * TILE_SIZE), 55 * TILE_SIZE, 75 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(130 * TILE_SIZE, (GROUND - 18) * TILE_SIZE), 125 * TILE_SIZE, 145 * TILE_SIZE))

    // Coins (22 total)
    const coinPositions: [number, number][] = [
      [5, GROUND - 1], [7, GROUND - 1],
      [11, GROUND - 3], [14, GROUND - 3], [16, GROUND - 3],
      [26, GROUND - 5], [28, GROUND - 5],
      [41, GROUND - 3], [44, GROUND - 3], [46, GROUND - 3],
      [61, GROUND - 6], [64, GROUND - 6], [66, GROUND - 6],
      [82, GROUND - 4], [85, GROUND - 4], [88, GROUND - 4],
      [102, GROUND - 5], [106, GROUND - 5],
      [126, GROUND - 7], [129, GROUND - 7],
      [146, GROUND - 4], [150, GROUND - 4],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // Treasures (rooftop safes)
    this.add(new Treasure(ex.vec(66 * TILE_SIZE, (GROUND - 7) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(128 * TILE_SIZE, (GROUND - 8) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(192 * TILE_SIZE, (GROUND - 3) * TILE_SIZE)))

    const cpY = (GROUND - 2) * TILE_SIZE
    this.add(new Checkpoint(ex.vec(70 * TILE_SIZE, cpY)))
    this.add(new Checkpoint(ex.vec(140 * TILE_SIZE, cpY)))
    this.respawnSystem.addCheckpoint(ex.vec(70 * TILE_SIZE, cpY))
    this.respawnSystem.addCheckpoint(ex.vec(140 * TILE_SIZE, cpY))

    this.addExitGate(205, GROUND - 4)

  }
}
