import convertToFormData from '@/utils/convertToFormData'
import axios from 'axios'
import { JSONResponse } from './JSONResponse'
import { TokenDto } from './model/TokenDto'

interface OAuthTokenRequestParams {
    // grant_type: 'password'
    username: string
    password: string
    scope?: string
    client_id: string
}

export class OAuth2Client {
  baseURL = `${process.env.VUE_APP_BASE_URL}/oauth2/token`

  axiosInstance = axios.create({
    baseURL: this.baseURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  async token(params: OAuthTokenRequestParams): Promise<JSONResponse<TokenDto>> {
    const response = await this.axiosInstance(`${this.baseURL}`, {
      method: 'POST',
      data: convertToFormData(params)
    })
    const data = response.data
    return new JSONResponse<TokenDto>(response, data)
  }
}
