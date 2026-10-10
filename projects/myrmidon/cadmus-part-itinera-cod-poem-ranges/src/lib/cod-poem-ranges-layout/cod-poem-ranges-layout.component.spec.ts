import { inputBinding, outputBinding, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { createPartEditorMocks } from '../../../../../testing/part-testing';
import { Alnum } from '../services/alnum';
import {
  CodPoemLayoutCheckMode,
  PoemLayoutRow,
} from '../services/poem-layout-table';
import { CodPoemRangesLayoutComponent } from './cod-poem-ranges-layout.component';

const ROW: PoemLayoutRow = {
  nr: new Alnum(12, 'a'),
  layout: 'two-cols',
  note: 'a note',
};

async function setup(initial?: PoemLayoutRow) {
  const row = signal<PoemLayoutRow | undefined>(initial);
  const rowChange = vi.fn();
  const layoutCheck = vi.fn();
  const view = await render(CodPoemRangesLayoutComponent, {
    providers: createPartEditorMocks().providers,
    bindings: [
      inputBinding('row', row),
      outputBinding('rowChange', rowChange),
      outputBinding('layoutCheck', layoutCheck),
    ],
  });
  return { ...view, user: userEvent.setup(), row, rowChange, layoutCheck };
}

const checkButton = () =>
  screen.getByRole('button', { description: 'Check this layout' });
const clearButton = () =>
  screen.getByRole('button', { description: 'Clear this layout' });
const editNoteButton = () =>
  screen.getByRole('button', { description: 'Edit note for this layout' });

describe('CodPoemRangesLayoutComponent', () => {
  it('should show nothing without a row', async () => {
    await setup();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should show the number and layout of the row', async () => {
    await setup(ROW);

    expect(screen.getByText('12a')).toBeInTheDocument();
    expect(screen.getByText('two-cols')).toBeInTheDocument();
  });

  it('should show the number alone for a row without suffix and layout', async () => {
    await setup({ nr: new Alnum(7) });

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should request a single check on click', async () => {
    const { user, layoutCheck } = await setup(ROW);

    await user.click(checkButton());

    expect(layoutCheck).toHaveBeenCalledTimes(1);
    expect(layoutCheck).toHaveBeenCalledWith({
      row: ROW,
      mode: CodPoemLayoutCheckMode.Single,
    });
  });

  it('should request a range check on shift+click', async () => {
    const { user, layoutCheck } = await setup(ROW);

    await user.keyboard('{Shift>}');
    await user.click(checkButton());
    await user.keyboard('{/Shift}');

    expect(layoutCheck).toHaveBeenCalledWith({
      row: ROW,
      mode: CodPoemLayoutCheckMode.Range,
    });
  });

  it('should request an added check on ctrl+click', async () => {
    const { user, layoutCheck } = await setup(ROW);

    await user.keyboard('{Control>}');
    await user.click(checkButton());
    await user.keyboard('{/Control}');

    expect(layoutCheck).toHaveBeenCalledWith({
      row: ROW,
      mode: CodPoemLayoutCheckMode.Add,
    });
  });

  it('should request an added check on alt+click', async () => {
    const { user, layoutCheck } = await setup(ROW);

    await user.keyboard('{Alt>}');
    await user.click(checkButton());
    await user.keyboard('{/Alt}');

    expect(layoutCheck).toHaveBeenCalledWith({
      row: ROW,
      mode: CodPoemLayoutCheckMode.Add,
    });
  });

  it('should clear layout, note and check of the row', async () => {
    const { user, rowChange } = await setup({ ...ROW, checked: true });

    await user.click(clearButton());

    expect(rowChange).toHaveBeenCalledTimes(1);
    expect(rowChange).toHaveBeenCalledWith({
      nr: new Alnum(12, 'a'),
      layout: undefined,
      checked: false,
      note: undefined,
    });
    expect(screen.queryByText('two-cols')).not.toBeInTheDocument();
  });

  it('should edit the note and save it with enter', async () => {
    const { user, rowChange } = await setup({ ...ROW, checked: true });

    await user.click(editNoteButton());
    const note = screen.getByRole('textbox');
    expect(note).toHaveValue('a note');
    await user.clear(note);
    await user.type(note, '  another note  {Enter}');

    expect(rowChange).toHaveBeenCalledTimes(1);
    expect(rowChange).toHaveBeenCalledWith({
      nr: new Alnum(12, 'a'),
      layout: 'two-cols',
      checked: true,
      note: 'another note',
    });
    // back to the toolbar
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(checkButton()).toBeInTheDocument();
  });

  it('should save the note with its button', async () => {
    const { user, rowChange } = await setup({ nr: new Alnum(3) });

    await user.click(editNoteButton());
    await user.type(screen.getByRole('textbox'), 'new note');
    await user.click(screen.getByRole('button', { description: 'Save note' }));

    expect(rowChange).toHaveBeenCalledWith({
      nr: new Alnum(3),
      layout: undefined,
      checked: undefined,
      note: 'new note',
    });
  });

  it('should remove the note when saved empty', async () => {
    const { user, rowChange } = await setup(ROW);

    await user.click(editNoteButton());
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { description: 'Save note' }));

    expect(rowChange).toHaveBeenCalledTimes(1);
    expect(rowChange.mock.calls[0][0].note).toBeFalsy();
  });

  it('should discard the edited note with escape', async () => {
    const { user, rowChange } = await setup(ROW);

    await user.click(editNoteButton());
    await user.type(screen.getByRole('textbox'), ' changed{Escape}');

    expect(rowChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should discard the edited note with its button', async () => {
    const { user, rowChange } = await setup(ROW);

    await user.click(editNoteButton());
    await user.type(screen.getByRole('textbox'), ' changed');
    await user.click(screen.getByRole('button', { description: 'Discard note' }));

    expect(rowChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should report a note longer than 500 characters', async () => {
    const { user } = await setup(ROW);

    await user.click(editNoteButton());
    await user.click(screen.getByRole('textbox'));
    await user.paste('x'.repeat(501));
    await user.tab();

    expect(screen.getByText('note too long')).toBeInTheDocument();
  });

  it('should close the note editor when another row is bound', async () => {
    const { user, row, fixture } = await setup(ROW);

    await user.click(editNoteButton());
    row.set({ nr: new Alnum(13), note: 'other' });
    await fixture.whenStable();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();

    await user.click(editNoteButton());
    expect(screen.getByRole('textbox')).toHaveValue('other');
  });

  it('should show nothing when the row is unbound', async () => {
    const { row, fixture } = await setup(ROW);

    row.set(undefined);
    await fixture.whenStable();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
