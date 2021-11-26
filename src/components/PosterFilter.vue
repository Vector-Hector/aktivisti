<template>
  <CollapsibleFilters
    class="collapsible-filters"
    :activated-filter-count="activatedFilterCount"
  >
    <div class="filter-content">
      <PosterStatusFilter
        :model-value="filterParams.status"
        @update:model-value="updatePosterStatus"
      />
      <CampaignFilter
        :model-value="filterParams.campaigns?.[0]"
        :options="campaigns"
        @update:model-value="updateCampaign" />
      <SubAssociationFilter
        :model-value="filterParams.sub_association"
        @update:model-value="updateSubAssociations"
        :options="subAssociations"
      />
    </div>
  </CollapsibleFilters>

</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'
import CollapsibleFilters from 'components/CollapsibleFilters.vue'
import PosterStatusFilter from 'components/filterInput/filters/PosterStatusFilter.vue'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { PosterFilterParams } from 'src/api/params/PosterFilterParams'
import { PosterStatus } from 'src/api/model/PosterDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import CampaignFilter from 'components/filterInput/filters/CampaignFilter.vue'
import SubAssociationFilter from 'components/filterInput/filters/SubAssociationFilter.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'

export default defineComponent({
  name: 'PosterFilter',
  components: {SubAssociationFilter, PosterStatusFilter, CollapsibleFilters, CampaignFilter},
  emits: ['update:filterParams'],
  props: {
    filterParams: {
      type: Object as PropType<PosterFilterParams>,
      required: true
    },
    campaigns: {
      type: Array as PropType<CampaignDto[]>,
      required: false
    },
    subAssociations: {
      type: Array as PropType<SubAssociationDto[]>,
      required: false
    }
  },
  data() {
    return {
      ionChevronDown,
      ionClose
    }
  },
  computed: {
    activatedFilterCount(): number {
      let active = 0
      if (this.filterParams.status) {
        active++
      }
      return active
    }
  },
  methods: {
    updateFilterParams(value: PosterFilterParams) {
      this.$emit('update:filterParams', {
        ...this.filterParams,
        ...value
      })
    },
    updatePosterStatus(value: PosterStatus) {
      this.updateFilterParams({status: value})
    },
    updateCampaign(value: number) {
      this.updateFilterParams({campaigns: value ? [value] : undefined})
    },
    updateSubAssociations(value: number[]) {
      this.updateFilterParams({sub_association: value})
    }
  }
})
</script>
<style lang="scss" scoped>
.filter-content {
  padding: 1rem;
}
</style>
