import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';

import { LetterInfoPart, LETTER_INFO_PART_TYPEID } from '../letter-info-part';

/**
 * LetterInfo part editor component.
 */
@Component({
  selector: 'cadmus-letter-info-part',
  templateUrl: './letter-info-part.component.html',
  styleUrls: ['./letter-info-part.component.css'],
  standalone: false,
})
export class LetterInfoPartComponent
  extends ModelEditorComponentBase<LetterInfoPart>
  implements OnInit
{
  public subject: FormControl<string | null>;
  public header: FormControl<string | null>;
  public textDate: FormControl<string | null>;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    this.subject = formBuilder.control(null, Validators.maxLength(3000));
    this.header = formBuilder.control(null, Validators.maxLength(500));
    this.textDate = formBuilder.control(null, Validators.maxLength(100));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      subject: this.subject,
      header: this.header,
      textDate: this.textDate,
    });
  }

  private updateForm(part?: LetterInfoPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.subject.setValue(part.subject || null);
    this.header.setValue(part.header || null);
    this.textDate.setValue(part.textDate || null);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<LetterInfoPart>): void {
    this.updateForm(data?.value);
  }

  protected getValue(): LetterInfoPart {
    let part = this.getEditedPart(LETTER_INFO_PART_TYPEID) as LetterInfoPart;
    part.subject = this.subject.value?.trim();
    part.header = this.header.value?.trim();
    part.textDate = this.textDate.value?.trim();
    return part;
  }
}
