import { ApiClient } from './api'
import { OAuth2Client } from './api/OAuth2Client'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $apiClient: ApiClient
    $oauth2Client: OAuth2Client
  }
}
