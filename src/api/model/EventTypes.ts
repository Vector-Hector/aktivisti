import { useI18n } from 'vue-i18n'

export enum EventTypes {
  DOOR_TO_DOOR = 'H',
  POSTERS = 'P',
  GENERIC = 'G',
  FLYERS = 'F'
}

export function useEventTypes() {
  const { t } = useI18n()

  const eventTypeOptions: { key: EventTypes; label: string }[] = [
    {
      key: EventTypes.DOOR_TO_DOOR,
      label: t('api.model.EventTypes.DOOR_TO_DOOR')
    },
    {
      key: EventTypes.POSTERS,
      label: t('api.model.EventTypes.POSTERS')
    },
    {
      key: EventTypes.GENERIC,
      label: t('api.model.EventTypes.GENERIC')
    },
    {
      key: EventTypes.FLYERS,
      label: t('api.model.EventTypes.FLYERS')
    }
  ]

  class EventTypesUtil {
    static getLabel(eventType: EventTypes): string {
      return eventTypeOptions.find(({ key }) => key === eventType)!.label
    }
  }

  return {
    eventTypeOptions,
    EventTypesUtil
  }
}
