import { Store } from 'src/store/Store'
import { CAMPAIGN_ADMIN, UserDto } from 'src/api/model/UserDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'

interface UserState {
  user: UserDto | null
  homeAssociation: SubAssociationDto | null
  bbox: BBox2d | null
  campaign: number | null
}

const KEY_BBOX = 'KEY_BBOX'
const KEY_CAMPAIGN = 'KEY_CAMPAIGN'
const KEY_HOMEASSOCIATION = 'KEY_HOMEASSOCIATION'

class UserStore extends Store<UserState> {
  protected data(): UserState {
    const bboxString = localStorage.getItem(KEY_BBOX)
    const bbox = bboxString ? JSON.parse(bboxString) : null

    const campaignString = localStorage.getItem(KEY_CAMPAIGN)
    const campaign = campaignString ? parseInt(campaignString) : null


    const homeAssociationString = localStorage.getItem(KEY_CAMPAIGN)
    const homeAssociation = homeAssociationString ? JSON.parse(homeAssociationString) : null

    return {
      user: null,
      bbox,
      homeAssociation,
      campaign
    }
  }

  public setBbox(bbox: BBox2d | null) {
    this.state.bbox = bbox
    if (bbox) {
      localStorage.setItem(KEY_BBOX, JSON.stringify(bbox))
    } else {
      localStorage.removeItem(KEY_BBOX)
    }
  }

  public setCampaign(campaign: number | null) {
    this.state.campaign = campaign
    if (campaign === null) {
      localStorage.removeItem(KEY_CAMPAIGN)
    } else {
      localStorage.setItem(KEY_CAMPAIGN, campaign.toString())
    }
  }

  public setHomeAssociation(value: SubAssociationDto) {
    this.state.homeAssociation = value
    localStorage.setItem(KEY_HOMEASSOCIATION, JSON.stringify(this.state.homeAssociation))
  }

  public clearUser() {
    this.state.user = null
  }

  public clearHomeAssociation() {
    this.state.homeAssociation = null
  }


  public clear() {
    this.clearUser()
    this.clearHomeAssociation()
    this.setBbox(null)
  }

  public isManager(): boolean {
    return this.state.user?.roles.includes(CAMPAIGN_ADMIN) ?? false
  }

  public setUser(user: UserDto) {
    this.state.user = user
  }
}

export const userStore = new UserStore()
