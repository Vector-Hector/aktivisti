<template>
  <CollapsibleFilters
    class="collapsible-filters"
    :activated-filter-count="activatedFilterCount"
    v-if="isCollapsible"
  >
    <div class="filter-content">
      <EventFilterList
        :filter-params="filterParams"
        :campaigns="campaigns"
        :sub-associations="subAssociations"
        :isOwnershipFilterable="isOwnershipFilterable"
        :isStatusFilterable="isStatusFilterable"
        :isCampaignFilterable="isCampaignFilterable"
        :isSubAssociationFilterable="isSubAssociationFilterable"
        :isSortOrderConfigurable="isSortOrderConfigurable"
        :isEventTypeFilterable="isEventTypeFilterable"
        @update:filterParams="updateFilterParams"
        />
    </div>
  </CollapsibleFilters>
  <EventFilterList
    v-else
    :filter-params="filterParams"
    :campaigns="campaigns"
    :sub-associations="subAssociations"
    :isOwnershipFilterable="isOwnershipFilterable"
    :isStatusFilterable="isStatusFilterable"
    :isCampaignFilterable="isCampaignFilterable"
    :isSubAssociationFilterable="isSubAssociationFilterable"
    :isSortOrderConfigurable="isSortOrderConfigurable"
    :isEventTypeFilterable="isEventTypeFilterable"
    @update:filterParams="updateFilterParams"
  />
</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import CollapsibleFilters from 'components/CollapsibleFilters.vue'
import { EventStatus } from 'src/api/model/EventStatus'
import EventFilterList from 'components/EventFilterList.vue'

export default defineComponent({
  name: 'EventFilter',
  components: {
    CollapsibleFilters,
    EventFilterList,
  },
  props: {
    isCollapsible:{
      type: Boolean as PropType<boolean>,
      default: false,
    },
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
  computed: {
    activatedFilterCount(): number {
      let active = 0
      if ((this.filterParams.sub_association?.length ?? 0) > 0) {
        active++
      }
      if (this.filterParams.campaigns) {
        active++
      }
      if (this.filterParams.status === EventStatus.ENDED){
        active++
      }
      if(this.filterParams.event_type){
        active++
      }
      return active
    },
  },
  methods:{
    updateFilterParams(value: EventFilterParams){
      this.$emit('update:filterParams', {
        ...this.filterParams,
        ...value
      })
    },
  },
  emits: ['update:filterParams'],
})
</script>

<style lang="scss" scoped>
.filter-content {
  padding: 1rem;
}
</style>
