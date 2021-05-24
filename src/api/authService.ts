import { tokenStore } from 'src/store/TokenStore'
import { userStore } from 'src/store/UserStore'
import { apiClient } from 'src/api/ApiClient'
import { GrantType, oAuth2Client, OAuthTokenRequestParams } from 'src/api/OAuth2Client'
import { trackingSessionStore } from 'src/store/TrackingSessionStore'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

class AuthService {

  logout() {
    this.clear()
  }

  clear() {
    tokenStore.removeTokenDto()
    userStore.clear()
    trackingSessionStore.clear()
  }

  async auth(params: OAuthTokenRequestParams, saveRefreshToken = false) {
    const authRequest = await oAuth2Client.token(params)
    if (!saveRefreshToken) {
      // do not persist the refresh token
      delete authRequest.payload.refresh_token
    }
    tokenStore.setTokenDto(authRequest.payload)
    const profileRequest = await apiClient.user.get('me', ['sub_association'])
    userStore.setUser(profileRequest.payload.data)
    userStore.setHomeAssociation(profileRequest.payload.embedded.sub_association?.[0] ?? null)
  }

  async login(username: string, password: string, saveRefreshToken = false) {
    const userParams = {
      grant_type: 'password' as GrantType,
      username: username,
      password: password,
      client_id: process.env.VUE_APP_CLIENT_ID!
    }
    await this.auth(userParams, saveRefreshToken)

    const center = userStore.getState().homeAssociation?.center
    // when loggin in set the map on the bbox of the home association
    if (center) {
      userStore.setBbox(bbox(circle([center.lng, center.lat], 2)) as BBox2d)
    }
  }

  async renewLogin() {
    const params = {
      grant_type: 'refresh_token' as GrantType,
      refresh_token: tokenStore.getTokenDto()?.refresh_token,
      client_id: process.env.VUE_APP_CLIENT_ID!
    }
    try {
      await this.auth(params, true)
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
