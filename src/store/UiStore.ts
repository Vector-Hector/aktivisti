import { Store } from '@/store/Store'

export interface TitleElements {
  event?: string
  campaigns?: string
  street?: string
  houseNumber?: string
}

export enum BottomSheetState {
  COLLAPSED = 'collapsed',
  HALF = 'half',
  EXPANDED = 'expanded'
}

interface UiState {
  sidebarExpanded: boolean
  showNavigation: boolean
  activeTitleElements: TitleElements
  bottomSheetState: BottomSheetState
}

class UiStore extends Store<UiState> {
  protected data(): UiState {
    return {
      sidebarExpanded: false,
      showNavigation: true,
      activeTitleElements: {},
      bottomSheetState: BottomSheetState.COLLAPSED
    }
  }

  public toggleNavigation(enabled = true) {
    this.state.showNavigation = enabled
  }

  public toggleSidebar(expanded = true) {
    this.state.sidebarExpanded = expanded
  }

  public openSidebar() {
    this.toggleSidebar(true)
  }

  public closeSidebar() {
    this.toggleSidebar(false)
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
