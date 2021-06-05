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
  first_name: string
  last_name: string
  email_notification_settings: number | null
}
