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
import { posterStatusOptions } from 'src/api/model/PosterDto'
import { StepControls } from 'pages/EditEvent.vue'
import { useEditPosterListMixin } from 'pages/edit-event/posters/EditPosterListMixin'
import PosterTable from 'components/PosterTable.vue'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'

export default defineComponent({
  name: 'EditEventPostersList',
  components: {
    PosterTable,
    SidebarBottomStepNavigation,
    QBtn
  },
  setup() {
    const { event } = useEditEventMixin()
    const { posters, deletePoster } = useEditPosterListMixin()
    return {
      event,
      stepControls: inject('stepControls') as StepControls,
      posters,
      deletePoster
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
      this.stepControls.previous()
    },
    async next() {
      this.stepControls.next()
    },
    async abort() {
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
