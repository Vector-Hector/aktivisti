import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'

interface UserState {
  loggedIn: boolean
  username: string | null
  token: string | null
  email: string | null
  location: LocationDto | null
}

class UserStore extends Store<UserState> {
  protected data(): UserState {
    return {
      loggedIn: false,
      username: null,
      token: null,
      email: null,
      location: null
    }
  }

  public locate(location: LocationDto) {
    this.state.location = location
  }

  /**
   * TODO: Remove from production codebase
   */
  public mockLogin() {
    this.state.loggedIn = true
    this.state.username = "Aktivist"
    this.state.email = "aktivist@die-linke.de"
  }
}

export const userStore = new UserStore()
