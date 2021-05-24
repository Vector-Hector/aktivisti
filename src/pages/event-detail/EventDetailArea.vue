<template>
  <router-view
    v-slot="{Component}"
    v-model:event-area="eventArea"
    :area-permissions="areaPermissions"
    :event="event"
  >
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/vue'
import Map from 'src/mapbox/Map.vue'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer.vue'

import EventAreaMixin from 'src/pages/event-detail/EventDetailAreaMixin'
import { apiClient } from 'src/api/ApiClient'
import { PermissionsDto } from 'src/api/model/APIEnvelope'

export default defineComponent({
  name: 'EventDetailArea',
  components: {
    FeatureLayer,
    Map,
    IonContent,
    IonGrid,
    IonRow,
    IonCol
  },
  mixins: [EventAreaMixin],
  async beforeRouteEnter(to, from, next) {
    const response = await apiClient.eventAreas.get(
      to.params.areaId as string,
      [],
      {show_permissions: true}
    )
    next(vm => {
      //@ts-ignore
      vm.eventArea = response.payload.data
      //@ts-ignore
      vm.areaPermissions = response.payload.permissions
    })
  },
  data() {
    return {
      areaPermissions: null as PermissionsDto | null
    }
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
