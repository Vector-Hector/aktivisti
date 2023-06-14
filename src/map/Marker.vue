<template>
  <div ref="markerElement" class="marker">
    <slot name="marker">
      <QIcon class="marker-icon" :name="ionLocationSharp" />
    </slot>
    <slot v-if="initialized" />
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  provide,
  InjectionKey,
  onMounted,
  PropType,
  Ref,
  ref,
  watch,
  onUnmounted
} from 'vue'
import { Marker } from 'maplibre-gl'
import { LocationDto } from 'src/api/model/LocationDto'
import { ionLocationSharp } from '@quasar/extras/ionicons-v5'
import { QIcon } from 'quasar'
import { useMap } from 'src/map/Map.vue'

export const MarkerInject: InjectionKey<Ref<Marker | null>> = Symbol()

export default defineComponent({
  name: 'Marker',
  props: {
    location: {
      type: Object as PropType<LocationDto>,
      required: true
    },
    draggable: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  components: {
    QIcon
  },
  emits: ['update:location'],
  setup(props, { emit }) {
    const map = useMap()
    const initialized = ref(false)
    const markerElement = ref<HTMLElement | null>(null)
    const marker = ref<Marker | null>(null)
    provide(MarkerInject, marker)

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

    return {
      ionLocationSharp,
      marker,
      markerElement,
      initialized
    }
  }
})
</script>
<style lang="scss" scoped>
.marker-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 99;
  color: $primary;
}
</style>
