import { defineBoot } from '#q-app/wrappers'
import { Lang } from 'quasar'
const langList = import.meta.glob('../../node_modules/quasar/lang/*.js')

export default defineBoot(async ({ app }) => {
  try {
    // Please see ../../node_modules/quasar/lang/ for supported languages or
    // https://github.com/quasarframework/quasar/tree/dev/ui/lang for supported languages
    await langList[
      `../../node_modules/quasar/lang/${app.config.globalProperties.$t('config.quasarLangIso')}.js`
    ]().then((lang) => {
      Lang.set(lang.default)
    })
  } catch (err) {
    console.error(err)
  }
})
