<!-- This is a wrapper for the apex charts, to be able to force update

The VueApexCharts aren't able to update the timeline dynamically, when locale changes.
At the moment (02.06.2025) we don't know why. To mitigate that we forcefully update by
adding a componentKey and increase it.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VueApexCharts from 'vue3-apexcharts'
import { ApexOptions } from 'apexcharts'
import useDefaultChartsOptions from 'src/components/reportCharts/apexCharts'
import { merge } from 'lodash-es'
interface Props {
  options: ApexOptions
}
const props = defineProps<Props>()

const { locale } = useI18n()
const { getDefaultChartOptions } = useDefaultChartsOptions()

const componentKey = ref(0)

const chartOptions = computed(() => {
  const defaultOptions = getDefaultChartOptions()
  const merged = merge({}, defaultOptions, props.options)
  return merged
})

const forceRerender = () => {
  // The VueApexChart is not updating the timeline dynamicly by itself, when chartOptions are changing
  // due to this we added key that will increase, to force the rerendering of the component.
  componentKey.value += 1
}

watch(locale, () => {
  forceRerender()
})
</script>
<template>
  <VueApexCharts :key="componentKey" :options="chartOptions" v-bind="$attrs" />
</template>
