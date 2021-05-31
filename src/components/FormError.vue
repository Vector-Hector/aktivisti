<template>
  <div
    class="error row inline no-outline"
    v-if="error"
  >
    {{ error }}
  </div>
</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    error: {
      type: String as PropType<string>,
      default: ''
    }
  }
})
</script>
