import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

import { deepCopy } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';

import { LetterInfoPart, LETTER_INFO_PART_TYPEID } from '../letter-info-part';

/**
 * LetterInfo part editor component.
 */
@Component({
  selector: 'cadmus-letter-info-part',
  templateUrl: './letter-info-part.component.html',
  styleUrls: ['./letter-info-part.component.css'],
})
export class LetterInfoPartComponent
  extends ModelEditorComponentBase<LetterInfoPart>
  implements OnInit
{
  public subject: FormControl<string|null>;
  public header: FormControl<string|null>;
  public textDate: FormControl<string|null>;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService);
    // form
    this.subject = formBuilder.control(null, Validators.maxLength(200));
    this.header = formBuilder.control(null, Validators.maxLength(500));
    this.textDate = formBuilder.control(null, Validators.maxLength(100));
    this.form = formBuilder.group({
      subject: this.subject,
      header: this.header,
      textDate: this.textDate,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: LetterInfoPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.subject.setValue(model.subject || null);
    this.header.setValue(model.header || null);
    this.textDate.setValue(model.textDate || null);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: LetterInfoPart): void {
    this.updateForm(deepCopy(model));
  }

  protected getModelFromForm(): LetterInfoPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: LETTER_INFO_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
      };
    }
    part.subject = this.subject.value?.trim();
    part.header = this.header.value?.trim();
    part.textDate = this.textDate.value?.trim();
    return part;
  }
}
