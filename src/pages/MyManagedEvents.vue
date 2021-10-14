<template>
  <QPage class="flex-fill">
    <div class="container my-managed-events">
      <div class="filter-content">
        <FilterInput
          label="Aktionen erstellt von"
          :model-value="selectedOwner"
          emit-value
          @update:model-value="handleOwnerSelect"
          :options="ownershipOptions"
          map-options
          option-value="key"
          option-label="label"
        />
        <StatusFilter
          :model-value="status"
          @update:model-value="handleStatusSelect"
        />
      </div>
      <EventList
        v-model:events="shownEvents"
        v-model:pagination="pagination"
        :filter-params="filterParams"
        :campaigns="campaigns"
        class="event-list"
      />
    </div>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QPage } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5';

import { CampaignDto } from 'src/api/model/CampaignDto';
import EventList from 'components/EventList.vue';
import { Pagination } from 'src/api/model/APIEnvelope';
import { EVENT_MAP_MAX_EVENTS } from 'src/constants';
import { EventDto } from 'src/api/model/EventDto';
import StatusFilter from 'components/filterInput/filters/StatusFilter.vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { EventStatus } from 'src/api/model/EventStatus'

enum ownership {
  ME,
  OTHER,
  ALL
}

const _defaultPagination = {
  limit: EVENT_MAP_MAX_EVENTS
}

export default defineComponent({
  name: 'MyManagedEvents',
  components: {
    FilterInput,
    StatusFilter,
    EventList,
    QPage,
  },
  async created() {
    await this.updateShownEvents()
    await this.updateCampaigns()
  },
  data() {
    return {
      campaigns: [] as CampaignDto[],
      filterParams: {
        is_owner: true,
        management_permission: true,
        status: EventStatus.ACTIVE
      } as Record<string, number | string | boolean>,
      ionChevronDown,
      ionClose,
      ownershipOptions: [
        {
          label: 'Mir',
          key: ownership.ME,
        },
        {
          label: 'Anderen',
          key: ownership.OTHER,
        },
        {
          label: 'Allen',
          key: ownership.ALL,
        }
      ],
      pagination: _defaultPagination as Pagination | null,
      selectedOwner: ownership.ME,
      shownEvents: [] as EventDto[],
      status: EventStatus.ACTIVE
    }
  },
  methods: {
    async handleOwnerSelect(selectedOwner: number) {
      this.resetPagination()
      this.setOwnershipFilter(selectedOwner)
      await this.updateShownEvents()
      this.selectedOwner = selectedOwner
    },
    async handleStatusSelect(selectedStatus: EventStatus){
      this.resetPagination()
      this.setStatusFilter(selectedStatus)
      await this.updateShownEvents()
      this.status = selectedStatus
    },
    resetPagination() {
      this.pagination = _defaultPagination as Pagination
    },
    async updateCampaigns() {
      this.campaigns = (await this.$apiClient.campaigns.list()).payload.data
    },
    async updateShownEvents() {
      try {
        const {data: events, pagination} = (await this.$apiClient.events.list(
          {
            ...this.pagination,
            ...this.filterParams
          }
        )).payload
        this.pagination = pagination!
        this.shownEvents = events
      } catch {
        this.$q.notify({
          message: 'Etwas ging schief beim Abrufen der Aktionen',
          color: 'negative'
        })
      }
    },
    setOwnershipFilter(owner = ownership.ALL) {
      if (owner === ownership.ME) {
        this.filterParams.is_owner = true
      } else if (owner === ownership.OTHER) {
        this.filterParams.is_owner = false
      } else {
        delete this.filterParams.is_owner
      }
    },
    setStatusFilter(status: EventStatus){
      this.filterParams.status = status
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/variables.scss";

.my-managed-events {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-list {
  margin: 1rem 0;
  height: 100%;
  overflow: hidden;
}

.filter-content {
  padding: 1rem;
}
</style>

