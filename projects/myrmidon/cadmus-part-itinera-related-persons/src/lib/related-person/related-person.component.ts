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
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { RelatedPerson } from '../related-persons-part';

@Component({
  selector: 'cadmus-related-person',
  templateUrl: './related-person.component.html',
  styleUrls: ['./related-person.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    AssertedCompositeIdsComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class RelatedPersonComponent {
  public readonly person = model<RelatedPerson>();

  // related-person-types
  public readonly prsTypeEntries = input<ThesaurusEntry[]>();
  // asserted-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // asserted-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  // settings
  // by-type: true/false
  public readonly pinByTypeMode = input<boolean>();
  // switch-mode: true/false
  public readonly canSwitchMode = input<boolean>();
  // edit-target: true/false
  public readonly canEditTarget = input<boolean>();

  public readonly editorClose = output();

  public type: FormControl<string | null>;
  public name: FormControl<string | null>;
  public ids: FormControl<AssertedCompositeId[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ids = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      type: this.type,
      name: this.name,
      ids: this.ids,
    });

    effect(() => {
      this.updateForm(this.person());
    });
  }

  private updateForm(model: RelatedPerson | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.type.setValue(model.type);
    this.name.setValue(model.name);
    this.ids.setValue(model.ids || []);
    this.form.markAsPristine();
  }

  private getPerson(): RelatedPerson {
    return {
      type: this.type.value?.trim() || '',
      name: this.name.value?.trim() || '',
      ids: this.ids.value?.length ? this.ids.value : undefined,
    };
  }

  public onIdsChange(ids: AssertedCompositeId[]): void {
    this.ids.setValue(ids);
    this.ids.updateValueAndValidity();
    this.ids.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.person.set(this.getPerson());
  }
}
