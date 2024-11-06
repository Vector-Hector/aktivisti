export interface LeadDto {
  gender?: 'm' | 'f' | 'o'
  first_name: string
  last_name: string
  email: string
  phone?: string
  zip_code: string
  city?: string
  sub_organization: number
  note?: string
  wants_to_become_member?: boolean
  event_area: number
}
