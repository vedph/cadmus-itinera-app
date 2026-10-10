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
import { WITNESSES_PART_TYPEID, WitnessesPart } from '../witnesses-part';
import { WitnessesPartFeatureComponent } from './witnesses-part-feature.component';

const PART = createPart<WitnessesPart>(WITNESSES_PART_TYPEID, {
  witnesses: [
    {
      id: 'A',
      ranges: [{ start: { n: 1, v: false }, end: { n: 2, v: true } }],
    },
    {
      id: 'B',
      ranges: [{ start: { n: 10, v: false }, end: { n: 10, v: false } }],
    },
  ],
});

async function setup(options: Partial<PartFeatureMocksOptions> = {}) {
  const mocks = createPartFeatureMocks({
    typeId: WITNESSES_PART_TYPEID,
    data: createEditedObject(PART),
    ...options,
  });
  const view = await render(WitnessesPartFeatureComponent, {
    providers: [...createPartEditorMocks().providers, ...mocks.providers],
    importOverrides: [
      { replace: CurrentItemBarComponent, with: CurrentItemBarStubComponent },
    ],
  });
  return { ...view, user: userEvent.setup(), mocks };
}

describe('WitnessesPartFeatureComponent', () => {
  it('should load the part of the route without thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: WITNESSES_PART_TYPEID,
        partId: TEST_PART_ID,
        roleId: undefined,
      },
      [],
    );
    expect(await screen.findByRole('cell', { name: '1r-2v' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '10r' })).toBeVisible();
  });

  it('should load a new part with its role', async () => {
    const { mocks } = await setup({ pid: 'new', rid: 'copy', data: null });

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: WITNESSES_PART_TYPEID,
        partId: null,
        roleId: 'copy',
      },
      [],
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
      description: 'Move this witness down',
    });
    await user.click(down[0]);
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    const saved: WitnessesPart = mocks.editorService.save.mock.calls[0][0];
    expect(saved.id).toBe(TEST_PART_ID);
    expect(saved.witnesses.map((w) => w.id)).toEqual(['B', 'A']);
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
      description: 'Move this witness down',
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
