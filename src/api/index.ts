import { EventDto } from '@/api/model/EventDto'
import { UserDto } from '@/api/model/UserDto'
import { CampaignDto } from '@/api/model/CampaignDto'
import { APIResponse } from '@/api/model/APIResponse'
import { OrganizationTypeDto } from '@/api/model/OrganizationTypeDto'
import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'

class JSONResponse<T> {
  constructor(public response: Response, public payload: T) {
  }
}

/**
 * Generic CRUD operation definitions for a route
 * First Generic E is the interface as returned by server
 * Second Generic C is the interface for creating or updating entities
 */
class ApiRoute<L, G, C> {
  constructor(protected baseUrl: string, protected path: string) {
  }

  async list(query: { [key: string]: any } = {}): Promise<JSONResponse<L>> {
    const url = new URL(`${this.baseUrl}/${this.path}`)
    Object.keys(query).forEach(key => url.searchParams.append(key, query[key]))
    const response = await fetch(url.toString())
    const data = await response.json()
    return new JSONResponse<L>(response, data)
  }

  async get(id: string): Promise<JSONResponse<G>> {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}`)
    const data = await response.json()
    return new JSONResponse<G>(response, data)
  }

  async create(body: Partial<C>): Promise<JSONResponse<G>> {
    const response = await fetch(`${this.baseUrl}/${this.path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<G>(response, data)
  }

  async update(id: string, body: C): Promise<JSONResponse<G>> {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<G>(response, data)
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${this.path}/${id}`, {method: 'DELETE'})
  }
}

class EventRoute extends ApiRoute<APIResponse<EventDto[]>, APIResponse<EventDto>, EventDto> {
  async join(id: string) {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<APIResponse<EventDto>>(response, data)
  }

  async leave(id: string) {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<APIResponse<EventDto>>(response, data)
  }
}


export class ApiClient {
  baseURL = `${process.env.VUE_APP_BASE_URL}`

  events = new EventRoute(this.baseURL, 'events')
  campaign = new ApiRoute<APIResponse<CampaignDto[]>, APIResponse<CampaignDto>, CampaignDto>(this.baseURL, 'campaigns')
  user = new ApiRoute<APIResponse<UserDto[]>, APIResponse<UserDto>, UserDto>(this.baseURL, 'users')
  campaignTypes = new ApiRoute<APIResponse<CampaignTypeDto[]>, APIResponse<CampaignTypeDto>, CampaignTypeDto>(this.baseURL, 'campaign-types')
  organizationTypes = new ApiRoute<APIResponse<OrganizationTypeDto[]>, APIResponse<OrganizationTypeDto>, OrganizationTypeDto>(this.baseURL, 'organization-types')
}
