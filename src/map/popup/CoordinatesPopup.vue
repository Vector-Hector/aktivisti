<template>
  <div ref="popupElement" class="popup">
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { inject, onMounted, onUnmounted, PropType, ref } from 'vue'
import { Popup } from 'maplibre-gl'
import { MapInject } from '../Map.vue'

const map = inject(MapInject)
const popupElement = ref<HTMLElement | null>(null)
const popup = ref<Popup | null>(null)
const emit = defineEmits(['close'])
const props = defineProps({
  coordinates: {
    type: Array as PropType<Array<number>>,
    required: true
  }
})
onMounted(() => {
  popup.value = new Popup().setLngLat(props.coordinates as [number, number])
  popup.value?.setDOMContent(popupElement.value!)
  popup.value.addTo(map.value)
  popup.value.setOffset([0, -24])
  popup.value.on('close', () => emit('close'))
})

onUnmounted(() => {
  popup.value?.remove()
})
</script>
<style lang="scss" scoped>
@import 'src/css/variables';

.popup {
  padding: 6px 3px 0 3px;
}
</style>
