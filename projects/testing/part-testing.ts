/**
 * Shared helpers for the specs of the libraries under projects/myrmidon.
 * This is test-only code: it is imported by relative path from spec files
 * and never becomes part of any library build.
 */
import { Component, EnvironmentProviders, Provider } from '@angular/core';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import {
  EditedObject,
  Part,
  ThesauriSet,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';
import { AppRepository, PartEditorService } from '@myrmidon/cadmus-state';
import { EditorHelpService } from '@myrmidon/cadmus-ui';
import { DialogService } from '@myrmidon/ngx-mat-tools';

export const TEST_ITEM_ID = '11111111-1111-1111-1111-111111111111';
export const TEST_PART_ID = '22222222-2222-2222-2222-222222222222';

/**
 * Options for the mock services used by part editors.
 */
export interface PartEditorMocksOptions {
  /**
   * The roles of the logged user. Default is editor, so that the save
   * button is available; use `['visitor']` for a read-only user, or an
   * empty array for no logged user.
   */
  roles?: string[];
  /**
   * The answer given by the user to any confirmation dialog. Default
   * is true.
   */
  confirm?: boolean;
}

/**
 * The mock services used by part editors, exposed so that specs can
 * make assertions on them.
 */
export interface PartEditorMocks {
  providers: (Provider | EnvironmentProviders)[];
  dialogService: { confirm: ReturnType<typeof vi.fn> };
  snackbar: { open: ReturnType<typeof vi.fn> };
  user$: BehaviorSubject<User | null>;
}

function createUser(roles: string[]): User {
  return {
    userName: 'zeus',
    email: 'zeus@olympus.org',
    emailConfirmed: true,
    roles,
    firstName: 'Zeus',
    lastName: 'Olympios',
    lockoutEnabled: false,
  } as User;
}

/**
 * Create the mock services required by any part editor component derived
 * from ModelEditorComponentBase: authentication, app repository, editor
 * help, confirmation dialog, and snackbar. Material animations are disabled.
 */
export function createPartEditorMocks(
  options: PartEditorMocksOptions = {},
): PartEditorMocks {
  const roles = options.roles ?? ['editor'];
  const user$ = new BehaviorSubject<User | null>(
    roles.length ? createUser(roles) : null,
  );
  const dialogService = {
    confirm: vi.fn(() => of(options.confirm ?? true)),
  };

  const snackbar = { open: vi.fn() };

  return {
    dialogService,
    snackbar,
    user$,
    providers: [
      { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      {
        provide: AuthJwtService,
        useValue: {
          currentUser$: user$.asObservable(),
          get currentUserValue() {
            return user$.value;
          },
        },
      },
      {
        provide: AppRepository,
        useValue: {
          getTypeThesaurus: () => undefined,
          getSettingFor: () => Promise.resolve(undefined),
        },
      },
      {
        provide: EditorHelpService,
        useValue: { resolveUrl: () => Promise.resolve(undefined) },
      },
      { provide: DialogService, useValue: dialogService },
      { provide: MatSnackBar, useValue: snackbar },
    ],
  };
}

/**
 * Build a thesauri set from a map of thesaurus IDs to their entries.
 */
export function createThesauri(
  entries: Record<string, ThesaurusEntry[]>,
): ThesauriSet {
  const set: ThesauriSet = {};
  for (const id of Object.keys(entries)) {
    set[id] = { id, language: 'en', entries: entries[id] };
  }
  return set;
}

/**
 * Build a part of type T from its type ID and its specific properties.
 */
export function createPart<T extends Part>(
  typeId: string,
  props: Omit<T, keyof Part>,
): T {
  return {
    id: TEST_PART_ID,
    itemId: TEST_ITEM_ID,
    typeId,
    roleId: undefined,
    timeCreated: new Date('2026-01-02T03:04:05.000Z'),
    creatorId: 'zeus',
    timeModified: new Date('2026-01-02T03:04:05.000Z'),
    userId: 'zeus',
    ...props,
  } as unknown as T;
}

/**
 * Build the edited object bound to the data input of a part editor.
 */
export function createEditedObject<T extends Part>(
  value: T | null,
  thesauri: ThesauriSet = {},
): EditedObject<T> {
  return { value, thesauri };
}

/**
 * A do-nothing replacement for the current item bar, which would require
 * the whole edited item repository.
 */
@Component({
  selector: 'cadmus-current-item-bar',
  template: '',
})
export class CurrentItemBarStubComponent {}

/**
 * Options for the mock services used by part editor feature components.
 */
export interface PartFeatureMocksOptions {
  /**
   * The part type ID, found at the start of the route path.
   */
  typeId: string;
  /**
   * The part ID route parameter. Default is the test part ID; use `new`
   * for a new part.
   */
  pid?: string;
  /**
   * The role ID query parameter, if any.
   */
  rid?: string;
  /**
   * The data returned by the editor service when loading. Default is
   * an empty edited object (new part without thesauri).
   */
  data?: EditedObject<Part> | null;
  /**
   * The error the editor service fails loading with, if any.
   */
  loadError?: Error;
  /**
   * The error the editor service fails saving with, if any.
   */
  saveError?: Error;
}

/**
 * The mock services used by part editor feature components, exposed so
 * that specs can make assertions on them.
 */
export interface PartFeatureMocks {
  providers: (Provider | EnvironmentProviders)[];
  editorService: {
    load: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  router: { navigate: ReturnType<typeof vi.fn> };
  snackbar: { open: ReturnType<typeof vi.fn> };
}

/**
 * Create the mock services required by any part editor feature component
 * derived from EditPartFeatureBase: router and route, snackbar, item and
 * thesaurus services, and part editor service.
 */
export function createPartFeatureMocks(
  options: PartFeatureMocksOptions,
): PartFeatureMocks {
  const editorService = {
    loading$: of(false),
    saving$: of(false),
    load: vi.fn(() =>
      options.loadError
        ? Promise.reject(options.loadError)
        : Promise.resolve(
            options.data === undefined
              ? createEditedObject<Part>(null)
              : options.data,
          ),
    ),
    save: vi.fn((part: Part) =>
      options.saveError
        ? Promise.reject(options.saveError)
        : Promise.resolve({ ...part, id: part.id || TEST_PART_ID }),
    ),
  };
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };
  const snackbar = { open: vi.fn() };

  return {
    editorService,
    router,
    snackbar,
    providers: [
      { provide: Router, useValue: router },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            params: { iid: TEST_ITEM_ID, pid: options.pid ?? TEST_PART_ID },
            queryParams: options.rid ? { rid: options.rid } : {},
            routeConfig: { path: `${options.typeId}/:pid` },
          },
        },
      },
      { provide: MatSnackBar, useValue: snackbar },
      { provide: ItemService, useValue: {} },
      { provide: ThesaurusService, useValue: {} },
      { provide: PartEditorService, useValue: editorService },
    ],
  };
}
