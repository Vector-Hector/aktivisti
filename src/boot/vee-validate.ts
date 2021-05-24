import { configure, defineRule } from 'vee-validate'
import { required, email } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import { boot } from 'quasar/wrappers'

defineRule('required', required)
defineRule('email', email)

export default boot(() => {
  configure({
    generateMessage: localize({
      en: {
        messages: {
          required: 'This field is required',
          email: 'This is not a valid email address'
        }
      },
      de: {
        messages: {
          required: 'Bitte dieses Feld ausfüllen',
          email: 'Das ist keine gültige E-Mail Adresse'
        }
      }
    })
  })
})
