# Contribution Guide

## Code Style Guidelines

* CSS/SCSS
  * We use kebab-case for class declaration.

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
  fix/wk-frontend-250-user-translation
  feat/31-new-thing
```

* review and test code before submitting a pull request

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

* Capitalise the subject line.
* Whenever possible, limit the subject line to 50 characters (rule of a thumb).
* Do not end the subject line with a period (saves characters).
* Use the imperative mode in the subject line (e.g. `merge` instead of `merged`,
  `update` instead of `updated`).
* A properly formed Git commit subject line should always be able to complete the
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
Use it to explain *what* and *why* vs. *how*.


### Piecing It All Together

Below is an example of a full commit message that includes a header, a body,
and a footer:

```
#21 Add prop (isActive)

NavItem now supports an "isActive" property.
This property is used to control the styling of active
navigation links.
```
