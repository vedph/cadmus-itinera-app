# Cadmus Itinera

- [Cadmus Itinera](#cadmus-itinera)
  - [Docker](#docker)
  - [Production](#production)
  - [History](#history)
    - [3.2.1](#321)
    - [3.2.0](#320)
    - [3.1.13](#3113)
    - [3.1.12](#3112)
    - [3.1.11](#3111)
    - [3.1.10](#3110)
    - [3.1.9](#319)
    - [3.1.8](#318)
    - [3.1.7](#317)
    - [3.1.6](#316)
    - [3.1.5](#315)
    - [3.1.4](#314)
    - [3.1.3](#313)
    - [3.1.2](#312)
    - [3.1.1](#311)
    - [3.1.0](#310)
    - [3.0.13](#3013)
    - [3.0.12](#3012)
    - [3.0.11](#3011)
    - [3.0.10](#3010)
    - [3.0.9](#309)
    - [3.0.8](#308)
    - [3.0.7](#307)
    - [3.0.6](#306)
    - [3.0.5](#305)
    - [3.0.4](#304)
    - [3.0.3](#303)
    - [3.0.2](#302)
    - [3.0.1](#301)
    - [3.0.0](#300)
    - [2.1.8](#218)
    - [2.1.7](#217)
    - [2.1.6](#216)
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

This is the frontend for the second generation of the Cadmus Itinera editor.

The codicological parts in this project will be imported from an [independent library](https://github.com/vedph/cadmus-codicology).

## Docker

🐋 Quick Docker image build:

1. `npm run build-lib`;
2. update version in `env.js` (and in Docker compose files), then `ng build --configuration production`;
3. `docker build . -t vedph2020/cadmus-itinera-app:3.2.1 -t vedph2020/cadmus-itinera-app:latest` (replace with the current version).

## Production

If you want to generate a production version, follow these directions. Anyway, you can spare the prod image by just overwriting the `env.js` file in your [Docker compose script](docker-compose.yml) via a volume, e.g..:

```yml
volumes:
  - /opt/cadmus/web/env.js:/usr/share/nginx/html/env.js
```

(1) build the app as above (1-2).

(2) after building the app, change `env.js` in the `dist` folder for these variables and for `version`:

```js
window.__env.apiUrl = "https://itinera.unisi.it:54184/api/";
window.__env.biblioApiUrl = "https://itinera.unisi.it:61692/api/";
window.__env.mapbox_token = "the token for this project";
```

(3) build a new image for production: `docker build . -t vedph2020/cadmus-itinera-app:3.0.6-prod`. The production version is labeled like this one, with `-prod` suffix.

## History

- 2023-04-17: minor changes to app page markup.
- 2023-04-13: updated Angular and packages.
- 2023-04-03: updated Angular and packages.

### 3.2.1

- 2023-02-27: updated packages (changed event model).

### 3.2.0

- 2023-02-27: updated packages (changed event model).

### 3.1.13

- 2023-02-22: updated packages.

### 3.1.12

- 2023-02-20:
  - updated biblio packages.
  - changed size limit for subject in letter info.

### 3.1.11

- 2023-02-20: updated biblio packages.

### 3.1.10

- 2023-02-20: updated biblio packages.

### 3.1.9

- 2023-02-20: updated packages.
- 2023-02-17:
  - updated Angular and packages.
  - added bibliography page.

### 3.1.8

- 2023-02-13: updated codicology packages.

### 3.1.7

- 2023-02-13: updated codicology packages.

### 3.1.6

- 2023-02-11: updated packages and refactored usage of flags component.

### 3.1.5

- 2023-02-08:
  - updated packages and Angular.
  - minor fixes.

### 3.1.4

- 2023-02-08: updated packages.

### 3.1.3

- 2023-02-06:
  - updated packages.
  - fix to sidebar width.
  - fixes to literary work info part.

### 3.1.2

- 2023-02-04: updated packages.
- 2023-02-03:
  - updated Angular and packages.
  - improved submodels input/output bindings.

### 3.1.1

- 2023-02-02:
  - fixed import for JSONP used by VIAF lookup according to this [Angular issue](https://github.com/angular/angular/issues/47312).
  - updated Angular and packages.

### 3.1.0

- 2023-01-26:
  - added lookup to referenced text editor.
  - added lookup to the slider tool in app component.
  - changed literary work info part model replacing author with author IDs.

### 3.0.13

- 2023-01-25: updated packages.
- 2023-01-24: updated packages and added lookup definitions.

### 3.0.12

- 2023-01-24: updated packages.
- 2023-01-20: updated Angular and packages.
- 2023-01-19:
  - added geography parts.

### 3.0.11

- 2023-01-17: updated Cadmus packages.

### 3.0.10

- 2023-01-16: updated packages.
- 2023-01-14: updated fixed codicology package.

### 3.0.9

- 2023-01-12:
  - updated packages.
  - updated biblio API version number in Docker compose scripts.
  - fix validation in work info part.

### 3.0.8

- 2023-01-12: updated Angular and packages.

### 3.0.7

- 2023-01-09:
  - updated Angular and packages.
  - fix to poem ranges table.

### 3.0.6

- 2022-12-22:
  - updated Cadmus packages.
  - upgraded Monaco editor changing the glob in `angular.json` to:

```json
{
  "glob": "**/*",
  "input": "node_modules/monaco-editor",
  "output": "assets/monaco-editor"
}
```

- 2022-12-20: fix to poem layout table.
- 2022-12-19: updated Cadmus packages.

### 3.0.5

- 2022-12-17: fixed handling out of order ranges in poem ranges.
- 2022-12-15:
  - updated Cadmus packages.
  - fixed external IDs part type ID.
  - aesthetic fixes.

### 3.0.4

- 2022-12-15: updated Cadmus packages and Angular.

### 3.0.3

- 2022-12-14: commented out incompatible theme.

### 3.0.2

- 2022-12-14: updated Angular and other 3rd party packages.

### 3.0.1

- 2022-12-06: updated packages.
- 2022-12-04: updated packages.

### 3.0.0

- 2022-11-30:
  - updated to Angular 15
  - replaced Akita with ELF
  - removed `@angular/flex-layout`
- 2022-11-18: updated Docker version numbers for backend.

### 2.1.8

- 2022-11-11: updated codicology libraries after fixes.

### 2.1.7

- 2022-11-08: updated Angular and Cadmus packages.

### 2.1.6

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
