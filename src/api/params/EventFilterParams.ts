import { EventTypes } from 'src/api/model/EventTypes'
import { SortOption } from 'src/stores/user'
import { Polygon } from 'geojson'
import { EventStatus } from 'src/api/model/EventStatus'

export interface EventFilterParams {
  sub_association?: number[]
  campaigns?: number[]
  order_by?: SortOption
  event_type?: EventTypes
  within?: Polygon
  limit?: number
  end_date_after?: string
  end_date_include_null?: boolean
  status?: EventStatus
  is_owner?: boolean
  management_permission?: boolean
}
