import { boot } from 'quasar/wrappers'
import { authService } from 'src/api/authService'
import { apiClient } from 'src/api/ApiClient'
import { userStore } from 'src/store/UserStore'

export default boot(async () => {
// hydrate profile on app start
  if (authService.isLoggedIn()) {
    try {
      const profileRequest = await apiClient.user.get('me')
      userStore.setUser(profileRequest.payload.data)

    } catch (error) {
      if (error.status === 403) {
        authService.clear()
      }
    }
  }
})
