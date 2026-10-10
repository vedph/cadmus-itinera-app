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
import { RelatedPerson } from '../related-persons-part';
import { RelatedPersonComponent } from './related-person.component';

const PERSON: RelatedPerson = {
  type: 'teacher',
  name: 'Brunetto Latini',
  ids: [
    { target: { gid: 'http://viaf.org/viaf/1', label: 'Brunetto (VIAF)' } },
    { target: { gid: 'http://dbpedia.org/2', label: 'Brunetto (DBpedia)' } },
  ],
};

async function setup(
  options: {
    person?: RelatedPerson;
    prsTypeEntries?: ThesaurusEntry[];
  } = {},
) {
  const mocks = createPartEditorMocks();
  const person = signal<RelatedPerson | undefined>(options.person);
  const personChange = vi.fn();
  const editorClose = vi.fn();
  const view = await render(RelatedPersonComponent, {
    providers: [...mocks.providers, ...createAssertedIdMocks()],
    bindings: [
      inputBinding('person', person),
      inputBinding('prsTypeEntries', () => options.prsTypeEntries),
      outputBinding('personChange', personChange),
      outputBinding('editorClose', editorClose),
    ],
  });
  return {
    ...view,
    user: userEvent.setup(),
    person,
    personChange,
    editorClose,
  };
}

const type = () => screen.getByRole('textbox', { name: 'type' });
const name = () => screen.getByRole('textbox', { name: 'name' });
const ids = () => screen.getByRole('group', { name: 'IDs' });
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });

describe('RelatedPersonComponent', () => {
  it('should show an empty form which cannot be saved', async () => {
    await setup();

    expect(type()).toHaveValue('');
    expect(name()).toHaveValue('');
    expect(within(ids()).queryByRole('table')).not.toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should show the bound person without making the form dirty', async () => {
    await setup({ person: PERSON });

    expect(type()).toHaveValue('teacher');
    expect(name()).toHaveValue('Brunetto Latini');
    expect(
      within(ids()).getByRole('cell', { name: 'Brunetto (VIAF)' }),
    ).toBeInTheDocument();
    expect(
      within(ids()).getByRole('cell', { name: 'http://dbpedia.org/2' }),
    ).toBeInTheDocument();
    // valid, but pristine
    expect(acceptButton()).toBeDisabled();
  });

  it('should update the form when another person is bound', async () => {
    const { person, fixture } = await setup({ person: PERSON });

    person.set({ type: 'friend', name: 'Guido Cavalcanti' });
    await fixture.whenStable();

    expect(type()).toHaveValue('friend');
    expect(name()).toHaveValue('Guido Cavalcanti');
    expect(within(ids()).queryByRole('table')).not.toBeInTheDocument();
  });

  it('should reset the form when the person is unbound', async () => {
    const { person, fixture } = await setup({ person: PERSON });

    person.set(undefined);
    await fixture.whenStable();

    expect(type()).toHaveValue('');
    expect(name()).toHaveValue('');
    expect(within(ids()).queryByRole('table')).not.toBeInTheDocument();
  });

  it('should emit the edited person with trimmed values on save', async () => {
    const { user, personChange } = await setup({ person: PERSON });

    await user.clear(type());
    await user.type(type(), '  friend  ');
    await user.clear(name());
    await user.type(name(), '  Guido Cavalcanti  ');
    await user.click(acceptButton());

    expect(personChange).toHaveBeenCalledTimes(1);
    expect(personChange).toHaveBeenCalledWith({
      type: 'friend',
      name: 'Guido Cavalcanti',
      ids: PERSON.ids,
    });
  });

  it('should emit the person without the IDs deleted by the user', async () => {
    const { user, personChange } = await setup({
      person: { ...PERSON, ids: [PERSON.ids![0]] },
    });

    // the buttons of the IDs brick have no accessible name: the last one
    // in the row of an ID deletes it
    const row = within(ids()).getAllByRole('row')[1];
    const buttons = within(row).getAllByRole('button');
    await user.click(buttons[buttons.length - 1]);
    await waitFor(() =>
      expect(within(ids()).queryByRole('table')).not.toBeInTheDocument(),
    );
    await user.click(acceptButton());

    expect(personChange).toHaveBeenCalledTimes(1);
    expect(personChange.mock.calls[0][0]).toEqual({
      type: 'teacher',
      name: 'Brunetto Latini',
      ids: undefined,
    });
  });

  it('should pick the type from the thesaurus when available', async () => {
    const { user, personChange } = await setup({
      person: { ...PERSON, type: 't' },
      prsTypeEntries: [
        { id: 't', value: 'teacher' },
        { id: 'f', value: 'friend' },
      ],
    });

    const select = screen.getByRole('combobox', { name: 'type' });
    await waitFor(() => expect(select).toHaveTextContent('teacher'));
    await user.click(select);
    await user.click(await screen.findByRole('option', { name: 'friend' }));
    await user.click(acceptButton());

    expect(personChange).toHaveBeenCalledTimes(1);
    expect(personChange.mock.calls[0][0].type).toBe('f');
  });

  it('should require type and name', async () => {
    const { user, personChange } = await setup({ person: PERSON });

    await user.clear(type());
    await user.clear(name());
    await user.tab();

    expect(screen.getByText('type required')).toBeInTheDocument();
    expect(screen.getByText('name required')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
    await user.type(name(), '{Enter}');
    expect(personChange).not.toHaveBeenCalled();
  });

  it('should reject a type longer than 50 characters', async () => {
    const { user } = await setup({ person: PERSON });

    await user.clear(type());
    await user.type(type(), 'x'.repeat(51));
    await user.tab();

    expect(screen.getByText('type too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject a name longer than 50 characters', async () => {
    const { user } = await setup({ person: PERSON });

    await user.clear(name());
    await user.type(name(), 'x'.repeat(51));
    await user.tab();

    expect(screen.getByText('name too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should request to close without saving on discard', async () => {
    const { user, personChange, editorClose } = await setup({
      person: PERSON,
    });

    await user.type(name(), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(editorClose).toHaveBeenCalledTimes(1);
    expect(personChange).not.toHaveBeenCalled();
  });
});
