import { ContentTypeNaturalKey } from 'src/api/model/ContentTypeDto'
import { useI18n } from 'vue-i18n'

export enum PermissionCodename {
  MANAGE_EVENTS = 'manages_events',
  TEAM_CAPTAIN = 'team_captain',
  NONE = 'none'
}

export interface PermissionTypeOption {
  key: PermissionCodename
  label: string
}

export function usePermissionTypeOptions() {
  const { t } = useI18n()
  function getPermissionTypeOption(): PermissionTypeOption[] {
    return [
      {
        key: PermissionCodename.NONE,
        label: t('api.model.UserObjectPermissionDto.permissionCodename.none')
      },
      {
        key: PermissionCodename.TEAM_CAPTAIN,
        label: t(
          'api.model.UserObjectPermissionDto.permissionCodename.team_captain'
        )
      },
      {
        key: PermissionCodename.MANAGE_EVENTS,
        label: t(
          'api.model.UserObjectPermissionDto.permissionCodename.manages_events'
        )
      }
    ]
  }
  return { getPermissionTypeOption }
}

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
