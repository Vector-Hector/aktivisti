import { APIEnvelope } from '@/api/model/APIEnvelope'
import { JSONResponse } from '@/api/JSONResponse'
import { userStore } from '@/store/UserStore'

/**
 * Generic CRUD operation definitions for a route
 * @template T Is the entities datatype this route is operating on
 * @template E Is the response format for a single entity, defaults to an enveloped T
 * @template L Is the response format for a list of entities, defaults to an enveloped T[]
 */
export class ApiRoute<T, E = APIEnvelope<T>, L = APIEnvelope<T[]>> {
  constructor(protected baseUrl: string, protected path: string) {
  }

  async list(query: { [key: string]: any } = {}): Promise<JSONResponse<L>> {
    const url = new URL(`${this.baseUrl}/${this.path}`)
    Object.keys(query).forEach(key => url.searchParams.append(key, query[key]))
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${userStore.getToken()}`
      }
    })
    const data = await response.json()
    return new JSONResponse<L>(response, data)
  }

  async get(id: string): Promise<JSONResponse<E>> {
    const response = await fetch(`${this.baseUrl}/${this.path}/${id}`, {
      headers: {
        'Authorization': `Bearer ${userStore.getToken()}`
      }
    })
    const data = await response.json()
    return new JSONResponse<E>(response, data)
  }

  async create(body: Partial<T>): Promise<JSONResponse<E>> {
    const response = await fetch(`${this.baseUrl}/${this.path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${userStore.getToken()}`,
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
        'Authorization': `Bearer ${userStore.getToken()}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return new JSONResponse<E>(response, data)
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${this.path}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userStore.getToken()}`
      }
    })
  }
}
