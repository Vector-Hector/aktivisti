<script setup lang="ts">
import { computed } from 'vue'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import CollapsibleFilters from 'components/CollapsibleFilters.vue'
import EventFilterList from 'components/EventFilterList.vue'
import { EventTypes } from 'src/api/model/EventTypes'
import { DEFAULT_FILTER_PREFERENCES } from 'src/store/UserStore'

interface Props {
  isCollapsible?: boolean
  filterParams: EventFilterParams
  campaigns?: CampaignDto[]
  subAssociations?: SubAssociationDto[]
  isEditableFilterable?: boolean
  isOwnershipFilterable?: boolean
  isStatusFilterable?: boolean
  isCampaignFilterable?: boolean
  isSubAssociationFilterable?: boolean
  isSortOrderConfigurable?: boolean
  isEventTypeFilterable?: boolean
  availableEventTypes?: EventTypes[]
}

interface Emits {
  (e: 'update:filterParams', filterParams: EventFilterParams): void
}

const props = withDefaults(defineProps<Props>(), {
  isCollapsible: false,
  isEditableFilterable: false,
  isOwnershipFilterable: false,
  isStatusFilterable: true,
  isCampaignFilterable: true,
  isSubAssociationFilterable: true,
  isSortOrderConfigurable: true,
  isEventTypeFilterable: true
})
const emit = defineEmits<Emits>()

const activatedFilterCount = computed(() => {
  let active = 0
  if (
    props.filterParams.management_permission !==
    DEFAULT_FILTER_PREFERENCES.management_permission
  ) {
    active++
  }
  if (props.filterParams.is_owner !== DEFAULT_FILTER_PREFERENCES.is_owner) {
    active++
  }
  if ((props.filterParams.sub_association?.length ?? 0) > 0) {
    active++
  }
  if ((props.filterParams.campaigns?.length ?? 0) > 0) {
    active++
  }
  if (props.filterParams.status !== DEFAULT_FILTER_PREFERENCES.status) {
    active++
  }
  if (props.filterParams.event_type !== DEFAULT_FILTER_PREFERENCES.eventType) {
    active++
  }
  return active
})

function updateFilterParams(value: EventFilterParams) {
  emit('update:filterParams', {
    ...props.filterParams,
    ...value
  })
}
</script>

<template>
  <CollapsibleFilters
    class="collapsible-filters"
    :activated-filter-count="activatedFilterCount"
    v-if="isCollapsible"
  >
    <div class="filter-content">
      <EventFilterList
        :filter-params="props.filterParams"
        :campaigns="props.campaigns"
        :sub-associations="props.subAssociations"
        :is-editable-filterable="props.isEditableFilterable"
        :isOwnershipFilterable="props.isOwnershipFilterable"
        :isStatusFilterable="props.isStatusFilterable"
        :isCampaignFilterable="props.isCampaignFilterable"
        :isSubAssociationFilterable="props.isSubAssociationFilterable"
        :isSortOrderConfigurable="props.isSortOrderConfigurable"
        :isEventTypeFilterable="props.isEventTypeFilterable"
        :available-event-types="props.availableEventTypes"
        @update:filterParams="updateFilterParams"
      />
    </div>
  </CollapsibleFilters>
  <EventFilterList
    v-else
    :filter-params="props.filterParams"
    :campaigns="props.campaigns"
    :sub-associations="props.subAssociations"
    :is-editable-filterable="props.isEditableFilterable"
    :isOwnershipFilterable="props.isOwnershipFilterable"
    :isStatusFilterable="props.isStatusFilterable"
    :isCampaignFilterable="props.isCampaignFilterable"
    :isSubAssociationFilterable="props.isSubAssociationFilterable"
    :isSortOrderConfigurable="props.isSortOrderConfigurable"
    :isEventTypeFilterable="props.isEventTypeFilterable"
    :available-event-types="props.availableEventTypes"
    @update:filterParams="updateFilterParams"
  />
</template>

<style lang="scss" scoped>
.filter-content {
  padding: 1rem;
}
</style>
