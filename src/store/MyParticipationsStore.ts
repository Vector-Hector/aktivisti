import { Store } from 'src/store/Store'
import { EventFilterPreferences, SortOption } from 'src/store/UserStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
//TODO(peter) Remove filter Preferences
// It seems like the `fitlerPrerences` of `myParticipationsStore` aren't used,
// so they could be removed, also with the depending function to set it.
// It might also be good Refactor this store completly.
interface MyParticipationsStoreState {
  filterPreferences: EventFilterPreferences
  eventParticipations: EventParticipationDto[]
}

class MyParticipationsStore extends Store<MyParticipationsStoreState> {
  protected data(): MyParticipationsStoreState {
    return {
      filterPreferences: {
        subAssociations: [],
        campaign: undefined,
        sorting: SortOption.START_DATE_DESC,
        eventType: undefined,
        status: undefined,
        is_owner: undefined,
        management_permission: undefined
      },
      eventParticipations: [] as EventParticipationDto[]
    }
  }

  public setFilterPreferences(filterPreferences: EventFilterPreferences) {
    this.state.filterPreferences = filterPreferences
  }

  public setEventParticipations(eventParticipations: EventParticipationDto[]) {
    this.state.eventParticipations = eventParticipations
  }
}

export const myParticipationsStore = new MyParticipationsStore()
