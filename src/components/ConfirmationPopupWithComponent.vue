<template>
  <Teleport to="body">
    <transition
      name="p-confirm-popup"
      @enter="onEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="visible"
        :ref="containerRef"
        class="p-confirm-popup p-component"
        v-bind="$attrs"
        @click="onOverlayClick"
      >
        <div
          v-if="confirmation.component"
          class="p-confirm-popup-content"
        >
          <component
            :is="confirmation.component"
            v-bind="confirmation.componentProps"
          />
        </div>
        <div
          v-else
          class="p-confirm-popup-content"
        >
          <i :class="iconClass" />
          <span class="p-confirm-popup-message">{{ confirmation.message }}</span>
        </div>
        <div class="p-confirm-popup-footer">
          <CPButton
            :label="rejectLabel"
            :icon="rejectIcon"
            :class="rejectClass"
            @click="reject()"
          />
          <CPButton
            :label="acceptLabel"
            :icon="acceptIcon"
            :class="acceptClass"
            autofocus
            @click="accept()"
          />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script lang="ts">
import ConfirmPopup from 'primevue/confirmpopup'


export default {
  name: 'ConfirmationPopupWithComponent',
  extends: ConfirmPopup
}
</script>

<style lang="scss" scoped>

</style>
