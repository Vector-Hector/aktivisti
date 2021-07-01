export enum ObjectPermissions {
  TeamCaptain = 'team_captain',
  Coordinator = 'manages_events'
}

export interface ObjectPermissionDto {
  permissions: string[]
}
