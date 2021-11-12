import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { ChangeEmailRequestDto } from 'src/api/model/ChangeEmailRequestDto'
import { ChangePasswordDto } from 'src/api/model/ChangePasswordDto'
import { ChangeUsernameRequestDto } from 'src/api/model/ChangeUsernameRequestDto'


export class AccountRoute extends BaseApiRoute {
  async changePassword(data: ChangePasswordDto): Promise<JSONResponse<null>> {
    const response = await this.request({
      path: `${this.path}change-password/`,
      method: 'POST',
      data
    })
    return new JSONResponse(response, null)
  }

  async changeEmail(data: ChangeEmailRequestDto) {
    const response = await this.request({
      path: `${this.path}change-email/`,
      method: 'POST',
      data
    })
    return new JSONResponse<ChangeEmailRequestDto>(response, response.data)
  }

  async changeUsername(data: ChangeUsernameRequestDto) {
    const response = await this.request({
      path: `${this.path}change-username/`,
      method: 'POST',
      data
    })
    return new JSONResponse(response, null)
  }
}
