<script setup lang="ts">
import { ref } from 'vue'
import LayerPopup from 'src/map/popup/LayerPopup.vue'

const layerPopup = ref<InstanceType<typeof LayerPopup> | null>(null)
const popup = ref<any>(null)
function showPopup(
  metadata: Record<string, string | number>,
  location: { lng: number; lat: number }
) {
  const { lng, lat } = location
  layerPopup.value?.showPopup(lng, lat, metadata)
}
function remove() {
  layerPopup.value?.remove()
}
defineExpose({ showPopup, remove })
</script>

<template>
  <LayerPopup ref="layerPopup" :show-close-button="false" :offset="[0, 0]">
    <template v-slot:content="{ passedObject: metadata }">
      <div class="popup-contents">
        <table>
          <tr
            v-for="[index, [key, value]] in Object.entries(
              Object.entries(metadata)
            )"
            :key="index"
          >
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </table>
      </div>
    </template>
  </LayerPopup>
</template>

<style lang="scss" scoped>
.popup-contents {
  display: flex;
  flex-direction: column;
}
</style>
