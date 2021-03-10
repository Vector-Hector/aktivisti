import { Geometry } from 'geojson'

export interface AddressDetails {
  street: string
  house_number: string
  geometry: Geometry
  osm_id: string
}

export interface StreetDetails {
  name: string
  addresses: AddressDetails[]
  geometry: Geometry | null
}

export interface AreaDetailsDto {
  streets: StreetDetails[]
}
