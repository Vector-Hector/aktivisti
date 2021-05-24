import { boot } from 'quasar/wrappers'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import 'src/css/theme.scss' // primevue theme

export default boot(({app}) => {
  app
    .use(PrimeVue)
    .use(ToastService)
    .use(ConfirmationService)
})
