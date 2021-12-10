import { boot } from 'quasar/wrappers'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $validationRules: typeof validationRules
  }
}

export const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/


const validationRules = {
  isRequired(value: string | number | null | undefined) {
    if (!!value) {
      return true
    } else {
      return 'Dieses Feld ist erforderlich'
    }
  },

  email(value: string | null | undefined) {
    if (!!value && emailRegex.test(value)) {
      return true
    } else {
      return 'Dies ist keine gültige E-Mailadresse'
    }
  },
}

export default boot(({app}) => {
  app.config.globalProperties.$validationRules = validationRules
})
