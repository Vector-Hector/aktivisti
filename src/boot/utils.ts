import { boot } from 'quasar/wrappers'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $utils: typeof utils
  }
}

const utils = {
  dateFormat(date: Date | string) {
    let localDate = date
    if (!(date instanceof Date)) {
      localDate = new Date(date)
    }
    return localDate.toLocaleString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

export default boot(({ app }) => {
  app.config.globalProperties.$utils = utils
})
