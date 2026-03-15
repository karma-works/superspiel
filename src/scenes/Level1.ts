import * as ex from 'excalibur'
import { TILE_SIZE } from '../config'
import { LevelScene } from './LevelScene'
import { Coin } from '../actors/collectibles/Coin'
import { Treasure } from '../actors/collectibles/Treasure'
import { Spike } from '../actors/hazards/Spike'
import { Lava } from '../actors/hazards/Lava'
import { Water } from '../actors/hazards/Water'
import { FallingRock } from '../actors/hazards/FallingRock'
import { PatrolEnemy } from '../actors/enemies/PatrolEnemy'
import { RangedEnemy } from '../actors/enemies/RangedEnemy'
import { Ship } from '../actors/vehicles/Ship'
import { Checkpoint } from '../actors/Checkpoint'
import { RainSystem } from '../actors/RainDrop'

// Ground is at row GROUND. All platform rows are relative to that.
const GROUND = 25

export class Level1 extends LevelScene {
  levelName = 'Level 1: Rainy Hills'
  nextLevelKey = 'level2'
  startTileX = 2
  startTileY = GROUND - 2   // spawn 2 tiles above ground surface
  numCoins = 20
  mapWidth = 200
  mapHeight = 30            // 480px tall > 450px viewport → camera can scroll

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    // Solid ground rows GROUND–29
    this.fillGround(tileMap, GROUND, this.mapWidth, this.mapHeight, 'ground')

    // Platforms (rows relative to GROUND)
    this.addPlatform(tileMap, 10, 14, GROUND - 2)
    this.addPlatform(tileMap, 20, 25, GROUND - 4)
    this.addPlatform(tileMap, 30, 34, GROUND - 2)
    this.addPlatform(tileMap, 45, 50, GROUND - 5)
    this.addPlatform(tileMap, 60, 65, GROUND - 3)
    this.addPlatform(tileMap, 80, 85, GROUND - 4)
    this.addPlatform(tileMap, 90, 94, GROUND - 6)
    this.addPlatform(tileMap, 110, 115, GROUND - 3)
    this.addPlatform(tileMap, 130, 140, GROUND - 2)
    this.addPlatform(tileMap, 150, 155, GROUND - 5)
    this.addPlatform(tileMap, 170, 175, GROUND - 3)
    this.addPlatform(tileMap, 185, 190, GROUND - 2)

    // Water gap: cols 55–75, remove ground
    this.clearColumns(tileMap, 55, 75, GROUND, this.mapHeight)

    // Pits
    this.addPit(tileMap, 38, 40, GROUND, this.mapHeight)
    this.addPit(tileMap, 160, 162, GROUND, this.mapHeight)

    return tileMap
  }

  protected setupLevel(_engine: ex.Engine, _tileMap: ex.TileMap): void {
    // Rain atmosphere
    const rain = new RainSystem(60, 800, 450)
    this.add(rain)

    // Water in the gap
    const waterActor = new Water(
      ex.vec(65 * TILE_SIZE, GROUND * TILE_SIZE),
      20 * TILE_SIZE,
      5 * TILE_SIZE
    )
    this.add(waterActor)

    // Ship on water
    const ship = new Ship(ex.vec(65 * TILE_SIZE, (GROUND - 1) * TILE_SIZE))
    this.add(ship)

    // Spikes (on top of ground surface)
    const spikeY = GROUND * TILE_SIZE
    this.add(new Spike(ex.vec(35 * TILE_SIZE, spikeY)))
    this.add(new Spike(ex.vec(36 * TILE_SIZE, spikeY)))
    this.add(new Spike(ex.vec(98 * TILE_SIZE, spikeY)))
    this.add(new Spike(ex.vec(99 * TILE_SIZE, spikeY)))
    this.add(new Spike(ex.vec(160 * TILE_SIZE, spikeY)))
    this.add(new Spike(ex.vec(161 * TILE_SIZE, spikeY)))

    // Lava pool
    this.add(new Lava(ex.vec(146 * TILE_SIZE, spikeY), 4 * TILE_SIZE))

    // Enemies — spawn on ground surface
    const groundY = (GROUND - 1) * TILE_SIZE
    this.add(new PatrolEnemy(ex.vec(30 * TILE_SIZE, groundY), 27 * TILE_SIZE, 34 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(90 * TILE_SIZE, groundY), 85 * TILE_SIZE, 100 * TILE_SIZE))
    this.add(new PatrolEnemy(ex.vec(150 * TILE_SIZE, groundY), 145 * TILE_SIZE, 158 * TILE_SIZE))
    this.add(new RangedEnemy(ex.vec(110 * TILE_SIZE, (GROUND - 3) * TILE_SIZE)))

    // Falling rocks
    this.add(new FallingRock(ex.vec(50 * TILE_SIZE, (GROUND - 12) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(130 * TILE_SIZE, (GROUND - 10) * TILE_SIZE)))

    // Coins (20 total)
    const coinPositions: [number, number][] = [
      [5, GROUND - 1], [8, GROUND - 1],
      [12, GROUND - 3], [13, GROUND - 3],
      [22, GROUND - 5], [23, GROUND - 5],
      [32, GROUND - 3], [33, GROUND - 3],
      [47, GROUND - 6], [48, GROUND - 6],
      [62, GROUND - 4], [63, GROUND - 4],
      [82, GROUND - 5], [83, GROUND - 5],
      [91, GROUND - 7], [92, GROUND - 7],
      [112, GROUND - 4], [113, GROUND - 4],
      [132, GROUND - 3], [133, GROUND - 3],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // Treasures
    this.add(new Treasure(ex.vec(92 * TILE_SIZE, (GROUND - 8) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(152 * TILE_SIZE, (GROUND - 6) * TILE_SIZE)))

    // Checkpoints
    const cpY = (GROUND - 2) * TILE_SIZE
    this.respawnSystem.addCheckpoint(ex.vec(50 * TILE_SIZE, cpY))
    this.respawnSystem.addCheckpoint(ex.vec(100 * TILE_SIZE, cpY))
    this.respawnSystem.addCheckpoint(ex.vec(150 * TILE_SIZE, cpY))

    this.add(new Checkpoint(ex.vec(50 * TILE_SIZE, cpY)))
    this.add(new Checkpoint(ex.vec(100 * TILE_SIZE, cpY)))
    this.add(new Checkpoint(ex.vec(150 * TILE_SIZE, cpY)))

    // Exit gate
    this.addExitGate(195, GROUND - 4)

    // Background color: stormy rainy sky
    this.backgroundColor = ex.Color.fromHex('#4a5568')
  }
}
