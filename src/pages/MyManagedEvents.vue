<template>
  <QPage class="flex-fill">
    <div class="container my-managed-events">
      <div class="filter-content">
        <QSelect
          label="Ersteller*in"
          filled
          :dropdownIcon="ionChevronDown"
          :clearIcon="ionClose"
          :model-value="selectedOwner"
          emit-value
          @update:model-value="handleOwnerSelect"
          :options="ownershipOptions"
          map-options
          option-value="key"
          option-label="label"
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
import { QPage, QSelect } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5';

import { CampaignDto } from 'src/api/model/CampaignDto';
import EventList from 'components/EventList.vue';
import { Pagination } from 'src/api/model/APIEnvelope';
import { EVENT_MAP_MAX_EVENTS } from 'src/constants';
import { EventDto } from 'src/api/model/EventDto';

enum ownership {
  ME,
  OTHER,
  ALL
}

export default defineComponent({
  name: 'MyManagedEvents',
  components: {
    EventList,
    QPage,
    QSelect,
  },
  async created() {
    await this.updateShownEvents()
    await this.updateCampaigns()
  },
  data() {
    return {
      campaigns: [] as CampaignDto[],
      filterParams: {
        is_owner: true
      } as { [key: string]: number | string | boolean },
      ionChevronDown,
      ionClose,
      ownershipOptions: [
        {
          label: 'Ich',
          key: ownership.ME,
        },
        {
          label: 'Andere',
          key: ownership.OTHER,
        },
        {
          label: 'Alle',
          key: ownership.ALL,
        }
      ],
      pagination: {
        limit: EVENT_MAP_MAX_EVENTS
      } as Pagination | null,
      selectedOwner: ownership.ME,
      shownEvents: [] as EventDto[],
    }
  },
  methods: {
    async handleOwnerSelect(selectedOwner: number) {
      this.setOwnershipFilter(selectedOwner)
      await this.updateShownEvents()
      this.selectedOwner = selectedOwner
    },
    async updateCampaigns() {
      this.campaigns = (await this.$apiClient.campaigns.list()).payload.data
    },
    async updateShownEvents() {
      const {data: events, pagination} = (await this.$apiClient.events.list(
        {
          ...this.pagination,
          ...this.filterParams
        }
      )).payload
      this.pagination = pagination!
      this.shownEvents = events
    },
    setOwnershipFilter(owner = ownership.ALL) {
      if (owner === ownership.ME) {
        this.filterParams['is_owner'] = true
      } else if (owner === ownership.OTHER) {
        this.filterParams['is_owner'] = false
      } else {
        delete this.filterParams['is_owner']
      }
    },
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

