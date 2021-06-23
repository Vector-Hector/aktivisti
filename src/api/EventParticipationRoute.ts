import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { ApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'

/**
 * A class extending {@link ApiRoute} to implement some extra non-standard operations (join / leave)
 */
export class EventParticipationRoute extends ApiRoute<EventParticipationDto> {
  /**
   * Let the currently authenticated user accept an event invitation
   * @param id the event id
   */
  async accept(id: string) {
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}${id}/accept/`, {
      method: 'POST'
    })
    const data = await response.data
    return new JSONResponse<APIEnvelope<EventParticipationDto>>(response, data)
  }

  /**
   * Let the currently authenticated user reject an event invitation
   * @param id the event id
   */
  async reject(id: string) {
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}${id}/reject/`, {
      method: 'POST'
    })
    const data = await response.data
    return new JSONResponse<Record<string, unknown>>(response, data)
  }

  /**
   * Assigns the currently authenticated user to an event area
   * @param id the event id
   * @param eventAreaId the event area id
   */
  async assignEventArea(id: string, eventAreaId: number) {
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}${id}/assign-event-area/`, {
      method: 'POST',
      data: {
        event_area: eventAreaId
      }
    })
    const data = await response.data
    return new JSONResponse<APIEnvelope<EventParticipationDto>>(response, data)
  }

  /**
   * Unassigns the currently authenticated user to an event area
   * @param id the event id
   * @param eventAreaId the event area id
   */
  async unassignEventArea(id: string, eventAreaId: number) {
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}${id}/unassign-event-area/`, {
      method: 'POST',
      data: {
        event_area: eventAreaId
      }
    })
    const data = await response.data
    return new JSONResponse<APIEnvelope<EventParticipationDto>>(response, data)
  }

  /**
   * Let the currently authenticated user verify event participations
   * if they have management permissions for the event
   * @param id the event participation id
   */
  async verifyParticipant(id: string) {
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}${id}/`, {
      method: 'PATCH',
      data: {
        is_verified: true
      }
    })
    const data = await response.data
    return new JSONResponse<Record<string, unknown>>(response, data)
  }

}
