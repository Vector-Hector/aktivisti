import { BaseApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'
import { ChangeEmailRequestDto } from 'src/api/model/ChangeEmailRequestDto'
import { ChangePasswordDto } from 'src/api/model/ChangePasswordDto'
import { ChangeUsernameRequestDto } from 'src/api/model/ChangeUsernameRequestDto'
import { RegisterDeviceDto } from './model/RegisterDeviceDto'
import { DeregisterDeviceDto } from './model/DeregisterDeviceDto'
import { VapidTokenDto } from './model/VapidTokenDto'

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

  async getToken() {
    const response = await this.request({
      path: `${this.path}token/`,
      method: 'GET'
    })
    return new JSONResponse<VapidTokenDto>(response, response.data)
  }

  async registerDevice(data: RegisterDeviceDto) {
    const response = await this.request({
      path: `${this.path}register-device/`,
      method: 'POST',
      data
    })
    return new JSONResponse(response, null)
  }

  async unregisterDevice(data: DeregisterDeviceDto) {
    const response = await this.request({
      path: `${this.path}unregister-device/`,
      method: 'POST',
      data
    })
    return new JSONResponse(response, null)
  }
}
