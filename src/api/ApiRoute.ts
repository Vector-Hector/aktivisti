import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { JSONResponse } from 'src/api/JSONResponse'
import { AxiosInstance, Method } from 'axios'
import { appendAsQueryParams } from 'src/utils/url'
import { Cookies } from 'quasar'
import { AuthType, getAuthStore, getAuthType } from 'src/store/AuthStore'
import { TokenAuthStore } from 'src/store/TokenAuthStore'
import { VERSION_CODE } from 'src/utils/version'

interface RequestConfig {
  path: string
  method: Method
  embed?: string[]
  query?: { [key: string]: string[] | string | number | number[] }
  data?: any
  omitCsrf?: boolean
}
/**
 * Shared definitions across api endpoint classes
 */
export class BaseApiRoute {
  constructor(
    protected baseUrl: string,
    protected path: string,
    protected axiosInstance: AxiosInstance
  ) {}

  protected request(config: RequestConfig) {
    const url = new URL(`${this.baseUrl}/${config.path}`)
    if (config.embed?.length) {
      appendAsQueryParams(url, { embed: config.embed })
    }
    if (config.query) {
      appendAsQueryParams(url, config.query)
    }

    const headers: Record<string, string> = {
      // TODO: For now we will fix the accept language header to german, as the frontend is localized to german
      'Accept-Language': 'de'
    }
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(config.method)) {
      if (!config.omitCsrf) {
        headers['x-csrftoken'] = Cookies.get('csrftoken')
      }
    }

    if (getAuthType() === AuthType.TOKEN) {
      const authStore = getAuthStore() as TokenAuthStore
      if (authStore.state.tokenSet) {
        headers[
          'Authorization'
        ] = `Bearer ${authStore.state.tokenSet.access_token}`
      }
    }

    headers['X-App-Version'] = VERSION_CODE.toString()

    return this.axiosInstance(url.toString(), {
      method: config.method,
      data: config.data ? JSON.stringify(config.data) : undefined,
      withCredentials: getAuthType() === AuthType.SESSION,
      headers
    })
  }
}

/**
 * Generic CRUD operation definitions for a route
 * @template T Is the entities datatype this route is operating on
 * @template E Is the response format for a single entity, defaults to an enveloped T
 * @template L Is the response format for a list of entities, defaults to an enveloped T[]
 */
export class ApiRoute<
  T,
  E = APIEnvelope<T>,
  L = APIEnvelope<T[]>
> extends BaseApiRoute {
  async list(
    query: { [key: string]: any } = {},
    embed: string[] = []
  ): Promise<JSONResponse<L>> {
    const response = await this.request({
      path: this.path,
      method: 'GET',
      query,
      embed
    })
    const data = response.data
    return new JSONResponse<L>(response, data)
  }

  async get(
    id: string,
    embed: string[] = [],
    query: { [key: string]: any } = {}
  ): Promise<JSONResponse<E>> {
    const response = await this.request({
      path: `${this.path}${id}/`,
      method: 'GET',
      query,
      embed
    })
    const data = response.data
    return new JSONResponse<E>(response, data)
  }

  async create(
    body: Partial<T>,
    embed: string[] = []
  ): Promise<JSONResponse<E>> {
    const response = await this.request({
      path: this.path,
      method: 'POST',
      data: body,
      embed
    })
    const data = response.data
    return new JSONResponse<E>(response, data)
  }

  async update(
    id: string,
    body: T,
    embed: string[] = []
  ): Promise<JSONResponse<E>> {
    const response = await this.request({
      path: `${this.path}${id}/`,
      method: 'PUT',
      data: body,
      embed
    })
    const data = response.data
    return new JSONResponse<E>(response, data)
  }

  async patch(
    id: string,
    body: Partial<T>,
    embed: string[] = []
  ): Promise<JSONResponse<E>> {
    const response = await this.request({
      path: `${this.path}${id}/`,
      method: 'PATCH',
      data: body,
      embed
    })
    const data = response.data
    return new JSONResponse<E>(response, data)
  }

  async delete(id: string): Promise<void> {
    await this.request({
      path: `${this.path}${id}/`,
      method: 'DELETE'
    })
  }
}
