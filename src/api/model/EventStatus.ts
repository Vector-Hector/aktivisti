import { useI18n } from 'vue-i18n'

export enum EventStatus {
  ACTIVE = 'active',
  ENDED = 'ended'
}

export function useEventStatus() {
  const { t } = useI18n()

  const eventStatusOptions: { key: string; label: string }[] = [
    {
      key: EventStatus.ACTIVE,
      label: t('api.model.EventStatus.ACTIVE')
    },
    {
      key: EventStatus.ENDED,
      label: t('api.model.EventStatus.ENDED')
    }
  ]

  return { eventStatusOptions }
}
