
# wk-frontend

This project is the frontend application for the "DIE LINKE. App". It's a responsive Progressive Web App.

## General

This project is based on the [quasar framework (v2)](https://next.quasar.dev/), meaning it uses Vue3 and Typescript
This project uses Vue3 with Typescript and VueCLI for bootstrapping, building and serving during development.

Documentation resources for the used tools:

* Quasar (and Quasar CLI): https://next.quasar.dev/
* Vue (3): https://v3.vuejs.org/api/
* Typescript: https://www.typescriptlang.org/

⚠️ Lots of resources out there still refer to Vue2 while we use Vue3


## Development

### Install dependencies

Make sure you are running **node version 16** in development

```
npm install
```

### Environment Variable

As a template for the required environment variables you can use `.env.dist`.

```bash
$ cp -n .env.dist .env
```

You can also define and overwrite variables directly as env var like `APP_VARIABLE=foo npm run dev`

⚠️ We are only parsing variables prefixed with `APP_`
⚠️ Quasar will replace all references to process.env with the actual substitute, so all variables that are referenced in the code **need** to be
defined. If not the offending line will complain that `process` is undefined. So if you introduce a new variable make sure to actually declare it or
use a safe access to `process` with a proper default value in constants.

### Serving the application during development (with hot-reload)

```
npm run dev
```

### Compile for production

```
npm run build
```

### Build capacitor app

This project also has a capacitor target. Following npm scripts alias capacitor builds:

```
npm run build:android # builds app for capacitor android target
npm run dev:android # starts dev server for capacitor android target
```

### Run linter and auto-fix

```
npm run lint
```

## Contribution Guidelines & License

[GPLv3](./LICENSE.md) with [Apple app store exception](./COPYING.iOS).

DIE LINKE. doesn't require a CLA (Contributor License Agreement). The copyright belongs to all the individual contributors. Therefore we recommend that every contributor adds following line to the header of a file, if they changed it substantially:

```
@copyright Copyright (c) <year>, <your name> (<your email address>)
```

Find contribution guidelines [here](./CONTRIBUTING.md)

## Testing

### Mock backend during testing or development

While running the application in development or especially during automated e2e-tests we like to introduce a mocked API
environment, to be independent of a backend to be running. For that matter [mirageJS](https://miragejs.com/) is
utilized. It hooks into `fetch` calls effectively simulating a backend response according the configuration that lives
in [server.ts](./src/server.js)

## Releasing / Versioning

The release is done as follows. Create a branch coming from `develop`. It must be named according to the following scheme:

`release/MAJOR.MINOR.PATCH`

E.g.:

```shell
release/0.5.1 ✓
release/0.5.1-rc.1 ✗
release/0.5 ✗
release/teststring ✗
```

This will update the staging environment. After merging the branch to `main`, a tagged commit needs to be added to the
main branch, which will trigger the creation of the production bundle, the android build, and the pushing of iOS app to apple
testflight.

### How should the tagging for production version be done?

Our gradle build scripts automatically create versions based on the git tag. To reduce an integer we follow a strict
pattern for release tags that are a subset of [semver](https://semver.org/lang/de/):
`MAJOR.MINOR.PATCH[-PRE-RELEASE-TYPE].[PRE-RELEASE-VERSION]`. Valid prerelease types are 'alpha', 'beta', 'rc'.

For example:

```
git tag -a 1.1.0 # ✓
git tag -a 1.1.1-alpha.1 # ✓
git tag -a 1.2.0 # ✓
```

The build script will possibly throw an error or generate garbage versions if the last tag is wrong like those bad
examples:

```

git tag -a 1.2 # ✗
git tag -a 1.1.1-alpha-1 # ✗
git tag -a testtag # ✗
```

*Tip: Take a look on [npm-version](https://docs.npmjs.com/cli/v6/commands/npm-version) to update the version*

