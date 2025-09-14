import { reactive } from 'vue'

export abstract class Store<T extends object> {
  public state: T

  constructor() {
    const data = this.data()
    this.setup(data)
    this.state = reactive(data) as T
  }

  protected abstract data(): T

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected setup(data: T): void {}

  public getState(): T {
    return this.state
  }

  public reset() {
    const data = this.data()
    for (const key of Object.keys(this.state)) {
      // @ts-ignore
      this.state[key] = data[key]
    }
    this.setup(data)
    this.state = reactive(data) as T
  }
}
