<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Popup } from 'maplibre-gl'
import { useMap } from 'src/map/MapUtils'

interface Props {
  coordinates: Array<number>
  hasOffset?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  hasOffset: true
})
const emit = defineEmits<Emits>()

const map = useMap()
const popupElement = ref<HTMLElement | null>(null)
const popup = ref<Popup | null>(null)

onMounted(() => {
  popup.value = new Popup().setLngLat(props.coordinates as [number, number])
  popup.value?.setDOMContent(popupElement.value!)
  popup.value.addTo(map.value)
  if (props.hasOffset) {
    popup.value.setOffset([0, -24])
  }
  popup.value.on('close', () => emit('close'))
})

onUnmounted(() => {
  popup.value?.remove()
})
</script>

<template>
  <div ref="popupElement" class="popup">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@import 'src/css/variables';

.popup {
  padding: 6px 3px 0 3px;
}
</style>
