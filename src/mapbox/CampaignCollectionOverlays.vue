<script setup lang="ts">
import CampaignCollectionOverlay from 'src/mapbox/CampaignCollectionOverlay.vue'
import { onMounted, ref } from 'vue'
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'
import { apiClient } from 'src/api/ApiClient'

interface Props {
  campaignId: number
  hover?: boolean
}

const props = defineProps<Props>()
const collections = ref<CampaignGeometryCollectionsDto[]>([])

onMounted(async () => {
  collections.value = (await apiClient.campaignGeometryCollections.list({campaign: props.campaignId})).payload.data
})

</script>
<template>
  <CampaignCollectionOverlay v-for="collection in collections" :collection="collection" :key="collection.id" :hover="props.hover"/>
</template>
