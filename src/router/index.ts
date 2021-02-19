import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import NewEvent from '../views/NewEvent.vue'
import Campaigns from '../views/Campaigns.vue'
import EditCampaign from '../views/EditCampaign.vue'
import EventDetail from '@/views/EventDetail.vue'
import EventLive from '@/views/EventLive.vue'
import Locate from '@/views/Locate.vue'
import CreateLead from '@/views/CreateLead.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Password from '@/views/Password.vue'
import { tokenService } from '@/store/TokenService'

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
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/events/:id/live',
      name: 'live-event',
      component: EventLive,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/events/new',
      component: NewEvent,
      meta: {
        requiresAuth: true
      }
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
  const loggedIn = !!tokenService.getToken('access_token')

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!loggedIn) {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    } else {
      next()
    } 
  } else {
    next()
  }
})


export default router