export interface EmailNotificationSettingsDto {
  id?: number
  user: number
  on_new_volunteers: boolean
  on_invitation: boolean
  on_new_volunteers_requiring_verification: boolean
}
