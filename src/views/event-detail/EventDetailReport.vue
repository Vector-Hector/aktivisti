<template>
  <IonGrid class="full-width">
    <IonRow>
      <IonCol
        class="ion-align-items-center d-flex"
      >
        <span
          v-if="campaigns"
          class="campaigns"
        >
          {{ campaigns.map(({name}) => name).join(',') }}
        </span>
      </IonCol>
    </IonRow>
    <IonRow>
      <IonCol>
        <h2 class="event-name">
          {{ event.name }}
        </h2>
      </IonCol>
    </IonRow>
    <DataTable
      class="metrics-table"
      :value="formattedDataPerArea"
    >
      <Column
        field="name"
        header="Name"
        footer="Gesamt:"
        footerStyle="text-align:right"
      >
        <template #body="{data}">
          <IonIcon
            class="icon"
            :style="{
              color: data.color
            }"
            name="ellipse"
          />
          <span> {{ data.name }}</span>
        </template>
      </Column>
      <Column
        v-for="item of metricsWithName"
        :key="item.id"
        :field="item.id.toString()"
        :header="item.name"
        :footer="sumColumn(item.id.toString())"
        style="text-align:right"
      />
      <Column
        field="completed_addresses"
        header="Besuchte Addressen"
        style="text-align:right"
        :footer="sumColumn('completed_addresses')"
      />
      <Column
        field="overall_addresses"
        header="Adressen im Gebiet"
        style="text-align:right"
        :footer="sumColumn('overall_addresses')"
      />
    </DataTable>
  </IonGrid>
</template>

<script lang="ts">
import { defineComponent, PropType} from "vue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { EventDto } from '@/api/model/EventDto';
import {EventMetricReportDto} from "@/api/model/EventMetricReportDto";
import {EventMetricDto} from "@/api/model/EventMetricDto";
import {EventMetricRecordDto} from "@/api/model/EventMetricRecordDto";
import {IonCol, IonGrid, IonIcon,IonRow} from "@ionic/vue";
import {CampaignDto} from "@/api/model/CampaignDto";
import {EventAreaDto} from "@/api/model/EventAreaDto";

interface formattedDataOfArea {
  id: number,
  color: string,
  completed_addresses: number,
  name: string,
  overall_addresses: number,
  // These keys will be used for dynamic metric ids
  [key: string]: any,
}

interface metricWithName {
  id: number,
  name: string
}

export default defineComponent({
  name: 'EventDetailReport',
  components: {
    Column,
    DataTable,
    IonCol,
    IonIcon,
    IonGrid,
    IonRow
  },

  props: {
    campaigns: {
      type: Object as PropType<CampaignDto[]>,
      required: true
    },
    event: {
      type: Object as PropType<EventDto>,
      required: true
    },
    eventAreas: {
      type: Array as PropType<EventAreaDto[]>,
      required: true
    }
  },
  data() {
    return {
      formattedDataPerArea: [] as formattedDataOfArea[],
      metricsWithName: [] as metricWithName[]
    }
  },
  async created() {
    this.metricsWithName = await this.fetchMetricNames();

    for (const { id, color, name } of this.eventAreas ) {
      if (id) {
        const { completed_addresses, overall_addresses, counts_per_metric } = await this.fetchAreaMetricsReports(id)
        const areaData : formattedDataOfArea = {
          id,
          color,
          completed_addresses,
          name,
          overall_addresses
        }
        for (const {id: metricId} of this.metricsWithName) {
          areaData[metricId] = counts_per_metric.find(({metric: metricId}) => metricId === metricId)?.count || 0
        }
        this.formattedDataPerArea.push(areaData)
      }
    }
  },
  methods: {
    async fetchAreaMetricsReports(areaId: number): Promise<EventMetricReportDto>{
      const response = await this.$apiClient.eventAreas.report(areaId)
      return response.payload.data
    },
    async fetchMetricNames() : Promise<EventMetricDto[]>{
      const response = await  this.$apiClient.eventMetrics.list()
      return response.payload.data
    },
    async fetchMetricRecords(): Promise<EventMetricRecordDto[]>{
      const response = await this.$apiClient.eventMetricRecords.list({event: this.event.id})
      return  response.payload.data
    },
    sumColumn(columnName: string): number {
      return this.formattedDataPerArea.map((row) => row[columnName]).reduce((a, b) => a + b, 0)
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";
@import "~@/scss/_utils.scss";

.campaign {
  font-weight: bold;
  display: block;
}

.event-name {
  margin: 0 0 1rem 0;
}

.full-width {
  width: 100%;
}

.metrics-table {
  margin-bottom: $inlineSpacing;
}

.icon {
  vertical-align: middle;
  margin-right: $inlineSpacing;
}

</style>