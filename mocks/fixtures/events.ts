import { EventDto } from '@/api/model/EventDto'


interface EventDtoFixture extends EventDto {
  campaignId: string,
  participantIds: number[]
}

export const sampleEvents: Partial<EventDtoFixture>[] = [{
  id: 1,
  title: 'HaustürWK Köpenick',
  campaignId: "1",
  startDate: '2021-05-11T12:00',
  endDate: '2021-05-11T13:00',
  public: true,
  location: {
    lat: 52.4426,
    lng: 13.5823
  },
  metrics: [],
  description: 'Haustürwahlkampf in Köpenick',
  participantIds: [1],
  maxParticipants: 10
}, {
  id: 2,
  title: 'HaustürWK Kreuzberg',
  campaignId: "1",
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    lat: 52.4983,
    lng: 13.4066
  },
  metrics: [],
  description: 'Haustürwahlkampf in Kreuzberg',
  participantIds: [1],
  maxParticipants: 10
}, {
  id: 3,
  title: 'HaustürWK Steinenbronn',
  campaignId: "2",
  startDate: '2021-05-12T16:00',
  endDate: '2021-05-12T17:00',
  public: true,
  location: {
    lat: 48.6622027,
    lng: 9.1140697
  },
  metrics: [],
  description: 'Haustürwahlkampf in Steinenbronn',
  participantIds: [1],
  maxParticipants: 10
}]
