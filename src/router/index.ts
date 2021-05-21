import { createRouter, createWebHistory } from '@ionic/vue-router'

import EditEvent from '@/views/EditEvent.vue'
import Campaigns from '@/views/Campaigns.vue'
import EditCampaign from '@/views/EditCampaign.vue'
import EventDetail from '@/views/EventDetail.vue'
import Locate from '@/views/Locate.vue'
import CreateLead from '@/views/event-detail/event-area/CreateLead.vue'
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
import EventDetailReport from '@/views/event-detail/EventDetailReport.vue'
import { uiStore } from '@/store/UiStore'
import RegistrationSucess from '@/views/RegistrationSucess.vue'
import EventMap from '@/views/EventMap.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Locate,
      name: 'splash'
    },
    {
      path: '/events',
      component: EventMap,
      name: 'events',
      meta: {
        title: () => 'Alle Aktionen'
      }
    },
    {
      path: '/my-events',
      component: MyEvents,
      name: 'my-events',
      meta: {
        title: () => 'Meine Aktionen',
        requiresAuth: true
      }
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: EventDetail,
      redirect: {name: 'event-detail-overview'},
      props: true,
      meta: {
        title: () => uiStore.getState().activeTitleElements.event,
        subtitle: () => uiStore.getState().activeTitleElements.campaigns
      },
      children: [
        {
          path: 'overview',
          name: 'event-detail-overview',
          props: true,
          components: {
            default: EventDetailOverview,
            map: EventDetailOverviewMap
          }
        },
        {
          path: 'report',
          components: {
            default: EventDetailReport,
            map: EventDetailOverviewMap
          },
          name: 'event-detail-report',
          meta: {
            title: () => 'Ergebnisse',
            subtitle: () => uiStore.getState().activeTitleElements.event,
            requiresAuth: true
          }
        },
        {
          path: 'area/:areaId',
          name: 'event-detail-area',
          redirect: {name: 'event-detail-area-overview'},
          components: {
            default: EventDetailArea,
            map: EventDetailAreaMap
          },
          props: true,
          meta: {
            title: () => 'Aktionsgebiete',
            subtitle: () => uiStore.getState().activeTitleElements.event
          },
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
              meta: {
                title: () => 'Adressen',
                subtitle: () => uiStore.getState().activeTitleElements.street
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
              meta: {
                title: () => 'Metriken aufnehmen',
                subtitle: () => uiStore.getState().activeTitleElements.houseNumber,
                requiresAuth: true
              },
              props: true,
              name: 'event-detail-area-metrics'
            },
            {
              path: 'create-lead',
              name: 'create-lead',
              component: CreateLead,
              props: true,
              meta: {
                title: () => 'Bei Linksaktiv anmelden',
                requiresAuth: true
              },
            },
          ]
        }
      ]
    },
    {
      path: '/events/edit/new',
      component: EditEvent,
      redirect: {name: 'edit-event-details-new'},
      props: true,
      meta: {
        title: () => 'Aktion erstellen',
        requiresAuth: true
      },
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
      meta: {
        subtitle: () => uiStore.getState().activeTitleElements.event,
        title: () => 'Aktion bearbeiten',
        requiresAuth: true
      },
      children: [
        {
          path: 'details',
          component: EditEventDetails,
          props: true,
          name: 'edit-event-details',
          meta: {
            backButtonRouter: '/events'
          }
        },
        {
          path: 'map',
          component: EditEventMap,
          children: [
            {
              path: 'location',
              component: EditEventMapLocation,
              name: 'edit-event-location',
              props: true,
              meta: {
                subtitle: () => uiStore.getState().activeTitleElements.event,
                title: () => 'Treffpunkt festlegen'
              }
            },
            {
              path: 'route-planner',
              component: EditEventMapRoutes,
              name: 'edit-event-routes',
              meta: {
                subtitle: () => uiStore.getState().activeTitleElements.event,
                title: () => 'Aktionsgebiete zeichnen'
              }
            }
          ]
        }
      ]
    },
    {
      path: '/login',
      component: Login,
      name: 'login',
      props: (route) => ({
        next: route.params.nextUrl
      }),
      meta: {
        title: () => 'Anmelden'
      }
    },
    {
      path: '/register',
      component: Register,
      meta: {
        title: () => 'Registrieren'
      }
    },
    {
      path: '/registration-success',
      component: RegistrationSucess,
      name: 'register-success',
      meta: {
        title: () => 'Registrierung erfolgreich'
      }
    },
    {
      path: '/password',
      component: Password,
      meta: {
        title: () => 'Passwort zurücksetzen'
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (!authService.isLoggedIn() && to.matched.some(record => record.meta.requiresAuth)) {
    next({
      name: 'login',
      params: {
        nextUrl: to.fullPath
      }
    })
  } else {
    next()
  }
})

export default router
