import { EventDto } from '@/api/model/EventDto'
import { EventTypes } from '@/api/model/EventTypes'


export const sampleEvents: EventDto[] = [{
  id: 1,
  type: EventTypes.DOOR_TO_DOOR,
  title: 'Haustürwahlkampf Mitte Gruppe 1',
  campaign: 1,
  startDate: '2021-05-11T12:00',
  endDate: '2021-05-11T13:00',
  public: true,
  location: {
    'mapbox_id': 'poi.816043858834',
    'name': 'Volksbühne Berlin, Linienstr. 227, Berlin, 10178, Deutschland',
    'center': {'lng': 13.411869, 'lat': 52.526887},
    'geometry': {'coordinates': [13.411869, 52.526887], 'type': 'Point'}
  },
  metrics: [],
  description: 'Haustürwahlkampf in Berlin-Mitte Gruppe 1, Treffpunkt Volksbühne',
  participants: [],
  maxParticipants: 10,
  published: true
}, {
  id: 2,
  type: EventTypes.DOOR_TO_DOOR,
  title: 'Haustürwahlkampf Mitte Gruppe 2',
  campaign: 1,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    'mapbox_id': 'poi.618475354653',
    'name': 'Hackescher Markt, Neue Promenade, Berlin, 10178, Deutschland',
    'center': {'lng': 13.4023895, 'lat': 52.52288075},
    'geometry': {'coordinates': [13.4023895, 52.52288075], 'type': 'Point'}
  },
  metrics: [],
  description: 'Haustürwahlkampf in Berlin-Mitte Gruppe 2, Treffpunkt Hackerscher Markt',
  participants: [],
  maxParticipants: 10,
  published: true
}, {
  id: 3,
  type: EventTypes.DOOR_TO_DOOR,
  title: 'Haustürwahlkampf Mitte Gruppe 3',
  campaign: 1,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    'mapbox_id': 'poi.498216302235',
    'name': 'Berliner Fernsehturm, Panoramastr. 1, Berlin, 10178, Deutschland',
    'center': {'lng': 13.410165, 'lat': 52.520775},
    'geometry': {'coordinates': [13.410165, 52.520775], 'type': 'Point'}
  },
  metrics: [],
  description: 'Haustürwahlkampf in Berlin-Mitte Gruppe 3, Treffpunkt Fernsehturm',
  participants: [],
  maxParticipants: 10,
  published: true
}, {
  id: 4,
  type: EventTypes.DOOR_TO_DOOR,
  title: 'Haustürwahlkampf Schöneiche',
  campaign: 1,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    mapbox_id: 'address.8494522076113680',
    name: 'Dorfaue 1, 15566 Schöneiche, Deutschland',
    center: {
      lat: 52.478898,
      lng: 13.701116
    },
    geometry: {
      type: 'Point',
      coordinates: [13.701116, 52.478898]
    }
  },
  metrics: [],
  description: 'Haustürwahlkampf in Schöneiche, Treffpunkt vor dem Rathaus',
  participants: [],
  maxParticipants: 10,
  published: true
}, {
  id: 5,
  type: EventTypes.DOOR_TO_DOOR,
  title: 'Haustürwahlkampf Stuttgart',
  campaign: 2,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    mapbox_id: 'poi.206158487657',
    name: 'Charlottenplatz, Charlottenstr., Stuttgart, Baden-Württemberg 70173, Deutschland',
    center: {
      lat: 48.7759025,
      lng: 9.1829185
    },
    geometry: {
      type: 'Point',
      coordinates: [9.1829185, 48.7759025]
    }
  },
  metrics: [],
  description: 'Haustürwahlkampf in Stuttgart, Treffpunkt U-Charlottenplatz',
  participants: [2],
  maxParticipants: 10,
  published: true
}]

export const sampleCreatedEvent = {
  id: 6,
  type: EventTypes.DOOR_TO_DOOR,
  title: 'Neues Event',
  campaign: 2,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: null,
  metrics: [],
  description: '',
  participants: [],
  maxParticipants: 0,
  published: false
}
