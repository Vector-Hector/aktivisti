import { Geometry } from 'geojson'

export interface AddressDetails {
  house_number: string
  geometry: Geometry
}

export interface StreetDetails {
  name: string
  addresses: AddressDetails[]
  geometry: Geometry
}

export interface AreaDetailsDto {
  streets: StreetDetails[]
}
