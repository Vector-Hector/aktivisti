import Timeout = NodeJS.Timeout

export class SettleDebouncer {
  currentJob: Promise<any> | null = null
  currentTimeout: Timeout | null = null

  async executeDebounced(fn: () => Promise<any>, settleMs = 1000) {
    if (this.currentJob !== null) {
      await this.currentJob
    }
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout)
    }
    this.currentTimeout = setTimeout(() => {
      this.currentTimeout = null
      this.currentJob = fn()
    }, settleMs)
  }
}

export class IntervalDebouncer {
  lastCall: null | Date = null
  constructor(private haltInterval = 2000) {}

  executeDebounced(fn: () => any): boolean {
    if (this.lastCall === null || new Date().getTime() - this.lastCall.getTime() > this.haltInterval) {
      fn()
      this.lastCall = new Date()
      return true
    } else {
      return false
    }
  }

}
