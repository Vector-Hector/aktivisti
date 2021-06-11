import { EventTypes } from 'src/api/model/EventTypes'

export interface EventMetricDto {
  id: number,
  name: string,
  mandatory_for_types: EventTypes
}
