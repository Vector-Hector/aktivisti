import { EventDto } from '@/api/model/EventDto'


export const sampleEvents: EventDto[] = [{
  id: 1,
  title: 'Haustürwahlkampf Mitte Gruppe 1',
  campaign: 1,
  startDate: '2021-05-11T12:00',
  endDate: '2021-05-11T13:00',
  public: true,
  location: {
    lat: 52.526675,
    lng: 13.411572
  },
  metrics: [],
  description: 'Haustürwahlkampf in Berlin-Mitte Gruppe 1, Treffpunkt Volksbühne',
  participants: [],
  maxParticipants: 10
}, {
  id: 2,
  title: 'Haustürwahlkampf Mitte Gruppe 2',
  campaign: 1,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    lat: 52.523080,
    lng: 13.402822
  },
  metrics: [],
  description: 'Haustürwahlkampf in Berlin-Mitte Gruppe 2, Treffpunkt Hackerscher Markt',
  participants: [],
  maxParticipants: 10
}, {
  id: 3,
  title: 'Haustürwahlkampf Mitte Gruppe 3',
  campaign: 1,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    lat: 52.520342,
    lng: 13.408460
  },
  metrics: [],
  description: 'Haustürwahlkampf in Berlin-Mitte Gruppe 3, Treffpunkt Fernsehturm',
  participants: [],
  maxParticipants: 10
}, {
  id: 4,
  title: 'Haustürwahlkampf Schöneiche',
  campaign: 1,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    lat: 52.478862,
    lng: 13.7004708
  },
  metrics: [],
  description: 'Haustürwahlkampf in Schöneiche, Treffpunkt vor dem Rathaus',
  participants: [],
  maxParticipants: 10
}, {
  id: 5,
  title: 'Haustürwahlkampf Stuttgart',
  campaign: 2,
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    lat: 48.77616,
    lng: 9.1828247
  },
  metrics: [],
  description: 'Haustürwahlkampf in Stuttgart, Treffpunkt U-Charlottenplatz',
  participants: [2],
  maxParticipants: 10
}]
