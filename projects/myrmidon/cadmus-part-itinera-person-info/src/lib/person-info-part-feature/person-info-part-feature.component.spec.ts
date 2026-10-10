import { NgxMonacoEditorComponent } from '@jean-merelis/ngx-monaco-editor';
import { render, screen, waitFor } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { MonacoEditorStubComponent } from '../../../../../testing/monaco-editor-stub';
import {
  createEditedObject,
  createPart,
  createPartEditorMocks,
  createPartFeatureMocks,
  createThesauri,
  CurrentItemBarStubComponent,
  PartFeatureMocksOptions,
  TEST_ITEM_ID,
  TEST_PART_ID,
} from '../../../../../testing/part-testing';
import { PersonInfoPartComponent } from '../person-info-part/person-info-part.component';
import { PERSON_INFO_PART_TYPEID, PersonInfoPart } from '../person-info-part';
import { PersonInfoPartFeatureComponent } from './person-info-part-feature.component';

const PART = createPart<PersonInfoPart>(PERSON_INFO_PART_TYPEID, {
  sex: 'm',
  bio: 'Born in Florence.',
});

const THESAURI = createThesauri({
  'person-sex': [
    { id: 'm', value: 'male' },
    { id: 'f', value: 'female' },
  ],
});

async function setup(options: Partial<PartFeatureMocksOptions> = {}) {
  const mocks = createPartFeatureMocks({
    typeId: PERSON_INFO_PART_TYPEID,
    data: createEditedObject(PART, THESAURI),
    ...options,
  });
  const view = await render(PersonInfoPartFeatureComponent, {
    providers: [...createPartEditorMocks().providers, ...mocks.providers],
    importOverrides: [
      { replace: CurrentItemBarComponent, with: CurrentItemBarStubComponent },
    ],
    configureTestBed: (testbed) => {
      // the Monaco editor cannot work in jsdom
      testbed.overrideComponent(PersonInfoPartComponent, {
        remove: { imports: [NgxMonacoEditorComponent] },
        add: { imports: [MonacoEditorStubComponent] },
      });
    },
  });
  return { ...view, user: userEvent.setup(), mocks };
}

const bio = () => screen.getByRole('textbox', { name: 'code editor' });

describe('PersonInfoPartFeatureComponent', () => {
  it('should load the part of the route with its thesauri', async () => {
    const { mocks } = await setup();

    expect(mocks.editorService.load).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: PERSON_INFO_PART_TYPEID,
        partId: TEST_PART_ID,
        roleId: undefined,
      },
      ['person-sex'],
    );
    await waitFor(() => expect(bio()).toHaveValue('Born in Florence.'));
    // the thesaurus reaches the editor too
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'sex' })).toHaveTextContent(
        'male',
      ),
    );
  });

  it('should load a new part with its role', async () => {
    const { mocks } = await setup({ pid: 'new', rid: 'copy', data: null });

    expect(mocks.editorService.load).toHaveBeenCalledWith(
      {
        itemId: TEST_ITEM_ID,
        typeId: PERSON_INFO_PART_TYPEID,
        partId: null,
        roleId: 'copy',
      },
      ['person-sex'],
    );
    expect(bio()).toHaveValue('');
  });

  it('should report a loading error', async () => {
    const { mocks } = await setup({ loadError: new Error('load failed') });

    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith('load failed', 'OK'),
    );
  });

  it('should save the part edited by the user', async () => {
    const { user, mocks } = await setup();

    await waitFor(() => expect(bio()).toHaveValue('Born in Florence.'));
    await user.type(bio(), ' Died in Ravenna.');
    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(mocks.editorService.save).toHaveBeenCalledTimes(1);
    expect(mocks.editorService.save.mock.calls[0][0]).toMatchObject({
      id: TEST_PART_ID,
      sex: 'm',
      bio: 'Born in Florence. Died in Ravenna.',
    });
    await waitFor(() =>
      expect(mocks.snackbar.open).toHaveBeenCalledWith(
        'Part saved',
        'OK',
        expect.anything(),
      ),
    );
  });

  it('should report a saving error', async () => {
    const { user, mocks } = await setup({
      saveError: new Error('save failed'),
    });

    await waitFor(() => expect(bio()).toHaveValue('Born in Florence.'));
    await user.type(bio(), ' Died in Ravenna.');
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
