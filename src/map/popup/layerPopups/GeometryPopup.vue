<template>
  <LayerPopup ref="layerPopup" :show-close-button="false" :offset="[0,0]">
    <template v-slot:content="{passedObject: metadata}">
      <div class="popup-contents">
        <table>
          <tr v-for="[index, [key, value]] in Object.entries(Object.entries(metadata))" :key="index">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </table>
      </div>
    </template>
  </LayerPopup>
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import LayerPopup from 'src/map/popup/LayerPopup.vue'

export default defineComponent({
  name: 'GeometryPopup',
  components: {LayerPopup},
  data() {
    return {
      popup: null as any
    }
  },
  methods: {
    showPopup(metadata: Record<string, string | number>, location: {lng: number, lat: number}) {
      const {lng, lat} = location
      // @ts-ignore
      this.$refs.layerPopup.showPopup(lng, lat, metadata)
    },
    remove() {
      // @ts-ignore
      this.$refs.layerPopup.remove()
    }
  }
})
</script>
<style lang="scss" scoped>
.popup-contents {
  display: flex;
  flex-direction: column;
}
</style>
