<script setup lang="ts">
import { SortOption } from 'src/store/UserStore'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { EventTypes } from 'src/api/model/EventTypes'
import { EventFilterParams } from 'src/api/params/EventFilterParams'
import MultipleSubAssociationFilter from 'components/filterInput/filters/MultipleSubAssociationFilter.vue'
import CampaignFilter from 'components/filterInput/filters/CampaignFilter.vue'
import EventStatusFilter from 'components/filterInput/filters/EventStatusFilter.vue'
import { EventStatus } from 'src/api/model/EventStatus'
import SortOrderFilter from 'components/filterInput/filters/SortOrderFilter.vue'
import EventTypeFilter from 'components/filterInput/filters/EventTypeFilter.vue'
import OwnershipFilter from 'components/filterInput/filters/OwnershipFilter.vue'
import EditableFilter from 'components/filterInput/filters/EditableFilter.vue'

interface Props {
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
  campaigns: () => [],
  subAssociations: () => [],
  isEditableFilterable: false,
  isOwnershipFilterable: false,
  isStatusFilterable: true,
  isCampaignFilterable: true,
  isSubAssociationFilterable: true,
  isSortOrderConfigurable: true,
  isEventTypeFilterable: true
})
const emit = defineEmits<Emits>()

function updateFilterParams(value: EventFilterParams) {
  emit('update:filterParams', {
    ...props.filterParams,
    ...value
  })
}

function updateEventType(value: EventTypes) {
  updateFilterParams({ event_type: value ? value : undefined })
}

function updateSubAssociations(value: number[]) {
  updateFilterParams({ sub_association: value })
}

function updateCampaign(value: number) {
  updateFilterParams({ campaigns: value ? [value] : undefined })
}

function updateSorting(value: SortOption) {
  updateFilterParams({ order_by: value })
}

function updateStatus(value: EventStatus) {
  updateFilterParams({ status: value })
}

function updateOwnership(value: boolean) {
  updateFilterParams({ is_owner: value })
}

function updateEditable(value: boolean) {
  updateFilterParams({ management_permission: value })
}
</script>
<template>
  <div class="filter-list">
    <EditableFilter
      v-if="props.isEditableFilterable"
      :model-value="props.filterParams.management_permission"
      @update:model-value="updateEditable"
    />
    <OwnershipFilter
      v-if="props.isOwnershipFilterable"
      :model-value="props.filterParams.is_owner"
      @update:model-value="updateOwnership"
    />
    <CampaignFilter
      v-if="props.isCampaignFilterable"
      :model-value="props.filterParams.campaigns?.[0]"
      :options="props.campaigns"
      @update:model-value="updateCampaign"
    />
    <MultipleSubAssociationFilter
      v-if="props.isSubAssociationFilterable"
      :model-value="props.filterParams.sub_association"
      @update:model-value="updateSubAssociations"
      :options="props.subAssociations"
    >
    </MultipleSubAssociationFilter>
    <SortOrderFilter
      v-if="props.isSortOrderConfigurable"
      :model-value="props.filterParams.order_by"
      @update:model-value="updateSorting"
    />
    <EventTypeFilter
      v-if="props.isEventTypeFilterable"
      :model-value="props.filterParams.event_type"
      :availableEventTypes="props.availableEventTypes"
      @update:model-value="updateEventType"
    />
    <EventStatusFilter
      v-if="props.isStatusFilterable"
      :model-value="props.filterParams.status"
      @update:model-value="updateStatus"
    />
  </div>
</template>

<style lang="scss" scoped>
.filter-list {
  display: grid;
  gap: 0.5rem 0;
}
</style>
