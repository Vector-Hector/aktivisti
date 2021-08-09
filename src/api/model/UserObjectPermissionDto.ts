export enum PermissionCodename {
  MANAGE_EVENTS = 'manages_events',
  TEAM_CAPTAIN = 'team_captain',
  NONE = 'none'
}

export enum ContentType {
  SUB_ASSOCIATION = 'Sub association'
}

export const permissionTypeOptions: { key: string, label: string }[] = [{
  key: PermissionCodename.NONE,
  label: 'Mitglied'
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
  permission_codename: string
  permission: number
  object_pk: string
  content_type: number
  content_object_name: string
  content_type_name: string
  user: number
}
