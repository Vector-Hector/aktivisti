import { defineBoot } from '#q-app/wrappers'
import VueApexCharts from 'vue3-apexcharts'
import de from 'apexcharts/dist/locales/de.json'
import { ApexOptions } from 'apexcharts'

// Change tooltip of default download tooltip
de.options.toolbar.menu = 'Download'

// define the default chart options
// see https://apexcharts.com/docs/options/annotations/
//
export const defaultApexChartOptions: ApexOptions = {
  chart: {
    stacked: true,
    locales: [de],
    defaultLocale: 'de',
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
      formatter: function (val) {
        return val.toFixed(0).toString()
      }
    }
  }
}

export default defineBoot(({ app }) => {
  // @ts-ignore
  app.use(VueApexCharts)
  //@ts-ignore
  Apex = defaultApexChartOptions
})
