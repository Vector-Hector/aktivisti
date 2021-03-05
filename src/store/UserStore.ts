import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'
import { UserDto } from '@/api/model/UserDto'

interface UserState {
  user: UserDto | null,
  location: LocationDto | null
}

const LOCATION = 'LOCATION'

class UserStore extends Store<UserState> {
  protected data(): UserState {
    return {
      user: null,
      location: null
    }
  }

  public locate(location: LocationDto) {
    this.state.location = location
    localStorage.setItem(LOCATION, JSON.stringify(location))
  }

  public getLocation() {
    const locationString = localStorage.getItem(LOCATION)
    let locationObject = null
    if (locationString !== null) {
      try {
        locationObject = JSON.parse(locationString)
      } catch (error) {
        locationObject = null
      }
    }
    return locationObject
  }

  public clearUser() {
    this.state.user = null
    localStorage.removeItem(LOCATION)
  }

  public setUser(user: UserDto) {
    this.state.user = user
  }
}

export const userStore = new UserStore()
