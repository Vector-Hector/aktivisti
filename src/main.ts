import { createApp } from 'vue'
import router from './router'

import App from './App.vue'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import { IonicVue } from '@ionic/vue'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'


import './scss/theme.scss' // primevue theme
import './scss/_globals.scss'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { authService } from './api/authService'
import { oAuth2Client } from './api/OAuth2Client'
import { userStore } from '@/store/UserStore'
import { makeServer } from '../mocks/server'
import { apiClient } from '@/api/ApiClient'
import { tokenStore } from '@/store/TokenStore'

import './validate-rules'

if (process.env.VUE_APP_ENABLE_MOCKS === 'true') {
  makeServer()
}

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(PrimeVue)
  .use(ToastService)

app.config.globalProperties.$apiClient = apiClient
app.config.globalProperties.$oauth2Client = oAuth2Client


apiClient.axiosInstance.interceptors.request.use((request: AxiosRequestConfig) => {
  if (tokenStore.getTokenDto() !== null) {
    request.headers = {
      ...request.headers,
      'Authorization': `Bearer ${tokenStore.getTokenDto()!.access_token}`
    }
  }
  return request
})

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
  } else {
    // all other request just fail regulary
    return Promise.reject(error.response)
  }
})

// hydrate profile on app start
if (authService.isLoggedIn()) {
  apiClient.user.get('me')
    .then((profileRequest) => {
      if (profileRequest.response.status == 200) {
        userStore.setUser(profileRequest.payload.data)
      }
    })
    .catch((error: AxiosResponse) => {
      if (error.status === 403) {
        authService.clear()
      }
    })
    .finally(() => {
      app.mount('#app')
    })
} else {
  app.mount('#app')
}
