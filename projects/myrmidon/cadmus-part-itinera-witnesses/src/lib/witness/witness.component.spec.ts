import { inputBinding, outputBinding, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { createPartEditorMocks } from '../../../../../testing/part-testing';
import { Witness } from '../witnesses-part';
import { WitnessComponent } from './witness.component';

const WITNESS: Witness = {
  id: 'Laur. Plut. 40.2',
  ranges: [
    { start: { n: 12, v: false }, end: { n: 13, v: true } },
    { start: { n: 20, v: false }, end: { n: 20, v: false } },
  ],
};

async function setup(initial?: Witness) {
  const witness = signal<Witness | undefined>(initial);
  const witnessChange = vi.fn();
  const editorClose = vi.fn();
  const view = await render(WitnessComponent, {
    providers: createPartEditorMocks().providers,
    bindings: [
      inputBinding('witness', witness),
      outputBinding('witnessChange', witnessChange),
      outputBinding('editorClose', editorClose),
    ],
  });
  return {
    ...view,
    user: userEvent.setup(),
    witness,
    witnessChange,
    editorClose,
  };
}

const id = () => screen.getByLabelText('ID');
const location = () => screen.getByLabelText('location');
const acceptButton = () =>
  screen.getByRole('button', { description: 'Accept changes' });

describe('WitnessComponent', () => {
  it('should show an empty form which cannot be saved', async () => {
    await setup();

    expect(id()).toHaveValue('');
    expect(location()).toHaveValue('');
    expect(acceptButton()).toBeDisabled();
  });

  it('should show the bound witness without making the form dirty', async () => {
    await setup(WITNESS);

    expect(id()).toHaveValue('Laur. Plut. 40.2');
    expect(location()).toHaveValue('12r-13v 20r');
    // valid, but pristine
    expect(acceptButton()).toBeDisabled();
  });

  it('should update the form when another witness is bound', async () => {
    const { witness, fixture } = await setup(WITNESS);

    witness.set({
      id: 'Vat. lat. 3199',
      ranges: [{ start: { n: 1, v: false }, end: { n: 1, v: false } }],
    });
    await fixture.whenStable();

    expect(id()).toHaveValue('Vat. lat. 3199');
    expect(location()).toHaveValue('1r');
  });

  it('should reset the form when the witness is unbound', async () => {
    const { witness, fixture } = await setup(WITNESS);

    witness.set(undefined);
    await fixture.whenStable();

    expect(id()).toHaveValue('');
    expect(location()).toHaveValue('');
  });

  it('should emit the edited witness with a trimmed ID on save', async () => {
    const { user, witnessChange } = await setup(WITNESS);

    await user.clear(id());
    await user.type(id(), '  Vat. lat. 3199  ');
    await user.click(acceptButton());

    expect(witnessChange).toHaveBeenCalledTimes(1);
    expect(witnessChange).toHaveBeenCalledWith({
      id: 'Vat. lat. 3199',
      ranges: WITNESS.ranges,
    });
  });

  it('should emit the ranges typed by the user', async () => {
    const { user, witnessChange } = await setup(WITNESS);

    await user.clear(location());
    await user.type(location(), '3v-4r 7r');
    // the location is emitted with a delay
    await waitFor(() => expect(acceptButton()).toBeEnabled());
    await user.click(acceptButton());

    expect(witnessChange).toHaveBeenCalledTimes(1);
    const saved: Witness = witnessChange.mock.calls[0][0];
    expect(saved.ranges).toHaveLength(2);
    expect(saved.ranges[0].start).toMatchObject({ n: 3, v: true });
    expect(saved.ranges[0].end).toMatchObject({ n: 4, v: false });
    expect(saved.ranges[1].start).toMatchObject({ n: 7, v: false });
    expect(saved.ranges[1].end).toMatchObject({ n: 7, v: false });
  });

  it('should not allow saving a new witness without a location', async () => {
    const { user, witnessChange } = await setup({ id: '', ranges: [] });

    await user.type(id(), 'Vat. lat. 3199');

    expect(acceptButton()).toBeDisabled();
    await user.type(id(), '{Enter}');
    expect(witnessChange).not.toHaveBeenCalled();

    await user.type(location(), '3v');
    await waitFor(() => expect(acceptButton()).toBeEnabled());
  });

  it('should require the ID', async () => {
    const { user } = await setup(WITNESS);

    await user.clear(id());
    await user.tab();

    expect(screen.getByText('ID required')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should reject an ID longer than 500 characters', async () => {
    const { user } = await setup(WITNESS);

    await user.clear(id());
    await user.click(id());
    await user.paste('x'.repeat(501));
    await user.tab();

    expect(screen.getByText('ID too long')).toBeInTheDocument();
    expect(acceptButton()).toBeDisabled();
  });

  it('should request to close without saving on discard', async () => {
    const { user, witnessChange, editorClose } = await setup(WITNESS);

    await user.type(id(), ' changed');
    await user.click(
      screen.getByRole('button', { description: 'Discard changes' }),
    );

    expect(editorClose).toHaveBeenCalledTimes(1);
    expect(witnessChange).not.toHaveBeenCalled();
  });
});
