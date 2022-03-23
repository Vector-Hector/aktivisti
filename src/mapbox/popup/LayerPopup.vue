<template>
  <div class="popup" ref="popupElement">
    <slot v-if="passedObject" name="content" :passedObject="passedObject" />
  </div>
</template>
<script lang="ts">

import { defineComponent, inject, onUnmounted, ref } from 'vue'
import { Offset, Popup } from 'mapbox-gl'
import { MapInject } from 'src/mapbox/Map.vue'

export default defineComponent({
  name: 'LayerPopup',
  props: {
    showCloseButton: {
      type: Boolean,
      default: true,
    },
    offset:{
      type: Array,
      default: () => [0, -24]
    }
  },
  setup(props) {
    const map = inject(MapInject)!
    const popupElement = ref<HTMLElement | null>(null)
    const popup = ref<Popup | null>(null)
    const passedObject = ref<any | null>(null)

    function showPopup(lng: number, lat: number, object: any) {
      passedObject.value = object
      popup.value = new Popup({offset: props.offset as Offset, closeButton: props.showCloseButton})
        .setLngLat([lng, lat])
        .setDOMContent(popupElement.value!)
        .addTo(map.value)
    }
    function remove() {
      popup.value?.remove()
    }

    onUnmounted(() => {
      popup.value?.remove()
    })
    return {
      passedObject,
      popup,
      popupElement,
      showPopup,
      remove
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
