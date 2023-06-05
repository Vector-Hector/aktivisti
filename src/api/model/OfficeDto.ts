import { LocationDto } from 'src/api/model/LocationDto'

export interface OfficeDto {
  id: number
  name: string
  description: string
  location_description: string
  location: LocationDto
  phone_number: string
  link: string
  email: string
  state_association: number
  sub_association: number
}
