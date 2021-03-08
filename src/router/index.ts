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
import EditEventSummary from '@/views/edit-event/EditEventSummary.vue'
import EditEventMapRoutes from '@/views/edit-event/map/EditEventMapRoutes.vue'
import EditEventMap from '@/views/edit-event/EditEventMap.vue'
import EditEventMapLocation from '@/views/edit-event/map/EditEventMapLocation.vue'
import EventAreaLive from '@/views/EventAreaLive.vue'
import { authService } from '@/api/authService'
import EventAreaLiveOverview from '@/views/event-area-live/EventAreaLiveOverview.vue'
import EventAreaLiveStreet from '@/views/event-area-live/EventAreaLiveStreet.vue'
import EventAreaLiveMetrics from '@/views/event-area-live/EventAreaLiveMetrics.vue'


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
      props: (route) => ({
        eventId: parseInt(route.query.event as string)
      })
    },
    {
      path: '/map',
      component: Home
    },
    {
      path: '/events',
      component: Events,
      name: 'events'
    },
    {
      path: '/events/:id',
      component: EventDetail,
      name: 'event-details',
      props: true
    },
    {
      path: '/events-area/:id/live',
      name: 'event-area-live',
      redirect: {name: 'event-area-live-overview'},
      component: EventAreaLive,
      props: true,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'overview',
          component: EventAreaLiveOverview,
          props: true,
          name: 'event-area-live-overview',
        },
        {
          path: 'street/:street',
          component: EventAreaLiveStreet,
          props: true,
          name: 'event-area-live-street',
        },
        {
          path: 'metrics/:street/:houseNumber',
          component: EventAreaLiveMetrics,
          props: true,
          name: 'event-area-live-metrics',
        }
      ]
    },
    {
      path: '/events/edit',
      component: Events,
      redirect: {name: 'edit-event-list'},
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
        },
        {
          path: 'summary',
          component: EditEventSummary,
          name: 'edit-event-summary'
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
      name: 'login'
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
