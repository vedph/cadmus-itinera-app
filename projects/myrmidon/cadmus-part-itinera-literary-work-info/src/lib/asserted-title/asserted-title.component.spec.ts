import { inputBinding, outputBinding, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { createPartEditorMocks } from '../../../../../testing/part-testing';
import { AssertedTitle } from '../literary-work-info-part';
import { AssertedTitleComponent } from './asserted-title.component';

const TITLE: AssertedTitle = {
  language: 'lat',
  value: 'De vulgari eloquentia',
};

async function setup(
  options: {
    title?: AssertedTitle;
    langEntries?: ThesaurusEntry[];
    assTagEntries?: ThesaurusEntry[];
  } = {},
) {
  const title = signal<AssertedTitle | undefined>(options.title);
  const titleChange = vi.fn();
  const editorClose = vi.fn();
  const view = await render(AssertedTitleComponent, {
    providers: createPartEditorMocks().providers,
    bindings: [
      inputBinding('title', title),
      inputBinding('langEntries', () => options.langEntries),
      inputBinding('assTagEntries', () => options.assTagEntries),
      outputBinding('titleChange', titleChange),
      outputBinding('editorClose', editorClose),
    ],
  });
  return { ...view, user: userEvent.setup(), title, titleChange, editorClose };
}

const language = () => screen.getByLabelText('language');
const value = () => screen.getByLabelText('title');
const assertion = () => screen.getByRole('checkbox', { name: 'assertion' });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });

describe('AssertedTitleComponent', () => {
  it('should show an empty form which cannot be saved', async () => {
    await setup();

    expect(language()).toHaveValue('');
    expect(value()).toHaveValue('');
    expect(assertion()).not.toBeChecked();
    expect(acceptButton()).toBeDisabled();
  });

  it('should show the bound title without making the form dirty', async () => {
    await setup({ title: TITLE });

    expect(language()).toHaveValue('lat');
    expect(value()).toHaveValue('De vulgari eloquentia');
    // valid, but pristine
    expect(acceptButton()).toBeDisabled();
  });

  it('should not show an assertion for a title without it', async () => {
    await setup({ title: TITLE });

    expect(assertion()).not.toBeChecked();
    expect(screen.queryByLabelText('rank')).not.toBeInTheDocument();
  });

  it('should show the assertion of the bound title', async () => {
    await setup({
      title: { ...TITLE, assertion: { tag: 'uncertain', rank: 2 } },
    });

    expect(assertion()).toBeChecked();
    expect(screen.getByLabelText('tag')).toHaveValue('uncertain');
    expect(screen.getByLabelText('rank')).toHaveValue(2);
  });

  it('should update the form when another title is bound', async () => {
    const { title, fixture } = await setup({ title: TITLE });

    title.set({ language: 'ita', value: 'Commedia' });
    await fixture.whenStable();

    expect(language()).toHaveValue('ita');
    expect(value()).toHaveValue('Commedia');
  });

  it('should reset the form when the title is unbound', async () => {
    const { title, fixture } = await setup({
      title: { ...TITLE, assertion: { rank: 1 } },
    });

    title.set(undefined);
    await fixture.whenStable();

    expect(language()).toHaveValue('');
    expect(value()).toHaveValue('');
    expect(assertion()).not.toBeChecked();
  });

  it('should emit the edited title with trimmed values on save', async () => {
    const { user, titleChange } = await setup({ title: TITLE });

    await user.clear(language());
    await user.type(language(), '  ita  ');
    await user.clear(value());
    await user.type(value(), '  Commedia  ');
    await user.click(acceptButton());

    expect(titleChange).toHaveBeenCalledTimes(1);
    expect(titleChange).toHaveBeenCalledWith({
      language: 'ita',
      value: 'Commedia',
      assertion: undefined,
    });
  });

  it('should emit the assertion added by the user', async () => {
    const { user, titleChange } = await setup({ title: TITLE });

    await user.click(assertion());
    await user.type(await screen.findByLabelText('tag'), 'uncertain');
    // the assertion is emitted with a delay, while the form is already
    // dirty and valid: there is nothing to wait for but time
    await new Promise((resolve) => setTimeout(resolve, 500));
    await user.click(acceptButton());

    expect(titleChange).toHaveBeenCalledTimes(1);
    const saved: AssertedTitle = titleChange.mock.calls[0][0];
    expect(saved.language).toBe('lat');
    expect(saved.assertion).toMatchObject({ tag: 'uncertain' });
  });

  it('should drop the assertion when unchecked', async () => {
    const { user, titleChange } = await setup({
      title: { ...TITLE, assertion: { tag: 'uncertain', rank: 2 } },
    });

    await user.click(assertion());
    await user.click(acceptButton());

    expect(screen.queryByLabelText('rank')).not.toBeInTheDocument();
    expect(titleChange).toHaveBeenCalledTimes(1);
    expect(titleChange.mock.calls[0][0].assertion).toBeUndefined();
  });

  it('should pick the assertion tag from the thesaurus when available', async () => {
    await setup({
      title: { ...TITLE, assertion: { tag: 'u', rank: 2 } },
      assTagEntries: [{ id: 'u', value: 'uncertain' }],
    });

    expect(screen.getByRole('combobox', { name: 'tag' })).toBeInTheDocument();
  });

  it('should pick the language from the thesaurus when available', async () => {
    const { user, titleChange } = await setup({
      title: TITLE,
      langEntries: [
        { id: 'lat', value: 'Latin' },
        { id: 'ita', value: 'Italian' },
      ],
    });

    const select = screen.getByRole('combobox', { name: 'language' });
    await waitFor(() => expect(select).toHaveTextContent('Latin'));
    await user.click(select);
    await user.click(await screen.findByRole('option', { name: 'Italian' }));
    await user.click(acceptButton());

    expect(titleChange).toHaveBeenCalledTimes(1);
    expect(titleChange.mock.calls[0][0].language).toBe('ita');
  });

  it('should require language and title', async () => {
    const { user, titleChange } = await setup({ title: TITLE });

    await user.clear(language());
    await user.clear(value());
    await user.tab();

    expect(screen.getByText('language required')).toBeInTheDocument();
    expect(screen.getByText('title required')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
    expect(titleChange).not.toHaveBeenCalled();
  });

  it('should reject a language longer than 50 characters', async () => {
    const { user } = await setup({ title: TITLE });

    await user.clear(language());
    await user.type(language(), 'x'.repeat(51));
    await user.tab();

    expect(screen.getByText('language too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject a title longer than 100 characters', async () => {
    const { user } = await setup({ title: TITLE });

    await user.clear(value());
    await user.click(value());
    await user.paste('x'.repeat(101));
    await user.tab();

    expect(screen.getByText('title too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should request to close without saving on discard', async () => {
    const { user, titleChange, editorClose } = await setup({ title: TITLE });

    await user.type(value(), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(editorClose).toHaveBeenCalledTimes(1);
    expect(titleChange).not.toHaveBeenCalled();
  });
});
