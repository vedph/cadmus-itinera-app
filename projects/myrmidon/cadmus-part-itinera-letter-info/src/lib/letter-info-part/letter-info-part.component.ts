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
  public subject: FormControl;
  public header: FormControl;
  public textDate: FormControl;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService);
    // form
    this.subject = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(200),
    ]);
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
    this.subject.setValue(model.subject);
    this.header.setValue(model.header);
    this.textDate.setValue(model.textDate);
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
        subject: '',
      };
    }
    part.subject = this.subject.value?.trim();
    part.header = this.header.value?.trim();
    part.textDate = this.textDate.value?.trim();
    return part;
  }
}
