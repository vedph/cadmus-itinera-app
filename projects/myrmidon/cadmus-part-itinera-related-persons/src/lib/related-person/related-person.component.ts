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
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
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

interface RelatedPersonControls {
  type: string;
  name: string;
  ids: AssertedCompositeId[];
}

function toDraft(person?: RelatedPerson): RelatedPersonControls {
  return {
    type: person?.type || '',
    name: person?.name || '',
    ids: copyFormValue(person?.ids || []),
  };
}

@Component({
  selector: 'cadmus-related-person',
  templateUrl: './related-person.component.html',
  styleUrls: ['./related-person.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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

  public readonly editorClose = output();

  private readonly _draft = linkedSignal(() => toDraft(this.person()));
  public readonly form = form(this._draft, (p) => {
    required(p.type);
    maxLength(p.type, 50);
    required(p.name);
    maxLength(p.name, 50);
  });

  constructor() {
    // a new person was bound: no unsaved edits (keyed on the bound model:
    // the draft also changes with each user edit)
    effect(() => {
      this.person();
      untracked(() => this.form().reset());
    });
  }

  private getPerson(): RelatedPerson {
    const draft = this._draft();
    return {
      type: draft.type.trim(),
      name: draft.name.trim(),
      ids: draft.ids.length ? copyFormValue(draft.ids) : undefined,
    };
  }

  public onIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.ids, copyFormValue(ids || []));
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
    this.person.set(this.getPerson());
  }
}
