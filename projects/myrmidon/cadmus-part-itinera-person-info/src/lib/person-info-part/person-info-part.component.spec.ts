import { inputBinding, outputBinding, signal } from '@angular/core';
import { NgxMonacoEditorComponent } from '@jean-merelis/ngx-monaco-editor';
import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import {
  EditedObject,
  PartIdentity,
  ThesauriSet,
} from '@myrmidon/cadmus-core';
import {
  CADMUS_TEXT_ED_BINDINGS_TOKEN,
  CadmusTextEdService,
} from '@myrmidon/cadmus-text-ed';

import { MonacoEditorStubComponent } from '../../../../../testing/monaco-editor-stub';
import {
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createThesauri,
  PartEditorMocksOptions,
  TEST_ITEM_ID,
  TEST_PART_ID,
} from '../../../../../testing/part-testing';
import { PERSON_INFO_PART_TYPEID, PersonInfoPart } from '../person-info-part';
import { PersonInfoPartComponent } from './person-info-part.component';

const SEX_THESAURUS = createThesauri({
  'person-sex': [
    { id: 'm', value: 'male' },
    { id: 'f', value: 'female' },
  ],
});

function createData(
  props: Pick<PersonInfoPart, 'sex' | 'bio'> = {
    sex: 'm',
    bio: 'Born in Florence.',
  },
  thesauri: ThesauriSet = {},
): EditedObject<PersonInfoPart> {
  return createEditedObject(
    createPart<PersonInfoPart>(PERSON_INFO_PART_TYPEID, props),
    thesauri,
  );
}

async function setup(
  options: {
    data?: EditedObject<PersonInfoPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
    /** The editor key bindings: key code to text editing selector. */
    bindings?: Record<number, string>;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<PersonInfoPart> | undefined>(options.data);
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  // the text editing service wraps the selected text according to selector
  const editService = {
    edit: vi.fn((query: { selector: string; text: string }) =>
      Promise.resolve({ ...query, text: `<${query.selector}>${query.text}</>` }),
    ),
  };
  const view = await render(PersonInfoPartComponent, {
    providers: [
      ...mocks.providers,
      ...(options.bindings
        ? [
            {
              provide: CADMUS_TEXT_ED_BINDINGS_TOKEN,
              useValue: options.bindings,
            },
          ]
        : []),
    ],
    importOverrides: [
      { replace: NgxMonacoEditorComponent, with: MonacoEditorStubComponent },
    ],
    configureTestBed: (testbed) => {
      testbed.overrideComponent(PersonInfoPartComponent, {
        set: {
          providers: [{ provide: CadmusTextEdService, useValue: editService }],
        },
      });
    },
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
    data,
    dataChange,
    editorClose,
    dirtyChange,
    editService,
  };
}

const bio = () =>
  screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'code editor' });
const saveButton = () => screen.getByRole('button', { name: /save/ });

describe('PersonInfoPartComponent', () => {
  it('should show an empty editor which cannot be saved', async () => {
    await setup();

    expect(screen.getByText('Person Info Part')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'sex' })).toHaveValue('');
    expect(bio()).toHaveValue('');
    // sex is required
    expect(saveButton()).toBeDisabled();
  });

  it('should show the bound part without making the editor dirty', async () => {
    const { dirtyChange } = await setup({ data: createData() });

    expect(screen.getByRole('textbox', { name: 'sex' })).toHaveValue('m');
    expect(bio()).toHaveValue('Born in Florence.');
    expect(saveButton()).toBeEnabled();
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should update the editor when another part is bound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(createData({ sex: 'f' }));
    await fixture.whenStable();

    expect(screen.getByRole('textbox', { name: 'sex' })).toHaveValue('f');
    expect(bio()).toHaveValue('');
  });

  it('should reset the editor when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(screen.getByRole('textbox', { name: 'sex' })).toHaveValue('');
    expect(bio()).toHaveValue('');
  });

  it('should require the sex', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.clear(screen.getByRole('textbox', { name: 'sex' }));
    await user.tab();

    expect(screen.getByText('sex required')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should reject a sex longer than 50 characters', async () => {
    const { user } = await setup({ data: createData() });

    const sex = screen.getByRole('textbox', { name: 'sex' });
    await user.clear(sex);
    await user.type(sex, 'x'.repeat(51));
    await user.tab();

    expect(screen.getByText('sex too long')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should reject a bio longer than 50000 characters', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(bio());
    await user.paste('x'.repeat(50001));
    await user.tab();

    expect(screen.getByText('too long')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should pick the sex from its thesaurus when available', async () => {
    const { user, dataChange } = await setup({
      data: createData({ sex: 'm' }, SEX_THESAURUS),
    });

    const sex = screen.getByRole('combobox', { name: 'sex' });
    await waitFor(() => expect(sex).toHaveTextContent('male'));
    await user.click(sex);
    await user.click(await screen.findByRole('option', { name: 'female' }));
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value.sex).toBe('f');
  });

  it('should drop the thesaurus when the new data has none', async () => {
    const { data, fixture } = await setup({
      data: createData({ sex: 'm' }, SEX_THESAURUS),
    });
    expect(screen.getByRole('combobox', { name: 'sex' })).toBeInTheDocument();

    data.set(createData());
    await fixture.whenStable();

    expect(screen.getByRole('textbox', { name: 'sex' })).toHaveValue('m');
  });

  it('should emit the edited part with trimmed values on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    const sex = screen.getByRole('textbox', { name: 'sex' });
    await user.clear(sex);
    await user.type(sex, '  f  ');
    await user.clear(bio());
    await user.type(bio(), '  Born in *Siena*.  ');
    expect(dirtyChange).toHaveBeenLastCalledWith(true);
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value).toMatchObject({
      id: TEST_PART_ID,
      itemId: TEST_ITEM_ID,
      typeId: PERSON_INFO_PART_TYPEID,
      sex: 'f',
      bio: 'Born in *Siena*.',
    });
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('should emit a new part on save when no part was bound', async () => {
    const { user, dataChange } = await setup({
      identity: {
        itemId: TEST_ITEM_ID,
        typeId: PERSON_INFO_PART_TYPEID,
        partId: null,
        roleId: null,
      },
    });

    await user.type(screen.getByRole('textbox', { name: 'sex' }), 'm');
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const part: PersonInfoPart = dataChange.mock.calls[0][0].value;
    expect(part).toMatchObject({
      id: '',
      itemId: TEST_ITEM_ID,
      typeId: PERSON_INFO_PART_TYPEID,
      sex: 'm',
    });
    expect(part.bio).toBeFalsy();
  });

  it('should focus the bio editor once ready', async () => {
    await setup({ data: createData() });

    expect(MonacoEditorStubComponent.lastEditor!.focus).toHaveBeenCalled();
  });

  it('should register no editing command without key bindings', async () => {
    await setup({ data: createData() });

    expect(MonacoEditorStubComponent.lastEditor!.commands.size).toBe(0);
  });

  it('should edit the selected bio text with the bound commands', async () => {
    const { editService, dataChange, user } = await setup({
      data: createData(),
      bindings: { 2082: 'md.bold', 2087: 'md.italic' },
    });
    const editor = MonacoEditorStubComponent.lastEditor!;
    expect([...editor.commands.keys()]).toEqual([2082, 2087]);

    // select "Florence" and run the command bound to the first key
    bio().setSelectionRange(8, 16);
    editor.commands.get(2082)!();

    await waitFor(() =>
      expect(bio()).toHaveValue('Born in <md.bold>Florence</>.'),
    );
    expect(editService.edit).toHaveBeenCalledWith({
      selector: 'md.bold',
      text: 'Florence',
    });

    await user.click(saveButton());
    expect(dataChange.mock.calls[0][0].value.bio).toBe(
      'Born in <md.bold>Florence</>.',
    );
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
