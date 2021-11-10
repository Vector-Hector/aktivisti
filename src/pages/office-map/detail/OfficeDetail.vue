<template>
  <QScrollArea
    class="d-flex flex-fill"
    v-if="office"
  >
    <div class="container q-gutter-y-md q-py-sm">
      <div class="row q-gutter-sm">
        <div class="col">
          <div class="row q-col-gutter-sm office-details">
            <template v-if="office.location_description">
              <div class="col-4">
                <b>Adresse:</b>
              </div>
              <div class="col-8">
                {{ office.location_description }}
              </div>
            </template>
            <template v-if="office.link">
              <div class="col-4">
                <b>Internetseite:</b>
              </div>
              <div class="col-8">
                <a target="_blank" class="primary-link" :href="office.link">{{ office.link }}</a>
              </div>
            </template>
            <template v-if="office.email">
              <div class="col-4">
                <b>E-Mail-Adresse:</b>
              </div>
              <div class="col-8">
                <a :href="'mailto:' + office.email">{{ office.email }}</a>
              </div>
            </template>
            <template v-if="office.phone_number">
              <div class="col-4">
                <b>Telefon:</b>
              </div>
              <div class="col-8">
                <a :href="'tel:' + office.phone_number">{{ office.phone_number }}</a>
              </div>
            </template>
            <template v-if="office.description">
              <div class="col-4">
                <b>Beschreibung:</b>
              </div>
              <div class="col-8">
                {{ office.description }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </QScrollArea>
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import OfficeDetailMixin from 'pages/office-map/detail/OfficeDetailMixin'
import { uiStore } from 'src/store/UiStore'
import { QScrollArea } from 'quasar'

export default defineComponent({
  name: 'OfficeDetail',
  components: {
    QScrollArea
  },
  mixins: [OfficeDetailMixin],
  async beforeRouteEnter(to, from, next) {
    const {officeId} = to.params
    const officeResponse = await apiClient.offices.get(officeId.toString())
    next((vm) => {
      const office = officeResponse.payload.data
      // @ts-ignore
      vm.office = office

      uiStore.updateActiveElements({
        office: office.name
      })
    })
  }
})
</script>

<style lang="scss" scoped>
.office-details {
  font-size: 1rem;
}
</style>
