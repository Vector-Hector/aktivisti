import EditEvent from 'src/pages/EditEvent.vue'
import Login from 'src/pages/Login.vue'
import Register from 'src/pages/Register.vue'
import { uiStore } from 'src/store/UiStore'
import RegistrationSucess from 'src/pages/RegistrationSucess.vue'
import MapWithSheet from 'pages/MapWithSheet.vue'
import Imprint from 'src/pages/Imprint.vue'
import EventOverview from 'pages/event-map/overview/EventOverview.vue'
import EventOverviewMap from 'pages/event-map/overview/EventOverviewMap.vue'
import EventDetailOverview from 'pages/event-map/detail/overview/EventDetailOverview.vue'
import EventDetailOverviewMap from 'pages/event-map/detail/overview/EventDetailOverviewMap.vue'
import EventDetail from 'pages/event-map/detail/EventDetail.vue'
import EventDetailMap from 'pages/event-map/detail/EventDetailMap.vue'
import MyParticipations from 'pages/MyParticipations.vue'
import EventDetailReport from 'pages/event-map/detail/report/EventDetailReport.vue'
import EventDetailArea from 'pages/event-map/detail/area/EventDetailArea.vue'
import EventDetailAreaMap from 'pages/event-map/detail/area/EventDetailAreaMap.vue'
import EventAreaOverview from 'pages/event-map/detail/area/overview/EventAreaOverview.vue'
import EventAreaOverviewMap from 'pages/event-map/detail/area/overview/EventAreaOverviewMap.vue'
import EventAreaStreet from 'pages/event-map/detail/area/street/EventAreaStreet.vue'
import EventAreaStreetMap from 'pages/event-map/detail/area/street/EventAreaStreetMap.vue'
import EventAreaMetrics from 'pages/event-map/detail/area/metrics/EventAreaMetrics.vue'
import EventAreaMetricsMap from 'pages/event-map/detail/area/metrics/EventAreaMetricsMap.vue'
import CreateLead from 'pages/CreateLead.vue'
import Profile from 'pages/Profile.vue'
import EditEventGeometry from 'pages/edit-event/geometry/EditEventGeometry.vue'
import EditEventGeometryMap from 'pages/edit-event/geometry/EditEventGeometryMap.vue'
import EditEventDetails from 'pages/edit-event/details/EditEventDetails.vue'
import CreateEvent from 'pages/CreateEvent.vue'
import CreateEventRequestPermissions from 'pages/CreateEventRequestPermissions.vue'
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
import ManageUsers from 'pages/ManageUsers.vue'
import OfficeOverview from 'pages/office-map/overview/OfficeOverview.vue'
import OfficeOverviewMap from 'pages/office-map/overview/OfficeOverviewMap.vue'
import OfficeDetail from 'pages/office-map/detail/OfficeDetail.vue'
import OfficeDetailMap from 'pages/office-map/detail/OfficeDetailMap.vue'
import PosterOverview from 'pages/poster-map/overview/PosterOverview.vue'
import PosterOverviewMap from 'pages/poster-map/overview/PosterOverviewMap.vue'
import Reports from 'pages/Reports.vue'
import { getAuthStore } from 'src/store/AuthStore'

const authStore = getAuthStore()

const routes = [
  {
    path: '',
    component: App,
    name: 'app',
    redirect: { name: 'home' },
    meta: {
      requiresAuth: false
    },
    children: [
      {
        path: '/',
        name: 'home',
        redirect: () => {
          if (authStore.isLoggedIn()) {
            return { name: 'events' }
          }
          return { name: 'login' }
        }
      },
      {
        path: '/profile',
        component: Profile,
        name: 'profile',
        meta: {
          title: (t) => t('routes.profile.title')
        }
      },
      {
        path: '/my-participations',
        component: MyParticipations,
        name: 'my-participations',
        meta: {
          title: (t) => t('routes.myParticipations.title')
        }
      },
      {
        path: '/reports',
        component: Reports,
        name: 'reports',
        meta: {
          title: (t) => t('routes.statistics.title')
        }
      },
      {
        path: '/offices',
        component: MapWithSheet,
        name: 'office-map',
        meta: {
          title: (t) => t('routes.offices.title')
        },
        props: {
          isShowingOfficeLayer: false
        },
        children: [
          {
            path: '',
            name: 'map-office-overview',
            components: {
              default: OfficeOverview,
              map: OfficeOverviewMap
            }
          },
          {
            path: ':officeId',
            name: 'office-detail',
            components: {
              default: OfficeDetail,
              map: OfficeDetailMap
            },
            meta: {
              isShowBackButton: true,
              title: () => uiStore.getState().activeTitleElements.office
            }
          }
        ]
      },
      {
        path: '/posters',
        component: MapWithSheet,
        name: 'poster-map',
        meta: {
          title: (t) => t('routes.posters.title')
        },
        props: {
          isShowingOfficeLayer: false
        },
        children: [
          {
            path: '',
            name: 'map-poster-overview',
            components: {
              default: PosterOverview,
              map: PosterOverviewMap
            }
          }
        ]
      },
      {
        path: '/events',
        redirect: { name: 'map-events-overview' },
        component: MapWithSheet,
        props: (route) => {
          // We only want to show create button on top level of `/events` route,
          // not on child routes like `/events/:eventId`
          return {
            showCreateButton:
              route.name === 'map-events-overview' && authStore.isLoggedIn()
          }
        },
        name: 'events',
        meta: {
          title: (t) => t('routes.events.title')
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
            components: {
              default: EventDetail,
              map: EventDetailMap
            },
            redirect: { name: 'event-detail-overview' },
            meta: {
              title: () => uiStore.getState().activeTitleElements.event,
              subtitle: () => uiStore.getState().activeTitleElements.campaigns
            },
            children: [
              {
                path: 'overview',
                components: {
                  default: EventDetailOverview,
                  map: EventDetailOverviewMap
                },
                name: 'event-detail-overview'
              },
              {
                path: 'report',
                props: true,
                component: EventDetailReport,
                name: 'event-detail-report',
                meta: {
                  title: (t) => t('routes.events.report.title'),
                  subtitle: () => uiStore.getState().activeTitleElements.event
                }
              },
              {
                path: 'area/:areaId',
                name: 'event-detail-area',
                redirect: { name: 'event-detail-area-overview' },
                components: {
                  default: EventDetailArea,
                  map: EventDetailAreaMap
                },
                meta: {
                  title: () => uiStore.getState().activeTitleElements.eventArea,
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
                      title: (t) =>
                        t('routes.events.area.street.addresses.title'),
                      subtitle: () =>
                        uiStore.getState().activeTitleElements.street
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
                      title: () =>
                        uiStore.getState().activeTitleElements.houseNumber,
                      subtitle: (t) =>
                        t('routes.events.area.street.recordResults.title')
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
                      title: (t) => t('routes.events.area.createLead.title')
                    }
                  },
                  {
                    path: 'posters',
                    name: 'event-detail-poster',
                    redirect: { name: 'event-detail-poster-list' },
                    props: false,
                    components: {
                      default: EventDetailPosters,
                      map: EventDetailPostersMap
                    },
                    meta: {
                      title: () => uiStore.state.activeTitleElements.poster,
                      subtitle: () => uiStore.state.activeTitleElements.event
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
          title: (t) => t('routes.events.createEvent.title')
        }
      },
      {
        path: '/events/request-permissions',
        component: CreateEventRequestPermissions,
        name: 'create-event-request-permissions',
        meta: {
          title: (t) => t('routes.events.requestPermissions.title')
        }
      },
      {
        path: '/events/edit/:eventId',
        component: EditEvent,
        name: 'edit-event',
        redirect: { name: 'edit-event-details' },
        meta: {
          subtitle: () => uiStore.getState().activeTitleElements.event,
          title: (t) => t('routes.events.edit.title')
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
            redirect: { name: 'edit-event-posters-list' },
            components: {
              default: EditEventPosters,
              map: EditEventPostersMap
            },
            meta: {
              title: (t) => t('routes.events.edit.posters.title')
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
              },
              {
                name: 'edit-event-single-poster-new',
                path: 'new',
                components: {
                  default: EditEventSinglePoster,
                  map: EditEventSinglePosterMap
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
          next: route.query.next
        }),
        meta: {
          requiresAuth: false,
          title: (t) => t('routes.login.title')
        }
      },
      {
        path: '/register',
        component: Register,
        meta: {
          requiresAuth: false,
          title: (t) => t('routes.register.title')
        }
      },
      {
        path: '/registration-success',
        component: RegistrationSucess,
        name: 'register-success',
        meta: {
          requiresAuth: false,
          title: (t) => t('routes.registerSuccess.title')
        }
      },
      {
        path: '/imprint',
        component: Imprint,
        meta: {
          requiresAuth: false,
          title: (t) => t('routes.imprint.title')
        }
      },
      {
        path: '/manage-users',
        name: 'manage-users',
        component: ManageUsers,
        meta: {
          title: (t) => t('routes.manageUsers.title')
        }
      }
    ]
  },
  {
    path: '/print',
    component: Print,
    children: [
      {
        path: 'event/:eventId',
        component: PrintEvent,
        name: 'print-event'
      }
    ]
  }
]

export default routes
