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
  PartEditorMocksOptions,
  TEST_ITEM_ID,
  TEST_PART_ID,
} from '../../../../../testing/part-testing';
import {
  Witness,
  WITNESSES_PART_TYPEID,
  WitnessesPart,
} from '../witnesses-part';
import { WitnessesPartComponent } from './witnesses-part.component';

const WITNESSES: Witness[] = [
  {
    id: 'A',
    ranges: [{ start: { n: 1, v: false }, end: { n: 2, v: true } }],
  },
  {
    id: 'B',
    ranges: [
      { start: { n: 10, v: false }, end: { n: 10, v: false } },
      { start: { n: 12, v: true }, end: { n: 13, v: false } },
    ],
  },
  {
    id: 'C',
    ranges: [{ start: { n: 30, v: true }, end: { n: 30, v: true } }],
  },
];

function createData(
  witnesses: Witness[] = WITNESSES,
): EditedObject<WitnessesPart> {
  return createEditedObject(
    createPart<WitnessesPart>(WITNESSES_PART_TYPEID, { witnesses }),
  );
}

async function setup(
  options: {
    data?: EditedObject<WitnessesPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<WitnessesPart> | undefined>(options.data);
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  const view = await render(WitnessesPartComponent, {
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

/** The table rows of the witnesses, excluding the header. */
const witnessRows = () => screen.queryAllByRole('row').slice(1);
const cellTexts = (column: number) =>
  witnessRows().map((row) =>
    within(row).getAllByRole('cell')[column].textContent?.trim(),
  );
/** The IDs of the witnesses listed in the table, in their order. */
const ids = () => cellTexts(1);
const rowButton = (row: number, description: string) =>
  within(witnessRows()[row]).getByRole('button', { description });
const addButton = () => screen.getByRole('button', { name: 'witness' });
const saveButton = () => screen.getByRole('button', { name: /save/ });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });
const idInput = () => screen.findByRole('textbox', { name: 'ID' });

describe('WitnessesPartComponent', () => {
  it('should show an empty list which cannot be saved', async () => {
    await setup();

    expect(screen.getByText('Witnesses Part')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'ID' }),
    ).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should list the witnesses of the bound part', async () => {
    await setup({ data: createData() });

    expect(ids()).toEqual(['A', 'B', 'C']);
    expect(cellTexts(2)).toEqual(['1r-2v', '10r 12v-13r', '30v']);
    await waitFor(() => expect(saveButton()).toBeEnabled());
  });

  it('should update the list when another part is bound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(createData([WITNESSES[2]]));
    await fixture.whenStable();

    expect(ids()).toEqual(['C']);
  });

  it('should empty the list when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should not allow moving the first witness up or the last down', async () => {
    await setup({ data: createData() });

    expect(rowButton(0, 'Move this witness up')).toBeDisabled();
    expect(rowButton(0, 'Move this witness down')).toBeEnabled();
    expect(rowButton(2, 'Move this witness up')).toBeEnabled();
    expect(rowButton(2, 'Move this witness down')).toBeDisabled();
  });

  it('should move a witness up and down', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Move this witness up'));
    expect(ids()).toEqual(['A', 'C', 'B']);

    await user.click(rowButton(0, 'Move this witness down'));
    expect(ids()).toEqual(['C', 'A', 'B']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should delete a witness once confirmed', async () => {
    const { user, mocks, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Delete this witness'));

    expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(ids()).toEqual(['A', 'C']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should not delete a witness when not confirmed', async () => {
    const { user, dirtyChange } = await setup({
      data: createData(),
      mocks: { confirm: false },
    });

    await user.click(rowButton(1, 'Delete this witness'));

    expect(ids()).toEqual(['A', 'B', 'C']);
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should not allow saving once all the witnesses are deleted', async () => {
    const { user } = await setup({ data: createData([WITNESSES[0]]) });

    await user.click(rowButton(0, 'Delete this witness'));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should edit a witness and update the list on accept', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this witness'));
    const id = await idInput();
    expect(id).toHaveValue('B');
    expect(screen.getByLabelText('location')).toHaveValue('10r 12v-13r');
    await user.clear(id);
    await user.type(id, 'B2');
    await user.click(acceptButton());

    expect(ids()).toEqual(['A', 'B2', 'C']);
    // the editor is closed
    expect(
      screen.queryByRole('textbox', { name: 'ID' }),
    ).not.toBeInTheDocument();
    // accepting a witness must not save the whole part
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should leave the list unchanged when the witness editor is discarded', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(0, 'Edit this witness'));
    await user.type(await idInput(), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(ids()).toEqual(['A', 'B', 'C']);
    expect(
      screen.queryByRole('textbox', { name: 'ID' }),
    ).not.toBeInTheDocument();
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should add a new witness and open it in the editor', async () => {
    const { user } = await setup({ data: createData([WITNESSES[0]]) });

    await user.click(addButton());
    const id = await idInput();
    expect(id).toHaveValue('');
    await user.type(id, 'D');
    await user.type(screen.getByLabelText('location'), '40r-41v');
    // the location is emitted with a delay
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());

    expect(ids()).toEqual(['A', 'D']);
    expect(cellTexts(2)).toEqual(['1r-2v', '40r-41v']);
  });

  it('should update the edited witness after a witness before it is deleted', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Edit this witness'));
    const id = await idInput();
    await user.click(rowButton(0, 'Delete this witness'));
    await user.clear(id);
    await user.type(id, 'C2');
    await user.click(acceptButton());

    expect(ids()).toEqual(['B', 'C2']);
  });

  it('should update the edited witness after it is moved', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this witness'));
    const id = await idInput();
    await user.click(rowButton(1, 'Move this witness up'));
    await user.clear(id);
    await user.type(id, 'B2');
    await user.click(acceptButton());

    expect(ids()).toEqual(['B2', 'A', 'C']);
  });

  it('should update the edited witness after another witness takes its place', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this witness'));
    const id = await idInput();
    await user.click(rowButton(2, 'Move this witness up'));
    await user.clear(id);
    await user.type(id, 'B2');
    await user.click(acceptButton());

    expect(ids()).toEqual(['A', 'C', 'B2']);
  });

  it('should close the witness editor when its witness is deleted', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this witness'));
    await idInput();
    await user.click(rowButton(1, 'Delete this witness'));

    expect(ids()).toEqual(['A', 'C']);
    expect(
      screen.queryByRole('textbox', { name: 'ID' }),
    ).not.toBeInTheDocument();
  });

  it('should emit the edited part on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    await user.click(rowButton(0, 'Move this witness down'));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value).toMatchObject({
      id: TEST_PART_ID,
      typeId: WITNESSES_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      witnesses: [WITNESSES[1], WITNESSES[0], WITNESSES[2]],
    });
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('should emit a new part on save when no part was bound', async () => {
    const { user, dataChange } = await setup({
      identity: {
        itemId: TEST_ITEM_ID,
        typeId: WITNESSES_PART_TYPEID,
        partId: null,
        roleId: null,
      },
    });

    await user.click(addButton());
    await user.type(await idInput(), 'A');
    await user.type(screen.getByLabelText('location'), '1r');
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const part: WitnessesPart = dataChange.mock.calls[0][0].value;
    expect(part).toMatchObject({
      id: '',
      typeId: WITNESSES_PART_TYPEID,
      itemId: TEST_ITEM_ID,
    });
    expect(part.witnesses).toHaveLength(1);
    expect(part.witnesses[0].id).toBe('A');
    expect(part.witnesses[0].ranges[0].start).toMatchObject({ n: 1, v: false });
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

    expect(
      screen.queryByRole('button', { name: /save/ }),
    ).not.toBeInTheDocument();
  });
});
