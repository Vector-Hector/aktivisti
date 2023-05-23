<template>
  <span></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import EditPosterListMixin from 'pages/edit-event/posters/EditPosterListMixin'
import EditEventGeometryMixin from 'pages/edit-event/geometry/EditEventGeometryMixin'

export default defineComponent({
  name: 'EditEventPostersListMap',
  mixins: [EditPosterListMixin, EditEventGeometryMixin]
})
</script>
