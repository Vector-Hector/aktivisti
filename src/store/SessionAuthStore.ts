import { apiClient } from 'src/api/ApiClient'
import { LoginDto } from 'src/api/model/LoginDto'
import { BaseAuthStore, BaseAuthStoreState } from 'src/store/BaseAuthStore'

type SessionAuthStoreState = BaseAuthStoreState

class SessionAuthStore extends BaseAuthStore<SessionAuthStoreState> {
  protected data(): SessionAuthStoreState {
    return {
      userId: null
    }
  }

  async logout() {
    await apiClient.session.logout()
    this.deleteSessionData()
  }

  clear() {
    this.reset()
  }

  async auth(params: LoginDto) {
    await apiClient.session.login(params)
    // no error means authentication happened, cookie is set
    await apiClient.session.session()
  }
}

export const sessionAuthStore = new SessionAuthStore()
