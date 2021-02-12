import { EventAreaDto } from '@/api/model/EventAreaDto'
import { sampleAreaDetails } from './areaDetails'


export const sampleEventAreas: EventAreaDto[] = [{
  id: 1,
  name: 'Gebiet 1',
  color: '#d20000',
  event: 5,
  feature: {
    id: "b454d467-94f9-4dda-9f91-f7ae0d1189ac",
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
          [100.0, 1.0], [100.0, 0.0]]
      ]
    },
    properties: {}
  },
  area_details: sampleAreaDetails
}, {
  id: 2,
  name: 'Gebiet 2',
  color: '#f2f200',
  event: 5,
  feature: {
    type: 'Feature',
    id: "d621a7ea-93ca-4fb7-9b4e-e01d27d06882",
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
          [100.0, 1.0], [100.0, 0.0]]
      ]
    },
    properties: {}
  },
  area_details: sampleAreaDetails
}, {
  id: 3,
  name: 'Gebiet 3',
  color: '#f200f2',
  event: 5,
  feature: {
    id: "6e0b0662-3b6b-435a-95ca-c90af57e8e81",
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
          [100.0, 1.0], [100.0, 0.0]]
      ]
    },
    properties: {}
  },
  area_details: sampleAreaDetails
}]
