<template>
  <div
    class="resizable-bottom-sheet"
    :class="state"
  >
    <h2
      v-if="title"
      class="title"
    >
      {{ title }}
    </h2>
    <div
      class="size-controls"
    >
      <button
        class="resize-button expand"
        @click="expand"
      >
        <IonIcon
          class="icon"
          name="chevron-up-outline"
        />
      </button>
      <button
        class="resize-button shrink"
        @click="shrink"
      >
        <IonIcon
          class="icon"
          name="chevron-down-outline"
        />
      </button>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { addIcons } from 'ionicons'
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons'
import { IonIcon } from '@ionic/vue'

addIcons({
  'chevron-down-outline': chevronDownOutline,
  'chevron-up-outline': chevronUpOutline
})

enum BottomSheetState {
  COLLAPSED = 'collapsed',
  HALF = 'half',
  EXPANDED = 'expanded'
}

export default defineComponent({
  name: 'ResizableBottomSheet',
  components: {
    IonIcon
  },
  props: {
    title: {
      type: String as PropType<string>,
      required: false,
      default: undefined
    }
  },
  data() {
    return {
      BottomSheetState,
      state: BottomSheetState.HALF as BottomSheetState
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
@import "~@/scss/_variables.scss";

.resizable-bottom-sheet {
  display: flex;
  flex-direction: column;
  background: white;
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 200ms ease-out;
  z-index: 200;

  .title {
    background: $gray-100;
    border-bottom: 1px solid $red;
    margin: 0;
    padding: 0.5rem 1rem;
  }

  &.collapsed {
    height: 5%;

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
    color: $gray-600;
  }

  &.expand {
    top: -36px;
  }

  &.shrink {
    top: 0;
  }
}


</style>
