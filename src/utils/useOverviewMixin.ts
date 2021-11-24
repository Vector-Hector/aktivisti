import { computed } from 'vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { distinctBy } from 'src/utils/array'
import { OverviewStore } from 'src/store/OverviewStore'
import { ItemDto } from 'src/api/model/ItemDto'
import { ApiRoute } from 'src/api/ApiRoute'

export default function<ItemsDto extends ItemDto, ItemFilterParams>(store: OverviewStore<ItemsDto, ItemFilterParams>, list_request:ApiRoute<ItemsDto>) {
  const items = computed({
    get: () => store.items,
    set: (items: ItemsDto[]) => store.items = items
  })
  const filterParams = computed({
    get: () => store.filterParams,
    set: (filterParams: ItemFilterParams) => store.filterParams = filterParams
  })
  const pagination = computed({
    get: () => store.pagination,
    set: (pagination: Pagination) => store.pagination = pagination
  })
  const itemHoveredOver = computed({
    get: () => store.itemHoveredOver,
    set: (item: ItemsDto | null) => store.itemHoveredOver = item
  })

  async function updateFilterParams(params: ItemFilterParams) {
    filterParams.value = {
      ...filterParams.value,
      ...params
    }
    const {
      data: new_items,
      pagination: new_pagination
    } = (await list_request.list({...filterParams.value, ...pagination.value, offset: 0})).payload
    pagination.value = new_pagination!
    items.value = new_items
  }

  async function fetchMoreItems() {
    const {
      data: new_items,
      pagination: new_pagination
    } = (await list_request.list({
      ...filterParams.value, ...pagination.value,
      offset: (items.value?.length ?? 0)
    })).payload
    items.value = distinctBy(items.value.concat(new_items), (item) => item.id)
    pagination.value = new_pagination!
  }

  return {items, filterParams, pagination, itemHoveredOver, updateFilterParams, fetchMoreItems}
}
