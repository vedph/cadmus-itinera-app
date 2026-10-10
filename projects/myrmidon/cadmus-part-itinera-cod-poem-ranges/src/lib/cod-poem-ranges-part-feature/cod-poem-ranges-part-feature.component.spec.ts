import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import {
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createPartFeatureMocks,
  CurrentItemBarStubComponent,
  PartFeatureMocksOptions,
  TEST_ITEM_ID,
  TEST_PART_ID,
} from '../../../../../testing/part-testing';
import {
  COD_POEM_RANGES_PART_TYPEID,
  CodPoemRangesPart,
} from '../cod-poem-ranges-part';
import { CodPoemRangesPartFeatureComponent } from './cod-poem-ranges-part-feature.component';

const THESAURI_IDS = [
  'cod-poem-range-sort-types',
  'cod-poem-range-layouts',
  'cod-poem-range-tags',
];

const PART = createPart<CodPoemRangesPart>(COD_POEM_RANGES_PART_TYPEID, {
  sortType: 'author',
  ranges: [{ a: '1', b: '3' }, { a: '5' }],
});

async function setup(options: Partial<PartFeatureMocksOptions> = {}) {
  const mocks = createPartFeatureMocks({
    typeId: COD_POEM_RANGES_PART_TYPEID,
    data: createEditedObject(PART),
    ...options,
  });
  const view = await render(CodPoemRangesPartFeatureComponent, {
    providers: [...createPartEditorMocks().providers, ...mocks.providers],
    importOverrides: [
      { replace: CurrentItemBarComponent, with: CurrentItemBarStubComponent },
    ],
  });
  return { ...view, user: userEvent.setup(), mocks };
}

describe('CodPoemRangesPartFeatureComponent', () => {
  it('should load the part of the route with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: COD_POEM_RANGES_PART_TYPEID,
        partId: TEST_PART_ID,
        roleId: undefined,
      },
      THESAURI_IDS,
    );
    expect(await screen.findByRole('cell', { name: '1-3' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'type' })).toHaveValue('author');
  });

  it('should load a new part with its role', async () => {
    const { mocks } = await setup({ pid: 'new', rid: 'copy', data: null });

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: COD_POEM_RANGES_PART_TYPEID,
        partId: null,
        roleId: 'copy',
      },
      THESAURI_IDS,
    );
  });

  it('should report a loading error', async () => {
    const { mocks } = await setup({ loadError: new Error('load failed') });

    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith('load failed', 'OK'),
    );
  });

  it('should save the part edited by the user', async () => {
    const { user, mocks } = await setup();

    await screen.findByRole('cell', { name: '1-3' });
    await user.type(
      screen.getByRole('textbox', { name: 'ranges' }),
      '7{Enter}',
    );
    // adding ranges must not save the part
    expect(mocks.editorService.save).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    const saved: CodPoemRangesPart = mocks.editorService.save.mock.calls[0][0];
    expect(saved.id).toBe(TEST_PART_ID);
    expect(saved.ranges).toEqual([{ a: '1', b: '3' }, { a: '5' }, { a: '7', b: '7' }]);
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

    await screen.findByRole('cell', { name: '1-3' });
    await user.type(
      screen.getByRole('textbox', { name: 'ranges' }),
      '7{Enter}',
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
