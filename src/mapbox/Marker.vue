<template>
  <div
    ref="markerElement"
    class="marker"
  >
    <slot name="marker">
      <i class="marker-icon" />
    </slot>
    <slot v-if="initialized" />
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  inject,
  provide,
  InjectionKey,
  onMounted,
  PropType,
  Ref,
  ref,
  watch,
  onUnmounted
} from 'vue'
import { Marker } from 'mapbox-gl'
import { LocationDto } from 'src/api/model/LocationDto'
import { MapInject } from './Map.vue'

export const MarkerInject: InjectionKey<Ref<Marker>> = Symbol()

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
  emits: ['update:location'],
  setup(props, { emit }) {
    const map = inject(MapInject)
    const initialized = ref(false)
    const markerElement = ref<HTMLElement | null>(null)
    const marker = ref<Marker | null>(null)
    provide(MarkerInject, marker)

    watch(() => props.location, (location) => {
      marker.value?.setLngLat([location.lng, location.lat])
    })

    onMounted(() => {
      marker.value = new Marker({
        element: markerElement.value!,
        draggable: props.draggable
      })
      marker.value
        .setLngLat([props.location.lng, props.location.lat])
        .addTo(map!.value!)
      initialized.value = true

      marker.value.on('dragend', () => {
        emit('update:location', marker.value?.getLngLat())
      })
    })

    onUnmounted(() => {
      marker?.value?.remove()
    })

    return {
      marker,
      markerElement,
      initialized
    }
  }
})

</script>
