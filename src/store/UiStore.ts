import { Store } from '@/store/Store'

export interface TitleElements {
  event?: string
  campaigns?: string
  street?: string
  streetNumber?: string
}

interface UiState {
  sidebarExpanded: boolean
  showNavigation: boolean
  activeTitleElements: TitleElements
}

class UiStore extends Store<UiState> {
  protected data(): UiState {
    return {
      sidebarExpanded: false,
      showNavigation: true,
      activeTitleElements: {}
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

  public setActiveElements(titleElements: TitleElements) {
    this.state.activeTitleElements =
      {
        ...this.state.activeTitleElements,
        ...titleElements
      }
  }
}

export const uiStore = new UiStore()
