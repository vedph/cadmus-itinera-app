import { inputBinding, outputBinding, signal } from '@angular/core';
import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import {
  EditedObject,
  PartIdentity,
  ThesauriSet,
} from '@myrmidon/cadmus-core';

import {
  createAssertedIdMocks,
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createThesauri,
  PartEditorMocksOptions,
  TEST_ITEM_ID,
  TEST_PART_ID,
} from '../../../../../testing/part-testing';
import {
  RELATED_PERSONS_PART_TYPEID,
  RelatedPerson,
  RelatedPersonsPart,
} from '../related-persons-part';
import { RelatedPersonsPartComponent } from './related-persons-part.component';

const PERSONS: RelatedPerson[] = [
  {
    type: 't',
    name: 'Brunetto Latini',
    ids: [
      { target: { gid: 'http://viaf.org/viaf/1', label: 'Brunetto' } },
      { target: { gid: 'http://dbpedia.org/2', label: 'Brunetto' } },
    ],
  },
  { type: 'f', name: 'Guido Cavalcanti' },
  { type: 'f', name: 'Cino da Pistoia' },
];

const THESAURI = createThesauri({
  'related-person-types': [
    { id: 't', value: 'teacher' },
    { id: 'f', value: 'friend' },
  ],
});

function createData(
  persons: RelatedPerson[] = PERSONS,
  thesauri: ThesauriSet = THESAURI,
): EditedObject<RelatedPersonsPart> {
  return createEditedObject(
    createPart<RelatedPersonsPart>(RELATED_PERSONS_PART_TYPEID, { persons }),
    thesauri,
  );
}

async function setup(
  options: {
    data?: EditedObject<RelatedPersonsPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<RelatedPersonsPart> | undefined>(
    options.data,
  );
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  const view = await render(RelatedPersonsPartComponent, {
    providers: [...mocks.providers, ...createAssertedIdMocks()],
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

/**
 * The table rows of the persons, excluding the header. The person editor
 * may add other tables after the persons one, so this looks in the first.
 */
const personRows = () => {
  const table = screen.queryAllByRole('table')[0];
  return table ? within(table).getAllByRole('row').slice(1) : [];
};
const cellTexts = (column: number) =>
  personRows().map((row) =>
    within(row).getAllByRole('cell')[column].textContent?.trim(),
  );
/** The names of the persons listed in the table, in their order. */
const names = () => cellTexts(2);
const rowButton = (row: number, description: string) =>
  within(personRows()[row]).getByRole('button', { description });
const addButton = () => screen.getByRole('button', { name: 'person' });
const saveButton = () => screen.getByRole('button', { name: /save/ });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });
const nameInput = () => screen.findByRole('textbox', { name: 'name' });

describe('RelatedPersonsPartComponent', () => {
  it('should show an empty list which cannot be saved', async () => {
    await setup();

    expect(screen.getByText('Related Persons Part')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should list the persons of the bound part', async () => {
    await setup({ data: createData() });

    // type from its thesaurus
    expect(cellTexts(1)).toEqual(['teacher', 'friend', 'friend']);
    expect(names()).toEqual([
      'Brunetto Latini',
      'Guido Cavalcanti',
      'Cino da Pistoia',
    ]);
    // count of IDs
    expect(cellTexts(3)).toEqual(['2', '0', '0']);
    await waitFor(() => expect(saveButton()).toBeEnabled());
  });

  it('should list the type IDs without their thesaurus', async () => {
    await setup({ data: createData(PERSONS, {}) });

    expect(cellTexts(1)).toEqual(['t', 'f', 'f']);
  });

  it('should empty the list when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should not allow moving the first person up or the last down', async () => {
    await setup({ data: createData() });

    expect(rowButton(0, 'Move this person up')).toBeDisabled();
    expect(rowButton(2, 'Move this person down')).toBeDisabled();
  });

  it('should move a person up and down', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Move this person up'));
    expect(names()).toEqual([
      'Brunetto Latini',
      'Cino da Pistoia',
      'Guido Cavalcanti',
    ]);

    await user.click(rowButton(0, 'Move this person down'));
    expect(names()).toEqual([
      'Cino da Pistoia',
      'Brunetto Latini',
      'Guido Cavalcanti',
    ]);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should delete a person once confirmed', async () => {
    const { user, mocks } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Delete this person'));

    expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(names()).toEqual(['Brunetto Latini', 'Cino da Pistoia']);
  });

  it('should not delete a person when not confirmed', async () => {
    const { user } = await setup({
      data: createData(),
      mocks: { confirm: false },
    });

    await user.click(rowButton(1, 'Delete this person'));

    expect(names()).toHaveLength(3);
  });

  it('should not allow saving once all the persons are deleted', async () => {
    const { user } = await setup({ data: createData([PERSONS[1]]) });

    await user.click(rowButton(0, 'Delete this person'));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should edit a person and update the list on accept', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this person'));
    expect(screen.getByText('#2')).toBeInTheDocument();
    const name = await nameInput();
    expect(name).toHaveValue('Guido Cavalcanti');
    await user.clear(name);
    await user.type(name, 'Guido Guinizzelli');
    await user.click(acceptButton());

    expect(names()).toEqual([
      'Brunetto Latini',
      'Guido Guinizzelli',
      'Cino da Pistoia',
    ]);
    // the editor is closed
    expect(
      screen.queryByRole('textbox', { name: 'name' }),
    ).not.toBeInTheDocument();
    // accepting a person must not save the whole part
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should show the IDs of the edited person', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(0, 'Edit this person'));
    const ids = await screen.findByRole('group', { name: 'IDs' });

    expect(
      within(ids).getByRole('cell', { name: 'http://viaf.org/viaf/1' }),
    ).toBeInTheDocument();
    expect(
      within(ids).getByRole('cell', { name: 'http://dbpedia.org/2' }),
    ).toBeInTheDocument();
  });

  it('should leave the list unchanged when the person editor is discarded', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(0, 'Edit this person'));
    await user.type(await nameInput(), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(names()[0]).toBe('Brunetto Latini');
    expect(
      screen.queryByRole('textbox', { name: 'name' }),
    ).not.toBeInTheDocument();
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should add a new person of the first type and open it in the editor', async () => {
    const { user } = await setup({ data: createData([PERSONS[1]]) });

    await user.click(addButton());
    expect(screen.getByText('#2')).toBeInTheDocument();
    const type = await screen.findByRole('combobox', { name: 'type' });
    await waitFor(() => expect(type).toHaveTextContent('teacher'));
    const name = await nameInput();
    expect(name).toHaveValue('');
    await user.type(name, 'Brunetto Latini');
    await user.click(acceptButton());

    expect(names()).toEqual(['Guido Cavalcanti', 'Brunetto Latini']);
    expect(cellTexts(1)).toEqual(['friend', 'teacher']);
  });

  it('should add a new person with a free type without thesaurus', async () => {
    const { user } = await setup({ data: createData([PERSONS[1]], {}) });

    await user.click(addButton());
    await user.type(
      await screen.findByRole('textbox', { name: 'type' }),
      'patron',
    );
    await user.type(await nameInput(), 'Cangrande');
    await user.click(acceptButton());

    expect(names()).toEqual(['Guido Cavalcanti', 'Cangrande']);
    expect(cellTexts(1)).toEqual(['f', 'patron']);
  });

  it('should update the edited person after a person before it is deleted', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Edit this person'));
    const name = await nameInput();
    await user.click(rowButton(0, 'Delete this person'));
    expect(screen.getByText('#2')).toBeInTheDocument();
    await user.clear(name);
    await user.type(name, 'Cino');
    await user.click(acceptButton());

    expect(names()).toEqual(['Guido Cavalcanti', 'Cino']);
  });

  it('should update the edited person after it is moved', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this person'));
    const name = await nameInput();
    await user.click(rowButton(1, 'Move this person down'));
    expect(screen.getByText('#3')).toBeInTheDocument();
    await user.clear(name);
    await user.type(name, 'Guido');
    await user.click(acceptButton());

    expect(names()).toEqual(['Brunetto Latini', 'Cino da Pistoia', 'Guido']);
  });

  it('should update the edited person after another person takes its place', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this person'));
    const name = await nameInput();
    await user.click(rowButton(0, 'Move this person down'));
    expect(screen.getByText('#1')).toBeInTheDocument();
    await user.clear(name);
    await user.type(name, 'Guido');
    await user.click(acceptButton());

    expect(names()).toEqual(['Guido', 'Brunetto Latini', 'Cino da Pistoia']);
  });

  it('should close the person editor when its person is deleted', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this person'));
    await nameInput();
    await user.click(rowButton(1, 'Delete this person'));

    expect(names()).toEqual(['Brunetto Latini', 'Cino da Pistoia']);
    expect(
      screen.queryByRole('textbox', { name: 'name' }),
    ).not.toBeInTheDocument();
  });

  it('should drop the thesauri when the new data has none', async () => {
    const { user, data, fixture } = await setup({
      data: createData(PERSONS, {
        ...THESAURI,
        ...createThesauri({
          'asserted-id-tags': [{ id: 't', value: 'a tag' }],
          'asserted-id-scopes': [{ id: 's', value: 'a scope' }],
          'assertion-tags': [{ id: 'at', value: 'an assertion tag' }],
          'doc-reference-types': [{ id: 'book', value: 'book' }],
          'doc-reference-tags': [{ id: 'src', value: 'source' }],
        }),
      }),
    });

    data.set(createData(PERSONS, {}));
    await fixture.whenStable();
    await user.click(rowButton(1, 'Edit this person'));

    expect(await screen.findByRole('textbox', { name: 'type' })).toHaveValue(
      'f',
    );
  });

  it('should emit the edited part on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    await user.click(rowButton(0, 'Move this person down'));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value).toMatchObject({
      id: TEST_PART_ID,
      typeId: RELATED_PERSONS_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      persons: [PERSONS[1], PERSONS[0], PERSONS[2]],
    });
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('should emit a new part on save when no part was bound', async () => {
    const { user, dataChange } = await setup({
      identity: {
        itemId: TEST_ITEM_ID,
        typeId: RELATED_PERSONS_PART_TYPEID,
        partId: null,
        roleId: null,
      },
    });

    await user.click(addButton());
    await user.type(
      await screen.findByRole('textbox', { name: 'type' }),
      'friend',
    );
    await user.type(await nameInput(), 'Guido Cavalcanti');
    await user.click(acceptButton());
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const part: RelatedPersonsPart = dataChange.mock.calls[0][0].value;
    expect(part).toMatchObject({
      id: '',
      typeId: RELATED_PERSONS_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      persons: [{ type: 'friend', name: 'Guido Cavalcanti' }],
    });
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
