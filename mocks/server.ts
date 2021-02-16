import { createServer, Response } from 'miragejs'
import { sampleCampaigns } from './fixtures/campaigns'
import { sampleEvents } from './fixtures/events'
import { sampleUsers } from './fixtures/user'
import { sampleOrganizationTypes } from './fixtures/organizationTypes'
import { sampleCampaignTypes } from './fixtures/campaignTypes'
import { sampleToken } from './fixtures/token'


export function makeServer({environment = 'development'} = {}) {
  return createServer({
    environment,
    routes() {
      this.urlPrefix = process.env.VUE_APP_BASE_URL

      // events
      this.get('/events', (schema, request) => {
        const campaignId = parseInt(request.queryParams.campaign)
        let events = sampleEvents
        if (campaignId) {
          events = sampleEvents.filter(({campaign}) => campaign === campaignId)
        }
        return {
          data: events
        }
      })

      this.get('/events/:id', (schema, request) => {
        const idParam = parseInt(request.params.id)
        return {
          data: sampleEvents.find(({id}) => id === idParam)
        }
      })

      this.put('/events/:id', (schema, request) => {
        const idParam = parseInt(request.params.id)
        const eventUpdate = JSON.parse(request.requestBody)
        return {
          data: {
            ...sampleEvents.find(({id}) => id === idParam),
            ...eventUpdate
          }
        }
      })

      this.post('/events', (schema, request) => {
        const event = JSON.parse(request.requestBody)

        return {
          data: event
        }
      })

      this.delete('/events/:id', (schema, request) => {
        const idParam = parseInt(request.params.id)
        if (sampleEvents.find(({id}) => id === idParam)) {
          return new Response(204)
        } else {
          return new Response(404)
        }
      })

      this.post('/events/:id/join', (schema, request) => {
        const idParam = parseInt(request.params.id)
        const event = sampleEvents.find(({id}) => id === idParam)

        return {
          data: {
            ...event,
            participants: [...event!.participants!, sampleUsers[0].id]
          }
        }
      })


      this.post('/events/:id/leave', (schema, request) => {
        const idParam = parseInt(request.params.id)
        const event = sampleEvents.find(({id}) => id === idParam)!!
        return {
          data: {
            ...event,
            participants: [
              ...(event as any).participants
                .filter((searchId: string) => parseInt(searchId) !== sampleUsers[0].id)
            ]
          }
        }
      })

      // campaigns
      this.get('/campaigns', () => {
        return {
          data: sampleCampaigns,
          embedded: {
            organization: [
              ...sampleOrganizationTypes
            ]
          }
        }
      })

      this.get('/campaigns/:id', (schema, request) => {
        const idParam = parseInt(request.params.id)
        const campaign = sampleCampaigns.find(({id}) => id === idParam)
        const organization = sampleOrganizationTypes.find(({id}) => id === campaign?.id)
        if (!campaign) {
          return new Response(404)
        } else {
          return {
            data: campaign,
            embedded: {
              organzation: {
                ...organization
              }
            }
          }
        }
      })

      this.put('/campaigns/:id', (schema, request) => {
        const idParam = parseInt(request.params.id)
        const campaign = sampleCampaigns.find(({id}) => id === idParam)!
        const campaignUpdate = JSON.parse(request.requestBody)
        return {
          data: {
            ...campaign,
            ...campaignUpdate
          }
        }
      })

      this.post('/campaigns', (schema, request) => {
        const campaign = JSON.parse(request.requestBody)
        return {data: campaign}
      })

      this.delete('/campaigns/:id', (schema, request) => {
        const idParam = parseInt(request.params.id)

        if (sampleCampaigns.find(({id}) => id === idParam)) {
          return new Response(204)
        } else {
          return new Response(404)
        }
      })

      this.get('/campaign-types', () => {
        return {
          data: sampleCampaignTypes
        }
      })

      this.get('/campaign-types/:id', (schema, request) => {
        const idParam = parseInt(request.params.id)
        return {
          data: sampleCampaignTypes.find(({id}) => id === idParam)
        }
      })

      this.get('/organization-types', () => {
        return {
          data: sampleOrganizationTypes
        }
      })

      this.get('/organization-types/:id', (schema, request) => {
        const idParam = parseInt(request.params.id)
        return {
          data: sampleOrganizationTypes.find(({id}) => id === idParam)
        }
      })

      this.post('/login', (schema, request) => {
        const body = JSON.parse(request.requestBody)
        return {data: sampleUsers.find(({username}) => username === body.email)} || new Response(400)
      })

      this.get('/auth', () => {
        return {
          data: sampleToken
        }
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
