import { GeoJSON } from 'geojson'

export interface AddressDetails {
  house_number: string
  geometry: GeoJSON
}

export interface StreetDetails {
  name: string
  addresses: AddressDetails[]
  geometry: GeoJSON | null
}

export interface AreaDetailsDto {
  streets: StreetDetails[]
}
