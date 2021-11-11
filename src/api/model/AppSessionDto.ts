export enum AppSessionType {
  MOBILE_APP = 'M',
  BROWSER = 'B'
}

export interface AppSessionDto {
  id: string,
  session_type: AppSessionType,
  user_agent_browser: string,
  user_agent_device_family: string,
  user_agent_os: string,
  user_agent_os_version: string,
  created_at: string,
  expires_at: string,
  is_active: boolean
}
