import { boot } from 'quasar/wrappers'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { apiClient } from 'src/api/ApiClient'
import { OAuth2Client, oAuth2Client } from 'src/api/OAuth2Client'
import { tokenStore } from 'src/store/TokenStore'
import { ErrorBus, NOT_AUTHORIZED, SESSION_INVALID } from 'src/utils/errorBus'
import { ApiClient } from 'src/api'
import { ErrorCode } from 'src/api/ErrorCode'
import { authService } from 'src/api/authService'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $apiClient: ApiClient
    $oauth2Client: OAuth2Client
  }
}

export default boot(({app}) => {
  app.config.globalProperties.$apiClient = apiClient
  app.config.globalProperties.$oauth2Client = oAuth2Client

  apiClient.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
    return response
  }, async (error: any) => {
    if (error.response?.status === 403) {
      if (error.response?.data?.code === ErrorCode.NOT_AUTHENTICATED) {
        // If the request is not authenticated our session expired
        authService.clear()
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
