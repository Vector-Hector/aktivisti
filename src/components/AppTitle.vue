<template>
  <div class="app-title">
    <IonTitle
      size="small"
    >
      {{ subtitle }}
    </IonTitle>
    <IonTitle>
      {{ title }}
    </IonTitle>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonTitle } from '@ionic/vue'


export default defineComponent({
  name: 'AppTitle',
  components: {
    IonTitle
  },
  props: {
    title: {
      type: String as PropType<string>,
      required: false,
      default: 'Wahlkampf App'
    },
    subtitle: {
      type: String as PropType<string>,
      required: false,
      default: undefined
    },
  },
  data() {
    return {}
  }
})
</script>

<style lang="scss" scoped>

</style>
