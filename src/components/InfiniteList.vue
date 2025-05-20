<script setup lang="ts">
import { QInfiniteScroll, QList, QSpinnerDots } from 'quasar'

interface Props {
  items?: any[]
  disable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  disable: false
})

interface Emits {
  (e: 'load', index: number, done: (stop?: boolean) => void): void
}
const emit = defineEmits<Emits>()
</script>

<template>
  <QInfiniteScroll
    v-if="props.items.length > 0"
    @load="(index, done) => emit('load', index, done)"
    :disable="props.disable"
  >
    <QList>
      <slot
        name="item"
        :item="item"
        v-for="(item, index) in props.items"
        :key="index"
      >
        {{ item }}
      </slot>
    </QList>
    <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <QSpinnerDots color="primary" size="40px" />
      </div>
    </template>
  </QInfiniteScroll>
  <div v-else class="empty-list-placeholder">
    <slot name="emptyList">{{ $t('infiniteList.emptyList') }}</slot>
  </div>
</template>

<style lang="scss" scoped>
.empty-list-placeholder {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}
</style>
