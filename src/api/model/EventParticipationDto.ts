
export interface EventParticipationDto {
  id: number
  user: number
  is_verified: boolean
  is_pending_invitation: boolean
  event: number
  inviting_users: number[]
  user_is_member: boolean
  user_email: string | null
  user_username: string
  assigned_event_areas: number[]
  is_team_captain: boolean
}
