import { EventDto } from '@/api/model/EventDto'
import { APIEnvelope } from '@/api/model/APIEnvelope'
import { ApiRoute } from '@/api/ApiRoute'
import { JSONResponse } from '@/api/JSONResponse'
import { userStore } from '@/store/UserStore'

/**
 * A class extending {@link ApiRoute} to implement some extra non-standard operations (join / leave)
 */
export class EventRoute extends ApiRoute<EventDto> {
  /**
   * Let the currently authenticated user join an event
   * @param id the event id
   */
  async join(id: string) {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.getToken()}`,
        'Content-Type': 'application/json',
      }
    })
    const data = await response.json()
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }

  /**
   * Let the currently authenticated user leave an event
   * @param id the event id
   */
  async leave(id: string) {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.getToken()}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }
}
