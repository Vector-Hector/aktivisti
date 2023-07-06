import { boot } from 'quasar/wrappers'
import { AxiosResponse } from 'axios'
import { apiClient } from 'src/api/ApiClient'
import { OAuth2Client } from 'src/api/OAuth2Client'
import { ErrorBus, NOT_AUTHORIZED, SESSION_INVALID } from 'src/utils/errorBus'
import { ApiClient } from 'src/api'
import { ErrorCode } from 'src/api/ErrorCode'
import { AuthType, getAuthStore, getAuthType } from 'src/store/AuthStore'
import { TokenAuthStore } from 'src/store/TokenAuthStore'
import { registerDevice } from 'src/utils/push-notification'

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
  if (
    error.response?.data?.code == ErrorCode.NOT_AUTHENTICATED &&
    authStore.state.tokenSet
  ) {
    // redo initial request with new access token
    try {
      await authStore.renewLogin()
    } catch (e) {
      return Promise.reject(error)
    }
    originalRequest.headers[
      'Authorization'
    ] = `Bearer ${authStore.state.tokenSet.access_token}`
    return apiClient.axiosInstance(originalRequest)
  } else {
    // all other request just fail regulary
    return Promise.reject(error)
  }
}

export default boot(async ({ app }) => {
  app.config.globalProperties.$apiClient = apiClient
  const authType = getAuthType()
  if (authType === AuthType.TOKEN) {
    await (authStore as TokenAuthStore).loadFromNativeStorage()
    apiClient.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => refreshOnErrorInterceptor(error)
    )
    try {
      const profileRequest = await apiClient.user.get('me')
      authStore.setUserId(profileRequest.payload.data.id)
    } catch (e) {
      // hydrating profile failed, not logged in
    }
  } else if (authType === AuthType.SESSION) {
    try {
      const sessionRequest = await apiClient.session.session()
      authStore.setUserId(sessionRequest.payload.data.user_id)

      if (!sessionRequest.payload.data.is_authenticated) return

      await registerDevice()
    } catch (e) {
      console.warn('Request to session failed, probably offline')
    }
  }
  apiClient.axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: any) => {
      if (error.response?.status === 403) {
        if (
          error.response?.data?.code === ErrorCode.NOT_AUTHENTICATED &&
          authStore.isLoggedIn()
        ) {
          // If the request is not authenticated our session expired
          authStore.setUserId(null)
          ErrorBus.emit(
            SESSION_INVALID,
            'Deine Sitzung ist abgelaufen, bitte melde dich erneut an'
          )
        } else {
          // Emit the permission problem on a global error bus
          ErrorBus.emit(
            NOT_AUTHORIZED,
            'Du hast nicht genügend Rechte, um die angefragte Seite zu lesen.'
          )
        }
      }
      // Ultimately reject the error
      return Promise.reject(error)
    }
  )
})
