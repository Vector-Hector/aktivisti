import { APIEnvelope } from '@/api/model/APIEnvelope'
import { ApiRoute } from '@/api/ApiRoute'
import { JSONResponse } from '@/api/JSONResponse'
import { EventMetricReportDto } from "@/api/model/EventMetricReportDto";
import { EventAreaDto } from "@/api/model/EventAreaDto";

/**
 * A class extending {@link ApiRoute} to implement some extra non-standard operations (report)
 */
export class EventAreaRoute extends ApiRoute<EventAreaDto> {

  async report(id: number) {
    const response = await  this.axiosInstance(`${this.baseUrl}/${this.path}${id.toString()}/report/`, {
      method: 'GET'
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<EventMetricReportDto>>(response, data)
  }
}
