<template>
  <span>
    Wollen sie die Beschreibung für diesen Ort übernehmen?
    <br>
    <b>{{ placeName }}</b>
  </span>
</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    placeName: {
      type: String as PropType<string>,
      required: true
    }
  }
})
</script>
