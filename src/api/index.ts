import { CreateEventDto, EventDto } from '@/api/model/EventDto'
import { UserDto } from '@/api/model/UserDto'

class JSONResponse<T> {
  constructor(public response: Response, public data: T) {
  }
}

/**
 * Generic CRUD operation definitions for a route
 * First Generic E is the interface as returned by server
 * Second Generic C is the interface for creating or updating entities
 */
class ApiRoute<E, C> {
  constructor(protected baseUrl: string, protected path: string) {
  }

  async list(): Promise<JSONResponse<E[]>> {
    const response = await fetch(`${this.baseUrl}/${this.path}`)
    const data = await response.json()
    return new JSONResponse<E[]>(response, data)
  }

  async get(id: number): Promise<JSONResponse<E>> {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}`)
    const data = await response.json()
    return new JSONResponse<E>(response, data)
  }

  async create(body: Partial<C>): Promise<JSONResponse<E>> {
    const response = await fetch(`${this.baseUrl}/${this.path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<E>(response, data)
  }

  async update(id: number, body: C): Promise<JSONResponse<E>> {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<E>(response, data)
  }

  async delete(id: number): Promise<void> {
    await fetch(`${this.baseUrl}/${this.path}/${id}`, {method: 'DELETE'})
  }
}

class EventRoute extends ApiRoute<EventDto, CreateEventDto> {
  async join(id: number) {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<EventDto>(response, data)
  }

  async leave(id: number) {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<EventDto>(response, data)
  }
}


export class ApiClient {
  baseURL = `${process.env.VUE_APP_BASE_URL}/api`
  events = new EventRoute(this.baseURL, 'events')
  campaign = new ApiRoute<EventDto, CreateEventDto>(this.baseURL, 'campaigns')
  user = new ApiRoute<UserDto, UserDto>(this.baseURL, 'users')
}
