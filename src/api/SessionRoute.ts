import { JSONResponse } from 'src/api/JSONResponse'
import { BaseApiRoute } from 'src/api/ApiRoute'
import { LoginDto } from 'src/api/model/LoginDto'

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
}
