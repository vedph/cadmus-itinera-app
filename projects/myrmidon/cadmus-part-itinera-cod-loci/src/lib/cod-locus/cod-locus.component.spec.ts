import { inputBinding, outputBinding, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { createPartEditorMocks } from '../../../../../testing/part-testing';
import { CodLocus } from '../cod-loci-part';
import { CodLocusComponent } from './cod-locus.component';

const LOCUS: CodLocus = {
  citation: 'If. 1,1',
  range: { start: { n: 12, v: false }, end: { n: 13, v: true } },
  text: 'Nel mezzo del cammin',
  note: 'a note',
};

async function setup(
  options: {
    locus?: CodLocus;
    locEntries?: ThesaurusEntry[];
    imgTypeEntries?: ThesaurusEntry[];
  } = {},
) {
  const locus = signal<CodLocus | undefined>(options.locus);
  const locusChange = vi.fn();
  const editorClose = vi.fn();
  const view = await render(CodLocusComponent, {
    providers: createPartEditorMocks().providers,
    bindings: [
      inputBinding('locus', locus),
      inputBinding('locEntries', () => options.locEntries),
      inputBinding('imgTypeEntries', () => options.imgTypeEntries),
      outputBinding('locusChange', locusChange),
      outputBinding('editorClose', editorClose),
    ],
  });
  return { ...view, user: userEvent.setup(), locus, locusChange, editorClose };
}

const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });
const discardButton = () =>
  screen.getByRole('button', { description: 'Discard changes' });

describe('CodLocusComponent', () => {
  it('should show an empty form which cannot be saved', async () => {
    await setup();

    expect(screen.getByLabelText('citation')).toHaveValue('');
    expect(screen.getByLabelText('location')).toHaveValue('');
    expect(screen.getByLabelText('text')).toHaveValue('');
    expect(screen.getByLabelText('note')).toHaveValue('');
    expect(acceptButton()).toBeDisabled();
  });

  it('should show the bound locus without making the form dirty', async () => {
    await setup({ locus: LOCUS });

    expect(screen.getByLabelText('citation')).toHaveValue('If. 1,1');
    expect(screen.getByLabelText('location')).toHaveValue('12r-13v');
    expect(screen.getByLabelText('text')).toHaveValue('Nel mezzo del cammin');
    expect(screen.getByLabelText('note')).toHaveValue('a note');
    // valid, but pristine
    expect(acceptButton()).toBeDisabled();
  });

  it('should update the form when another locus is bound', async () => {
    const { locus, fixture } = await setup({ locus: LOCUS });

    locus.set({ ...LOCUS, citation: 'Pg. 2,3', note: undefined });
    await fixture.whenStable();

    expect(screen.getByLabelText('citation')).toHaveValue('Pg. 2,3');
    expect(screen.getByLabelText('note')).toHaveValue('');
  });

  it('should reset the form when the locus is unbound', async () => {
    const { locus, fixture } = await setup({ locus: LOCUS });

    locus.set(undefined);
    await fixture.whenStable();

    expect(screen.getByLabelText('citation')).toHaveValue('');
    expect(screen.getByLabelText('location')).toHaveValue('');
    expect(screen.getByLabelText('text')).toHaveValue('');
  });

  it('should emit the edited locus with trimmed values on save', async () => {
    const { user, locusChange } = await setup({ locus: LOCUS });

    const citation = screen.getByLabelText('citation');
    await user.clear(citation);
    await user.type(citation, '  Pd. 33,145  ');
    const text = screen.getByLabelText('text');
    await user.clear(text);
    await user.type(text, " l'amor che move ");
    await user.clear(screen.getByLabelText('note'));
    await user.click(acceptButton());

    expect(locusChange).toHaveBeenCalledTimes(1);
    expect(locusChange).toHaveBeenCalledWith({
      citation: 'Pd. 33,145',
      range: LOCUS.range,
      text: "l'amor che move",
      note: undefined,
      images: undefined,
    });
  });

  it('should save the location typed by the user', async () => {
    const { user, locusChange } = await setup({ locus: LOCUS });

    const location = screen.getByLabelText('location');
    await user.clear(location);
    await user.type(location, '20v');
    // the location is emitted with a delay
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());

    expect(locusChange).toHaveBeenCalledTimes(1);
    const saved: CodLocus = locusChange.mock.calls[0][0];
    expect(saved.range.start).toMatchObject({ n: 20, v: true });
    expect(saved.range.end).toMatchObject({ n: 20, v: true });
  });

  it('should not allow saving without a location', async () => {
    const { user, locusChange } = await setup();

    await user.type(screen.getByLabelText('citation'), 'If. 1,1');

    expect(acceptButton()).toBeDisabled();
    // submitting with the keyboard is not a way around the disabled button
    await user.type(screen.getByLabelText('text'), '{Enter}');
    expect(locusChange).not.toHaveBeenCalled();
  });

  it('should not take the placeholder range of a new locus as a location', async () => {
    const { user } = await setup({
      locus: {
        citation: '',
        range: { start: { n: 0 }, end: { n: 0 } },
        text: '',
      },
    });

    expect(screen.getByLabelText('location')).toHaveValue('');
    await user.type(screen.getByLabelText('citation'), 'If. 1,1');
    expect(acceptButton()).toBeDisabled();

    await user.type(screen.getByLabelText('location'), '3r');
    await waitFor(() => expect(acceptButton()).toBeEnabled());
  });

  it('should require the citation', async () => {
    const { user } = await setup({ locus: LOCUS });

    await user.clear(screen.getByLabelText('citation'));
    await user.tab();

    expect(screen.getByText('citation required')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject a citation longer than 50 characters', async () => {
    const { user } = await setup({ locus: LOCUS });

    const citation = screen.getByLabelText('citation');
    await user.clear(citation);
    await user.type(citation, 'x'.repeat(51));
    await user.tab();

    expect(screen.getByText('citation too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject a text longer than 1000 characters', async () => {
    const { user } = await setup({ locus: LOCUS });

    const text = screen.getByLabelText('text');
    await user.click(text);
    await user.paste('x'.repeat(1001));
    await user.tab();

    expect(screen.getByText('text too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject a note longer than 5000 characters', async () => {
    const { user } = await setup({ locus: LOCUS });

    const note = screen.getByLabelText('note');
    await user.click(note);
    await user.paste('x'.repeat(5001));
    await user.tab();

    expect(screen.getByText('note too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should pick the citation from the thesaurus when available', async () => {
    const { user, locusChange } = await setup({
      locus: { ...LOCUS, citation: 'if' },
      locEntries: [
        { id: 'if', value: 'Inferno' },
        { id: 'pg', value: 'Purgatorio' },
      ],
    });

    const citation = screen.getByRole('combobox', { name: 'citation' });
    await waitFor(() => expect(citation).toHaveTextContent('Inferno'));
    await user.click(citation);
    await user.click(await screen.findByRole('option', { name: 'Purgatorio' }));
    await user.click(acceptButton());

    expect(locusChange).toHaveBeenCalledTimes(1);
    expect(locusChange.mock.calls[0][0].citation).toBe('pg');
  });

  it('should save the images added by the user', async () => {
    const { user, locusChange } = await setup({ locus: LOCUS });

    await user.click(screen.getByRole('button', { name: /image/ }));
    await user.type(screen.getByLabelText('type'), 'detail');
    await user.type(screen.getByLabelText('ID'), 'img-1');
    // the images are emitted with a delay
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());

    expect(locusChange).toHaveBeenCalledTimes(1);
    expect(locusChange.mock.calls[0][0].images).toEqual([
      expect.objectContaining({ type: 'detail', id: 'img-1' }),
    ]);
  });

  it('should show the bound images', async () => {
    await setup({
      locus: { ...LOCUS, images: [{ id: 'img-9', type: 'detail' }] },
    });

    expect(screen.getByLabelText('ID')).toHaveValue('img-9');
    expect(screen.getByLabelText('type')).toHaveValue('detail');
  });

  it('should request to close without saving on discard', async () => {
    const { user, locusChange, editorClose } = await setup({ locus: LOCUS });

    await user.type(screen.getByLabelText('note'), ' changed');
    await user.click(discardButton());

    expect(editorClose).toHaveBeenCalledTimes(1);
    expect(locusChange).not.toHaveBeenCalled();
  });
});
