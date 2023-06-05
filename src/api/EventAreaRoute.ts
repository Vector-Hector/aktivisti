import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { ApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { EventMetricReportDto } from 'src/api/model/EventMetricReportDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'

/**
 * A class extending {@link ApiRoute} to implement some extra non-standard operations (report)
 */
export class EventAreaRoute extends ApiRoute<EventAreaDto> {
  async report(id: number) {
    const response = await this.request({
      path: `${this.path}${id.toString()}/report/`,
      method: 'GET'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventMetricReportDto>>(response, data)
  }
}
