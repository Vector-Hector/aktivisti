import { Store } from 'src/store/Store'
import { ConfigDto } from 'src/api/model/ConfigDto'

interface ConfigStoreState {
  service_config: ConfigDto
}

class ConfigStore extends Store<ConfigStoreState> {

  protected data(): ConfigStoreState {
    return {
      service_config: {
        registration_disabled: false
      }
    }
  }

  public setServiceConfig(value: ConfigDto) {
    this.state.service_config = value
  }
}

export const configStore = new ConfigStore()
