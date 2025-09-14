import { useI18n } from 'vue-i18n'
const useDefaultChartsOptions = () => {
  const { t, locale } = useI18n()
  const getDefaultChartOptions = () => ({
    chart: {
      stacked: true,
      locales: [
        // The structure of the locales must be aligned to
        // https://github.com/apexcharts/apexcharts.js/tree/main/dist/locales
        {
          name: locale.value,
          options: {
            months: [
              t('apex.chart.locales.options.month.january'),
              t('apex.chart.locales.options.month.february'),
              t('apex.chart.locales.options.month.march'),
              t('apex.chart.locales.options.month.april'),
              t('apex.chart.locales.options.month.may'),
              t('apex.chart.locales.options.month.june'),
              t('apex.chart.locales.options.month.july'),
              t('apex.chart.locales.options.month.august'),
              t('apex.chart.locales.options.month.september'),
              t('apex.chart.locales.options.month.october'),
              t('apex.chart.locales.options.month.november'),
              t('apex.chart.locales.options.month.december')
            ],
            shortMonths: [
              t('apex.chart.locales.options.shortMonths.january'),
              t('apex.chart.locales.options.shortMonths.february'),
              t('apex.chart.locales.options.shortMonths.march'),
              t('apex.chart.locales.options.shortMonths.april'),
              t('apex.chart.locales.options.shortMonths.may'),
              t('apex.chart.locales.options.shortMonths.june'),
              t('apex.chart.locales.options.shortMonths.july'),
              t('apex.chart.locales.options.shortMonths.august'),
              t('apex.chart.locales.options.shortMonths.september'),
              t('apex.chart.locales.options.shortMonths.october'),
              t('apex.chart.locales.options.shortMonths.november'),
              t('apex.chart.locales.options.shortMonths.december')
            ],
            days: [
              t('apex.chart.locales.options.days.sunday'),
              t('apex.chart.locales.options.days.monday'),
              t('apex.chart.locales.options.days.tuesday'),
              t('apex.chart.locales.options.days.wednesday'),
              t('apex.chart.locales.options.days.thursday'),
              t('apex.chart.locales.options.days.friday'),
              t('apex.chart.locales.options.days.saturday')
            ],
            shortDays: [
              t('apex.chart.locales.options.shortDays.sunday'),
              t('apex.chart.locales.options.shortDays.monday'),
              t('apex.chart.locales.options.shortDays.tuesday'),
              t('apex.chart.locales.options.shortDays.wednesday'),
              t('apex.chart.locales.options.shortDays.thursday'),
              t('apex.chart.locales.options.shortDays.friday'),
              t('apex.chart.locales.options.shortDays.saturday')
            ],
            toolbar: {
              exportToSVG: t('apex.chart.locales.options.toolbar.exportToSVG'),
              exportToPNG: t('apex.chart.locales.options.toolbar.exportToPNG'),
              exportToCSV: t('apex.chart.locales.options.toolbar.exportToCSV'),
              menu: t('apex.chart.locales.options.toolbar.menu'),
              selection: t('apex.chart.locales.options.toolbar.selection'),
              selectionZoom: t(
                'apex.chart.locales.options.toolbar.selectionZoom'
              ),
              zoomIn: t('apex.chart.locales.options.toolbar.zoomIn'),
              zoomOut: t('apex.chart.locales.options.toolbar.zoomOut'),
              pan: t('apex.chart.locales.options.toolbar.pan'),
              reset: t('apex.chart.locales.options.toolbar.reset')
            }
          }
        }
      ],
      defaultLocale: locale.value,
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
  return { getDefaultChartOptions }
}
export default useDefaultChartsOptions
