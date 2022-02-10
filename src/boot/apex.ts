import { boot } from 'quasar/wrappers'
import VueApexCharts from 'vue3-apexcharts'
import de from 'apexcharts/dist/locales/de.json'
import { ApexOptions } from 'apexcharts'

// define the default chart options
// see https://apexcharts.com/docs/options/annotations/
//
export const defaultApexChartOptions: ApexOptions = {
  chart: {
    stacked: true,
    locales: [de],
    defaultLocale: 'de'
  },
  noData: {
    text: 'Bisher liegen keine Daten vor',
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
    text: 'Statistik'
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  xaxis: {
    type: 'datetime',
    title: {
      text: 'Datum'
    }
  },
  yaxis: {
    opposite: false,
    title: {
      text: 'Anzahl'
    },
    labels: {
      // Don't show decimal points
      formatter: function(val) {
        return val.toFixed(0).toString()
      }
    }
  }
}

export default boot(({app}) => {
  // @ts-ignore
  app.use(VueApexCharts)
  //@ts-ignore
  Apex = defaultApexChartOptions
})
