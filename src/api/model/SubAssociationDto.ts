import { LocationDto } from '@/api/model/LocationDto'

export interface SubAssociationDto {
  id: number
  name: string
  center?: LocationDto
}
