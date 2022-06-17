import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

import { deepCopy } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
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
  implements OnInit
{
  public sex: FormControl<string | null>;
  public bio: FormControl<string | null>;

  public editorOptions = {
    theme: 'vs-light',
    language: 'markdown',
    wordWrap: 'on',
    // https://github.com/atularen/ngx-monaco-editor/issues/19
    automaticLayout: true,
  };

  // person-sex
  public sexEntries: ThesaurusEntry[] | undefined;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService);
    // form
    this.sex = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.bio = formBuilder.control(null, Validators.maxLength(5000));
    this.form = formBuilder.group({
      sex: this.sex,
      bio: this.bio,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: PersonInfoPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.sex.setValue(model.sex);
    this.bio.setValue(model.bio || null);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: PersonInfoPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    const key = 'person-sex';
    if (this.thesauri && this.thesauri[key]) {
      this.sexEntries = this.thesauri[key].entries;
    } else {
      this.sexEntries = undefined;
    }
  }

  protected getModelFromForm(): PersonInfoPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: PERSON_INFO_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        sex: '-',
      };
    }
    part.sex = this.sex.value?.trim() || '';
    part.bio = this.bio.value?.trim();
    return part;
  }
}
