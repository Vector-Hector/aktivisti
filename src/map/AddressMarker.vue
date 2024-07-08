<script setup lang="ts">
import Marker from 'src/map/Marker.vue'
import { LocationDto } from 'src/api/model/LocationDto'

interface Props {
  text?: string
  selected?: boolean
  location: LocationDto
  done: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: () => '',
  selected: () => false,
  done: () => false
})
</script>
<template>
  <Marker :location="props.location">
    <template #marker>
      <i
        :class="{
          'marker-icon': true,
          selected: props.selected,
          done: props.done
        }"
        >{{ props.text }}</i
      >
    </template>
  </Marker>
</template>
<style lang="scss" scoped>
.marker-icon {
  border-radius: 999px;
  width: 24px;
  height: 24px;
  text-align: center;
  line-height: 2;
  display: block;
  background: white;

  &.done {
    background: #4caf50;
    color: white;
  }

  &.selected {
    border: 1px solid red;
  }
}
</style>
