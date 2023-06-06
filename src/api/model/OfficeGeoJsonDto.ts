export interface OfficeGeoJsonFeature {
  id: number
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    name: string
    location_description: string
  }
}

export interface OfficeGeoJsonDto {
  type: 'FeatureCollection'
  features: Array<OfficeGeoJsonFeature>
}
