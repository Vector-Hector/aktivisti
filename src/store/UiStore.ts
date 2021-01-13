import { Store } from '@/store/Store'

interface UiState {
  sidebarExpanded: boolean
}

class UiStore extends Store<UiState> {
  protected data(): UiState {
    return {
      sidebarExpanded: false
    }
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
