import { boot } from 'quasar/wrappers'
import { authService } from 'src/api/authService'
import { apiClient } from 'src/api/ApiClient'
import { userStore } from 'src/store/UserStore'

export default boot(async () => {
// hydrate profile on app start
  if (authService.isLoggedIn()) {
    try {
      const [profileRequest, permissionRequest] = await Promise.all([
        apiClient.user.get('me', ['sub_association']),
        apiClient.userPermissions.list()
      ])
      userStore.setUser(profileRequest.payload.data)
      userStore.setHomeAssociation(profileRequest.payload.embedded?.sub_association?.[0] ?? null)
      userStore.setPermissions(permissionRequest.payload.data)
    } catch (error: any) {
      console.log(error)
      if (error.status === 403) {
        authService.clear()
      }
    }
  }
})
