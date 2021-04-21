import router from '@/router'
import { tokenStore } from '@/store/TokenStore'
import { userStore } from '@/store/UserStore'
import { apiClient } from '@/api/ApiClient'
import { GrantType, oAuth2Client, OAuthTokenRequestParams } from '@/api/OAuth2Client'
import { trackingSessionStore } from '@/store/TrackingSessionStore'

const authService = {

  logout() {
    this.clear()
    router.push('/login')
  },

  clear() {
    tokenStore.removeTokenDto()
    userStore.clearUser()
    trackingSessionStore.clear()
  },

  async auth(params: OAuthTokenRequestParams) {
    const authRequest = await oAuth2Client.token(params)
    tokenStore.setTokenDto(authRequest.payload)
    const profileRequest = await apiClient.user.get('me')
    userStore.setUser(profileRequest.payload.data)
  },

  login(username: string, password: string) {
    const userParams = {
      grant_type: 'password' as GrantType,
      username: username,
      password: password,
      client_id: process.env.VUE_APP_CLIENT_ID
    }
    this.auth(userParams)
  },

  renewLogin() {
    const params = {
      grant_type: 'refresh_token' as GrantType,
      refresh_token: tokenStore.getTokenDto()?.refresh_token,
      client_id: process.env.VUE_APP_CLIENT_ID
    }
    this.auth(params)
  },

  isLoggedIn() {
    return !!tokenStore.getTokenDto()
  }

}

export { authService }
