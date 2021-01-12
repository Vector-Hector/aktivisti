import { belongsTo, createServer, Model, Response } from 'miragejs'
import { EventDto } from '@/model/EventDto'
import { CampaignDto } from '@/model/CampaignDto'

export function makeServer({environment = 'development'} = {}) {
  const campaigns: CampaignDto[] = [{
    id: '1',
    title: 'Bundestagswahl 2021',
    type: {
      name: 'Bund',
      id: '1'
    },
    organization: null
  }, {
    id: '2',
    title: 'Landtagswahl BaWü 2021',
    type: {
      name: 'Land',
      id: '2'
    },
    organization: null
  }]

  const events: EventDto[] = [{
    id: '1',
    title: 'HaustürWK Köpenick',
    campaign: campaigns[0],
    startDate: new Date('2021-05-11T12:00'),
    endDate: new Date('2021-05-11T13:00'),
    public: true,
    location: {
      lat: 52.4426,
      lng: 13.5823
    },
    metrics: [],
    description: 'Haustürwahlkampf in Köpenick',
    participants: 6,
    maxParticipants: 10
  }, {
    id: '2',
    title: 'HaustürWK Kreuzberg',
    campaign: campaigns[0],
    startDate: new Date('2021-05-12T16:00'),
    endDate: new Date('2021-05-12T17:00'),
    public: true,
    location: {
      lat: 52.4983,
      lng: 13.4066
    },
    metrics: [],
    description: 'Haustürwahlkampf in Kreuzberg',
    participants: 6,
    maxParticipants: 10
  }, {
    id: '3',
    title: 'HaustürWK Steinenbronn',
    campaign: campaigns[1],
    startDate: new Date('2021-05-12T16:00'),
    endDate: new Date('2021-05-12T17:00'),
    public: true,
    location: {
      lat: 48.6622027,
      lng: 9.1140697
    },
    metrics: [],
    description: 'Haustürwahlkampf in Steinenbronn',
    participants: 6,
    maxParticipants: 10
  }]

  return createServer({
    environment,
    seeds(server) {
      server.db.loadData({
        event: events,
        campaign: campaigns
      })
    },
    models: {
      event: Model.extend({
        campaign: belongsTo()
      }),
      campaign: Model
    },
    routes() {
      this.namespace = 'api'

      // events
      this.get('/events', (schema) => {
        return schema.db.event
      })

      this.get('/events/:id', (schema, request) => {
        const id = request.params.id
        return schema.db.event.find(id)
      })

      this.put('/events/:id', (schema, request) => {
        const id = request.params.id
        const event = schema.db.event.find(id)
        event.update(JSON.parse(request.requestBody))
        return event
      })

      this.post('/events', (schema, request) => {
        const event = JSON.parse(request.requestBody)
        return schema.db.event.insert(event)
      })

      this.delete('/events/:id', (schema, request) => {
        const id = request.params.id
        schema.db.event.remove(id)
        return new Response(204)
      })

      // campaigns
      this.get('/campaigns', (schema) => schema.db.campaign)

      this.get('/campaigns/:id', (schema, request) => {
        const id = request.params.id
        return schema.db.campaign.find(id)
      })

      this.put('/campaigns/:id', (schema, request) => {
        const id = request.params.id
        const campaign = schema.db.campaign.find(id)
        return campaign.update(JSON.parse(request.requestBody))
      })

      this.post('/campaigns', (schema, request) => {
        const campaign = JSON.parse(request.requestBody)
        return schema.db.campaign.insert(campaign)
      })

      this.delete('/campaigns/:id', (schema, request) => {
        const id = request.params.id
        schema.db.campaign.remove(id)
        return new Response(204)
      })
    }
  })
}
