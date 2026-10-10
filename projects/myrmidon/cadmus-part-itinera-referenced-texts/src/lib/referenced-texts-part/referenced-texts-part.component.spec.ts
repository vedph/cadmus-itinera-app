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
  REFERENCED_TEXTS_PART_TYPEID,
  ReferencedText,
  ReferencedTextsPart,
} from '../referenced-texts-part';
import { ReferencedTextsPartComponent } from './referenced-texts-part.component';

const TEXTS: ReferencedText[] = [
  {
    type: 'q',
    targetId: { target: { gid: 'http://x.org/verg-aen', label: 'Aeneis' } },
    targetCitation: 'Aen. 1,1',
  },
  {
    type: 'a',
    targetId: { target: { gid: 'http://x.org/ov-met', label: 'Metamorphoses' } },
    targetCitation: 'Met. 2,2',
  },
  {
    type: 'q',
    // no label: the GID is all we have
    targetId: { target: { gid: 'http://x.org/luc-phars', label: '' } },
    targetCitation: 'Phars. 3,3',
  },
];

const THESAURI = createThesauri({
  'related-text-types': [
    { id: 'q', value: 'quotation' },
    { id: 'a', value: 'allusion' },
  ],
});

function createData(
  texts: ReferencedText[] = TEXTS,
  thesauri: ThesauriSet = THESAURI,
): EditedObject<ReferencedTextsPart> {
  return createEditedObject(
    createPart<ReferencedTextsPart>(REFERENCED_TEXTS_PART_TYPEID, { texts }),
    thesauri,
  );
}

async function setup(
  options: {
    data?: EditedObject<ReferencedTextsPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<ReferencedTextsPart> | undefined>(
    options.data,
  );
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  const view = await render(ReferencedTextsPartComponent, {
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

/** The table rows of the texts, excluding the header. */
const textRows = () => screen.queryAllByRole('row').slice(1);
const cellTexts = (column: number) =>
  textRows().map((row) =>
    within(row).getAllByRole('cell')[column].textContent?.trim(),
  );
/** The target citations of the texts listed in the table, in their order. */
const citations = () => cellTexts(3);
const rowButton = (row: number, description: string) =>
  within(textRows()[row]).getByRole('button', { description });
const addButton = () => screen.getByRole('button', { name: 'text' });
const saveButton = () => screen.getByRole('button', { name: /save/ });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });
const targetCitation = () => screen.findByLabelText('target citation');

describe('ReferencedTextsPartComponent', () => {
  it('should show an empty list which cannot be saved', async () => {
    await setup();

    expect(screen.getByText('Referenced Texts Part')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should list the texts of the bound part', async () => {
    await setup({ data: createData() });

    // type from its thesaurus
    expect(cellTexts(1)).toEqual(['quotation', 'allusion', 'quotation']);
    // the label of the target, or its GID when there is no label
    expect(cellTexts(2)).toEqual([
      'Aeneis',
      'Metamorphoses',
      'http://x.org/luc-phars',
    ]);
    expect(citations()).toEqual(['Aen. 1,1', 'Met. 2,2', 'Phars. 3,3']);
    await waitFor(() => expect(saveButton()).toBeEnabled());
  });

  it('should list the type IDs without their thesaurus', async () => {
    await setup({ data: createData(TEXTS, {}) });

    expect(cellTexts(1)).toEqual(['q', 'a', 'q']);
  });

  it('should empty the list when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should not allow moving the first text up or the last down', async () => {
    await setup({ data: createData() });

    expect(rowButton(0, 'Move this text up')).toBeDisabled();
    expect(rowButton(2, 'Move this text down')).toBeDisabled();
  });

  it('should move a text up and down', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Move this text up'));
    expect(citations()).toEqual(['Aen. 1,1', 'Phars. 3,3', 'Met. 2,2']);

    await user.click(rowButton(0, 'Move this text down'));
    expect(citations()).toEqual(['Phars. 3,3', 'Aen. 1,1', 'Met. 2,2']);
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should delete a text once confirmed', async () => {
    const { user, mocks } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Delete this text'));

    expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(citations()).toEqual(['Aen. 1,1', 'Phars. 3,3']);
  });

  it('should not delete a text when not confirmed', async () => {
    const { user } = await setup({
      data: createData(),
      mocks: { confirm: false },
    });

    await user.click(rowButton(1, 'Delete this text'));

    expect(citations()).toEqual(['Aen. 1,1', 'Met. 2,2', 'Phars. 3,3']);
  });

  it('should not allow saving once all the texts are deleted', async () => {
    const { user } = await setup({ data: createData([TEXTS[0]]) });

    await user.click(rowButton(0, 'Delete this text'));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should edit a text and update the list on accept', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this text'));
    expect(screen.getByText('text #2')).toBeInTheDocument();
    const citation = await targetCitation();
    expect(citation).toHaveValue('Met. 2,2');
    await user.clear(citation);
    await user.type(citation, 'Met. 9,9');
    await user.click(acceptButton());

    expect(citations()).toEqual(['Aen. 1,1', 'Met. 9,9', 'Phars. 3,3']);
    // the editor is closed
    expect(screen.queryByLabelText('target citation')).not.toBeInTheDocument();
    // accepting a text must not save the whole part
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should leave the list unchanged when the text editor is discarded', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.click(rowButton(0, 'Edit this text'));
    await user.type(await targetCitation(), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(citations()).toEqual(['Aen. 1,1', 'Met. 2,2', 'Phars. 3,3']);
    expect(screen.queryByLabelText('target citation')).not.toBeInTheDocument();
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should open a new text of the first type, without adding it yet', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(addButton());

    const type = await screen.findByRole('combobox', { name: 'type' });
    await waitFor(() => expect(type).toHaveTextContent('quotation'));
    expect(await targetCitation()).toHaveValue('');
    // nothing is added until accepted, and a text without target cannot be
    expect(citations()).toEqual(['Aen. 1,1', 'Met. 2,2', 'Phars. 3,3']);
    expect(acceptButton()).toBeDisabled();
  });

  it('should add a new text once it gets a target', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.click(addButton());
    await user.type(await targetCitation(), 'Theb. 1,1');
    // set an external target in the ID editor
    const target = screen.getByRole('group', { name: 'target ID' });
    await user.click(within(target).getByRole('button', { name: 'target' }));
    await user.type(
      await within(target).findByRole('textbox', { name: 'GID' }),
      'http://x.org/stat-theb',
    );
    await user.type(
      within(target).getByRole('textbox', { name: 'label' }),
      'Thebais',
    );
    // once the panel is open there are two buttons named target: its
    // header, and the button confirming the target which follows it
    const targetButtons = within(target).getAllByRole('button', {
      name: 'target',
    });
    await user.click(targetButtons[targetButtons.length - 1]);
    // the ID is emitted with a delay
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());

    expect(citations()).toEqual([
      'Aen. 1,1',
      'Met. 2,2',
      'Phars. 3,3',
      'Theb. 1,1',
    ]);
    expect(cellTexts(2)[3]).toBe('Thebais');
    expect(cellTexts(1)[3]).toBe('quotation');
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should not add the new text when its editor is discarded', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(addButton());
    await user.type(await targetCitation(), 'Theb. 1,1');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(citations()).toEqual(['Aen. 1,1', 'Met. 2,2', 'Phars. 3,3']);
  });

  it('should update the edited text after a text before it is deleted', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(2, 'Edit this text'));
    const citation = await targetCitation();
    await user.click(rowButton(0, 'Delete this text'));
    expect(screen.getByText('text #2')).toBeInTheDocument();
    await user.clear(citation);
    await user.type(citation, 'Phars. 9,9');
    await user.click(acceptButton());

    expect(citations()).toEqual(['Met. 2,2', 'Phars. 9,9']);
  });

  it('should update the edited text after it is moved', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this text'));
    const citation = await targetCitation();
    await user.click(rowButton(1, 'Move this text up'));
    expect(screen.getByText('text #1')).toBeInTheDocument();
    await user.clear(citation);
    await user.type(citation, 'Met. 9,9');
    await user.click(acceptButton());

    expect(citations()).toEqual(['Met. 9,9', 'Aen. 1,1', 'Phars. 3,3']);
  });

  it('should update the edited text after another text takes its place', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this text'));
    const citation = await targetCitation();
    await user.click(rowButton(1, 'Move this text down'));
    await user.click(rowButton(1, 'Move this text down'));
    await user.clear(citation);
    await user.type(citation, 'Met. 9,9');
    await user.click(acceptButton());

    // the edited text went down, then the one which took its place did
    expect(citations()).toEqual(['Aen. 1,1', 'Met. 9,9', 'Phars. 3,3']);
  });

  it('should close the text editor when its text is deleted', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(rowButton(1, 'Edit this text'));
    await targetCitation();
    await user.click(rowButton(1, 'Delete this text'));

    expect(citations()).toEqual(['Aen. 1,1', 'Phars. 3,3']);
    expect(screen.queryByLabelText('target citation')).not.toBeInTheDocument();
  });

  it('should pass the thesauri to the text editor', async () => {
    const { user } = await setup({
      data: createData(TEXTS, {
        ...THESAURI,
        ...createThesauri({
          'asserted-id-scopes': [{ id: 's', value: 'a scope' }],
          'asserted-id-tags': [{ id: 't', value: 'a tag' }],
          'assertion-tags': [{ id: 'at', value: 'an assertion tag' }],
          'doc-reference-types': [{ id: 'book', value: 'book' }],
          'doc-reference-tags': [{ id: 'src', value: 'source' }],
        }),
      }),
    });

    await user.click(rowButton(0, 'Edit this text'));
    const target = await screen.findByRole('group', { name: 'target ID' });

    expect(
      within(target).getByRole('combobox', { name: 'scope' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'type' }),
    ).toBeInTheDocument();
  });

  it('should drop the thesauri when the new data has none', async () => {
    const { user, data, fixture } = await setup({ data: createData() });

    data.set(createData(TEXTS, {}));
    await fixture.whenStable();
    await user.click(rowButton(0, 'Edit this text'));

    expect(await screen.findByRole('textbox', { name: 'type' })).toHaveValue(
      'q',
    );
  });

  it('should emit the edited part on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    await user.click(rowButton(0, 'Move this text down'));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value).toMatchObject({
      id: TEST_PART_ID,
      typeId: REFERENCED_TEXTS_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      texts: [TEXTS[1], TEXTS[0], TEXTS[2]],
    });
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
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
