
# wk-frontend

This project is the frontend application for the "Wahlkampf"-App. It's a responsive Progressive Web App.

## General

This project uses Vue3 with Typescript and VueCLI for bootstrapping, building and serving during development.

Documentation resources for the used tools:

* VueCLI: https://cli.vuejs.org/
* Vue (3): https://v3.vuejs.org/api/
* Typescript: https://www.typescriptlang.org/

⚠️ Lots of resources out there still refer to Vue2 while we use Vue3


## Development

### Install dependencies

```
npm install
```

### Development credentials

For getting the map to work you need to add a mapbox access token to your development environment that is eligible for your local development domain (probably http://localhost:8080)

Create a file .env.development.local and add the token like this:
```
VUE_APP_MAPBOX_TOKEN=[token]
```


### Serving the application during development (with hot-load)

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

