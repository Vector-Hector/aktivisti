import { EventDto } from '@/api/model/EventDto'
import { EventTypes } from '@/api/model/EventTypes'

export const sampleEvents: EventDto[] = [{
  id: 1,
  event_type: EventTypes.DOOR_TO_DOOR,
  name: 'Haustürgespräch Mitte Gruppe 1',
  campaigns: [1],
  start_date: '2021-05-11T12:00',
  end_date: '2021-05-11T13:00',
  location_description: 'Volksbühne Berlin, Linienstr. 227, Berlin, 10178, Deutschland',
  location: {
    lat: 52.526887,
    lng: 13.411869
  },
  metrics: [],
  description: 'Haustürgespräch in Berlin-Mitte Gruppe 1, Treffpunkt Volksbühne',
  participants: [],
  max_participants: 10,
  published: true
}, {
  id: 2,
  event_type: EventTypes.DOOR_TO_DOOR,
  name: 'Haustürgespräch Mitte Gruppe 2',
  campaigns: [1],
  start_date: '2021-05-12T16:00',
  end_date: '2021-05-12T17:00',
  location_description: 'Hackescher Markt, Neue Promenade, Berlin, 10178, Deutschland',
  location: {
    lat: 52.52288075,
    lng: 13.4023895
  },
  metrics: [],
  description: 'Haustürgespräch in Berlin-Mitte Gruppe 2, Treffpunkt Hackerscher Markt',
  participants: [],
  max_participants: 10,
  published: true
}, {
  id: 3,
  event_type: EventTypes.DOOR_TO_DOOR,
  name: 'Haustürgespräch Mitte Gruppe 3',
  campaigns: [1],
  start_date: '2021-05-12T16:00',
  end_date: '2021-05-12T17:00',
  location_description: 'Berliner Fernsehturm, Panoramastr. 1, Berlin, 10178, Deutschland',
  location: {
    lat: 52.520775,
    lng: 13.410165
  },
  metrics: [],
  description: 'Haustürgespräch in Berlin-Mitte Gruppe 3, Treffpunkt Fernsehturm',
  participants: [],
  max_participants: 10,
  published: true
}, {
  id: 4,
  event_type: EventTypes.DOOR_TO_DOOR,
  name: 'Haustürgespräch Schöneiche',
  campaigns: [1],
  start_date: '2021-05-12T16:00',
  end_date: '2021-05-12T17:00',
  location_description: 'Dorfaue 1, 15566 Schöneiche, Deutschland',
  location: {
    lat: 52.478898,
    lng: 13.701116
  },

  metrics: [],
  description: 'Haustürgespräch in Schöneiche, Treffpunkt vor dem Rathaus',
  participants: [],
  max_participants: 10,
  published: true
}, {
  id: 5,
  event_type: EventTypes.DOOR_TO_DOOR,
  name: 'Haustürgespräch Stuttgart',
  campaigns: [2],
  start_date: '2021-05-12T16:00',
  end_date: '2021-05-12T17:00',
  location_description: 'Charlottenplatz, Charlottenstr., Stuttgart, Baden-Württemberg 70173, Deutschland',
  location: {
    lat: 48.7759025,
    lng: 9.1829185
  },
  metrics: [],
  description: 'Haustürgespräch in Stuttgart, Treffpunkt U-Charlottenplatz',
  participants: [2],
  max_participants: 10,
  published: true
}]

export const sampleCreatedEvent: EventDto = {
  id: 6,
  event_type: EventTypes.DOOR_TO_DOOR,
  name: 'Neues Event',
  campaigns: [2],
  start_date: '2021-05-12T16:00',
  end_date: '2021-05-12T17:00',
  location: {
    lat: 52.478898,
    lng: 13.701116
  },
  location_description: 'Dorfaue 1, 15566 Schöneiche, Deutschland',
  metrics: [],
  description: '',
  participants: [],
  max_participants: 0,
  published: false
}
