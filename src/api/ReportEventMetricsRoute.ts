import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { ReportEventMetricsDto } from 'src/api/model/ReportEventMetricsDto'

export class ReportEventMetricsRoute extends BaseApiRoute {
  async list(query: {[key: string]: any} = {}) {
    const response = await this.request({
      method: 'GET',
      query,
      path: `${this.path}`
    })
    return new JSONResponse<APIEnvelope<ReportEventMetricsDto[]>>(response, response.data)
  }
}
