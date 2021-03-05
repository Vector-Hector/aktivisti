import { APIEnvelope } from '@/api/model/APIEnvelope'
import { JSONResponse } from '@/api/JSONResponse'
import { AxiosInstance, Method } from 'axios'
import { appendAsQueryParams } from '@/utils/url'

interface RequestConfig {
  path: string,
  method: Method,
  embed?: string[],
  query?: { [key: string]: string[] | string | number | number[] }
  data?: any
}

/**
 * Generic CRUD operation definitions for a route
 * @template T Is the entities datatype this route is operating on
 * @template E Is the response format for a single entity, defaults to an enveloped T
 * @template L Is the response format for a list of entities, defaults to an enveloped T[]
 */
export class ApiRoute<T, E = APIEnvelope<T>, L = APIEnvelope<T[]>> {
  constructor(protected baseUrl: string, protected path: string, protected axiosInstance: AxiosInstance) {
  }

  async list(query: { [key: string]: any } = {}, embed: string[] = []): Promise<JSONResponse<L>> {

    const response = await this.request({
      path: this.path,
      method: 'GET',
      query,
      embed,
    })
    const data = response.data
    return new JSONResponse<L>(response, data)
  }

  async get(id: string, embed: string[] = []): Promise<JSONResponse<E>> {
    const response = await this.request({
      path: `${this.path}${id}`,
      method: 'GET',
      embed
    })
    const data = response.data
    return new JSONResponse<E>(response, data)
  }

  async create(body: Partial<T>): Promise<JSONResponse<E>> {
    const response = await this.request({
      path: this.path,
      method: 'POST',
      data: body
    })
    const data = response.data
    return new JSONResponse<E>(response, data)
  }

  async update(id: string, body: T): Promise<JSONResponse<E>> {
    const response = await this.request({
      path: `${this.path}${id}/`,
      method: 'PUT',
      data: body
    })
    const data = response.data
    return new JSONResponse<E>(response, data)
  }

  async delete(id: string): Promise<void> {
    await this.request({
      path: `${this.path}/${id}`,
      method: 'DELETE'
    })
  }

  protected request(config: RequestConfig) {
    const url = new URL(`${this.baseUrl}/${config.path}`)
    if (config.embed?.length) {
      appendAsQueryParams(url, { embed: config.embed })
    }
    if (config.query) {
      appendAsQueryParams(url, config.query)
    }
    return this.axiosInstance(url.toString(), {
      method: config.method,
      data: config.data ? JSON.stringify(config.data) : undefined
    })
  }
}
