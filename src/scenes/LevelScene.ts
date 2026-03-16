import * as ex from 'excalibur'
import { TILE_SIZE } from '../config'
import { Player } from '../actors/Player'
import { Friend } from '../actors/Friend'
import { ExitGate } from '../actors/ExitGate'
import { Checkpoint } from '../actors/Checkpoint'
import { CoinTracker } from '../systems/CoinTracker'
import { RespawnSystem } from '../systems/RespawnSystem'
import { HUD } from '../ui/HUD'
import { drawGroundTile, drawPlatformTile, drawIceTile, drawRoadTile, drawSpaceTile } from '../graphics/sprites'
import { DreamBackground, BgTheme } from '../actors/DreamBackground'

export type TileType = 'ground' | 'ground1' | 'platform' | 'empty' | 'ice' | 'road' | 'space'

export abstract class LevelScene extends ex.Scene {
  player!: Player
  friend!: Friend
  coinTracker: CoinTracker = new CoinTracker()
  respawnSystem: RespawnSystem = new RespawnSystem()
  hud!: HUD
  exitGate!: ExitGate
  nextLevelKey: string = 'mainmenu'
  mapWidth: number = 200
  mapHeight: number = 20
  bgTheme: BgTheme = 'hills'
  abstract levelName: string
  abstract startTileX: number
  abstract startTileY: number
  abstract numCoins: number

  tileMap!: ex.TileMap
  private _exiting: boolean = false

  onInitialize(engine: ex.Engine): void {
    this._exiting = false
    this.coinTracker.reset(this.numCoins)

    // Parallax background
    this.add(new DreamBackground(this.bgTheme))

    // Build map
    this.tileMap = this.buildMap(engine)
    this.add(this.tileMap)
    const tileMap = this.tileMap

    // Create player
    this.player = new Player({
      pos: ex.vec(this.startTileX * TILE_SIZE + TILE_SIZE / 2, this.startTileY * TILE_SIZE),
      width: 16,
      height: 24,
      collisionType: ex.CollisionType.Active,
      z: 5,
    })
    this.player.respawnPos = ex.vec(this.startTileX * TILE_SIZE + TILE_SIZE / 2, this.startTileY * TILE_SIZE)
    this.add(this.player)

    // Create fox friend
    this.friend = new Friend(this.player)
    this.friend.pos = ex.vec(this.startTileX * TILE_SIZE - 20, this.startTileY * TILE_SIZE)
    this.add(this.friend)

    // Setup coin tracking
    this.on('coin:collected', () => {
      this.coinTracker.addCoin()
    })

    this.coinTracker.onAllCollected = () => {
      // Gate is always open; collecting all coins is a bonus achievement
      if (this.hud) this.hud.showReachGateMessage()
      this.player.addScore(500)
    }

    // Listen for score events
    this.on('enemy:killed', (evt: unknown) => {
      const e = evt as { value: number }
      this.player.addScore(e.value)
    })

    // Death zone — invisible trigger below the map.
    // Catches the player falling into pits and triggers a respawn.
    const mapPixelWidth = this.mapWidth * TILE_SIZE
    const mapPixelHeight = this.mapHeight * TILE_SIZE
    const deathZone = new ex.Actor({
      pos: ex.vec(mapPixelWidth / 2, mapPixelHeight + 160),
      width: mapPixelWidth * 3,
      height: 64,
      collisionType: ex.CollisionType.Passive,
      z: -1,
    })
    deathZone.on('collisionstart', (evt) => {
      const other = evt.other as ex.Actor
      if (other.tags.has('player')) {
        const p = other as unknown as { isRespawning: boolean; triggerRespawn: (e: ex.Engine) => void }
        if (!p.isRespawning) p.triggerRespawn(engine)
      }
    })
    this.add(deathZone)

    // Add actors defined in subclass
    this.setupLevel(engine, tileMap)

    // HUD
    this.hud = new HUD(this.coinTracker, this.player, this.levelName)
    this.add(this.hud)

    // Camera
    this.setupCamera(engine)
  }

  private setupCamera(engine: ex.Engine): void {
    const mapPixelWidth = this.mapWidth * TILE_SIZE
    const mapPixelHeight = this.mapHeight * TILE_SIZE
    const hw = engine.drawWidth / 2
    const hh = engine.drawHeight / 2

    // Set initial camera position (clamped to valid range) so frame 0 is correct
    const initX = Math.max(hw, Math.min(this.player.pos.x, mapPixelWidth - hw))
    const initY = Math.max(hh, Math.min(this.player.pos.y, mapPixelHeight - hh))
    this.camera.pos = ex.vec(initX, initY)

    // Follow player on both axes
    this.camera.strategy.lockToActorAxis(this.player, ex.Axis.X)
    this.camera.strategy.lockToActorAxis(this.player, ex.Axis.Y)

    // IMPORTANT: pass FULL world bounds (0,0,w,h).
    // limitCameraBounds internally adds halfViewport offsets, so the camera
    // center is clamped to [halfW, w-halfW] x [halfH, h-halfH].
    // Do NOT pre-subtract the offsets or the internal clamp inverts!
    this.camera.strategy.limitCameraBounds(
      new ex.BoundingBox(0, 0, mapPixelWidth, mapPixelHeight)
    )
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    super.onPreUpdate(engine, delta)
    // Reliable fall detection: player more than one viewport below map bottom → respawn
    if (this.player && !this.player.isRespawning) {
      const fallThreshold = this.mapHeight * TILE_SIZE + engine.drawHeight
      if (this.player.pos.y > fallThreshold) {
        this.player.triggerRespawn(engine)
      }
    }
  }

  protected abstract buildMap(engine: ex.Engine): ex.TileMap
  protected abstract setupLevel(engine: ex.Engine, tileMap: ex.TileMap): void

  protected createBaseTileMap(columns: number, rows: number): ex.TileMap {
    return new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      columns,
      rows,
    })
  }

  protected fillGround(tileMap: ex.TileMap, fromRow: number, columns: number, rows: number, type: TileType = 'ground'): void {
    for (let row = fromRow; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const tile = tileMap.getTile(col, row)
        if (!tile) continue
        tile.solid = true
        if (type === 'ground') {
          tile.addGraphic(row === fromRow ? drawGroundTile(0) : drawGroundTile(1))
        } else if (type === 'ground1') {
          tile.addGraphic(drawGroundTile(1))
        } else if (type === 'platform') {
          tile.addGraphic(drawPlatformTile())
        } else if (type === 'ice') {
          tile.addGraphic(row === fromRow ? drawIceTile() : drawGroundTile(1))
        } else if (type === 'road') {
          tile.addGraphic(drawRoadTile())
        } else if (type === 'space') {
          tile.addGraphic(row === fromRow ? drawSpaceTile(true) : drawSpaceTile(false))
        }
      }
    }
  }

  protected addPlatform(tileMap: ex.TileMap, colStart: number, colEnd: number, row: number, type: TileType = 'platform'): void {
    for (let col = colStart; col <= colEnd; col++) {
      const tile = tileMap.getTile(col, row)
      if (!tile) continue
      tile.solid = true
      if (type === 'platform') {
        tile.addGraphic(drawPlatformTile())
      } else if (type === 'ground') {
        tile.addGraphic(drawGroundTile(0))
      } else if (type === 'ice') {
        tile.addGraphic(drawIceTile())
      } else if (type === 'road') {
        tile.addGraphic(drawRoadTile())
      } else if (type === 'space') {
        tile.addGraphic(drawSpaceTile(true))
      }
    }
  }

  protected clearTile(tileMap: ex.TileMap, col: number, row: number): void {
    const tile = tileMap.getTile(col, row)
    if (tile) {
      tile.solid = false
      tile.clearGraphics()
    }
  }

  protected clearColumns(tileMap: ex.TileMap, colStart: number, colEnd: number, rowStart: number, rowEnd: number): void {
    for (let col = colStart; col <= colEnd; col++) {
      for (let row = rowStart; row <= rowEnd; row++) {
        this.clearTile(tileMap, col, row)
      }
    }
  }

  protected addCheckpointAt(tileX: number, tileY: number): void {
    const cp = new Checkpoint(ex.vec(tileX * TILE_SIZE, tileY * TILE_SIZE))
    this.respawnSystem.addCheckpoint(ex.vec(tileX * TILE_SIZE + 8, tileY * TILE_SIZE))
    this.add(cp)
  }

  protected addExitGate(tileX: number, tileY: number): void {
    this.exitGate = new ExitGate(
      ex.vec(tileX * TILE_SIZE + 16, tileY * TILE_SIZE),
      () => this.goToNextLevel(this.engine!)
    )
    this.add(this.exitGate)
  }

  goToNextLevel(engine: ex.Engine): void {
    if (this._exiting) return
    this._exiting = true
    engine.goToScene(this.nextLevelKey)
  }

  // Helper: tile position to world position
  protected tileToWorld(col: number, row: number): ex.Vector {
    return ex.vec(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2)
  }

  // Helper: add pit (remove ground tiles in column range)
  protected addPit(tileMap: ex.TileMap, colStart: number, colEnd: number, fromRow: number, toRow: number): void {
    this.clearColumns(tileMap, colStart, colEnd, fromRow, toRow)
  }
}
