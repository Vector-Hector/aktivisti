<template>
  <LayerPopup ref="layerPopup">
    <template v-slot:content="{passedObject: poster}">
      <div class="popup-contents">
        <span class="popup-title">Poster</span>
        <span class="popup-address">{{poster.location_description}}</span>
        <QBtn
          label="Zum Poster"
          color="primary"
          :to="`/events/${poster.event}/area/${poster.area}/posters/${poster.id}`"
        />
      </div>
    </template>
  </LayerPopup>
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import LayerPopup from 'src/mapbox/popup/LayerPopup.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { QBtn } from 'quasar'

export default defineComponent({
  name: 'PosterPopup',
  components: {LayerPopup,QBtn},
  methods: {
    showPopup(poster: PosterDto) {
      const {lng, lat} = poster.location
      // @ts-ignore
      this.$refs.layerPopup.showPopup(lng, lat, poster)
    }
  }
})
</script>
<style lang="scss" scoped>
.popup-contents {
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}

.popup-address {
  display: block;
  font-size: 0.9rem;
}
</style>
