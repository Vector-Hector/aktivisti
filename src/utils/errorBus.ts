import { TinyEmitter } from 'tiny-emitter'

export const NO_INTERNET = 'NO_INTERNET'
export const SESSION_INVALID = 'SESSION_INVALID'
export const NOT_AUTHORIZED = 'NOT_AUTHORIZED'
export const USER_NOT_FOUND = 'USER_NOT_FOUND'

export const ErrorBus = new TinyEmitter()
