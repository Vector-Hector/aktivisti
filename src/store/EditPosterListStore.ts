import { Store } from 'src/store/Store'
import { PosterDto } from 'src/api/model/PosterDto'

interface EditPosterListStoreState {
  posters: Partial<PosterDto>[]
  activePosterIndex: number | null
}

class EditPosterListStore extends Store<EditPosterListStoreState> {
  data() {
    return {
      posters: [],
      activePosterIndex: null
    }
  }
}

export const editPosterListStore = new EditPosterListStore()
