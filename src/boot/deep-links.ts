import { defineBoot } from '#q-app/wrappers'
import { App, URLOpenListenerEvent } from '@capacitor/app'

export default defineBoot(({ router }) => {
  void App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
    const slug = new URL(event.url).pathname

    // We only push to the route if there is a slug present
    if (slug) {
      void router.push({
        path: slug
      })
    }
  })
})
