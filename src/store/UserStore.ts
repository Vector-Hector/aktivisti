import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'
import { UserDto } from '@/api/model/UserDto'

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

  public locate(location: LocationDto) {
    this.state.location = location
    localStorage.setItem(KEY_LOCATION, JSON.stringify(location))
  }

  public clearUser() {
    this.state.user = null
    localStorage.removeItem(KEY_LOCATION)
  }

  public setUser(user: UserDto) {
    this.state.user = user
  }
}

export const userStore = new UserStore()
