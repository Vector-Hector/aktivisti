import { Store } from '@/store/Store'
import { TokenDto } from '@/api/model/TokenDto'

interface TokenStoreState {
  token: TokenDto | null
  updated: Date | null
}

const KEY_TOKEN = 'KEY_TOKEN'
const KEY_UPDATED = 'KEY_UPDATED'

class TokenStore extends Store<TokenStoreState> {
  protected data(): TokenStoreState {
    const rawToken = localStorage.getItem(KEY_TOKEN)
    let token = null
    if (rawToken !== null) {
      token = JSON.parse(rawToken)
    }

    const rawUpdated = localStorage.getItem(KEY_UPDATED)
    let updated = null
    if (rawUpdated !== null) {
      updated = new Date(rawUpdated)
    }

    return {
      token,
      updated
    }
  }

  public getTokenDto() {
    return this.state.token
  }

  public setTokenDto(token: TokenDto) {
    this.state.updated = new Date()
    localStorage.setItem(KEY_UPDATED, this.state.updated.getTime().toString())
    localStorage.setItem(KEY_TOKEN, JSON.stringify(token))
    this.state.token = token
  }

  public get expiryDate(): Date | null {
    if (this.state.updated !== null && this.state.token?.expires_in !== null) {
      return new Date(this.state.updated.getTime() + this.state.token!.expires_in * 1000)
    }
    return null
  }

  public removeTokenDto() {
    localStorage.removeItem(KEY_TOKEN)
    localStorage.removeItem(KEY_UPDATED)
    this.state.token = null
    this.state.updated = null
  }
}

export const tokenService = new TokenStore()