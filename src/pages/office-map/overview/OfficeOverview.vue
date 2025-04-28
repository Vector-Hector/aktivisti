<script lang="ts" setup>
import { computed, ref } from 'vue'
import InfiniteList from 'components/InfiniteList.vue'
import OfficeListItem from 'components/OfficeListItem.vue'
import { apiClient } from 'src/api/ApiClient'
import { officeOverviewStore } from 'src/store/OfficeOverviewStore'
import { useRouter } from 'vue-router'
import { inside } from '@turf/turf'
import { polygonFromBBox } from 'src/utils/geometry'
import { OfficeGeoJsonFeature } from 'src/api/model/OfficeGeoJsonDto'
import { QScrollArea } from 'quasar'

const router = useRouter()

async function loadOffices() {
  const response = await apiClient.officeGeometry.list()
  officeOverviewStore.state.featureCollection = response.payload.data
}

void loadOffices()

const offices = computed(() => {
  const bbox = officeOverviewStore.state.bbox
  return bbox
    ? (officeOverviewStore.state.featureCollection?.features.filter(
        (officeFeature) => {
          return bbox && inside(officeFeature, polygonFromBBox(bbox))
        }
      ) ?? [])
    : []
})

const maxVisibleItems = ref(10)

const visibleItems = computed(() => {
  return offices.value.slice(0, maxVisibleItems.value)
})

function addToVisibile(index, done) {
  maxVisibleItems.value += 10
  done()
}

function goToOffice(office: OfficeGeoJsonFeature) {
  void router.push({
    name: 'office-detail',
    params: {
      officeId: office.id
    }
  })
}
</script>
<template>
  <div class="container office-overview">
    <QScrollArea class="scroll-area">
      <InfiniteList
        :items="visibleItems"
        :disable="maxVisibleItems >= offices.length"
        @load="addToVisibile"
        class="office-list"
      >
        <template v-slot:item="{ item }">
          <OfficeListItem :office="item" @click="goToOffice(item)" />
        </template>
        <template v-slot:emptyList>Keine Adressen im Gebiet gefunden</template>
      </InfiniteList>
    </QScrollArea>
  </div>
</template>
<style lang="scss" scoped>
.office-overview {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.scroll-area {
  height: 100%;
}

.office-list {
  margin: 1rem 0;
  height: 100%;
  overflow: hidden;
}
</style>
