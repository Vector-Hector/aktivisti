import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { PersonalMetricsDto } from 'src/api/model/PersonalMetricsDto'
import { APIEnvelope } from 'src/api/model/APIEnvelope'

export class PersonalMetricsRoute extends BaseApiRoute {
  async list() {
    const response = await this.request({
      method: 'GET',
      path: `${this.path}`
    })
    return new JSONResponse<APIEnvelope<PersonalMetricsDto>>(response, response.data)
  }
}
