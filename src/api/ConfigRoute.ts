import { JSONResponse } from 'src/api/JSONResponse'
import { BaseApiRoute } from 'src/api/ApiRoute'
import { ConfigDto } from 'src/api/model/ConfigDto'
import { APIEnvelope } from 'src/api/model/APIEnvelope'

export class ConfigRoute extends BaseApiRoute {
  async get(query: { [key: string]: any } = {}): Promise<JSONResponse<APIEnvelope<ConfigDto>>> {
    const response = await this.request({
      path: this.path,
      method: 'GET',
      query,
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<ConfigDto>>(response, data)
  }
}
