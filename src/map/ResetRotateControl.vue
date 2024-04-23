<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { QBtn } from 'quasar'
import { useMap } from 'src/map/MapUtils'

const map = useMap()

const visible = ref(false)

const mapListener = ref<null | (() => void)>(null)

onMounted(() => {
  mapListener.value = () => {
    visible.value = map.value.getBearing() !== 0 || map.value.getPitch() !== 0
  }
  map.value.on('rotateend', mapListener.value)
  map.value.on('pitchend', mapListener.value)
})

onUnmounted(() => {
  if (mapListener.value !== null) {
    map.value.off('rotateend', mapListener.value)
    map.value.off('pitchend', mapListener.value)
  }
})

function onResetClicked() {
  map.value.setBearing(0)
  map.value.setPitch(0)
  visible.value = false
}
</script>

<template>
  <QBtn
    v-if="visible"
    class="overlay-shadow bg-white"
    icon="img:/static/icons/north.svg"
    @click="onResetClicked"
    color="black"
    flat
    round
  />
</template>

<style lang="scss" scoped></style>
