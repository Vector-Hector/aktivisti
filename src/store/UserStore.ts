import { Store } from 'src/store/Store'
import { CAMPAIGN_ADMIN, UserDto } from 'src/api/model/UserDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { parseIfPossible } from 'src/utils/json'


export enum SortOption {
  START_DATE = 'start_date',
  NAME = 'name'
}

export interface EventFilterPreferences {
  subAssociations: number[],
  campaign: number | undefined,
  sorting: SortOption
}

interface UserState {
  user: UserDto | null
  homeAssociation: SubAssociationDto | null
  bbox: BBox2d | null
  filterPreferences: EventFilterPreferences
}

const KEY_BBOX = 'KEY_BBOX'
const KEY_FILTERPREFERENCES = 'KEY_FILTERPREFERENCES'
const KEY_HOMEASSOCIATION = 'KEY_HOMEASSOCIATION'

class UserStore extends Store<UserState> {
  protected data(): UserState {
    const bboxString = localStorage.getItem(KEY_BBOX)
    const bbox = bboxString ? JSON.parse(bboxString) : null

    const filterPreferencesString = localStorage.getItem(KEY_FILTERPREFERENCES)
    const filterPreferences = parseIfPossible(filterPreferencesString) as EventFilterPreferences | null

    const homeAssociationString = localStorage.getItem(KEY_HOMEASSOCIATION)
    const homeAssociation = parseIfPossible(homeAssociationString) as SubAssociationDto | null

    return {
      user: null,
      bbox,
      homeAssociation,
      filterPreferences: filterPreferences ?? {
        subAssociations: [],
        campaign: undefined,
        sorting: SortOption.START_DATE
      }
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

  public setFilterPreferences(filterPreferences: EventFilterPreferences) {
    this.state.filterPreferences = filterPreferences
    localStorage.setItem(KEY_FILTERPREFERENCES, JSON.stringify(filterPreferences))
  }

  public setHomeAssociation(value: SubAssociationDto | null) {
    this.state.homeAssociation = value
    if (value !== null) {
      localStorage.setItem(KEY_HOMEASSOCIATION, JSON.stringify(this.state.homeAssociation))
    } else {
      localStorage.removeItem(KEY_HOMEASSOCIATION)
    }
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
