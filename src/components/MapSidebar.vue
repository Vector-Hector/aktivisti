<script setup lang="ts"></script>
<template>
  <div class="map-sidebar">
    <div class="map-sidebar-content">
      <slot />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.map-sidebar {
  min-width: 450px;
  width: 25vw;
  order: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.map-sidebar-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
