import { Store } from 'src/store/Store'
import { EventFilterPreferences, SortOption } from 'src/store/UserStore'

interface MyEventsStoreState {
  filterPreferences: EventFilterPreferences
}

class MyEventsStore extends Store<MyEventsStoreState> {

  protected data(): MyEventsStoreState {
    return {
      filterPreferences: {
        subAssociations: [],
        campaign: undefined,
        sorting: SortOption.START_DATE
      }
    }
  }

  public setFilterPreferences(filterPreferences: EventFilterPreferences) {
    this.state.filterPreferences = filterPreferences
  }
}

export const myEventsStore = new MyEventsStore()
