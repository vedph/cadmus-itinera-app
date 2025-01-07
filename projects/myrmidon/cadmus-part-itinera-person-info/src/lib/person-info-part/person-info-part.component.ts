import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormControl, FormBuilder, Validators, FormGroup, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase, CloseSaveButtonsComponent } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PersonInfoPart, PERSON_INFO_PART_TYPEID } from '../person-info-part';
import {
  CADMUS_TEXT_ED_BINDINGS_TOKEN,
  CadmusTextEdBindings,
  CadmusTextEdService,
} from '@myrmidon/cadmus-text-ed';
import { MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { NgeMonacoModule } from '@cisstech/nge/monaco';

/**
 * PersonInfo part editor component.
 * Thesauri: person-sex (optional).
 */
@Component({
    selector: 'cadmus-person-info-part',
    templateUrl: './person-info-part.component.html',
    styleUrls: ['./person-info-part.component.css'],
    providers: [CadmusTextEdService],
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
        NgeMonacoModule,
        MatCardActions,
        CloseSaveButtonsComponent,
    ],
})
export class PersonInfoPartComponent
  extends ModelEditorComponentBase<PersonInfoPart>
  implements OnInit, OnDestroy
{
  private readonly _disposables: monaco.IDisposable[] = [];
  private _editorModel?: monaco.editor.ITextModel;
  private _editor?: monaco.editor.IStandaloneCodeEditor;

  public sex: FormControl<string | null>;
  public bio: FormControl<string | null>;

  // person-sex
  public sexEntries: ThesaurusEntry[] | undefined;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _editService: CadmusTextEdService,
    @Inject(CADMUS_TEXT_ED_BINDINGS_TOKEN)
    @Optional()
    private _editorBindings?: CadmusTextEdBindings
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

  public override ngOnDestroy() {
    this._disposables.forEach((d) => d.dispose());
  }

  private async applyEdit(selector: string) {
    if (!this._editor) {
      return;
    }
    const selection = this._editor.getSelection();
    const text = selection
      ? this._editor.getModel()!.getValueInRange(selection)
      : '';

    const result = await this._editService.edit({
      selector,
      text: text,
    });

    this._editor.executeEdits('my-source', [
      {
        range: selection!,
        text: result.text,
        forceMoveMarkers: true,
      },
    ]);
  }

  public onCreateEditor(editor: monaco.editor.IEditor) {
    editor.updateOptions({
      minimap: {
        side: 'right',
      },
      wordWrap: 'on',
      automaticLayout: true,
    });
    this._editorModel =
      this._editorModel ||
      monaco.editor.createModel('# Hello world', 'markdown');
    editor.setModel(this._editorModel);
    this._editor = editor as monaco.editor.IStandaloneCodeEditor;

    this._disposables.push(
      this._editorModel.onDidChangeContent((e) => {
        console.log(this._editorModel!.getValue());
        this.bio.setValue(this._editorModel!.getValue());
        this.bio.markAsDirty();
        this.bio.updateValueAndValidity();
      })
    );

    if (this._editorBindings) {
      Object.keys(this._editorBindings).forEach((key) => {
        const n = parseInt(key, 10);
        console.log(
          'Binding ' + n + ' to ' + this._editorBindings![key as any]
        );
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
      this.sexEntries = thesauri[key].entries;
    } else {
      this.sexEntries = undefined;
    }
  }

  private updateForm(part?: PersonInfoPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.sex.setValue(part.sex);
    this.bio.setValue(part.bio || null);
    this._editorModel?.setValue(part.bio || '');
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
