import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { EventGeoJsonDto } from 'src/api/model/EventGeoJsonDto'

export class EventGeometryRoute extends BaseApiRoute {
  async list(query: { [key: string]: any } = {}) {
    const response = await this.request({
      method: 'GET',
      query,
      path: `${this.path}`
    })
    return new JSONResponse<APIEnvelope<EventGeoJsonDto>>(
      response,
      response.data
    )
  }
}
