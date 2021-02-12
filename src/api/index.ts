import { EventDto } from '@/api/model/EventDto'
import { UserDto } from '@/api/model/UserDto'
import { OSMPlaceDto } from '@/api/model/OSMPlaceDto'
import { CampaignDto } from '@/api/model/CampaignDto'
import { APIEnvelope } from '@/api/model/APIEnvelope'
import { OrganizationTypeDto } from '@/api/model/OrganizationTypeDto'
import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'
import { AreaDetailsDto } from '@/api/model/AreaDetailsDto'
import { Geometry } from 'geojson'
import { EventAreaDto } from '@/api/model/EventAreaDto'

class JSONResponse<T> {
  constructor(public response: Response, public payload: T) {
  }
}

/**
 * Generic CRUD operation definitions for a route
 * @template T Is the entities datatype this route is operating on
 * @template E Is the response format for a single entity, defaults to an enveloped T
 * @template L Is the response format for a list of entities, defaults to an enveloped T[]
 */
class ApiRoute<T, E = APIEnvelope<T>, L = APIEnvelope<T[]>> {
  constructor(protected baseUrl: string, protected path: string) {
  }

  async list(query: { [key: string]: any } = {}): Promise<JSONResponse<L>> {
    const url = new URL(`${this.baseUrl}/${this.path}`)
    Object.keys(query).forEach(key => url.searchParams.append(key, query[key]))
    const response = await fetch(url.toString())
    const data = await response.json()
    return new JSONResponse<L>(response, data)
  }

  async get(id: string): Promise<JSONResponse<E>> {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}`)
    const data = await response.json()
    return new JSONResponse<E>(response, data)
  }

  async create(body: Partial<T>): Promise<JSONResponse<E>> {
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

  async update(id: string, body: T): Promise<JSONResponse<E>> {
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

  async delete(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${this.path}/${id}`, {method: 'DELETE'})
  }
}

class EventRoute extends ApiRoute<EventDto> {
  async join(id: string) {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }

  async leave(id: string) {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<APIEnvelope<EventDto>>(response, data)
  }
}

export class ApiClient {
  baseURL = `${process.env.VUE_APP_BASE_URL}`

  events = new EventRoute(this.baseURL, 'events')
  campaign = new ApiRoute<CampaignDto>(this.baseURL, 'campaigns')
  user = new ApiRoute<UserDto>(this.baseURL, 'users')
  places = new ApiRoute<OSMPlaceDto>(this.baseURL, 'geocoding/places')
  eventAreas = new ApiRoute<EventAreaDto>(this.baseURL, 'event-areas')
  campaignTypes = new ApiRoute<CampaignTypeDto>(this.baseURL, 'campaign-types')
  organizationTypes = new ApiRoute<OrganizationTypeDto>(this.baseURL, 'organization-types')
}
