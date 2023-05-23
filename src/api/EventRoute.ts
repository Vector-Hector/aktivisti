import { EventDto } from 'src/api/model/EventDto'
import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { ApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { BulkInviteDto } from 'src/api/model/BulkInviteDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { EventMetricReportDto } from 'src/api/model/EventMetricReportDto'

/**
 * A class extending {@link ApiRoute} to implement some extra non-standard operations (join / leave)
 */
export class EventRoute extends ApiRoute<EventDto> {
  /**
   * Let the currently authenticated user join an event
   * @param id the event id
   */
  async join(id: string) {
    const response = await this.request({
      path: `${this.path}${id}/join/`,
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
    const response = await this.request({
      path: `${this.path}${id}/leave/`,
      method: 'POST'
    })
    const data = await response.data
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }

  async batchSetMetricRecords(
    id: string,
    body: Partial<EventMetricRecordDto>[]
  ) {
    const response = await this.request({
      path: `${this.path}${id}/batch-set-metric-records/`,
      data: body,
      method: 'POST'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventMetricRecordDto[]>>(response, data)
  }

  async invite(id: string, body: BulkInviteDto) {
    const response = await this.request({
      path: `${this.path}${id}/invite/`,
      data: body,
      method: 'POST'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventParticipationDto[]>>(
      response,
      data
    )
  }

  async inviteCoordinators(id: string) {
    const response = await this.request({
      path: `${this.path}${id}/invite_coordinators/`,
      method: 'POST'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventParticipationDto[]>>(
      response,
      data
    )
  }

  async inviteTeamCaptains(id: string) {
    const response = await this.request({
      path: `${this.path}${id}/invite_team_captains/`,
      method: 'POST'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventParticipationDto[]>>(
      response,
      data
    )
  }

  async inviteUsers(id: string) {
    const response = await this.request({
      path: `${this.path}${id}/invite_users/`,
      method: 'POST'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventParticipationDto[]>>(
      response,
      data
    )
  }

  async report(id: string) {
    const response = await this.request({
      path: `${this.path}${id}/report/`,
      method: 'GET'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventMetricReportDto>>(response, data)
  }
}
