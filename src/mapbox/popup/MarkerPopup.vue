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
import { MarkerInject } from 'src/mapbox/Marker.vue'

export default defineComponent({
  name: 'MarkerPopup',
  setup() {
    const marker = inject(MarkerInject)
    const popupElement = ref<HTMLElement | null>(null)
    const popup = ref<Popup | null>(null)
    onMounted(() => {
      popup.value = new Popup(popupElement.value!)
      popup.value?.setDOMContent(popupElement.value!)
      marker?.value.setPopup(popup.value)
      popup.value.setOffset([0, -24])
    })

    return {
      popup,
      popupElement
    }
  }
})

</script>
<style lang="scss" scoped>
@import "src/css/variables";

.popup {
  padding: 6px 3px 0 3px;
}

</style>
