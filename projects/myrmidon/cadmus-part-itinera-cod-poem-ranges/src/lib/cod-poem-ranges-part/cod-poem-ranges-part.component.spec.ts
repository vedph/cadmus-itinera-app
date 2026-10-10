import { inputBinding, outputBinding, signal } from '@angular/core';
import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/angular/zoneless';
import userEvent, { UserEvent } from '@testing-library/user-event';

import {
  EditedObject,
  Part,
  PartIdentity,
  ThesauriSet,
} from '@myrmidon/cadmus-core';

import {
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createThesauri,
  PartEditorMocksOptions,
  TEST_ITEM_ID,
} from '../../../../../testing/part-testing';
import {
  COD_POEM_RANGES_PART_TYPEID,
  CodPoemRangesPart,
} from '../cod-poem-ranges-part';
import { CodPoemRangesPartComponent } from './cod-poem-ranges-part.component';

type PartProps = Omit<CodPoemRangesPart, keyof Part>;

const PROPS: PartProps = {
  sortType: 'author',
  ranges: [{ a: '1', b: '3' }, { a: '5' }, { a: '7', b: '9' }],
  layouts: [{ range: { a: '1', b: '2' }, layout: 'x' }],
  tag: 'draft',
  note: 'a note',
};

function createData(
  props: Partial<PartProps> = PROPS,
  thesauri: ThesauriSet = {},
): EditedObject<CodPoemRangesPart> {
  return createEditedObject(
    createPart<CodPoemRangesPart>(COD_POEM_RANGES_PART_TYPEID, {
      sortType: '',
      ...props,
    }),
    thesauri,
  );
}

async function setup(
  options: {
    data?: EditedObject<CodPoemRangesPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<CodPoemRangesPart> | undefined>(
    options.data,
  );
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  const view = await render(CodPoemRangesPartComponent, {
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

/** The table rows of the ranges, excluding the header. */
const rangeRows = () => screen.queryAllByRole('row').slice(1);
/** The ranges listed in the table, in their order. */
const ranges = () =>
  rangeRows().map((row) => within(row).getAllByRole('cell')[1].textContent);
const rowButton = (row: number, description: string) =>
  within(rangeRows()[row]).getByRole('button', { description });
const saveButton = () => screen.getByRole('button', { name: /save/ });
const addButton = () =>
  screen.getByRole('button', { description: 'Add ranges' });
const deleteAllButton = () =>
  screen.getByRole('button', { description: 'Delete all ranges' });

async function openTab(user: UserEvent, name: string): Promise<void> {
  await user.click(screen.getByRole('tab', { name }));
}

/** The poems listed in the layouts tab: number followed by layout. */
const poems = () =>
  screen
    .getAllByRole('button', { description: 'Check this layout' })
    .map((b) =>
      Array.from(
        b
          .closest('cadmus-cod-poem-ranges-layout')!
          .querySelectorAll('span'),
      )
        .map((s) => s.textContent?.trim())
        .filter((s) => s)
        .join(' '),
    );

describe('CodPoemRangesPartComponent', () => {
  it('should show an empty editor which cannot be saved', async () => {
    await setup();

    expect(screen.getByText('Poem Ranges Part')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'type' })).toHaveValue('');
    expect(ranges()).toEqual([]);
    expect(addButton()).toBeDisabled();
    expect(deleteAllButton()).toBeDisabled();
    // type is required
    expect(saveButton()).toBeDisabled();
  });

  it('should show the bound part', async () => {
    const { user } = await setup({ data: createData() });

    expect(screen.getByRole('textbox', { name: 'type' })).toHaveValue('author');
    expect(ranges()).toEqual(['1-3', '5', '7-9']);

    await openTab(user, 'layouts');
    expect(await screen.findByText('9')).toBeInTheDocument();
    expect(poems()).toEqual(['1 x', '2 x', '3', '5', '7', '8', '9']);

    await openTab(user, 'note');
    expect(await screen.findByLabelText('tag')).toHaveValue('draft');
    expect(screen.getByRole('textbox', { name: 'note' })).toHaveValue('a note');
  });

  it('should allow saving a valid bound part', async () => {
    await setup({ data: createData() });

    await waitFor(() => expect(saveButton()).toBeEnabled());
  });

  it('should reset the editor when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(screen.getByRole('textbox', { name: 'type' })).toHaveValue('');
    expect(ranges()).toEqual([]);
  });

  it('should require the type', async () => {
    const { user } = await setup({ data: createData() });

    await user.clear(screen.getByRole('textbox', { name: 'type' }));
    await user.tab();

    expect(screen.getByText('type required')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should reject a type longer than 50 characters', async () => {
    const { user } = await setup({ data: createData() });

    const type = screen.getByRole('textbox', { name: 'type' });
    await user.clear(type);
    await user.type(type, 'x'.repeat(51));
    await user.tab();

    expect(screen.getByText('type too long')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should pick type and tag from their thesauri when available', async () => {
    const { user, dataChange } = await setup({
      data: createData(
        { ...PROPS, sortType: 'a', tag: 't1' },
        createThesauri({
          'cod-poem-range-sort-types': [
            { id: 'a', value: 'by author' },
            { id: 'm', value: 'by metre' },
          ],
          'cod-poem-range-tags': [
            { id: 't1', value: 'first tag' },
            { id: 't2', value: 'second tag' },
          ],
        }),
      ),
    });

    const type = screen.getByRole('combobox', { name: 'type' });
    await waitFor(() => expect(type).toHaveTextContent('by author'));
    await user.click(type);
    await user.click(await screen.findByRole('option', { name: 'by metre' }));

    await openTab(user, 'note');
    const tag = await screen.findByRole('combobox', { name: 'tag' });
    await waitFor(() => expect(tag).toHaveTextContent('first tag'));
    await user.click(tag);
    await user.click(await screen.findByRole('option', { name: 'second tag' }));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value).toMatchObject({
      sortType: 'm',
      tag: 't2',
    });
  });

  it('should default the type to the first thesaurus entry', async () => {
    await setup({
      data: createData(
        { ...PROPS, sortType: '' },
        createThesauri({
          'cod-poem-range-sort-types': [
            { id: 'a', value: 'by author' },
            { id: 'm', value: 'by metre' },
          ],
        }),
      ),
    });

    const type = screen.getByRole('combobox', { name: 'type' });
    await waitFor(() => expect(type).toHaveTextContent('by author'));
  });

  it('should drop the thesauri when the new data has none', async () => {
    const { data, fixture } = await setup({
      data: createData(
        PROPS,
        createThesauri({
          'cod-poem-range-sort-types': [{ id: 'a', value: 'by author' }],
          'cod-poem-range-layouts': [{ id: 'c1', value: 'one column' }],
          'cod-poem-range-tags': [{ id: 't1', value: 'first tag' }],
        }),
      ),
    });
    expect(screen.getByRole('combobox', { name: 'type' })).toBeInTheDocument();

    data.set(createData());
    await fixture.whenStable();

    expect(screen.getByRole('textbox', { name: 'type' })).toHaveValue('author');
  });

  it('should add the typed ranges with enter', async () => {
    const { user, dirtyChange, dataChange } = await setup({
      data: createData(),
    });

    const adder = screen.getByRole('textbox', { name: 'ranges' });
    await user.type(adder, '12-14 20{Enter}');

    expect(ranges()).toEqual(['1-3', '5', '7-9', '12-14', '20']);
    expect(adder).toHaveValue('');
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
    // adding ranges must not save the whole part
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should add the typed ranges with the add button', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.type(screen.getByRole('textbox', { name: 'ranges' }), '12');
    await user.click(addButton());

    expect(ranges()).toEqual(['1-3', '5', '7-9', '12']);
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should keep accepting ranges after adding some', async () => {
    const { user } = await setup({ data: createData({ sortType: 'author' }) });

    const adder = screen.getByRole('textbox', { name: 'ranges' });
    await user.type(adder, '1-3{Enter}');
    await user.type(adder, '7');
    expect(addButton()).toBeEnabled();
    await user.click(addButton());
    await user.type(adder, '9');
    expect(addButton()).toBeEnabled();
    await user.click(addButton());

    expect(ranges()).toEqual(['1-3', '7', '9']);
  });

  it('should move a range up and down', async () => {
    const { user } = await setup({ data: createData() });

    expect(rowButton(0, 'Move this range up')).toBeDisabled();
    expect(rowButton(2, 'Move this range down')).toBeDisabled();

    await user.click(rowButton(2, 'Move this range up'));
    expect(ranges()).toEqual(['1-3', '7-9', '5']);

    await user.click(rowButton(0, 'Move this range down'));
    expect(ranges()).toEqual(['7-9', '1-3', '5']);
  });

  it('should delete a range', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Delete this range'));

    expect(ranges()).toEqual(['1-3', '7-9']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should delete all the ranges once confirmed', async () => {
    const { user, mocks } = await setup({ data: createData() });

    await user.click(deleteAllButton());

    expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(ranges()).toEqual([]);
    expect(deleteAllButton()).toBeDisabled();
  });

  it('should not delete all the ranges when not confirmed', async () => {
    const { user, mocks } = await setup({
      data: createData(),
      mocks: { confirm: false },
    });

    await user.click(deleteAllButton());

    expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(ranges()).toEqual(['1-3', '5', '7-9']);
  });

  it('should list the poems of the edited ranges in the layouts tab', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Delete this range'));
    await user.type(
      screen.getByRole('textbox', { name: 'ranges' }),
      '11-12{Enter}',
    );
    await openTab(user, 'layouts');

    expect(await screen.findByText('12')).toBeInTheDocument();
    expect(poems()).toEqual(['1 x', '2 x', '3', '5', '11', '12']);
  });

  it('should save the layouts applied in the layouts tab', async () => {
    const { user, mocks, dataChange } = await setup({ data: createData() });

    await openTab(user, 'layouts');
    await user.click(
      await screen.findByRole('button', { description: 'Select all' }),
    );
    await user.type(screen.getByLabelText('layout'), 'y{Enter}');
    // applying a layout to the rows must not save the whole part
    expect(dataChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /apply/ }));

    expect(mocks.snackbar.open).toHaveBeenCalledWith(
      'Layout applied',
      'OK',
      expect.anything(),
    );
    expect(dataChange).not.toHaveBeenCalled();

    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value.layouts).toEqual([
      { range: { a: '1', b: '3' }, layout: 'y' },
      { range: { a: '5' }, layout: 'y' },
      { range: { a: '7', b: '9' }, layout: 'y' },
    ]);
  });

  it('should pick layouts from their thesaurus when available', async () => {
    const { user } = await setup({
      data: createData(
        PROPS,
        createThesauri({
          'cod-poem-range-layouts': [{ id: 'c1', value: 'one column' }],
        }),
      ),
    });

    await openTab(user, 'layouts');

    expect(
      await screen.findByRole('combobox', { name: 'layout' }),
    ).toBeInTheDocument();
  });

  it('should reject too long tag and note', async () => {
    const { user } = await setup({ data: createData() });

    await openTab(user, 'note');
    const tag = await screen.findByLabelText('tag');
    await user.clear(tag);
    await user.type(tag, 'x'.repeat(51));
    await user.click(screen.getByRole('textbox', { name: 'note' }));
    await user.paste('x'.repeat(1001));
    await user.tab();

    expect(screen.getByText('tag too long')).toBeInTheDocument();
    expect(screen.getByText('note too long')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should emit the edited part on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    const type = screen.getByRole('textbox', { name: 'type' });
    await user.clear(type);
    await user.type(type, 'metre');
    await user.click(rowButton(1, 'Delete this range'));
    await openTab(user, 'note');
    const tag = await screen.findByLabelText('tag');
    await user.clear(tag);
    await user.type(tag, '  final  ');
    const note = screen.getByRole('textbox', { name: 'note' });
    await user.clear(note);
    await user.type(note, '  new note  ');
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value).toMatchObject({
      typeId: COD_POEM_RANGES_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      sortType: 'metre',
      ranges: [{ a: '1', b: '3' }, { a: '7', b: '9' }],
      layouts: PROPS.layouts,
      tag: 'final',
      note: 'new note',
    });
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('should emit a new part without empty properties', async () => {
    const { user, dataChange } = await setup({
      identity: {
        itemId: TEST_ITEM_ID,
        typeId: COD_POEM_RANGES_PART_TYPEID,
        partId: null,
        roleId: null,
      },
    });

    await user.type(screen.getByRole('textbox', { name: 'type' }), 'author');
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const part: CodPoemRangesPart = dataChange.mock.calls[0][0].value;
    expect(part).toMatchObject({
      id: '',
      typeId: COD_POEM_RANGES_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      sortType: 'author',
    });
    expect(part.ranges).toBeUndefined();
    expect(part.layouts).toBeUndefined();
    expect(part.tag).toBeFalsy();
    expect(part.note).toBeFalsy();
  });

  it('should request to close', async () => {
    const { user, editorClose } = await setup({ data: createData() });

    await user.click(screen.getByRole('button', { name: /close/ }));

    expect(editorClose).toHaveBeenCalledTimes(1);
  });

  it('should not offer saving to a visitor', async () => {
    await setup({ data: createData(), mocks: { roles: ['visitor'] } });

    expect(
      screen.queryByRole('button', { name: /save/ }),
    ).not.toBeInTheDocument();
  });
});
