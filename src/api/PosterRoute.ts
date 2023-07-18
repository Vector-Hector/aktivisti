import { JSONResponse } from 'src/api/JSONResponse'
import { FeatureCollection } from 'geojson'
import { ApiRoute } from 'src/api/ApiRoute'
import { PosterDto } from 'src/api/model/PosterDto'
import { APIEnvelope } from 'src/api/model/APIEnvelope'

export class PosterRoute extends ApiRoute<PosterDto> {
  async export(
    query: { [key: string]: any } = {}
  ): Promise<JSONResponse<APIEnvelope<FeatureCollection>>> {
    const response = await this.request({
      path: `${this.path}export/`,
      query,
      method: 'GET'
    })
    return new JSONResponse<APIEnvelope<FeatureCollection>>(
      response,
      response.data
    )
  }

  async import(data: FeatureCollection): Promise<void> {
    await this.request({
      path: `${this.path}import/`,
      data: data,
      method: 'POST'
    })
  }
}
