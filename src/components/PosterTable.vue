<script setup lang="ts">
import { computed, ref } from 'vue'
import { ellipsis } from 'src/utils/string'
import { PosterDto } from 'src/api/model/PosterDto'
import StatusRow from 'components/StatusRow.vue'
import { QBtn, QTable, QTd, QTh, QTr, useQuasar } from 'quasar'
import { ionTrash } from '@quasar/extras/ionicons-v5'
import { useI18n } from 'vue-i18n'

interface Props {
  posters: PosterDto[]
  showActions?: boolean
}

interface Emits {
  (e: 'rowClick', poster: PosterDto): void
  (e: 'rowDeleted', poster: PosterDto): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: () => false
})
const emit = defineEmits<Emits>()

const $q = useQuasar()
const { t } = useI18n()

const confirmDelete = ref(true)

const posterColumns = computed(() => {
  const columns: any[] = [
    {
      name: 'poster_id',
      label: '#',
      field: 'poster_id',
      align: 'right',
      required: true
    },
    {
      name: 'location_description',
      label: t('posterTable.columns.place'),
      field: 'location_description',
      align: 'left',
      required: true,
      format: (value: string) =>
        value ? ellipsis(value, 25) : t('posterTable.columns.unnamedPlace')
    },
    {
      name: 'status',
      label: t('posterTable.columns.status'),
      field: 'status',
      align: 'right'
    }
  ]
  if (props.showActions) {
    columns.push({
      name: 'actions',
      label: '',
      field: null,
      required: true
    })
  }
  return columns
})

function onDeleteClicked(poster: PosterDto) {
  if (confirmDelete.value) {
    $q.dialog({
      title: t('posterTable.deletePosterModal.title'),
      message: t('posterTable.deletePosterModal.description', [
        poster.poster_id
      ]),
      options: {
        type: 'checkbox',
        model: [],
        items: [
          {
            label: t('posterTable.deletePosterModal.skipConfirm'),
            value: 'skipConfirm'
          }
        ]
      },
      cancel: true
    }).onOk((data: any) => {
      if (data.includes('skipConfirm')) {
        confirmDelete.value = false
      }
      emit('rowDeleted', poster)
    })
  } else {
    emit('rowDeleted', poster)
  }
}
</script>

<template>
  <QTable
    :auto-layout="true"
    @row-click="(event, row, _) => emit('rowClick', row)"
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
    :no-data-label="$t('posterTable.noDataLabel')"
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

<style lang="scss" scoped>
.table-header {
  background: $grey-3;
}
</style>
