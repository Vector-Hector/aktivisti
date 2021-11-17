<template>
  <Popup>
    <div class="popup-contents">
      <span class="popup-title">DIE LINKE vor Ort</span>
      <span class="popup-address">{{ address }}</span>
      <QBtn
        label="Mehr Informationen"
        color="primary"
        :to="`/offices/${officeId}`"
      />
    </div>
  </Popup>
</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'
import Popup from 'src/mapbox/popup/Popup.vue'
import { QBtn } from 'quasar'

export default defineComponent({
  name: 'OfficePopup',
  components: {
    Popup, QBtn
  },
  props: {
    address: {
      type: String as PropType<string>,
      required: true
    },
    officeId: {
      type: Number as PropType<number>,
      required: true
    }

  }
})
</script>
<style lang="scss" scoped>
.popup-contents {
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}

.popup-address {
  display: block;
  font-size: 0.9rem;
}
</style>
