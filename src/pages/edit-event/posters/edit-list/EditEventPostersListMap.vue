<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import EditPosterListMixin from 'pages/edit-event/posters/EditPosterListMixin'

export default defineComponent({
  name: 'EditEventPostersListMap',
  mixins: [EditPosterListMixin]
})
</script>
