import { Store } from '@/store/Store'

interface UiState {
  sidebarExpanded: boolean,
  showNavigation: boolean
}

class UiStore extends Store<UiState> {
  protected data(): UiState {
    return {
      sidebarExpanded: false,
      showNavigation: true
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
}

export const uiStore = new UiStore()
