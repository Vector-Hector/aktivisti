import { ContentTypeNaturalKey } from 'src/api/model/ContentTypeDto'

export enum PermissionCodename {
  MANAGE_EVENTS = 'manages_events',
  TEAM_CAPTAIN = 'team_captain',
  NONE = 'none'
}

export interface PermissionTypeOption {
  key: PermissionCodename,
  label: string,
}

export const permissionTypeOptions: PermissionTypeOption[] = [{
  key: PermissionCodename.NONE,
  label: 'Keine Rechte'
}, {
  key: PermissionCodename.TEAM_CAPTAIN,
  label: 'Teamcaptain'
}, {
  key: PermissionCodename.MANAGE_EVENTS,
  label: 'Koordinator*in'
}]

export interface UserObjectPermissionDto {
  id: number
  permission_name: string
  permission_codename: PermissionCodename
  permission: number
  object_pk: string
  content_type: number
  content_object_name: string
  content_type_name: string
  content_type_natural_key: ContentTypeNaturalKey
  user: string
}
