<template>
  <QTable
    :auto-layout="true"
    @row-click="(event, row, _) => $emit('rowClick', row)"
    flat
    dense
    :columns="posterColumns"
    :rows="posters"
    row-key="name"
    virtual-scroll
    hide-pagination
    :rows-per-page-options="[0]"
    class="editable-cells-table overflow-hidden q-my-sm poster-table"
    edit-mode="cell"
    no-data-label="Noch keine Plakate erstellt"
  >
    <template v-slot:header="props">
      <QTr :props="props">
        <QTh
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          class="table-header"
        >
          {{ col.label }}
        </QTh>
      </QTr>
    </template>
    <template v-slot:body-cell-status="props">
      <QTd key="status" :props="props">
        <StatusRow :status="props.row.status" />
      </QTd>
    </template>
    <template v-slot:body-cell-actions="props">
      <QTd key="actions" :props="props">
        <QBtn
          dense
          round
          flat
          color="grey-6"
          :icon="ionTrash"
          @click.prevent.stop="onDeleteClicked(props.row)"
        />
      </QTd>
    </template>
  </QTable>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ellipsis } from 'src/utils/string'
import { PosterDto } from 'src/api/model/PosterDto'
import StatusRow from 'components/StatusRow.vue'
import { QBtn, QTable, QTd, QTh, QTr } from 'quasar'
import { ionTrash } from '@quasar/extras/ionicons-v5'

export default defineComponent({
  name: 'PosterTable',
  components: {
    StatusRow,
    QTable,
    QBtn,
    QTr,
    QTh,
    QTd
  },
  props: {
    posters: {
      type: Array as PropType<PosterDto[]>,
      required: true
    },
    showActions: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['rowClick', 'rowDeleted'],
  computed: {
    posterColumns(): any[] {
      const columns: any[] = [{
        name: 'poster_id',
        label: '#',
        field: 'poster_id',
        align: 'right',
        required: true
      }, {
        name: 'location_description',
        label: 'Ort',
        field: 'location_description',
        align: 'left',
        required: true,
        format: (value: string) => value ? ellipsis(value, 25) : 'Unbenannter Ort'
      }, {
        name: 'status',
        label: 'Status',
        field: 'status',
        align: 'right'
      }]
      if (this.showActions) {
        columns.push({
          name: 'actions',
          label: '',
          field: null,
          required: true
        })
      }
      return columns
    }
  },
  data() {
    return {
      ionTrash,
      confirmDelete: true
    }
  },
  methods: {
    onDeleteClicked(poster: PosterDto) {
      if (this.confirmDelete) {
        this.$q.dialog({
          title: 'Plakat löschen',
          message: `Möchtest du Plakat #${poster.poster_id} wirklich löschen?`,
          options: {
            type: 'checkbox',
            model: [],
            items: [
              {label: 'Beim nächsten mal nicht mehr fragen', value: 'skipConfirm'}
            ]
          },
          cancel: true
        }).onOk((data: any) => {
          if (data.includes('skipConfirm')) {
            this.confirmDelete = false
          }
          this.$emit('rowDeleted', poster)
        })
      } else {
        this.$emit('rowDeleted', poster)
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.table-header {
  background: $grey-3;
}
</style>
