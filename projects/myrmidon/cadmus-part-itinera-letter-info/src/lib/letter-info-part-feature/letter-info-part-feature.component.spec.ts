import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import {
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createPartFeatureMocks,
  CurrentItemBarStubComponent,
  PartFeatureMocksOptions,
  TEST_ITEM_ID,
  TEST_PART_ID,
} from '../../../../../testing/part-testing';
import { LETTER_INFO_PART_TYPEID, LetterInfoPart } from '../letter-info-part';
import { LetterInfoPartFeatureComponent } from './letter-info-part-feature.component';

const PART = createPart<LetterInfoPart>(LETTER_INFO_PART_TYPEID, {
  subject: 'On the journey',
  header: 'To my dear friend',
  textDate: 'Kal. Mai.',
});

async function setup(options: Partial<PartFeatureMocksOptions> = {}) {
  const mocks = createPartFeatureMocks({
    typeId: LETTER_INFO_PART_TYPEID,
    data: createEditedObject(PART),
    ...options,
  });
  const view = await render(LetterInfoPartFeatureComponent, {
    providers: [...createPartEditorMocks().providers, ...mocks.providers],
    importOverrides: [
      { replace: CurrentItemBarComponent, with: CurrentItemBarStubComponent },
    ],
  });
  return { ...view, user: userEvent.setup(), mocks };
}

describe('LetterInfoPartFeatureComponent', () => {
  it('should load the part of the route without thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: LETTER_INFO_PART_TYPEID,
        partId: TEST_PART_ID,
        roleId: undefined,
      },
      [],
    );
    await waitFor(() =>
      expect(screen.getByLabelText('subject')).toHaveValue('On the journey'),
    );
    expect(screen.getByLabelText('header')).toHaveValue('To my dear friend');
    expect(screen.getByLabelText('text date')).toHaveValue('Kal. Mai.');
  });

  it('should load a new part with its role', async () => {
    const { mocks } = await setup({ pid: 'new', rid: 'copy', data: null });

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: LETTER_INFO_PART_TYPEID,
        partId: null,
        roleId: 'copy',
      },
      [],
    );
    expect(screen.getByLabelText('subject')).toHaveValue('');
  });

  it('should report a loading error', async () => {
    const { mocks } = await setup({ loadError: new Error('load failed') });

    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith('load failed', 'OK'),
    );
  });

  it('should save the part edited by the user', async () => {
    const { user, mocks } = await setup();

    await waitFor(() =>
      expect(screen.getByLabelText('header')).toHaveValue('To my dear friend'),
    );
    await user.type(screen.getByLabelText('header'), '!');
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.save.mock.calls[0][0]).toMatchObject({
      id: TEST_PART_ID,
      subject: 'On the journey',
      header: 'To my dear friend!',
      textDate: 'Kal. Mai.',
    });
    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith(
        'Part saved',
        'OK',
        expect.anything(),
      ),
    );
  });

  it('should save a new part for the item of the route', async () => {
    const { user, mocks } = await setup({ pid: 'new', data: null });

    await user.type(screen.getByLabelText('subject'), 'New subject');
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.save.mock.calls[0][0]).toMatchObject({
      itemId: TEST_ITEM_ID,
      typeId: LETTER_INFO_PART_TYPEID,
      subject: 'New subject',
    });
  });

  it('should report a saving error', async () => {
    const { user, mocks } = await setup({
      saveError: new Error('save failed'),
    });

    await waitFor(() =>
      expect(screen.getByLabelText('header')).toHaveValue('To my dear friend'),
    );
    await user.type(screen.getByLabelText('header'), '!');
    await user.click(screen.getByRole('button', { name: /save/ }));

    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith('save failed', 'OK'),
    );
  });

  it('should go back to the item on close', async () => {
    const { user, mocks } = await setup();

    await user.click(await screen.findByRole('button', { name: /close/ }));

    expect(mocks.router.navigate).toHaveBeenCalledWith(['items', TEST_ITEM_ID]);
  });
});
