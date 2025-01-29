import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Assertion, AssertionComponent } from '@myrmidon/cadmus-refs-assertion';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { AssertedTitle } from '../literary-work-info-part';

@Component({
  selector: 'cadmus-asserted-title',
  templateUrl: './asserted-title.component.html',
  styleUrls: ['./asserted-title.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    MatCheckbox,
    AssertionComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class AssertedTitleComponent {
  public readonly title = model<AssertedTitle>();

  // literary-work-languages
  public readonly langEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  public language: FormControl<string | null>;
  public value: FormControl<string | null>;
  public hasAssertion: FormControl<boolean>;
  public assertion: FormControl<Assertion | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.language = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.value = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.hasAssertion = formBuilder.control(false, { nonNullable: true });
    this.assertion = formBuilder.control(null);
    this.form = formBuilder.group({
      language: this.language,
      value: this.value,
      hasAssertion: this.hasAssertion,
      assertion: this.assertion,
    });

    effect(() => {
      this.updateForm(this.title());
    });
  }

  private updateForm(model: AssertedTitle | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.language.setValue(model.language);
    this.value.setValue(model.value);
    this.hasAssertion.setValue(model.value ? true : false);
    this.assertion.setValue(model.assertion || null);
    this.form.markAsPristine();
  }

  private getTitle(): AssertedTitle {
    return {
      language: this.language.value?.trim() || '',
      value: this.value.value?.trim() || '',
      assertion: this.hasAssertion.value
        ? this.assertion.value || undefined
        : undefined,
    };
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    this.assertion.setValue(assertion || null);
    this.assertion.markAsDirty();
    this.assertion.updateValueAndValidity();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.title.set(this.getTitle());
  }
}
