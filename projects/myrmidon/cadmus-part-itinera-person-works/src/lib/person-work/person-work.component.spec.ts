import { inputBinding, outputBinding, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { createPartEditorMocks } from '../../../../../testing/part-testing';
import { PersonWork } from '../person-works-part';
import { PersonWorkComponent } from './person-work.component';

const WORK: PersonWork = {
  eid: 'commedia',
  title: 'Commedia',
};

async function setup(
  options: {
    work?: PersonWork;
    assTagEntries?: ThesaurusEntry[];
  } = {},
) {
  const work = signal<PersonWork | undefined>(options.work);
  const workChange = vi.fn();
  const editorClose = vi.fn();
  const view = await render(PersonWorkComponent, {
    providers: createPartEditorMocks().providers,
    bindings: [
      inputBinding('work', work),
      inputBinding('assTagEntries', () => options.assTagEntries),
      outputBinding('workChange', workChange),
      outputBinding('editorClose', editorClose),
    ],
  });
  return { ...view, user: userEvent.setup(), work, workChange, editorClose };
}

const title = () => screen.getByLabelText('title');
const eid = () => screen.getByLabelText('EID');
const assertion = () => screen.getByRole('checkbox', { name: 'assertion' });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });

describe('PersonWorkComponent', () => {
  it('should show an empty form which cannot be saved', async () => {
    await setup();

    expect(title()).toHaveValue('');
    expect(eid()).toHaveValue('');
    expect(assertion()).not.toBeChecked();
    expect(acceptButton()).toBeDisabled();
  });

  it('should show the bound work without making the form dirty', async () => {
    await setup({ work: WORK });

    expect(title()).toHaveValue('Commedia');
    expect(eid()).toHaveValue('commedia');
    expect(assertion()).not.toBeChecked();
    expect(screen.queryByLabelText('rank')).not.toBeInTheDocument();
    // valid, but pristine
    expect(acceptButton()).toBeDisabled();
  });

  it('should show the assertion of the bound work', async () => {
    await setup({ work: { ...WORK, assertion: { tag: 'dubious', rank: 3 } } });

    expect(assertion()).toBeChecked();
    expect(screen.getByLabelText('tag')).toHaveValue('dubious');
    expect(screen.getByLabelText('rank')).toHaveValue(3);
  });

  it('should update the form when another work is bound', async () => {
    const { work, fixture } = await setup({ work: WORK });

    work.set({ title: 'Convivio' });
    await fixture.whenStable();

    expect(title()).toHaveValue('Convivio');
    expect(eid()).toHaveValue('');
  });

  it('should reset the form when the work is unbound', async () => {
    const { work, fixture } = await setup({
      work: { ...WORK, assertion: { rank: 1 } },
    });

    work.set(undefined);
    await fixture.whenStable();

    expect(title()).toHaveValue('');
    expect(eid()).toHaveValue('');
    expect(assertion()).not.toBeChecked();
  });

  it('should emit the edited work with trimmed values on save', async () => {
    const { user, workChange } = await setup({ work: WORK });

    await user.clear(title());
    await user.type(title(), '  Vita nova  ');
    await user.clear(eid());
    await user.type(eid(), '  vita-nova  ');
    await user.click(acceptButton());

    expect(workChange).toHaveBeenCalledTimes(1);
    expect(workChange).toHaveBeenCalledWith({
      eid: 'vita-nova',
      title: 'Vita nova',
      assertion: undefined,
    });
  });

  it('should emit no EID when it is emptied', async () => {
    const { user, workChange } = await setup({ work: WORK });

    await user.clear(eid());
    await user.click(acceptButton());

    expect(workChange).toHaveBeenCalledTimes(1);
    expect(workChange.mock.calls[0][0].eid).toBeFalsy();
    expect(workChange.mock.calls[0][0].title).toBe('Commedia');
  });

  it('should emit the assertion added by the user', async () => {
    const { user, workChange } = await setup({ work: WORK });

    await user.click(assertion());
    await user.type(await screen.findByLabelText('tag'), 'dubious');
    // the assertion is emitted with a delay, while the form is already
    // dirty and valid: there is nothing to wait for but time
    await new Promise((resolve) => setTimeout(resolve, 500));
    await user.click(acceptButton());

    expect(workChange).toHaveBeenCalledTimes(1);
    expect(workChange.mock.calls[0][0].assertion).toMatchObject({
      tag: 'dubious',
    });
  });

  it('should drop the assertion when unchecked', async () => {
    const { user, workChange } = await setup({
      work: { ...WORK, assertion: { tag: 'dubious', rank: 3 } },
    });

    await user.click(assertion());
    await user.click(acceptButton());

    expect(screen.queryByLabelText('rank')).not.toBeInTheDocument();
    expect(workChange).toHaveBeenCalledTimes(1);
    expect(workChange.mock.calls[0][0].assertion).toBeUndefined();
  });

  it('should pick the assertion tag from the thesaurus when available', async () => {
    await setup({
      work: { ...WORK, assertion: { tag: 'd', rank: 3 } },
      assTagEntries: [{ id: 'd', value: 'dubious' }],
    });

    expect(screen.getByRole('combobox', { name: 'tag' })).toBeInTheDocument();
  });

  it('should require the title', async () => {
    const { user, workChange } = await setup({ work: WORK });

    await user.clear(title());
    await user.tab();

    expect(screen.getByText('title required')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
    await user.type(eid(), '{Enter}');
    expect(workChange).not.toHaveBeenCalled();
  });

  it('should reject a title longer than 100 characters', async () => {
    const { user } = await setup({ work: WORK });

    await user.clear(title());
    await user.click(title());
    await user.paste('x'.repeat(101));
    await user.tab();

    expect(screen.getByText('title too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject an EID longer than 100 characters', async () => {
    const { user } = await setup({ work: WORK });

    await user.clear(eid());
    await user.click(eid());
    await user.paste('x'.repeat(101));
    await user.tab();

    expect(screen.getByText('EID too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should request to close without saving on discard', async () => {
    const { user, workChange, editorClose } = await setup({ work: WORK });

    await user.type(title(), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(editorClose).toHaveBeenCalledTimes(1);
    expect(workChange).not.toHaveBeenCalled();
  });
});
