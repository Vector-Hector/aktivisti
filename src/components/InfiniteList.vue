<template>
  <QScrollArea>
    <QInfiniteScroll
      v-if="items.length > 0"
      @load="(index, done)=>$emit('load', index, done)"
      :disable="disable"
    >
      <QList>
        <slot name="item" :item="item" v-for="(item, index) in items" :key="index">
          {{ item }}
        </slot>
      </QList>
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <QSpinnerDots color="primary" size="40px" />
        </div>
      </template>
    </QInfiniteScroll>
    <div
      v-else
      class="empty-list-placeholder"
    >
      <slot name="emptyList">
        Keine Einträge gefunden
      </slot>
    </div>
  </QScrollArea>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QInfiniteScroll, QList, QScrollArea, QSpinnerDots } from 'quasar'

export default defineComponent({
  name: 'InfiniteList',
  components: {
    QInfiniteScroll,
    QList,
    QScrollArea,
    QSpinnerDots
  },
  props: {
    items: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    disable: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['load']
})
</script>
<style lang="scss" scoped>
.empty-list-placeholder {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}
</style>
