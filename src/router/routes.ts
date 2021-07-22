import EditEvent from 'src/pages/EditEvent.vue'
import Login from 'src/pages/Login.vue'
import Register from 'src/pages/Register.vue'
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
import EditEventGeometry from 'pages/edit-event/geometry/EditEventGeometry.vue'
import EditEventGeometryMap from 'pages/edit-event/geometry/EditEventGeometryMap.vue'
import EditEventDetails from 'pages/edit-event/details/EditEventDetails.vue'
import CreateEvent from 'pages/CreateEvent.vue'
import PrintEvent from 'pages/PrintEvent.vue'
import App from 'src/App.vue'
import Print from 'src/Print.vue'
import EditEventDetailsMap from 'pages/edit-event/details/EditEventDetailsMap.vue'
import EditEventSinglePoster from 'pages/edit-event/posters/edit-single/EditEventSinglePoster.vue'
import EditEventPostersList from 'pages/edit-event/posters/edit-list/EditEventPostersList.vue'
import EditEventPosters from 'pages/edit-event/posters/EditEventPosters.vue'
import EditEventPostersMap from 'pages/edit-event/posters/EditEventPostersMap.vue'
import EditEventSinglePosterMap from 'pages/edit-event/posters/edit-single/EditEventSinglePosterMap.vue'
import EditEventPostersListMap from 'pages/edit-event/posters/edit-list/EditEventPostersListMap.vue'
import EventDetailPosters from 'pages/event-map/detail/area/posters/EventDetailPosters.vue'
import EventDetailPostersMap from 'pages/event-map/detail/area/posters/EventDetailPostersMap.vue'
import EventDetailPosterDetail from 'pages/event-map/detail/area/posters/detail/EventDetailPosterDetail.vue'
import EventDetailPosterDetailMap from 'pages/event-map/detail/area/posters/detail/EventDetailPosterDetailMap.vue'
import EventDetailPosterList from 'pages/event-map/detail/area/posters/list/EventDetailPosterList.vue'
import EventDetailPosterListMap from 'pages/event-map/detail/area/posters/list/EventDetailPosterListMap.vue'


const routes = [
  {
    path: '',
    component: App,
    name: 'app',
    redirect: {name: 'splash'},
    children: [
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
          requiresAuth: true,
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
            path: ':eventId',
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
                      title: () => uiStore.getState().activeTitleElements.houseNumber,
                      subtitle: () => 'Ergebnisse aufnehmen',
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
                  },
                  {
                    path: 'posters',
                    name: 'event-detail-poster',
                    redirect: {name: 'event-detail-poster-list'},
                    props: true,
                    components: {
                      default: EventDetailPosters,
                      map: EventDetailPostersMap
                    },
                    children: [
                      {
                        path: '',
                        name: 'event-detail-poster-list',
                        components: {
                          default: EventDetailPosterList,
                          map: EventDetailPosterListMap
                        }
                      },
                      {
                        path: ':posterId',
                        name: 'event-detail-poster-detail',
                        components: {
                          default: EventDetailPosterDetail,
                          map: EventDetailPosterDetailMap
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: '/events/create',
        component: CreateEvent,
        name: 'create-event',
        meta: {
          title: () => 'Aktion erstellen',
          requiresAuth: true

        }
      },
      {
        path: '/events/edit/:eventId',
        component: EditEvent,
        name: 'edit-event',
        redirect: {name: 'edit-event-details'},
        meta: {
          subtitle: () => uiStore.getState().activeTitleElements.event,
          title: () => 'Aktion bearbeiten',
          requiresAuth: true
        },
        children: [
          {
            path: 'details',
            components: {
              default: EditEventDetails,
              map: EditEventDetailsMap
            },
            name: 'edit-event-details'
          },
          {
            path: 'geometry',
            components: {
              default: EditEventGeometry,
              map: EditEventGeometryMap
            },
            name: 'edit-event-geometry'
          },
          {
            name: 'edit-event-posters',
            path: 'posters',
            redirect: {name: 'edit-event-posters-list'},
            components: {
              default: EditEventPosters,
              map: EditEventPostersMap
            },
            meta: {
              title: () => 'Poster bearbeiten'
            },
            children: [
              {
                name: 'edit-event-posters-list',
                path: '',
                components: {
                  default: EditEventPostersList,
                  map: EditEventPostersListMap
                }
              },
              {
                name: 'edit-event-single-poster-edit',
                path: ':posterId',
                props: true,
                components: {
                  default: EditEventSinglePoster,
                  map: EditEventSinglePosterMap
                }
              }, {
                name: 'edit-event-single-poster-new',
                path: 'new',
                components: {
                  default: EditEventSinglePoster,
                  map: EditEventSinglePosterMap
                }
              }]
          }
        ]
      },
      {
        path: '/login',
        component: Login,
        name: 'login',
        props: (route: any) => ({
          next: route.query.next
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
  },
  {
    path: '/print',
    component: Print,
    children: [{

      path: 'event/:eventId',
      component: PrintEvent,
      name: 'print-event'
    }]
  }
]


export default routes
