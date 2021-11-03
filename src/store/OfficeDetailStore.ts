import { OfficeDto } from 'src/api/model/OfficeDto'
import { Store } from 'src/store/Store'

interface OfficeDetailStoreState {
  office: OfficeDto | null
}

class OfficeDetailStore extends Store<OfficeDetailStoreState> {
  protected data(): OfficeDetailStoreState {
    return {
      office: null
    }
  }

  public set office(office: OfficeDto | null) {
    this.state.office = office
  }

  public get office(): OfficeDto | null {
    return this.getState().office
  }

}

export const officeDetailStore = new OfficeDetailStore()
