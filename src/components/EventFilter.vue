<template>
  <FilterInput
    label="Kampagnen"
    :model-value="filterParams.campaigns?.[0] ?? 0"
    @update:model-value="updateCampaign"
    :options="campaignOptions"
    emit-value
    map-options
    option-value="id"
    option-label="name"
  />
  <FilterInput
    class="filter-dropdown"
    label="Bezirks/Kreisverband"
    multiple
    :model-value="filterParams.sub_association"
    @update:model-value="updateSubAssociations"
    use-input
    use-chips
    emit-value
    map-options
    clearable
    input-debounce="0"
    :options="suggestedSubassociations"
    @filter="filterSubAssociations"
    option-value="id"
    option-label="name"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          Kein Verband gefunden
        </q-item-section>
      </q-item>
    </template>
  </FilterInput>
  <FilterInput
    class="filter-dropdown"
    :model-value="filterParams.order_by"
    @change="updateSorting"
    input-debounce="0"
    label="Sortierung"
    :options="sortOptions"
    :option-label="(item) => SortOptionLabels[item]"
    placeholder="Sortierung auswählen"
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
import FilterInput from 'components/FilterInput.vue'

const SortOptionLabels = {
  [SortOption.START_DATE]: 'Datum (Beginn)',
  [SortOption.NAME]: 'Aktionsname'
}

export default defineComponent({
  name: 'EventFilter',
  components: {
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
  computed: {
    campaignOptions(): Partial<CampaignDto>[] {
      return [
        {
          id: 0,
          name: 'Alle Kampagnen'
        },
        ...this.campaigns
      ]
    }
  },
  created() {
    this.suggestedSubassociations = this.subAssociations
  },
  data() {
    return {
      eventTypeOptions,
      SortOptionLabels,
      sortOptions: Object.values(SortOption),
      ionChevronDown,
      ionClose,
      suggestedSubassociations: [] as SubAssociationDto[]
    }
  },
  watch: {
    subAssociations() {
      this.suggestedSubassociations = this.subAssociations
    }
  },
  methods: {
    updateEventType(value: EventTypes) {
      this.$emit('update:filterParams', {
        ...this.filterParams,
        event_type: value
      })
    },
    filterSubAssociations(value: string, update: any) {
      if (!value) {
        update(() => {
          this.suggestedSubassociations = this.subAssociations
        })
        return
      }
      update(() => {
        const lowercasedValue = value.toLowerCase()
        this.suggestedSubassociations = this.subAssociations.filter(({name}) => name.toLowerCase().includes(lowercasedValue))
      })
    },
    updateSubAssociations(value: number[]) {
      this.$emit('update:filterParams', {
        ...this.filterParams,
        sub_association: value
      })
    },
    updateCampaign(value: number) {
      this.$emit('update:filterParams', {
        ...this.filterParams,
        campaigns: value > 0 ? [value] : undefined
      })
    },
    updateSorting(value: SortOption) {
      this.$emit('update:filterParams', {
        ...this.filterParams,
        order_by: value
      })
    }
  }
})
</script>
