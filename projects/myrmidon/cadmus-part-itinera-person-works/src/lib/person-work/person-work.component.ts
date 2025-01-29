import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Assertion, AssertionComponent } from '@myrmidon/cadmus-refs-assertion';

import { PersonWork } from '../person-works-part';

@Component({
  selector: 'cadmus-person-work',
  templateUrl: './person-work.component.html',
  styleUrls: ['./person-work.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatCheckbox,
    AssertionComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class PersonWorkComponent {
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  public readonly work = model<PersonWork>();

  public readonly editorClose = output();

  public eid: FormControl<string | null>;
  public title: FormControl<string | null>;
  public hasAssertion: FormControl<boolean>;
  public assertion: FormControl<Assertion | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.title = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.hasAssertion = formBuilder.control(false, { nonNullable: true });
    this.assertion = formBuilder.control(null);
    this.form = formBuilder.group({
      eid: this.eid,
      title: this.title,
      hasAssertion: this.hasAssertion,
      assertion: this.assertion,
    });

    effect(() => {
      this.updateForm(this.work());
    });
  }

  private updateForm(model: PersonWork | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.eid.setValue(model.eid || null);
    this.title.setValue(model.title);
    this.assertion.setValue(model.assertion || null);
    this.hasAssertion.setValue(model.assertion ? true : false);
    this.form.markAsPristine();
  }

  private getWork(): PersonWork {
    return {
      eid: this.eid.value?.trim(),
      title: this.title.value?.trim() || '',
      assertion: this.hasAssertion.value
        ? this.assertion.value || undefined
        : undefined,
    };
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    this.assertion.setValue(assertion || null);
    this.assertion.updateValueAndValidity();
    this.assertion.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.work.set(this.getWork());
  }
}
