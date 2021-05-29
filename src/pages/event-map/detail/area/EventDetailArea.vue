<template>
  <router-view
    v-slot="{Component}"
    v-model:event-area="eventArea"
    :area-permissions="eventAreaPermissions"
    :event="event"
  >
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonCol,  IonGrid, IonRow } from '@ionic/vue'
import Map from 'src/mapbox/Map.vue'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer.vue'
import { apiClient } from 'src/api/ApiClient'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { eventDetailStore } from 'src/store/EventDetailStore'

export default defineComponent({
  name: 'EventDetailArea',
  components: {
    FeatureLayer,
    Map,

    IonGrid,
    IonRow,
    IonCol
  },
  mixins: [EventDetailMixin],
  async beforeRouteEnter(to, from, next) {
    const response = await apiClient.eventAreas.get(
      to.params.areaId as string,
      [],
      {show_permissions: true}
    )
    eventDetailStore.setEventArea(response.payload.data)
    eventDetailStore.setEventAreaPermissions(response.payload.permissions)

    next()
  }
})

</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";


label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.event-area-title {
  margin: 0.8rem 0 0 0;
}

.map {
  min-height: 180px;
  margin-bottom: 1.5em;
}

.button-group {
  margin-top: 1.5em;
}

.event-name {
  font-weight: bold;
  font-size: 1rem;
}

</style>
