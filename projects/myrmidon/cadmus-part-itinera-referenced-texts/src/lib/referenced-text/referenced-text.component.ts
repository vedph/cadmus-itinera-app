import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MatFormField,
  MatLabel,
  MatError,
  MatHint,
} from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import { ReferencedText } from '../referenced-texts-part';

@Component({
  selector: 'cadmus-referenced-text',
  templateUrl: './referenced-text.component.html',
  styleUrls: ['./referenced-text.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    AssertedCompositeIdComponent,
    MatHint,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class ReferencedTextComponent {
  public readonly text = model<ReferencedText>();

  // related-text-types
  public readonly txtTypeEntries = input<ThesaurusEntry[]>();
  // asserted-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();
  // asserted-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  public type: FormControl<string | null>;
  public targetId: FormControl<AssertedCompositeId | null>;
  public targetCitation: FormControl<string | null>;
  public sourceCitations: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.targetId = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.targetCitation = formBuilder.control(null, Validators.maxLength(50));
    this.sourceCitations = formBuilder.control(
      null,
      Validators.maxLength(1000)
    );
    this.form = formBuilder.group({
      type: this.type,
      targetId: this.targetId,
      targetCitation: this.targetCitation,
      sourceCitations: this.sourceCitations,
    });

    effect(() => {
      this.updateForm(this.text());
    });
  }

  private updateForm(model: ReferencedText | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.type.setValue(model.type);
    this.targetId.setValue(model.targetId);
    this.targetCitation.setValue(model.targetCitation || null);
    this.sourceCitations.setValue(
      model.sourceCitations?.length ? model.sourceCitations.join('\n') : ''
    );
    this.form.markAsPristine();
  }

  private parseCitations(text: string | null): string[] | undefined {
    if (!text) {
      return undefined;
    }
    const citations = [
      ...new Set(
        text
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s)
      ),
    ];
    return citations.length ? citations : undefined;
  }

  private getText(): ReferencedText {
    return {
      type: this.type.value?.trim() || '',
      targetId: this.targetId.value!,
      targetCitation: this.targetCitation.value?.trim(),
      sourceCitations: this.parseCitations(this.sourceCitations.value),
    };
  }

  public onIdChange(id: AssertedCompositeId): void {
    this.targetId.setValue(id);
    this.targetId.updateValueAndValidity();
    this.targetId.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.text.set(this.getText());
  }
}
