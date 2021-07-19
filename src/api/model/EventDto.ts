import { EventTypes } from 'src/api/model/EventTypes'
import { LocationDto } from 'src/api/model/LocationDto'


export enum VisibilityOptions {
  Public = 'PUBLIC',
  InviteOnly = 'INVITE_ONLY'
}

export const VisibilityLabels: { [option in VisibilityOptions]: string } = {
  [VisibilityOptions.Public]: 'Öffentlich',
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
  description: string
  participants: number
  max_participants: number
  visibility: VisibilityOptions,
  owner: number,
  sub_association: number
}
