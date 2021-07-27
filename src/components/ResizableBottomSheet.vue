<template>
  <div
    class="resizable-bottom-sheet"
    ref="bottomSheet"
    :class="{
      [state]: true,
      'absolute-sheet': state === BottomSheetState.EXPANDED
    }"
  >
    <h3
      v-if="title"
      class="overlay-title"
    >
      {{ title }}
    </h3>
    <div
      class="size-controls"
    >
      <button
        class="resize-button expand"
        @click="expand"
      >
        <QIcon
          class="icon"
          :name="ionChevronUp"
        />
      </button>
      <button
        class="resize-button shrink"
        @click="shrink"
      >
        <QIcon
          class="icon"
          :name="ionChevronDown"
        />
      </button>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import { QIcon, QScrollArea } from 'quasar'
import { ionChevronDown, ionChevronUp } from '@quasar/extras/ionicons-v5'


export default defineComponent({
  name: 'ResizableBottomSheet',
  components: {
    QIcon
  },
  props: {
    title: {
      type: String as PropType<string>,
      required: false,
      default: undefined
    }
  },
  provide() {
    return {
      scrollArea: computed(() => this.$refs.scrollArea)
    }
  },
  emits: ['changedSize'],
  data() {
    return {
      BottomSheetState,
      ionChevronUp,
      ionChevronDown,
      transitionListener: null as EventListener | null
    }
  },
  computed: {
    state: {
      get() {
        return uiStore.getState().bottomSheetState
      },
      set(value: BottomSheetState) {
        uiStore.setBottomSheetState(value)
      }
    },
    bottomSheetRef(): HTMLElement | undefined {
      return this.$refs.bottomSheet as HTMLElement | undefined
    }
  },
  watch: {
    state(newValue, oldValue) {
      this.transitionListener = () => {
        this.bottomSheetRef?.removeEventListener('transitionend', this.transitionListener!)
        this.transitionListener = null
        this.$emit('changedSize', newValue)
      }
      if (newValue !== oldValue) {
        this.bottomSheetRef?.addEventListener('transitionend', this.transitionListener)
      }
    }
  },
  beforeUnmount() {
    if (this.transitionListener) {
      this.bottomSheetRef!.removeEventListener('transitionend', this.transitionListener)
    }
  },
  methods: {
    expand() {
      switch (this.state) {
      case BottomSheetState.COLLAPSED:
        this.state = BottomSheetState.HALF
        break
      case BottomSheetState.HALF:
        this.state = BottomSheetState.EXPANDED
        break
      }
    },
    shrink() {
      switch (this.state) {
      case BottomSheetState.EXPANDED:
        this.state = BottomSheetState.HALF
        break
      case BottomSheetState.HALF:
        this.state = BottomSheetState.COLLAPSED
        break
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_variables.scss";

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
