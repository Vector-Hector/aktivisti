import { createServer } from 'miragejs'
import { sampleToken } from './fixtures/token'

export function makeAuthServer({ environment = 'development' } = {}) {
  return createServer({
    environment,
    routes() {
      this.urlPrefix = process.env.VUE_APP_AUTH_URL

      this.post('/token', () => {

        return {
          ...sampleToken
        }
      })

    }
  })
}
