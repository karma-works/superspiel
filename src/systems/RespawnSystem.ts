import * as ex from 'excalibur'

export class RespawnSystem {
  checkpoints: ex.Vector[] = []

  addCheckpoint(pos: ex.Vector) {
    this.checkpoints.push(pos.clone())
  }

  getNearestCheckpoint(pos: ex.Vector): ex.Vector {
    if (this.checkpoints.length === 0) {
      return pos.clone()
    }
    let nearest = this.checkpoints[0]
    let nearestDist = pos.distance(nearest)
    for (const cp of this.checkpoints) {
      const d = pos.distance(cp)
      if (d < nearestDist) {
        nearestDist = d
        nearest = cp
      }
    }
    return nearest.clone()
  }

  getLastPassedCheckpoint(playerX: number): ex.Vector | null {
    // Get the last checkpoint the player has passed (to the left)
    let best: ex.Vector | null = null
    for (const cp of this.checkpoints) {
      if (cp.x <= playerX) {
        if (!best || cp.x > best.x) {
          best = cp
        }
      }
    }
    return best ? best.clone() : null
  }
}
