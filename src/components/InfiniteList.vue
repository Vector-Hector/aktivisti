<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QInfiniteScroll, QList, QSpinnerDots } from 'quasar'

export default defineComponent({
  name: 'InfiniteList',
  components: {
    QInfiniteScroll,
    QList,
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
  emits: ['load'],
  methods: {
    resetScrollPosition() {
      // FIXIME(peter@ctrl.alt.coop) Since qScrollArea doesn't exist anymore this isn't
      //  working correctly.
      // @ts-ignore
      this.$refs.qScrollArea.setScrollPosition('vertical', 0)
    }
  }
})
</script>

<template>
  <QInfiniteScroll
    v-if="items.length > 0"
    @load="(index, done) => $emit('load', index, done)"
    :disable="disable"
  >
    <QList>
      <slot
        name="item"
        :item="item"
        v-for="(item, index) in items"
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
    <slot name="emptyList"> Keine Einträge gefunden</slot>
  </div>
</template>

<style lang="scss" scoped>
.empty-list-placeholder {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}
</style>
