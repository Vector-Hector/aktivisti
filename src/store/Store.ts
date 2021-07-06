import { reactive, readonly } from 'vue'


// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Store<T extends Object> {
  protected state: T

  constructor() {
    const data = this.data()
    this.setup(data)
    this.state = reactive(data) as T
  }

  protected abstract data(): T

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  protected setup(data: T): void {
  }

  public getState(): T {
    return this.state
  }

  public reset() {
    const defaults = this.data()
    for (const key of Object.keys(this.state)) {
      // @ts-ignore
      this.state[key] = defaults[key]
    }
  }
}
