import { userStore } from '@/store/UserStore'
import { Store } from '@/store/Store'


interface LocalStorageState {
  access_token: string
  refresh_token: string
  expiry: number | null
}

type TokenType = 'access_token' | 'refresh_token'

class TokenStore extends Store<LocalStorageState> {
  protected data(): LocalStorageState {
    return {
      access_token: '',
      refresh_token: '',
      expiry: null
    }
  }

  public getToken(tokenType: TokenType) {
    // TODO not sure, where to get it (form this.state or localstorage)
    return localStorage.getItem(tokenType)
  }

  public setToken(tokenType: TokenType, token: string) {
    // TODO not sure, if token should be stored here, in UserStore as well as in localstorage
    userStore.setToken(token)
    switch (tokenType) {
    case 'access_token':
      this.state.access_token = token
      break
    case 'refresh_token':
      this.state.refresh_token = token
      break
    default:
      break;
    }
    localStorage.setItem(tokenType, token)
  }

  public removeToken(tokenType: TokenType) {
    userStore.setToken('')
    switch (tokenType) {
    case 'access_token':
      this.state.access_token = ''
      break
    case 'refresh_token':
      this.state.refresh_token = ''
      break
    default:
      break;
    }
    localStorage.removeItem(tokenType)
  }

  public getExpiry() {
    return localStorage.getItem('expiry')
  }

  public setExpiry(seconds: number) {
    this.state.expiry = new Date().getTime() + seconds
    localStorage.setItem('expiry', JSON.stringify(new Date().getTime() + seconds))  
  }

  public isTokenExpired() {
    const expirationDate = this.getExpiry()
    if (!expirationDate) return true
    return parseInt(expirationDate) < new Date().getTime()
  }

  public removeExpiry() {
    localStorage.removeItem('expiry')
    this.state.expiry = null
  }

  public removeAllData() {
    localStorage.clear()
    // TODO check out 1 line solution or using reset()
    this.state.access_token = ''
    this.state.refresh_token = ''
    this.state.expiry = null
  }
}

export const tokenService = new TokenStore()