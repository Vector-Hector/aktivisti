
<script lang="ts">
import { defineComponent, inject, onUnmounted } from 'vue'
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MapInject } from './Map.vue'
import { ApiClient } from '@/api'


const apiClient = new ApiClient()

export default defineComponent({
  name: 'DrawControl',
  props: {
  },
  emits: ['update:location'],
  setup() {
    const map = inject(MapInject)
    const drawControl = new MapboxDraw();
    map!.value.addControl(drawControl, 'top-right')
    map!.value.on('draw.create', async (e: any) => {
      const geoJson = e['features'][0]['geometry']

      const result = await apiClient.places.list({
        geometry: JSON.stringify(geoJson)
      })

      for (const item of result.payload.data) {
        drawControl.add(item.geometry)
      }
    });
    onUnmounted(() => {
      map?.value?.removeControl(drawControl)
    })
  }
})

</script>
<style lang="scss" scoped>
@import "~@/scss/_variables.scss";

.marker-icon {
  background-image: url("~@/assets/marker.png");
  background-size: cover;
  display: block;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
</style>
