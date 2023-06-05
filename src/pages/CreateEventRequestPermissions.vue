<template>
  <QScrollArea class="d-flex flex-fill">
    <QPage>
      <div class="container">
        <p class="description-text">
          Du willst eine Aktion in Deinem Kreisverband planen und andere dazu
          einladen? Dann brauchst Du Koordination-Rechte. Schreibe uns kurz, was
          Du für Veranstaltungen planen willst - wir melden uns bei Dir.
        </p>
        <QInput
          stack-label
          disable
          v-model="localUser.username"
          label="Benutzer*innenname"
        />
        <QInput stack-label disable v-model="localUser.email" label="E-Mail" />
        <MultipleSubAssociationFilter
          v-model="selectedSubAssociation"
          :multiple="false"
          :options="subAssociations"
          :error="!!errors.sub_association?.length"
          :error-message="errors.sub_association?.[0]"
        />
        <QInput
          stack-label
          type="textarea"
          v-model="message"
          label="Deine Nachricht"
          :error="!!errors.message?.length"
          :error-message="errors.message?.[0]"
        />
        <QBtn
          label="Koordinatiosrechte beantragen"
          color="negative"
          @click="requestCoordinatorPermissions"
        />
      </div>
    </QPage>
  </QScrollArea>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { cloneDeep } from 'lodash-es'
import { QBtn, QInput, QPage, QScrollArea } from 'quasar'
import { userStore } from 'src/store/UserStore'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import MultipleSubAssociationFilter from 'components/filterInput/filters/MultipleSubAssociationFilter.vue'

export default defineComponent({
  name: 'CreateEventRequestPermissions',
  components: {
    QInput,
    QBtn,
    QScrollArea,
    QPage,
    MultipleSubAssociationFilter
  },
  data() {
    return {
      message: '',
      localUser: cloneDeep(userStore.getState().user),
      errors: {},
      subAssociations: [] as SubAssociationDto[],
      selectedSubAssociation: 0
    }
  },
  async created() {
    await this.getSubAssociations()
    const homeAssociation = userStore.getState().homeAssociation
    this.selectedSubAssociation = homeAssociation ? homeAssociation.id : 0
  },
  methods: {
    async getSubAssociations() {
      this.subAssociations = (
        await this.$apiClient.subAssociations.list()
      ).payload.data
    },
    async requestCoordinatorPermissions() {
      try {
        await this.$apiClient.contact.post({
          message: this.message,
          sub_association: this.selectedSubAssociation
        })
        this.$q.notify({
          color: 'positive',
          message:
            'Vielen Dank für deine Nachricht. Wir melden uns bald bei dir.'
        })
      } catch (e) {
        if (this.$apiClient.isApiClientError(e) && e.response?.status === 400) {
          this.errors = e.response.data
          this.$q.notify({
            message:
              'Deine Nachricht konnte nicht versendet werden, bitte prüfe deine Angaben.',
            color: 'negative'
          })
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Ein unerwarteter Fehler ist aufgetreten'
          })
        }
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.description-text {
  color: $text-primary;
  font-size: 1rem;
  padding: 1rem 2rem 1rem 0;
  line-height: 1;
  display: block;
}
</style>
