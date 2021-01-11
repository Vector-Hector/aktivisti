import { Store } from '@/store/Store'

interface UserState {
  loggedIn: boolean
  username: string | null
  token: string | null
  email: string | null
}

class UserStore extends Store<UserState> {
  protected data(): UserState {
    return {
      loggedIn: false,
      username: null,
      token: null,
      email: null
    }
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
