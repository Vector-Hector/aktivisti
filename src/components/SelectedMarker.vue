<script setup lang="ts">
import Marker from 'src/map/Marker.vue'
import { QIcon } from 'quasar'
import { LocationDto } from 'src/api/model/LocationDto'

interface Props {
  location: LocationDto
}

const props = defineProps<Props>()
</script>
<template>
  <Marker :location="props.location">
    <template v-slot:marker>
      <QIcon
        name="img:static/icons/map-pin-selected.svg"
        class="clickable-marker"
        size="xl"
      />
    </template>
  </Marker>
</template>
