<script setup lang="ts">
import { inject } from 'vue'

import { QBtn } from 'quasar'
import { ionLocationSharp } from '@quasar/extras/ionicons-v5'
import SidebarBottomStepNavigation from 'components/SidebarBottomStepNavigation.vue'
import { StepControls } from 'pages/EditEvent.vue'
import { useEditPosterListMixin } from 'pages/edit-event/posters/EditPosterListMixin'
import PosterTable from 'components/PosterTable.vue'
import { useRouter } from 'vue-router'

const $router = useRouter()

const { posters, deletePoster } = useEditPosterListMixin()
const stepControls = inject('stepControls') as StepControls

async function back() {
  stepControls.previous()
}
async function next() {
  stepControls.next()
}
async function editPoster(posterId: number) {
  await $router.push({
    name: 'edit-event-single-poster-edit',
    params: {
      posterId
    }
  })
}
</script>

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
    @forward="next"
    @back="back"
    :last="stepControls.isLastStep.value"
  />
</template>

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
