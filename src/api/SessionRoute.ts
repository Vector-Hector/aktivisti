import { JSONResponse } from 'src/api/JSONResponse'
import { BaseApiRoute } from 'src/api/ApiRoute'
import { LoginDto } from 'src/api/model/LoginDto'
import { APIEnvelope } from 'src/api/model/APIEnvelope'
import { SessionDto } from 'src/api/model/SessionDto'

export class SessionRoute extends BaseApiRoute {


  async login(payload: LoginDto): Promise<JSONResponse<undefined>> {
    const response = await this.request({
      path: `${this.path}login/`,
      method: 'POST',
      data: payload
    })
    return new JSONResponse(response, undefined)
  }

  async logout(): Promise<JSONResponse<undefined>> {
    const response = await this.request({
      path: `${this.path}logout/`,
      method: 'POST'
    })
    return new JSONResponse(response, undefined)
  }

  async session(): Promise<JSONResponse<APIEnvelope<SessionDto>>> {
    const response = await this.request({
      path: `${this.path}session/`,
      method: 'GET'
    })
    return new JSONResponse(response, response.data)
  }
}
