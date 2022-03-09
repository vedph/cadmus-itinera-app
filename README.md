# Cadmus Itinera

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2.

This is the frontend for the second generation of the Cadmus Itinera editor. Currently it's an empty shell, which will be progressively filled with new content. At the end, this will supersede the [old editor frontend](https://github.com/vedph/cadmus_itinera).

The codicological parts in this project will be imported from an [independent library](https://github.com/vedph/cadmus-codicology).

## Docker

Quick Docker image build:

1. `npm run build-all`
2. `ng build --configuration production`
3. `docker build . -t vedph2020/cadmus-itinera-app:2.0.0 -t vedph2020/cadmus-itinera-app:latest` (replace with the current version).

## Production

(1) build the image as above.

(2) after building the app, change `env.js` in the `dist` folder for these variables and for `version`:

```js
window.__env.apiUrl = "https://itinera.unisi.it:54184/api/";
window.__env.biblioApiUrl = "https://itinera.unisi.it:61692/api/";
```

(3) build a new image for production: `docker build . -t vedph2020/cadmus-itinera-app:1.0.46-prod`. The production version is labeled like this one, with `-prod` suffix.

## History

- 2022-01-06: [created](https://github.com/vedph/cadmus_doc/blob/master/guide/frontend/creating.md) the new shell.
