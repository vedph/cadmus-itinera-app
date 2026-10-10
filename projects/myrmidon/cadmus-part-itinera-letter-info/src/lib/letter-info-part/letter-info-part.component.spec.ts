import { inputBinding, outputBinding, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular/zoneless';
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
import { LETTER_INFO_PART_TYPEID, LetterInfoPart } from '../letter-info-part';
import { LetterInfoPartComponent } from './letter-info-part.component';

function createData(
  props: Partial<Pick<LetterInfoPart, 'subject' | 'header' | 'textDate'>> = {
    subject: 'On the journey',
    header: 'To my dear friend',
    textDate: 'Kal. Mai.',
  },
): EditedObject<LetterInfoPart> {
  return createEditedObject(
    createPart<LetterInfoPart>(LETTER_INFO_PART_TYPEID, props),
  );
}

async function setup(
  options: {
    data?: EditedObject<LetterInfoPart>;
    identity?: PartIdentity;
    mocks?: PartEditorMocksOptions;
  } = {},
) {
  const mocks = createPartEditorMocks(options.mocks);
  const data = signal<EditedObject<LetterInfoPart> | undefined>(options.data);
  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();
  const view = await render(LetterInfoPartComponent, {
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
    data,
    dataChange,
    editorClose,
    dirtyChange,
  };
}

const subject = () => screen.getByLabelText('subject');
const header = () => screen.getByLabelText('header');
const textDate = () => screen.getByLabelText('text date');
const saveButton = () => screen.getByRole('button', { name: /save/ });

describe('LetterInfoPartComponent', () => {
  it('should show an empty editor', async () => {
    await setup();

    expect(screen.getByText('Letter Info Part')).toBeInTheDocument();
    expect(subject()).toHaveValue('');
    expect(header()).toHaveValue('');
    expect(textDate()).toHaveValue('');
    // all the fields are optional
    expect(saveButton()).toBeEnabled();
  });

  it('should show the bound part without making the editor dirty', async () => {
    const { dirtyChange } = await setup({ data: createData() });

    expect(subject()).toHaveValue('On the journey');
    expect(header()).toHaveValue('To my dear friend');
    expect(textDate()).toHaveValue('Kal. Mai.');
    expect(dirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('should show empty fields for the missing properties', async () => {
    await setup({ data: createData({ header: 'To my dear friend' }) });

    expect(subject()).toHaveValue('');
    expect(header()).toHaveValue('To my dear friend');
    expect(textDate()).toHaveValue('');
  });

  it('should update the editor when another part is bound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(createData({ subject: 'Another subject' }));
    await fixture.whenStable();

    expect(subject()).toHaveValue('Another subject');
    expect(header()).toHaveValue('');
  });

  it('should reset the editor when the part is unbound', async () => {
    const { data, fixture } = await setup({ data: createData() });

    data.set(undefined);
    await fixture.whenStable();

    expect(subject()).toHaveValue('');
    expect(header()).toHaveValue('');
    expect(textDate()).toHaveValue('');
  });

  it('should notify when the user makes the editor dirty', async () => {
    const { user, dirtyChange } = await setup({ data: createData() });

    await user.type(header(), '!');

    expect(dirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('should emit the edited part with trimmed values on save', async () => {
    const { user, dataChange, dirtyChange } = await setup({
      data: createData(),
    });

    await user.clear(subject());
    await user.type(subject(), '  On the return  ');
    await user.clear(header());
    await user.type(header(), '  To my brother  ');
    await user.clear(textDate());
    await user.type(textDate(), '  Id. Iun.  ');
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    expect(dataChange.mock.calls[0][0].value).toMatchObject({
      id: TEST_PART_ID,
      itemId: TEST_ITEM_ID,
      typeId: LETTER_INFO_PART_TYPEID,
      subject: 'On the return',
      header: 'To my brother',
      textDate: 'Id. Iun.',
    });
    expect(dirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('should emit no value for the fields emptied by the user', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.clear(subject());
    await user.clear(textDate());
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const part: LetterInfoPart = dataChange.mock.calls[0][0].value;
    expect(part.subject).toBeFalsy();
    expect(part.header).toBe('To my dear friend');
    expect(part.textDate).toBeFalsy();
  });

  it('should emit a new part on save when no part was bound', async () => {
    const { user, dataChange } = await setup({
      identity: {
        itemId: TEST_ITEM_ID,
        typeId: LETTER_INFO_PART_TYPEID,
        partId: null,
        roleId: 'draft',
      },
    });

    await user.type(subject(), 'On the journey');
    await user.click(saveButton());

    expect(dataChange).toHaveBeenCalledTimes(1);
    const part: LetterInfoPart = dataChange.mock.calls[0][0].value;
    expect(part).toMatchObject({
      id: '',
      itemId: TEST_ITEM_ID,
      typeId: LETTER_INFO_PART_TYPEID,
      roleId: 'draft',
      subject: 'On the journey',
    });
    expect(part.header).toBeFalsy();
    expect(part.textDate).toBeFalsy();
  });

  it('should reject a subject longer than 3000 characters', async () => {
    const { user, dataChange } = await setup({ data: createData() });

    await user.click(subject());
    await user.paste('x'.repeat(3001));
    await user.tab();

    expect(screen.getByText('subject too long')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
    await user.type(header(), '{Enter}');
    expect(dataChange).not.toHaveBeenCalled();
  });

  it('should reject a header longer than 500 characters', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(header());
    await user.paste('x'.repeat(501));
    await user.tab();

    expect(screen.getByText('header too long')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it('should reject a text date longer than 100 characters', async () => {
    const { user } = await setup({ data: createData() });

    await user.click(textDate());
    await user.paste('x'.repeat(101));
    await user.tab();

    expect(screen.getByText('date too long')).toBeInTheDocument();
    await waitFor(() => expect(saveButton()).toBeDisabled());
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
    expect(screen.getByRole('button', { name: /close/ })).toBeInTheDocument();
  });

  it('should offer saving to an operator', async () => {
    await setup({ data: createData(), mocks: { roles: ['operator'] } });

    expect(saveButton()).toBeInTheDocument();
  });
});
