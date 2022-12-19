<script setup lang="ts">
import { matLayers } from '@quasar/extras/material-icons'
import { QBtn, useQuasar } from 'quasar'
import CampaignCollectionOverlay from 'src/map/CampaignCollectionOverlay.vue'
import { apiClient } from 'src/api/ApiClient'
import { onMounted, ref } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import SelectCampaignOverlayDialog from 'components/modals/SelectCampaignOverlayDialog.vue'
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'

const campaigns = ref<CampaignDto[]>([])
const collection = ref<CampaignGeometryCollectionsDto | null>(null)
const isLoading = ref<boolean>(false)
const $q = useQuasar()

onMounted(async () => {
  campaigns.value = (await apiClient.campaigns.list()).payload.data
})

function openLayerSelection() {
  $q.dialog({
    component: SelectCampaignOverlayDialog,
    componentProps: {
      preselectedCollection: collection.value
    }
  }).onOk((selectedCollection) => {
      collection.value = selectedCollection
      if (selectedCollection) {
        isLoading.value = true
      }
    }
  )
}

function handleLoadingFinished() {
  isLoading.value = false
}
</script>

<template>
  <div>
    <QBtn
      class="campaign-collection-overlay-control"
      :loading="isLoading" :color="collection ? 'primary' : 'unset'"
      flat
      round
      :icon="matLayers"
      @click="openLayerSelection" />
    <CampaignCollectionOverlay v-if="collection" :collection="collection" @onLoadingFinished="handleLoadingFinished" />
  </div>
</template>

<style lang="scss">
@import "src/css/variables";
.campaign-collection-overlay-control {
  background: white;
  box-shadow: $map-overlay-shadow;
}
</style>
