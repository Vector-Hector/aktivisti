<template>
  <IonContent>
    <div class="container">
      <h2>Als Interessent*in registrieren</h2>
      <IonItem>
        <IonLabel>
          Geschlecht
        </IonLabel>
        <IonSelect
          id="gender"
          v-model="lead.gender"
          type="select"
        >
          <IonSelectOption
            v-for="gender in genders"
            :key="gender.value"
            :value="gender.value"
          >
            {{ gender.label }}
          </IonSelectOption>
        </IonSelect>
      </IonItem>
      <IonItem>
        <IonLabel position="floating">
          Nachname
        </IonLabel>
        <IonInput
          id="lastName"
          v-model="lead.last_name"
          type="text"
        />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">
          Vorname
        </IonLabel>
        <IonInput
          id="firstName"
          v-model="lead.first_name"
          type="text"
        />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">
          E-Mail
        </IonLabel>
        <IonInput
          id="email"
          v-model="lead.email"
          type="text"
        />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">
          Telefonnummer
        </IonLabel>
        <IonInput
          id="phone"
          v-model="lead.phone_number"
          type="text"
        />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">
          Postleitzahl
        </IonLabel>
        <IonInput
          id="plz"
          v-model="lead.plz"
          type="text"
        />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">
          Stadt
        </IonLabel>
        <IonInput
          id="city"
          v-model="lead.city"
          type="text"
        />
      </IonItem>
      <IonItem>
        <IonLabel>
          Ich bin DIE LINKE Mitglied
        </IonLabel>
        <IonCheckbox
          id="isMember"
          slot="start"
          v-model="lead.is_party_member"
        />
      </IonItem>
      <IonItem>
        <IonLabel>
          Ich möchte DIE LINKE Mitglied werden
        </IonLabel>
        <IonCheckbox
          id="wantToBecomeMember"
          slot="start"
          v-model="lead.want_to_become_member"
        />
      </IonItem>
      <IonItem>
        <IonLabel>
          Ich stimme der Datenschutzerklärung zu
        </IonLabel>
        <IonCheckbox
          id="privacyOptIn"
          slot="start"
          v-model="lead.privacy_opt_in"
        />
      </IonItem>
      <div class="control-buttons">
        <IonButton
          @click="saveLead"
        >
          Abschicken
        </IonButton>
      </div>
    </div>
  </IonContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { LeadDto } from '@/api/model/LeadDto'
import { IonButton, IonCheckbox, IonContent, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/vue'


export default defineComponent({
  name: 'CreateLead',
  components: {
    IonInput,
    IonSelectOption,
    IonSelect,
    IonCheckbox,
    IonButton,
    IonContent,
    IonLabel,
    IonItem,
  },
  props: {
    eventAreaId: {
      type: Number as PropType<number | undefined>,
      required: false,
      default: undefined
    }
  },
  data() {
    return {
      confirmOpen: false,
      lead: {} as Partial<LeadDto>,
      genders: [
        {
          value: 'm',
          label: 'männlich'
        },
        {
          value: 'w',
          label: 'weiblich'
        },
        {
          value: 'd',
          label: 'divers'
        }
      ]
    }
  },
  methods: {
    async saveLead() {
      // TODO: Error handling
      await this.$apiClient.leads.create(
        {
          ...this.lead,
          event_area: this.eventAreaId
        })
      // TODO: maybe add an explicit back route
      this.$router.go(-1)
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
