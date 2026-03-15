export class CoinTracker {
  total: number = 0
  collected: number = 0
  onAllCollected?: () => void

  addCoin() {
    this.collected++
    if (this.collected >= this.total) {
      this.onAllCollected?.()
    }
  }

  reset(total: number) {
    this.total = total
    this.collected = 0
  }

  get progress(): number {
    if (this.total === 0) return 1
    return this.collected / this.total
  }
}
