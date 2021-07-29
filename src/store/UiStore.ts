import { Store } from 'src/store/Store'

export interface TitleElements {
  event?: string
  eventArea?: string
  poster?: string,
  campaigns?: string
  street?: string
  houseNumber?: string
}

export enum BottomSheetState {
  COLLAPSED = 'collapsed',
  HALF = 'half',
  EXPANDED = 'expanded'
}

const BottomSheetStateOrder: { [key in BottomSheetState]: number } = {
  [BottomSheetState.COLLAPSED]: 0,
  [BottomSheetState.HALF]: 1,
  [BottomSheetState.EXPANDED]: 2
}

interface UiState {
  sidebarExpanded: boolean
  activeTitleElements: TitleElements
  bottomSheetState: BottomSheetState
}

class UiStore extends Store<UiState> {
  protected data(): UiState {
    return {
      sidebarExpanded: false,
      activeTitleElements: {},
      bottomSheetState: BottomSheetState.COLLAPSED
    }
  }

  public toggleSidebar(expanded = true) {
    this.state.sidebarExpanded = expanded
  }

  public setBottomSheetStateAtLeast(value: BottomSheetState) {
    if (BottomSheetStateOrder[value] > BottomSheetStateOrder[this.state.bottomSheetState]) {
      this.state.bottomSheetState = value
    }
  }

  public setBottomSheetState(value: BottomSheetState) {
    this.state.bottomSheetState = value
  }

  public updateActiveElements(titleElements: TitleElements) {
    this.state.activeTitleElements =
      {
        ...this.state.activeTitleElements,
        ...titleElements
      }
  }
}

export const uiStore = new UiStore()
