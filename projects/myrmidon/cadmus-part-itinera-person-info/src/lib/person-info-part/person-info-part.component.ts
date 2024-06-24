import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PersonInfoPart, PERSON_INFO_PART_TYPEID } from '../person-info-part';

/**
 * PersonInfo part editor component.
 * Thesauri: person-sex (optional).
 */
@Component({
  selector: 'cadmus-person-info-part',
  templateUrl: './person-info-part.component.html',
  styleUrls: ['./person-info-part.component.css'],
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

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
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

    // TODO configure plugins
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
