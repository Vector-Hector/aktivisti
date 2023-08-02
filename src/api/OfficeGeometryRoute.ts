import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { OfficeGeoJsonDto } from 'src/api/model/OfficeGeoJsonDto'

export class OfficeGeometryRoute extends BaseApiRoute {
  async list(query: { [key: string]: any } = {}) {
    const response = await this.request({
      method: 'GET',
      query,
      path: `${this.path}`
    })
    return new JSONResponse<APIEnvelope<OfficeGeoJsonDto>>(
      response,
      response.data
    )
  }
}
