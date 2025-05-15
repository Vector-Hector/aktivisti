import { Store } from 'src/store/Store'
import { CAMPAIGN_ADMIN, UserDto } from 'src/api/model/UserDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { parseIfPossible } from 'src/utils/json'
import {
  PermissionCodename,
  UserObjectPermissionDto
} from 'src/api/model/UserObjectPermissionDto'
import { EventTypes } from 'src/api/model/EventTypes'
import { EventStatus } from 'src/api/model/EventStatus'
import { ReportChartData } from 'src/api/model/ReportChartData'

export enum SortOption {
  START_DATE = 'start_date',
  NAME = 'name'
}

export interface EventFilterPreferences {
  subAssociations: number[]
  campaign: number | undefined
  sorting: SortOption
  eventType: EventTypes | undefined
  status: EventStatus | undefined
  is_owner: boolean | undefined
  management_permission: boolean | undefined
}

interface UserState {
  user: UserDto | null
  homeAssociation: SubAssociationDto | null
  bbox: BBox2d | null
  locale: string | null
  filterPreferences: EventFilterPreferences
  permissions: UserObjectPermissionDto[]
  reportCharts: ReportChartData[]
  pushNotifications: boolean
}

const KEY_BBOX = 'KEY_BBOX'
const KEY_FILTERPREFERENCES = 'KEY_FILTERPREFERENCES'
const KEY_REPORT_CHARTS = 'KEY_REPORT_CHARTS'
const KEY_PUSH_NOTIFICATIONS = 'KEY_PUSH_NOTIFICATIONS'
const KEY_LOCALE = 'de'
export const DEFAULT_FILTER_PREFERENCES = {
  subAssociations: [],
  campaign: undefined,
  sorting: SortOption.START_DATE,
  eventType: undefined,
  status: EventStatus.ACTIVE,
  is_owner: undefined,
  management_permission: false
}

class UserStore extends Store<UserState> {
  protected data(): UserState {
    return {
      user: null,
      permissions: [],
      bbox: null,
      locale: process.env.APP_LANGUAGE || 'de',
      homeAssociation: null,
      filterPreferences: DEFAULT_FILTER_PREFERENCES,
      reportCharts: [],
      pushNotifications: false
    }
  }

  protected setup(data: UserState) {
    super.setup(data)

    const bboxString = localStorage.getItem(KEY_BBOX)
    data.bbox = bboxString ? JSON.parse(bboxString) : null

    const reportChartsString = localStorage.getItem(KEY_REPORT_CHARTS)
    data.reportCharts = reportChartsString ? JSON.parse(reportChartsString) : []

    const filterPreferencesString = localStorage.getItem(KEY_FILTERPREFERENCES)
    const filterPreferences = parseIfPossible(
      filterPreferencesString
    ) as EventFilterPreferences | null
    data.filterPreferences = filterPreferences ?? data.filterPreferences
    const pushNotifications = localStorage.getItem(KEY_PUSH_NOTIFICATIONS)
    data.pushNotifications =
      (pushNotifications && JSON.parse(pushNotifications)) ?? false
  }

  public setBbox(bbox: BBox2d | null) {
    this.state.bbox = bbox
    if (bbox) {
      localStorage.setItem(KEY_BBOX, JSON.stringify(bbox))
    } else {
      localStorage.removeItem(KEY_BBOX)
    }
  }

  public setLocale(locale: string | null) {
    this.state.locale = locale
    if (locale) {
      localStorage.setItem(KEY_LOCALE, locale)
    } else {
      localStorage.removeItem(KEY_LOCALE)
    }
  }

  public setFilterPreferences(filterPreferences: EventFilterPreferences) {
    this.state.filterPreferences = filterPreferences
    localStorage.setItem(
      KEY_FILTERPREFERENCES,
      JSON.stringify(filterPreferences)
    )
  }

  /**
   * Resets the filter preferences to the default state.
   */
  public clearFilterPreferences() {
    this.setFilterPreferences(DEFAULT_FILTER_PREFERENCES)
  }

  public setHomeAssociation(value: SubAssociationDto | null) {
    this.state.homeAssociation = value
  }

  public setPushNotificationPreferences(value: boolean) {
    this.state.pushNotifications = value
    localStorage.setItem(KEY_PUSH_NOTIFICATIONS, JSON.stringify(value))
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
      (permission) => permission.user == this.state.user?.username
    )
  }

  public getMyTeamCaptainOrCoordinatorPermissions() {
    return this.getMyPermissions().filter(
      (permission) =>
        permission.permission_codename == PermissionCodename.TEAM_CAPTAIN ||
        permission.permission_codename == PermissionCodename.MANAGE_EVENTS
    )
  }

  public setPermissions(permissions: UserObjectPermissionDto[]) {
    this.state.permissions = permissions
  }

  public setReportCharts(reportChats: ReportChartData[] | null) {
    this.state.reportCharts = reportChats ? reportChats : []
    if (reportChats) {
      localStorage.setItem(
        KEY_REPORT_CHARTS,
        JSON.stringify(this.state.reportCharts)
      )
    } else {
      localStorage.removeItem(KEY_REPORT_CHARTS)
    }
  }

  public hasAtLeastOneManagePermission() {
    if (
      this.state.user?.roles.includes(CAMPAIGN_ADMIN) ||
      this.state.user?.is_superuser
    ) {
      return true
    }
    return this.state.permissions
      .map(({ permission_codename }) => permission_codename)
      .includes(PermissionCodename.MANAGE_EVENTS)
  }

  public isAdminOrGlobalCoordinator() {
    if (
      this.state.user?.roles.includes(CAMPAIGN_ADMIN) ||
      this.state.user?.is_superuser
    ) {
      return true
    } else {
      return false
    }
  }

  public setUser(user: UserDto) {
    this.state.user = user
  }

  public reset() {
    localStorage.removeItem(KEY_REPORT_CHARTS)
    super.reset()
  }
}

export const userStore = new UserStore()
