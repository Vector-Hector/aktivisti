import { trackingSessionStore } from 'src/store/TrackingSessionStore'
import { LoginDto } from 'src/api/model/LoginDto'
import { Store } from 'src/store/Store'
import { userStore } from 'src/store/UserStore'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

export interface BaseAuthStoreState {
  userId: number | null
}


export abstract class BaseAuthStore<T extends BaseAuthStoreState> extends Store<T> {

  deleteSessionData() {
    // remove all local tracking data
    trackingSessionStore.clear()
    this.clear()
  }

  abstract clear(): void

  abstract auth(params: LoginDto): Promise<void>

  setUserId(value: number | null) {
    this.state.userId = value
  }

  isLoggedIn() {
    return this.state.userId !== null
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
}


