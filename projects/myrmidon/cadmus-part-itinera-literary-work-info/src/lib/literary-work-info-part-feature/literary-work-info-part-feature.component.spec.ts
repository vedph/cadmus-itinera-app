import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import {
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createPartFeatureMocks,
  createThesauri,
  CurrentItemBarStubComponent,
  PartFeatureMocksOptions,
  TEST_ITEM_ID,
  TEST_PART_ID,
} from '../../../../../testing/part-testing';
import {
  LITERARY_WORK_INFO_PART_TYPEID,
  LiteraryWorkInfoPart,
} from '../literary-work-info-part';
import { LiteraryWorkInfoPartFeatureComponent } from './literary-work-info-part-feature.component';

const THESAURI_IDS = [
  'literary-work-languages',
  'literary-work-genres',
  'literary-work-metres',
  'assertion-tags',
  'doc-reference-types',
  'doc-reference-tags',
  'asserted-id-scopes',
  'asserted-id-tags',
];

const PART = createPart<LiteraryWorkInfoPart>(LITERARY_WORK_INFO_PART_TYPEID, {
  languages: ['lat'],
  genre: 'epic',
  titles: [
    { language: 'lat', value: 'Aeneis' },
    { language: 'ita', value: 'Eneide' },
  ],
});

const THESAURI = createThesauri({
  'literary-work-languages': [
    { id: 'lat', value: 'Latin' },
    { id: 'ita', value: 'Italian' },
  ],
});

async function setup(options: Partial<PartFeatureMocksOptions> = {}) {
  const mocks = createPartFeatureMocks({
    typeId: LITERARY_WORK_INFO_PART_TYPEID,
    data: createEditedObject(PART, THESAURI),
    ...options,
  });
  const view = await render(LiteraryWorkInfoPartFeatureComponent, {
    providers: [...createPartEditorMocks().providers, ...mocks.providers],
    importOverrides: [
      { replace: CurrentItemBarComponent, with: CurrentItemBarStubComponent },
    ],
  });
  return { ...view, user: userEvent.setup(), mocks };
}

describe('LiteraryWorkInfoPartFeatureComponent', () => {
  it('should load the part of the route with its thesauri', async () => {
    const { user, mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: LITERARY_WORK_INFO_PART_TYPEID,
        partId: TEST_PART_ID,
        roleId: undefined,
      },
      THESAURI_IDS,
    );
    expect(await screen.findByRole('cell', { name: 'Aeneis' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Eneide' })).toBeVisible();

    // the thesauri reach the editor too
    await user.click(screen.getByRole('tab', { name: 'lang./note' }));
    expect(await screen.findByRole('checkbox', { name: 'Latin' })).toBeChecked();
  });

  it('should load a new part with its role', async () => {
    const { mocks } = await setup({ pid: 'new', rid: 'copy', data: null });

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: LITERARY_WORK_INFO_PART_TYPEID,
        partId: null,
        roleId: 'copy',
      },
      THESAURI_IDS,
    );
    expect(screen.queryByRole('cell', { name: 'Aeneis' })).not.toBeInTheDocument();
  });

  it('should report a loading error', async () => {
    const { mocks } = await setup({ loadError: new Error('load failed') });

    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith('load failed', 'OK'),
    );
  });

  it('should save the part edited by the user', async () => {
    const { user, mocks } = await setup();

    await screen.findByRole('cell', { name: 'Aeneis' });
    await user.click(
      screen.getAllByRole('button', { description: 'Move this title down' })[0],
    );
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    const saved: LiteraryWorkInfoPart =
      mocks.editorService.save.mock.calls[0][0];
    expect(saved.id).toBe(TEST_PART_ID);
    expect(saved.titles.map((t) => t.value)).toEqual(['Eneide', 'Aeneis']);
    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith(
        'Part saved',
        'OK',
        expect.anything(),
      ),
    );
  });

  it('should report a saving error', async () => {
    const { user, mocks } = await setup({
      saveError: new Error('save failed'),
    });

    await screen.findByRole('cell', { name: 'Aeneis' });
    await user.click(
      screen.getAllByRole('button', { description: 'Move this title down' })[0],
    );
    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith('save failed', 'OK'),
    );
  });

  it('should go back to the item on close', async () => {
    const { user, mocks } = await setup();

    await user.click(await screen.findByRole('button', { name: /close/ }));

    expect(mocks.router.navigate).toHaveBeenCalledWith(['items', TEST_ITEM_ID]);
  });
});
