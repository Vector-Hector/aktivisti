import Timeout = NodeJS.Timeout
import { uuidv4 } from 'src/utils/uuid'

enum DebouncerError {
  SUPERSEEDED
}

export class SettleDebouncer {
  currentJob: Promise<any> | null = null
  currentTimeout: Timeout | null = null
  currentTimeoutPromise: Promise<void> | null = null
  activeJobToken: string = uuidv4()

  executeDebounced(fn: () => Promise<any>, settleMs = 1000) {
    const localJobToken = uuidv4()
    this.activeJobToken = localJobToken
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (localJobToken === this.activeJobToken) {
          resolve(fn())
        } else {
          reject(DebouncerError.SUPERSEEDED)
        }
      }, settleMs)
    }).catch((reason) => {
      if (reason !== DebouncerError.SUPERSEEDED) {
        return Promise.reject(reason)
      }
    })
  }

  async waitForSettle() {
    while (this.currentTimeoutPromise !== null) {
      try {
        await this.currentTimeoutPromise
        return
      } catch (e) {
        // if the promise is rejected wait for the next one
      }
    }
  }
}

export class IntervalDebouncer {
  lastCall: null | Date = null

  constructor(private haltInterval = 2000) {
  }

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
