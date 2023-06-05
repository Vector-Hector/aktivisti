import { sessionAuthStore } from 'src/store/SessionAuthStore'
import { tokenAuthStore } from 'src/store/TokenAuthStore'
import { Capacitor } from '@capacitor/core'

export enum AuthType {
  TOKEN,
  SESSION
}

export function getAuthStore() {
  switch (getAuthType()) {
    case AuthType.SESSION:
      return sessionAuthStore
    case AuthType.TOKEN:
    default:
      return tokenAuthStore
  }
}

export function getAuthType() {
  if (Capacitor.getPlatform() === 'web') {
    return AuthType.SESSION
  } else {
    return AuthType.TOKEN
  }
}
