import { boot } from 'quasar/wrappers'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { apiClient } from 'src/api/ApiClient'
import { OAuth2Client } from 'src/api/OAuth2Client'
import { tokenStore } from 'src/store/TokenStore'
import { ErrorBus, NOT_AUTHORIZED, SESSION_INVALID } from 'src/utils/errorBus'
import { ApiClient } from 'src/api'
import { ErrorCode } from 'src/api/ErrorCode'
import { authStore } from 'src/api/authStore'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $apiClient: ApiClient
    $oauth2Client: OAuth2Client
  }
}

export default boot(async ({app}) => {
  app.config.globalProperties.$apiClient = apiClient
  try {
    const sessionRequest = await apiClient.session.session()
    authStore.setLoggedIn(sessionRequest.payload.data.is_authenticated)
  } catch (e) {
    console.warn('Request to session failed, probably offline')
  }
  apiClient.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
    return response
  }, async (error: any) => {
    if (error.response?.status === 403) {
      if (error.response?.data?.code === ErrorCode.NOT_AUTHENTICATED) {
        // If the request is not authenticated our session expired
        authStore.setLoggedIn(false)
        ErrorBus.emit(SESSION_INVALID, 'Ihre Sitzung ist abgelaufen, bitte loggen Sie sich erneut ein')
      } else {
        // Emit the permission problem on a global error bus
        ErrorBus.emit(NOT_AUTHORIZED, 'Sie haben nicht genügend Rechte, um die angefragte Seite zu lesen.')
      }
    }
    // Ultimately reject the error
    return Promise.reject(error)
  })

  apiClient.axiosInstance.interceptors.request.use((request: AxiosRequestConfig) => {
    if (tokenStore.getTokenDto() !== null) {
      request.headers = {
        ...request.headers,
        'Authorization': `Bearer ${tokenStore.getTokenDto()!.access_token}`
      }
    }
    return request
  })

})
