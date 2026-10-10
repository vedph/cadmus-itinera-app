import { inputBinding, outputBinding, signal } from '@angular/core';
import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { EditedObject, PartIdentity } from '@myrmidon/cadmus-core';

import {
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createThesauri,
  PartEditorMocksOptions,
  TEST_ITEM_ID,
} from '../../../../../testing/part-testing';
import { COD_LOCI_PART_TYPEID, CodLociPart, CodLocus } from '../cod-loci-part';
import { CodLociPartComponent } from './cod-loci-part.component';

const LOCI: CodLocus[] = [
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
  {
    citation: 'Pd. 1,1',
    range: { start: { n: 40, v: true }, end: { n: 41, v: false } },
    text: 'La gloria di colui',
  },
];

function createData(
  loci: CodLocus[] = LOCI,
  thesauri = {},
): EditedObject<CodLociPart> {
  return createEditedObject(
    createPart<CodLociPart>(COD_LOCI_PART_TYPEID, { loci }),
    thesauri,
  );
}

async function setup(
  options: {
    data?: EditedObject<CodLociPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<CodLociPart> | undefined>(options.data);
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  const view = await render(CodLociPartComponent, {
    providers: mocks.providers,
    bindings: [
      inputBinding('data', data),
      inputBinding('identity', () => options.identity),
      outputBinding('dataChange', dataChange),
      outputBinding('editorClose', editorClose),
      outputBinding('dirtyChange', dirtyChange),
    ],
  });
  return {
    ...view,
    user: userEvent.setup(),
    mocks,
    data,
    dataChange,
    editorClose,
    dirtyChange,
  };
}

/** The table rows of the loci, excluding the header. */
const lociRows = () => screen.queryAllByRole('row').slice(1);
/** The citations of the loci listed in the table, in their order. */
const citations = () =>
  lociRows().map((row) => within(row).getAllByRole('cell')[1].textContent);
const rowButton = (row: number, description: string) =>
  within(lociRows()[row]).getByRole('button', { description });
const saveButton = () => screen.getByRole('button', { name: /save/ });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });

describe('CodLociPartComponent', () => {
  it('should show an empty list which cannot be saved', async () => {
    await setup();

    expect(screen.getByText('Loci Part')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should list the loci of the bound part', async () => {
    await setup({ data: createData() });

    expect(citations()).toEqual(['If. 1,1', 'Pg. 1,1', 'Pd. 1,1']);
    const cells = within(lociRows()[2]).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('40v-41r');
    // valid: it can be saved
    expect(saveButton()).toBeEnabled();
  });

  it('should update the list when another part is bound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(createData([LOCI[1]]));
    await fixture.whenStable();

    expect(citations()).toEqual(['Pg. 1,1']);
  });

  it('should empty the list when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should not allow moving the first locus up or the last down', async () => {
    await setup({ data: createData() });

    expect(rowButton(0, 'Move this locus up')).toBeDisabled();
    expect(rowButton(0, 'Move this locus down')).toBeEnabled();
    expect(rowButton(2, 'Move this locus up')).toBeEnabled();
    expect(rowButton(2, 'Move this locus down')).toBeDisabled();
  });

  it('should move a locus up', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Move this locus up'));

    expect(citations()).toEqual(['If. 1,1', 'Pd. 1,1', 'Pg. 1,1']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should move a locus down', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(0, 'Move this locus down'));

    expect(citations()).toEqual(['Pg. 1,1', 'If. 1,1', 'Pd. 1,1']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should delete a locus once confirmed', async () => {
    const { user, mocks, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Delete this locus'));

    expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(citations()).toEqual(['If. 1,1', 'Pd. 1,1']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should not delete a locus when not confirmed', async () => {
    const { user, mocks, dirtyChange } = await setup({
      data: createData(),
      mocks: { confirm: false },
    });

    await user.click(rowButton(1, 'Delete this locus'));

    expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(citations()).toEqual(['If. 1,1', 'Pg. 1,1', 'Pd. 1,1']);
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should not allow saving once all the loci are deleted', async () => {
    const { user } = await setup({ data: createData([LOCI[0]]) });

    await user.click(rowButton(0, 'Delete this locus'));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should edit a locus and update the list on accept', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this locus'));
    // the editor opens in its own tab
    const citation = await screen.findByLabelText('citation');
    expect(citation).toHaveValue('Pg. 1,1');
    expect(screen.getByRole('tab', { name: 'locus' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.clear(citation);
    await user.type(citation, 'Pg. 2,2');
    await user.click(acceptButton());

    // the editor is closed and the list is back
    await waitFor(() =>
      expect(citations()).toEqual(['If. 1,1', 'Pg. 2,2', 'Pd. 1,1']),
    );
    expect(screen.queryByRole('tab', { name: 'locus' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('citation')).not.toBeInTheDocument();
    // accepting a locus must not save the whole part
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should leave the list unchanged when the locus editor is discarded', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(0, 'Edit this locus'));
    const citation = await screen.findByLabelText('citation');
    await user.type(citation, ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    await waitFor(() =>
      expect(citations()).toEqual(['If. 1,1', 'Pg. 1,1', 'Pd. 1,1']),
    );
    expect(screen.queryByRole('tab', { name: 'locus' })).not.toBeInTheDocument();
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should add a new locus and open it in the editor', async () => {
    const { user } = await setup({ data: createData([LOCI[0]]) });

    await user.click(screen.getByRole('button', { name: /locus/ }));
    const citation = await screen.findByLabelText('citation');
    expect(citation).toHaveValue('');
    await user.type(citation, 'Pg. 9,9');
    const location = screen.getByLabelText('location');
    await user.clear(location);
    await user.type(location, '30r');
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());

    await waitFor(() => expect(citations()).toEqual(['If. 1,1', 'Pg. 9,9']));
    expect(within(lociRows()[1]).getAllByRole('cell')[2]).toHaveTextContent(
      '30r',
    );
  });

  it('should offer the thesaurus citations in the locus editor', async () => {
    const { user } = await setup({
      data: createData(
        [{ ...LOCI[0], citation: 'if' }],
        createThesauri({
          'cod-loci': [
            { id: 'if', value: 'Inferno' },
            { id: 'pg', value: 'Purgatorio' },
          ],
          'cod-image-types': [{ id: 'dtl', value: 'detail' }],
        }),
      ),
    });

    await user.click(rowButton(0, 'Edit this locus'));
    const citation = await screen.findByRole('combobox', { name: 'citation' });
    await waitFor(() => expect(citation).toHaveTextContent('Inferno'));

    // image types come from their thesaurus too
    await user.click(screen.getByRole('button', { name: /image/ }));
    expect(
      await screen.findByRole('combobox', { name: 'type' }),
    ).toBeInTheDocument();
  });

  it('should drop the thesauri when the new data has none', async () => {
    const { user, data, fixture } = await setup({
      data: createData(
        LOCI,
        createThesauri({ 'cod-loci': [{ id: 'if', value: 'Inferno' }] }),
      ),
    });

    data.set(createData());
    await fixture.whenStable();
    await user.click(rowButton(0, 'Edit this locus'));

    // free text rather than a selection
    expect(await screen.findByRole('textbox', { name: 'citation' })).toHaveValue(
      'If. 1,1',
    );
  });

  it('should emit the edited part on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    await user.click(rowButton(0, 'Move this locus down'));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const saved: EditedObject<CodLociPart> = dataChange.mock.calls[0][0];
    expect(saved.value).toMatchObject({
      typeId: COD_LOCI_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      loci: [LOCI[1], LOCI[0], LOCI[2]],
    });
    // no more dirty once saved
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('should emit a new part on save when no part was bound', async () => {
    const { user, dataChange } = await setup({
      identity: {
        itemId: TEST_ITEM_ID,
        typeId: COD_LOCI_PART_TYPEID,
        partId: null,
        roleId: null,
      },
    });

    await user.click(screen.getByRole('button', { name: /locus/ }));
    await user.type(await screen.findByLabelText('citation'), 'If. 1,1');
    const location = screen.getByLabelText('location');
    await user.clear(location);
    await user.type(location, '1r');
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());
    await waitFor(() => expect(citations()).toEqual(['If. 1,1']));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const saved: EditedObject<CodLociPart> = dataChange.mock.calls[0][0];
    expect(saved.value).toMatchObject({
      id: '',
      typeId: COD_LOCI_PART_TYPEID,
      itemId: TEST_ITEM_ID,
    });
    expect(saved.value!.loci).toHaveLength(1);
    expect(saved.value!.loci[0]).toMatchObject({ citation: 'If. 1,1' });
  });

  it('should request to close', async () => {
    const { user, editorClose, dataChange } = await setup({
      data: createData(),
    });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalledTimes(1);
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should not offer saving to a visitor', async () => {
    await setup({ data: createData(), mocks: { roles: ['visitor'] } });

    expect(screen.queryByRole('button', { name: /save/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/ })).toBeInTheDocument();
  });

  it('should not offer saving when no user is logged in', async () => {
    await setup({ data: createData(), mocks: { roles: [] } });

    expect(screen.queryByRole('button', { name: /save/ })).not.toBeInTheDocument();
  });
});
