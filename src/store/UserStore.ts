import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'
import { tokenService } from '@/store/TokenService'

interface UserState {
  loggedIn: boolean
  id: number | null
  username: string | null
  token: string | null
  email: string | null
  location: LocationDto | null
}

class UserStore extends Store<UserState> {
  protected data(): UserState {
    return {
      loggedIn: false,
      id: null,
      username: null,
      token: null,
      email: null,
      location: null
    }
  }

  public locate(location: LocationDto) {
    this.state.location = location
  }

  public getToken(): string | null {
    return this.state.token
  }

  public setToken(token: string) {
    this.state.token = token
  }

  public unsetData() {
    Object.assign(this.state, {})
  }

  // public setUser(userData: Partial<UserState>) {
  // TODO check again
  //   Object.assign(this.state, ...userData)
  // }

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
