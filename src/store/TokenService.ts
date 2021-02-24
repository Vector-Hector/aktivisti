import { userStore } from '@/store/UserStore'

type TokenType = 'access_token' | 'refresh_token'

const tokenService = {
  getToken(tokenType: TokenType) {
    return localStorage.getItem(tokenType)
  },

  setToken(tokenType: TokenType, token: string) {
    userStore.setToken(token)
    localStorage.setItem(tokenType, token)
  },

  removeToken(tokenType: TokenType) {
    userStore.setToken('')
    localStorage.removeItem(tokenType)
  },

  getExpiry() {
    return localStorage.getItem('expiry')
  },

  setExpiry(seconds: number) {
    localStorage.setItem('expiry', JSON.stringify(new Date().getTime() + seconds))  
  },

  isTokenExpired() {
    const expirationDate = this.getExpiry()
    if (!expirationDate) return true
    return parseInt(expirationDate) < new Date().getTime()
  },

  removeExpiry() {
    localStorage.removeItem('expiry')
  }
}

export { tokenService }