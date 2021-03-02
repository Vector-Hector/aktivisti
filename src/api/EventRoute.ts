import { EventDto } from '@/api/model/EventDto'
import { APIEnvelope } from '@/api/model/APIEnvelope'
import { ApiRoute } from '@/api/ApiRoute'
import { JSONResponse } from '@/api/JSONResponse'

/**
 * A class extending {@link ApiRoute} to implement some extra non-standard operations (join / leave)
 */
export class EventRoute extends ApiRoute<EventDto> {
  /**
   * Let the currently authenticated user join an event
   * @param id the event id
   */
  async join(id: string) {
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}/${id}/join`, {
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
    const response = await this.axiosInstance(`${this.baseUrl}/${this.path}/${id}/leave`, {
      method: 'POST'
    })
    const data = await response.data
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }
}
