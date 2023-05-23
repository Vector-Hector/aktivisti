import convertToFormData from 'src/utils/convertToFormData'
import axios from 'axios'
import { JSONResponse } from './JSONResponse'
import { TokenDto } from './model/TokenDto'

export type GrantType = 'password' | 'refresh_token'

export interface OAuthTokenRequestParams {
  grant_type: GrantType
  refresh_token?: string
  username?: string
  password?: string
  scope?: string
  client_id: string
}

export class OAuth2Client {
  baseURL = `${process.env.APP_AUTH_URL}/token/`

  axiosInstance = axios.create({
    baseURL: this.baseURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  async token(
    params: OAuthTokenRequestParams
  ): Promise<JSONResponse<TokenDto>> {
    const response = await this.axiosInstance(`${this.baseURL}`, {
      method: 'POST',
      data: convertToFormData(params)
    })
    const data = response.data
    return new JSONResponse<TokenDto>(response, data)
  }
}

export const oAuth2Client = new OAuth2Client()
