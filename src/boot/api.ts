import { boot } from 'quasar/wrappers'
import { AxiosResponse } from 'axios'
import { apiClient } from 'src/api/ApiClient'
import { OAuth2Client } from 'src/api/OAuth2Client'
import { ErrorBus, NOT_AUTHORIZED, SESSION_INVALID } from 'src/utils/errorBus'
import { ApiClient } from 'src/api'
import { ErrorCode } from 'src/api/ErrorCode'
import { AuthType, getAuthStore, getAuthType } from 'src/store/AuthStore'
import { TokenAuthStore } from 'src/store/TokenAuthStore'

const authStore = getAuthStore()

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $apiClient: ApiClient
    $oauth2Client: OAuth2Client
  }
}

async function refreshOnErrorInterceptor(error: any) {
  const authStore = getAuthStore() as TokenAuthStore
  const originalRequest = error.config
  const expiryDate = authStore.expiryDate()
  if ((error.response?.status === 403 || error.response?.status === 401) && expiryDate && new Date() > expiryDate) {
    try {
      await authStore.renewLogin()
    } catch (e) {
      return Promise.reject(error)
    }
    // redo initial request
    return apiClient.axiosInstance(originalRequest)
  } else {

    // all other request just fail regulary
    return Promise.reject(error)
  }
}

export default boot(async ({app}) => {

  app.config.globalProperties.$apiClient = apiClient
  const authType = getAuthType()
  if (authType === AuthType.TOKEN) {
    await (authStore as TokenAuthStore).loadFromNativeStorage()
    try {
      const profileRequest = await apiClient.user.get('me')
      authStore.setUserId(profileRequest.payload.data.id)
    } catch (e) {
      // hydrating profile failed, not logged in
    }
    apiClient.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => refreshOnErrorInterceptor(error)
    )
  } else if (authType === AuthType.SESSION) {
    try {
      const sessionRequest = await apiClient.session.session()
      authStore.setUserId(sessionRequest.payload.data.user_id)
    } catch (e) {
      console.warn('Request to session failed, probably offline')
    }
  }
  apiClient.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
    return response
  }, async (error: any) => {
    if (error.response?.status === 403) {
      if (error.response?.data?.code === ErrorCode.NOT_AUTHENTICATED && authStore.isLoggedIn()) {
        // If the request is not authenticated our session expired
        authStore.setUserId(null)
        ErrorBus.emit(SESSION_INVALID, 'Deine Sitzung ist abgelaufen, bitte logge dich erneut ein')
      } else {
        // Emit the permission problem on a global error bus
        ErrorBus.emit(NOT_AUTHORIZED, 'Du hast nicht genügend Rechte, um die angefragte Seite zu lesen.')
      }
    }
    // Ultimately reject the error
    return Promise.reject(error)
  })


})
