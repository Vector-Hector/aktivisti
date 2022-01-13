<template>
  <div class="popup" ref="popupElement">
    <slot v-if="passedObject" name="content" :passedObject="passedObject" />
  </div>
</template>
<script lang="ts">

import { defineComponent, inject, onUnmounted, ref } from 'vue'
import { Popup } from 'mapbox-gl'
import { MapInject } from 'src/mapbox/Map.vue'

export default defineComponent({
  name: 'LayerPopup',
  setup() {
    const map = inject(MapInject)!
    const popupElement = ref<HTMLElement | null>(null)
    const popup = ref<Popup | null>(null)
    const passedObject = ref<any | null>(null)

    function showPopup(lng: number, lat: number, object: any) {
      passedObject.value = object
      popup.value = new Popup({offset: [0, -24]})
        .setLngLat([lng, lat])
        .setDOMContent(popupElement.value!)
        .addTo(map.value)
    }

    onUnmounted(() => {
      popup.value?.remove()
    })
    return {
      passedObject,
      popup,
      popupElement,
      showPopup
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
