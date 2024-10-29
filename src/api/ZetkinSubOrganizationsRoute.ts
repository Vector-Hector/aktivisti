import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { SubOrganizationDto } from './model/SubOrganizationDto'
import { OrganizationDto } from './model/OrganizationDto'

export class ZetkinSubOrganizationsRoute extends BaseApiRoute {
  async list(query: { [key: string]: any } = {}, embed: string[] = []) {
    const response = await this.request({
      method: 'GET',
      query,
      path: `${this.path}`,
      embed
    })
    return new JSONResponse<
      APIEnvelope<SubOrganizationDto[], { organization: OrganizationDto[] }>
    >(response, response.data)
  }
}
