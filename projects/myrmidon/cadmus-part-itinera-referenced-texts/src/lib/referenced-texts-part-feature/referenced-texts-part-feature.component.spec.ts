import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import {
  createAssertedIdMocks,
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
  REFERENCED_TEXTS_PART_TYPEID,
  ReferencedTextsPart,
} from '../referenced-texts-part';
import { ReferencedTextsPartFeatureComponent } from './referenced-texts-part-feature.component';

const THESAURI_IDS = [
  'related-text-types',
  'asserted-id-scopes',
  'asserted-id-tags',
  'assertion-tags',
  'doc-reference-types',
  'doc-reference-tags',
];

const PART = createPart<ReferencedTextsPart>(REFERENCED_TEXTS_PART_TYPEID, {
  texts: [
    {
      type: 'q',
      targetId: { target: { gid: 'http://x.org/verg-aen', label: 'Aeneis' } },
      targetCitation: 'Aen. 1,1',
    },
    {
      type: 'a',
      targetId: { target: { gid: 'http://x.org/ov-met', label: 'Met.' } },
      targetCitation: 'Met. 2,2',
    },
  ],
});

const THESAURI = createThesauri({
  'related-text-types': [
    { id: 'q', value: 'quotation' },
    { id: 'a', value: 'allusion' },
  ],
});

async function setup(options: Partial<PartFeatureMocksOptions> = {}) {
  const mocks = createPartFeatureMocks({
    typeId: REFERENCED_TEXTS_PART_TYPEID,
    data: createEditedObject(PART, THESAURI),
    ...options,
  });
  const view = await render(ReferencedTextsPartFeatureComponent, {
    providers: [
      ...createPartEditorMocks().providers,
      ...createAssertedIdMocks(),
      ...mocks.providers,
    ],
    importOverrides: [
      { replace: CurrentItemBarComponent, with: CurrentItemBarStubComponent },
    ],
  });
  return { ...view, user: userEvent.setup(), mocks };
}

describe('ReferencedTextsPartFeatureComponent', () => {
  it('should load the part of the route with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: REFERENCED_TEXTS_PART_TYPEID,
        partId: TEST_PART_ID,
        roleId: undefined,
      },
      THESAURI_IDS,
    );
    expect(await screen.findByRole('cell', { name: 'Aeneis' })).toBeVisible();
    // the thesauri reach the editor too
    expect(screen.getByRole('cell', { name: 'quotation' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'allusion' })).toBeVisible();
  });

  it('should load a new part with its role', async () => {
    const { mocks } = await setup({ pid: 'new', rid: 'copy', data: null });

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: REFERENCED_TEXTS_PART_TYPEID,
        partId: null,
        roleId: 'copy',
      },
      THESAURI_IDS,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should report a loading error', async () => {
    const { mocks } = await setup({ loadError: new Error('load failed') });

    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith('load failed', 'OK'),
    );
  });

  it('should save the part edited by the user', async () => {
    const { user, mocks } = await setup();

    const down = await screen.findAllByRole('button', {
      description: 'Move this text down',
    });
    await user.click(down[0]);
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    const saved: ReferencedTextsPart =
      mocks.editorService.save.mock.calls[0][0];
    expect(saved.id).toBe(TEST_PART_ID);
    expect(saved.texts.map((t) => t.targetCitation)).toEqual([
      'Met. 2,2',
      'Aen. 1,1',
    ]);
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

    const down = await screen.findAllByRole('button', {
      description: 'Move this text down',
    });
    await user.click(down[0]);
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
