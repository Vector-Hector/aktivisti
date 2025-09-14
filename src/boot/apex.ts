import { defineBoot } from '#q-app/wrappers'
import VueApexCharts from 'vue3-apexcharts'
import de from 'apexcharts/dist/locales/de.json'

// Change tooltip of default download tooltip
de.options.toolbar.menu = 'Download'

// define the default chart options
// see https://apexcharts.com/docs/options/annotations/
//

export default defineBoot(({ app }) => {
  // @ts-ignore
  app.use(VueApexCharts)
  // Please see ../../node_modules/apexcharts/dist/locales for supported languages or
  // https://github.com/apexcharts/apexcharts.js/tree/main/dist/locales
})
