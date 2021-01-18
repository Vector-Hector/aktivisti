import { createServer, Response, RestSerializer, Serializer } from 'miragejs'
import { sampleCampaigns } from './fixtures/campaigns'
import { sampleEvents } from './fixtures/events'
import { sampleUsers } from './fixtures/user'
import { EventModel } from './events'
import { CampaignModel } from './campaigns'
import { UserModel } from './user'
import Schema from 'miragejs/orm/schema'
import { Registry } from 'miragejs/-types'

type AppRegistry = Registry<{
  user: typeof UserModel;
  event: typeof EventModel,
  campaign: typeof CampaignModel
}, {}>
type AppSchema = Schema<AppRegistry>

function transformId(obj: any) {
  if (typeof obj === 'object' && obj !== null) {
    for (const prop in obj) {
      if (prop === 'id') {
        obj.id = parseInt(obj.id)
      }
      transformId(obj[prop])
    }
  }
}

//@ts-ignore
const ApplicationSerializer = RestSerializer.extend({
  root: false,
  embed: true,
  serialize(...args): any {
    //@ts-ignore
    const serialized = Serializer.prototype.serialize.apply(this, args)
    transformId(serialized)
    return serialized
  }
})

export function makeServer({environment = 'development'} = {}) {
  return createServer({
    environment,
    serializers: {
      //@ts-ignore
      event: ApplicationSerializer.extend({include: ['campaign', 'participants']}),
      //@ts-ignore
      campaign: ApplicationSerializer.extend({}),
      //@ts-ignore
      user: ApplicationSerializer.extend({})
    },
    fixtures: {
      users: sampleUsers,
      events: sampleEvents,
      campaigns: sampleCampaigns
    },
    models: {
      user: UserModel,
      campaign: CampaignModel,
      event: EventModel
    },
    seeds(server) {
      // only load the countries and cities fixtures
      server.loadFixtures('users')
      server.loadFixtures('campaigns')
      server.loadFixtures('events')
    },
    routes() {
      this.pretender.handledRequest
      this.namespace = 'api'

      // events
      this.get('/events', (schema) => {
        return schema.all('event')
      })

      this.get('/events/:id', (schema, request) => {
        const id = request.params.id
        return schema.find('event', id)!!
      })

      this.put('/events/:id', (schema, request) => {
        const id = request.params.id
        const event = schema.find('event', id)!!
        event.update(JSON.parse(request.requestBody))
        return event
      })

      this.post('/events', (schema, request) => {
        const event = JSON.parse(request.requestBody)
        event.campaign = schema.find('campaign', event.campaign)
        return schema.create('event', event)
      })

      this.delete('/events/:id', (schema, request) => {
        const id = request.params.id
        schema.db.events.remove(id)
        return new Response(204)
      })

      this.post('/events/:id/join', (schema, request) => {
        const id = request.params.id
        const event = schema.find('event', id)!!
        event.update({
          participantIds: [...(event as any).participantIds, sampleUsers[0].id]
        })

        return new Response(200, {'Content-Type': 'application/json'}, event)
      })

      this.post('/events/:id/leave', (schema, request) => {
        const id = request.params.id
        const event = schema.find('event', id)!!
        event.update({
          participantIds: [
            ...(event as any).participantIds
              .filter((searchId: string) => parseInt(searchId) !== sampleUsers[0].id)
          ]
        })
        return new Response(200, {'Content-Type': 'application/json'}, event)
      })

      // campaigns
      this.get('/campaigns', (schema) => schema.all('campaign'))

      this.get('/campaigns/:id', (schema, request) => {
        const id = request.params.id
        return schema.find('campaign', id)!!
      })

      this.put('/campaigns/:id', (schema, request) => {
        const id = request.params.id
        const campaign = schema.find('campaign', id)!!
        campaign.update(JSON.parse(request.requestBody))
        return schema.find('campaign', id)!!
      })

      this.post('/campaigns', (schema, request) => {
        const campaign = JSON.parse(request.requestBody)
        return schema.create('campaign', campaign)
      })

      this.delete('/campaigns/:id', (schema, request) => {
        const id = request.params.id
        schema.db.campaigns.remove(id)
        return new Response(204)
      })

      this.post('/login', (schema: AppSchema, request) => {
        const body = JSON.parse(request.requestBody)
        return schema.findBy('user', {email: body.email})!!
      })
      this.passthrough('https://api.mapbox.com/**')
      this.passthrough('https://events.mapbox.com/**')


      /**
       * Next block is a dirty fix for mapbox request passthrough as per https://gitmemory.com/issue/miragejs/miragejs/683/715621643
       */
      // eslint-disable-next-line no-prototype-builtins
      if (!window.Request.prototype.hasOwnProperty('signal')) {
        // @ts-ignore
        window.Request.prototype.signal = undefined
      }

      const oldPassthroughRequests = this.pretender.passthroughRequest.bind(
        this.pretender
      )
      this.pretender.passthroughRequest = (verb, path, request) => {
        // Needed because responseType is not set correctly in Mirages passthrough
        // for more details see: https://github.com/miragejs/miragejs/issues/1915
        if (verb === 'GET' && path.match(/\.png|\.pbf/)) {
          request.responseType = 'arraybuffer'
        }
        return oldPassthroughRequests(verb, path, request)
      }

    }
  })
}
