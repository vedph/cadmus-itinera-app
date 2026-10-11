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
import {
  FormField,
  form,
  maxLength,
  required,
  validate,
} from '@angular/forms/signals';

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
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import { ReferencedText } from '../referenced-texts-part';

interface ReferencedTextControls {
  type: string;
  targetId: AssertedCompositeId | null;
  targetCitation: string;
  sourceCitations: string;
}

function toDraft(text?: ReferencedText): ReferencedTextControls {
  return {
    type: text?.type || '',
    targetId: copyFormValue(text?.targetId) || null,
    targetCitation: text?.targetCitation || '',
    sourceCitations: text?.sourceCitations?.length
      ? text.sourceCitations.join('\n')
      : '',
  };
}

@Component({
  selector: 'cadmus-referenced-text',
  templateUrl: './referenced-text.component.html',
  styleUrls: ['./referenced-text.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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

  private readonly _draft = linkedSignal(() => toDraft(this.text()));
  public readonly form = form(this._draft, (p) => {
    required(p.type);
    maxLength(p.type, 50);
    // the ID must have a target. A new text comes with a placeholder ID
    // having an empty target, which is not null and thus would satisfy
    // the required rule.
    validate(p.targetId, ({ value }) =>
      value()?.target?.gid ? null : { kind: 'required' },
    );
    maxLength(p.targetCitation, 50);
    maxLength(p.sourceCitations, 1000);
  });

  constructor() {
    // a new text was bound: no unsaved edits (keyed on the bound model:
    // the draft also changes with each user edit)
    effect(() => {
      this.text();
      untracked(() => this.form().reset());
    });
  }

  private parseCitations(text: string): string[] | undefined {
    if (!text) {
      return undefined;
    }
    const citations = [
      ...new Set(
        text
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s),
      ),
    ];
    return citations.length ? citations : undefined;
  }

  private getText(): ReferencedText {
    const draft = this._draft();
    return {
      type: draft.type.trim(),
      targetId: copyFormValue(draft.targetId)!,
      targetCitation: draft.targetCitation.trim() || undefined,
      sourceCitations: this.parseCitations(draft.sourceCitations),
    };
  }

  public onIdChange(id: AssertedCompositeId): void {
    setFieldFromChild(this.form.targetId, copyFormValue(id) || null);
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
    this.text.set(this.getText());
  }
}
