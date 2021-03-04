<template>
  <div
    v-if="event.id"
    class="container"
  >
    <h2>{{ event.name }}</h2>
    <div class="p-grid">
      <span class="campaign p-col">{{ event.campaign }}</span>
    </div>
    <div class="p-grid">
      <span class="p-col-2">Start:</span><span class="start-date p-col-10">{{
        new Date(event.start_date).toLocaleString([], dateOptions)
      }}</span>
    </div>
    <div class="p-grid">
      <span class="p-col-2">Ende:</span><span class="start-date p-col-10">{{
        event.end_date ? new Date(event.end_date).toLocaleString([], dateOptions) : ''
      }}</span>
    </div>
    <div class="p-grid">
      <span class="participants p-col">
        <i class="pi pi-user" /> {{ event.participants.length }}/{{ event.max_participants ?? '∞' }}</span>
    </div>
    <div class="p-grid">
      <p class="description p-col">
        {{ event.description }}
      </p>
    </div>
    <div class="areas">
      <DataTable
        class="p-datatable-sm"
        :auto-layout="true"
        :value="eventAreas"
      >
        <Column
          header="Name"
          field="name"
        />
        <Column
          field="addressCount"
          header="Adressen"
        >
          <template #body="slotProps">
            {{ slotProps.data.area_details?.streets?.reduce((acc, item) => acc + item.addresses.length, 0) ?? 0 }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import EditEventMixin from '@/views/edit-event/EditEventMixin'
import DataTable from 'primevue/components/datatable/DataTable'
import Column from 'primevue/components/column/Column'

export default defineComponent({
  name: 'EditEventSummary',
  components: {
    DataTable,
    Column
  },
  mixins: [EditEventMixin],
  props: {
    event: {
      type: Object as PropType<Partial<EventDto>>,
      required: true
    }
  },
  data() {
    return {
      eventAreas: [] as EventAreaDto[],
      dateOptions: {
        year: 'numeric',
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
  },
  watch: {
    event: {
      async handler() {
        if (this.event.id) {
          const response = await this.$apiClient.eventAreas.list({
            event: this.event.id
          })
          this.eventAreas = response.payload.data
        }
      },
      immediate: true
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
