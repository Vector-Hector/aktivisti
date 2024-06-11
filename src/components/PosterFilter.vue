<script setup lang="ts">
import { computed } from 'vue'
import CollapsibleFilters from 'components/CollapsibleFilters.vue'
import PosterStatusFilter from 'components/filterInput/filters/PosterStatusFilter.vue'
import { PosterFilterParams } from 'src/api/params/PosterFilterParams'
import { PosterStatus } from 'src/api/model/PosterDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import CampaignFilter from 'components/filterInput/filters/CampaignFilter.vue'
import MultipleSubAssociationFilter from 'components/filterInput/filters/MultipleSubAssociationFilter.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'

interface Props {
  filterParams: PosterFilterParams
  campaigns?: CampaignDto[]
  subAssociations?: SubAssociationDto[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:filterParams', filterParams: PosterFilterParams): void
}

const emit = defineEmits<Emits>()

const activatedFilterCount = computed(() => {
  let active = 0
  if (props.filterParams.status) {
    active++
  }
  if ((props.filterParams.sub_association?.length ?? 0) > 0) {
    active++
  }
  if ((props.filterParams.campaigns?.length ?? 0) > 0) {
    active++
  }
  return active
})

function updateFilterParams(value: PosterFilterParams) {
  emit('update:filterParams', {
    ...props.filterParams,
    ...value
  })
}
function updatePosterStatus(value: PosterStatus) {
  updateFilterParams({ status: value })
}
function updateCampaign(value: number) {
  updateFilterParams({ campaigns: value ? [value] : undefined })
}
function updateSubAssociations(value: number[]) {
  updateFilterParams({ sub_association: value })
}
</script>
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
        @update:model-value="updateCampaign"
      />
      <MultipleSubAssociationFilter
        :model-value="filterParams.sub_association"
        @update:model-value="updateSubAssociations"
        :options="subAssociations"
      />
    </div>
  </CollapsibleFilters>
</template>

<style lang="scss" scoped>
.filter-content {
  padding: 1rem;
}
</style>
