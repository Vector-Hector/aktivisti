<script setup lang="ts">
import { PropType, computed } from 'vue'
import { QBtn } from 'quasar'
import { useBtnProps } from 'quasar/src/components/btn/use-btn.js'

// TODO(peter) Use `interface Props` style
const props = defineProps({
  ...useBtnProps,
  externalLabel: {
    type: String as PropType<string>,
    required: false
  },
  notificationCount: {
    type: Number,
    default: 0
  },
  hasNotification: {
    type: Boolean,
    default: false
  }
})

const notificationStyle = computed(() => {
  if (props.notificationCount > 0) {
    return {
      top: '-5px',
      right: '-5px',
      width: '20px',
      height: '20px'
    }
  } else {
    // Default style or when notification is not needed
    return {}
  }
})
</script>
<template>
  <div class="labeled-button">
    <div class="button-container">
      <slot name="btn">
        <QBtn v-bind="$props" />
      </slot>
      <div
        v-if="props.notificationCount > 0 || props.hasNotification"
        class="notification-badge"
        :style="notificationStyle"
      >
        <span v-if="props.notificationCount">{{
          props.notificationCount
        }}</span>
      </div>
    </div>
    <div class="button-label">
      {{ $props.externalLabel }}
    </div>
  </div>
</template>
<style lang="scss" scoped>
.labeled-button {
  text-align: center;
  flex-direction: column;

  .button-container {
    position: relative;
    display: inline-block;
  }

  .notification-badge {
    position: absolute;
    top: 2px;
    right: -1px;
    background-color: red;
    color: white;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    // Using the same shadow as .q-btn:before
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.12);
  }
}
</style>
