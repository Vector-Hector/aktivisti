<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import { QIcon } from 'quasar'
import { ionChevronDown, ionChevronUp } from '@quasar/extras/ionicons-v5'

interface Props {
  title: string
}

interface Emits {
  (e: 'changedSize', state: BottomSheetState): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const transitionListener = ref<EventListener | null>(null)
const bottomSheet = ref<HTMLElement | null>(null)

const state = computed({
  get() {
    return uiStore.getState().bottomSheetState
  },
  set(value: BottomSheetState) {
    uiStore.setBottomSheetState(value)
  }
})

function expand() {
  switch (state.value) {
    case BottomSheetState.COLLAPSED:
      state.value = BottomSheetState.HALF
      break
    case BottomSheetState.HALF:
      state.value = BottomSheetState.EXPANDED
      break
  }
}

function shrink() {
  switch (state.value) {
    case BottomSheetState.EXPANDED:
      state.value = BottomSheetState.HALF
      break
    case BottomSheetState.HALF:
      state.value = BottomSheetState.COLLAPSED
      break
  }
}

watch(
  () => state.value,
  (newValue, oldValue) => {
    transitionListener.value = () => {
      bottomSheet.value?.removeEventListener(
        'transitionend',
        transitionListener.value!
      )
      transitionListener.value = null
      emit('changedSize', newValue)
    }
    if (newValue !== oldValue) {
      bottomSheet.value?.addEventListener(
        'transitionend',
        transitionListener.value
      )
    }
  }
)

onBeforeUnmount(() => {
  if (transitionListener.value) {
    bottomSheet.value!.removeEventListener(
      'transitionend',
      transitionListener.value
    )
  }
})
</script>

<template>
  <div
    class="resizable-bottom-sheet"
    ref="bottomSheet"
    :class="{
      [state]: true,
      'absolute-sheet': state === BottomSheetState.EXPANDED
    }"
  >
    <h3 v-if="props.title" class="overlay-title">
      {{ props.title }}
    </h3>
    <div class="size-controls">
      <button class="resize-button expand" @click="expand">
        <QIcon class="icon" :name="ionChevronUp" />
      </button>
      <button class="resize-button shrink" @click="shrink">
        <QIcon class="icon" :name="ionChevronDown" />
      </button>
    </div>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@import 'src/css/_variables.scss';

.resizable-bottom-sheet {
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
  bottom: 0;
  order: 2;
  width: 100%;
  transition: height 200ms ease-out;
  z-index: 200;

  &.collapsed {
    height: 7%;

    .resize-button.expand {
      top: -20px;
    }

    .resize-button.shrink {
      transform: scale(0);
      opacity: 0;
    }
  }

  &.half {
    height: 50%;

    .resize-button {
      line-height: 36px;
      height: 36px;
    }

    .resize-button.expand {
      top: -36px;
      border-radius: 20px 20px 0 0;
    }

    .resize-button.shrink {
      top: 0;
      border-radius: 0 0 20px 20px;
    }
  }

  &.expanded {
    height: 95%;

    .resize-button.expand {
      transform: scale(0);
      opacity: 0;
      top: 0;
    }

    .resize-button.shrink {
      top: -20px;
    }
  }
}

.resize-button {
  position: absolute;
  right: 10px;
  border: 0 none;
  outline: 0 none;
  padding: 0;
  margin: 0;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 20px;
  line-height: 40px;
  text-align: center;
  font-weight: bold;
  font-size: 18px;
  overflow: hidden;
  transition: all 400ms ease-out, border-radius 250ms ease-out;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  .icon {
    color: $grey-8;
  }

  &.expand {
    top: -36px;
  }

  &.shrink {
    top: 0;
  }
}

.scrollable-content {
  display: flex;
  flex: 1;
}

.absolute-sheet {
  position: absolute;
}
</style>
