import { createApp } from 'vue'
import router from './router'

import App from './App.vue'

import PrimeVue from 'primevue/config'

import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import './scss/theme.scss' // primevue theme
import './scss/_globals.scss'

import 'mapbox-gl/dist/mapbox-gl.css'

import { makeServer } from "../mocks/server"
import { ApiClient } from './api'

if (process.env.NODE_ENV === "development") {
  makeServer()
}

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(PrimeVue)

const apiClient = new ApiClient()

app.config.globalProperties.$apiClient = apiClient

apiClient.axiosInstance.interceptors.response.use(
  response => {
    // TODO doesn't get executed
    console.log('TEST')
    if (response.status === 200 || response.status === 201) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  },
  error => {
    if (error.response.status) {
      switch (error.response.status) {
      case 401:
        router.replace({
          path: '/login',
        });
        break
      default:
        return Promise.reject(error.response)
      }
    }
  }
)

app.mount('#app')
