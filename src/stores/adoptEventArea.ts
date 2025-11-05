import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

const DEAFULT_ADOPT_EVENT_AREA_STORE = {
  isAdoptingPosters: false
}

export const useAdoptEventAreaStore = defineStore('adoptEventArea', () => {
  const isAdoptingPosters = ref(
    DEAFULT_ADOPT_EVENT_AREA_STORE.isAdoptingPosters
  )

  function $reset() {
    isAdoptingPosters.value = DEAFULT_ADOPT_EVENT_AREA_STORE.isAdoptingPosters
  }

  return {
    isAdoptingPosters,
    $reset
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useAdoptEventAreaStore, import.meta.hot)
  )
}
