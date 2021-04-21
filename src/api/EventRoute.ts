import { EventDto } from '@/api/model/EventDto'
import { APIEnvelope } from '@/api/model/APIEnvelope'
import { ApiRoute } from '@/api/ApiRoute'
import { JSONResponse } from '@/api/JSONResponse'
import { EventMetricRecordDto } from '@/api/model/EventMetricRecordDto'
import { BulkInviteDto } from '@/api/model/BulkInviteDto'
import { EventParticipationDto } from '@/api/model/EventParticipationDto'

/**
 * A class extending {@link ApiRoute} to implement some extra non-standard operations (join / leave)
 */
export class EventRoute extends ApiRoute<EventDto> {
  /**
   * Let the currently authenticated user join an event
   * @param id the event id
   */
  async join(id: string) {
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}${id}/join/`, {
      method: 'POST'
    })
    const data = await response.data
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }

  /**
   * Let the currently authenticated user leave an event
   * @param id the event id
   */
  async leave(id: string) {
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}${id}/leave/`, {
      method: 'POST'
    })
    const data = await response.data
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }

  async batchUpdateMetricRecords(id: string, body: Partial<EventMetricRecordDto>[]) {
    const response = await this.request({
      path: `${this.path}${id}/batch-update-metric-records/`,
      data: body,
      method: 'POST'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }

  async invite(id: string, body: BulkInviteDto) {
    const response = await this.request({
      path: `${this.path}${id}/invite/`,
      data: body,
      method: 'POST'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventParticipationDto[]>>(response, data)
  }
}
