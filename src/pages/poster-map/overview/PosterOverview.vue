<template>
  <div class="container poster-overview">
    <PosterFilter
      :filter-params="filterParams"
      @update:filter-params="updateFilterParams"
      :campaigns="campaigns"
      :sub-associations="subAssociations"
    />
    <InfiniteList
      :items="posters"
      :disable="true"
      @load="loadData"
      class="poster-list"
      ref="infiniteList"
    >
      <template v-slot:item="{ item: poster }">
        <PosterListItem
          :poster="poster"
          @mouseover="() => handleMouseOver(poster)"
          @click="goToPoster(poster)"
        />
      </template>
    </InfiniteList>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import InfiniteList from 'components/InfiniteList.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import PosterListItem from 'components/PosterListItem.vue'
import useOverviewMixin from 'src/utils/useOverviewMixin'
import { apiClient } from 'src/api/ApiClient'
import { posterOverviewStore } from 'src/store/PosterOverviewStore'
import { PosterFilterParams } from 'src/api/params/PosterFilterParams'
import PosterFilter from 'components/PosterFilter.vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'

export default defineComponent({
  name: 'PosterOverview',
  components: { PosterListItem, InfiniteList, PosterFilter },
  setup() {
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
    return {
      fetchMorePosters,
      filterParams,
      posterHoveredOver,
      posters,
      updateFilterParams
    }
  },
  async created() {
    await this.getCampaigns()
    await this.getSubAssociations()
  },
  data() {
    return {
      campaigns: [] as CampaignDto[],
      subAssociations: [] as SubAssociationDto[]
    }
  },
  methods: {
    async loadData(index: number, done: () => void) {
      await this.fetchMorePosters()
      done()
    },
    handleMouseOver(poster: PosterDto) {
      this.posterHoveredOver = poster
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list()
      this.campaigns = response.payload.data
    },
    async getSubAssociations() {
      this.subAssociations = (
        await this.$apiClient.subAssociations.list()
      ).payload.data
    },
    goToPoster(poster: PosterDto) {
      void this.$router.push({
        name: 'event-detail-poster-detail',
        params: {
          posterId: poster.id,
          eventId: poster.event,
          areaId: poster.area ?? 'undefined'
        }
      })
    }
  },
  watch: {
    filterParams() {
      if (this.$refs.infiniteList) {
        // @ts-ignore
        this.$refs.infiniteList.resetScrollPosition()
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.poster-overview {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.poster-list {
  margin: 1rem 0;
  height: 100%;
  overflow: hidden;
}
</style>
