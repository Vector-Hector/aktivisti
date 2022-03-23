import { LocationDto } from 'src/api/model/LocationDto'

export interface SubAssociationDto {
  id: number
  name: string
  state_association: number
  center?: LocationDto
}
