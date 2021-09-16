import { LoginDto } from 'src/api/model/LoginDto'
import { oAuth2Client } from 'src/api/OAuth2Client'
import { TokenDto } from 'src/api/model/TokenDto'
import { date } from 'quasar'
import { BaseAuthStore, BaseAuthStoreState } from 'src/store/BaseAuthStore'
import { Storage } from '@capacitor/storage'
import { parseIfPossible } from 'src/utils/json'

interface TokenAuthStoreState extends BaseAuthStoreState {
  tokenSet: TokenDto | null
  renewTokenPromise: Promise<void> | null
}

const KEY_TOKENSET = 'KEY_TOKENSET'

export class TokenAuthStore extends BaseAuthStore<TokenAuthStoreState> {

  protected data(): TokenAuthStoreState {
    return {
      userId: null,
      tokenSet: null,
      renewTokenPromise: null
    }
  }

  async loadFromNativeStorage() {
    this.state.tokenSet = parseIfPossible((await Storage.get({key: KEY_TOKENSET})).value) as TokenDto | null
  }

  async logout() {
    await this.setTokenSet(null)
    this.deleteSessionData()
  }

  clear() {
    void this.setTokenSet(null)
    this.reset()
  }

  expiryDate(): Date | undefined {
    if (this.state.tokenSet?.expires_in) {
      const expiryDate = new Date()
      date.addToDate(expiryDate, {seconds: this.state.tokenSet.expires_in})
      return expiryDate
    } else {
      return undefined
    }
  }

  async setTokenSet(tokenSet: TokenDto | null) {
    this.state.tokenSet = tokenSet
    if (tokenSet) {
      await Storage.set({
        key: KEY_TOKENSET,
        value: JSON.stringify(tokenSet)
      })
    } else {
      await Storage.remove({key: KEY_TOKENSET})
    }
  }

  async auth(params: LoginDto) {
    const tokenResponse = await oAuth2Client.token({
      grant_type: 'password',
      username: params.identifier,
      password: params.password,
      client_id: process.env.APP_CLIENT_ID!
    })
    await this.setTokenSet(tokenResponse.payload)
  }

  async renewToken()  {
    this.state.tokenSet = (await oAuth2Client.token({
      grant_type: 'refresh_token',
      refresh_token: this.state.tokenSet?.refresh_token,
      client_id: process.env.APP_CLIENT_ID!
    })).payload
    await this.setTokenSet(this.state.tokenSet)
    this.state.renewTokenPromise = null
  }

  async renewLogin() {
    if (this.state.renewTokenPromise == null && this.state.tokenSet?.refresh_token) {
      this.state.renewTokenPromise = this.renewToken()
    }
    if (this.state.renewTokenPromise) {
      await this.state.renewTokenPromise
    }
  }
}

export const tokenAuthStore = new TokenAuthStore()
