import { useI18n } from 'vue-i18n'

export function useDateFormat() {
  const { d, t } = useI18n()
  function dateFormat(date: Date | string, key: string) {
    return date && !isNaN(new Date(date).getTime())
      ? d(new Date(date), key)
      : t('general.noValidDate')
  }
  return {
    dateFormat
  }
}
