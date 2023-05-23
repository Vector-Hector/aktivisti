import { PosterStatus } from 'src/api/model/PosterDto'

export interface ReportPosterDto {
  count: number
  day: string
  status: PosterStatus
}
