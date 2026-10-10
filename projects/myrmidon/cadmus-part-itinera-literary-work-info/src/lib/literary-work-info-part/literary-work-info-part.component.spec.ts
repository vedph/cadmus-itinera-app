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
  LITERARY_WORK_INFO_PART_TYPEID,
  LiteraryWorkInfoPart,
} from '../literary-work-info-part';
import { LiteraryWorkInfoPartComponent } from './literary-work-info-part.component';

type PartProps = Omit<LiteraryWorkInfoPart, keyof Part>;

const PROPS: PartProps = {
  languages: ['lat'],
  genre: 'epic',
  metres: ['hex'],
  strophes: ['abab', 'cdcd'],
  isLost: true,
  authorIds: [{ target: { gid: 'http://viaf.org/viaf/1', label: 'Vergilius' } }],
  titles: [
    { language: 'lat', value: 'Aeneis' },
    { language: 'ita', value: 'Eneide' },
    { language: 'eng', value: 'Aeneid' },
  ],
  note: 'a note',
};

const THESAURI = createThesauri({
  'literary-work-languages': [
    { id: 'lat', value: 'Latin' },
    { id: 'ita', value: 'Italian' },
  ],
  'literary-work-metres': [
    { id: 'hex', value: 'hexameter' },
    { id: 'ele', value: 'elegiac couplet' },
  ],
});

function createData(
  props: Partial<PartProps> = PROPS,
  thesauri: ThesauriSet = THESAURI,
): EditedObject<LiteraryWorkInfoPart> {
  return createEditedObject(
    createPart<LiteraryWorkInfoPart>(LITERARY_WORK_INFO_PART_TYPEID, {
      languages: [],
      genre: '',
      titles: [],
      ...props,
    }),
    thesauri,
  );
}

async function setup(
  options: {
    data?: EditedObject<LiteraryWorkInfoPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<LiteraryWorkInfoPart> | undefined>(
    options.data,
  );
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  const view = await render(LiteraryWorkInfoPartComponent, {
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

const titlesGroup = () => screen.getByRole('group', { name: 'titles' });
/** The table rows of the titles, excluding the header. */
const titleRows = () =>
  within(titlesGroup())
    .queryAllByRole('row')
    .slice(1);
/** The titles listed in the table as "language value", in their order. */
const titles = () =>
  titleRows().map((row) => {
    const cells = within(row).getAllByRole('cell');
    return `${cells[1].textContent} ${cells[2].textContent}`;
  });
const titleButton = (row: number, description: string) =>
  within(titleRows()[row]).getByRole('button', { description });
const saveButton = () => screen.getByRole('button', { name: /save/ });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });
const savedPart = (dataChange: ReturnType<typeof vi.fn>) =>
  dataChange.mock.calls[0][0].value as LiteraryWorkInfoPart;

async function openTab(user: UserEvent, name: string): Promise<void> {
  await user.click(screen.getByRole('tab', { name }));
}

describe('LiteraryWorkInfoPartComponent', () => {
  it('should show an empty editor which cannot be saved', async () => {
    await setup();

    expect(screen.getByText('Literary Work Part')).toBeInTheDocument();
    expect(titleRows()).toEqual([]);
    expect(screen.getByRole('checkbox', { name: 'lost' })).not.toBeChecked();
    expect(screen.getByLabelText('note')).toHaveValue('');
    // languages, genre and titles are required
    expect(saveButton()).toBeDisabled();
  });

  it('should show the bound part', async () => {
    const { user } = await setup({ data: createData() });

    // general
    expect(titles()).toEqual(['lat Aeneis', 'ita Eneide', 'eng Aeneid']);
    expect(screen.getByRole('cell', { name: 'Vergilius' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'lost' })).toBeChecked();
    expect(screen.getByLabelText('note')).toHaveValue('a note');

    // languages and genre
    await openTab(user, 'lang./note');
    expect(await screen.findByRole('checkbox', { name: 'Latin' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Italian' })).not.toBeChecked();
    expect(screen.getByRole('textbox', { name: 'genre' })).toHaveValue('epic');

    // poetry
    await openTab(user, 'poetry');
    expect(
      await screen.findByRole('checkbox', { name: 'hexameter' }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'elegiac couplet' }),
    ).not.toBeChecked();
    expect(screen.getByLabelText('strophes')).toHaveValue('abab\ncdcd');
  });

  it('should allow saving a valid bound part', async () => {
    await setup({ data: createData() });

    await waitFor(() => expect(saveButton()).toBeEnabled());
  });

  it('should reset the editor when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(titleRows()).toEqual([]);
    expect(screen.getByRole('checkbox', { name: 'lost' })).not.toBeChecked();
    expect(screen.getByLabelText('note')).toHaveValue('');
  });

  describe('titles', () => {
    it('should not allow moving the first title up or the last down', async () => {
      await setup({ data: createData() });

      expect(titleButton(0, 'Move this title up')).toBeDisabled();
      expect(titleButton(2, 'Move this title down')).toBeDisabled();
    });

    it('should move a title up and down', async () => {
      const { user, dirtyChange } = await setup({ data: createData() });

      await user.click(titleButton(2, 'Move this title up'));
      expect(titles()).toEqual(['lat Aeneis', 'eng Aeneid', 'ita Eneide']);

      await user.click(titleButton(0, 'Move this title down'));
      expect(titles()).toEqual(['eng Aeneid', 'lat Aeneis', 'ita Eneide']);
      expect(dirtyChange).toHaveBeenLastCalledWith(true);
    });

    it('should delete a title once confirmed', async () => {
      const { user, mocks } = await setup({ data: createData() });

      await user.click(titleButton(1, 'Delete this title'));

      expect(mocks.dialogService.confirm).toHaveBeenCalledTimes(1);
      expect(titles()).toEqual(['lat Aeneis', 'eng Aeneid']);
    });

    it('should not delete a title when not confirmed', async () => {
      const { user } = await setup({
        data: createData(),
        mocks: { confirm: false },
      });

      await user.click(titleButton(1, 'Delete this title'));

      expect(titles()).toEqual(['lat Aeneis', 'ita Eneide', 'eng Aeneid']);
    });

    it('should not allow saving once all the titles are deleted', async () => {
      const { user } = await setup({
        data: createData({ ...PROPS, titles: [PROPS.titles[0]] }),
      });

      await user.click(titleButton(0, 'Delete this title'));

      expect(titleRows()).toEqual([]);
      await waitFor(() => expect(saveButton()).toBeDisabled());
    });

    it('should edit a title and update the list on accept', async () => {
      const { user, dataChange } = await setup({ data: createData() });

      await user.click(titleButton(1, 'Edit this title'));
      const title = await screen.findByLabelText('title');
      expect(title).toHaveValue('Eneide');
      await user.clear(title);
      await user.type(title, "L'Eneide");
      await user.click(acceptButton());

      expect(titles()).toEqual(['lat Aeneis', "ita L'Eneide", 'eng Aeneid']);
      // accepting a title must not save the whole part
      expect(dataChange).not.toHaveBeenCalled();
    });

    it('should leave the list unchanged when the title editor is discarded', async () => {
      const { user } = await setup({ data: createData() });

      await user.click(titleButton(1, 'Edit this title'));
      await user.type(await screen.findByLabelText('title'), ' changed');
      await user.click(
        screen.getByRole('button', { description: 'Discard changes' }),
      );

      expect(titles()).toEqual(['lat Aeneis', 'ita Eneide', 'eng Aeneid']);
    });

    it('should add a title in the first language of the thesaurus', async () => {
      const { user } = await setup({ data: createData() });

      await user.click(
        within(titlesGroup()).getByRole('button', { name: /title/ }),
      );
      const language = await screen.findByRole('combobox', {
        name: 'language',
      });
      await waitFor(() => expect(language).toHaveTextContent('Latin'));
      await user.type(screen.getByLabelText('title'), 'Liber Aeneidos');
      await user.click(acceptButton());

      expect(titles()).toEqual([
        'lat Aeneis',
        'ita Eneide',
        'eng Aeneid',
        'lat Liber Aeneidos',
      ]);
    });

    it('should add a title with a free language without thesaurus', async () => {
      const { user } = await setup({ data: createData(PROPS, {}) });

      await user.click(
        within(titlesGroup()).getByRole('button', { name: /title/ }),
      );
      await user.type(
        await screen.findByRole('textbox', { name: 'language' }),
        'fra',
      );
      await user.type(screen.getByLabelText('title'), 'Énéide');
      await user.click(acceptButton());

      expect(titles()).toEqual([
        'lat Aeneis',
        'ita Eneide',
        'eng Aeneid',
        'fra Énéide',
      ]);
    });

    it('should update the edited title after a title before it is deleted', async () => {
      const { user } = await setup({ data: createData() });

      await user.click(titleButton(2, 'Edit this title'));
      const title = await screen.findByLabelText('title');
      await user.click(titleButton(0, 'Delete this title'));
      await user.clear(title);
      await user.type(title, 'The Aeneid');
      await user.click(acceptButton());

      expect(titles()).toEqual(['ita Eneide', 'eng The Aeneid']);
    });

    it('should update the edited title after it is moved', async () => {
      const { user } = await setup({ data: createData() });

      await user.click(titleButton(1, 'Edit this title'));
      const title = await screen.findByLabelText('title');
      await user.click(titleButton(1, 'Move this title up'));
      await user.clear(title);
      await user.type(title, "L'Eneide");
      await user.click(acceptButton());

      expect(titles()).toEqual(["ita L'Eneide", 'lat Aeneis', 'eng Aeneid']);
    });

    it('should update the edited title after another title takes its place', async () => {
      const { user } = await setup({ data: createData() });

      await user.click(titleButton(1, 'Edit this title'));
      const title = await screen.findByLabelText('title');
      await user.click(titleButton(0, 'Move this title down'));
      await user.clear(title);
      await user.type(title, "L'Eneide");
      await user.click(acceptButton());

      expect(titles()).toEqual(["ita L'Eneide", 'lat Aeneis', 'eng Aeneid']);
    });

    it('should close the title editor when its title is deleted', async () => {
      const { user } = await setup({ data: createData() });

      await user.click(titleButton(1, 'Edit this title'));
      await screen.findByLabelText('title');
      await user.click(titleButton(1, 'Delete this title'));

      expect(titles()).toEqual(['lat Aeneis', 'eng Aeneid']);
      // the editor is collapsed, so it is no more accessible
      await waitFor(() =>
        expect(
          screen.queryByRole('button', { description: 'Accept changes' }),
        ).not.toBeInTheDocument(),
      );
    });
  });

  it('should save the languages checked by the user', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await openTab(user, 'lang./note');
    await user.click(await screen.findByRole('checkbox', { name: 'Italian' }));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(savedPart(dataChange).languages).toEqual(['lat', 'ita']);
  });

  it('should not allow saving without languages', async () => {
    const { user } = await setup({ data: createData() });

    await openTab(user, 'lang./note');
    await user.click(await screen.findByRole('checkbox', { name: 'Latin' }));

    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should require the genre', async () => {
    const { user } = await setup({ data: createData() });

    await openTab(user, 'lang./note');
    await user.clear(await screen.findByRole('textbox', { name: 'genre' }));
    await user.tab();

    expect(screen.getByText('genre required')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should reject a genre longer than 100 characters', async () => {
    const { user } = await setup({ data: createData() });

    await openTab(user, 'lang./note');
    const genre = await screen.findByRole('textbox', { name: 'genre' });
    await user.clear(genre);
    await user.click(genre);
    await user.paste('x'.repeat(101));
    await user.tab();

    expect(screen.getByText('genre too long')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should show the genre picked from its thesaurus', async () => {
    const { user } = await setup({
      data: createData(
        { ...PROPS, genre: 'poetry.epic' },
        {
          ...THESAURI,
          ...createThesauri({
            'literary-work-genres': [
              { id: 'poetry', value: 'poetry' },
              { id: 'poetry.epic', value: 'poetry: epic' },
              { id: 'poetry.lyric', value: 'poetry: lyric' },
              { id: 'prose', value: 'prose' },
            ],
          }),
        },
      ),
    });

    await openTab(user, 'lang./note');

    expect(await screen.findByText('poetry: epic')).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'genre' }),
    ).not.toBeInTheDocument();
  });

  it('should save the genre picked from its thesaurus', async () => {
    const { user, dataChange } = await setup({
      data: createData(
        { ...PROPS, genre: 'poetry' },
        {
          ...THESAURI,
          ...createThesauri({
            'literary-work-genres': [
              { id: 'poetry', value: 'poetry' },
              { id: 'prose', value: 'prose' },
            ],
          }),
        },
      ),
    });

    await openTab(user, 'lang./note');
    const genre = await screen.findByRole('group', { name: 'genre' });
    // the tree brick has no accessible names: the pick button of a node
    // is the last one in the container of that node
    const node = (await within(genre).findByText(/-\s+prose/)).closest(
      'pdb-browser-tree-node',
    )!.parentElement!;
    const buttons = within(node).getAllByRole('button');
    await user.click(buttons[buttons.length - 1]);

    expect(within(genre).getByText('prose')).toBeInTheDocument();
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(savedPart(dataChange).genre).toBe('prose');
  });

  it('should save the metres checked by the user', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await openTab(user, 'poetry');
    await user.click(
      await screen.findByRole('checkbox', { name: 'elegiac couplet' }),
    );
    await user.click(screen.getByRole('checkbox', { name: 'hexameter' }));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(savedPart(dataChange).metres).toEqual(['ele']);
  });

  it('should not offer metres without their thesaurus', async () => {
    const { user } = await setup({ data: createData(PROPS, {}) });

    await openTab(user, 'poetry');

    expect(await screen.findByLabelText('strophes')).toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'metre(s)' }),
    ).not.toBeInTheDocument();
  });

  it('should save a strophe per line, without blanks and duplicates', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await openTab(user, 'poetry');
    const strophes = await screen.findByLabelText('strophes');
    await user.clear(strophes);
    await user.type(strophes, '  abab  {Enter}{Enter}cdcd{Enter}abab{Enter} ');
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(savedPart(dataChange).strophes).toEqual(['abab', 'cdcd']);
  });

  it('should save the lost flag and note edited by the user', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.click(screen.getByRole('checkbox', { name: 'lost' }));
    const note = screen.getByLabelText('note');
    await user.clear(note);
    await user.type(note, '  another note  ');
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(savedPart(dataChange).isLost).toBeUndefined();
    expect(savedPart(dataChange).note).toBe('another note');
  });

  it('should reject a note longer than 1000 characters', async () => {
    const { user } = await setup({ data: createData() });

    const note = screen.getByLabelText('note');
    await user.click(note);
    await user.paste('x'.repeat(1001));
    await user.tab();

    expect(screen.getByText('note too long')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should save without the authors deleted by the user', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    // the buttons of the IDs brick have no accessible name: the last one
    // in the row of an ID deletes it
    const authorButtons = within(
      screen.getByRole('group', { name: 'author(s)' }),
    ).getAllByRole('button');
    await user.click(authorButtons[authorButtons.length - 1]);
    await waitFor(() =>
      expect(
        screen.queryByRole('cell', { name: 'Vergilius' }),
      ).not.toBeInTheDocument(),
    );
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(savedPart(dataChange).authorIds).toBeUndefined();
  });

  it('should emit the unchanged part on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    await user.click(titleButton(0, 'Move this title down'));
    await user.click(titleButton(1, 'Move this title up'));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(savedPart(dataChange)).toMatchObject({
      typeId: LITERARY_WORK_INFO_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      ...PROPS,
    });
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('should emit a new part without empty properties', async () => {
    const { user, dataChange, data, fixture } = await setup({
      identity: {
        itemId: TEST_ITEM_ID,
        typeId: LITERARY_WORK_INFO_PART_TYPEID,
        partId: null,
        roleId: null,
      },
    });
    // a new part comes with thesauri only
    data.set(createEditedObject<LiteraryWorkInfoPart>(null, THESAURI));
    await fixture.whenStable();

    await user.click(
      within(titlesGroup()).getByRole('button', { name: /title/ }),
    );
    await user.type(await screen.findByLabelText('title'), 'Aeneis');
    await user.click(acceptButton());
    await openTab(user, 'lang./note');
    await user.click(await screen.findByRole('checkbox', { name: 'Latin' }));
    await user.type(screen.getByRole('textbox', { name: 'genre' }), ' epic ');
    await waitFor(() => expect(saveButton()).toBeEnabled());
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const part = savedPart(dataChange);
    expect(part).toMatchObject({
      id: '',
      typeId: LITERARY_WORK_INFO_PART_TYPEID,
      itemId: TEST_ITEM_ID,
      languages: ['lat'],
      genre: 'epic',
      titles: [{ language: 'lat', value: 'Aeneis' }],
    });
    expect(part.metres).toBeUndefined();
    expect(part.strophes).toBeUndefined();
    expect(part.isLost).toBeUndefined();
    expect(part.authorIds).toBeUndefined();
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
