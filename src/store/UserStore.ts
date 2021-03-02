import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'
import { UserDto } from '@/api/model/UserDto'

interface UserState {
  user: UserDto | null,
  location: LocationDto | null
}

class UserStore extends Store<UserState> {
  protected data(): UserState {
    return {
      user: null,
      location: null
    }
  }

  public locate(location: LocationDto) {
    this.state.location = location
  }

  public clearUser() {
    this.state.user = null
  }

  public setUser(user: UserDto) {
    this.state.user = user
  }
}

export const userStore = new UserStore()
