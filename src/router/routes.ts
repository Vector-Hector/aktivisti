import EditEvent from 'src/pages/EditEvent.vue'
import Login from 'src/pages/Login.vue'
import Register from 'src/pages/Register.vue'
import EditEventDetails from 'src/pages/edit-event/EditEventDetails.vue'
import EditEventMapRoutes from 'src/pages/edit-event/map/EditEventMapRoutes.vue'
import EditEventMap from 'src/pages/edit-event/EditEventMap.vue'
import EditEventMapLocation from 'src/pages/edit-event/map/EditEventMapLocation.vue'
import { uiStore } from 'src/store/UiStore'
import RegistrationSucess from 'src/pages/RegistrationSucess.vue'
import EventMap from 'src/pages/EventMap.vue'
import Imprint from 'src/pages/Imprint.vue'
import Splash from 'src/pages/Splash.vue'
import EventOverview from 'pages/event-map/overview/EventOverview.vue'
import EventOverviewMap from 'pages/event-map/overview/EventOverviewMap.vue'
import EventDetailOverview from 'pages/event-map/detail/overview/EventDetailOverview.vue'
import EventDetailOverviewMap from 'pages/event-map/detail/overview/EventDetailOverviewMap.vue'
import EventDetail from 'pages/event-map/detail/EventDetail.vue'
import EventDetailMap from 'pages/event-map/detail/EventDetailMap.vue'
import MyEvents from 'pages/MyEvents.vue'
import EventDetailReport from 'pages/event-map/detail/report/EventDetailReport.vue'
import EventDetailArea from 'pages/event-map/detail/area/EventDetailArea.vue'
import EventDetailAreaMap from 'pages/event-map/detail/area/EventDetailAreaMap.vue'
import EventAreaOverview from 'pages/event-map/detail/area/overview/EventAreaOverview.vue'
import EventAreaOverviewMap from 'pages/event-map/detail/area/overview/EventAreaOverviewMap.vue'
import EventAreaStreet from 'pages/event-map/detail/area/street/EventAreaStreet.vue'
import EventAreaStreetMap from 'pages/event-map/detail/area/street/EventAreaStreetMap.vue'
import EventAreaMetrics from 'pages/event-map/detail/area/metrics/EventAreaMetrics.vue'
import EventAreaMetricsMap from 'pages/event-map/detail/area/metrics/EventAreaMetricsMap'
import CreateLead from 'pages/event-map/detail/area/lead/CreateLead.vue'
import Profile from 'pages/Profile.vue'


const routes = [
  {
    path: '/',
    component: Splash,
    name: 'splash'
  },
  {
    path: '/profile',
    component: Profile,
    name: 'profile',
    meta: {
      title: () => 'Mein Profil'
    }
  },
  {
    path: '/my-events',
    component: MyEvents,
    name: 'my-events',
    meta: {
      title: () => 'Meine Aktionen'
    }
  },
  {
    path: '/events',
    redirect: {name: 'map-events-overview'},
    component: EventMap,
    name: 'events',
    meta: {
      title: () => 'Alle Aktionen'
    },
    children: [
      {
        path: '',
        name: 'map-events-overview',
        components: {
          default: EventOverview,
          map: EventOverviewMap
        }
      },
      {
        path: ':id',
        name: 'event-detail',
        props: true,
        components: {
          default: EventDetail,
          map: EventDetailMap
        },
        redirect: {name: 'event-detail-overview'},
        meta: {
          title: () => uiStore.getState().activeTitleElements.event,
          subtitle: () => uiStore.getState().activeTitleElements.campaigns
        },
        children: [
          {
            path: 'overview',
            props: true,
            components: {
              default: EventDetailOverview,
              map: EventDetailOverviewMap
            },
            name: 'event-detail-overview'
          },
          {
            path: 'report',
            props: true,
            components: {
              default: EventDetailReport,
              map: EventDetailMap
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
