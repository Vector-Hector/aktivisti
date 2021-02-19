<template>
  <div
    ref="popupElement"
    class="popup"
  >
    <slot />
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, onMounted, ref } from 'vue'
import { Popup } from 'mapbox-gl'
import { MarkerInject } from './Marker.vue'

export default defineComponent({
  name: 'Popup',
  setup() {
    const marker = inject(MarkerInject)
    const popupElement = ref<HTMLElement | null>(null)
    const popup = ref<Popup | null>(null)
    onMounted(() => {
      popup.value = new Popup(popupElement.value!)
      popup.value
        .setDOMContent(popupElement.value!)
      marker?.value.setPopup(popup.value)
    })

    return {
      popup,
      popupElement
    }
  }
})

</script>
<style lang="scss" scoped>
@import "~@/scss/_variables.scss";

.popup {
  padding: 6px 3px 0 3px;
}

</style>
