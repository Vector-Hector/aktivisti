<template>
  <Marker
    :location="location"
  >
    <template #marker>
      <i
        :class="{
          'marker-icon': true,
          'selected': selected
        }"
      >{{ text }}</i>
    </template>
  </Marker>
</template>
<script lang="ts">
import Marker from '@/lib/mapbox/Marker.vue'
import { defineComponent, PropType } from 'vue'
import { LocationDto } from '@/api/model/LocationDto'

export default defineComponent({
  name: 'AddressMarker',
  components: {Marker},
  props: {
    text: {
      type: String as PropType<string>,
      required: false,
      default: ''
    },
    selected: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    },
    location: {
      type: Object as PropType<LocationDto>,
      required: true
    }
  }

})
</script>
<style lang="scss" scoped>
.marker-icon {
  border-radius: 999px;
  width: 24px;
  height: 24px;
  text-align: center;
  line-height: 2;
  display: block;
  background: white;

  &.selected {
    border: 1px solid red;
  }
}
</style>
