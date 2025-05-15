# Contribution Guide

## Code Style Guidelines

- CSS/SCSS
  - We use kebab-case for class declaration.

## Submission Guidelines

Name branches according to following schema:

```
<type>/`<reference?>`-<scope>
```

`<type>` should one of the following tokens:

```
  feat      new feature for the user
  fix       bug fix for the user, not a fix to build scripts
  hotfix    hotfixes, fixes that are urgent and need to be pushed to `main`
  docs      changes to documentation
  style     formatting, missing semi colons, etc; no functional code change
  refactor  refactoring production code, eg. renaming a variable
  test      adding missing tests, refactoring tests; no production code change
  chore     updating build/env/packages, etc; no production code changes
```

`<reference?>` (optional) if the contents of that branch is related to a reference of a tracking system, you should put
it there.

`<scope>` describes the affected code. The descriptor may be a route, component, feature, utility, etc. It should be one
word or kebab-case, if needed.

Examples:

```
  fix/250-user-translation
  fix/die-linke-app-service-250-user-translation
  feat/31-new-thing
```

- review and test code before submitting a pull request

## Git Commit Guidelines

Format commit messages according to the following schema:

```
  <reference?> <subject>

  <body>

  <footer>
```

`<reference?>` (optional) if the contents of that branch is related to a reference of a tracking system, you should put
it there.

`<subject>`

- Capitalise the subject line.
- Whenever possible, limit the subject line to 50 characters (rule of a thumb).
- Do not end the subject line with a period (saves characters).
- Use the imperative mode in the subject line (e.g. `merge` instead of `merged`,
  `update` instead of `updated`).
- A properly formed Git commit subject line should always be able to complete the
  following sentence:

```
  If applied, this commit will <your subject line here>
```

Examples:

```
  #255 Remove deprecated methods
```

### Body and Footer (optional)

The body and footer should wrap at 80 characters.

The body describes the commit in more detail and should not be more than 1
paragraph (3-5 sentences).
Details are important, but too much verbosity can inhibit understanding and
productivity -- keep it clear and concise.
Use it to explain _what_ and _why_ vs. _how_.

### Piecing It All Together

Below is an example of a full commit message that includes a header, a body,
and a footer:

```
#21 Add prop (isActive)

NavItem now supports an "isActive" property.
This property is used to control the styling of active
navigation links.
```

## Internationalization (i18n) Guidelines

To ensure a consistent and maintainable approach to internationalization, please follow these guidelines when contributing:

### 1. Locale Files Structure

- All translation files are located in `src/i18n/`.
- Each language has its own JSON file (e.g., `en-US.json`, `de-DE.json`).
- Organize translation keys hierarchically by feature or module for clarity.

### 2. Key Naming Conventions

- Use descriptive, namespaced keys (e.g., `login.resetPassword.message`).
- Use camelCase for key names.
- Group related keys under common namespaces.

### 3. Adding or Updating Translations

- Add new keys to all supported language files, even if the value is a placeholder or needs translation.
- Do not remove or rename existing keys without checking for usage across the codebase.

### 4. Using Translations in Code

- Always use the i18n library’s translation function (e.g., `$t('key.path')`) instead of hardcoding strings.
- For dynamic values, use the appropriate syntax for variable interpolation.

### 5. Testing

- Test your changes by switching the app language and verifying that translations appear correctly. The default language can be modified by setting the environment variable `APP_LANGUAGE` (see also `.env.dist`)
- Check for missing or broken keys in the UI.

### 6. Config Scope in Locale Files

- The `config` section in each locale file (e.g., `de.json`) contains language-specific configuration such as date/time formats, language codes, and other settings required by libraries or the application.
- Do not modify or remove keys in the `config` section unless you are updating configuration for localization support.
- For `quasarLangIso`, `apexLangIso`, and `mapLibreLangIso`, we rely on the official locale options provided by each library. Please refer to their documentation for available locale codes:
  - **Quasar**: For some Quasar components we're relying on the default language by Quasar. For possible options take a look into [Quasar Language Packs](https://github.com/quasarframework/quasar/tree/dev/ui/lang)
  - **ApexCharts**: Specifies the language of Charts, mainly used on Reports page. For options see [ApexCharts Locales](https://github.com/apexcharts/apexcharts.js/tree/main/dist/locales)
  - **MapLibre**: Specify the language to use for response text and query result weighting in the Geocoder Options are IETF language tags comprised of a mandatory ISO 639-1 language code and optionally one or more IETF subtags for country or script. (See also [MaplibreGeocoderApiConfig documentation](https://maplibre.org/maplibre-gl-geocoder/types/MaplibreGeocoderApiConfig.html))
- For `accpetLanguageHeaderApiIso`, use the locale code that should be sent in the `Accept-Language` HTTP header for API requests. The possible options for this value can be retrieved from the Django backend variable `LANGUAGES`.
- Example:
  ```json
  {
    "config": {
      "nativeName": "Deutsch",
      "quasarLangIso": "de-DE",
      "apexLangIso": "de",
      "mapLibreLangIso": "de-DE",
      "accpetLanguageHeaderApiIso": "de-de",
      "datetimeFormats": { ... }
    }
  }
  ```

### 7. Adding New Locales

To add support for a new language (locale) in the app:

1. **Create a Locale File**

   - In `src/i18n/`, create a new JSON file named with the appropriate locale code (e.g., `fr-FR.json` for French/France).

2. **Copy Structure**

   - Copy the structure from an existing locale file (such as `en-US.json`).
   - Ensure all required keys and the `config` section are present.

3. **Translate Content**

   - Replace the values with translations for the new language.
   - Keep key names and structure unchanged.

4. **Reference the Locale in Code**

   - Import and add the new locale JSON in `src/i18n/index.ts` so it is available to the app.
   - Extend the `supportedLanguages` array in `src/boot/i18n.ts` to include the new locale code.

5. **Configure Locale in the App**
   - If necessary, update the app’s configuration to include the new locale as a selectable option.
   - Ensure the `config` section is filled out, including `quasarLangIso`, `apexLangIso`, `mapLibreLangIso`, and `accpetLanguageHeaderApiIso`.
