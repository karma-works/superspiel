import * as ex from 'excalibur'
import { TILE_SIZE } from '../config'
import { LevelScene } from './LevelScene'
import { Coin } from '../actors/collectibles/Coin'
import { Treasure } from '../actors/collectibles/Treasure'
import { Spike } from '../actors/hazards/Spike'
import { Water } from '../actors/hazards/Water'
import { FallingRock } from '../actors/hazards/FallingRock'
import { PatrolEnemy } from '../actors/enemies/PatrolEnemy'
import { Ship } from '../actors/vehicles/Ship'
import { Checkpoint } from '../actors/Checkpoint'
import { SnowSystem } from '../actors/SnowSystem'

const GROUND = 25

export class Level3 extends LevelScene {
  levelName = 'Level 3: Winter Frost'
  nextLevelKey = 'level4'
  startTileX = 2
  startTileY = GROUND - 2
  numCoins = 20
  mapWidth = 190
  mapHeight = 30

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    this.fillGround(tileMap, GROUND, this.mapWidth, this.mapHeight, 'ice')

    this.addPlatform(tileMap, 10, 15, GROUND - 2, 'ice')
    this.addPlatform(tileMap, 22, 27, GROUND - 4, 'ice')
    this.addPlatform(tileMap, 35, 40, GROUND - 2, 'ice')
    this.addPlatform(tileMap, 50, 55, GROUND - 5, 'ice')
    this.addPlatform(tileMap, 68, 72, GROUND - 3, 'ice')
    this.addPlatform(tileMap, 115, 120, GROUND - 4, 'ice')
    this.addPlatform(tileMap, 130, 136, GROUND - 2, 'ice')
    this.addPlatform(tileMap, 148, 155, GROUND - 5, 'ice')
    this.addPlatform(tileMap, 165, 170, GROUND - 3, 'ice')
    this.addPlatform(tileMap, 180, 185, GROUND - 2, 'ice')

    // Water gap: frozen lake crack cols 80-110
    this.clearColumns(tileMap, 80, 110, GROUND, this.mapHeight)

    this.addPit(tileMap, 42, 44, GROUND, this.mapHeight)
    this.addPit(tileMap, 155, 157, GROUND, this.mapHeight)

    return tileMap
  }

  protected setupLevel(engine: ex.Engine, _tileMap: ex.TileMap): void {
    const groundY = GROUND * TILE_SIZE
    const groundActorY = (GROUND - 1) * TILE_SIZE

    // Snow atmosphere
    const snow = new SnowSystem(80, 800, 450)
    this.add(snow)

    // Water (frozen lake crack)
    this.add(new Water(
      ex.vec(95 * TILE_SIZE, groundY),
      30 * TILE_SIZE,
      5 * TILE_SIZE
    ))

    // Ship on water
    this.add(new Ship(ex.vec(95 * TILE_SIZE, groundActorY)))

    // Falling icicles
    this.add(new FallingRock(ex.vec(25 * TILE_SIZE, (GROUND - 17) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(52 * TILE_SIZE, (GROUND - 18) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(132 * TILE_SIZE, (GROUND - 15) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(165 * TILE_SIZE, (GROUND - 16) * TILE_SIZE)))

    // Spikes (icicles on ground)
    this.add(new Spike(ex.vec(45 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(72 * TILE_SIZE, groundY)))
    this.add(new Spike(ex.vec(140 * TILE_SIZE, groundY)))

    // Patrol enemies
    this.add(new PatrolEnemy(ex.vec(15 * TILE_SIZE, groundActorY), 8 * TILE_SIZE, 30 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(55 * TILE_SIZE, groundActorY), 50 * TILE_SIZE, 70 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(125 * TILE_SIZE, groundActorY), 115 * TILE_SIZE, 135 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(170 * TILE_SIZE, groundActorY), 165 * TILE_SIZE, 180 * TILE_SIZE))

    // Coins (20 total)
    const coinPositions: [number, number][] = [
      [5, GROUND - 1], [6, GROUND - 1],
      [11, GROUND - 3], [13, GROUND - 3],
      [23, GROUND - 5], [25, GROUND - 5],
      [36, GROUND - 3], [38, GROUND - 3],
      [51, GROUND - 6], [53, GROUND - 6],
      [69, GROUND - 4], [70, GROUND - 4],
      [116, GROUND - 5], [118, GROUND - 5],
      [131, GROUND - 3], [134, GROUND - 3],
      [149, GROUND - 6], [152, GROUND - 6],
      [181, GROUND - 3], [183, GROUND - 3],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    this.add(new Treasure(ex.vec(50 * TILE_SIZE, (GROUND - 17) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(150 * TILE_SIZE, (GROUND - 17) * TILE_SIZE)))

    const cpY = (GROUND - 2) * TILE_SIZE
    this.add(new Checkpoint(ex.vec(60 * TILE_SIZE, cpY)))
    this.add(new Checkpoint(ex.vec(120 * TILE_SIZE, cpY)))
    this.respawnSystem.addCheckpoint(ex.vec(60 * TILE_SIZE, cpY))
    this.respawnSystem.addCheckpoint(ex.vec(120 * TILE_SIZE, cpY))

    // Blizzard wind push
    this.on('postupdate', (_evt: unknown) => {
      if (!this.player.isOnVehicle && !this.player.isRespawning) {
        this.player.vel.x += 0.5
      }
    })

    this.addExitGate(185, GROUND - 4)

    this.backgroundColor = ex.Color.fromHex('#bfdbfe')

    void engine
  }
}
