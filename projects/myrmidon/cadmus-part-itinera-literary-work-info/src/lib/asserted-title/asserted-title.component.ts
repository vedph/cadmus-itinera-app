import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { isImplicitSubmission, setFieldFromChild } from '@myrmidon/cadmus-ui';
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

interface AssertedTitleControls {
  language: string;
  value: string;
  hasAssertion: boolean;
  assertion: Assertion | null;
}

function toDraft(title?: AssertedTitle): AssertedTitleControls {
  return {
    language: title?.language || '',
    value: title?.value || '',
    hasAssertion: !!title?.assertion,
    assertion: title?.assertion || null,
  };
}

@Component({
  selector: 'cadmus-asserted-title',
  templateUrl: './asserted-title.component.html',
  styleUrls: ['./asserted-title.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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

  private readonly _draft = linkedSignal(() => toDraft(this.title()));
  public readonly form = form(this._draft, (p) => {
    required(p.language);
    maxLength(p.language, 50);
    required(p.value);
    maxLength(p.value, 100);
  });

  constructor() {
    // a new title was bound: no unsaved edits (keyed on the bound model:
    // the draft also changes with each user edit)
    effect(() => {
      this.title();
      untracked(() => this.form().reset());
    });
  }

  private getTitle(): AssertedTitle {
    const draft = this._draft();
    return {
      language: draft.language.trim(),
      value: draft.value.trim(),
      assertion: draft.hasAssertion ? draft.assertion || undefined : undefined,
    };
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    setFieldFromChild(this.form.assertion, assertion || null);
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  /**
   * Handle Enter in this editor: in a text input, save as the save button
   * would, when enabled. This replaces the implicit submission of the form
   * this editor used to render.
   * @param event The keydown event.
   */
  public onEnterKey(event: Event): void {
    if (
      !isImplicitSubmission(event) ||
      this.form().invalid() ||
      !this.form().dirty()
    ) {
      return;
    }
    event.preventDefault();
    this.save();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.title.set(this.getTitle());
  }
}
