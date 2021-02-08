import { AreaDetailsDto } from '@/api/model/AreaDetailsDto'

export const samplePlaces: AreaDetailsDto = {
  streets: [{
    name: 'Hauptstraße',
    addresses: [{
      house_number: '1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    },
    {
      house_number: '2',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    },
    {
      house_number: '2a',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    },
    {
      house_number: '3',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    },
    {
      house_number: '4',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    },
    ],
    geometry: null
  }, {
    name: 'Neue Straße',
    addresses: [{
      house_number: '1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }, {
      house_number: '2',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }, {
      house_number: '3',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }, {
      house_number: '4',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }, {
      house_number: '5',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }],
    geometry: null
  }, {
    name: 'Parkstraße',
    addresses: [{
      house_number: '54',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }, {
      house_number: '55',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }, {
      house_number: '56',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    } ,{
      house_number: '57',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }],
    geometry: null
  }, {
    name: 'Schlossallee',
    addresses: [{
      house_number: '112',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]]
        ]
      }
    }],
    geometry: null
  }]
}
