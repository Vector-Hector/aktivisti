
export interface EventParticipationDto {
  id: number
  user: number
  is_pending_invitation: boolean
  event: number
  inviting_users: number[]
  user_is_member: boolean
  user_email: string | null
  user_username: null
  assigned_event_areas: number[]
}
