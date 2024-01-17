<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'

import { PosterDto, PosterMount, PosterStatus } from 'src/api/model/PosterDto'
import { StepControls } from 'pages/EditEvent.vue'
import EditPoster from 'components/EditPoster.vue'
import { cloneDeep } from 'lodash-es'
import { apiClient } from 'src/api/ApiClient'
import { QBtn, QScrollArea, useQuasar } from 'quasar'
import {
  ionClose,
  ionLocationSharp,
  ionSave,
  ionTrash
} from '@quasar/extras/ionicons-v5'
import { useEditSinglePosterMixin } from 'pages/edit-event/posters/edit-single/EditSinglePosterMixin'
import { posterListStore } from 'src/store/PosterListStore'
import { useEditPosterListMixin } from 'pages/edit-event/posters/EditPosterListMixin'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

const defaultPoster: Partial<PosterDto> = {
  status: PosterStatus.ABSENT,
  mounted_on: PosterMount.LAMPPOST
}

interface Props {
  posterId?: string | undefined
}
const props = defineProps<Props>()

const $q = useQuasar()
const $route = useRoute()
const $router = useRouter()

onMounted(async () => {
  let initialPoster: Partial<PosterDto>
  const { posterId, eventId } = $route.params
  if (posterId) {
    initialPoster = (await apiClient.posters.get(posterId.toString())).payload
      .data
    posterListStore.state.activePosterIndex =
      posterListStore.state.posters.findIndex(
        ({ id }) => initialPoster.id === id
      )
  } else {
    initialPoster = {
      ...cloneDeep(defaultPoster),
      event: parseInt(eventId as string)
    }
    posterListStore.state.activePosterIndex =
      posterListStore.state.posters.push(initialPoster) - 1
  }
})

onBeforeRouteLeave(() => {
  if (!poster.value.id) {
    // poster wasn't save so remove it from the list
    posterListStore.state.posters = posterListStore.state.posters.filter(
      (_, index) => index !== posterListStore.state.activePosterIndex
    )
  }
  posterListStore.state.activePosterIndex = null
})
const { poster } = useEditSinglePosterMixin()
const { deletePoster } = useEditPosterListMixin()
const stepControls = inject('stepControls') as StepControls

const errors = ref<Record<string, unknown>>({})

async function save() {
  try {
    if (props.posterId) {
      poster.value = (
        await apiClient.posters.update(
          props.posterId,
          poster.value as PosterDto
        )
      ).payload.data
    } else {
      poster.value = (await apiClient.posters.create(poster.value)).payload.data
    }
    await $router.push({ name: 'edit-event-posters-list' })
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 400) {
      errors.value = e.response?.data
    } else {
      $q.notify({
        message: 'Das Plakat konnte nicht gespeichert werden',
        color: 'negative'
      })
    }
  }
}

async function abort() {
  await $router.push({ name: 'edit-event-posters-list' })
}

function onDeleteClicked() {
  if (!props.posterId) return
  $q.dialog({
    title: 'Plakat löschen',
    message: 'Möchtest dieses Plakat wirklich löschen?',
    cancel: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(async () => {
      const posterToDelete = poster.value
      await $router.push({ name: 'edit-event-posters-list' })
      await deletePoster(posterToDelete as PosterDto)
    })
}
</script>

<template>
  <div class="edit-event-single-poster flex column flex-fill">
    <QScrollArea class="col-grow full-width">
      <div class="container">
        <EditPoster
          :new="!!posterId"
          v-if="poster"
          v-model:poster="poster"
          :errors="errors"
          :edit-location="true"
        />
        <div class="buttons">
          <div v-if="posterId" class="button delete-button">
            <QBtn
              dense
              flat
              label="Löschen"
              :icon="ionTrash"
              @click="onDeleteClicked"
              color="primary"
            />
          </div>

          <div class="button close-button">
            <QBtn
              dense
              outline
              label="Abbrechen"
              :icon="ionClose"
              @click="abort"
              color="primary"
            />
          </div>
          <div class="button save-button">
            <QBtn
              dense
              v-if="posterId"
              color="primary"
              label="Speichern"
              :icon="ionSave"
              @click="save"
            />
            <QBtn
              v-else
              dense
              color="primary"
              label="Erstellen"
              :icon="ionLocationSharp"
              @click="save"
            />
          </div>
        </div>
      </div>
    </QScrollArea>
  </div>
</template>

<style lang="scss" scoped>
.edit-event-single-poster {
  display: flex;
  flex-direction: column;
}

.buttons {
  display: flex;
  flex-direction: row;
  margin: 1rem 0;

  .button {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: center;

    * {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    &:first-of-type {
      justify-content: flex-start;
    }

    &:last-of-type {
      justify-content: flex-end;
    }
  }
}
</style>
