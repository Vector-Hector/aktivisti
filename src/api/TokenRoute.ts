import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { ApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { EventMetricReportDto } from 'src/api/model/EventMetricReportDto';
import { TokenReviewDto } from 'src/api/model/TokenReviewDto'

/**
 * A class extending {@link ApiRoute} to implement some extra non-standard operations (report)
 */
export class TokenRoute extends ApiRoute<TokenReviewDto> {

  async revokeAll() {
    const response = await  this.request({
      path: `${this.path}revoke-all/`,
      method: 'DELETE'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventMetricReportDto>>(response, data)
  }
}
