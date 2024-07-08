<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Offset, Popup } from 'maplibre-gl'
import { useMap } from 'src/map/MapUtils'

interface Props {
  showCloseButton?: boolean
  offset?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: () => true,
  offset: () => [0, -24]
})

const map = useMap()
const popupElement = ref<HTMLElement | null>(null)
const popup = ref<Popup | null>(null)
const passedObject = ref<any | null>(null)

function showPopup(lng: number, lat: number, object: any) {
  passedObject.value = object
  popup.value = new Popup({
    offset: props.offset as Offset,
    closeButton: props.showCloseButton
  })
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

defineExpose({ showPopup, remove })
</script>
<template>
  <div class="popup" ref="popupElement">
    <slot v-if="passedObject" name="content" :passedObject="passedObject" />
  </div>
</template>
<style lang="scss" scoped>
@import 'src/css/variables';

.popup {
  padding: 6px 3px 0 3px;
}
</style>
