import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import NewEvent from '../views/NewEvent.vue'
import EditEvent from '../views/EditEvent.vue'

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
    ]
  })

export default router

