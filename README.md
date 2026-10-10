# Cadmus Itinera App

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.1.

This is the frontend for the second generation of the Cadmus Itinera editor.

The codicological parts in this project are imported from an [independent library](https://github.com/vedph/cadmus-codicology).

## Docker

🐋 Quick Docker image build:

1. `pnpm run build:libs` (builds all the libraries in dependency order; pass one or more library names to build only those and their dependents);
2. update version in `env.js` (and in Docker compose files), then `ng build --configuration production`;
3. `docker build . -t vedph2020/cadmus-itinera-app:14.0.0 -t vedph2020/cadmus-itinera-app:latest` (replace with the current version).

## Testing

Libraries are tested with Vitest (via the Angular `unit-test` builder, in jsdom) and the Angular Testing Library:

- `pnpm run test:libs`: test all the libraries (add `--coverage` for a coverage report, or library names to test only those).
- `ng test @myrmidon/cadmus-part-itinera-cod-loci --watch=false`: test a single library.

The `@myrmidon/cadmus-part-itinera-pg` library consumes the other libraries from `dist`, so run `pnpm run build:libs` before testing it.

## Setup

This workspace has been built with the following commands:

```sh
ng new cadmus-itinera-app
cd cadmus-itinera-app
ng add @angular/material
ng add @angular/localize

ng g library @myrmidon/cadmus-part-itinera-cod-loci --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-cod-poem-ranges --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-letter-info --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-literary-work-info --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-person-info --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-person-works --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-referenced-texts --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-related-persons --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-witnesses --prefix cadmus --force
ng g library @myrmidon/cadmus-part-itinera-pg --prefix cadmus --force
```

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
