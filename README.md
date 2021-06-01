
# wk-frontend

This project is the frontend application for the "DIE LINKE. App". It's a responsive Progressive Web App.

## General

This project is based on the [quasar framework (v2)](https://next.quasar.dev/), meaning it uses Vue3 and Typescript
This project uses Vue3 with Typescript and VueCLI for bootstrapping, building and serving during development.

As an additional UI component library [PrimeVue](https://www.primefaces.org/primevue/showcase/#/), is at our disposal, but should only be
progressively used if there is no fitting component available in the quasar component set.

Documentation resources for the used tools:

* Quasar (and Quasar CLI): https://next.quasar.dev/
* Vue (3): https://v3.vuejs.org/api/
* Typescript: https://www.typescriptlang.org/

⚠️ Lots of resources out there still refer to Vue2 while we use Vue3


## Development

### Install dependencies

```
npm install
```

### Environment Variable

As a template for the required environment variables you can use `.env.dist`.

```bash
$ cp -n .env.dist .env
```

You can also define and overwrite variables directly as env var like `APP_VARIABLE=foo npm run serve`

⚠️ We are only parsing variables prefixed with `APP_`
⚠️ Quasar will replace all references to process.env with the actual substitute, so all variables that are referenced in the code **need** to be
defined. If not the offending line will complain that `process` is undefined. So if you introduce a new variable make sure to actually declare it or
use a safe access to `process` with a proper default value in constants.

### Serving the application during development (with hot-reload)

```
npm run serve
```

### Compile for production

```
npm run build
```

### Run linter and auto-fix

```
npm run lint
```

### Contribution guidelines

Find contribution guidelines [here](./CONTRIBUTE.md)


## Testing

### Mock backend during testing or development

While running the application in development or especially during automated e2e-tests we like to introduce a mocked API environment,
to be independent of a backend to be running. For that matter [mirageJS](https://miragejs.com/) is utilized.
It hooks into `fetch` calls effectively simulating a backend response according the configuration that lives in [server.ts](./src/server.js)

