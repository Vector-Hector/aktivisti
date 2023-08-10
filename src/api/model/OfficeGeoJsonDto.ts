export interface OfficeGeoJsonFeature {
  id: number
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    name: string
    description: string
    location_description: string
    phone_number: string
    email: string
    link: string
  }
}

export interface OfficeGeoJsonDto {
  type: 'FeatureCollection'
  features: Array<OfficeGeoJsonFeature>
}
