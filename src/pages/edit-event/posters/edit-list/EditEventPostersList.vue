<template>
  <div class="edit-event-posters container">
    <div class="row">
      <div class="col buttons">
        <QBtn
          color="primary"
          label="Erstellen"
          :icon="ionLocationSharp"
          :to="{ name: 'edit-event-single-poster-new' }"
        />
      </div>
    </div>
    <PosterTable
      :show-actions="true"
      :posters="posters"
      @row-click="editPoster($event.id)"
      @row-deleted="deletePoster"
    />
  </div>
  <SidebarBottomStepNavigation
    @close="abort"
    @forward="next"
    @back="back"
    :last="stepControls.isLastStep.value"
  />
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'

import { QBtn } from 'quasar'
import { ionLocationSharp } from '@quasar/extras/ionicons-v5'
import SidebarBottomStepNavigation from 'components/SidebarBottomStepNavigation.vue'
import EditEventAutoSaveMixin from 'pages/edit-event/EditEventAutoSaveMixin'
import { posterStatusOptions } from 'src/api/model/PosterDto'
import { StepControls } from 'pages/EditEvent.vue'
import EditPosterListMixin from 'pages/edit-event/posters/EditPosterListMixin'
import PosterTable from 'components/PosterTable.vue'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'

export default defineComponent({
  name: 'EditEventPostersList',
  components: {
    PosterTable,
    SidebarBottomStepNavigation,
    QBtn
  },
  mixins: [EditPosterListMixin, EditEventAutoSaveMixin],
  setup() {
    const { event } = useEditEventMixin()
    return {
      event,
      stepControls: inject('stepControls') as StepControls
    }
  },
  data() {
    return {
      ionLocationSharp,
      posterStatusOptions,
      confirmDelete: true,
      filters: {
        status: null
      }
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

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
</style>
