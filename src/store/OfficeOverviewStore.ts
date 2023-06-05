import { OfficeFilterParams } from 'src/api/params/OfficeFilterParams'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { OFFICE_LIST_CHUNK_SIZE } from 'src/constants'
import { OverviewStore } from 'src/store/OverviewStore'

export const officeOverviewStore = new OverviewStore<
  OfficeDto,
  OfficeFilterParams
>({ limit: OFFICE_LIST_CHUNK_SIZE })
