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
  RELATED_PERSONS_PART_TYPEID,
  RelatedPersonsPart,
} from '../related-persons-part';
import { RelatedPersonsPartFeatureComponent } from './related-persons-part-feature.component';

const THESAURI_IDS = [
  'related-person-types',
  'asserted-id-tags',
  'asserted-id-scopes',
  'assertion-tags',
  'doc-reference-types',
  'doc-reference-tags',
];

const PART = createPart<RelatedPersonsPart>(RELATED_PERSONS_PART_TYPEID, {
  persons: [
    { type: 't', name: 'Brunetto Latini' },
    { type: 'f', name: 'Guido Cavalcanti' },
  ],
});

const THESAURI = createThesauri({
  'related-person-types': [
    { id: 't', value: 'teacher' },
    { id: 'f', value: 'friend' },
  ],
});

async function setup(options: Partial<PartFeatureMocksOptions> = {}) {
  const mocks = createPartFeatureMocks({
    typeId: RELATED_PERSONS_PART_TYPEID,
    data: createEditedObject(PART, THESAURI),
    ...options,
  });
  const view = await render(RelatedPersonsPartFeatureComponent, {
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

describe('RelatedPersonsPartFeatureComponent', () => {
  it('should load the part of the route with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: RELATED_PERSONS_PART_TYPEID,
        partId: TEST_PART_ID,
        roleId: undefined,
      },
      THESAURI_IDS,
    );
    expect(
      await screen.findByRole('cell', { name: 'Brunetto Latini' }),
    ).toBeVisible();
    // the thesauri reach the editor too
    expect(screen.getByRole('cell', { name: 'teacher' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'friend' })).toBeVisible();
  });

  it('should load a new part with its role', async () => {
    const { mocks } = await setup({ pid: 'new', rid: 'copy', data: null });

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: RELATED_PERSONS_PART_TYPEID,
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
      description: 'Move this person down',
    });
    await user.click(down[0]);
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    const saved: RelatedPersonsPart =
      mocks.editorService.save.mock.calls[0][0];
    expect(saved.id).toBe(TEST_PART_ID);
    expect(saved.persons.map((p) => p.name)).toEqual([
      'Guido Cavalcanti',
      'Brunetto Latini',
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
      description: 'Move this person down',
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
