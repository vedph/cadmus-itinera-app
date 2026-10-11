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

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { isImplicitSubmission, setFieldFromChild } from '@myrmidon/cadmus-ui';
import { Assertion, AssertionComponent } from '@myrmidon/cadmus-refs-assertion';

import { PersonWork } from '../person-works-part';

interface PersonWorkControls {
  eid: string;
  title: string;
  hasAssertion: boolean;
  assertion: Assertion | null;
}

function toDraft(work?: PersonWork): PersonWorkControls {
  return {
    eid: work?.eid || '',
    title: work?.title || '',
    hasAssertion: !!work?.assertion,
    assertion: work?.assertion || null,
  };
}

@Component({
  selector: 'cadmus-person-work',
  templateUrl: './person-work.component.html',
  styleUrls: ['./person-work.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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

  private readonly _draft = linkedSignal(() => toDraft(this.work()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    required(p.title);
    maxLength(p.title, 100);
  });

  constructor() {
    // a new work was bound: no unsaved edits (keyed on the bound model:
    // the draft also changes with each user edit)
    effect(() => {
      this.work();
      untracked(() => this.form().reset());
    });
  }

  private getWork(): PersonWork {
    const draft = this._draft();
    return {
      eid: draft.eid.trim() || undefined,
      title: draft.title.trim(),
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
    this.work.set(this.getWork());
  }
}
