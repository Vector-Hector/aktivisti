import { Store } from 'src/store/Store'
import { EventFilterPreferences, SortOption } from 'src/store/UserStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'

interface MyParticipationsStoreState {
  filterPreferences: EventFilterPreferences,
  eventParticipations: EventParticipationDto[]
}

class MyParticipationsStore extends Store<MyParticipationsStoreState> {

  protected data(): MyParticipationsStoreState {
    return {
      filterPreferences: {
        subAssociations: [],
        campaign: undefined,
        sorting: SortOption.START_DATE
      },
      eventParticipations: [] as EventParticipationDto[]

    }
  }

  public setFilterPreferences(filterPreferences: EventFilterPreferences) {
    this.state.filterPreferences = filterPreferences
  }


  public setEventParticipations(eventParticipations: EventParticipationDto[]){
    this.state.eventParticipations = eventParticipations
  }
}

export const myParticipationsStore = new MyParticipationsStore()
