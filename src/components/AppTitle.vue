<template>
  <div class="app-title">
    <QToolbarTitle size="small">
      {{ subtitle }}
    </QToolbarTitle>
    <QToolbarTitle>
      {{ title }}
    </QToolbarTitle>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QToolbarTitle } from 'quasar'

export default defineComponent({
  name: 'AppTitle',
  components: {
    QToolbarTitle
  },
  props: {
    title: {
      type: String as PropType<string>,
      required: false,
      default: 'DIE LINKE. App'
    },
    subtitle: {
      type: String as PropType<string | undefined>,
      required: false,
      default: undefined
    }
  },
  data() {
    return {}
  }
})
</script>

<style lang="scss" scoped></style>
