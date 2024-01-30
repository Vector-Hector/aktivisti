<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'
import { Marker } from 'maplibre-gl'
import { LocationDto } from 'src/api/model/LocationDto'
import { ionLocationSharp } from '@quasar/extras/ionicons-v5'
import { QIcon } from 'quasar'
import { useMap } from 'src/map/MapUtils'

interface Props {
  location: LocationDto
  draggable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  draggable: false
})

interface Emits {
  (e: 'update:location', location: maplibregl.LngLat | undefined): void
}
const emit = defineEmits<Emits>()

const map = useMap()
const initialized = ref(false)
const markerElement = ref<HTMLElement | null>(null)
const marker = ref<Marker | null>(null)

watch(
  () => props.location,
  (location) => {
    marker.value?.setLngLat([location.lng, location.lat])
  }
)

onMounted(() => {
  marker.value = new Marker({
    element: markerElement.value!,
    draggable: props.draggable,
    anchor: 'bottom'
  })
  marker.value
    .setLngLat([props.location.lng, props.location.lat])
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    .addTo(map!.value)
  initialized.value = true

  marker.value.on('dragend', () => {
    emit('update:location', marker.value?.getLngLat())
  })
})

onUnmounted(() => {
  marker?.value?.remove()
})
</script>

<template>
  <div ref="markerElement" class="marker">
    <slot name="marker">
      <QIcon class="marker-icon" :name="ionLocationSharp" />
    </slot>
    <slot v-if="initialized" />
  </div>
</template>

<style lang="scss" scoped>
.marker-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 99;
  color: $primary;
}
</style>
