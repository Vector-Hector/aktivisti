import { Store } from 'src/store/Store'
import { Pagination } from 'src/api/model/APIEnvelope'

interface OverviewStoreState<ItemsType, FilterParamsType> {
  filterParams: FilterParamsType
  items: ItemsType[]
  pagination: Pagination
  itemHoveredOver: ItemsType| null
}


export class OverviewStore<ItemsType,FilterParamsType> extends Store<OverviewStoreState<ItemsType, FilterParamsType>> {
  constructor(default_pagination: Pagination) {
    super()
    this.state.pagination = default_pagination
  }

  protected data(): OverviewStoreState<ItemsType, FilterParamsType> {
    return {
      filterParams: {} as FilterParamsType ,
      items: [] as ItemsType[],
      pagination: {} as Pagination,
      itemHoveredOver: null as ItemsType | null
    }
  }

  public set filterParams(params: FilterParamsType) {
    this.state.filterParams = params
  }

  public get filterParams(): FilterParamsType {
    return this.getState().filterParams
  }

  public set items(items: ItemsType[]) {
    this.state.items = items
  }

  public get items(): ItemsType[] {
    return this.getState().items
  }

  public set pagination(pagination: Pagination) {
    this.state.pagination = pagination
  }

  public get pagination(): Pagination {
    return this.getState().pagination
  }

  public get itemHoveredOver(): ItemsType | null {
    return this.getState().itemHoveredOver
  }

  public set itemHoveredOver(item:ItemsType|null) {
    this.state.itemHoveredOver = item
  }

}
