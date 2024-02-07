# Architecture

This file should describe high level concepts and organization of this application.

## Folder structure

The structure is scaffolded and therefore mostly matches the blueprint created by [quasar cli](https://quasar.dev/start/quick-start#step-1-create-a-project) using
the Vue3, Typescript, and Vite template.

See this commented dirtree for reference:

```
.
├── conf                # Configuration files needed for deployment
├── dist                # Folder for builds, should never be in version control
├── mocks               # Code related to mocking (mock server, mock-fixtures)
├── node_modules        # Dependendencies, not part of version control
├── public              # public folder as per https://cli.vuejs.org/guide/html-and-static-assets.html#the-public-folder
├── src                 # Sources root of the actual application (see below)
├── Architecture.md     # You are here
├── babel.config.js     # custom babel config
├── CONTRIBUTING.md     # Instructions for contributers
├── Dockerfile          # Dockerfile to containerize this application (i.e. for production)
├── LICENSE             # License
├── package.json        # https://docs.npmjs.com/cli/v6/configuring-npm/package-json/
├── package-lock.json   # https://docs.npmjs.com/cli/v6/configuring-npm/package-lock-json
├── README.md           # General information how to get started with this project
├── tsconfig.json       # Typescript compiler configuration parameters: https://www.typescriptlang.org/tsconfig/
└── vue.config.js       # Vue CLI configuration: https://cli.vuejs.org/config/

```

And here the commented file tree of the `src/` folder:

```
src                             # Sources root
├── api                         # Helpers and classes for interfacing with our REST API
│   ├── model                   # Data formats for data formats used in our REST API
│   ├── ApiClient.ts            # An api client abstracting response parsing and request facilitation
│   ├── ApiRoute.ts             # A helper class providing a general CRUD interface to REST endpoints, used in ApiClient.ts
│   ├── EventRoute.ts           # A specific implementation extending APIRoute to provide extra operations on event endpoint
│   ├── index.ts                # Index file exporting public classes
│   └── JSONResponse.ts         # A helper type to wrap the raw fetch response and also the parsed JSON payload
├── assets                      # Folder for bundled assets (fonts, images etc.)
│   └── [...]
├── components                  # Reusable Vue components
├── lib                         # Reusable components that provide a most generic feature (like wrapping a library)
│   └── map                     # Maplibre GL JS specific components that also might be usable in a later different project
├── router                      # Vue-router definitions
│   └── index.ts
├── scss                        # global or shared scss files
│   └── [...]
├── store                       #
│   └── [...]                   # Files managing central app-state
├── types                       # Type definitions
│   └── [...]
├── views                       # Views are just vue components, that are connected to a route
│   └── [...]
├── App.vue                     # Root component
├── main.ts                     # Entrypoint
├── registerServiceWorker.ts    # https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
└── shims-vue.d.ts              # Vue shim
```

## Mocking during test / development

We are using [MirageJS](https://miragejs.com/) during development and testing to mock the REST endpoints, enabling us to
run tests without actually running the backend system. We decided that we used a partial feature set of mirage which are
the
[route handlers](https://miragejs.com/docs/main-concepts/route-handlers/) - Mocking databases and serializers would
raise the effort of mocking to an unreasonable level so mocks shall remain static responses defined in our fixtures
folder to test out specific use-cases instead of replicating actual app behavior.

## REST

Representational State Transfer is a paradigm that has
some [ground rules](https://en.wikipedia.org/wiki/Representational_state_transfer), but does leave much room in endpoint
and data format design. For the API in this App we made some design decisions that are to be found in the [backend documentation of wk-service](https://gitlab.alt.coop/wahlkampf-app/wk-service/-/blob/master/REST.md)

