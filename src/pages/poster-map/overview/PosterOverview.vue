<script setup lang="ts">
import { onMounted, ref } from 'vue'
import InfiniteList from 'components/InfiniteList.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import PosterListItem from 'components/PosterListItem.vue'
import useOverviewMixin from 'src/utils/useOverviewMixin'
import { apiClient } from 'src/api/ApiClient'
import {
  DEFAULT_POSTER_FILTER_PREFERENCES,
  posterOverviewStore
} from 'src/store/PosterOverviewStore'
import { PosterFilterParams } from 'src/api/params/PosterFilterParams'
import PosterFilter from 'components/PosterFilter.vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { QScrollArea } from 'quasar'
import { useRouter } from 'vue-router'

const campaigns = ref<CampaignDto[]>([])
const subAssociations = ref<SubAssociationDto[]>([])

const $router = useRouter()
const {
  fetchMoreItems: fetchMorePosters,
  filterParams,
  itemHoveredOver: posterHoveredOver,
  items: posters,
  updateFilterParams
} = useOverviewMixin<PosterDto, PosterFilterParams>(
  posterOverviewStore,
  apiClient.posters
)

onMounted(async () => {
  await getCampaigns()
  await getSubAssociations()
})

async function loadData(index: number, done: () => void) {
  await fetchMorePosters()
  done()
}
function handleMouseOver(poster: PosterDto) {
  posterHoveredOver.value = poster
}
async function getCampaigns() {
  const response = await apiClient.campaigns.list()
  campaigns.value = response.payload.data
}
async function getSubAssociations() {
  subAssociations.value = (await apiClient.subAssociations.list()).payload.data
}
function goToPoster(poster: PosterDto) {
  void $router.push({
    name: 'event-detail-poster-detail',
    params: {
      posterId: poster.id,
      eventId: poster.event,
      areaId: poster.area ?? 'undefined'
    }
  })
}
function handleResetClick() {
  void updateFilterParams(DEFAULT_POSTER_FILTER_PREFERENCES)
}
</script>
<template>
  <div class="container poster-overview">
    <QScrollArea class="scroll-area">
      <PosterFilter
        :filter-params="filterParams"
        @update:filter-params="updateFilterParams"
        :campaigns="campaigns"
        :sub-associations="subAssociations"
        @on-reset-click="() => handleResetClick()"
      />
      <InfiniteList
        :items="posters"
        :disable="true"
        @load="loadData"
        class="poster-list"
      >
        <template v-slot:item="{ item: poster }">
          <PosterListItem
            :poster="poster"
            @mouseover="() => handleMouseOver(poster)"
            @click="goToPoster(poster)"
          />
        </template>
      </InfiniteList>
    </QScrollArea>
  </div>
</template>
<style lang="scss" scoped>
.poster-overview {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.scroll-area {
  height: 100%;
}

.poster-list {
  margin: 1rem 0;
  height: 100%;
  overflow: hidden;
}
</style>
