<template>
  <QScrollArea
    class="d-flex flex-fill"
  >
    <QPage>
      <div class="container">
        <p>
          Du willst eine Aktion in Deinem Kreisverband planen und andere dazu einladen?
          Dann brauchst Du Koordination-Rechte.
          Schreibe uns kurz, was Du für Veranstaltungen planen willst - wir melden uns bei Dir.
        </p>
        <QInput
          stack-label
          disable
          v-model="localUser.username"
          label="Benutzer*innenname"
        />
        <QInput
          stack-label
          disable
          v-model="localUser.email"
          label="E-Mail"
        />
        <QInput
          stack-label
          v-model="this.homeAssociationName"
          label="Kreisverband"
        />
        <QInput
          stack-label
          type="textarea"
          v-model="message"
          label="Deine Nachricht"
        />
        <QBtn
          label="Koordinatiosrechte beantragen"
          @click="requestCoordinatorPermissions"
        />
        Benutzername: vorausgefüllt
        E-Mail-Adresse: vorausgefüllt
        Kreisverband: vorausgefüllt, änderbar
        Button: Koordinationsrechte beantragen


      </div>
    </QPage>
  </QScrollArea>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { cloneDeep } from 'lodash-es'
import {
  QBtn,
  QInput,
  QPage,
  QScrollArea,
} from 'quasar'
import { userStore } from 'src/store/UserStore'
import {SubAssociationDto} from 'src/api/model/SubAssociationDto'

export default defineComponent({
  name: 'CreateEventRequestPermissions',
  components: {
    QInput,
    QBtn,
    QScrollArea,
    QPage
  },
  data() {
    return {
      message: '',
      localUser: cloneDeep(userStore.getState().user),
      errors: {}
    }
  },
  computed: {
    homeAssociation: {
      get(): SubAssociationDto | null {
        return userStore.getState().homeAssociation
      },
      set(value: SubAssociationDto) {
        userStore.setHomeAssociation(value)
      }
    },
    homeAssociationName(): string {
      return this.homeAssociation ? this.homeAssociation.name : 'kein Kreisverband'
    }
  },
  methods: {
    async requestCoordinatorPermissions() {
      try {
        await this.$apiClient.contact.post({
          message: this.message,
          sub_association: this.localUser?.sub_association ? this.localUser?.sub_association : 0
        })
      }
      catch (e) {
        if (this.$apiClient.isApiClientError(e) && e.response?.status === 400) {
          this.errors = e.response.data
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
