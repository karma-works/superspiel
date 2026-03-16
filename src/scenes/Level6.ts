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
import { FlyingEnemy } from '../actors/enemies/FlyingEnemy'
import { Airplane } from '../actors/vehicles/Airplane'

// Row from which each mountain peak starts (tiles go from peakRow down to mapHeight)
const PEAKS: Array<{ colStart: number; colEnd: number; topRow: number }> = [
  { colStart: 0,   colEnd: 18,  topRow: 20 },   // Peak 1 — start island
  { colStart: 25,  colEnd: 38,  topRow: 16 },   // Peak 2
  { colStart: 50,  colEnd: 62,  topRow: 22 },   // Peak 3 — lower
  { colStart: 74,  colEnd: 88,  topRow: 17 },   // Peak 4
  { colStart: 104, colEnd: 116, topRow: 13 },   // Peak 5 — tallest
  { colStart: 128, colEnd: 142, topRow: 19 },   // Peak 6
  { colStart: 158, colEnd: 175, topRow: 15 },   // Peak 7 — final
]

export class Level6 extends LevelScene {
  levelName = 'Level 6: Sunset Peaks'
  bgTheme = 'sunset' as const
  nextLevelKey = 'level7'
  prevLevelKey = 'level5'
  startTileX = 3
  startTileY = PEAKS[0].topRow - 2
  numCoins = 22
  mapWidth = 180
  mapHeight = 30

  protected buildMap(_engine: ex.Engine): ex.TileMap {
    const tileMap = this.createBaseTileMap(this.mapWidth, this.mapHeight)

    for (const peak of PEAKS) {
      for (let col = peak.colStart; col <= peak.colEnd; col++) {
        for (let row = peak.topRow; row < this.mapHeight; row++) {
          const tile = tileMap.getTile(col, row)
          if (!tile) continue
          tile.solid = true
          tile.addGraphic(row === peak.topRow ? drawGroundTile(0) : drawGroundTile(1))
        }
      }
    }

    // A few connecting ledges on tall peaks
    this.addPlatform(tileMap, 28, 36,  PEAKS[1].topRow - 5, 'ground')
    this.addPlatform(tileMap, 106, 114, PEAKS[4].topRow - 5, 'ground')
    this.addPlatform(tileMap, 160, 170, PEAKS[6].topRow - 4, 'ground')

    return tileMap
  }

  protected setupLevel(_engine: ex.Engine, _tileMap: ex.TileMap): void {
    const peak = (idx: number) => PEAKS[idx]
    const topY  = (idx: number) => peak(idx).topRow * TILE_SIZE
    const actorY = (idx: number) => (peak(idx).topRow - 1) * TILE_SIZE
    const midCol = (idx: number) => Math.floor((peak(idx).colStart + peak(idx).colEnd) / 2)

    // ── Airplane — parked on Peak 1 ──────────────────────────────────────────
    this.add(new Airplane(ex.vec(8 * TILE_SIZE, actorY(0))))

    // ── Hazards ──────────────────────────────────────────────────────────────
    this.add(new Lava(ex.vec(midCol(1) * TILE_SIZE, topY(1)), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(midCol(4) * TILE_SIZE, topY(4)), 2 * TILE_SIZE))
    this.add(new Lava(ex.vec(midCol(6) * TILE_SIZE, topY(6)), 2 * TILE_SIZE))

    this.add(new Spike(ex.vec(54 * TILE_SIZE, topY(2))))
    this.add(new Spike(ex.vec(58 * TILE_SIZE, topY(2))))
    this.add(new Spike(ex.vec(130 * TILE_SIZE, topY(5))))
    this.add(new Spike(ex.vec(140 * TILE_SIZE, topY(5))))

    this.add(new FallingRock(ex.vec(30 * TILE_SIZE, (peak(1).topRow - 15) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(108 * TILE_SIZE, (peak(4).topRow - 14) * TILE_SIZE)))
    this.add(new FallingRock(ex.vec(162 * TILE_SIZE, (peak(6).topRow - 12) * TILE_SIZE)))

    // ── Enemies ──────────────────────────────────────────────────────────────
    this.add(new PatrolEnemy(
      ex.vec(midCol(1) * TILE_SIZE, actorY(1)),
      peak(1).colStart * TILE_SIZE, peak(1).colEnd * TILE_SIZE,
    ))
    this.add(new PatrolEnemy(
      ex.vec(midCol(5) * TILE_SIZE, actorY(5)),
      peak(5).colStart * TILE_SIZE, peak(5).colEnd * TILE_SIZE,
    ))

    // Flying enemies patrol in the sky gaps
    this.add(new FlyingEnemy(ex.vec(43 * TILE_SIZE, (peak(1).topRow - 4) * TILE_SIZE), 39 * TILE_SIZE, 50 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(92 * TILE_SIZE, (peak(3).topRow - 6) * TILE_SIZE), 88 * TILE_SIZE, 104 * TILE_SIZE))
    this.add(new FlyingEnemy(ex.vec(145 * TILE_SIZE, (peak(5).topRow - 5) * TILE_SIZE), 142 * TILE_SIZE, 158 * TILE_SIZE))

    // ── Coins (22 total) ─────────────────────────────────────────────────────
    const coinPositions: [number, number][] = [
      // Peak 1
      [4,  peak(0).topRow - 1], [8,  peak(0).topRow - 1], [14, peak(0).topRow - 1],
      // Peak 2 (on ledge)
      [29, peak(1).topRow - 6], [32, peak(1).topRow - 6], [35, peak(1).topRow - 6],
      // Peak 3
      [52, peak(2).topRow - 1], [56, peak(2).topRow - 1], [60, peak(2).topRow - 1],
      // Peak 4
      [76, peak(3).topRow - 1], [80, peak(3).topRow - 1], [84, peak(3).topRow - 1],
      // Peak 5 (on ledge — reward for flying up)
      [107, peak(4).topRow - 6], [110, peak(4).topRow - 6], [113, peak(4).topRow - 6],
      // Peak 6
      [130, peak(5).topRow - 1], [134, peak(5).topRow - 1], [138, peak(5).topRow - 1],
      // Peak 7 (on ledge)
      [161, peak(6).topRow - 5], [164, peak(6).topRow - 5], [168, peak(6).topRow - 5],
      // Bonus — floating in the sky mid-gap
      [95, peak(3).topRow - 8],
    ]
    for (const [col, row] of coinPositions) {
      this.add(new Coin(ex.vec(col * TILE_SIZE + 8, row * TILE_SIZE - 8)))
    }

    // ── Treasures ────────────────────────────────────────────────────────────
    this.add(new Treasure(ex.vec(midCol(2) * TILE_SIZE, (peak(2).topRow - 3) * TILE_SIZE)))
    this.add(new Treasure(ex.vec(midCol(4) * TILE_SIZE, (peak(4).topRow - 6) * TILE_SIZE)))  // on high ledge
    this.add(new Treasure(ex.vec(168 * TILE_SIZE, (peak(6).topRow - 5) * TILE_SIZE)))         // final treasure

    // ── Checkpoints ──────────────────────────────────────────────────────────
    this.addCheckpointAt(midCol(1), peak(1).topRow - 2)
    this.addCheckpointAt(midCol(3), peak(3).topRow - 2)
    this.addCheckpointAt(midCol(5), peak(5).topRow - 2)

    // ── Exit Gate ────────────────────────────────────────────────────────────
    this.addExitGate(170, peak(6).topRow - 6)
  }
}
