<template>
  <LayerPopup ref="layerPopup">
    <template v-slot:content="{ passedObject: poster }">
      <div class="popup-contents">
        <span class="popup-title">Poster</span>
        <span class="popup-address">{{ poster.location_description }}</span>
        <QBtn
          label="Zum Plakat"
          color="primary"
          :to="`/events/${poster.event}/area/${
            poster.area ? poster.area : UNDEFINED_POSTER_AREA
          }/posters/${poster.id}`"
        />
      </div>
    </template>
  </LayerPopup>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import LayerPopup from 'src/map/popup/LayerPopup.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { QBtn } from 'quasar'
import { UNDEFINED_POSTER_AREA } from 'pages/event-map/detail/area/posters/detail/EventDetailPosterDetail.vue'

export default defineComponent({
  name: 'PosterPopup',
  components: { LayerPopup, QBtn },
  data() {
    return {
      UNDEFINED_POSTER_AREA
    }
  },
  methods: {
    showPopup(poster: PosterDto) {
      const { lng, lat } = poster.location
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
