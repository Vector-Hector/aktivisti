<script setup lang="ts">
import { QSpinnerPuff } from 'quasar'
</script>
<template>
  <div class="loading-spinner-wrapper">
    <QSpinnerPuff class="loading-spinner" color="primary" />
  </div>
</template>
<style lang="scss" scoped>
.loading-spinner-wrapper {
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  width: 100%;
  margin: 4rem 0;
  display: flex;
  flex: 1;
}
</style>
