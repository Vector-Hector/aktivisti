<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

export interface Step {
  label: string
  routeName: string
}

interface Props {
  steps?: Step[]
  modelValue: number
}
const props = withDefaults(defineProps<Props>(), {
  steps: () => []
})

interface Emits {
  (e: 'update:modelValue', index: number | undefined): void
}
const emit = defineEmits<Emits>()

const $route = useRoute()

const activeIndex = computed(() => {
  return props.steps.findIndex(({ routeName }) => isActiveRoute(routeName))
})

watch(
  activeIndex,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      emit('update:modelValue', newValue)
    }
  },
  { immediate: true }
)

function isActiveRoute(routeName: string): boolean {
  return $route.matched.some(({ name }) => name === routeName)
}
</script>
<template>
  <div class="stepper-shadow-box">
    <div class="stepper">
      <div
        :class="{
          step: true,
          active: isActiveRoute(step.routeName),
          done: activeIndex > index
        }"
        v-for="(step, index) in steps"
        :key="index"
        :style="{
          'z-index': steps.length - index
        }"
        @click="$router.push({ name: step.routeName })"
      >
        <div class="step-inner">
          <div class="step-number">{{ index + 1 }}</div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import 'src/css/variables';

$doneBackground: $grey-5;
$doneText: $grey-6;

$activeBackground: $grey-3;
$activeText: $black;

$inactiveBackground: $white;
$inactiveText: $grey-6;

$chevronSize: 18px;
$stepPadding: 5px;

.stepper-shadow-box {
  box-shadow: $map-overlay-shadow;
  z-index: 1;
}

.stepper {
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.step {
  overflow: hidden;
  cursor: pointer;
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: $inactiveText;
  filter: drop-shadow(0 2px 3px $inactiveText);

  &:not(:first-of-type) {
    margin-left: -$chevronSize;

    .step-inner {
      padding: $stepPadding (6px + $chevronSize);
    }
  }

  .step-inner {
    display: flex;
    flex: 1;
    flex-direction: row;
    padding: $stepPadding 12px;
    background: $inactiveBackground;

    .step-number {
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid $inactiveText;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
    }

    .step-label {
      display: flex;
      align-items: center;
      margin-left: 6px;
      font-size: 1rem;
      flex: 1;
    }
  }

  &:not(:last-of-type) {
    &:after {
      content: '';
      border-top: $chevronSize solid transparent;
      border-left: $chevronSize solid $inactiveBackground;
      border-bottom: $chevronSize solid transparent;
    }
  }

  &.active {
    color: $activeText;

    .step-inner {
      background: $activeBackground;
    }

    &:not(:last-of-type) {
      &:after {
        content: '';
        border-top: $chevronSize solid transparent;
        border-left: $chevronSize solid $activeBackground;
        border-bottom: $chevronSize solid transparent;
      }
    }

    .step-number {
      border: 1px solid $activeText;
    }
  }

  &.done {
    color: $doneText;

    .step-inner {
      background: $doneBackground;
    }

    &:not(:last-of-type) {
      &:after {
        content: '';
        border-top: $chevronSize solid transparent;
        border-left: $chevronSize solid $doneBackground;
        border-bottom: $chevronSize solid transparent;
      }
    }

    .step-number {
      border: 1px solid $doneText;
    }
  }
}
</style>
