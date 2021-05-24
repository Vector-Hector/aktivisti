import EditEvent from 'src/pages/EditEvent.vue'
import EventDetail from 'src/pages/EventDetail.vue'
import CreateLead from 'src/pages/event-detail/event-area/CreateLead.vue'
import Login from 'src/pages/Login.vue'
import Register from 'src/pages/Register.vue'
import EditEventDetails from 'src/pages/edit-event/EditEventDetails.vue'
import EditEventMapRoutes from 'src/pages/edit-event/map/EditEventMapRoutes.vue'
import EditEventMap from 'src/pages/edit-event/EditEventMap.vue'
import EditEventMapLocation from 'src/pages/edit-event/map/EditEventMapLocation.vue'
import EventAreaOverview from 'src/pages/event-detail/event-area/EventAreaOverview.vue'
import EventAreaStreet from 'src/pages/event-detail/event-area/EventAreaStreet.vue'
import EventAreaMetrics from 'src/pages/event-detail/event-area/EventAreaMetrics.vue'
import EventAreaMetricsMap from 'src/pages/event-detail/event-area/EventAreaMetricsMap'
import EventDetailOverview from 'src/pages/event-detail/EventDetailOverview.vue'
import EventDetailOverviewMap from 'src/pages/event-detail/EventDetailOverviewMap.vue'
import EventDetailAreaMap from 'src/pages/event-detail/EventDetailAreaMap.vue'
import EventDetailArea from 'src/pages/event-detail/EventDetailArea.vue'
import EventAreaOverviewMap from 'src/pages/event-detail/event-area/EventAreaOverviewMap.vue'
import EventAreaStreetMap from 'src/pages/event-detail/event-area/EventAreaStreetMap.vue'
import MyEvents from 'src/pages/MyEvents.vue'
import EventDetailReport from 'src/pages/event-detail/EventDetailReport.vue'
import { uiStore } from 'src/store/UiStore'
import RegistrationSucess from 'src/pages/RegistrationSucess.vue'
import EventMap from 'src/pages/EventMap.vue'
import Imprint from 'src/pages/Imprint.vue'
import Splash from 'src/pages/Splash.vue'

const routes = [
  {
    path: '/',
    component: Splash,
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
            }
          }
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
    props: (route: any) => ({
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
    path: '/imprint',
    component: Imprint,
    meta: {
      title: () => 'Impressum'
    }
  }
]



export default routes
