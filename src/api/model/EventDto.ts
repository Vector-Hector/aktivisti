import { EventTypes } from 'src/api/model/EventTypes'
import { LocationDto } from 'src/api/model/LocationDto'


export enum VisibilityOptions {
  Public = 'PUBLIC',
  ActiveUsers = 'ACTIVE_USERS',
  InviteOnly = 'INVITE_ONLY'
}

export const VisibilityLabels: { [option in VisibilityOptions]: string } = {
  [VisibilityOptions.Public]: 'Öffentlich',
  [VisibilityOptions.ActiveUsers]: 'Aktive Nutzer*innen',
  [VisibilityOptions.InviteOnly]: 'Nur mit Einladung'
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
  published: boolean
  description: string
  participants: number[]
  max_participants: number
}
