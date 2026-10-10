import { inputBinding, outputBinding, signal } from '@angular/core';
import { render, screen, within } from '@testing-library/angular/zoneless';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { createPartEditorMocks } from '../../../../../testing/part-testing';
import { CodPoemLayout } from '../cod-poem-ranges-part';
import { AlnumRange } from '../services/alnum-range.service';
import { CodPoemRangeLayoutsComponent } from './cod-poem-range-layouts.component';

async function setup(
  options: {
    ranges?: AlnumRange[];
    layouts?: CodPoemLayout[];
    layoutEntries?: ThesaurusEntry[];
  } = {},
) {
  const ranges = signal<AlnumRange[]>(options.ranges ?? []);
  const layouts = signal<CodPoemLayout[]>(options.layouts ?? []);
  const layoutsChange = vi.fn();
  const view = await render(CodPoemRangeLayoutsComponent, {
    providers: createPartEditorMocks().providers,
    bindings: [
      inputBinding('ranges', ranges),
      inputBinding('layouts', layouts),
      inputBinding('layoutEntries', () => options.layoutEntries),
      outputBinding('layoutsChange', layoutsChange),
    ],
  });
  return {
    ...view,
    user: userEvent.setup(),
    ranges,
    layouts,
    layoutsChange,
  };
}

/** The element of each poem row, with its toolbar and indicators. */
const poemRows = () =>
  screen
    .queryAllByRole('button', { description: 'Check this layout' })
    .map((b) => b.closest('cadmus-cod-poem-ranges-layout') as HTMLElement);
/** The text of each poem row: number followed by layout, if any. */
const poems = () =>
  poemRows().map((row) =>
    Array.from(row.querySelectorAll('span'))
      .map((s) => s.textContent?.trim())
      .filter((s) => s)
      .join(' '),
  );
const checkPoem = (index: number) =>
  within(poemRows()[index]).getByRole('button', {
    description: 'Check this layout',
  });
const applyLayoutButton = () =>
  screen.getByRole('button', { description: 'Apply layout to selected rows' });
const saveButton = () => screen.getByRole('button', { name: /apply/ });

async function selectPreset(user: UserEvent, name: string): Promise<void> {
  await user.click(screen.getByRole('combobox', { name: 'presets' }));
  await user.click(await screen.findByRole('option', { name }));
}

describe('CodPoemRangeLayoutsComponent', () => {
  it('should show no poems without ranges', async () => {
    await setup();

    expect(poems()).toEqual([]);
    expect(
      screen.getByRole('button', { description: 'Select preset' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { description: 'Deselect preset' }),
    ).toBeDisabled();
  });

  it('should list a poem per number in the ranges, with its layout', async () => {
    await setup({
      ranges: [{ a: '1', b: '3' }, { a: '5a' }],
      layouts: [{ range: { a: '2', b: '3' }, layout: 'x' }],
    });

    expect(poems()).toEqual(['1', '2 x', '3 x', '5a']);
  });

  it('should update the poems when ranges or layouts change', async () => {
    const { ranges, layouts, fixture } = await setup({
      ranges: [{ a: '1', b: '2' }],
    });

    ranges.set([{ a: '1', b: '3' }]);
    layouts.set([{ range: { a: '3' }, layout: 'y' }]);
    await fixture.whenStable();

    expect(poems()).toEqual(['1', '2', '3 y']);
  });

  it('should apply the typed layout to the checked poem only', async () => {
    const { user } = await setup({ ranges: [{ a: '1', b: '3' }] });

    await user.click(checkPoem(1));
    await user.type(screen.getByLabelText('layout'), 'x');
    await user.click(applyLayoutButton());

    expect(poems()).toEqual(['1', '2 x', '3']);
  });

  it('should apply the layout with enter', async () => {
    const { user } = await setup({ ranges: [{ a: '1', b: '3' }] });

    await user.click(checkPoem(0));
    await user.type(screen.getByLabelText('layout'), 'x{Enter}');

    expect(poems()).toEqual(['1 x', '2', '3']);
  });

  it('should move the check to the last clicked poem', async () => {
    const { user } = await setup({ ranges: [{ a: '1', b: '3' }] });

    await user.click(checkPoem(0));
    await user.click(checkPoem(2));
    await user.type(screen.getByLabelText('layout'), 'x{Enter}');

    expect(poems()).toEqual(['1', '2', '3 x']);
  });

  it('should extend the check to a range with shift+click', async () => {
    const { user } = await setup({ ranges: [{ a: '1', b: '5' }] });

    await user.click(checkPoem(1));
    await user.keyboard('{Shift>}');
    await user.click(checkPoem(3));
    await user.keyboard('{/Shift}');
    await user.type(screen.getByLabelText('layout'), 'x{Enter}');

    expect(poems()).toEqual(['1', '2 x', '3 x', '4 x', '5']);
  });

  it('should add a check with ctrl+click', async () => {
    const { user } = await setup({ ranges: [{ a: '1', b: '5' }] });

    await user.click(checkPoem(1));
    await user.keyboard('{Control>}');
    await user.click(checkPoem(3));
    await user.keyboard('{/Control}');
    await user.type(screen.getByLabelText('layout'), 'x{Enter}');

    expect(poems()).toEqual(['1', '2 x', '3', '4 x', '5']);
  });

  it('should check all the poems', async () => {
    const { user } = await setup({ ranges: [{ a: '1', b: '3' }] });

    await user.click(screen.getByRole('button', { description: 'Select all' }));
    await user.type(screen.getByLabelText('layout'), 'x{Enter}');

    expect(poems()).toEqual(['1 x', '2 x', '3 x']);
  });

  it('should uncheck all the poems', async () => {
    const { user } = await setup({ ranges: [{ a: '1', b: '3' }] });

    await user.click(screen.getByRole('button', { description: 'Select all' }));
    await user.click(
      screen.getByRole('button', { description: 'Deselect all' }),
    );
    await user.type(screen.getByLabelText('layout'), 'x{Enter}');

    expect(poems()).toEqual(['1', '2', '3']);
  });

  it('should remove the layout of the checked poems when applying none', async () => {
    const { user } = await setup({
      ranges: [{ a: '1', b: '3' }],
      layouts: [{ range: { a: '1', b: '3' }, layout: 'x' }],
    });

    await user.click(checkPoem(1));
    await user.click(applyLayoutButton());

    expect(poems()).toEqual(['1 x', '2', '3 x']);
  });

  it('should not apply a layout longer than 50 characters', async () => {
    const { user } = await setup({ ranges: [{ a: '1', b: '3' }] });

    await user.click(checkPoem(1));
    await user.type(screen.getByLabelText('layout'), 'x'.repeat(51));
    await user.click(applyLayoutButton());

    expect(screen.getByText('layout too long')).toBeInTheDocument();
    expect(poems()).toEqual(['1', '2', '3']);
  });

  it('should pick the layout from the thesaurus when available', async () => {
    const { user } = await setup({
      ranges: [{ a: '1', b: '3' }],
      layoutEntries: [
        { id: 'c1', value: 'one column' },
        { id: 'c2', value: 'two columns' },
      ],
    });

    await user.click(checkPoem(2));
    await user.click(screen.getByRole('combobox', { name: 'layout' }));
    await user.click(await screen.findByRole('option', { name: 'two columns' }));
    await user.click(applyLayoutButton());

    expect(poems()).toEqual(['1', '2', '3 c2']);
  });

  it('should check the poems of a preset', async () => {
    // ballata is 11 14 55..., canzone is 23 28-29...
    const { user } = await setup({ ranges: [{ a: '10', b: '14' }] });

    await selectPreset(user, 'ballata');
    await user.click(
      screen.getByRole('button', { description: 'Select preset' }),
    );
    await user.type(screen.getByLabelText('layout'), 'b{Enter}');

    expect(poems()).toEqual(['10', '11 b', '12', '13', '14 b']);
  });

  it('should uncheck the poems of a preset', async () => {
    // sonetto is 1-10 12-13 15-21...
    const { user } = await setup({ ranges: [{ a: '10', b: '14' }] });

    await user.click(screen.getByRole('button', { description: 'Select all' }));
    await selectPreset(user, 'sonetto');
    await user.click(
      screen.getByRole('button', { description: 'Deselect preset' }),
    );
    await user.type(screen.getByLabelText('layout'), 'x{Enter}');

    expect(poems()).toEqual(['10', '11 x', '12', '13', '14 x']);
  });

  it('should offer all the presets', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('combobox', { name: 'presets' }));

    const options = await screen.findAllByRole('option');
    expect(options.map((o) => o.textContent?.trim())).toEqual([
      'sonetto',
      'canzone',
      'ballata',
      'madrigale',
      'sestina',
    ]);
  });

  it('should clear the layout of a poem from its row', async () => {
    const { user } = await setup({
      ranges: [{ a: '1', b: '3' }],
      layouts: [{ range: { a: '1', b: '3' }, layout: 'x' }],
    });

    await user.click(
      within(poemRows()[1]).getByRole('button', {
        description: 'Clear this layout',
      }),
    );

    expect(poems()).toEqual(['1 x', '2', '3 x']);
  });

  it('should emit the layouts collapsed into ranges', async () => {
    const { user, layoutsChange } = await setup({
      ranges: [{ a: '1', b: '6' }],
    });

    await user.click(checkPoem(0));
    await user.keyboard('{Shift>}');
    await user.click(checkPoem(3));
    await user.keyboard('{/Shift}');
    await user.type(screen.getByLabelText('layout'), 'x{Enter}');
    await user.click(saveButton());

    expect(layoutsChange).toHaveBeenCalledTimes(1);
    expect(layoutsChange).toHaveBeenCalledWith([
      { range: { a: '1', b: '4' }, layout: 'x', note: undefined },
    ]);
  });

  it('should emit the note edited for a poem', async () => {
    const { user, layoutsChange } = await setup({
      ranges: [{ a: '1', b: '3' }],
      layouts: [{ range: { a: '1', b: '3' }, layout: 'x' }],
    });

    await user.click(
      within(poemRows()[1]).getByRole('button', {
        description: 'Edit note for this layout',
      }),
    );
    await user.type(screen.getByRole('textbox', { name: '' }), 'a note{Enter}');
    await user.click(saveButton());

    expect(layoutsChange).toHaveBeenCalledWith([
      { range: { a: '1', b: undefined }, layout: 'x', note: undefined },
      { range: { a: '2', b: undefined }, layout: 'x', note: 'a note' },
      { range: { a: '3', b: undefined }, layout: 'x', note: undefined },
    ]);
  });

  it('should emit no layouts when none is set', async () => {
    const { user, layoutsChange } = await setup({
      ranges: [{ a: '1', b: '3' }],
    });

    await user.click(saveButton());

    expect(layoutsChange).toHaveBeenCalledWith([]);
  });
});
