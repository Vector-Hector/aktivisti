<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import { QIcon } from 'quasar'
import { ionChevronDown, ionChevronUp } from '@quasar/extras/ionicons-v5'
import { farCalendarPlus } from '@quasar/extras/fontawesome-v5'

interface Props {
  title: string
  showCreateButton: boolean
}

interface Emits {
  (e: 'changedSize', state: BottomSheetState): void
  (e: 'onCreateEvent'): void
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

function handleCreateEvent() {
  emit('onCreateEvent')
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
    <div class="control-button-group">
      <div class="row">
        <div class="col create-button-group" v-if="showCreateButton">
          <button class="control-button create" @click="handleCreateEvent">
            <QIcon class="icon" :name="farCalendarPlus" />
          </button>
          <div class="create-text">Erstellen</div>
        </div>
        <div class="col resize-button-group">
          <button class="control-button expand" @click="expand">
            <QIcon class="icon" :name="ionChevronUp" />
          </button>
          <button class="control-button shrink" @click="shrink">
            <QIcon class="icon" :name="ionChevronDown" />
          </button>
        </div>
      </div>
    </div>
    <div class="overlay-content" :style="ovlerlayContentStyleHeight">
    <slot />
    </div>
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

    .control-button.expand {
      margin-top: -18px;
    }

    .control-button.shrink {
      transform: scale(0);
      opacity: 0;
    }
  }

  &.half {
    height: 50%;

    .control-button {
      line-height: 36px;
      height: 36px;
    }

    .control-button.expand {
      margin-top: -36px;
      border-radius: 20px 20px 0 0;
    }

    .control-button.shrink {
      margin-top: 0;
      border-radius: 0 0 20px 20px;
    }
  }

  &.expanded {
    height: 95%;

    .control-button.expand {
      transform: scale(0);
      opacity: 0;
      top: 0;
    }

    .control-button.shrink {
      margin-top: -18px;
    }

    .control-button.create {
      margin-top: -18px;
    }
  }
}

.control-button-group {
  position: absolute;
  top: 0;
  right: 0;
}

.resize-button-group {
  margin: 0 12px;
}

.control-button {
  border: 0 none;
  outline: 0 none;
  padding: 0;
  margin: 0;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 36px;
  height: 36px;
  border-radius: 18px;
  line-height: 36px;
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
    margin-top: -36px;
  }

  &.shrink {
    top: 0;
  }

  &.create {
    margin-top: -18px;
    background-color: $primary;

    .icon {
      color: white;
    }
  }
}

.create-text {
  font-size: 10px;
  color: $primary;
}

.scrollable-content {
  display: flex;
  flex: 1;
}

.absolute-sheet {
  position: absolute;
}

.overlay-content {
  display: flex;
}

.overlay-title {
  background: $grey-1;
  border-bottom: 1px solid $red;
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  line-height: 1.5rem;
}
</style>
