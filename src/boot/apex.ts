import { defineBoot } from '#q-app/wrappers'
import VueApexCharts from 'vue3-apexcharts'
import de from 'apexcharts/dist/locales/de.json'
import { ApexOptions } from 'apexcharts'
const langList = import.meta.glob(
  '../../node_modules/apexcharts/dist/locales/*.json'
)

// Change tooltip of default download tooltip
de.options.toolbar.menu = 'Download'

// define the default chart options
// see https://apexcharts.com/docs/options/annotations/
//

export default defineBoot(async ({ app }) => {
  const t = (key: string) => app.config.globalProperties.$t(key)
  const getLocale = async (locale): Promise<ApexLocale> => {
    const lang =
      await langList[
        `../../node_modules/apexcharts/dist/locales/${locale}.json`
      ]()
    lang.default.options.toolbar.menu = t('apex.download')
    return lang.default
  }
  const getDefaultApexChartOptions = (
    locale: ApexLocale,
    defaultLocale: string
  ): ApexOptions => ({
    chart: {
      stacked: true,
      locales: [locale],
      defaultLocale: defaultLocale,
      toolbar: {
        show: true,
        tools: {
          download:
            '<img src="static/ionicons/download-outline.svg" width="25px">',
          zoom: '<img src="static/ionicons/crop-outline.svg" width="25px">',
          zoomin:
            '<img src="static/ionicons/add-circle-outline.svg" width="25px">',
          zoomout:
            '<img src="static/ionicons/remove-circle-outline.svg" width="25px">',
          pan: '<img src="static/ionicons/move-outline.svg" width="25px">',
          reset:
            '<img src="static/ionicons/arrow-undo-outline.svg"  width="25px">'
        }
      }
    },
    noData: {
      text: t('apex.noData'),
      style: {
        color: '#93959d',
        fontSize: '18px'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    markers: {
      size: 1
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 1,
        opacityTo: 1
      }
    },
    title: {
      text: t('apex.title')
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    },
    xaxis: {
      type: 'datetime',
      title: {
        text: t('apex.date')
      }
    },
    yaxis: {
      opposite: false,
      title: {
        text: t('apex.count')
      },
      labels: {
        // Don't show decimal points
        formatter: function (val) {
          return val.toFixed(0).toString()
        }
      }
    }
  })

  // @ts-ignore
  app.use(VueApexCharts)
  // Please see ../../node_modules/apexcharts/dist/locales for supported languages or
  // https://github.com/apexcharts/apexcharts.js/tree/main/dist/locales
  const locale = await getLocale(t('config.apexLangIso'))
  Apex = getDefaultApexChartOptions(locale, t('config.apexLangIso'))
})
