import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

const DEFAULT_ADOPT_EVENT_AREA_STORE = {
  isAdoptingPosters: false,
  isAdoptingCompletionNotes: false
}

export const useAdoptEventAreaStore = defineStore('adoptEventArea', () => {
  const isAdoptingPosters = ref(
    DEFAULT_ADOPT_EVENT_AREA_STORE.isAdoptingPosters
  )
  const isAdoptingCompletionNotes = ref(
    DEFAULT_ADOPT_EVENT_AREA_STORE.isAdoptingCompletionNotes
  )

  function $reset() {
    isAdoptingPosters.value = DEFAULT_ADOPT_EVENT_AREA_STORE.isAdoptingPosters
    isAdoptingCompletionNotes.value =
      DEFAULT_ADOPT_EVENT_AREA_STORE.isAdoptingCompletionNotes
  }

  return {
    isAdoptingCompletionNotes,
    isAdoptingPosters,
    $reset
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useAdoptEventAreaStore, import.meta.hot)
  )
}
