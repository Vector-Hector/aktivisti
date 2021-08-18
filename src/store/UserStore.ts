import { Store } from 'src/store/Store'
import { CAMPAIGN_ADMIN, UserDto } from 'src/api/model/UserDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { parseIfPossible } from 'src/utils/json'
import { PermissionCodename, UserObjectPermissionDto } from 'src/api/model/UserObjectPermissionDto'
import { EventTypes } from 'src/api/model/EventTypes'


export enum SortOption {
  START_DATE = 'start_date',
  NAME = 'name'
}

export interface EventFilterPreferences {
  subAssociations: number[],
  campaign: number | undefined,
  sorting: SortOption
  eventType: EventTypes | undefined
}

interface UserState {
  user: UserDto | null
  homeAssociation: SubAssociationDto | null
  bbox: BBox2d | null
  filterPreferences: EventFilterPreferences
  permissions: UserObjectPermissionDto[]
}

const KEY_BBOX = 'KEY_BBOX'
const KEY_FILTERPREFERENCES = 'KEY_FILTERPREFERENCES'
const KEY_HOMEASSOCIATION = 'KEY_HOMEASSOCIATION'

class UserStore extends Store<UserState> {
  protected data(): UserState {
    return {
      user: null,
      permissions: [],
      bbox: null,
      homeAssociation: null,
      filterPreferences: {
        subAssociations: [],
        campaign: undefined,
        sorting: SortOption.START_DATE,
        eventType: undefined
      }
    }
  }

  protected setup(data: UserState) {
    super.setup(data)

    const bboxString = localStorage.getItem(KEY_BBOX)
    data.bbox = bboxString ? JSON.parse(bboxString) : null

    const filterPreferencesString = localStorage.getItem(KEY_FILTERPREFERENCES)
    const filterPreferences = parseIfPossible(filterPreferencesString) as EventFilterPreferences | null
    data.filterPreferences = filterPreferences ?? data.filterPreferences

    const homeAssociationString = localStorage.getItem(KEY_HOMEASSOCIATION)
    data.homeAssociation = parseIfPossible(homeAssociationString) as SubAssociationDto | null
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

  public isCampaignAdmin(): boolean {
    return this.state.user?.roles.includes(CAMPAIGN_ADMIN) ?? false
  }

  public isTeamCaptainOrLocalCoordinator(): boolean {
    return this.getMyTeamCaptainOrCoordinatorPermissions().length !== 0
  }

  public getMyPermissions() {
    return this.state.permissions.filter(
      (permission) => permission.user == this.state.user?.id
    )
  }

  public getMyTeamCaptainOrCoordinatorPermissions() {
    return this.getMyPermissions().filter(
      (permission) => permission.permission_codename == 'team_captain'
        || permission.permission_codename == 'manages_events'
    )
  }

  public setPermissions(permissions: UserObjectPermissionDto[]) {
    this.state.permissions = permissions
  }

  public hasAtLeastOneManagePermission() {
    if (this.state.user?.roles.includes(CAMPAIGN_ADMIN) == true || this.state.user?.is_superuser) {
      return true
    }
    return this.state.permissions
      .map(({permission_codename}) => permission_codename)
      .includes(PermissionCodename.MANAGE_EVENTS)
  }

  public isAdminOrGlobalCoordinator() {
    if (this.state.user?.roles.includes(CAMPAIGN_ADMIN) == true || this.state.user?.is_superuser) {
      return true
    }
    else {
      return false
    }
  }

  public setUser(user: UserDto) {
    this.state.user = user
  }
}

export const userStore = new UserStore()
