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
import { defineComponent, inject, provide, InjectionKey, onMounted, PropType, Ref, ref } from 'vue'
import { Marker } from 'mapbox-gl'
import { LocationDto } from '@/api/model/LocationDto'
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
    onMounted(() => {
      marker.value = new Marker({
        element: markerElement.value!,
        draggable: props.draggable
      })
      marker.value
        .setLngLat([props.location.lng, props.location.lat])
        .addTo(map!.value)
      initialized.value = true

      marker.value.on('dragend', () => {
        emit('update:location', marker.value?.getLngLat())
      })
    })

    return {
      marker,
      markerElement,
      initialized
    }
  }
})

</script>
<style lang="scss" scoped>
@import "~@/scss/_color.scss";

.marker-icon {
  background-image: url("~@/assets/marker.png");
  background-size: cover;
  display: block;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
</style>
