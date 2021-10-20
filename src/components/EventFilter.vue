<template>
  <StatusFilter
    :model-value="filterParams.status"
    @update:model-value="updateStatus"
  />
  <CampaignFilter
    :model-value="filterParams.campaigns?.[0]"
    :options="campaigns"
    @update:model-value="updateCampaign" />
  <SubAssociationFilter
    :model-value="filterParams.sub_association"
    @update:model-value="updateSubAssociations"
    :options="subAssociations">
  </SubAssociationFilter>
  <SortOrderFilter
    :model-value="filterParams.order_by"
    @update:model-value="updateSorting"
  />
  <FilterInput
    class="filter-dropdown"
    :model-value="filterParams.event_type"
    @update:model-value="updateEventType"
    input-debounce="0"
    label="Aktionstyp"
    :options="eventTypeOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
    clearable
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { SortOption } from 'src/store/UserStore'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { eventTypeOptions, EventTypes } from 'src/api/model/EventTypes'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import FilterInput from 'components/filterInput/FilterInput.vue'
import SubAssociationFilter from 'components/filterInput/filters/SubAssociationFilter.vue'
import CampaignFilter from 'components/filterInput/filters/CampaignFilter.vue'
import StatusFilter from 'components/filterInput/filters/StatusFilter.vue'
import { EventStatus } from 'src/api/model/EventStatus'
import SortOrderFilter from 'components/filterInput/filters/SortOrderFilter.vue'

export default defineComponent({
  name: 'EventFilter',
  components: {
    SortOrderFilter,
    StatusFilter,
    CampaignFilter,
    SubAssociationFilter,
    FilterInput
  },
  props: {
    filterParams: {
      type: Object as PropType<EventFilterParams>,
      required: true
    },
    campaigns: {
      type: Array as PropType<CampaignDto[]>,
      required: true
    },
    subAssociations: {
      type: Array as PropType<SubAssociationDto[]>,
      required: true
    }
  },
  emits: ['update:filterParams'],
  data() {
    return {
      eventTypeOptions,
      ionChevronDown,
      ionClose
    }
  },
  methods: {
    updateFilterParams(value: EventFilterParams){
      this.$emit('update:filterParams', {
        ...this.filterParams,
        ...value
      })
    },
    updateEventType(value: EventTypes) {
      this.updateFilterParams({event_type: value})
    },
    updateSubAssociations(value: number[]) {
      this.updateFilterParams({sub_association: value})
    },
    updateCampaign(value: number) {
      this.updateFilterParams({ campaigns: value ? [value] : undefined })
    },
    updateSorting(value: SortOption) {
      this.updateFilterParams({order_by: value})
    },
    updateStatus(value: EventStatus) {
      this.updateFilterParams({status: value})
    }
  }
})
</script>
