import router from '@/router'
import { userStore } from '@/store/UserStore'

const tokenService = {
  getToken(tokenType: string) {
    return localStorage.getItem(tokenType)
  },

  setToken(tokenType: string, token: string) {
    userStore.setToken(token)
    localStorage.setItem(tokenType, token)
  },

  removeToken(tokenType: string) {
    userStore.setToken('')
    localStorage.removeItem(tokenType)
    router.push('/login')
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