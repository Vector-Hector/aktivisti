import router from '@/router'
import { tokenStore } from '@/store/TokenStore'
import { userStore } from '@/store/UserStore'
import { apiClient } from '@/api/ApiClient'
import { GrantType, oAuth2Client, OAuthTokenRequestParams } from '@/api/OAuth2Client'
import { trackingSessionStore } from '@/store/TrackingSessionStore'

class AuthService {

  logout() {
    this.clear()
    router.push('/login')
  }

  clear() {
    tokenStore.removeTokenDto()
    userStore.clearUser()
    trackingSessionStore.clear()
  }

  async auth(params: OAuthTokenRequestParams, saveRefreshToken = false) {
    const authRequest = await oAuth2Client.token(params)
    if (!saveRefreshToken) {
      // do not persist the refresh token
      delete authRequest.payload.refresh_token
    }
    tokenStore.setTokenDto(authRequest.payload)
    const profileRequest = await apiClient.user.get('me')
    userStore.setUser(profileRequest.payload.data)
  }

  async login(username: string, password: string, saveRefreshToken = false) {
    const userParams = {
      grant_type: 'password' as GrantType,
      username: username,
      password: password,
      client_id: process.env.VUE_APP_CLIENT_ID
    }
    await this.auth(userParams, saveRefreshToken)
  }

  async renewLogin() {
    const params = {
      grant_type: 'refresh_token' as GrantType,
      refresh_token: tokenStore.getTokenDto()?.refresh_token,
      client_id: process.env.VUE_APP_CLIENT_ID
    }
    try {
      await this.auth(params)
    } catch (e) {
      // renewal failed, clear faulty credentials
      this.clear()
    }
  }

  isLoggedIn() {
    return !!tokenStore.getTokenDto()
  }

}

export const authService = new AuthService()
