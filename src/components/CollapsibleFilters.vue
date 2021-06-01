<template>
  <div
    class="collapsible-filters"
  >
    <div
      class="headline"
      @click="toggle"
    >
      <QIcon
        :name="ionFunnel"
        class="filter-icon"
      />
      <div
        class="headline-caption"
      >
        <h4
          class="filter-title"
        >
          Filter
        </h4>
        <QBadge
          v-if="activatedFilterCount > 0"
        >
          {{ activatedFilterCount }} gesetzt
        </QBadge>
      </div>
      <span
        class="chevron-icon"
        :class="{ rotated: !collapsed }"
      >
        <QIcon
          :name="ionChevronDown"
        />
      </span>
    </div>
    <div
      ref="content"
      class="content"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ionChevronDown, ionFunnel } from '@quasar/extras/ionicons-v5'
import { QBadge, QIcon } from 'quasar'


export default defineComponent({
  name: 'CollapsibleFilters',
  components: {
    QIcon,
    QBadge
  },
  props: {
    activatedFilterCount: {
      type: Number as PropType<number>,
      default: 0
    }
  },
  emits: ['update:collapsed'],
  data() {
    return {
      collapsed: true,
      ionFunnel,
      ionChevronDown,
    }
  },
  computed: {
    contentStyle(): { [key: string]: string } {
      if (this.collapsed || !this.$refs.content) {
        return {
          height: '0px'
        }
      } else {
        return {
          height: `${(this.$refs.content as HTMLElement)!.scrollHeight}px`
        }
      }
    }
  },
  methods: {
    toggle() {
      this.collapsed = !this.collapsed
      this.$forceUpdate()
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_variables.scss";

.collapsible-filters {
  background: $gray-100;
}

.headline {
  display: flex;
  align-items: center;

  .headline-caption {
    h3 {
      display: inline-block;
      margin: 0 1rem 0 0;
    }
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .filter-icon, .chevron-icon, .headline-caption {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
    color: $gray-700;
  }

  .filter-icon, .chevron-icon {
    font-size: 1.4rem;
    padding: 0.8rem 1rem .9rem 1rem;
  }

  .filter-title {
    margin: 0 1rem 0 0;
    font-size: 1.5rem;
  }

  .chevron-icon {
    transition: all 250ms ease-out;
    display: flex;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.content {
  transition: height 250ms ease-out;
  height: 0;
  overflow: hidden;
}

</style>
