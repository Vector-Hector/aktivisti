import { createApp } from 'vue'
import router from './router'

import App from './App.vue'

import PrimeVue from 'primevue/config'

import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import './styles/globals.scss'

import { makeServer } from "./server"

if (process.env.NODE_ENV === "development") {
    makeServer()
}

createApp(App)
    .use(router)
    .use(PrimeVue)
    .mount('#app')
