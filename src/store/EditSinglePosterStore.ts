import { Store } from 'src/store/Store'
import { PosterDto } from 'src/api/model/PosterDto'

interface EditSinglePosterStoreState {
  poster: Partial<PosterDto> | null
}

class EditSinglePosterStore extends Store<EditSinglePosterStoreState> {
  data() {
    return {
      poster: null
    }
  }
}

export const editSinglePosterStore = new EditSinglePosterStore()
