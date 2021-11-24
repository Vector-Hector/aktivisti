import { Store } from 'src/store/Store'
import { Pagination } from 'src/api/model/APIEnvelope'

interface OverviewStoreState<T, U> {
  filterParams: U
  items: T[]
  pagination: Pagination
  itemHoveredOver: T| null
}


export class OverviewStore<T,U> extends Store<OverviewStoreState<T, U>> {
  constructor(default_pagination: Pagination) {
    super()
    this.state.pagination = default_pagination
  }

  protected data(): OverviewStoreState<T, U> {
    return {
      filterParams: {} as U ,
      items: [] as T[],
      pagination: {} as Pagination,
      itemHoveredOver: null as T | null
    }
  }

  public set filterParams(params: U) {
    this.state.filterParams = params
  }

  public get filterParams(): U {
    return this.getState().filterParams
  }

  public set items(items: T[]) {
    this.state.items = items
  }

  public get items(): T[] {
    return this.getState().items
  }

  public set pagination(pagination: Pagination) {
    this.state.pagination = pagination
  }

  public get pagination(): Pagination {
    return this.getState().pagination
  }

  public get itemHoveredOver(): T | null {
    return this.getState().itemHoveredOver
  }

  public set itemHoveredOver(item:T|null) {
    this.state.itemHoveredOver = item
  }

}
