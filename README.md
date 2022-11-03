# Cadmus Itinera

- [Cadmus Itinera](#cadmus-itinera)
  - [Docker](#docker)
  - [Production](#production)
  - [History](#history)
    - [2.1.5](#215)
    - [2.1.4](#214)
    - [2.1.3](#213)
    - [2.1.2](#212)
    - [2.1.1](#211)
    - [2.1.0](#210)
    - [2.0.7](#207)
    - [2.0.6](#206)
    - [2.0.5](#205)
    - [2.0.4](#204)
    - [2.0.3](#203)
    - [2.0.1](#201)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2.

This is the frontend for the second generation of the Cadmus Itinera editor. Currently it's an empty shell, which will be progressively filled with new content. At the end, this will supersede the [old editor frontend](https://github.com/vedph/cadmus_itinera).

The codicological parts in this project will be imported from an [independent library](https://github.com/vedph/cadmus-codicology).

## Docker

Quick Docker image build:

1. `npm run build-lib`
2. update version in `env.js` and `ng build --configuration production`
3. `docker build . -t vedph2020/cadmus-itinera-app:2.1.5 -t vedph2020/cadmus-itinera-app:latest` (replace with the current version).

## Production

(1) build the app as above (1-2).

(2) after building the app, change `env.js` in the `dist` folder for these variables and for `version`:

```js
window.__env.apiUrl = "https://itinera.unisi.it:54184/api/";
window.__env.biblioApiUrl = "https://itinera.unisi.it:61692/api/";
```

(3) build a new image for production: `docker build . -t vedph2020/cadmus-itinera-app:2.1.5-prod`. The production version is labeled like this one, with `-prod` suffix.

## History

- 2022-11-03: updated Angular and Cadmus packages.
- 2022-10-27:
  - updated Angular, rangy, and Cadmus packages.
  - added preview.
- 2022-09-24:
  - updated Angular and Cadmus packages.
  - fix to poem ranges editor: note must be checked together with range when building layouts.
  - updated bibliography lib.
  - updated biblio image version (2.1.5) in Docker files.

### 2.1.5

- 2022-09-15: added bibliography to routes.

### 2.1.4

- 2022-09-14: upgraded Angular.
- 2022-08-26: updated packages incorporating preview updates.

### 2.1.3

- 2022-08-05: updated packages.

### 2.1.2

- 2022-08-03: updated codicology libraries.

### 2.1.1

- 2022-07-24: changed `Witness`.`range` to `ranges`.
- 2022-07-10: updated Angular.
- 2022-06-28: updated packages.

### 2.1.0

- 2022-06-17: upgraded to Angular 14 and refactored forms to typed.

### 2.0.7

- 2022-05-21: updated packages and minor fixes.

### 2.0.6

- 2022-05-08: added author to literary work info part.
- 2022-05-05: updated packages.

### 2.0.5

- 2022-04-29: upgraded Angular (13.3.5).

### 2.0.4

- 2022-04-12:
  - added note to poem ranges part
  - added VIAF lookup to sidenav

### 2.0.3

- 2022-04-08: upgraded Angular (13.3.2) and codicology packages; added sidenav tools.
- 2022-04-04: refactored related person part.

### 2.0.1

- 2022-03-26: updated packages.
- 2022-01-06: [created](https://github.com/vedph/cadmus_doc/blob/master/guide/frontend/creating.md) the new shell.
