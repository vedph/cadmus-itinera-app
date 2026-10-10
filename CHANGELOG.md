# History

- 2026-10-10:
  - replaced the libraries build script with `scripts/build-libs.mjs` (`pnpm run build:libs`), which builds libraries in dependency order and stops at the first failure.
  - ⚠️ migrated libraries tests from Karma/Jasmine to Vitest + Angular Testing Library (`pnpm run test:libs`), removing Karma, Jasmine and other stale packages (`istanbul-lib-instrument`, `@types/diff-match-patch`).
  - added tests to libraries, fixing the bugs they revealed:
    - `@myrmidon/cadmus-part-itinera-cod-loci`:
      - 🐛 the part editor never received the loaded part nor its thesauri, because the feature component bound its `data` signal rather than its value (`$any(data)` instead of `$any(data())`): the editor was always empty, and saving created a new part.
      - 🐛 accepting a locus in the locus editor also saved the whole part, as the `submit` event of the nested form bubbled up to the part's form.
      - 🐛 a new locus could be accepted without a location, because its placeholder range (sheet 0) satisfied the required validation; such a range is now treated as no location.
      - 🐛 the "too long" error messages of citation, text and note were never displayed (wrong `maxLength` error key instead of `maxlength`).
    - `@myrmidon/cadmus-part-itinera-cod-poem-ranges`:
      - 🐛 the part editor never received the loaded part nor its thesauri (feature component bound its `data` signal rather than its value).
      - 🐛 adding ranges, or applying a layout to the selected poems, also saved the whole part, as the `submit` event of the nested forms bubbled up to the part's form.
      - 🐛 after adding some ranges, the add button could stay disabled for the next valid ranges typed, because the ranges validator used a stateful (global) regular expression.
      - 🐛 poems at the boundaries of a range with an alphabetic suffix (e.g. `3a-5`) were lost in the layouts table, because `AlnumRangeService.expandRanges` rendered them as `[object Object]`.
      - 🐛 `PoemLayoutTable.getLayouts` never collapsed more than two consecutive poems with the same layout into a single range (e.g. 1-6 was saved as 1-2, 3-4, 5-6).
      - 🐛 the "too long" error messages of type, tag, note and layout were never displayed (wrong `maxLength` error key).
      - the apply layout button no longer applies the layout twice per click.
      - added tooltips to the icon buttons which had no accessible description (add ranges, save/discard poem note).
- 2026-10-10: updated packages and Maplibre configuration.
- 2026-10-06:
  - updated Angular and packages (still for Reactive forms).
  - updated and fixed Maplibre.
- 2026-09-29: updated Angular and packages.

## 14.0.0

- 2026-06-20:
  - ⚠️ migrated to zoneless.
  - ⚠️ upgraded to Angular 22.
  - ⚠️ migrated to new [Monaco wrapper](https://vedph.github.io/cadmus-doc/history/20260613-monaco.html).
  - ⚠️ replaced styles with new Angular Material M3 styles.
  - 🆕 added new admin pages.
- 2025-11-24:
  - ⚠️ upgraded to Angular 21.
  - migrated to `pnpm`.
- 2025-09-28:
  - updated Angular and packages.
  - removed `diff-match-patch`.
  - fixed routes.
- 2025-09-16:
  - updated Angular and packages.
  - ⚠️ refactored for full reactivity.

## 13.0.2

- 2025-08-06: updated packages (including bibliography libraries, untied from ISO639, and bricks with scope fix in asserted composite IDs).

## 13.0.1

- 2025-08-02:
  - removed from Itinera parts legacy settings for pin links.
  - updated packages and added codicology UI and cod-layout-view.
  - configured bibliography item ID getter to use key instead of ID (falling back to ID if key not set, which should never happen).
- 2025-07-30: updated packages (fixes to refs lookup brick and asserted chronotopes).

## 13.0.0

- 2025-07-25: added MUFI URI.
- 2025-07-24:
  - updated Angular and packages.
  - replaced guards and interceptors with function-based counterparts.
  - 👉 added JWT interceptor URI exception for VIAF. Note that this is essential to make the service work, because the public VIAF service will reject a request with a bearer token.
- 2025-07-23: ⚠️ rebased on Angular 20 workspace.

## 12.0.0

- 2025-07-22:
  - updated Angular and packages.
  - added stats page and menu.
  - refactored styles.
- 2025-07-17: updated Angular and packages.
- 2025-06-03:
  - ⚠️ upgraded to Angular 20.
  - better loading message.

## 11.0.0

- 2025-01-29:
  - updated Angular.
  - ⚠️ updated signal dependencies and migrated to signals.

## 10.0.0

- 2025-01-06:
  - ⚠️ standalone components.
  - updated Angular.
  - refactored app for modern Angular.

## 9.0.0

- 2024-12-06:
  - ⚠️ updated core dependencies.
  - M3 theme.

## 8.0.0

- 2024-11-27: ⚠️ upgraded to Angular 19.
- 2024-07-19:
  - updated Angular and packages.
  - [refactored Gravatar](https://myrmex.github.io/overview/cadmus/dev/history/f-gravatar/)
- 2024-07-12: updated Angular and packages.

## 7.0.1

- 2024-06-25: added DBPedia provider.

## 7.0.0

- 2024-06-24:
  - ⚠️ upgraded to Angular 18.
  - [updated bricks](https://github.com/vedph/cadmus-bricks-shell-v2#migration-from-v1) to 5.x.x and replaced Monaco editor.
  - replaced `mapbox-gl` with `leaflet`.
  - replaced `color` with classes.
  - added text editor plugins.
- 2023-12-05:
  - updated Angular and packages.
  - opted in for flags editing.
- 2023-11-10: ⚠️ upgraded to Angular 17.

## 6.0.2

- 2023-10-10: updated packages (fix in paged store list caching).

## 6.0.1

- 2023-10-05: updated Angular and packages (with fixed graph walker).

## 6.0.0

- 2023-10-04: ⚠️ updated packages and removed ELF.

## 5.0.9

- 2023-10-03:
  - subject max length for letter part info bumped to 3000.
  - updated packages.

## 5.0.8

- 2023-09-25:
  - updated Angular and packages.
  - opted in thesauri import.

## 5.0.7

- 2023-09-11: updated Angular.
- 2023-09-06: removed `Assertion` from `ReferencedText` (`@myrmidon/cadmus-part-itinera-referenced-texts`).

## 5.0.6

- 2023-08-29: added asserted composite IDs external lookup configurations in `app.component`.

## 5.0.5

- 2023-08-29: updated biblio packages.

## 5.0.4

- 2023-08-29: updated Angular and packages.
- 2023-08-11: updated Angular.

## 5.0.3

- 2023-07-24: updated Angular and packages.

## 5.0.2

- 2023-07-17:
  - set all the asserted composite IDs default to internal link.
  - person info bio max length raised to 50k even though this is just a theorical limit and it is not suggested nor compliant with structured data to go beyond a reasonable size.
- 2023-07-16: updated packages.

## 5.0.1

- 2023-06-23: updated Angular and packages.

## 5.0.0

- 2023-06-17: moved to PostgreSQL.
- 2023-06-16: upgraded Angular.

## 4.0.5

- 2023-05-26: updated packages.

## 4.0.4

- 2023-05-26:
  - added missing thesaurus to related persons part feature for pin lookup settings.
  - updated packages.

## 4.0.3

- 2023-05-26: updated packages and Angular.

## 4.0.2

- 2023-05-26: updated `ReferencedTextsPart` to use `AssertedCompositeId` for `targetId`.

## 4.0.1

- 2023-05-25: updated packages (fixes in pin lookup).

## 4.0.0

- 2023-05-25: updated packages (breaking change in general parts introducing [AssertedCompositeId](https://github.com/vedph/cadmus-bricks-shell/blob/master/projects/myrmidon/cadmus-refs-asserted-ids/README.md#asserted-composite-id)).

## 3.3.1

- 2023-05-19: updated graph packages.
- 2023-05-17: added `note` to `CodLocus`.

## 3.3.0

- 2023-05-16:
  - updated graph UI library package.
  - replaced graph UI page package with its graph-enabled extension, adding the required walker dependencies.
  - renamed containers in docker compose scripts.
  - added docker compose script with graph enabled and no item seeding.
- 2023-05-12: updated to Angular 16.

## 3.2.3

- 2023-04-27: updated general part wrapper library.
- 2023-04-27: updated codicology libraries.

## 3.2.2

- 2023-04-17:
  - minor changes to app page markup.
  - changed guard for bibliography page so that editors can access it.
- 2023-04-13: updated Angular and packages.
- 2023-04-03: updated Angular and packages.

## 3.2.1

- 2023-02-27: updated packages (changed event model).

## 3.2.0

- 2023-02-27: updated packages (changed event model).

## 3.1.13

- 2023-02-22: updated packages.

## 3.1.12

- 2023-02-20:
  - updated biblio packages.
  - changed size limit for subject in letter info.

## 3.1.11

- 2023-02-20: updated biblio packages.

## 3.1.10

- 2023-02-20: updated biblio packages.

## 3.1.9

- 2023-02-20: updated packages.
- 2023-02-17:
  - updated Angular and packages.
  - added bibliography page.

## 3.1.8

- 2023-02-13: updated codicology packages.

## 3.1.7

- 2023-02-13: updated codicology packages.

## 3.1.6

- 2023-02-11: updated packages and refactored usage of flags component.

## 3.1.5

- 2023-02-08:
  - updated packages and Angular.
  - minor fixes.

## 3.1.4

- 2023-02-08: updated packages.

## 3.1.3

- 2023-02-06:
  - updated packages.
  - fix to sidebar width.
  - fixes to literary work info part.

## 3.1.2

- 2023-02-04: updated packages.
- 2023-02-03:
  - updated Angular and packages.
  - improved submodels input/output bindings.

## 3.1.1

- 2023-02-02:
  - fixed import for JSONP used by VIAF lookup according to this [Angular issue](https://github.com/angular/angular/issues/47312).
  - updated Angular and packages.

## 3.1.0

- 2023-01-26:
  - added lookup to referenced text editor.
  - added lookup to the slider tool in app component.
  - changed literary work info part model replacing author with author IDs.

## 3.0.13

- 2023-01-25: updated packages.
- 2023-01-24: updated packages and added lookup definitions.

## 3.0.12

- 2023-01-24: updated packages.
- 2023-01-20: updated Angular and packages.
- 2023-01-19:
  - added geography parts.

## 3.0.11

- 2023-01-17: updated Cadmus packages.

## 3.0.10

- 2023-01-16: updated packages.
- 2023-01-14: updated fixed codicology package.

## 3.0.9

- 2023-01-12:
  - updated packages.
  - updated biblio API version number in Docker compose scripts.
  - fix validation in work info part.

## 3.0.8

- 2023-01-12: updated Angular and packages.

## 3.0.7

- 2023-01-09:
  - updated Angular and packages.
  - fix to poem ranges table.

## 3.0.6

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

## 3.0.5

- 2022-12-17: fixed handling out of order ranges in poem ranges.
- 2022-12-15:
  - updated Cadmus packages.
  - fixed external IDs part type ID.
  - aesthetic fixes.

## 3.0.4

- 2022-12-15: updated Cadmus packages and Angular.

## 3.0.3

- 2022-12-14: commented out incompatible theme.

## 3.0.2

- 2022-12-14: updated Angular and other 3rd party packages.

## 3.0.1

- 2022-12-06: updated packages.
- 2022-12-04: updated packages.

## 3.0.0

- 2022-11-30:
  - updated to Angular 15
  - replaced Akita with ELF
  - removed `@angular/flex-layout`
- 2022-11-18: updated Docker version numbers for backend.

## 2.1.8

- 2022-11-11: updated codicology libraries after fixes.

## 2.1.7

- 2022-11-08: updated Angular and Cadmus packages.

## 2.1.6

- 2022-11-03: updated Angular and Cadmus packages.
- 2022-10-27:
  - updated Angular, rangy, and Cadmus packages.
  - added preview.
- 2022-09-24:
  - updated Angular and Cadmus packages.
  - fix to poem ranges editor: note must be checked together with range when building layouts.
  - updated bibliography lib.
  - updated biblio image version (2.1.5) in Docker files.

## 2.1.5

- 2022-09-15: added bibliography to routes.

## 2.1.4

- 2022-09-14: upgraded Angular.
- 2022-08-26: updated packages incorporating preview updates.

## 2.1.3

- 2022-08-05: updated packages.

## 2.1.2

- 2022-08-03: updated codicology libraries.

## 2.1.1

- 2022-07-24: changed `Witness`.`range` to `ranges`.
- 2022-07-10: updated Angular.
- 2022-06-28: updated packages.

## 2.1.0

- 2022-06-17: upgraded to Angular 14 and refactored forms to typed.

## 2.0.7

- 2022-05-21: updated packages and minor fixes.

## 2.0.6

- 2022-05-08: added author to literary work info part.
- 2022-05-05: updated packages.

## 2.0.5

- 2022-04-29: upgraded Angular (13.3.5).

## 2.0.4

- 2022-04-12:
  - added note to poem ranges part
  - added VIAF lookup to sidenav

## 2.0.3

- 2022-04-08: upgraded Angular (13.3.2) and codicology packages; added sidenav tools.
- 2022-04-04: refactored related person part.

## 2.0.1

- 2022-03-26: updated packages.
- 2022-01-06: [created](https://github.com/vedph/cadmus_doc/blob/master/guide/frontend/creating.md) the new shell.
