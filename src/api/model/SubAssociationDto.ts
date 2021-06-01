import { LocationDto } from 'src/api/model/LocationDto'

export interface SubAssociationDto {
  id: number
  name: string
  center?: LocationDto
}
