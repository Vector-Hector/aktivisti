<script setup lang="ts">
interface Props {
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  error: () => ''
})
</script>
<template>
  <div class="error row inline no-outline" v-if="props.error">
    {{ props.error }}
  </div>
</template>
