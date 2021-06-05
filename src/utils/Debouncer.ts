import Timeout = NodeJS.Timeout

export class Debouncer {
  currentJob: Promise<any> | null = null
  currentTimeout: Timeout | null = null

  async executeDebounced(fn: () => Promise<any>, debounceMs = 1000) {
    if (this.currentJob !== null) {
      await this.currentJob
    }
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout)
    }
    this.currentTimeout = setTimeout(() => {
      this.currentTimeout = null
      this.currentJob = fn()
    }, debounceMs)
  }
}
