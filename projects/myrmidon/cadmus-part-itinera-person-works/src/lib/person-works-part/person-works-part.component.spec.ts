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
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createThesauri,
  PartEditorMocksOptions,
  TEST_ITEM_ID,
  TEST_PART_ID,
} from '../../../../../testing/part-testing';
import {
  PERSON_WORKS_PART_TYPEID,
  PersonWork,
  PersonWorksPart,
} from '../person-works-part';
import { PersonWorksPartComponent } from './person-works-part.component';

const WORKS: PersonWork[] = [
  { eid: 'commedia', title: 'Commedia' },
  { title: 'Convivio' },
  { eid: 'vita-nova', title: 'Vita nova', assertion: { rank: 2 } },
];

function createData(
  works: PersonWork[] = WORKS,
  thesauri: ThesauriSet = {},
): EditedObject<PersonWorksPart> {
  return createEditedObject(
    createPart<PersonWorksPart>(PERSON_WORKS_PART_TYPEID, { works }),
    thesauri,
  );
}

async function setup(
  options: {
    data?: EditedObject<PersonWorksPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<PersonWorksPart> | undefined>(options.data);
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  const view = await render(PersonWorksPartComponent, {
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

/** The table rows of the works, excluding the header. */
const workRows = () => screen.queryAllByRole('row').slice(1);
/** The titles of the works listed in the table, in their order. */
const titles = () =>
  workRows().map((row) => within(row).getAllByRole('cell')[1].textContent);
const rowButton = (row: number, description: string) =>
  within(workRows()[row]).getByRole('button', { description });
const addButton = () => screen.getByRole('button', { name: /work/ });
const saveButton = () => screen.getByRole('button', { name: /save/ });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });

describe('PersonWorksPartComponent', () => {
  it('should show an empty list which cannot be saved', async () => {
    await setup();

    expect(screen.getByText('Works Part')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('title')).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should list the works of the bound part', async () => {
    await setup({ data: createData() });

    expect(titles()).toEqual(['Commedia', 'Convivio', 'Vita nova']);
    const cells = within(workRows()[2]).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('vita-nova');
    await waitFor(() => expect(saveButton()).toBeEnabled());
  });

  it('should update the list when another part is bound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(createData([WORKS[1]]));
    await fixture.whenStable();

    expect(titles()).toEqual(['Convivio']);
  });

  it('should empty the list when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should not allow moving the first work up or the last down', async () => {
    await setup({ data: createData() });

    expect(rowButton(0, 'Move this work up')).toBeDisabled();
    expect(rowButton(0, 'Move this work down')).toBeEnabled();
    expect(rowButton(2, 'Move this work up')).toBeEnabled();
    expect(rowButton(2, 'Move this work down')).toBeDisabled();
  });

  it('should move a work up and down', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Move this work up'));
    expect(titles()).toEqual(['Commedia', 'Vita nova', 'Convivio']);

    await user.click(rowButton(0, 'Move this work down'));
    expect(titles()).toEqual(['Vita nova', 'Commedia', 'Convivio']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should delete a work once confirmed', async () => {
    const { user, mocks, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Delete this work'));

    expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(titles()).toEqual(['Commedia', 'Vita nova']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should not delete a work when not confirmed', async () => {
    const { user, dirtyChange } = await setup({
      data: createData(),
      mocks: { confirm: false },
    });

    await user.click(rowButton(1, 'Delete this work'));

    expect(titles()).toEqual(['Commedia', 'Convivio', 'Vita nova']);
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should not allow saving once all the works are deleted', async () => {
    const { user } = await setup({ data: createData([WORKS[0]]) });

    await user.click(rowButton(0, 'Delete this work'));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should edit a work and update the list on accept', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this work'));
    expect(screen.getByText('#2')).toBeInTheDocument();
    const title = await screen.findByLabelText('title');
    expect(title).toHaveValue('Convivio');
    await user.clear(title);
    await user.type(title, 'Il Convivio');
    await user.click(acceptButton());

    expect(titles()).toEqual(['Commedia', 'Il Convivio', 'Vita nova']);
    // the editor is closed
    expect(screen.queryByLabelText('title')).not.toBeInTheDocument();
    // accepting a work must not save the whole part
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should leave the list unchanged when the work editor is discarded', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(0, 'Edit this work'));
    await user.type(await screen.findByLabelText('title'), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(titles()).toEqual(['Commedia', 'Convivio', 'Vita nova']);
    expect(screen.queryByLabelText('title')).not.toBeInTheDocument();
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should add a new work and open it in the editor', async () => {
    const { user } = await setup({ data: createData([WORKS[0]]) });

    await user.click(addButton());
    expect(screen.getByText('#2')).toBeInTheDocument();
    const title = await screen.findByLabelText('title');
    expect(title).toHaveValue('');
    await user.type(title, 'Monarchia');
    await user.type(screen.getByLabelText('EID'), 'monarchia');
    await user.click(acceptButton());

    expect(titles()).toEqual(['Commedia', 'Monarchia']);
    expect(within(workRows()[1]).getAllByRole('cell')[2]).toHaveTextContent(
      'monarchia',
    );
  });

  it('should update the edited work after a work before it is deleted', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Edit this work'));
    const title = await screen.findByLabelText('title');
    await user.click(rowButton(0, 'Delete this work'));
    expect(screen.getByText('#2')).toBeInTheDocument();
    await user.clear(title);
    await user.type(title, 'Vita nuova');
    await user.click(acceptButton());

    expect(titles()).toEqual(['Convivio', 'Vita nuova']);
  });

  it('should update the edited work after it is moved', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this work'));
    const title = await screen.findByLabelText('title');
    await user.click(rowButton(1, 'Move this work down'));
    expect(screen.getByText('#3')).toBeInTheDocument();
    await user.clear(title);
    await user.type(title, 'Il Convivio');
    await user.click(acceptButton());

    expect(titles()).toEqual(['Commedia', 'Vita nova', 'Il Convivio']);
  });

  it('should update the edited work after another work takes its place', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this work'));
    const title = await screen.findByLabelText('title');
    await user.click(rowButton(2, 'Move this work up'));
    await user.clear(title);
    await user.type(title, 'Il Convivio');
    await user.click(acceptButton());

    expect(titles()).toEqual(['Commedia', 'Vita nova', 'Il Convivio']);
  });

  it('should close the work editor when its work is deleted', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this work'));
    await screen.findByLabelText('title');
    await user.click(rowButton(1, 'Delete this work'));

    expect(titles()).toEqual(['Commedia', 'Vita nova']);
    expect(screen.queryByLabelText('title')).not.toBeInTheDocument();
  });

  it('should offer the thesaurus assertion tags in the work editor', async () => {
    const { user } = await setup({
      data: createData(
        WORKS,
        createThesauri({
          'assertion-tags': [{ id: 'd', value: 'dubious' }],
          'doc-reference-types': [{ id: 'book', value: 'book' }],
          'doc-reference-tags': [{ id: 'src', value: 'source' }],
        }),
      ),
    });

    await user.click(rowButton(2, 'Edit this work'));

    expect(
      await screen.findByRole('combobox', { name: 'tag' }),
    ).toBeInTheDocument();
  });

  it('should drop the thesauri when the new data has none', async () => {
    const { user, data, fixture } = await setup({
      data: createData(
        WORKS,
        createThesauri({ 'assertion-tags': [{ id: 'd', value: 'dubious' }] }),
      ),
    });

    data.set(createData());
    await fixture.whenStable();
    await user.click(rowButton(2, 'Edit this work'));

    expect(
      await screen.findByRole('textbox', { name: 'tag' }),
    ).toBeInTheDocument();
  });

  it('should emit the edited part on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    await user.click(rowButton(0, 'Move this work down'));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value).toMatchObject({
      id: TEST_PART_ID,
      typeId: PERSON_WORKS_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      works: [WORKS[1], WORKS[0], WORKS[2]],
    });
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('should emit a new part on save when no part was bound', async () => {
    const { user, dataChange } = await setup({
      identity: {
        itemId: TEST_ITEM_ID,
        typeId: PERSON_WORKS_PART_TYPEID,
        partId: null,
        roleId: null,
      },
    });

    await user.click(addButton());
    await user.type(await screen.findByLabelText('title'), 'Commedia');
    await user.click(acceptButton());
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const part: PersonWorksPart = dataChange.mock.calls[0][0].value;
    expect(part).toMatchObject({
      id: '',
      typeId: PERSON_WORKS_PART_TYPEID,
      itemId: TEST_ITEM_ID,
    });
    expect(part.works).toHaveLength(1);
    expect(part.works[0].title).toBe('Commedia');
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
