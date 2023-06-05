import { EventTypes } from 'src/api/model/EventTypes'

export interface ReportEventDto {
  count: number
  day: string
  type: EventTypes
}
