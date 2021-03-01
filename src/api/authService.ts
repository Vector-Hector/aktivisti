import router from '@/router'
import { tokenService } from '@/store/TokenService'
import { userStore } from '@/store/UserStore' 
import { TokenDto } from './model/TokenDto'

const authService = {

  logout() {
    tokenService.removeAllData()
    userStore.unsetData()
    router.push('/login')
  },

  login(token: TokenDto) {
    tokenService.setToken('access_token', token.access_token)
    tokenService.setToken('refresh_token', token.refresh_token)
    tokenService.setExpiry(new Date().getTime() + token.expires_in)

    userStore.setToken(token.access_token)
    // TODO 
  },

  isLoggedIn() {
    return !!tokenService.getToken('access_token')
  }

}

export { authService }