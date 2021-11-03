<template>
  <div class="container office-overview">
    <InfiniteList
      :items="offices"
      :disable="offices.length===pagination.total"
      @load="loadData"
      class="office-list"
      ref="infiniteList"
    >
      <template v-slot:item="{item}">
        <OfficeListItem :office="item" @mouseover="() => handleMouseOver(item)"
                        @mouseout="()=> handleMouseOver(null)"
                        @click="goToOffice(item.id)"
        />
      </template>
      <template v-slot:emptyList>
        Keine Geschäftsstellen im Gebiet gefunden
      </template>
    </InfiniteList>
  </div>
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import OfficeOverviewMixin from 'pages/office-map/overview/OfficeOverviewMixin'
import InfiniteList from 'components/InfiniteList.vue'
import OfficeListItem from 'components/OfficeListItem.vue'
import { OfficeDto } from 'src/api/model/OfficeDto'

export default defineComponent({
  name: 'OfficeOverview',
  components: {InfiniteList, OfficeListItem},
  mixins: [OfficeOverviewMixin],
  methods: {
    async loadData(index: number, done: () => void) {
      await this.fetchMoreOffices()
      done()
    },
    handleMouseOver(office: OfficeDto) {
      this.officeHoveredOver = office
    }
  },
  emits: ['hoveredOffice'],
  watch: {
    filterParams() {
      // @ts-ignore
      this.$refs.infiniteList.resetScrollPosition()
    }
  }
})
</script>
<style lang="scss" scoped>

.office-overview {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.office-list {
  margin: 1rem 0;
  height: 100%;
  overflow: hidden;
}
</style>
