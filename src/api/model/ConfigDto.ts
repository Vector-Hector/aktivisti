export enum VersionHealth {
  UNKNOWN = 'UNKNOWN',
  OBSOLETE = 'OBSOLETE',
  DEPRECATED = 'DEPRECATED',
  CURRENT = 'CURRENT'
}

export interface ConfigDto {
  registration_disabled: boolean
  version_health: VersionHealth
}
