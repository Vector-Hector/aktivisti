import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'
import { CAMPAIGN_ADMIN, UserDto } from '@/api/model/UserDto'

interface UserState {
  user: UserDto | null,
  location: LocationDto | null
}

const KEY_LOCATION = 'LOCATION'

class UserStore extends Store<UserState> {
  protected data(): UserState {

    const locationString = localStorage.getItem(KEY_LOCATION)
    let location = null
    if (locationString !== null) {
      try {
        location = JSON.parse(locationString)
      } catch (error) {
        location = null
      }
    }

    return {
      user: null,
      location
    }
  }

  public locate(location: LocationDto | null) {
    this.state.location = location
    localStorage.setItem(KEY_LOCATION, JSON.stringify(location))
  }

  public clearUser() {
    this.state.user = null
  }

  public clear() {
    this.clearUser()
    this.locate(null)
  }

  public isManager(): boolean {
    return this.state.user?.roles.includes(CAMPAIGN_ADMIN) ?? false
  }

  public setUser(user: UserDto) {
    this.state.user = user
  }
}

export const userStore = new UserStore()
