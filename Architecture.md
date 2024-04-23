# Architecture

This file should describe high level concepts and organization of this application.

## Folder structure

The structure is scaffolded and therefore mostly matches the blueprint created by [quasar cli](https://quasar.dev/start/quick-start#step-1-create-a-project) using
the Vue3, Typescript, and Vite template.

See this commented dirtree for reference:

```bash
.
├── conf                # Configuration files needed for deployment
├── dist                # Folder for builds, should never be in version control
├── node_modules        # Dependendencies, not part of version control
├── public              # public folder as per https://cli.vuejs.org/guide/html-and-static-assets.html#the-public-folder
├── src                 # Sources root of the actual application (see below)
├── Architecture.md     # You are here
├── babel.config.js     # custom babel config
├── CONTRIBUTING.md     # Instructions for contributers
├── Dockerfile          # Dockerfile to containerize this application (i.e. for production)
├── LICENSE             # License
├── package.json        # https://docs.npmjs.com/cli/v8/configuring-npm/package-json
├── package-lock.json   # https://docs.npmjs.com/cli/v8/configuring-npm/package-json
├── README.md           # General information how to get started with this project
├── tsconfig.json       # Typescript compiler configuration parameters: https://www.typescriptlang.org/tsconfig/
└── quasar.config.js    # Quasar CLI configuration: https://quasar.dev/quasar-cli-vite/quasar-config-file

```

And here the commented file tree of the `src/` folder:

```bash
src                             # Sources root
├── api                         # Helpers and classes for interfacing with our REST API
│   ├── model                   # Data formats (DTO-Data Transfer Objects) for data formats used in our REST API
│   ├── ApiClient.ts            # An api client abstracting response parsing and request facilitation
│   ├── ApiRoute.ts             # A helper class providing a general CRUD interface to REST endpoints, used in ApiClient.ts
│   ├── EventRoute.ts           # A specific implementation extending APIRoute to provide extra operations on event endpoint
│   ├── index.ts                # Index file exporting public classes
│   └── JSONResponse.ts         # A helper type to wrap the raw fetch response and also the parsed JSON payload
├── assets                      # Folder for bundled assets (fonts, images etc.)
│   └── [...]
├── components                  # Reusable Vue components
├── map                         # Maplibre GL JS specific components
├── router
│   └── [...]                   # Files managing central app-state
├── css
│   └── [...]                   # global or shared scss files
├── store
│   └── [...]                   # Files managing central app-state
├── types
│   └── [...]                   # Type definitions
├── pages
│   └── [...]                   # Pages are just vue components, that are connected to a route
├── App.vue                     # Root component
└── shims-vue.d.ts              # Vue shim
```

## REST

Representational State Transfer is a paradigm that has
some [ground rules](https://en.wikipedia.org/wiki/Representational_state_transfer), but does leave much room in endpoint
and data format design. For the API in this App we made some design decisions that are to be found in the [backend documentation of die-linke-app-service](https://gitlab.die-linke.de/die-linke-app/die-linke-app-service/-/blob/main/REST.md)

