<template>
  <div class="select-wrapper">
    <QSelect
      :dropdownIcon="ionChevronDown"
      :clearIcon="ionClose"
      filled
      label="Kampagnen"
      :model-value="filterParams.campaigns?.[0] ?? 0"
      @update:model-value="updateCampaign"
      :options="campaignOptions"
      emit-value
      map-options
      option-value="id"
      option-label="name"
    />
  </div>
  <div class="select-wrapper">
    <QSelect
      class="filter-dropdown"
      label="Bezirks/Kreisverband"
      :dropdownIcon="ionChevronDown"
      :clearIcon="ionClose"
      filled
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
    </QSelect>
  </div>
  <div class="select-wrapper">
    <QSelect
      class="filter-dropdown"
      :dropdownIcon="ionChevronDown"
      :clearIcon="ionClose"
      filled
      :model-value="filterParams.order_by"
      @change="updateSorting"
      input-debounce="0"
      label="Sortierung"
      :options="sortOptions"
      :option-label="(item) => SortOptionLabels[item]"
      placeholder="Sortierung auswählen"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QSelect } from 'quasar'
import { SortOption } from 'src/store/UserStore'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'

const SortOptionLabels = {
  [SortOption.START_DATE]: 'Datum (Beginn)',
  [SortOption.NAME]: 'Aktionsname'
}

export interface UserEventFilterParams {
  sub_association?: number[]
  campaigns?: number[],
  order_by: SortOption,
}

export default defineComponent({
  components: {
    QSelect
  },
  props: {
    filterParams: {
      type: Object as PropType<UserEventFilterParams>,
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
