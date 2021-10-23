import { OfficeFilterParams } from 'src/api/params/OfficeFilterParams'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { Store } from 'src/store/Store'
import { Pagination } from 'src/api/model/APIEnvelope'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'

interface OfficeOverviewStoreState {
  filterParams: OfficeFilterParams
  offices: OfficeDto[]
  pagination: Pagination
  officeHoveredOver: OfficeDto | null
}

const _defaultPagination = {
  limit: EVENT_LIST_CHUNK_SIZE
}

class OfficeOverviewStore extends Store<OfficeOverviewStoreState> {

  protected data(): OfficeOverviewStoreState {
    return {
      filterParams: {},
      offices: [],
      pagination: _defaultPagination,
      officeHoveredOver: null
    }
  }

  public set filterParams(params: OfficeFilterParams) {
    this.state.filterParams = params
  }

  public get filterParams(): OfficeFilterParams {
    return this.getState().filterParams
  }

  public set offices(offices: OfficeDto[]) {
    this.state.offices = offices
  }

  public get offices(): OfficeDto[] {
    return this.getState().offices
  }

  public set pagination(pagination: Pagination) {
    this.state.pagination = pagination
  }

  public get pagination(): Pagination {
    return this.getState().pagination
  }

  public get officeHoveredOver(): OfficeDto | null {
    return this.getState().officeHoveredOver
  }

  public set officeHoveredOver(office) {
    this.state.officeHoveredOver = office
  }

}

export const officeOverviewStore = new OfficeOverviewStore()
