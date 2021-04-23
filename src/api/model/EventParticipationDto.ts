
export interface EventParticipationDto {
  id: number
  user: number
  is_pending_invitation: boolean
  event: number
  user_inviting: number
  user_is_member: boolean
  user_email: string
  user_username: string
  assigned_event_areas: number[]
}
