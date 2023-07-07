<template>
  <div class="popup-contents">
    <span class="popup-title">DIE LINKE vor Ort</span>
    <span class="popup-address">{{
      office.properties.location_description
    }}</span>
    <QBtn
      label="Mehr Informationen"
      color="primary"
      :to="`/offices/${office.id}`"
    />
  </div>
</template>
<script setup lang="ts">
import { QBtn } from 'quasar'
import { OfficeGeoJsonFeature } from 'src/api/model/OfficeGeoJsonDto'

interface Props {
  office: OfficeGeoJsonFeature
}

defineProps<Props>()
</script>

<style lang="scss">
.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}

.popup-type {
  display: block;
  font-size: 0.9rem;
}

.popup-campaign {
  display: block;
  font-size: 0.9rem;
}

.popup-date {
  display: block;
  font-size: 0.9rem;
}

.join-link {
  align-self: flex-end;

  Button {
    padding: 3px 6px;
  }

  margin-top: 6px;
}

.popup-contents {
  display: flex;
  flex-direction: column;
}
</style>
