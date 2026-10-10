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
import { COD_LOCI_PART_TYPEID, CodLociPart } from '../cod-loci-part';
import { CodLociPartFeatureComponent } from './cod-loci-part-feature.component';

const PART = createPart<CodLociPart>(COD_LOCI_PART_TYPEID, {
  loci: [
    {
      citation: 'If. 1,1',
      range: { start: { n: 1, v: false }, end: { n: 1, v: true } },
      text: 'Nel mezzo del cammin',
    },
    {
      citation: 'Pg. 1,1',
      range: { start: { n: 20, v: false }, end: { n: 20, v: false } },
      text: 'Per correr miglior acque',
    },
  ],
});

async function setup(options: Partial<PartFeatureMocksOptions> = {}) {
  const mocks = createPartFeatureMocks({
    typeId: COD_LOCI_PART_TYPEID,
    data: createEditedObject(PART),
    ...options,
  });
  const view = await render(CodLociPartFeatureComponent, {
    providers: [...createPartEditorMocks().providers, ...mocks.providers],
    importOverrides: [
      { replace: CurrentItemBarComponent, with: CurrentItemBarStubComponent },
    ],
  });
  return { ...view, user: userEvent.setup(), mocks };
}

describe('CodLociPartFeatureComponent', () => {
  it('should load the part of the route with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: COD_LOCI_PART_TYPEID,
        partId: TEST_PART_ID,
        roleId: undefined,
      },
      ['cod-loci', 'cod-image-types'],
    );
    expect(await screen.findByRole('cell', { name: 'If. 1,1' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Pg. 1,1' })).toBeVisible();
  });

  it('should load a new part with its role', async () => {
    const { mocks } = await setup({ pid: 'new', rid: 'copy', data: null });

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: COD_LOCI_PART_TYPEID,
        partId: null,
        roleId: 'copy',
      },
      ['cod-loci', 'cod-image-types'],
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
      description: 'Move this locus down',
    });
    await user.click(down[0]);
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    const saved: CodLociPart = mocks.editorService.save.mock.calls[0][0];
    expect(saved.id).toBe(TEST_PART_ID);
    expect(saved.loci.map((l) => l.citation)).toEqual(['Pg. 1,1', 'If. 1,1']);
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
      description: 'Move this locus down',
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
