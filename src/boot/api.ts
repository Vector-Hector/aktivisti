import { boot } from 'quasar/wrappers'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { apiClient } from 'src/api/ApiClient'
import { OAuth2Client, oAuth2Client } from 'src/api/OAuth2Client'
import { tokenStore } from 'src/store/TokenStore'
import { authService } from 'src/api/authService'
import { ErrorBus } from 'src/utils/errorBus'
import { ApiClient } from 'src/api'

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
    const originalRequest = error.config
    if ((error.response?.status === 403 || error.response?.status === 401) && tokenStore.expiryDate && (new Date() > tokenStore.expiryDate)) {
      try {
        await authService.renewLogin()
      } catch (e) {
        return Promise.reject(error.response)
      }
      // redo initial request
      return apiClient.axiosInstance(originalRequest)
    } else if (error.response?.status === 403 && tokenStore.expiryDate && (new Date() <= tokenStore.expiryDate)) {
      // if logged in user still has a valid token but tries to fetch a resource they don't have permissions for
      // redirect to home
      //router.push('/')

      // emited error is displayed in a toast alert
      ErrorBus.emit('error', 'Sie haben nicht genügend Rechte, um die angefragte Seite zu lesen.')
      return Promise.reject(error.response)
    } else {
      // all other request just fail regulary
      return Promise.reject(error)
    }
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
