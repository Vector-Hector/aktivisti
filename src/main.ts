import { createApp } from 'vue'
import router from './router'

import App from './App.vue'

import PrimeVue from 'primevue/config'

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

import { AxiosResponse } from 'axios'
import { authService } from './api/authService'
import { OAuth2Client } from './api/OAuth2Client'
import { ApiClient } from '@/api'
import { userStore } from '@/store/UserStore'
import { makeServer } from '../mocks/server'

if (process.env.VUE_APP_ENABLE_MOCKS === "true") {
  makeServer()
}


const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(PrimeVue)

const apiClient = new ApiClient()
const oauth2Client = new OAuth2Client()

app.config.globalProperties.$apiClient = apiClient
app.config.globalProperties.$oauth2Client = oauth2Client


apiClient.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
  return response
}, (error: any) => {
  if (error.response?.status === 401) {
    authService.logout()
  }
  return Promise.reject(error.response)
})

// hydrate profile on app start
apiClient.user.get('me')
  .then((profileRequest) => {
    if (profileRequest.response.status == 200) {
      userStore.setUser(profileRequest.payload.data)
    }
  })
  .finally(() => {
    app.mount('#app')
  })
