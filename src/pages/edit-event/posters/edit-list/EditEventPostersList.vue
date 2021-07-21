<template>
  <div class="edit-event-posters container">
    <div class="row">
      <div class="col buttons">
        <QBtn
          color="primary"
          label="Erstellen"
          :icon="ionLocationSharp"
          :to="{name: 'edit-event-single-poster-new'}"
        />
      </div>
    </div>
    <QTable
      :auto-layout="true"
      @row-click="(event, row, index) => editPoster(row.id)"
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
      no-data-label="Noch keine Poster erstellt"

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
  </div>
  <SidebarBottomNavigation
    @close="abort"
    @forward="next"
    @back="back"
    :last="stepControls.isLastStep.value"
  />
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'

import {
  QBtn,
  QTable,
  QTd, QTh,
  QTr
} from 'quasar'
import { ionLocationSharp, ionPencil, ionTrash } from '@quasar/extras/ionicons-v5'
import EditEventGeometryMixin from 'pages/edit-event/geometry/EditEventGeometryMixin'
import SidebarBottomNavigation from 'components/SidebarBottomNavigation.vue'
import EditEventAutoSaveMixin from 'pages/edit-event/EditEventAutoSaveMixin'
import { PosterDto, PosterStatus, posterStatusOptions } from 'src/api/model/PosterDto'
import { StepControls } from 'pages/EditEvent.vue'
import EditPosterListMixin from 'pages/edit-event/posters/EditPosterListMixin'
import { ellipsis } from 'src/utils/string'

export default defineComponent({
  name: 'EditEventPostersList',
  components: {
    SidebarBottomNavigation,
    QBtn,
    QTable,
    QTd,
    QTr,
    QTh
  },
  mixins: [EditEventGeometryMixin, EditPosterListMixin, EditEventAutoSaveMixin],
  setup() {
    return {
      stepControls: inject('stepControls') as StepControls
    }
  },
  data() {
    return {
      ionPencil,
      ionTrash,
      ionLocationSharp,
      posterStatusOptions,
      confirmDelete: true,
      filters: {
        status: null
      },
      posterColumns: [{
        name: 'poster_id',
        label: '#',
        field: 'poster_id',
        align: 'left',
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
        align: 'left',
        format: (value: PosterStatus) => posterStatusOptions.find(({key}) => key === value)?.label
      }, {
        name: 'actions',
        label: '',
        field: null,
        required: true
      }]
    }
  },
  methods: {
    async back() {
      await this.saveDebouncer.waitForSettle()
      this.stepControls.previous()
    },
    async next() {
      await this.saveDebouncer.waitForSettle()
      this.stepControls.next()
    },
    async abort() {
      await this.saveDebouncer.waitForSettle()
      this.stepControls.abort()
    },
    async onDeleteClicked(poster: PosterDto) {
      if (this.confirmDelete) {
        this.$q.dialog({
          title: 'Poster löschen',
          message: `Möchtest du Poster #${poster.poster_id} wirklich löschen?`,
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
          void this.deletePoster(poster)
        })
      } else {
        await this.deletePoster(poster)
      }
    },
    async editPoster(posterId: number) {
      await this.$router.push({
        name: 'edit-event-single-poster-edit',
        params: {
          posterId
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>

.edit-event-posters {
  flex: 1;
  height: 100%;
  padding-top: 1rem;
  display: flex;
  overflow: hidden;
}

.headline {
  margin: 0.5rem 0;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: bold;
}

.table-header {
  background: $grey-3;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

</style>
