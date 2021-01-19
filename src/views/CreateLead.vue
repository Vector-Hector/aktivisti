<template>
  <div class="container">
    <h2>Als Interessent*in registrieren</h2>
    <div class="p-fluid">
      <div class="p-field p-grid">
        <label
          for="lastName"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Name</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="lastName"
            v-model="lead.last_name"
            type="text"
          />
        </div>
      </div>
      <div class="p-field p-grid">
        <label
          for="firstName"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Vorname</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="firstName"
            v-model="lead.first_name"
            type="text"
          />
        </div>
      </div>
      <div class="p-field p-grid">
        <label
          for="email"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >E-Mail</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="email"
            v-model="lead.email"
            type="text"
          />
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="phoneNumber"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Handy</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="phoneNumber"
            v-model="lead.phone_number"
            type="text"
          />
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="zip"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Postleitzahl</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="zip"
            v-model="lead.plz"
            type="text"
          />
        </div>
      </div>
      <div class="p-field p-grid">
        <label
          for="city"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Ort</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="city"
            v-model="lead.city"
            type="text"
          />
        </div>
      </div>
    </div>
    <div class="p-field-checkbox">
      <Checkbox
        id="isMember"
        v-model="lead.is_party_member"
        name="isMember"
        :binary="true"
      />
      <label for="isMember">Ich bin DIE LINKE Mitglied</label>
    </div>

    <div class="p-field-checkbox">
      <Checkbox
        id="wantToBecomeMember"
        v-model="lead.want_to_become_member"
        name="wantToBecomeMember"
        :binary="true"
      />
      <label for="wantToBecomeMember">Ich möchte DIE LINKE Mitglied werden</label>
    </div>

    <div class="p-field-checkbox">
      <Checkbox
        id="privacyOptIn"
        v-model="lead.privacy_opt_in"
        name="privacyOptIn"
        :binary="true"
      />
      <label for="privacyOptIn">Ich stimme der Datenschutzerklärung zu</label>
    </div>

    <div class="control-buttons">
      <Button
        label="Speichern"
        @click="saveLead"
      />
    </div>
  </div>
  <Dialog
    v-model:visible="confirmOpen"
    :closable="false"
  >
    Kontakt wurde erfolgreich registriert
    <template #footer>
      <Button
        label="Ok"
        autofocus
        @click="confirm"
      />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

import Dialog from 'primevue/dialog'
import { CreateLeadDto } from '@/api/model/CreateLeadDto'


export default defineComponent({
  name: 'CreateLead',
  components: {
    InputText,
    Checkbox,
    Button,
    Dialog
  },
  props: {
    eventId: {
      type: Number as PropType<number>,
      required: true
    }
  },
  data() {
    return {
      confirmOpen: false,
      lead: {} as Partial<CreateLeadDto>
    }
  },
  methods: {
    async saveLead() {
      this.confirmOpen = true
    },
    confirm() {
      this.$router.go(-1)
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
