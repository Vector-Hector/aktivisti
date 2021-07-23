<template>
  <div class="edit-event-single-poster container">
    <EditPoster
      :new="!!posterId"
      v-if="poster"
      v-model:poster="poster"
      :errors="errors"
      :edit-location="true"
    />
    <div class="buttons">
      <div
        v-if="posterId"
        class="button delete-button"
      >
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
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue'

import EditEventGeometryMixin from 'pages/edit-event/geometry/EditEventGeometryMixin'
import { PosterDto, PosterMount, PosterStatus } from 'src/api/model/PosterDto'
import { StepControls } from 'pages/EditEvent.vue'
import EditPoster from 'components/EditPoster.vue'
import { cloneDeep } from 'lodash-es'
import { apiClient } from 'src/api/ApiClient'
import { QBtn } from 'quasar'
import { ionClose, ionLocationSharp, ionSave, ionTrash } from '@quasar/extras/ionicons-v5'
import EditSinglePosterMixin from 'pages/edit-event/posters/edit-single/EditSinglePosterMixin'
import { posterListStore } from 'src/store/PosterListStore'
import EditPosterListMixin from 'pages/edit-event/posters/EditPosterListMixin'

const defaultPoster: Partial<PosterDto> = {
  status: PosterStatus.ABSENT,
  mounted_on: PosterMount.LAMPPOST
}

export default defineComponent({
  name: 'EditEventSinglePoster',
  props: {
    posterId: {
      type: String as PropType<string | undefined>,
      required: false
    }
  },
  components: {
    EditPoster,
    QBtn
  },
  mixins: [EditEventGeometryMixin, EditSinglePosterMixin, EditPosterListMixin],
  async beforeRouteEnter(to, from, next) {
    let initialPoster: Partial<PosterDto>
    const { posterId, eventId } = to.params
    if (posterId) {
      initialPoster = (await apiClient.posters.get(posterId.toString())).payload.data
      posterListStore.state.activePosterIndex = posterListStore.state.posters.findIndex((({id}) => initialPoster.id === id))
    } else {
      initialPoster = {
        ...cloneDeep(defaultPoster),
        event: parseInt(eventId as string)
      }
      posterListStore.state.activePosterIndex = posterListStore.state.posters.push(initialPoster) - 1
    }
    next()
  },
  beforeRouteLeave() {
    if (!this.poster.id) {
      // poster wasn't save so remove it from the list
      posterListStore.state.posters = posterListStore.state.posters.filter(
        (_, index) => index !== posterListStore.state.activePosterIndex
      )
    }
    posterListStore.state.activePosterIndex = null
  },
  setup() {
    return {
      stepControls: inject('stepControls') as StepControls
    }
  },
  data() {
    return {
      ionLocationSharp,
      ionClose,
      ionTrash,
      ionSave,
      errors: {}
    }
  },
  methods: {
    async save() {
      try {
        if (this.posterId) {
          this.poster = (await this.$apiClient.posters.update(this.posterId, this.poster as PosterDto)).payload.data
        } else {
          this.poster = (await this.$apiClient.posters.create(this.poster)).payload.data
        }
        await this.$router.push({name: 'edit-event-posters-list'})
      } catch (e) {
        if (e.response?.status === 400) {
          this.errors = e.response?.data
        } else {
          this.$q.notify({
            message: 'Das Poster konnte nicht gespeichert werden',
            color: 'negative'
          })
        }
      }
    },
    async abort() {
      await this.$router.push({name: 'edit-event-posters-list'})
    },
    onDeleteClicked() {
      if (!this.posterId) return
      this.$q.dialog({
        title: 'Poster löschen',
        message: 'Möchtest dieses Poster wirklich löschen?',
        cancel: true
      }).onOk(async () => {
        const poster = this.poster
        await this.$router.push({name: 'edit-event-posters-list'})
        await this.deletePoster(poster as PosterDto)
      })
    }
  }
})
</script>

<style lang="scss" scoped>
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
