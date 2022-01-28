import { JSONResponse } from 'src/api/JSONResponse'
import { BaseApiRoute } from 'src/api/ApiRoute'
import { ContactDto } from 'src/api/model/ContactDto'
import { APIEnvelope } from 'src/api/model/APIEnvelope'

export class ContactRoute extends BaseApiRoute {
  async post(body: ContactDto): Promise<JSONResponse<APIEnvelope<ContactDto>>> {
    const response = await this.request({
      path: this.path,
      method: 'POST',
      data: body,
    })
    const data = response.data
    return new JSONResponse<APIEnvelope<ContactDto>>(response, data)
  }
}
