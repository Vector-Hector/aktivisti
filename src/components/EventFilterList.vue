<template>
  <OwnershipFilter
    v-if="isOwnershipFilterable"
    :model-value="filterParams.is_owner"
    @update:model-value="updateOwnership"
  />
  <CampaignFilter
    v-if="isCampaignFilterable"
    :model-value="filterParams.campaigns?.[0]"
    :options="campaigns"
    @update:model-value="updateCampaign" />
  <SubAssociationFilter
    v-if="isSubAssociationFilterable"
    :model-value="filterParams.sub_association"
    @update:model-value="updateSubAssociations"
    :options="subAssociations">
  </SubAssociationFilter>
  <SortOrderFilter
    v-if="isSortOrderConfigurable"
    :model-value="filterParams.order_by"
    @update:model-value="updateSorting"
  />
  <EventTypeFilter
    v-if="isEventTypeFilterable"
    :model-value="filterParams.event_type"
    @update:model-value="updateEventType"
  />
  <StatusFilter
    v-if="isStatusFilterable"
    :model-value="filterParams.status"
    @update:model-value="updateStatus"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { SortOption } from 'src/store/UserStore'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { EventTypes } from 'src/api/model/EventTypes'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import SubAssociationFilter from 'components/filterInput/filters/SubAssociationFilter.vue'
import CampaignFilter from 'components/filterInput/filters/CampaignFilter.vue'
import StatusFilter from 'components/filterInput/filters/StatusFilter.vue'
import { EventStatus } from 'src/api/model/EventStatus'
import SortOrderFilter from 'components/filterInput/filters/SortOrderFilter.vue'
import EventTypeFilter from 'components/filterInput/filters/EventTypeFilter.vue'
import OwnershipFilter from 'components/filterInput/filters/OwnershipFilter.vue'

export default defineComponent({
  name: 'EventFilterList',
  components: {
    OwnershipFilter,
    EventTypeFilter,
    SortOrderFilter,
    StatusFilter,
    CampaignFilter,
    SubAssociationFilter,
  },
  props: {
    filterParams: {
      type: Object as PropType<EventFilterParams>,
      required: true
    },
    campaigns: {
      type: Array as PropType<CampaignDto[]>,
      required: false,
    },
    subAssociations: {
      type: Array as PropType<SubAssociationDto[]>,
      required: false
    },
    isOwnershipFilterable:{
      type: Boolean as PropType<boolean>,
      default: false,
    },
    isStatusFilterable: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    isCampaignFilterable: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    isSubAssociationFilterable: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    isSortOrderConfigurable: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    isEventTypeFilterable: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  emits: ['update:filterParams'],
  data() {
    return {
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
      this.updateFilterParams({event_type: value ? value : undefined})
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
    },
    updateOwnership(value: boolean) {
      this.updateFilterParams({is_owner: value})
    }
  }
})
</script>
