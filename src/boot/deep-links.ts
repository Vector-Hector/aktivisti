import { boot } from 'quasar/wrappers'
import { App, URLOpenListenerEvent } from '@capacitor/app'

export default boot(({ router }) => {
  void App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
    const slug = event.url.split(process.env.BASE_URL!).pop()

    // We only push to the route if there is a slug present
    if (slug) {
      void router.push({
        path: slug
      })
    }
  })
})
