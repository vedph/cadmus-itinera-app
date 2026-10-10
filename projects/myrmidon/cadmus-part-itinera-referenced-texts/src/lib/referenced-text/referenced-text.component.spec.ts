import { inputBinding, outputBinding, signal } from '@angular/core';
import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  createAssertedIdMocks,
  createPartEditorMocks,
} from '../../../../../testing/part-testing';
import { ReferencedText } from '../referenced-texts-part';
import { ReferencedTextComponent } from './referenced-text.component';

const TEXT: ReferencedText = {
  type: 'quotation',
  targetId: {
    target: { gid: 'http://www.mqdq.it/verg-aen', label: 'Aeneis' },
    scope: 'mqdq',
  },
  targetCitation: 'Aen. 1,1',
  sourceCitations: ['If. 1,1', 'If. 1,2'],
};

/** A new text, as created by the part editor. */
const NEW_TEXT: ReferencedText = {
  type: '',
  targetId: { target: { gid: '', label: '' } },
};

async function setup(
  options: {
    text?: ReferencedText;
    txtTypeEntries?: ThesaurusEntry[];
    idScopeEntries?: ThesaurusEntry[];
  } = {},
) {
  const text = signal<ReferencedText | undefined>(options.text);
  const textChange = vi.fn();
  const editorClose = vi.fn();
  const view = await render(ReferencedTextComponent, {
    providers: [
      ...createPartEditorMocks().providers,
      ...createAssertedIdMocks(),
    ],
    bindings: [
      inputBinding('text', text),
      inputBinding('txtTypeEntries', () => options.txtTypeEntries),
      inputBinding('idScopeEntries', () => options.idScopeEntries),
      outputBinding('textChange', textChange),
      outputBinding('editorClose', editorClose),
    ],
  });
  return { ...view, user: userEvent.setup(), text, textChange, editorClose };
}

const type = () => screen.getByRole('textbox', { name: 'type' });
const targetId = () => screen.getByRole('group', { name: 'target ID' });
const targetCitation = () => screen.getByLabelText('target citation');
const sources = () => screen.getByLabelText('sources');
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });

describe('ReferencedTextComponent', () => {
  it('should show an empty form which cannot be saved', async () => {
    await setup();

    expect(type()).toHaveValue('');
    expect(targetCitation()).toHaveValue('');
    expect(sources()).toHaveValue('');
    expect(acceptButton()).toBeDisabled();
  });

  it('should show the bound text without making the form dirty', async () => {
    await setup({ text: TEXT });

    expect(type()).toHaveValue('quotation');
    expect(within(targetId()).getByText('Aeneis')).toBeInTheDocument();
    expect(
      within(targetId()).getByText('http://www.mqdq.it/verg-aen'),
    ).toBeInTheDocument();
    expect(targetCitation()).toHaveValue('Aen. 1,1');
    expect(sources()).toHaveValue('If. 1,1\nIf. 1,2');
    // valid, but pristine
    expect(acceptButton()).toBeDisabled();
  });

  it('should update the form when another text is bound', async () => {
    const { text, fixture } = await setup({ text: TEXT });

    text.set({
      type: 'allusion',
      targetId: { target: { gid: 'http://x.org/ov-met', label: 'Met.' } },
    });
    await fixture.whenStable();

    expect(type()).toHaveValue('allusion');
    expect(within(targetId()).getByText('Met.')).toBeInTheDocument();
    expect(targetCitation()).toHaveValue('');
    expect(sources()).toHaveValue('');
  });

  it('should reset the form when the text is unbound', async () => {
    const { text, fixture } = await setup({ text: TEXT });

    text.set(undefined);
    await fixture.whenStable();

    expect(type()).toHaveValue('');
    expect(targetCitation()).toHaveValue('');
    expect(sources()).toHaveValue('');
  });

  it('should emit the edited text with trimmed values on save', async () => {
    const { user, textChange } = await setup({ text: TEXT });

    await user.clear(type());
    await user.type(type(), '  allusion  ');
    await user.clear(targetCitation());
    await user.type(targetCitation(), '  Aen. 2,3  ');
    await user.click(acceptButton());

    expect(textChange).toHaveBeenCalledTimes(1);
    expect(textChange).toHaveBeenCalledWith({
      type: 'allusion',
      targetId: TEXT.targetId,
      targetCitation: 'Aen. 2,3',
      sourceCitations: ['If. 1,1', 'If. 1,2'],
    });
  });

  it('should emit a source per line, without blanks and duplicates', async () => {
    const { user, textChange } = await setup({ text: TEXT });

    await user.clear(sources());
    await user.type(
      sources(),
      '  Pg. 3,4  {Enter}{Enter}Pd. 5,6{Enter}Pg. 3,4{Enter} ',
    );
    await user.click(acceptButton());

    expect(textChange).toHaveBeenCalledTimes(1);
    expect(textChange.mock.calls[0][0].sourceCitations).toEqual([
      'Pg. 3,4',
      'Pd. 5,6',
    ]);
  });

  it('should emit no sources nor citation when emptied', async () => {
    const { user, textChange } = await setup({ text: TEXT });

    await user.clear(sources());
    await user.clear(targetCitation());
    await user.click(acceptButton());

    expect(textChange).toHaveBeenCalledTimes(1);
    const saved: ReferencedText = textChange.mock.calls[0][0];
    expect(saved.sourceCitations).toBeUndefined();
    expect(saved.targetCitation).toBeFalsy();
  });

  it('should emit the target ID edited by the user', async () => {
    const { user, textChange } = await setup({ text: TEXT });

    const scope = within(targetId()).getByRole('textbox', { name: 'scope' });
    await user.clear(scope);
    await user.type(scope, 'musisque');
    // the ID is emitted with a delay
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());

    expect(textChange).toHaveBeenCalledTimes(1);
    const saved: ReferencedText = textChange.mock.calls[0][0];
    expect(saved.targetId.scope).toBe('musisque');
    expect(saved.targetId.target).toMatchObject(TEXT.targetId.target);
  });

  it('should pick type and ID scope from their thesauri when available', async () => {
    const { user, textChange } = await setup({
      text: { ...TEXT, type: 'q' },
      txtTypeEntries: [
        { id: 'q', value: 'quotation' },
        { id: 'a', value: 'allusion' },
      ],
      idScopeEntries: [{ id: 'mqdq', value: 'Musisque Deoque' }],
    });

    expect(
      within(targetId()).getByRole('combobox', { name: 'scope' }),
    ).toBeInTheDocument();
    const select = screen.getByRole('combobox', { name: 'type' });
    await waitFor(() => expect(select).toHaveTextContent('quotation'));
    await user.click(select);
    await user.click(await screen.findByRole('option', { name: 'allusion' }));
    await user.click(acceptButton());

    expect(textChange).toHaveBeenCalledTimes(1);
    expect(textChange.mock.calls[0][0].type).toBe('a');
  });

  it('should require the type', async () => {
    const { user, textChange } = await setup({ text: TEXT });

    await user.clear(type());
    await user.tab();

    expect(screen.getByText('type required')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
    await user.type(targetCitation(), '{Enter}');
    expect(textChange).not.toHaveBeenCalled();
  });

  it('should not accept a new text without a target', async () => {
    const { user } = await setup({ text: NEW_TEXT });

    await user.type(type(), 'quotation');
    await user.type(targetCitation(), 'Aen. 1,1');

    expect(acceptButton()).toBeDisabled();
  });

  it('should reject a type longer than 50 characters', async () => {
    const { user } = await setup({ text: TEXT });

    await user.clear(type());
    await user.type(type(), 'x'.repeat(51));
    await user.tab();

    expect(screen.getByText('type too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject a target citation longer than 50 characters', async () => {
    const { user } = await setup({ text: TEXT });

    await user.clear(targetCitation());
    await user.type(targetCitation(), 'x'.repeat(51));
    await user.tab();

    expect(screen.getByText('citation too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject sources longer than 1000 characters', async () => {
    const { user } = await setup({ text: TEXT });

    await user.click(sources());
    await user.paste('x'.repeat(1001));
    await user.tab();

    expect(screen.getByText('sources too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should request to close without saving on discard', async () => {
    const { user, textChange, editorClose } = await setup({ text: TEXT });

    await user.type(targetCitation(), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(editorClose).toHaveBeenCalledTimes(1);
    expect(textChange).not.toHaveBeenCalled();
  });
});
