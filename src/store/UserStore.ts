import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'

interface UserState {
  loggedIn: boolean
  id: number | null
  username: string | null
  email: string | null
  location: LocationDto | null
}

class UserStore extends Store<UserState> {
  protected data(): UserState {
    return {
      loggedIn: false,
      id: null,
      username: null,
      email: null,
      location: null
    }
  }

  public locate(location: LocationDto) {
    this.state.location = location
  }

  public unsetData() {
    Object.assign(this.state, {})
  }

  public setUser(userData: Partial<UserState>) {
    Object.assign(this.state, {userData})
  }

  /**
   * TODO: Remove from production codebase
   */
  public mockLogin() {
    this.state.loggedIn = true
    this.state.id = 1
    this.state.username = "Aktivist"
    this.state.email = "aktivist@die-linke.de"
  }
}

export const userStore = new UserStore()
