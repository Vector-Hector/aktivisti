import router from '@/router'
import { tokenStore } from '@/store/TokenStore'
import { userStore } from '@/store/UserStore' 
import { TokenDto } from './model/TokenDto'

const authService = {

  logout() {
    tokenStore.removeTokenDto()
    userStore.unsetData()
    router.push('/login')
  },

  login(token: TokenDto) {
    tokenStore.setTokenDto(token)
  },

  isLoggedIn() {
    return !!tokenStore.getTokenDto()
  }

}

export { authService }