import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { ReportActiveUsersDto } from 'src/api/model/ReportActiveUsersDto'

export class ReportActiveUsersRoute extends BaseApiRoute {
  async list(query: { [key: string]: any } = {}) {
    const response = await this.request({
      method: 'GET',
      query,
      path: `${this.path}`
    })
    return new JSONResponse<APIEnvelope<ReportActiveUsersDto[]>>(
      response,
      response.data
    )
  }
}
