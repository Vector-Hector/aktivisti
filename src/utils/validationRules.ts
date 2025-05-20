import { useI18n } from 'vue-i18n'

export const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

export function useValidationRules() {
  const { t } = useI18n()
  const validationRules = {
    isRequired(value: string | number | null | undefined) {
      if (value) {
        return true
      } else {
        return t('general.validationRules.fieldRequiredError')
      }
    },

    email(value: string | null | undefined) {
      if (!!value && emailRegex.test(value)) {
        return true
      } else {
        return t('general.validationRules.noValidEmailError')
      }
    }
  }
  return { validationRules }
}
