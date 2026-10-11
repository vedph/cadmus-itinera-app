import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormField, maxLength, required } from '@angular/forms/signals';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';

import {
  EditorInitializedEvent,
  NgxMonacoEditorComponent,
  StandaloneCodeEditor,
  StandaloneEditorConstructionOptions,
} from '@jean-merelis/ngx-monaco-editor';

import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  setFieldFromEditor,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CADMUS_TEXT_ED_BINDINGS_TOKEN,
  CadmusTextEdBindings,
  CadmusTextEdService,
} from '@myrmidon/cadmus-text-ed';

import { PersonInfoPart, PERSON_INFO_PART_TYPEID } from '../person-info-part';

interface PersonInfoPartControls {
  sex: string;
  bio: string;
}

function toDraft(part?: PersonInfoPart | null): PersonInfoPartControls {
  return {
    sex: part?.sex || '',
    bio: part?.bio || '',
  };
}

/**
 * PersonInfo part editor component.
 * Thesauri: person-sex (optional).
 */
@Component({
  selector: 'cadmus-person-info-part',
  templateUrl: './person-info-part.component.html',
  styleUrls: ['./person-info-part.component.css'],
  providers: [CadmusTextEdService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    NgxMonacoEditorComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
})
export class PersonInfoPartComponent extends ModelEditorComponentBase<PersonInfoPart> {
  private readonly _editService = inject(CadmusTextEdService);
  private readonly _editorBindings = inject<CadmusTextEdBindings>(
    CADMUS_TEXT_ED_BINDINGS_TOKEN,
    { optional: true },
  );

  private _editor?: StandaloneCodeEditor;
  public readonly editorOptions: StandaloneEditorConstructionOptions = {
    minimap: { side: 'right' },
    wordWrap: 'on',
    automaticLayout: true,
  };

  // person-sex
  public readonly sexEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['person-sex']?.entries,
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    required(p.sex);
    maxLength(p.sex, 50);
    maxLength(p.bio, 50000);
  });

  public readonly setFieldFromEditor = setFieldFromEditor;

  private async applyEdit(selector: string) {
    if (!this._editor) {
      return;
    }
    const selection = this._editor.getSelection();
    const text = selection
      ? this._editor.getModel()!.getValueInRange(selection)
      : '';

    const result = await this._editService.edit({ selector, text });

    this._editor.executeEdits('my-source', [
      {
        range: selection!,
        text: result.text,
        forceMoveMarkers: true,
      },
    ]);
  }

  public onEditorInit(event: EditorInitializedEvent) {
    this._editor = event.editor;
    this._editor.focus();

    if (this._editorBindings) {
      Object.keys(this._editorBindings).forEach((key) => {
        const n = parseInt(key, 10);
        this._editor!.addCommand(n, () => {
          this.applyEdit(this._editorBindings![key as any]);
        });
      });
    }
  }

  protected getValue(): PersonInfoPart {
    let part = this.getEditedPart(PERSON_INFO_PART_TYPEID) as PersonInfoPart;
    const draft = this._draft();
    part.sex = draft.sex.trim();
    part.bio = draft.bio.trim() || undefined;
    return part;
  }
}
