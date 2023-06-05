import { OFFICE_LIST_CHUNK_SIZE } from 'src/constants'
import { OverviewStore } from 'src/store/OverviewStore'
import { PosterDto } from 'src/api/model/PosterDto'
import { PosterFilterParams } from 'src/api/params/PosterFilterParams'

export const posterOverviewStore = new OverviewStore<
  PosterDto,
  PosterFilterParams
>({ limit: OFFICE_LIST_CHUNK_SIZE })
