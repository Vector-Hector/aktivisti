import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import NewEvent from '../views/NewEvent.vue'
import EditEvent from '../views/EditEvent.vue'
import Campaigns from '../views/Campaigns.vue'
import EditCampaign from '../views/EditCampaign.vue'
import NewCampaign from '../views/NewCampaign.vue'
import LocationPicker from '../views/LocationPicker.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: Home
      },
      {
        path: '/events',
        component: Events
      },
      {
        path: '/events/:id',
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

