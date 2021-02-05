import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Events from '@/views/Events.vue'
import EditEvent from '@/views/EditEvent.vue'
import Campaigns from '@/views/Campaigns.vue'
import EditCampaign from '@/views/EditCampaign.vue'
import EventDetail from '@/views/EventDetail.vue'
import EventLive from '@/views/EventLive.vue'
import Locate from '@/views/Locate.vue'
import RouteEditor from '@/views/RouteEditor.vue'
import CreateLead from '@/views/CreateLead.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Password from '@/views/Password.vue'
import EditEventDetails from '@/views/edit-event/EditEventDetails.vue'
import EditEventSummary from '@/views/edit-event/EditEventSummary.vue'
import EditEventMapRoutes from '@/views/edit-event/map/EditEventMapRoutes.vue'
import EditEventMap from '@/views/edit-event/EditEventMap.vue'
import EditEventMapLocation from '@/views/edit-event/map/EditEventMapLocation.vue'

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
      component: Events
    },
    {
      path: '/events/:id',
      component: EventDetail,
      props: true
    },
    {
      path: '/events/:id/live',
      name: 'live-event',
      component: EventLive,
      props: true
    },
    {
      path: '/events/edit',
      component: EditEvent,
      redirect: {name: 'edit-event-details'},
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
              name: 'edit-event-location'
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
      props: true
    },
    {
      path: '/campaigns/new',
      component: EditCampaign
    },
    {
      path: '/login',
      component: Login
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

export default router

