<script setup lang="ts">
import { computed } from 'vue'
import ResizableBottomSheet from 'components/ResizableBottomSheet.vue'
import MapSidebar from 'components/MapSidebar.vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'

interface Props {
  showCreateButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCreateButton: false
})

const $q = useQuasar()
const $router = useRouter()
const userStore = useUserStore()

const overlayComponent = computed(() => {
  return $q.screen.lt.md ? ResizableBottomSheet : MapSidebar
})

async function handleCreateEvent() {
  let to = 'create-event-request-permissions'
  if (userStore.hasAtLeastOneManagePermission) {
    to = 'create-event'
  }
  await $router.push({ name: to })
}
</script>

<template>
  <component
    class="overlay-shadow"
    :is="overlayComponent"
    v-bind="$props"
    :showCreateButton="props.showCreateButton"
    @onCreateEvent="handleCreateEvent"
  >
    <slot />
  </component>
</template>
