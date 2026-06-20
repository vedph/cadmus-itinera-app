import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

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

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  CADMUS_TEXT_ED_BINDINGS_TOKEN,
  CadmusTextEdBindings,
  CadmusTextEdService,
} from '@myrmidon/cadmus-text-ed';

import { PersonInfoPart, PERSON_INFO_PART_TYPEID } from '../person-info-part';

/**
 * PersonInfo part editor component.
 * Thesauri: person-sex (optional).
 */
@Component({
  selector: 'cadmus-person-info-part',
  templateUrl: './person-info-part.component.html',
  styleUrls: ['./person-info-part.component.css'],
  providers: [CadmusTextEdService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  ],
})
export class PersonInfoPartComponent
  extends ModelEditorComponentBase<PersonInfoPart>
  implements OnInit, OnDestroy
{
  private _editor?: StandaloneCodeEditor;
  public readonly editorOptions: StandaloneEditorConstructionOptions = {
    minimap: { side: 'right' },
    wordWrap: 'on',
    automaticLayout: true,
  };

  public sex: FormControl<string | null>;
  public bio: FormControl<string | null>;

  // person-sex
  public readonly sexEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _editService: CadmusTextEdService,
    @Inject(CADMUS_TEXT_ED_BINDINGS_TOKEN)
    @Optional()
    private _editorBindings?: CadmusTextEdBindings,
  ) {
    super(authService, formBuilder);
    // form
    this.sex = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.bio = formBuilder.control(null, Validators.maxLength(50000));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

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
  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      sex: this.sex,
      bio: this.bio,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    const key = 'person-sex';
    if (this.hasThesaurus(key)) {
      this.sexEntries.set(thesauri[key].entries);
    } else {
      this.sexEntries.set(undefined);
    }
  }

  private updateForm(part?: PersonInfoPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.sex.setValue(part.sex);
    this.bio.setValue(part.bio || null);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<PersonInfoPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): PersonInfoPart {
    let part = this.getEditedPart(PERSON_INFO_PART_TYPEID) as PersonInfoPart;
    part.sex = this.sex.value?.trim() || '';
    part.bio = this.bio.value?.trim();
    return part;
  }
}
