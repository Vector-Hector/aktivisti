import { Store } from '@/store/Store'
import { LocationDto } from '@/api/model/LocationDto'
import { CAMPAIGN_ADMIN, UserDto } from '@/api/model/UserDto'

interface UserState {
  user: UserDto | null,
  location: LocationDto | null,
  zoom: number | null,
  campaign: number | null
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

    const campaignString = localStorage.getItem(KEY_CAMPAIGN)
    const campaign = campaignString ? parseInt(campaignString) : null

    return {
      user: null,
      location,
      zoom,
      campaign
    }
  }

  public locate(location: LocationDto | null) {
    this.state.location = location
    localStorage.setItem(KEY_LOCATION, JSON.stringify(location))
  }

  public setZoom(zoom: number | null) {
    this.state.zoom = zoom
    if (zoom) {
      localStorage.setItem(KEY_ZOOM, zoom.toString())
    } else {
      localStorage.removeItem(KEY_ZOOM)
    }
  }

  public setCampaign(campaign: number | null) {
    this.state.campaign = campaign
    if (campaign === null) {
      localStorage.removeItem(KEY_CAMPAIGN)
    } else {
      localStorage.setItem(KEY_CAMPAIGN, campaign!.toString())
    }
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
