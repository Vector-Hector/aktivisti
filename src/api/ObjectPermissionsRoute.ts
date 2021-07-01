import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { ObjectPermissionDto } from 'src/api/model/ObjectPermissionDto'
import { APIEnvelope } from 'src/api/model/APIEnvelope'


export class ObjectPermissionsRoute extends BaseApiRoute {
  async get(query: { [key: string]: any } = {}): Promise<JSONResponse<APIEnvelope<ObjectPermissionDto>>> {
    const response = await this.request({
      path: this.path,
      method: 'GET',
      query
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<ObjectPermissionDto>>(response, data)
  }
}
