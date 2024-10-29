export interface LeadDto {
  gender: 'm' | 'w' | 'd'
  last_name: string
  first_name: string
  email: string
  phone_number: string
  plz: string
  city: string
  state: string
  is_party_member: boolean
  want_to_become_member: boolean
  privacy_opt_in: boolean
  event_area: null | number
  sub_organization: number
}
