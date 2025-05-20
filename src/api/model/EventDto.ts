import { EventTypes } from 'src/api/model/EventTypes'
import { LocationDto } from 'src/api/model/LocationDto'
import { useI18n } from 'vue-i18n'

export enum VisibilityOptions {
  Public = 'PUBLIC',
  InviteOnly = 'INVITE_ONLY'
}

export function useVisibilityLabels() {
  const { t } = useI18n()
  function getLabel(option: VisibilityOptions): string {
    if (option === VisibilityOptions.Public) {
      return t('api.model.VisibilityOptions.PUBLIC')
    }
    if (option === VisibilityOptions.InviteOnly) {
      return t('api.model.VisibilityOptions.INVITE_ONLY')
    }
    return ''
  }

  return { getLabel }
}

export interface EventDto {
  id: number
  event_type: EventTypes
  name: string
  metrics: number[]
  campaigns: number[]
  start_date: string
  end_date: string
  location: LocationDto
  location_description: string
  description: string
  internal_description: string
  participants: number
  max_participants: number
  visibility: VisibilityOptions
  owner: number
  sub_association: number
  poster_creation_allowed: boolean
  external_url: string
  external_url_door: string
  messenger_url: string
}
