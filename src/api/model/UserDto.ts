import { LocationDto } from 'src/api/model/LocationDto'

export const CAMPAIGN_ADMIN = 10

export interface UserDto {
  id: number
  username: string
  email: string
  roles: number[]
  sub_association?: number
  is_superuser: boolean
  is_staff: boolean
  phone_number: string
  plz: string
  plz_center: LocationDto
  first_name: string
  last_name: string
  email_notification_settings: number | null
}
