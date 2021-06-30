import { userStore } from 'src/store/UserStore'
import { apiClient } from 'src/api/ApiClient'
import { trackingSessionStore } from 'src/store/TrackingSessionStore'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { LoginDto } from 'src/api/model/LoginDto'
import { Store } from 'src/store/Store'

interface AuthStoreState {
  loggedIn: boolean
}


class AuthStore extends Store<AuthStoreState>{

  protected data(): AuthStoreState {
    return {
      loggedIn: false
    }
  }

  async logout() {
    await apiClient.session.logout()
    trackingSessionStore.clear()
    this.clear()
  }

  clear() {
    this.reset()
  }

  async auth(params: LoginDto) {
    await apiClient.session.login(params)
    // no error means authentication happened, cookie is set
    this.state.loggedIn = true
    const [profileRequest, permissionsRequest] = await Promise.all([
      apiClient.user.get('me', ['sub_association']),
      apiClient.userPermissions.list()
    ])
    userStore.setPermissions(permissionsRequest.payload.data)
    userStore.setUser(profileRequest.payload.data)
    userStore.setHomeAssociation(profileRequest.payload.embedded.sub_association?.[0] ?? null)
  }

  async login(username: string, password: string, longSession = false) {
    await this.auth({
      identifier: username,
      password,
      long_session: longSession,
    })

    const center = userStore.getState().homeAssociation?.center
    // when loggin in set the map on the bbox of the home association
    if (center) {
      userStore.setBbox(bbox(circle([center.lng, center.lat], 2)) as BBox2d)
    }
  }

  setLoggedIn(value: boolean) {
    this.state.loggedIn = value
  }

  isLoggedIn() {
    return this.state.loggedIn
  }

}

export const authStore = new AuthStore()
