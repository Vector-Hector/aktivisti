import { userStore } from 'src/store/UserStore'
import { apiClient } from 'src/api/ApiClient'
import { LoginDto } from 'src/api/model/LoginDto'
import { oAuth2Client } from 'src/api/OAuth2Client'
import { TokenDto } from 'src/api/model/TokenDto'
import { date } from 'quasar'
import { BaseAuthStore, BaseAuthStoreState } from 'src/store/BaseAuthStore'
import { Storage } from '@capacitor/storage'
import { parseIfPossible } from 'src/utils/json'

interface TokenAuthStoreState extends BaseAuthStoreState {
  tokenSet: TokenDto | null
}

const KEY_TOKENSET = 'KEY_TOKENSET'

export class TokenAuthStore extends BaseAuthStore<TokenAuthStoreState> {

  protected data(): TokenAuthStoreState {
    return {
      userId: null,
      tokenSet: null
    }
  }

  async loadFromNativeStorage() {
    this.state.tokenSet = parseIfPossible((await Storage.get({key: KEY_TOKENSET})).value) as TokenDto | null
  }

  // eslint-disable-next-line @typescript-eslint/require-await
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
    const profileRequest = await apiClient.user.get('me', ['sub_association'])
    const permissionsRequest = await apiClient.userPermissions.list({user: profileRequest.payload.data.id})
    this.state.userId = profileRequest.payload.data.id
    userStore.setPermissions(permissionsRequest.payload.data)
    userStore.setUser(profileRequest.payload.data)
    userStore.setHomeAssociation(profileRequest.payload.embedded.sub_association?.[0] ?? null)
  }

  setUserId(value: number | null) {
    this.state.userId = value
  }

  isLoggedIn() {
    return this.state.userId !== null
  }

  async renewLogin() {
    if (this.state.tokenSet?.refresh_token) {
      this.state.tokenSet = (await oAuth2Client.token({
        grant_type: 'refresh_token',
        refresh_token: this.state.tokenSet?.refresh_token,
        client_id: process.env.APP_CLIENT_ID!
      })).payload
      await this.setTokenSet(this.state.tokenSet)
    }
  }
}

export const tokenAuthStore = new TokenAuthStore()
