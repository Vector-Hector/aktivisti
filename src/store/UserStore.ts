import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'
import { CAMPAIGN_ADMIN, UserDto } from '@/api/model/UserDto'

interface UserState {
  user: UserDto | null,
  location: LocationDto | null,
  zoom: number | null,
  campaigns: number[] | null
}

const KEY_LOCATION = 'LOCATION'
const KEY_ZOOM = 'KEY_ZOOM'
const KEY_CAMPAIGN = 'KEY_CAMPAIGN'

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
    const zoomString = localStorage.getItem(KEY_ZOOM)
    const zoom = zoomString ? parseInt(zoomString) : null

    const campaignsString = localStorage.getItem(KEY_CAMPAIGN)
    const campaigns = campaignsString ? JSON.parse(campaignsString) : null

    return {
      user: null,
      location,
      zoom,
      campaigns
    }
  }

  public locate(location: LocationDto | null) {
    this.state.location = location
    localStorage.setItem(KEY_LOCATION, JSON.stringify(location))
  }

  public setZoom(zoom: number | null) {
    if (zoom) {
      localStorage.setItem(KEY_ZOOM, zoom.toString())
    }
  }

  public setCampaigns(campaigns: number[] | null) {
    this.state.campaigns = campaigns
    localStorage.setItem(KEY_CAMPAIGN, JSON.stringify(campaigns))
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
