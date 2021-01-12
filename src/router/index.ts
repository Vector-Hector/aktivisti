import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import NewEvent from '../views/NewEvent.vue'
import EditEvent from '../views/EditEvent.vue'
import Campaigns from '../views/Campaigns.vue'
import EditCampaign from '../views/EditCampaign.vue'
import NewCampaign from '../views/NewCampaign.vue'
import EventDetail from '@/views/EventDetail.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
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
        path: '/events/:id/edit',
        component: EditEvent
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
        component: NewCampaign
      },
    ]
  })

export default router

