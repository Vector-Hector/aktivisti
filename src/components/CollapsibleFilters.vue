<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import { ionChevronDown, ionFunnel } from '@quasar/extras/ionicons-v5'
import { QBadge, QIcon, QSlideTransition } from 'quasar'

interface Props {
  activatedFilterCount: number
}
const props = withDefaults(defineProps<Props>(), {
  activatedFilterCount: 0
})

const collapsed = ref(true)

function toggle() {
  collapsed.value = !collapsed.value
  const instance = getCurrentInstance()
  instance?.proxy?.$forceUpdate()
}
</script>

<template>
  <div class="collapsible-filters">
    <div class="headline" @click="toggle">
      <QIcon :name="ionFunnel" class="filter-icon" />
      <div class="headline-caption">
        <h4 class="filter-title">Filter</h4>
        <QBadge v-if="props.activatedFilterCount > 0">
          {{ props.activatedFilterCount }} gesetzt
        </QBadge>
      </div>
      <span class="chevron-icon" :class="{ rotated: !collapsed }">
        <QIcon :name="ionChevronDown" />
      </span>
    </div>
    <QSlideTransition>
      <div class="content" v-show="!collapsed">
        <slot />
      </div>
    </QSlideTransition>
  </div>
</template>

<style lang="scss" scoped>
@import 'src/css/_variables.scss';

.collapsible-filters {
  background: $grey-2;
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

  .filter-icon,
  .chevron-icon,
  .headline-caption {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
    color: $grey-8;
  }

  .filter-icon,
  .chevron-icon {
    font-size: 1.4rem;
    padding: 0.8rem 1rem 0.9rem 1rem;
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
</style>
