<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'EditEventSinglePosterMap',
  props: {
    posterId: {
      type: String as PropType<string | undefined>,
      required: false
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
