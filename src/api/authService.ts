import router from '@/router'
import { tokenStore } from '@/store/TokenStore'
import { userStore } from '@/store/UserStore'
import { TokenDto } from './model/TokenDto'
import { apiClient } from '@/api/ApiClient'
import { GrantType, oAuth2Client } from '@/api/OAuth2Client'

const authService = {

  logout() {
    tokenStore.removeTokenDto()
    userStore.clearUser()
    router.push('/login')
  },

  async login(username: string, password: string) {
    const userParams = {
      grant_type: 'password' as GrantType,
      username: username,
      password: password,
      client_id: process.env.VUE_APP_CLIENT_ID
    }
    const authRequest = await oAuth2Client.token(userParams)
    tokenStore.setTokenDto(authRequest.payload)
    const profileRequest = await apiClient.user.get('me')
    userStore.setUser(profileRequest.payload.data)
  },

  isLoggedIn() {
    return !!tokenStore.getTokenDto()
  }

}

export { authService }
