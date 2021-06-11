export enum PermissionCodename {
  MANAGE_EVENTS = 'manages_events'
}

export interface UserObjectPermissionDto {
  id: number
  permission_name: string
  permission_codename: string
  permission: number
  object_pk: string
  content_type: number
  content_object_name: string
  content_type_name: string
}
