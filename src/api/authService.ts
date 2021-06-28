import { userStore } from 'src/store/UserStore'
import { apiClient } from 'src/api/ApiClient'
import { trackingSessionStore } from 'src/store/TrackingSessionStore'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { LoginDto } from 'src/api/model/LoginDto'


class AuthService {

  async logout() {
    await apiClient.session.logout()
    trackingSessionStore.clear()
    this.clear()
  }

  clear() {
    userStore.reset()
  }

  async auth(params: LoginDto) {
    await apiClient.session.login(params)
    // no error means authentication happened, cookie is set
    userStore.setLoggedIn(true)
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
      long_session: longSession
    })

    const center = userStore.getState().homeAssociation?.center
    // when loggin in set the map on the bbox of the home association
    if (center) {
      userStore.setBbox(bbox(circle([center.lng, center.lat], 2)) as BBox2d)
    }
  }

  isLoggedIn() {
    return userStore.getState().loggedIn
  }

}

export const authService = new AuthService()
