import { computed } from 'vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { OfficeFilterParams } from 'src/api/params/OfficeFilterParams'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { officeOverviewStore } from 'src/store/OfficeOverviewStore'
import { distinctBy } from 'src/utils/array'
import { apiClient } from 'src/api/ApiClient'

export default function useOfficeOverviewMixin() {
  const offices = computed({
    get: () => officeOverviewStore.items,
    set: (offices: OfficeDto[]) => officeOverviewStore.items = offices
  })
  const filterParams = computed({
    get: () => officeOverviewStore.filterParams,
    set: (filterParams: OfficeFilterParams) => officeOverviewStore.filterParams = filterParams
  })
  const pagination = computed({
    get: () => officeOverviewStore.pagination,
    set: (pagination: Pagination) => officeOverviewStore.pagination = pagination
  })
  const officeHoveredOver = computed({
    get: () => officeOverviewStore.itemHoveredOver,
    set: (office: OfficeDto | null) => officeOverviewStore.itemHoveredOver = office
  })

  async function updateFilterParams(params: OfficeFilterParams) {
    filterParams.value = {
      ...filterParams.value,
      ...params
    }
    const {
      data: new_offices,
      pagination: new_pagination
    } = (await apiClient.offices.list({...filterParams.value, ...pagination.value, offset: 0})).payload
    pagination.value = new_pagination!
    offices.value = new_offices
  }

  async function fetchMoreOffices() {
    const {
      data: new_offices,
      pagination: new_pagination
    } = (await apiClient.offices.list({
      ...filterParams.value, ...pagination.value,
      offset: (offices.value?.length ?? 0)
    })).payload
    offices.value = distinctBy(offices.value.concat(new_offices), (office) => office.id)
    pagination.value = new_pagination!
  }

  return {offices, filterParams, pagination, officeHoveredOver, updateFilterParams, fetchMoreOffices}
}
