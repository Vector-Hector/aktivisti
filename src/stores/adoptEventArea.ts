import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

const DEAFULT_ADOPT_EVENT_AREA_STORE = {
  isAdoptingPosters: false,
  isAdoptingCompletionNotes: false
}

export const useAdoptEventAreaStore = defineStore('adoptEventArea', () => {
  const isAdoptingPosters = ref(
    DEAFULT_ADOPT_EVENT_AREA_STORE.isAdoptingPosters
  )
  const isAdoptingCompletionNotes = ref(
    DEAFULT_ADOPT_EVENT_AREA_STORE.isAdoptingCompletionNotes
  )

  function $reset() {
    isAdoptingPosters.value = DEAFULT_ADOPT_EVENT_AREA_STORE.isAdoptingPosters
    isAdoptingCompletionNotes.value =
      DEAFULT_ADOPT_EVENT_AREA_STORE.isAdoptingCompletionNotes
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
