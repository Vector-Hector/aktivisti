import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router'

import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import NewEvent from '../views/NewEvent.vue'
import Campaigns from '../views/Campaigns.vue'
import EditCampaign from '../views/EditCampaign.vue'
import EventDetail from '@/views/EventDetail.vue'
import EventLive from '@/views/EventLive.vue'
import Locate from '@/views/Locate.vue'
import CreateLead from '@/views/CreateLead.vue'

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
      props: {
        eventId: (route: RouteLocationNormalized) => parseInt(route.query.event as string)
      }
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
      component: EventDetail
    },
    {
      path: '/events/:id/live',
      component: EventLive
    },
    {
      path: '/events/new',
      component: NewEvent
    },
    {
      path: '/campaigns',
      component: Campaigns
    },
    {
      path: '/campaigns/:id',
      component: EditCampaign
    },
    {
      path: '/campaigns/new',
      component: EditCampaign
    }
  ]
})

export default router

