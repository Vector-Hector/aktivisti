import { useI18n } from 'vue-i18n'

export enum ContentTypeNaturalKey {
  SUB_ASSOCIATION = 'core.subassociation',
  STATE_ASSOCIATION = 'core.stateassociation',
  CAMPAIGN = 'core.campaign'
}

export interface ContentTypeDto {
  id: number
  name: string
  natural_key: ContentTypeNaturalKey
}

export function useContentTypeLabels() {
  const { t } = useI18n()
  function getLabel(type: ContentTypeNaturalKey): string {
    if (type === ContentTypeNaturalKey.SUB_ASSOCIATION) {
      return t('api.model.ContentTypeDto.naturalKey.core.subassociation')
    }
    if (type === ContentTypeNaturalKey.STATE_ASSOCIATION) {
      return t('api.model.ContentTypeDto.naturalKey.core.stateassociation')
    }
    if (type === ContentTypeNaturalKey.CAMPAIGN) {
      return t('api.model.ContentTypeDto.naturalKey.core.campaign')
    }
    return ''
  }

  return { getLabel }
}
