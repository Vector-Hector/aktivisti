import router from '@/router'
import { tokenService } from '@/store/TokenService'
import { userStore } from '@/store/UserStore' 

const authService = {

  logout() {
    tokenService.removeAllData()
    userStore.unsetData()
    router.push('/login')
  },

  login() {
    // TODO
  }

}

export { authService }