import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { ReportEventDto } from 'src/api/model/ReportEventDto'

export class ReportEventsRoute extends BaseApiRoute {
  async list(query: { [key: string]: any } = {}) {
    const response = await this.request({
      method: 'GET',
      query,
      path: `${this.path}`
    })
    return new JSONResponse<APIEnvelope<ReportEventDto[]>>(
      response,
      response.data
    )
  }
}
