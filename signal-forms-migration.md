# Signal forms migration log

Migration of the libraries under `projects/myrmidon` from reactive forms to
Angular signal forms, after updating the `@myrmidon/cadmus-*` core packages
to version 20.

Each statement here is marked as **verified** (with how it was measured) or
**believed** (with how it could be checked).

## Setup

- **Verified** (`diff`): `scripts/build-libs.mjs` was already identical to
  the one in `cadmus-shell-v3/scripts` (commit 19d9804), so it was not
  replaced. `scripts/check-local-libs.js` differs only in reading
  `tsconfig.json` as JSONC, which this workspace needs.
- **Verified** (`node scripts/build-libs.mjs --dry`): no local library has a
  copy in `node_modules`; all resolve through `tsconfig.json` paths to
  `dist/myrmidon`.

## Findings which apply to all the libraries

- **Verified** (DOM dump of a failing spec: `maxlength="50"` on the citation
  input): the signal forms `maxLength` rule also sets the native `maxlength`
  attribute of a text input bound with `[formField]`. So the user can no
  longer type a value which is too long, and a "too long" error can only come
  from bound data. The specs which typed an overlong value were changed to
  check the cap, and to check the error with an overlong bound value.

## Libraries

### cadmus-part-itinera-cod-loci

- `CodLocusComponent`, `CodLociPartComponent` migrated. No `<form>`; Enter in
  a text input of the locus editor still saves it when its save button is
  enabled.
- Removed the "text required" message of the locus editor: the text never
  had a required rule, so it could not appear.
- Both components are now `OnPush`.
- **Verified**: `ng test` 54 passed; `build:libs cadmus-part-itinera-cod-loci`
  built it and `cadmus-part-itinera-pg`.

### cadmus-part-itinera-cod-poem-ranges

- `CodPoemRangesLayoutComponent`, `CodPoemRangeLayoutsComponent`,
  `CodPoemRangesPartComponent` migrated. No `<form>`; Enter still applies the
  typed layout, adds the typed ranges, and saves a row note, through
  `(keydown.enter)` on those inputs.
- **Verified** (12 specs of the layouts editor failed with the row component
  set to `OnPush`, and passed again with `Eager`):
  `CodPoemRangesLayoutComponent` must not be `OnPush`. `PoemLayoutTable`
  changes its rows in place, so a row is bound as the same object with other
  content, which no signal notifies. The other two components are `OnPush`.
- Removed `CodPoemRangesPartComponent.onTabIndexChange()`. It set the ranges
  and layouts controls to the value they already had. **Believed** to have no
  effect: it can be checked by restoring it and looking for a spec or a UI
  behavior which changes.
- The layout to apply is now `''` rather than `null` when none is picked (the
  "---" option), as the same field is also bound to a text input.
- Empty tag and note are now saved as missing rather than as empty strings.
- **Verified**: `ng test` 173 passed; `build:libs
  cadmus-part-itinera-cod-poem-ranges` built it and `cadmus-part-itinera-pg`.

### cadmus-part-itinera-letter-info

- `LetterInfoPartComponent` migrated, now `OnPush`. No `<form>`, so Enter in
  an input no longer saves the part (as for all the part editors since
  version 20).
- Empty subject, header and text date are saved as missing rather than as
  empty strings.
- **Verified**: `ng test` 25 passed; `build:libs
  cadmus-part-itinera-letter-info` built it and `cadmus-part-itinera-pg`.

### cadmus-part-itinera-literary-work-info

- `AssertedTitleComponent`, `LiteraryWorkInfoPartComponent` migrated, both
  `OnPush`. No `<form>`; Enter in a text input of the title editor still saves
  it when its save button is enabled.
- `pickedGenre` is now a computed signal, derived from the genre and its
  thesaurus.
- The handlers of the author IDs, languages and metres child editors use
  `setFieldFromChild`.
- Removed the "strophes too long" message: strophes never had a length rule.
- An empty note is saved as missing rather than as an empty string.
- From this library on, the specs of length rules set the overlong value with
  the new `setInputValue` helper in `projects/testing/part-testing.ts`.
- **Verified**: `ng test` 59 passed; `build:libs
  cadmus-part-itinera-literary-work-info` built it and
  `cadmus-part-itinera-pg`.
- **Verified** (browser, see below): the part with real data, whose author
  IDs contain nulls, is still pristine 2.5 seconds after it is opened. The
  spec for this passes too, but it was not checked that the child editor does
  emit within the time the spec waits, so the browser check is the evidence.

### cadmus-part-itinera-person-info

- `PersonInfoPartComponent` migrated, now `OnPush`. The Monaco editor is bound
  with `[value]`, `(valueChange)="setFieldFromEditor(...)"` and `(blur)`.
- `projects/testing/monaco-editor-stub.ts` is no longer a value accessor: it
  has the `value` input and the `valueChange` and `blur` outputs of the real
  editor. Like the real editor, it also emits `valueChange` for a text it is
  given by code, so that specs cover the false dirty state this can cause.
- An empty bio is saved as missing rather than as an empty string.
- The Monaco editor no longer follows the editor's `disabled` input (it did
  through its value accessor). **Verified** (`grep disabled` on the feature
  templates and on `src`: no match on a part editor): nothing in this
  workspace binds `disabled` on a part editor, so this has no effect here.
- **Verified**: `ng test` 24 passed; `build:libs
  cadmus-part-itinera-person-info` built it and `cadmus-part-itinera-pg`.

### cadmus-part-itinera-person-works

- `PersonWorkComponent`, `PersonWorksPartComponent` migrated, both `OnPush`.
  No `<form>`; Enter in a text input of the work editor still saves it when
  its save button is enabled.
- An empty EID is saved as missing rather than as an empty string.
- **Verified**: `ng test` 48 passed; `build:libs
  cadmus-part-itinera-person-works` built it and `cadmus-part-itinera-pg`.

### cadmus-part-itinera-referenced-texts

- `ReferencedTextComponent`, `ReferencedTextsPartComponent` migrated, both
  `OnPush`. No `<form>`; Enter in a text input of the text editor still saves
  it when its save button is enabled.
- The "target required" rule checks the target's `gid`, as before: `required`
  would pass for the placeholder ID of a new text.
- The target ID handler uses `setFieldFromChild`.
- An empty target citation is saved as missing rather than as an empty
  string.
- **Verified**: `ng test` 50 passed; `build:libs
  cadmus-part-itinera-referenced-texts` built it and
  `cadmus-part-itinera-pg`.

### cadmus-part-itinera-related-persons

- `RelatedPersonComponent`, `RelatedPersonsPartComponent` migrated, both
  `OnPush`. No `<form>`; Enter in a text input of the person editor still
  saves it when its save button is enabled.
- The IDs handler uses `setFieldFromChild`.
- **Verified**: `ng test` 46 passed; `build:libs
  cadmus-part-itinera-related-persons` built it and `cadmus-part-itinera-pg`.

### cadmus-part-itinera-witnesses

- `WitnessComponent`, `WitnessesPartComponent` migrated, both `OnPush`. No
  `<form>`; Enter in the ID input of the witness editor still saves it when
  its save button is enabled.
- The location handler uses `setFieldFromChild`.
- **Verified**: `ng test` 42 passed.

### cadmus-part-itinera-pg

- No forms: not changed.
- **Verified**: `ng test` 14 passed.

## Final verification

- **Verified** (`pnpm build:libs`): all the 10 libraries build, in dependency
  order.
- **Verified** (`pnpm test:libs`): all the 10 libraries pass, 535 tests.
- **Verified** (`grep`): no library source imports `@angular/forms`, and no
  library template has a `<form>`, a `(submit)` or a `type="submit"`.

### In the browser

Headless Chrome driven over CDP, on `ng serve` started after deleting
`.angular/cache`, with the API on its mock database.

- **Verified**: the scripts loaded by the page contain the migrated code
  (`saveRequest` together with `cadmus-witnesses-part`, and no `formGroup`
  with it).
- **Verified**: each of the 9 part editors, opened on a real part and read
  2.5 seconds later (past the debounce of the child editors), is pristine
  and valid, and contains no `<form>` and no submit button.
- **Verified**, loci part: opening a locus leaves the locus editor and the
  part pristine; typing a location in the location brick makes the locus
  valid and dirty, and leaves the part pristine; Enter in the text input
  saves the locus only, closes its editor, and makes the part dirty, with no
  page reload; the save button saves the part; after a reload the saved text
  and range are there, the loci have no Symbol tag, and the part is pristine;
  closing it shows no pending changes prompt.
- **Verified**, related persons part: opening a person whose IDs contain
  nulls leaves the person editor and the part pristine after 3 seconds; Enter
  in the name input saves the person only; closing the part then shows the
  pending changes prompt.
- **Verified**: no error in the browser console during these flows.
- Not exercised in the browser: the nested editors of the other parts
  (title, work, referenced text, witness, poem layouts) and the Monaco
  editor of the person info part. They are covered by specs only.

## Follow-up, on the owner's request

Three of the items first reported as outside the scope were then fixed.

- Mock loci. The mock loci had a range with `end: null`, which the locus
  editor shows as no location (`CodLocationParser.rangesToString` returns an
  empty string for it), so a mock locus was invalid in its editor until a
  location was typed.
  - Cause, **verified** by reading the seeders: in the backend repository
    `CadmusItinera`, `CodLociPartSeeder` set only the `Start` of the range,
    while `WitnessesPartSeeder` sets both `Start` and `End`.
  - `CodLociPartSeeder` now sets `End` to the same location, and its test
    asserts that each locus has both. **Verified**: the 2 tests of
    `CodLociPartSeederTest` pass (`dotnet run` on the test project; `dotnet
    test` is refused by the test platform on this SDK).
  - The running API references the published package
    `Cadmus.Seed.Itinera.Parts` 9.0.4, so the fixed seeder reaches it only
    once the package is published and the database is seeded again. Meanwhile
    the existing mock database was patched through the API: each locus
    without an end got an end equal to its start. **Verified**: 44 loci in
    23 parts changed, and a second pass found none left.
  - **Verified** in the browser: a mock locus not touched by the earlier
    checks opens with location "2", valid and pristine.
  - **Believed**: the same invalid state existed before the migration,
    because the expression deciding it was not changed.
- Peer dependencies. Each library's `package.json` now declares as peer
  dependencies all the packages its non-spec sources import, with the version
  ranges of the root `package.json` (and `^8.0.2` for the 9 local libraries
  which `cadmus-part-itinera-pg` imports). None was removed:
  `cadmus-part-itinera-pg` still declares `@angular/common`, `@angular/core`
  and `@angular/material`, which its sources do not import.
- Context help. Each of the 9 part editors has `<cadmus-help-link
  [url]="helpUrl()" />` as the last child of its card header. **Verified** in
  the browser: the element is in all the 9 editors, which are still pristine
  and valid. `helpUrl()` is empty for all of them, so no button appears: this
  app configures no help pages (see "Context Help Configuration" in the
  `cadmus-shell-v3` changelog).
- **Verified** after these changes: `pnpm build:libs` builds the 10
  libraries, and `pnpm test:libs` passes with 535 tests.

## Outside the migration's scope (reported, not changed)

- `CodPoemRangesLayoutComponent`: discarding a note being edited does not
  restore the note's text, so the discarded text is shown again when the note
  editor is reopened on the same row. This was so before the migration (the
  cancel handler only closed the editor) and was kept.
- `CodPoemRangesLayoutComponent.numbersCheck` (output) and
  `CodPoemRangesPartComponent.adderRef` are declared and never used.
- `ng test` and `ng build` print "[baseline-browser-mapping] The data in this
  module is over two months old".
