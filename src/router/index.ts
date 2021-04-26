import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Events from '@/views/Events.vue'
import EditEvent from '@/views/EditEvent.vue'
import Campaigns from '@/views/Campaigns.vue'
import EditCampaign from '@/views/EditCampaign.vue'
import EventDetail from '@/views/EventDetail.vue'
import Locate from '@/views/Locate.vue'
import CreateLead from '@/views/CreateLead.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Password from '@/views/Password.vue'
import EditEventDetails from '@/views/edit-event/EditEventDetails.vue'
import EditEventMapRoutes from '@/views/edit-event/map/EditEventMapRoutes.vue'
import EditEventMap from '@/views/edit-event/EditEventMap.vue'
import EditEventMapLocation from '@/views/edit-event/map/EditEventMapLocation.vue'
import { authService } from '@/api/authService'
import EventAreaOverview from '@/views/event-detail/event-area/EventAreaOverview.vue'
import EventAreaStreet from '@/views/event-detail/event-area/EventAreaStreet.vue'
import EventAreaMetrics from '@/views/event-detail/event-area/EventAreaMetrics.vue'
import EventAreaMetricsMap from '@/views/event-detail/event-area/EventAreaMetricsMap'
import EventDetailOverview from '@/views/event-detail/EventDetailOverview.vue'
import EventDetailOverviewMap from '@/views/event-detail/EventDetailOverviewMap.vue'
import EventDetailAreaMap from '@/views/event-detail/EventDetailAreaMap.vue'
import EventDetailArea from '@/views/event-detail/EventDetailArea.vue'
import EventAreaOverviewMap from '@/views/event-detail/event-area/EventAreaOverviewMap.vue'
import EventAreaStreetMap from '@/views/event-detail/event-area/EventAreaStreetMap.vue'
import MyEvents from '@/views/MyEvents.vue'
import EventDetailReport from "@/views/event-detail/EventDetailReport.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Locate,
      name: 'splash'
    },
    {
      path: '/create-lead',
      name: 'create-lead',
      component: CreateLead,
      props: route => ({ eventAreaId: route.query.eventArea ? parseInt(route.query.eventArea as string) : undefined })
    },
    {
      path: '/map',
      component: Home,
      name: 'events-map',
    },
    {
      path: '/events',
      component: Events,
      name: 'events'
    },
    {
      path: '/my-events',
      component: MyEvents,
      name: 'my-events'
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: EventDetail,
      redirect: { name: 'event-detail-overview' },
      props: true,
      children: [
        {
          path: 'overview',
          name: 'event-detail-overview',
          components: {
            default: EventDetailOverview,
            map: EventDetailOverviewMap
          },
          props: true,
        },
        {
          path: 'report',
          components: {
            default: EventDetailReport,
            map: EventDetailOverviewMap
          },
          name: 'event-detail-report'
        },
        {
          path: 'area/:areaId',
          name: 'event-detail-area',
          redirect: { name: 'event-detail-area-overview' },
          components: {
            default: EventDetailArea,
            map: EventDetailAreaMap
          },
          props: true,
          children: [
            {
              path: '',
              name: 'event-detail-area-overview',
              components: {
                default: EventAreaOverview,
                map: EventAreaOverviewMap
              },
              props: true
            },
            {
              path: 'street/:street',
              components: {
                default: EventAreaStreet,
                map: EventAreaStreetMap
              },
              props: true,
              name: 'event-detail-area-street'
            },
            {
              path: 'metrics/:street/:houseNumber',
              components: {
                default: EventAreaMetrics,
                map: EventAreaMetricsMap
              },
              props: true,
              name: 'event-detail-area-metrics'
            }
          ]
        }
      ]
    },
    {
      path: '/events/edit',
      component: Events,
      redirect: {name: 'edit-event-list'}
    },
    {
      path: '/events/edit/new',
      component: EditEvent,
      redirect: {name: 'edit-event-details-new'},
      children: [
        {
          path: 'details',
          component: EditEventDetails,
          name: 'edit-event-details-new'
        }
      ]
    },
    {
      path: '/events/edit/:id',
      component: EditEvent,
      redirect: {name: 'edit-event-details'},
      props: true,
      children: [
        {
          path: 'details',
          component: EditEventDetails,
          name: 'edit-event-details'
        },
        {
          path: 'map',
          component: EditEventMap,
          children: [
            {
              path: 'location',
              component: EditEventMapLocation,
              name: 'edit-event-location',
              props: true
            },
            {
              path: 'route-planner',
              component: EditEventMapRoutes,
              name: 'edit-event-routes'
            }
          ]
        }
      ]
    },
    {
      path: '/campaigns',
      component: Campaigns
    },
    {
      path: '/campaigns/:id',
      component: EditCampaign,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/campaigns/new',
      component: EditCampaign,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      component: Login,
      name: 'login',
      props: (route) => ({
        next: route.query.next
      })
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/password',
      component: Password
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (!authService.isLoggedIn() && to.matched.some(record => record.meta.requiresAuth)) {
    next({
      path: '/login',
      params: {nextUrl: to.fullPath}
    })
  } else {
    next()
  }
})


export default router
