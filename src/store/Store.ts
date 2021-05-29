import {reactive, readonly} from 'vue';


// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Store<T extends Object> {
    protected state: T;

    constructor(initialData: Partial<T> = {}) {
      const data = {
        ...this.data(),
        ...initialData
      };
      this.setup(data);
      this.state = reactive(data) as T;
    }

    protected abstract data(): T

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    protected setup(data: T): void {}

    public getState(): T {
      return readonly(this.state) as T
    }
}
